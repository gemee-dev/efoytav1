'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Hotel = { id:string;slug:string;name:string;city:string;tagline:string;about:string;phone:string;email:string;address:string;plan:string;subscriptionStatus:string;subscriptionEnds:string|null }
type Room = { id:string;name:string;type:string;capacity:number;price:number;available:boolean;description:string }
type Booking = { id:string;guestName:string;guestEmail:string;checkIn:string;checkOut:string;nights:number;total:number;status:string;room:{name:string} }
type MenuItem = { id:string;name:string;category:string;description:string;price:number }
type Stats = { roomsTotal:number;roomsAvailable:number;bookingsTotal:number;bookingsPending:number;bookingsConfirmed:number;revenue:number;menuItems:number }

const CITIES = ['Jimma','Addis Ababa','Hawassa','Bahir Dar','Dire Dawa']

function Toast({ msg, onClose }: { msg:string; onClose:()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return <div className="toast show" onClick={onClose}>{msg}</div>
}

export default function AdminClient({ initialUser }: { initialUser: any }) {
  const router = useRouter()
  const [panel, setPanel] = useState<'dash'|'rooms'|'bookings'|'menu'|'info'|'sub'>('dash')
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [recentBk, setRecentBk] = useState<Booking[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [bkFilter, setBkFilter] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)

  // Modals
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [roomForm, setRoomForm] = useState({ name:'', type:'Double', capacity:'2', price:'', description:'' })
  const [menuForm, setMenuForm] = useState({ name:'', category:'Main Dishes', price:'', description:'' })

  const notify = (msg: string) => setToast(msg)

  const loadDash = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/dashboard')
      if (!r.ok) { router.push('/login'); return }
      const d = await r.json()
      setHotel(d.hotel); setStats(d.stats); setRecentBk(d.recentBookings)
    } finally { setLoading(false) }
  }, [router])

  useEffect(() => { loadDash() }, [loadDash])

  async function loadRooms() {
    const r = await fetch('/api/admin/rooms')
    setRooms(await r.json())
  }

  async function loadBookings(status='') {
    const url = '/api/admin/bookings' + (status ? `?status=${status}` : '')
    const r = await fetch(url)
    setBookings(await r.json())
  }

  async function loadMenu() {
    const r = await fetch('/api/admin/menu')
    setMenu(await r.json())
  }

  function openPanel(p: typeof panel) {
    setPanel(p)
    if (p === 'rooms') loadRooms()
    if (p === 'bookings') loadBookings(bkFilter)
    if (p === 'menu') loadMenu()
    if (p === 'info' && hotel) {
      // form is populated from hotel state
    }
  }

  // Info form state
  const [infoForm, setInfoForm] = useState({ name:'', tagline:'', about:'', phone:'', email:'', address:'', city:'' })
  useEffect(() => {
    if (hotel) setInfoForm({ name:hotel.name, tagline:hotel.tagline, about:hotel.about, phone:hotel.phone, email:hotel.email, address:hotel.address, city:hotel.city })
  }, [hotel])

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/admin/hotel', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(infoForm) })
    if (r.ok) { const h = await r.json(); setHotel(h); notify('Hotel information saved!') }
  }

  async function addRoom(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/admin/rooms', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name:roomForm.name, type:roomForm.type, capacity:parseInt(roomForm.capacity), price:parseInt(roomForm.price), description:roomForm.description }) })
    if (r.ok) { setShowRoomModal(false); setRoomForm({name:'',type:'Double',capacity:'2',price:'',description:''}); loadRooms(); loadDash(); notify('Room added!') }
  }

  async function toggleRoom(id: string, avail: boolean) {
    await fetch(`/api/admin/rooms/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ available: avail }) })
    loadRooms(); notify(`Room marked as ${avail ? 'Available' : 'Occupied'}`)
  }

  async function deleteRoom(id: string) {
    if (!confirm('Delete this room?')) return
    await fetch(`/api/admin/rooms/${id}`, { method: 'DELETE' })
    loadRooms(); loadDash(); notify('Room deleted')
  }

  async function updateBooking(id: string, status: string) {
    await fetch(`/api/admin/bookings/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) })
    loadBookings(bkFilter); loadDash(); notify(`Booking ${status}`)
  }

  async function addMenuItem(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/admin/menu', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name:menuForm.name, category:menuForm.category, price:parseInt(menuForm.price), description:menuForm.description }) })
    if (r.ok) { setShowMenuModal(false); setMenuForm({name:'',category:'Main Dishes',price:'',description:''}); loadMenu(); loadDash(); notify('Menu item added — live on public site!') }
  }

  async function deleteMenuItem(id: string) {
    await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' })
    loadMenu(); loadDash(); notify('Menu item removed')
  }

  async function logout() {
    await fetch('/api/auth/me', { method: 'DELETE' })
    router.push('/')
  }

  const sideItems = [
    { key:'dash', ico:'◈', label:'Dashboard' },
    { key:'rooms', ico:'⊞', label:'Rooms' },
    { key:'bookings', ico:'◻', label:'Bookings' },
    { key:'menu', ico:'◈', label:'Menu' },
    { key:'info', ico:'⚙', label:'Hotel Info' },
    { key:'sub', ico:'◇', label:'Subscription' },
  ] as const

  if (loading) return (
    <div className="loading" style={{height:'100vh'}}>
      <div className="spin"></div> Loading dashboard…
    </div>
  )

  const subDays = hotel?.subscriptionEnds ? Math.max(0, Math.round((new Date(hotel.subscriptionEnds).getTime() - Date.now()) / 86400000)) : 0

  return (
    <>
      {(hotel?.subscriptionStatus === 'trial' || hotel?.subscriptionStatus === 'expired') && (
        <div className="sub-banner">
          <strong>{hotel.subscriptionStatus === 'expired' ? '⛔ Subscription expired.' : `⚠ Trial ends in ${subDays} days.`}</strong>
          Contact admin@efoyta.com to activate your plan.
        </div>
      )}

      <div className="adm-layout">
        {/* SIDEBAR */}
        <aside className="adm-side">
          <div className="adm-head">
            <h3>{hotel?.name || 'Hotel'}</h3>
            <p>{hotel?.plan} · {hotel?.subscriptionStatus}</p>
          </div>
          <div className="adm-sg">Overview</div>
          {sideItems.slice(0,1).map(i => (
            <div key={i.key} className={`si ${panel===i.key?'on':''}`} onClick={() => openPanel(i.key)}>
              <span className="si-ico">{i.ico}</span>{i.label}
            </div>
          ))}
          <div className="adm-sg">Management</div>
          {sideItems.slice(1,4).map(i => (
            <div key={i.key} className={`si ${panel===i.key?'on':''}`} onClick={() => openPanel(i.key)}>
              <span className="si-ico">{i.ico}</span>{i.label}
            </div>
          ))}
          <div className="adm-sg">Hotel</div>
          {sideItems.slice(4).map(i => (
            <div key={i.key} className={`si ${panel===i.key?'on':''}`} onClick={() => openPanel(i.key)}>
              <span className="si-ico">{i.ico}</span>{i.label}
            </div>
          ))}
          <div className="adm-sg">Account</div>
          {hotel && (
            <Link href={`/hotel/${hotel.slug}`} className="si">
              <span className="si-ico">↗</span>View Public Site
            </Link>
          )}
          <div className="si" onClick={logout}><span className="si-ico">←</span>Sign Out</div>
        </aside>

        {/* MAIN */}
        <main className="adm-main">

          {/* ── DASHBOARD ── */}
          {panel === 'dash' && stats && (
            <>
              <div className="ap-h">Dashboard</div>
              <div className="ap-sub">Welcome back · {hotel?.name}</div>
              <div className="srow">
                <div className="scard"><div className="scard-v">{stats.roomsTotal}</div><div className="scard-l">Rooms</div><div className="scard-d d-n">{stats.roomsAvailable} available</div></div>
                <div className="scard"><div className="scard-v">{stats.bookingsTotal}</div><div className="scard-l">Bookings</div><div className="scard-d d-up">all time</div></div>
                <div className="scard"><div className="scard-v">{stats.bookingsPending}</div><div className="scard-l">Pending</div><div className={`scard-d ${stats.bookingsPending>0?'d-dn':'d-n'}`}>{stats.bookingsPending>0?'Needs action':'All clear'}</div></div>
                <div className="scard"><div className="scard-v">{(stats.revenue/1000).toFixed(1)}k</div><div className="scard-l">Revenue ETB</div><div className="scard-d d-up">confirmed only</div></div>
                <div className="scard"><div className="scard-v">{stats.menuItems}</div><div className="scard-l">Menu Items</div><div className="scard-d d-n">on public site</div></div>
              </div>
              <div className="panel">
                <div className="panel-h">Recent Bookings</div>
                <table className="dt">
                  <thead><tr><th>Guest</th><th>Room</th><th>Dates</th><th>Status</th><th>Total</th></tr></thead>
                  <tbody>
                    {recentBk.map(b => (
                      <tr key={b.id}>
                        <td><strong>{b.guestName}</strong></td>
                        <td>{b.room?.name}</td>
                        <td>{b.checkIn?.slice(0,10)} → {b.checkOut?.slice(0,10)}</td>
                        <td><span className={`bdg ${b.status==='confirmed'?'bdg-g':b.status==='pending'?'bdg-a':'bdg-r'}`}>{b.status}</span></td>
                        <td>{b.total.toLocaleString()} ETB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="panel">
                <div className="panel-h">Quick Actions</div>
                <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
                  <button className="btn btn-ink btn-sm" onClick={() => { openPanel('rooms'); setShowRoomModal(true) }}>+ Add Room</button>
                  <button className="btn btn-out btn-sm" onClick={() => openPanel('bookings')}>All Bookings</button>
                  <button className="btn btn-out btn-sm" onClick={() => openPanel('menu')}>Edit Menu</button>
                  {hotel && <Link href={`/hotel/${hotel.slug}`} className="btn btn-gold btn-sm">Public Site ↗</Link>}
                </div>
              </div>
            </>
          )}

          {/* ── ROOMS ── */}
          {panel === 'rooms' && (
            <>
              <div className="ap-h">Rooms</div>
              <div className="ap-sub">Manage your accommodation</div>
              <div style={{marginBottom:'1.2rem'}}><button className="btn btn-ink btn-sm" onClick={() => setShowRoomModal(true)}>+ Add Room</button></div>
              <div className="panel">
                <table className="dt">
                  <thead><tr><th>Room</th><th>Type</th><th>Cap.</th><th>Price/Night</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {rooms.map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.name}</strong><br /><span style={{fontSize:'10.5px',color:'var(--ink3)'}}>{r.description}</span></td>
                        <td>{r.type}</td><td>{r.capacity}</td>
                        <td>{r.price.toLocaleString()} ETB</td>
                        <td><span className={`bdg ${r.available?'bdg-g':'bdg-r'}`}>{r.available?'Available':'Occupied'}</span></td>
                        <td style={{whiteSpace:'nowrap'}}>
                          <button className="btn btn-out btn-sm" onClick={() => toggleRoom(r.id, !r.available)}>{r.available?'Mark Occupied':'Mark Free'}</button>
                          {' '}<button className="rbtn" onClick={() => deleteRoom(r.id)}>Del</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── BOOKINGS ── */}
          {panel === 'bookings' && (
            <>
              <div className="ap-h">Bookings</div>
              <div className="ap-sub">Manage guest reservations</div>
              <div style={{display:'flex',gap:6,marginBottom:'1.2rem'}}>
                {['','pending','confirmed','rejected'].map(s => (
                  <button key={s} className={`btn btn-sm ${bkFilter===s?'btn-ink':'btn-out'}`}
                    onClick={() => { setBkFilter(s); loadBookings(s) }}>
                    {s||'All'}
                  </button>
                ))}
              </div>
              <div className="panel">
                <table className="dt">
                  <thead><tr><th>Guest</th><th>Room</th><th>Check-In</th><th>Check-Out</th><th>Nights</th><th>Status</th><th>Total</th><th>Actions</th></tr></thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td><strong>{b.guestName}</strong><br /><span style={{fontSize:'10.5px',color:'var(--ink3)'}}>{b.guestEmail}</span></td>
                        <td>{b.room?.name}</td>
                        <td>{b.checkIn?.slice(0,10)}</td>
                        <td>{b.checkOut?.slice(0,10)}</td>
                        <td>{b.nights}</td>
                        <td><span className={`bdg ${b.status==='confirmed'?'bdg-g':b.status==='pending'?'bdg-a':'bdg-r'}`}>{b.status}</span></td>
                        <td style={{whiteSpace:'nowrap'}}>{b.total.toLocaleString()} ETB</td>
                        <td style={{whiteSpace:'nowrap'}}>
                          {b.status === 'pending' ? (
                            <><button className="cbtn" onClick={() => updateBooking(b.id,'confirmed')}>✓ Confirm</button>
                            {' '}<button className="rbtn" onClick={() => updateBooking(b.id,'rejected')}>✕ Reject</button></>
                          ) : <span style={{fontSize:'10.5px',color:'var(--ink4)'}}>{b.status}</span>}
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan={8} style={{textAlign:'center',color:'var(--ink3)',padding:'2rem'}}>No bookings found</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── MENU ── */}
          {panel === 'menu' && (
            <>
              <div className="ap-h">Digital Menu</div>
              <div className="ap-sub">Changes appear instantly on your public site</div>
              <div style={{marginBottom:'1.2rem'}}><button className="btn btn-ink btn-sm" onClick={() => setShowMenuModal(true)}>+ Add Item</button></div>
              <div className="panel">
                <table className="dt">
                  <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
                  <tbody>
                    {menu.map(m => (
                      <tr key={m.id}>
                        <td><strong>{m.name}</strong><br /><span style={{fontSize:'10.5px',color:'var(--ink3)'}}>{m.description}</span></td>
                        <td><span className="bdg bdg-n">{m.category}</span></td>
                        <td>{m.price} ETB</td>
                        <td><button className="rbtn" onClick={() => deleteMenuItem(m.id)}>Delete</button></td>
                      </tr>
                    ))}
                    {menu.length === 0 && <tr><td colSpan={4} style={{textAlign:'center',color:'var(--ink3)',padding:'2rem'}}>No menu items yet. Add your first item.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── HOTEL INFO ── */}
          {panel === 'info' && (
            <>
              <div className="ap-h">Hotel Information</div>
              <div className="ap-sub">Displayed on your public website</div>
              <form className="panel" onSubmit={saveInfo}>
                <div className="fr"><label className="fl">Hotel Name</label><input className="fi" value={infoForm.name} onChange={e=>setInfoForm(p=>({...p,name:e.target.value}))} required /></div>
                <div className="fr"><label className="fl">Tagline</label><input className="fi" value={infoForm.tagline} onChange={e=>setInfoForm(p=>({...p,tagline:e.target.value}))} /></div>
                <div className="fr"><label className="fl">About</label><textarea className="fi" rows={4} value={infoForm.about} onChange={e=>setInfoForm(p=>({...p,about:e.target.value}))} /></div>
                <div className="fr2 fr">
                  <div><label className="fl">Phone</label><input className="fi" value={infoForm.phone} onChange={e=>setInfoForm(p=>({...p,phone:e.target.value}))} /></div>
                  <div><label className="fl">Email</label><input className="fi" type="email" value={infoForm.email} onChange={e=>setInfoForm(p=>({...p,email:e.target.value}))} /></div>
                </div>
                <div className="fr"><label className="fl">Address</label><input className="fi" value={infoForm.address} onChange={e=>setInfoForm(p=>({...p,address:e.target.value}))} /></div>
                <div className="fr"><label className="fl">City</label>
                  <select className="fi" value={infoForm.city} onChange={e=>setInfoForm(p=>({...p,city:e.target.value}))}>
                    {CITIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <button className="btn btn-ink" type="submit">Save Changes</button>
              </form>
            </>
          )}

          {/* ── SUBSCRIPTION ── */}
          {panel === 'sub' && hotel && (
            <>
              <div className="ap-h">Subscription</div>
              <div className="ap-sub">Your efoyta plan details</div>
              <div className="panel">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.4rem'}}>
                  <div><div style={{fontWeight:500,marginBottom:3}}>{hotel.plan} Plan</div>
                    <div style={{fontSize:13,color:'var(--ink3)'}}>{hotel.plan==='Starter'?'2,500':hotel.plan==='Professional'?'6,500':'Custom'} ETB / month</div>
                  </div>
                  <span className={`sub-st ${hotel.subscriptionStatus==='active'?'ss-a':hotel.subscriptionStatus==='expired'?'ss-e':'ss-t'}`}>
                    {hotel.subscriptionStatus==='active'?'● Active':hotel.subscriptionStatus==='expired'?'● Expired':'◌ Trial'}
                  </span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:11,marginBottom:'1.4rem'}}>
                  {[
                    [hotel.subscriptionEnds?.slice(0,10)||'—','Renewal Date'],
                    [String(subDays),'Days Left'],
                    [hotel.plan,'Current Plan'],
                  ].map(([v,l])=>(
                    <div key={l} style={{background:'var(--paper2)',padding:'1rem',borderRadius:'var(--r)',textAlign:'center'}}>
                      <div style={{fontFamily:'var(--ff)',fontSize:'1.5rem',fontWeight:300}}>{v}</div>
                      <div style={{fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.08em',marginTop:3}}>{l}</div>
                    </div>
                  ))}
                </div>
                <p style={{fontSize:13,color:'var(--ink3)',marginBottom:'1rem'}}>Contact <a href="mailto:admin@efoyta.com" style={{color:'var(--gold)'}}>admin@efoyta.com</a> to renew or upgrade your plan.</p>
                <a href="mailto:admin@efoyta.com?subject=Subscription Renewal" className="btn btn-ink">Renew Now</a>
              </div>
            </>
          )}

        </main>
      </div>

      {/* ADD ROOM MODAL */}
      {showRoomModal && (
        <div className="mbg on" onClick={e=>{ if(e.target===e.currentTarget) setShowRoomModal(false) }}>
          <div className="modal">
            <div className="modal-h">Add Room <button className="mclose" onClick={()=>setShowRoomModal(false)}>✕</button></div>
            <form onSubmit={addRoom}>
              <div className="fr"><label className="fl">Room Name</label><input className="fi" placeholder="e.g. Deluxe Double" value={roomForm.name} onChange={e=>setRoomForm(p=>({...p,name:e.target.value}))} required /></div>
              <div className="fr2 fr">
                <div><label className="fl">Type</label>
                  <select className="fi" value={roomForm.type} onChange={e=>setRoomForm(p=>({...p,type:e.target.value}))}>
                    {['Single','Double','Suite','Family'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="fl">Capacity</label><input className="fi" type="number" min="1" value={roomForm.capacity} onChange={e=>setRoomForm(p=>({...p,capacity:e.target.value}))} required /></div>
              </div>
              <div className="fr"><label className="fl">Price / Night (ETB)</label><input className="fi" type="number" min="1" placeholder="1200" value={roomForm.price} onChange={e=>setRoomForm(p=>({...p,price:e.target.value}))} required /></div>
              <div className="fr"><label className="fl">Description</label><textarea className="fi" rows={2} placeholder="Brief description…" value={roomForm.description} onChange={e=>setRoomForm(p=>({...p,description:e.target.value}))} /></div>
              <button className="btn btn-ink" type="submit" style={{width:'100%',justifyContent:'center',padding:'11px'}}>Add Room</button>
            </form>
          </div>
        </div>
      )}

      {/* ADD MENU MODAL */}
      {showMenuModal && (
        <div className="mbg on" onClick={e=>{ if(e.target===e.currentTarget) setShowMenuModal(false) }}>
          <div className="modal">
            <div className="modal-h">Add Menu Item <button className="mclose" onClick={()=>setShowMenuModal(false)}>✕</button></div>
            <form onSubmit={addMenuItem}>
              <div className="fr"><label className="fl">Item Name</label><input className="fi" placeholder="e.g. Injera with Tibs" value={menuForm.name} onChange={e=>setMenuForm(p=>({...p,name:e.target.value}))} required /></div>
              <div className="fr2 fr">
                <div><label className="fl">Category</label>
                  <select className="fi" value={menuForm.category} onChange={e=>setMenuForm(p=>({...p,category:e.target.value}))}>
                    {['Main Dishes','Starters','Beverages','Desserts'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="fl">Price (ETB)</label><input className="fi" type="number" min="1" placeholder="150" value={menuForm.price} onChange={e=>setMenuForm(p=>({...p,price:e.target.value}))} required /></div>
              </div>
              <div className="fr"><label className="fl">Description</label><input className="fi" placeholder="Brief description" value={menuForm.description} onChange={e=>setMenuForm(p=>({...p,description:e.target.value}))} /></div>
              <button className="btn btn-ink" type="submit" style={{width:'100%',justifyContent:'center',padding:'11px'}}>Add Item</button>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={()=>setToast('')} />}
    </>
  )
}
