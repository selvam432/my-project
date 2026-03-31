import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import JobCard from '../components/JobCard'
import { TrendingUp, Briefcase, FileText, Users, ArrowRight } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [myApps, setMyApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobsRes = await api.get('/jobs/')
        setJobs(jobsRes.data.slice(0, 6))
        if (user?.role === 'seeker') {
          const appsRes = await api.get('/jobs/my-applications')
          setMyApps(appsRes.data)
        }
      } catch {} finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  const appliedJobIds = new Set(myApps.map(a => a.job_id))

  if (loading) return <div className="page"><div className="container" style={{ textAlign: 'center', paddingTop: 80 }}><div className="spinner" /></div></div>

  return (
    <div className="page">
      <div className="container">
        {/* Hero greeting */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(255,101,132,0.08) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '32px 36px', marginBottom: 32,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, marginBottom: 6 }}>
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </div>
          <div style={{ color: 'var(--text-2)', fontSize: 15 }}>
            {user?.role === 'seeker'
              ? `You've applied to ${myApps.length} job${myApps.length !== 1 ? 's' : ''}. Keep exploring!`
              : `You have ${jobs.length} active job listings on the platform.`}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid-3" style={{ marginBottom: 32, gap: 16 }}>
          {user?.role === 'seeker' ? (
            <>
              <StatCard icon={Briefcase} label="Open Jobs" value={jobs.length} color="var(--accent)" onClick={() => navigate('/jobs')} />
              <StatCard icon={FileText} label="Applied" value={myApps.length} color="var(--accent-3)" onClick={() => navigate('/applications')} />
              <StatCard icon={TrendingUp} label="Profile Views" value="—" color="var(--accent-warn)" onClick={() => navigate('/profile')} />
            </>
          ) : (
            <>
              <StatCard icon={Briefcase} label="Active Jobs" value={jobs.length} color="var(--accent)" onClick={() => navigate('/my-jobs')} />
              <StatCard icon={Users} label="Total Applications" value={jobs.reduce((a, j) => a + (j.applications_count || 0), 0)} color="var(--accent-3)" />
              <StatCard icon={TrendingUp} label="Avg. Applicants" value={jobs.length ? Math.round(jobs.reduce((a, j) => a + (j.applications_count || 0), 0) / jobs.length) : 0} color="var(--accent-warn)" />
            </>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20 }}>
            {user?.role === 'seeker' ? 'Latest Opportunities' : 'Recent Postings'}
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(user?.role === 'hr' ? '/my-jobs' : '/jobs')} style={{ gap: 4 }}>
            View all <ArrowRight size={14} />
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={40} />
            <p style={{ marginTop: 12 }}>No job postings yet.</p>
          </div>
        ) : (
          <div className="grid-2">
            {jobs.map(job => <JobCard key={job.id} job={job} applied={appliedJobIds.has(job.id)} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <div className="card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s' }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)' }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}>
      <div className="flex-between">
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color }}>{value}</div>
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
    </div>
  )
}
