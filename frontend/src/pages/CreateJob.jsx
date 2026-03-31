import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'

export default function CreateJob() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', company: '', location: '', description: '',
    requirements: '', skills_required: '', salary_range: '', job_type: 'Full-time'
  })

  useEffect(() => {
    if (isEdit) {
      api.get(`/jobs/${id}`).then(res => {
        const j = res.data
        setForm({ title: j.title, company: j.company, location: j.location, description: j.description, requirements: j.requirements, skills_required: j.skills_required, salary_range: j.salary_range, job_type: j.job_type })
      }).catch(() => toast.error('Failed to load job'))
    } else {
      setForm(f => ({ ...f, company: user?.company || '' }))
    }
  }, [id, isEdit, user])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description) { toast.error('Title and description are required'); return }
    setLoading(true)
    try {
      if (isEdit) {
        await api.put(`/jobs/${id}`, form)
        toast.success('Job updated!')
      } else {
        const res = await api.post('/jobs/', form)
        toast.success('Job posted!')
        navigate(`/jobs/${res.data.id}`)
        return
      }
      navigate(`/jobs/${id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally { setLoading(false) }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1 style={{ marginBottom: 24, fontSize: 26 }}>{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 20, fontSize: 16 }}>Basic Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input type="text" className="form-input" placeholder="e.g. Senior React Developer" required value={form.title} onChange={set('title')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input type="text" className="form-input" placeholder="Company name" required value={form.company} onChange={set('company')} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-input" placeholder="e.g. San Francisco, CA or Remote" value={form.location} onChange={set('location')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select className="form-select" value={form.job_type} onChange={set('job_type')}>
                    {['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Salary Range</label>
                <input type="text" className="form-input" placeholder="e.g. $80,000 - $120,000/yr" value={form.salary_range} onChange={set('salary_range')} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 20, fontSize: 16 }}>Job Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Job Description *</label>
                <textarea className="form-textarea" placeholder="Describe the role, responsibilities, and what makes it exciting..." style={{ minHeight: 160 }} required value={form.description} onChange={set('description')} />
              </div>
              <div className="form-group">
                <label className="form-label">Requirements</label>
                <textarea className="form-textarea" placeholder="List key requirements (education, experience, certifications...)" style={{ minHeight: 100 }} value={form.requirements} onChange={set('requirements')} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 8, fontSize: 16 }}>Skills Required</h3>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 16 }}>These skills are used by the AI matching algorithm. Separate with commas.</p>
            <div className="form-group">
              <label className="form-label">Skills (comma-separated)</label>
              <input type="text" className="form-input" placeholder="e.g. React, Python, Node.js, SQL, Docker" value={form.skills_required} onChange={set('skills_required')} />
            </div>
            {form.skills_required && (
              <div className="flex" style={{ flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                {form.skills_required.split(',').filter(Boolean).map(s => (
                  <span key={s} className="skill-tag">{s.trim()}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex-center gap-12">
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ gap: 8 }}>
              {loading ? <span className="spinner spinner-sm" /> : <><Save size={16} />{isEdit ? 'Save Changes' : 'Post Job'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
