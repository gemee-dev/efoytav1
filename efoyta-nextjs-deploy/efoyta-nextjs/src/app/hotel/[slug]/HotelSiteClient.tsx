'use client'
import { useState } from 'react'

type Hotel = { id:string;slug:string;name:string;city:string;tagline:string;about:string;phone:string;email:string;address:string;emoji:string;stars:string }
type Room = { id:string;name:string;type:string;capacity:number;price:number;available:boolean;description:string }
type MenuItem = { id:string;name:string;category:string;description:string;price:number }

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="toast show" style={{cursor:'pointer'}} onClick={onClose}>{msg}</div>
  )
}

export default function HotelSiteClient({ hotel, rooms, menuItems }: { hotel: Hotel; rooms: Room[]; menuItems: MenuItem[] }) {
  const [tab, setTab] = useState<'home'|'about'|'rooms'|'menu'|'contact'>('home')
  const [menuCat, setMenuCat] = useState(() => [...new Set(menuItems.map(m => m.category))][0] || '')
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null)
  const [toast, setToast] = useState('')
  const [bkForm, setBkForm] = useState({ name:'', email:'', phone:'', checkIn:'', checkOut:'' })
  const [bkLoading, setBkLoading] = useState(false)
  const [bkTotal, setBkTotal] = useState<{nights:number;total:number}|null>(null)

  const cats = [...new Set(menuItems.map(m => m.category))]
  const filteredMenu = menuItems.filter(m => m.category === menuCat)

  function calcTotal(ci: string, co: string, price: number) {
    if (!ci || !co) return null
    const nights = Math.max(1, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000))
    return { nights, total: nights * price }
  }

  function openBooking(room: Room) {
    const today = new Date().toISOString().split('T')[0]
    const next = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
    setBkForm({ name:'', email:'', phone:'', checkIn: today, checkOut: next })
    setBkTotal(calcTotal(today, next, room.price))
    setBookingRoom(room)
  }

  function onDateChange(field: 'checkIn'|'checkOut', value: string) {
    const updated = { ...bkForm, [field]: value }
    setBkForm(updated)
    if (bookingRoom) setBkTotal(calcTotal(updated.checkIn, updated.checkOut, bookingRoom.price))
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!bookingRoom) return
    setBkLoading(true)
    try {
      const res = await fetch(`/api/hotel/${hotel.slug}/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: bookingRoom.id, guestName: bkForm.name, guestEmail: bkForm.email, guestPhone: bkForm.phone, checkIn: bkForm.checkIn, checkOut: bkForm.checkOut }),
      })
      const data = await res.json()
      if (!res.ok) { setToast(data.error || 'Booking failed'); return }
      setBookingRoom(null)
      setToast(`✓ Booking submitted! ${data.nights} night${data.nights>1?'s':''} · ${data.total.toLocaleString()} ETB total. Hotel confirms within 24 hrs.`)
    } catch { setToast('Network error, please try again.') }
    finally { setBkLoading(false) }
  }

  const navLinks: Array<{key: typeof tab; label: string}> = [
    {key:'home',label:'Home'},{key:'about',label:'About'},{key:'rooms',label:'Rooms'},{key:'menu',label:'Menu'},{key:'contact',label:'Contact'}
  ]

  return (
    <>
      {/* Sub nav */}
      <nav className="hs-subnav">
        <div className="hs-subnav-name">{hotel.name}</div>
        <div className="hs-links">
          {navLinks.map(l => (
            <span key={l.key} className={`hs-link ${tab===l.key?'on':''}`} onClick={() => setTab(l.key)}>{l.label}</span>
          ))}
        </div>
      </nav>

      {/* HOME */}
      {tab === 'home' && (
        <>
          <div className="hs-hero">
            <div className="hs-hero-bg">{hotel.emoji}</div>
            <h1>{hotel.name}</h1>
            <p>{hotel.tagline}</p>
            <div className="hcta">
              <button className="btn btn-ink" onClick={() => setTab('rooms')}>View Rooms</button>
              <button className="btn btn-out" onClick={() => setTab('contact')}>Contact</button>
            </div>
          </div>
          <div className="hs-inner">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2.5rem',alignItems:'start'}}>
              <div>
                <div className="sec-eye">About</div>
                <h2 style={{fontFamily:'var(--ff)',fontSize:'1.75rem',fontWeight:300,marginBottom:'0.7rem'}}>Experience {hotel.city}</h2>
                <p style={{fontSize:'0.9rem',color:'var(--ink3)',lineHeight:1.8,fontWeight:300}}>{hotel.about.substring(0,200)}…</p>
                <button className="btn btn-out" style={{marginTop:'1rem'}} onClick={() => setTab('about')}>Our Story →</button>
              </div>
              <div>
                <div className="sec-eye">Featured Rooms</div>
                {rooms.slice(0,2).map(r => (
                  <div key={r.id} style={{border:'1px solid var(--paper3)',borderRadius:'var(--r)',padding:'0.85rem',marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:'0.875rem',fontWeight:500}}>{r.name}</div>
                      <div style={{fontSize:'11.5px',color:'var(--ink3)'}}>{r.type} · {r.capacity} guest{r.capacity>1?'s':''}</div>
                    </div>
                    <div style={{fontFamily:'var(--ff)',fontSize:'1.1rem'}}>{r.price.toLocaleString()} <span style={{fontSize:11,fontFamily:'var(--fs)',color:'var(--ink3)'}}>ETB</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ABOUT */}
      {tab === 'about' && (
        <div className="hs-inner">
          <div className="sec-eye">Our Story</div>
          <h2 style={{fontFamily:'var(--ff)',fontSize:'2.5rem',fontWeight:300,lineHeight:1.15,marginBottom:'1.5rem'}}>A Place of <em style={{color:'var(--gold)'}}>Warmth</em><br />& Heritage</h2>
          <p style={{fontSize:'1rem',color:'var(--ink2)',lineHeight:1.95,maxWidth:700,fontWeight:300}}>{hotel.about}</p>
        </div>
      )}

      {/* ROOMS */}
      {tab === 'rooms' && (
        <div className="hs-inner">
          <div className="sec-eye">Accommodation</div>
          <h2>Our Rooms</h2>
          <p className="hs-sub">{rooms.filter(r=>r.available).length} rooms available · Select a room to book your stay</p>
          <div className="rgrid">
            {rooms.map(r => (
              <div key={r.id} className="rcard">
                <div className="rcard-img">{r.type==='Suite'?'🛋️':r.type==='Family'?'👨‍👩‍👧':'🛏️'}</div>
                <div className="rcard-body">
                  <div className="rcard-name">{r.name}</div>
                  <div className="rcard-meta">
                    <span>👤 {r.capacity}</span>
                    <span>{r.type}</span>
                    <span className={`bdg ${r.available?'bdg-g':'bdg-r'}`}>{r.available?'Available':'Occupied'}</span>
                  </div>
                  <div className="rcard-price">{r.price.toLocaleString()} ETB <span>/ night</span></div>
                  <p style={{fontSize:'11.5px',color:'var(--ink3)',marginBottom:'0.75rem',lineHeight:1.5}}>{r.description}</p>
                  <button className="btn btn-ink" style={{width:'100%',justifyContent:'center'}} disabled={!r.available} onClick={() => openBooking(r)}>
                    {r.available ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MENU */}
      {tab === 'menu' && (
        <div className="hs-inner">
          <div className="sec-eye">Dining</div>
          <h2>Restaurant &amp; Bar</h2>
          <p className="hs-sub">Fresh, seasonal, locally sourced.</p>
          <div className="mcats">
            {cats.map(c => (
              <div key={c} className={`mcat ${c===menuCat?'on':''}`} onClick={() => setMenuCat(c)}>{c}</div>
            ))}
          </div>
          <div className="mitems">
            {filteredMenu.map(item => (
              <div key={item.id} className="mitem">
                <div>
                  <div className="mitem-n">{item.name}</div>
                  <div className="mitem-d">{item.description}</div>
                </div>
                <div className="mitem-p">{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTACT */}
      {tab === 'contact' && (
        <div className="hs-inner">
          <div className="sec-eye">Get in Touch</div>
          <h2>Contact Us</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2rem',marginTop:'2rem'}}>
            <div>
              {[['Phone',hotel.phone],['Email',hotel.email],['Address',hotel.address]].map(([label,val]) => (
                <div key={label} style={{marginBottom:'1.4rem'}}>
                  <div style={{fontSize:'10.5px',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--ink3)',marginBottom:'0.3rem',fontWeight:500}}>{label}</div>
                  <div>{val || '—'}</div>
                </div>
              ))}
            </div>
            <div style={{background:'var(--paper2)',borderRadius:'var(--r2)',height:200,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid var(--paper3)'}}>
              <div style={{textAlign:'center',color:'var(--ink3)',fontSize:13}}>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📍</div>
                <div>{hotel.city}, Ethiopia</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingRoom && (
        <div className="mbg on" onClick={e => { if (e.target === e.currentTarget) setBookingRoom(null) }}>
          <div className="modal">
            <div className="modal-h">
              Book a Room
              <button className="mclose" onClick={() => setBookingRoom(null)}>✕</button>
            </div>
            <div style={{fontSize:'12.5px',color:'var(--ink3)',marginBottom:'1.4rem'}}>
              {bookingRoom.name} — {bookingRoom.price.toLocaleString()} ETB / night
            </div>
            <form onSubmit={submitBooking}>
              <div className="fr"><label className="fl">Your Name</label>
                <input className="fi" placeholder="Full name" value={bkForm.name} onChange={e => setBkForm(p=>({...p,name:e.target.value}))} required /></div>
              <div className="fr"><label className="fl">Email</label>
                <input className="fi" type="email" placeholder="your@email.com" value={bkForm.email} onChange={e => setBkForm(p=>({...p,email:e.target.value}))} required /></div>
              <div className="fr"><label className="fl">Phone</label>
                <input className="fi" placeholder="+251…" value={bkForm.phone} onChange={e => setBkForm(p=>({...p,phone:e.target.value}))} /></div>
              <div className="fr2 fr">
                <div><label className="fl">Check-In</label>
                  <input className="fi" type="date" value={bkForm.checkIn} onChange={e => onDateChange('checkIn', e.target.value)} required /></div>
                <div><label className="fl">Check-Out</label>
                  <input className="fi" type="date" value={bkForm.checkOut} onChange={e => onDateChange('checkOut', e.target.value)} required /></div>
              </div>
              {bkTotal && (
                <div style={{background:'var(--paper2)',borderRadius:'var(--r)',padding:'9px 13px',fontSize:'12.5px',marginBottom:'1rem'}}>
                  {bkTotal.nights} night{bkTotal.nights>1?'s':''} × {bookingRoom.price.toLocaleString()} ETB = <strong>{bkTotal.total.toLocaleString()} ETB</strong>
                </div>
              )}
              <button className="btn btn-ink" type="submit" disabled={bkLoading} style={{width:'100%',justifyContent:'center',padding:'11px'}}>
                {bkLoading ? <><span className="spin" style={{width:14,height:14}}></span> Submitting…</> : 'Submit Booking Request'}
              </button>
              <div style={{fontSize:'10.5px',color:'var(--ink4)',textAlign:'center',marginTop:'0.65rem'}}>Hotel confirms within 24 hours</div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </>
  )
}
