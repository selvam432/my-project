import { useEffect, useState } from 'react'
import api from '../utils/api'
import JobCard from '../components/JobCard'
import { Search, Filter, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Jobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [myApps, setMyApps] = useState([])
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          api.get('/jobs/'),
          user?.role === 'seeker' ? api.get('/jobs/my-applications') : Promise.resolve({ data: [] })
        ])
        setJobs(jobsRes.data)
        setFiltered(jobsRes.data)
        setMyApps(appsRes.data)
      } catch {} finally { setLoading(false) }
    }
    fetch()
  }, [user])

  useEffect(() => {
    let f = jobs
    if (search) {
      const q = search.toLowerCase()
      f = f.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.skills_required?.toLowerCase().includes(q))
    }
    if (type !== 'all') f = f.filter(j => j.job_type === type)
    setFiltered(f)
  }, [search, type, jobs])

  const appliedJobIds = new Set(myApps.map(a => a.job_id))

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Browse Jobs</h1>
          <p style={{ color: 'var(--text-2)' }}>{jobs.length} opportunities available</p>
        </div>

        {/* Search + filter */}
        <div className="flex-center gap-12" style={{ marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              type="text" className="form-input" placeholder="Search jobs, skills, companies..."
              style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-center gap-8">
            {['all', 'Full-time', 'Part-time', 'Remote', 'Contract'].map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`btn btn-sm ${type === t ? 'btn-primary' : 'btn-ghost'}`}>
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> :
          filtered.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={40} />
              <p style={{ marginTop: 12 }}>No jobs found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid-2">
              {filtered.map(job => <JobCard key={job.id} job={job} applied={appliedJobIds.has(job.id)} />)}
            </div>
          )
        }
      </div>
    </div>
  )
}
