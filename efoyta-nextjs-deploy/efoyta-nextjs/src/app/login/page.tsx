'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      if (data.user.role === 'super_admin') router.push('/superadmin')
      else router.push('/admin')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-nav">
        <div className="login-wrap">
          <div className="login-card">
            <div className="login-logo">e<span>foyta</span></div>
            <div className="login-sub">Sign in to your hotel dashboard</div>
            {error && <div className="login-err">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="fr">
                <label className="fl">Email</label>
                <input className="fi" type="email" placeholder="you@hotel.et"
                  value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <div className="fr">
                <label className="fl">Password</label>
                <input className="fi" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="btn btn-ink" type="submit" disabled={loading}
                style={{width:'100%',justifyContent:'center',padding:'11px',marginTop:'0.5rem'}}>
                {loading ? <><span className="spin" style={{width:14,height:14}}></span> Signing in…</> : 'Sign In'}
              </button>
            </form>
            <div className="login-hint">
              <strong>Hotel Admin:</strong> hotel@efoyta.com / hotel123<br />
              <strong>Super Admin:</strong> admin@efoyta.com / admin123
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
