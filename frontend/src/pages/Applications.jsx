import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import ScoreRing from '../components/ScoreRing'
import AvatarImg from '../components/AvatarImg'
import { formatDistanceToNow } from 'date-fns'
import { FileText, ExternalLink, Brain, CheckCircle, XCircle, Eye, Star, TrendingUp, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending:  'badge-yellow',
  reviewed: 'badge-accent',
  accepted: 'badge-green',
  rejected: 'badge-red'
}

// ── Score label helper ──────────────────────────────────────
function getScoreInfo(score) {
  if (score >= 75) return { label: 'Very High Chance',  color: '#43e97b', icon: Star,         bg: 'rgba(67,233,123,0.08)',  border: 'rgba(67,233,123,0.3)' }
  if (score >= 55) return { label: 'Good Chance',       color: '#6c63ff', icon: TrendingUp,   bg: 'rgba(108,99,255,0.08)', border: 'rgba(108,99,255,0.3)' }
  if (score >= 35) return { label: 'Moderate Chance',   color: '#ffd166', icon: AlertTriangle, bg: 'rgba(255,209,102,0.08)',border: 'rgba(255,209,102,0.3)'}
  return             { label: 'Low Chance',             color: '#ff6584', icon: AlertTriangle, bg: 'rgba(255,101,132,0.08)',border: 'rgba(255,101,132,0.3)'}
}

// ── Seeker application card ─────────────────────────────────
function SeekerAppCard({ app, onView }) {
  const info = getScoreInfo(app.ml_score)
  const Icon = info.icon

  return (
    <div className="card fade-in" style={{ border: `1px solid ${info.border}`, background: info.bg }}>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, marginBottom: 4 }}>
            {app.job?.title}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{app.job?.company}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
          </div>
        </div>
        <span className={`badge ${STATUS_COLORS[app.status] || 'badge-gray'}`} style={{ fontSize: 13 }}>
          {app.status}
        </span>
      </div>

      {/* BIG score display */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
        padding: 20, display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16
      }}>
        <ScoreRing score={app.ml_score} size={100} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            AI Selection Probability
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 36, color: info.color, lineHeight: 1 }}>
            {app.ml_score}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: info.color, fontWeight: 700, fontSize: 14 }}>
            <Icon size={15} /> {info.label}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            Probability that HR selects you for this role
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div className="progress-bar" style={{ height: 10 }}>
          <div className="progress-fill" style={{
            width: `${app.ml_score}%`,
            background: `linear-gradient(90deg, ${info.color}99, ${info.color})`,
            boxShadow: `0 0 8px ${info.color}60`
          }} />
        </div>
        <div className="flex-between" style={{ marginTop: 6, fontSize: 12, color: 'var(--text-3)' }}>
          <span>0% — No match</span>
          <span>100% — Perfect match</span>
        </div>
      </div>

      {/* Tip based on score */}
      <div style={{
        padding: '10px 14px', borderRadius: 8,
        background: 'var(--bg-elevated)',
        fontSize: 13, color: 'var(--text-2)', marginBottom: 16
      }}>
        💡 {app.ml_score >= 75
          ? 'Great match! HR is likely to shortlist you. Keep your profile updated.'
          : app.ml_score >= 55
          ? 'Good match! Add more relevant skills to your profile to improve your chances.'
          : app.ml_score >= 35
          ? 'Moderate match. Consider learning the missing skills to boost your score.'
          : 'Low match. Explore jobs that better match your current skills.'}
      </div>

      <div className="flex-center gap-8">
        <button
          className="btn btn-ghost btn-sm"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => onView(app.job_id)}
        >
          <ExternalLink size={13} /> View Job
        </button>
      </div>
    </div>
  )
}

// ── HR Applicant card ───────────────────────────────────────
function HRAppCard({ app, selected, onClick }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderColor: selected ? 'var(--accent)' : 'var(--border)',
        transition: 'all 0.2s'
      }}
    >
      <div className="flex-between">
        <div className="flex-center gap-12">
          <AvatarImg src={app.applicant?.profile_pic} name={app.applicant?.full_name} size={48} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
              {app.applicant?.full_name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{app.applicant?.email}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
              Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
            </div>
          </div>
        </div>
        <div className="flex-col gap-8" style={{ alignItems: 'flex-end' }}>
          <span className={`badge ${STATUS_COLORS[app.status] || 'badge-gray'}`}>{app.status}</span>
          {app.ml_score > 0 && (
            <div style={{
              fontSize: 15, fontWeight: 800,
              color: app.ml_score >= 70 ? '#43e97b' : app.ml_score >= 45 ? '#ffd166' : '#ff6584',
              fontFamily: 'var(--font-display)'
            }}>
              {app.ml_score}% match
            </div>
          )}
        </div>
      </div>
      {/* Mini bar */}
      <div className="progress-bar" style={{ marginTop: 12, height: 6 }}>
        <div className="progress-fill" style={{
          width: `${app.ml_score}%`,
          background: app.ml_score >= 70 ? '#43e97b' : app.ml_score >= 45 ? '#ffd166' : '#ff6584'
        }} />
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────
export default function Applications() {
  const { id: jobId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [mlData, setMlData]     = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const isHR = user?.role === 'hr'

  useEffect(() => {
    const fetch = async () => {
      try {
        const url = isHR && jobId ? `/jobs/${jobId}/applications` : '/jobs/my-applications'
        const res = await api.get(url)
        setApps(res.data)
      } catch {} finally { setLoading(false) }
    }
    fetch()
  }, [jobId, isHR])

  const analyzeApplicant = async (app) => {
    setSelected(app); setMlData(null); setAnalyzing(true)
    try {
      const res = await api.post('/ml/analyze-applicant', {
        applicant_id: app.user_id,
        job_id: app.job_id
      })
      setMlData(res.data)
    } catch {} finally { setAnalyzing(false) }
  }

  const updateStatus = async (appId, status) => {
    try {
      await api.put(`/jobs/applications/${appId}/status`, { status })
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
      if (selected?.id === appId) setSelected(s => ({ ...s, status }))
      toast.success(`Status updated to: ${status}`)
    } catch { toast.error('Failed to update') }
  }

  if (loading) return (
    <div className="page">
      <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="spinner" />
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>
          {isHR ? 'Applicants' : 'My Applications'}
        </h1>
        <p style={{ color: 'var(--text-2)', marginBottom: 28 }}>
          {apps.length} application{apps.length !== 1 ? 's' : ''}
          {isHR && ' — sorted by AI match score'}
          {!isHR && ' — showing your AI-predicted selection probability'}
        </p>

        {apps.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} />
            <p style={{ marginTop: 12 }}>No applications yet.</p>
          </div>
        ) : isHR ? (
          /* ── HR VIEW ── */
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 20, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {apps.map(app => (
                <HRAppCard
                  key={app.id}
                  app={app}
                  selected={selected?.id === app.id}
                  onClick={() => analyzeApplicant(app)}
                />
              ))}
            </div>

            {/* HR Analysis panel */}
            {selected && (
              <div className="card" style={{ position: 'sticky', top: 80 }}>
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16 }}>Candidate Analysis</h3>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}
                    onClick={() => { setSelected(null); setMlData(null) }}>✕</button>
                </div>

                <div className="flex-center gap-12" style={{ marginBottom: 16 }}>
                  <AvatarImg src={selected.applicant?.profile_pic} name={selected.applicant?.full_name} size={52} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{selected.applicant?.full_name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{selected.applicant?.email}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{selected.applicant?.location}</div>
                  </div>
                </div>

                {analyzing ? (
                  <div style={{ textAlign: 'center', padding: 32 }}>
                    <div className="spinner" />
                    <p style={{ marginTop: 12, color: 'var(--text-3)', fontSize: 13 }}>Analyzing with AI...</p>
                  </div>
                ) : mlData ? (
                  <>
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <ScoreRing score={mlData.score} size={120} />
                      <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-2)' }}>
                        Selection Probability
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: 14, marginTop: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                        Skill Breakdown
                      </div>
                      {mlData.breakdown?.matched_skills?.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 12, color: '#43e97b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={12} /> {mlData.breakdown.matched_skills.length} Skills Matched
                          </div>
                          <div className="flex" style={{ flexWrap: 'wrap', gap: 4 }}>
                            {mlData.breakdown.matched_skills.map(s => (
                              <span key={s} className="skill-tag skill-tag-match" style={{ fontSize: 11 }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {mlData.breakdown?.missing_skills?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 12, color: '#ff6584', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <XCircle size={12} /> {mlData.breakdown.missing_skills.length} Skills Missing
                          </div>
                          <div className="flex" style={{ flexWrap: 'wrap', gap: 4 }}>
                            {mlData.breakdown.missing_skills.map(s => (
                              <span key={s} className="skill-tag skill-tag-miss" style={{ fontSize: 11 }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="divider" />
                    <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>Update Application Status</div>
                    <div className="flex-center gap-8" style={{ flexWrap: 'wrap' }}>
                      {['reviewed', 'accepted', 'rejected'].map(s => (
                        <button key={s} onClick={() => updateStatus(selected.id, s)}
                          className={`btn btn-sm ${s === 'accepted' ? 'btn-secondary' : s === 'rejected' ? 'btn-danger' : 'btn-ghost'}`}
                          style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }}>
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="flex-center gap-8" style={{ marginTop: 12 }}>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => navigate(`/profile/${selected.user_id}`)}>
                        <Eye size={13} /> Full Profile
                      </button>
                      {selected.applicant?.resume_path && (
                        <a href={`/uploads/${selected.applicant.resume_path}`} target="_blank" rel="noreferrer"
                          className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                          <FileText size={13} /> Resume
                        </a>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          /* ── SEEKER VIEW ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {apps.map(app => (
              <SeekerAppCard
                key={app.id}
                app={app}
                onView={(jobId) => navigate(`/jobs/${jobId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
