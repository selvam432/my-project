import { useNavigate } from 'react-router-dom'
import { Briefcase, User, Zap, Shield, TrendingUp, Brain } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Background mesh */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(108,99,255,0.15) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(255,101,132,0.08) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{ padding: '24px 48px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18,
            boxShadow: '0 0 24px var(--accent-glow)'
          }}>T</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text-1)' }}>
            TalentBridge
          </span>
        </header>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '80px 24px 60px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999,
            background: 'var(--accent-soft)', border: '1px solid rgba(108,99,255,0.3)',
            marginBottom: 32, fontSize: 13, color: 'var(--accent)',
            fontFamily: 'var(--font-display)', fontWeight: 600
          }}>
            <Brain size={14} /> AI-Powered Job Matching
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
            Where Talent Meets
            <br />
            <span style={{ color: 'var(--accent)', textShadow: '0 0 40px var(--accent-glow)' }}>
              Opportunity
            </span>
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 520, margin: '0 auto 60px', lineHeight: 1.7 }}>
            A smarter job portal combining social networking with machine learning to predict your perfect match.
          </p>

          {/* Role selection cards */}
          <div style={{
            display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80
          }}>
            <RoleCard
              icon={User}
              title="Job Seeker"
              description="Build your profile, share your journey, apply to jobs and see your AI match score."
              color="var(--accent)"
              onClick={() => navigate('/register?role=seeker')}
            />
            <RoleCard
              icon={Briefcase}
              title="HR / Recruiter"
              description="Post jobs, discover talent, and use AI-powered analysis to find your best candidates."
              color="var(--accent-warn)"
              onClick={() => navigate('/register?role=hr')}
            />
          </div>

          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
            Already have an account?{' '}
            <span
              style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => navigate('/login')}
            >
              Sign in
            </span>
          </p>
        </div>

        {/* Features */}
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 100px' }}>
          <div className="grid-3" style={{ gap: 20 }}>
            {[
              { icon: Brain, color: 'var(--accent)', title: 'ML Job Matching', desc: 'TF-IDF cosine similarity and skill gap analysis gives precise match scores.' },
              { icon: Zap, color: 'var(--accent-warn)', title: 'Smart Feed', desc: 'Social feed where seekers share updates and recruiters discover talent.' },
              { icon: TrendingUp, color: 'var(--accent-3)', title: 'Skill Analysis', desc: 'See exactly which skills match and which are missing for any job posting.' },
              { icon: Shield, color: 'var(--accent-2)', title: 'Secure Auth', desc: 'JWT-based authentication keeps your data safe.' },
              { icon: Briefcase, color: 'var(--accent)', title: 'Rich Profiles', desc: 'Upload resume, profile picture, skills, and bio. Share your full story.' },
              { icon: User, color: 'var(--accent-warn)', title: 'Dual Roles', desc: 'Separate experiences tailored for job seekers and HR professionals.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card" style={{ padding: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12
                }}>
                  <Icon size={20} color={color} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleCard({ icon: Icon, title, description, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card"
      style={{
        width: 300, cursor: 'pointer', textAlign: 'left', padding: 28,
        transition: 'all 0.2s ease', border: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 16px 40px ${color}20`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 120, height: 120,
        background: `radial-gradient(circle at top right, ${color}15 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
      }}>
        <Icon size={26} color={color} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 10, color }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>{description}</p>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13
      }}>
        Get Started →
      </div>
    </div>
  )
}
