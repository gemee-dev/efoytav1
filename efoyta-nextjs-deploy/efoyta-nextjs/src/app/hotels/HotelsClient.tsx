'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Hotel = {
  id: string; slug: string; name: string; city: string;
  tagline: string; emoji: string; stars: string;
  roomCount: number; minPrice: number;
}

export default function HotelsClient({
  hotels, cities, initialCity, initialQ
}: {
  hotels: Hotel[]; cities: string[]; initialCity: string; initialQ: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(initialQ)
  const [city, setCity] = useState(initialCity)

  function search(newCity?: string, newQ?: string) {
    const c = newCity ?? city
    const s = newQ ?? q
    const params = new URLSearchParams()
    if (c) params.set('city', c)
    if (s) params.set('q', s)
    startTransition(() => router.push('/hotels?' + params.toString()))
  }

  function selectCity(c: string) {
    setCity(c)
    search(c)
  }

  return (
    <>
      <div className="ex-hero">
        <h1>Discover <em>Ethiopian Hotels</em></h1>
        <div className="sbar">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search city, hotel name…"
          />
          <button onClick={() => search()}>Search</button>
        </div>
        <div className="chips">
          <div className={`chip ${!city ? 'on' : ''}`} onClick={() => selectCity('')}>All Cities</div>
          {cities.map(c => (
            <div key={c} className={`chip ${city === c ? 'on' : ''}`} onClick={() => selectCity(c)}>{c}</div>
          ))}
        </div>
      </div>

      <div className="hotels-wrap">
        <div className="hcount">
          {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} found{city ? ` in ${city}` : ''}
        </div>

        {hotels.length === 0 ? (
          <div style={{textAlign:'center',padding:'4rem',color:'var(--ink3)'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔍</div>
            <p>No hotels found. Try a different city or search term.</p>
          </div>
        ) : (
          <div className="hgrid">
            {hotels.map(h => (
              <Link key={h.id} href={`/hotel/${h.slug}`} className="hcard">
                <div className="hcard-img">
                  {h.emoji}
                  <div className="hcard-stars">{h.stars}</div>
                </div>
                <div className="hcard-body">
                  <div className="hcard-name">{h.name}</div>
                  <div className="hcard-city">📍 {h.city}</div>
                  <div className="hcard-tag">{h.tagline}</div>
                  <div className="hcard-foot">
                    <span>🛏 {h.roomCount} rooms</span>
                    <div className="hcard-price">
                      {h.minPrice > 0 ? `from ${h.minPrice.toLocaleString()} ETB` : '—'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
