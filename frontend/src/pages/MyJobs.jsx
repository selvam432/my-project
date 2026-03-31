import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import JobCard from '../components/JobCard'
import { PlusCircle, Briefcase } from 'lucide-react'

export default function MyJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/jobs/my-jobs').then(r => setJobs(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between" style={{ marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>My Job Postings</h1>
            <p style={{ color: 'var(--text-2)' }}>{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/jobs/create')}>
            <PlusCircle size={16} /> Post New Job
          </button>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> :
          jobs.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={40} />
              <p style={{ marginTop: 12, marginBottom: 20 }}>You haven't posted any jobs yet.</p>
              <button className="btn btn-primary" onClick={() => navigate('/jobs/create')}>Post Your First Job</button>
            </div>
          ) : (
            <div className="grid-2">
              {jobs.map(job => (
                <div key={job.id} style={{ position: 'relative' }}>
                  <JobCard job={job} showApplicants />
                  <button
                    onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                    className="btn btn-secondary btn-sm"
                    style={{ position: 'absolute', bottom: 16, right: 16 }}
                  >
                    View Applicants
                  </button>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
