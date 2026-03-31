import { Link } from 'react-router-dom'
import { MapPin, Clock, DollarSign, Users, Briefcase } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function JobCard({ job, applied = false, showApplicants = false }) {
  const skills = job.skills_required?.split(',').filter(Boolean).slice(0, 4) || []

  return (
    <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(108,99,255,0.15)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.transform = ''
          e.currentTarget.style.boxShadow = ''
        }}
      >
        <div className="flex-between" style={{ marginBottom: 12 }}>
          <div className="flex-center gap-12">
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'var(--accent-soft)',
              border: '1px solid rgba(108,99,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Briefcase size={20} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>
                {job.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{job.company}</div>
            </div>
          </div>
          <div className="flex-col gap-4" style={{ alignItems: 'flex-end' }}>
            <span className={`badge ${job.job_type === 'Remote' ? 'badge-green' : job.job_type === 'Part-time' ? 'badge-yellow' : 'badge-accent'}`}>
              {job.job_type}
            </span>
            {applied && <span className="badge badge-green">Applied</span>}
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 14,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {job.description}
        </p>

        {skills.length > 0 && (
          <div className="flex" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {skills.map(s => (
              <span key={s} className="skill-tag">{s.trim()}</span>
            ))}
            {(job.skills_required?.split(',').length || 0) > 4 && (
              <span className="skill-tag" style={{ background: 'transparent', border: '1px solid var(--border)' }}>
                +{job.skills_required.split(',').length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="flex-center gap-16" style={{ fontSize: 12, color: 'var(--text-3)' }}>
          {job.location && <span className="flex-center gap-4"><MapPin size={12} />{job.location}</span>}
          {job.salary_range && <span className="flex-center gap-4"><DollarSign size={12} />{job.salary_range}</span>}
          {showApplicants && <span className="flex-center gap-4"><Users size={12} />{job.applications_count} applicants</span>}
          <span className="flex-center gap-4" style={{ marginLeft: 'auto' }}>
            <Clock size={12} />{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  )
}
