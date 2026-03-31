import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import AvatarImg from '../components/AvatarImg'
import PostCard from '../components/PostCard'
import { useEffect } from 'react'
import { Camera, Upload, Save, MapPin, Building2, FileText, Edit3, X, Plus } from 'lucide-react'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', bio: '', skills: '', company: '', location: '' })
  const [posts, setPosts] = useState([])
  const [saving, setSaving] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const picRef = useRef()
  const resumeRef = useRef()

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || '', bio: user.bio || '', skills: user.skills || '', company: user.company || '', location: user.location || '' })
      api.get(`/posts/user/${user.id}`).then(r => setPosts(r.data)).catch(() => {})
    }
  }, [user])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/profile/update', form)
      await refreshUser()
      setEditing(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  const handlePicUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    const fd = new FormData(); fd.append('file', file)
    setUploadingPic(true)
    try {
      await api.post('/profile/upload-pic', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      await refreshUser()
      toast.success('Profile picture updated!')
    } catch { toast.error('Upload failed') } finally { setUploadingPic(false) }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    const fd = new FormData(); fd.append('file', file)
    setUploadingResume(true)
    try {
      await api.post('/profile/upload-resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      await refreshUser()
      toast.success('Resume uploaded!')
    } catch (err) { toast.error(err.response?.data?.error || 'Upload failed') } finally { setUploadingResume(false) }
  }

  const handleDeletePost = (postId) => setPosts(prev => prev.filter(p => p.id !== postId))

  const skills = user?.skills?.split(',').filter(Boolean) || []

  return (
    <div className="page">
      <div className="container">
        <div className="sidebar-layout">
          {/* Left: Profile card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Avatar + basic info */}
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <AvatarImg src={user?.profile_pic} name={user?.full_name} size={100} />
                <button
                  onClick={() => picRef.current.click()}
                  disabled={uploadingPic}
                  style={{
                    position: 'absolute', bottom: 0, right: 0, width: 30, height: 30,
                    borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    boxShadow: '0 0 12px var(--accent-glow)'
                  }}
                >
                  {uploadingPic ? <span className="spinner spinner-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Camera size={14} color="#fff" />}
                </button>
                <input ref={picRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePicUpload} />
              </div>

              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input type="text" className="form-input" placeholder="Full Name" value={form.full_name} onChange={set('full_name')} style={{ textAlign: 'center' }} />
                  <textarea className="form-textarea" placeholder="Write your bio..." style={{ minHeight: 80, fontSize: 13 }} value={form.bio} onChange={set('bio')} />
                  {user?.role === 'hr' && (
                    <input type="text" className="form-input" placeholder="Company" value={form.company} onChange={set('company')} />
                  )}
                  <input type="text" className="form-input" placeholder="Location" value={form.location} onChange={set('location')} />
                  <div className="flex-center gap-8">
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditing(false)}><X size={14} /> Cancel</button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                      {saving ? <span className="spinner spinner-sm" /> : <><Save size={14} /> Save</>}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{user?.full_name}</div>
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-display)', color: user?.role === 'hr' ? 'var(--accent-warn)' : 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    {user?.role === 'hr' ? '🏢 HR / Recruiter' : '🔍 Job Seeker'}
                  </div>
                  {user?.bio && <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 12 }}>{user.bio}</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
                    {user?.location && <span className="flex-center gap-6"><MapPin size={13} />{user.location}</span>}
                    {user?.company && <span className="flex-center gap-6"><Building2 size={13} />{user.company}</span>}
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setEditing(true)}>
                    <Edit3 size={14} /> Edit Profile
                  </button>
                </>
              )}
            </div>

            {/* Skills */}
            {user?.role === 'seeker' && (
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15 }}>Skills</h3>
                  {!editing && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}><Edit3 size={13} /></button>}
                </div>
                {editing ? (
                  <div className="form-group">
                    <label className="form-label">Comma-separated skills</label>
                    <input type="text" className="form-input" placeholder="React, Python, SQL..." value={form.skills} onChange={set('skills')} />
                  </div>
                ) : skills.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No skills added yet. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setEditing(true)}>Add skills</span></p>
                ) : (
                  <div className="flex" style={{ flexWrap: 'wrap', gap: 6 }}>
                    {skills.map(s => <span key={s} className="skill-tag">{s.trim()}</span>)}
                  </div>
                )}
              </div>
            )}

            {/* Resume */}
            {user?.role === 'seeker' && (
              <div className="card">
                <h3 style={{ fontSize: 15, marginBottom: 14 }}>Resume</h3>
                {user?.resume_path ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileText size={20} color="var(--accent)" />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>Resume uploaded</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>PDF / Word document</div>
                      </div>
                    </div>
                    <div className="flex-center gap-8">
                      <a href={`/uploads/${user.resume_path}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                        <FileText size={13} /> View
                      </a>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => resumeRef.current.click()} disabled={uploadingResume}>
                        <Upload size={13} /> Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>Upload your resume to improve your match score with jobs.</p>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => resumeRef.current.click()} disabled={uploadingResume}>
                      {uploadingResume ? <span className="spinner spinner-sm" /> : <><Upload size={14} /> Upload Resume</>}
                    </button>
                  </div>
                )}
                <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
              </div>
            )}
          </div>

          {/* Right: Posts */}
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>My Posts</h2>
            {posts.length === 0 ? (
              <div className="empty-state">
                <p>You haven't posted anything yet.</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => window.location.href = '/feed'}>
                  <Plus size={14} /> Create a post
                </button>
              </div>
            ) : (
              posts.map(post => <PostCard key={post.id} post={post} onDelete={handleDeletePost} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
