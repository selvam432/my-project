import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { MapPin, DollarSign, Clock, Briefcase, Users, CheckCircle, ArrowLeft, Edit, Trash2, Brain, TrendingUp, AlertTriangle, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import ScoreRing from '../components/ScoreRing'

// ── Seeker: shows probability of being selected by HR ──────
function SelectionChanceCard({ score, breakdown, applied }) {

  const getLevel = (s) => {
    if (s >= 75) return { label: 'Very High Chance',  color: '#43e97b', bg: 'rgba(67,233,123,0.08)',  border: 'rgba(67,233,123,0.3)',  icon: Star,          msg: 'Excellent match! HR is very likely to select you.' }
    if (s >= 55) return { label: 'Good Chance',       color: '#6c63ff', bg: 'rgba(108,99,255,0.08)', border: 'rgba(108,99,255,0.3)', icon: TrendingUp,    msg: 'You match most requirements. Apply with confidence!' }
    if (s >= 35) return { label: 'Moderate Chance',   color: '#ffd166', bg: 'rgba(255,209,102,0.08)',border: 'rgba(255,209,102,0.3)',icon: AlertTriangle,  msg: 'Some skills match. Consider adding missing skills.' }
    return         { label: 'Low Chance',             color: '#ff6584', bg: 'rgba(255,101,132,0.08)',border: 'rgba(255,101,132,0.3)',icon: AlertTriangle,  msg: 'Few skills match. Improve your profile before applying.' }
  }

  const level = getLevel(score)
  const Icon  = level.icon

  return (
    <div style={{
      background: level.bg, border: `1px solid ${level.border}`,
      borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 16
    }}>
      {/* Header */}
      <div className="flex-center gap-8" style={{ marginBottom: 20 }}>
        <Brain size={18} color={level.color} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: level.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          AI Selection Probability
        </span>
      </div>

      {/* Score Ring */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <ScoreRing score={score} size={130} />
      </div>

      {/* Level badge */}
      <div style={{
        textAlign: 'center', padding: '10px 16px',
        background: level.bg, border: `1px solid ${level.border}`,
        borderRadius: 'var(--radius-sm)', marginBottom: 16
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: level.color }}>
          <Icon size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          {level.label}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>{level.msg}</div>
      </div>

      {/* Skill breakdown */}
      {breakdown && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Matched skills */}
          {breakdown.matched_skills?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: '#43e97b', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={12} /> {breakdown.matched_skills.length} Skills You Have
              </div>
              <div className="flex" style={{ flexWrap: 'wrap', gap: 4 }}>
                {breakdown.matched_skills.map(s => (
                  <span key={s} className="skill-tag skill-tag-match" style={{ fontSize: 11 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {breakdown.missing_skills?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: '#ff6584', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={12} /> {breakdown.missing_skills.length} Skills to Learn
              </div>
              <div className="flex" style={{ flexWrap: 'wrap', gap: 4 }}>
                {breakdown.missing_skills.map(s => (
                  <span key={s} className="skill-tag skill-tag-miss" style={{ fontSize: 11 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {applied && (
        <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(67,233,123,0.1)', borderRadius: 8, textAlign: 'center', fontSize: 13, color: '#43e97b', fontWeight: 600 }}>
          <CheckCircle size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          You have applied for this job
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
        Score based on your skills & resume vs job requirements
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────
export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob]               = useState(null)
  const [applied, setApplied]       = useState(false)
  const [matchScore, setMatchScore] = useState(null)
  const [breakdown, setBreakdown]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [applyModal, setApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying]     = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/jobs/${id}`)
        setJob(res.data)

        if (user?.role === 'seeker') {
          // Check if already applied
          const appsRes = await api.get('/jobs/my-applications')
          const found = appsRes.data.find(a => a.job_id === parseInt(id))
          if (found) {
            setApplied(true)
            setMatchScore(found.ml_score)
          }
          // Always compute live ML score + breakdown
          try {
            const mlRes = await api.post('/ml/match', { job_id: parseInt(id) })
            setMatchScore(mlRes.data.score)
            setBreakdown(mlRes.data.breakdown)
          } catch {}
        }
      } catch {
        toast.error('Failed to load job')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, user])

  const handleApply = async () => {
    setApplying(true)
    try {
      const res = await api.post(`/jobs/${id}/apply`, { cover_letter: coverLetter })
      setApplied(true)
      setMatchScore(res.data.ml_score)
      setApplyModal(false)
      toast.success(`Applied! Your selection chance: ${res.data.ml_score}%`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this job posting?')) return
    try {
      await api.delete(`/jobs/${id}`)
      toast.success('Job deleted')
      navigate('/my-jobs')
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) return (
    <div className="page">
      <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="spinner" />
        <p style={{ marginTop: 16, color: 'var(--text-3)' }}>Calculating your match score...</p>
      </div>
    </div>
  )

  if (!job) return (
    <div className="page">
      <div className="container"><p>Job not found.</p></div>
    </div>
  )

  const skills = job.skills_required?.split(',').filter(Boolean) || []

  return (
    <div className="page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back
        </button>

        <div className="sidebar-layout" style={{ gridTemplateColumns: '1fr 340px' }}>

          {/* ── Left: Job details ── */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="flex-between" style={{ marginBottom: 20 }}>
                <div className="flex-center gap-16">
                  <div style={{
                    width: 60, height: 60, borderRadius: 14,
                    background: 'var(--accent-soft)', border: '1px solid rgba(108,99,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Briefcase size={28} color="var(--accent)" />
                  </div>
                  <div>
                    <h1 style={{ fontSize: 22, marginBottom: 4 }}>{job.title}</h1>
                    <div style={{ color: 'var(--text-2)', fontSize: 15 }}>{job.company}</div>
                  </div>
                </div>
                {user?.role === 'hr' && user.id === job.hr_id && (
                  <div className="flex-center gap-8">
                    <button onClick={() => navigate(`/jobs/edit/${id}`)} className="btn btn-ghost btn-sm">
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={handleDelete} className="btn btn-danger btn-sm">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-center gap-16" style={{ flexWrap: 'wrap', marginBottom: 20, fontSize: 14, color: 'var(--text-2)' }}>
                {job.location    && <span className="flex-center gap-6"><MapPin size={15} />{job.location}</span>}
                {job.salary_range && <span className="flex-center gap-6"><DollarSign size={15} />{job.salary_range}</span>}
                <span className="flex-center gap-6"><Clock size={15} />{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                <span className="flex-center gap-6"><Users size={15} />{job.applications_count} applicants</span>
                <span className={`badge ${job.job_type === 'Remote' ? 'badge-green' : 'badge-accent'}`}>{job.job_type}</span>
              </div>

              <div className="divider" />

              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Job Description</h3>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.description}</p>

              {job.requirements && (
                <>
                  <h3 style={{ fontSize: 16, margin: '20px 0 12px' }}>Requirements</h3>
                  <p style={{ color: 'var(--text-2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
                </>
              )}

              {skills.length > 0 && (
                <>
                  <h3 style={{ fontSize: 16, margin: '20px 0 12px' }}>Required Skills</h3>
                  <div className="flex" style={{ flexWrap: 'wrap', gap: 8 }}>
                    {skills.map(s => <span key={s} className="skill-tag">{s.trim()}</span>)}
                  </div>
                </>
              )}
            </div>

            {user?.role === 'hr' && (
              <button className="btn btn-secondary" onClick={() => navigate(`/jobs/${id}/applicants`)}>
                <Users size={16} /> View All Applicants ({job.applications_count})
              </button>
            )}
          </div>

          {/* ── Right: Sidebar ── */}
          <div>
            {/* SEEKER: Selection probability card */}
            {user?.role === 'seeker' && matchScore !== null && (
              <SelectionChanceCard
                score={matchScore}
                breakdown={breakdown}
                applied={applied}
              />
            )}

            {/* Quick info */}
            <div className="card">
              <h3 style={{ fontSize: 15, marginBottom: 16 }}>Quick Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Job Type', value: job.job_type },
                  { label: 'Location', value: job.location || 'Not specified' },
                  { label: 'Salary', value: job.salary_range || 'Not specified' },
                  { label: 'Company', value: job.company },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-1)', marginTop: 3 }}>{value}</div>
                  </div>
                ))}
              </div>

              {user?.role === 'seeker' && (
                <div style={{ marginTop: 20 }}>
                  {applied ? (
                    <div style={{
                      width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      color: '#43e97b', fontFamily: 'var(--font-display)', fontWeight: 700
                    }}>
                      <CheckCircle size={16} /> Already Applied
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}
                      onClick={() => setApplyModal(true)}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Apply Modal ── */}
      {applyModal && (
        <div className="modal-overlay" onClick={() => setApplyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 4, fontSize: 20 }}>Apply for {job.title}</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 20 }}>at {job.company}</p>

            {/* Score preview in modal */}
            {matchScore !== null && (
              <div style={{
                background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                padding: 16, marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 20
              }}>
                <ScoreRing score={matchScore} size={90} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                    Your Selection Chance
                  </div>
                  <div style={{
                    fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)',
                    color: matchScore >= 70 ? '#43e97b' : matchScore >= 45 ? '#ffd166' : '#ff6584'
                  }}>
                    {matchScore}%
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                    AI-predicted probability HR selects you
                  </div>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Cover Letter (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Tell the recruiter why you're a great fit..."
                style={{ minHeight: 130 }}
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
              />
            </div>

            <div className="flex-center gap-12">
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setApplyModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleApply} disabled={applying}>
                {applying ? <span className="spinner spinner-sm" /> : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
