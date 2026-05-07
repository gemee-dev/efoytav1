'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Hotel = { id:string;slug:string;name:string;city:string;emoji:string;stars:string;plan:string;subscriptionStatus:string;subscriptionEnds:string|null;roomCount:number;bookingCount:number }
type Stats = { totalHotels:number;activeHotels:number;trialHotels:number;expiredHotels:number;totalBookings:number;totalRevenue:number;totalRooms:number }

const CITIES = ['Jimma','Addis Ababa','Hawassa','Bahir Dar','Dire Dawa']
const PLANS = ['Starter','Professional','Enterprise']

function Toast({ msg, onClose }: { msg:string; onClose:()=>void }) {
  return <div className="toast show" onClick={onClose}>{msg}</div>
}

export default function SuperAdminClient({ hotels: initialHotels, stats: initialStats }: { hotels: Hotel[]; stats: Stats }) {
  const router = useRouter()
  const [hotels, setHotels] = useState(initialHotels)
  const [stats, setStats] = useState(initialStats)
  const [toast, setToast] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name:'', city:'Jimma', adminEmail:'', adminName:'', plan:'Starter' })

  const notify = (msg: string) => setToast(msg)

  async function refreshData() {
    const [h, s] = await Promise.all([
      fetch('/api/superadmin/hotels').then(r=>r.json()),
      fetch('/api/superadmin/stats').then(r=>r.json()),
    ])
    setHotels(h); setStats(s)
  }

  async function renewSub(id: string) {
    const ends = new Date(Date.now() + 30*86400000).toISOString().split('T')[0]
    const r = await fetch(`/api/superadmin/hotels/${id}/subscription`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ status:'active', ends })
    })
    if (r.ok) { await refreshData(); notify('Subscription renewed for 30 days') }
  }

  async function activateSub(id: string) {
    const ends = new Date(Date.now() + 30*86400000).toISOString().split('T')[0]
    const r = await fetch(`/api/superadmin/hotels/${id}/subscription`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ status:'active', ends })
    })
    if (r.ok) { await refreshData(); notify('Subscription activated!') }
  }

  async function createHotel(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const r = await fetch('/api/superadmin/hotels', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:form.name, city:form.city, adminEmail:form.adminEmail, adminName:form.adminName, plan:form.plan })
      })
      const data = await r.json()
      if (!r.ok) { notify(data.error); return }
      setShowCreateModal(false)
      setForm({ name:'', city:'Jimma', adminEmail:'', adminName:'', plan:'Starter' })
      await refreshData()
      notify(`✓ Hotel "${form.name}" created! Temp password: ${data.tempPassword}`)
    } finally { setCreating(false) }
  }

  async function logout() {
    await fetch('/api/auth/me', { method:'DELETE' })
    router.push('/')
  }

  return (
    <>
      <div className="sa-wrap">
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <div className="sec-eye">Platform Administration</div>
            <h1 style={{fontFamily:'var(--ff)',fontSize:'2rem',fontWeight:300}}>Platform Overview</h1>
          </div>
          <div style={{display:'flex',gap:9}}>
            <button className="btn btn-ink" onClick={() => setShowCreateModal(true)}>+ Create Hotel</button>
            <button className="btn btn-out btn-sm" onClick={logout}>Sign Out</button>
          </div>
        </div>

        {/* Stats */}
        <div className="srow">
          <div className="scard"><div className="scard-v">{stats.totalHotels}</div><div className="scard-l">Hotels</div><div className="scard-d d-n">{stats.activeHotels} active</div></div>
          <div className="scard"><div className="scard-v">{stats.totalBookings}</div><div className="scard-l">Total Bookings</div><div className="scard-d d-up">all time</div></div>
          <div className="scard"><div className="scard-v">{stats.activeHotels}</div><div className="scard-l">Active Subs</div><div className="scard-d d-n">{stats.trialHotels} trial · {stats.expiredHotels} expired</div></div>
          <div className="scard"><div className="scard-v">{(stats.totalRevenue/1000).toFixed(1)}k</div><div className="scard-l">ETB Revenue</div><div className="scard-d d-up">confirmed bookings</div></div>
          <div className="scard"><div className="scard-v">{stats.totalRooms}</div><div className="scard-l">Total Rooms</div><div className="scard-d d-n">all hotels</div></div>
        </div>

        {/* Hotels grid */}
        <h2 style={{fontFamily:'var(--ff)',fontSize:'1.4rem',fontWeight:300,marginBottom:0}}>All Hotels</h2>
        <div className="sa-hgrid">
          {hotels.map(h => (
            <div key={h.id} className="sahc">
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'0.6rem'}}>
                <div>
                  <div className="sahc-name">{h.emoji} {h.name}</div>
                  <div className="sahc-meta">📍 {h.city} · /hotel/{h.slug}</div>
                </div>
                <span className={`sub-st ${h.subscriptionStatus==='active'?'ss-a':h.subscriptionStatus==='expired'?'ss-e':'ss-t'}`}>
                  {h.subscriptionStatus==='active'?'● Active':h.subscriptionStatus==='expired'?'● Expired':'◌ Trial'}
                </span>
              </div>
              <div className="sahc-stats">
                <div className="sa-s"><div className="sa-sn">{h.roomCount}</div><div className="sa-sl">Rooms</div></div>
                <div className="sa-s"><div className="sa-sn">{h.bookingCount}</div><div className="sa-sl">Bookings</div></div>
                <div className="sa-s"><div className="sa-sn">{h.plan.substring(0,4)}</div><div className="sa-sl">Plan</div></div>
              </div>
              <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:6}}>
                <span style={{fontSize:'10.5px',color:'var(--ink3)'}}>{h.plan} · Ends: {h.subscriptionEnds || '—'}</span>
                <div style={{marginLeft:'auto',display:'flex',gap:5}}>
                  <Link href={`/hotel/${h.slug}`} className="btn btn-out btn-sm">View Site</Link>
                  {h.subscriptionStatus === 'expired' && (
                    <button className="cbtn" onClick={() => renewSub(h.id)}>Renew</button>
                  )}
                  {h.subscriptionStatus === 'trial' && (
                    <button className="btn btn-gold btn-sm" onClick={() => activateSub(h.id)}>Activate</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE HOTEL MODAL */}
      {showCreateModal && (
        <div className="mbg on" onClick={e => { if(e.target===e.currentTarget) setShowCreateModal(false) }}>
          <div className="modal">
            <div className="modal-h">Create Hotel <button className="mclose" onClick={()=>setShowCreateModal(false)}>✕</button></div>
            <form onSubmit={createHotel}>
              <div className="fr"><label className="fl">Hotel Name</label><input className="fi" placeholder="e.g. Hawassa Lakeside Hotel" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required /></div>
              <div className="fr"><label className="fl">City</label>
                <select className="fi" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))}>
                  {CITIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="fr"><label className="fl">Admin Email</label><input className="fi" type="email" placeholder="admin@hotel.et" value={form.adminEmail} onChange={e=>setForm(p=>({...p,adminEmail:e.target.value}))} required /></div>
              <div className="fr"><label className="fl">Admin Name</label><input className="fi" placeholder="Hotel Manager Name" value={form.adminName} onChange={e=>setForm(p=>({...p,adminName:e.target.value}))} /></div>
              <div className="fr"><label className="fl">Plan</label>
                <select className="fi" value={form.plan} onChange={e=>setForm(p=>({...p,plan:e.target.value}))}>
                  {PLANS.map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <button className="btn btn-ink" type="submit" disabled={creating} style={{width:'100%',justifyContent:'center',padding:'11px'}}>
                {creating ? <><span className="spin" style={{width:14,height:14}}></span> Creating…</> : 'Create Hotel & Send Invite'}
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={()=>setToast('')} />}
    </>
  )
}
