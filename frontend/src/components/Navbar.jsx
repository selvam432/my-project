import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Briefcase, Users, User, LogOut, PlusCircle, FileText, Rss } from 'lucide-react'
import AvatarImg from './AvatarImg'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const seekerLinks = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/feed', icon: Rss, label: 'Feed' },
    { to: '/applications', icon: FileText, label: 'My Applications' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  const hrLinks = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/my-jobs', icon: Briefcase, label: 'My Jobs' },
    { to: '/feed', icon: Rss, label: 'Feed' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  const links = user?.role === 'hr' ? hrLinks : seekerLinks

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container flex-between" style={{ height: 64 }}>
        {/* Logo */}
        <Link to="/home" style={{ textDecoration: 'none' }}>
          <div className="flex-center gap-8">
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)',
              boxShadow: '0 0 16px var(--accent-glow)'
            }}>T</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text-1)' }}>
              JobPortal
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex-center gap-4" style={{ flex: 1, justifyContent: 'center' }}>
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                textDecoration: 'none',
                color: isActive(to) ? 'var(--accent)' : 'var(--text-2)',
                background: isActive(to) ? 'var(--accent-soft)' : 'transparent',
                transition: 'all var(--transition)',
              }}
            >
              <Icon size={16} />
              <span className="nav-label">{label}</span>
            </Link>
          ))}
          {user?.role === 'hr' && (
            <Link to="/jobs/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', marginLeft: 8 }}>
              <PlusCircle size={14} /> Post Job
            </Link>
          )}
        </div>

        {/* User menu */}
        <div className="flex-center gap-12">
          <div className="flex-center gap-8">
            <AvatarImg src={user?.profile_pic} name={user?.full_name} size={34} />
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>
                {user?.full_name?.split(' ')[0]}
              </div>
              <div style={{ fontSize: 11, color: user?.role === 'hr' ? 'var(--accent-warn)' : 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                {user?.role === 'hr' ? 'Recruiter' : 'Job Seeker'}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-label { display: none; }
        }
      `}</style>
    </nav>
  )
}
