import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Building2, MapPin } from 'lucide-react'

export default function Register() {
  const [params] = useSearchParams()
  const [role, setRole] = useState(params.get('role') || 'seeker')
  const [form, setForm] = useState({ full_name: '', email: '', password: '', company: '', location: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register({ ...form, role })
      toast.success('Account created!')
      navigate('/home')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(108,99,255,0.1) 0%, transparent 70%)'
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: 'var(--accent)' }}>TalentBridge</div>
          </Link>
          <h2 style={{ marginTop: 12, fontSize: 22 }}>Create your account</h2>
        </div>

        {/* Role toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4, marginBottom: 24, gap: 4 }}>
          {[{ v: 'seeker', label: '🔍 Job Seeker' }, { v: 'hr', label: '🏢 HR / Recruiter' }].map(({ v, label }) => (
            <button key={v} type="button" onClick={() => setRole(v)}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, transition: 'all 0.15s',
                background: role === v ? 'var(--accent)' : 'transparent',
                color: role === v ? '#fff' : 'var(--text-2)',
                boxShadow: role === v ? '0 0 16px var(--accent-glow)' : 'none'
              }}>
              {label}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type="text" className="form-input" placeholder="Your full name" required style={{ paddingLeft: 36 }}
                  value={form.full_name} onChange={set('full_name')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type="email" className="form-input" placeholder="you@example.com" required style={{ paddingLeft: 36 }}
                  value={form.email} onChange={set('email')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type="password" className="form-input" placeholder="Min. 6 characters" required style={{ paddingLeft: 36 }}
                  value={form.password} onChange={set('password')} />
              </div>
            </div>

            {role === 'hr' && (
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input type="text" className="form-input" placeholder="Your company" style={{ paddingLeft: 36 }}
                    value={form.company} onChange={set('company')} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type="text" className="form-input" placeholder="City, Country" style={{ paddingLeft: 36 }}
                  value={form.location} onChange={set('location')} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? <span className="spinner spinner-sm" /> : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-2)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
