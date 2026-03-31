import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import AvatarImg from '../components/AvatarImg'
import PostCard from '../components/PostCard'
import ScoreRing from '../components/ScoreRing'
import { MapPin, Building2, FileText, ArrowLeft, Brain, CheckCircle, XCircle } from 'lucide-react'

export default function SeekerProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [mlData, setMlData] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [profRes, postsRes] = await Promise.all([
          api.get(`/profile/${id}`),
          api.get(`/posts/user/${id}`)
        ])
        setProfile(profRes.data)
        setPosts(postsRes.data)
        if (user?.role === 'hr') {
          const jobsRes = await api.get('/jobs/my-jobs')
          setJobs(jobsRes.data)
        }
      } catch {} finally { setLoading(false) }
    }
    fetch()
  }, [id, user])

  const analyze = async () => {
    if (!selectedJob) return
    setAnalyzing(true); setMlData(null)
    try {
      const res = await api.post('/ml/analyze-applicant', { applicant_id: parseInt(id), job_id: selectedJob })
      setMlData(res.data)
    } catch {} finally { setAnalyzing(false) }
  }

  if (loading) return <div className="page"><div className="container" style={{ textAlign: 'center', paddingTop: 80 }}><div className="spinner" /></div></div>
  if (!profile) return <div className="page"><div className="container"><p>Profile not found.</p></div></div>

  const skills = profile.skills?.split(',').filter(Boolean) || []

  return (
    <div className="page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back
        </button>

        <div className="sidebar-layout">
          {/* Left sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Profile card */}
            <div className="card" style={{ textAlign: 'center', padding: 28 }}>
              <AvatarImg src={profile.profile_pic} name={profile.full_name} size={88} style={{ margin: '0 auto 16px' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{profile.full_name}</div>
              <div style={{ fontSize: 12, color: profile.role === 'hr' ? 'var(--accent-warn)' : 'var(--accent)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                {profile.role === 'hr' ? 'HR / Recruiter' : 'Job Seeker'}
              </div>
              {profile.bio && <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 12 }}>{profile.bio}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', fontSize: 13, color: 'var(--text-3)' }}>
                {profile.location && <span className="flex-center gap-6"><MapPin size={13} />{profile.location}</span>}
                {profile.company && <span className="flex-center gap-6"><Building2 size={13} />{profile.company}</span>}
              </div>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: 15, marginBottom: 14 }}>Skills</h3>
                <div className="flex" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {skills.map(s => <span key={s} className="skill-tag">{s.trim()}</span>)}
                </div>
              </div>
            )}

            {/* Resume */}
            {profile.resume_path && (
              <div className="card">
                <h3 style={{ fontSize: 15, marginBottom: 14 }}>Resume</h3>
                <a href={`/uploads/${profile.resume_path}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  <FileText size={15} /> View Resume
                </a>
              </div>
            )}

            {/* HR ML Analysis Tool */}
            {user?.role === 'hr' && jobs.length > 0 && (
              <div className="card" style={{ border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(108,99,255,0.04)' }}>
                <div className="flex-center gap-8" style={{ marginBottom: 14 }}>
                  <Brain size={18} color="var(--accent)" />
                  <h3 style={{ fontSize: 15, color: 'var(--accent)' }}>AI Match Analysis</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>
                  Select one of your job postings to see how well this candidate matches.
                </p>
                <select className="form-select" style={{ marginBottom: 12 }} value={selectedJob || ''} onChange={e => { setSelectedJob(parseInt(e.target.value)); setMlData(null) }}>
                  <option value="">Select a job posting...</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={analyze} disabled={!selectedJob || analyzing}>
                  {analyzing ? <><span className="spinner spinner-sm" /> Analyzing...</> : <><Brain size={14} /> Analyze Candidate</>}
                </button>

                {mlData && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <ScoreRing score={mlData.score} size={110} />
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Skill Breakdown</div>

                      {mlData.breakdown?.matched_skills?.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 12, color: 'var(--accent-3)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={12} /> {mlData.breakdown.matched_skills.length} matched
                          </div>
                          <div className="flex" style={{ flexWrap: 'wrap', gap: 4 }}>
                            {mlData.breakdown.matched_skills.map(s => <span key={s} className="skill-tag skill-tag-match" style={{ fontSize: 11 }}>{s}</span>)}
                          </div>
                        </div>
                      )}

                      {mlData.breakdown?.missing_skills?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 12, color: 'var(--accent-2)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <XCircle size={12} /> {mlData.breakdown.missing_skills.length} missing
                          </div>
                          <div className="flex" style={{ flexWrap: 'wrap', gap: 4 }}>
                            {mlData.breakdown.missing_skills.map(s => <span key={s} className="skill-tag skill-tag-miss" style={{ fontSize: 11 }}>{s}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Posts */}
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Posts by {profile.full_name?.split(' ')[0]}</h2>
            {posts.length === 0 ? (
              <div className="empty-state"><p style={{ color: 'var(--text-3)' }}>No posts yet.</p></div>
            ) : (
              posts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
