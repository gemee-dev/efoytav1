import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'efoyta — Hotel Digital Platform',
  description: 'Complete digital presence for Ethiopian hotels. Website, booking engine, digital menu and guest discovery — live in minutes.',
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-nav">

        {/* HERO */}
        <section className="hero">
          <div className="hero-eye">Hotel SaaS Platform · Ethiopia &amp; Beyond</div>
          <h1 className="hero-h">Your hotel,<br /><em>beautifully digital</em></h1>
          <p className="hero-p">Complete digital presence for hotels — website, booking engine, digital menu, and guest discovery. Live in minutes, not months.</p>
          <div className="hero-acts">
            <Link href="/hotels" className="btn btn-ink btn-lg">Browse Hotels</Link>
            <Link href="/login" className="btn btn-gold btn-lg">Get Started</Link>
            <Link href="/admin" className="btn btn-out btn-lg">Admin Demo</Link>
          </div>
        </section>

        {/* FEATURES */}
        <div className="sec">
          <div className="sec-eye">What you get</div>
          <h2 className="sec-h">Everything a hotel needs,<br /><em>nothing it doesn&apos;t</em></h2>
          <p className="sec-p">One platform. Instant website. Real-time booking. Digital menus — managed from a single elegant dashboard.</p>
          <div className="feat-grid">
            {[
              ['01','Instant Website','Auto-generated 5-page site with home, about, rooms, menu and contact — unique to your hotel, live immediately.'],
              ['02','Booking Engine','Guests browse rooms, check availability and submit requests. Confirm or decline from your dashboard in real time.'],
              ['03','Digital Menu','Manage food and drink by category. All changes appear instantly on your live public site.'],
              ['04','Guest Discovery','Listed on efoyta.com by city. Guests searching Jimma, Addis Ababa or Hawassa find you first.'],
              ['05','Multi-Tenant Security','Complete data isolation. JWT auth + row-level security. No hotel can access another\'s data.'],
              ['06','SEO Ready','Clean URLs, meta titles, city pages, schema markup — discoverable from search engines on day one.'],
            ].map(([n,t,d]) => (
              <div className="feat" key={n}>
                <div className="feat-n">{n}</div>
                <div className="feat-title">{t}</div>
                <div className="feat-desc">{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PRICING */}
        <div className="sec-alt" style={{padding:0}}>
          <div className="sec" style={{maxWidth:1100}}>
            <div className="sec-eye">Pricing</div>
            <h2 className="sec-h">Simple, <em>transparent</em> plans</h2>
            <p className="sec-p">Managed by platform admin. Subscription controls hotel feature access automatically.</p>
            <div className="price-grid">
              <div className="pc">
                <div className="pc-tier">Starter</div>
                <div className="pc-amt">2,500</div>
                <div className="pc-per">ETB / month</div>
                <ul className="pc-list">
                  <li>1 Hotel website</li><li>Up to 10 rooms</li>
                  <li>Booking requests</li><li>Digital menu</li><li>City listing</li>
                </ul>
                <Link href="/login" className="btn btn-out" style={{width:'100%',justifyContent:'center',marginTop:'1.5rem'}}>Get Started</Link>
              </div>
              <div className="pc pc-feat">
                <div className="pc-badge">Most Popular</div>
                <div className="pc-tier">Professional</div>
                <div className="pc-amt" style={{color:'var(--gold2)'}}>6,500</div>
                <div className="pc-per">ETB / month</div>
                <ul className="pc-list">
                  <li>Unlimited rooms</li><li>Priority listing</li>
                  <li>Analytics dashboard</li><li>Multi-staff accounts</li><li>Custom domain</li>
                </ul>
                <Link href="/login" className="btn btn-gold" style={{width:'100%',justifyContent:'center',marginTop:'1.5rem'}}>Get Started</Link>
              </div>
              <div className="pc">
                <div className="pc-tier">Enterprise</div>
                <div className="pc-amt">Custom</div>
                <div className="pc-per">per agreement</div>
                <ul className="pc-list">
                  <li>Multi-property</li><li>White-label option</li>
                  <li>API access</li><li>Dedicated support</li><li>SLA guarantee</li>
                </ul>
                <a href="mailto:hello@efoyta.com" className="btn btn-out" style={{width:'100%',justifyContent:'center',marginTop:'1.5rem'}}>Contact Us</a>
              </div>
            </div>
          </div>
        </div>

        <footer>© 2025 efoyta.com — Hotel SaaS Platform &nbsp;·&nbsp; Jimma, Ethiopia &nbsp;·&nbsp; <a href="mailto:hello@efoyta.com">hello@efoyta.com</a></footer>
      </main>
    </>
  )
}
