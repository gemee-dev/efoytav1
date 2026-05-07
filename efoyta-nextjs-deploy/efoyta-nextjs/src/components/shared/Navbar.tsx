'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface NavUser {
  id: string
  name: string
  email: string
  role: string
  hotelId: string | null
}

export default function Navbar() {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<NavUser | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(u => setUser(u))
      .catch(() => {})
  }, [path])

  async function logout() {
    await fetch('/api/auth/me', { method: 'DELETE' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="gnav">
      <Link href="/" className="gnav-logo">e<span>foyta</span></Link>
      <div className="gnav-tabs">
        <Link href="/" className={`gtab ${path === '/' ? 'on' : ''}`}>Platform</Link>
        <Link href="/hotels" className={`gtab ${path.startsWith('/hotels') ? 'on' : ''}`}>Explore</Link>
        <Link href="/hotel/kaffa-grand" className={`gtab ${path.startsWith('/hotel/') ? 'on' : ''}`}>Hotel Site</Link>
        {user?.role === 'hotel_admin' && (
          <Link href="/admin" className={`gtab ${path.startsWith('/admin') ? 'on' : ''}`}>Admin</Link>
        )}
        {user?.role === 'super_admin' && (
          <Link href="/superadmin" className={`gtab ${path.startsWith('/superadmin') ? 'on' : ''}`}>Super Admin</Link>
        )}
      </div>
      <div className="gnav-r">
        {user ? (
          <>
            <span style={{ fontSize: 12, color: 'var(--ink3)' }}>{user.name}</span>
            <button className="btn btn-out btn-sm" onClick={logout}>Sign Out</button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-out btn-sm">Sign In</Link>
            <Link href="/hotels" className="btn btn-ink btn-sm">Explore Hotels</Link>
          </>
        )}
      </div>
    </nav>
  )
}
