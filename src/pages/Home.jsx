import { useState, useEffect } from 'react'

const homeStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes moonFloat {
    0%, 100% { transform: translateY(0px) rotate(-5deg); }
    50%       { transform: translateY(-8px) rotate(-5deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulseRing {
    0%   { transform: scale(1); opacity: 0.4; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes lineGrow {
    from { width: 0; }
    to   { width: 100%; }
  }

  .home-root {
    font-family: 'DM Sans', sans-serif;
    color: #2C1A1A;
    position: relative;
    overflow: hidden;
  }

  /* Grain overlay */
  .home-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }

  /* Hero */
  .home-hero {
    position: relative;
    padding: 3rem 0 2rem;
    text-align: center;
    animation: fadeIn 1s ease forwards;
  }
  .home-moon-wrap {
    position: relative;
    display: inline-block;
    margin-bottom: 1.5rem;
  }
  .home-moon-img {
    font-size: 52px;
    display: block;
    animation: moonFloat 4s ease-in-out infinite;
    filter: drop-shadow(0 8px 24px rgba(200,160,80,0.35));
  }
  .home-moon-ring {
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 0.5px solid rgba(200,160,80,0.3);
    animation: pulseRing 3s ease-out infinite;
  }
  .home-greeting {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #B07070;
    margin-bottom: 6px;
    animation: fadeUp 0.8s ease 0.2s both;
  }
  .home-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px;
    font-weight: 300;
    letter-spacing: 0.04em;
    color: #2C1A1A;
    line-height: 1.1;
    animation: fadeUp 0.8s ease 0.3s both;
  }
  .home-tagline {
    font-size: 10px;
    color: #C4A0A0;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-top: 8px;
    animation: fadeUp 0.8s ease 0.4s both;
  }

  /* Divider ornamental */
  .home-ornament {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 2rem 0;
    animation: fadeUp 0.8s ease 0.5s both;
  }
  .home-ornament-line {
    flex: 1;
    height: 0.5px;
    background: linear-gradient(90deg, transparent, #E8C4C4, transparent);
  }
  .home-ornament-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #C4A0A0;
  }

  /* Card base */
  .home-card {
    background: white;
    border: 0.5px solid #EDD8D8;
    border-radius: 20px;
    padding: 1.75rem;
    margin-bottom: 1rem;
    position: relative;
    overflow: hidden;
  }
  .home-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200,160,80,0.4), transparent);
  }

  /* Next session card */
  .session-card {
    background: linear-gradient(145deg, #2C1A1A 0%, #3D2424 60%, #2C1A1A 100%);
    border: none;
    border-radius: 20px;
    padding: 2rem 1.75rem;
    margin-bottom: 1rem;
    position: relative;
    overflow: hidden;
    animation: fadeUp 0.8s ease 0.6s both;
  }
  .session-card::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,160,80,0.15) 0%, transparent 70%);
  }
  .session-card::after {
    content: '';
    position: absolute;
    bottom: -20px; left: -20px;
    width: 80px; height: 80px;
    border-radius: 50%;
    border: 0.5px solid rgba(200,160,80,0.2);
  }
  .session-label {
    font-size: 9px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(200,160,80,0.7);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .session-label::after {
    content: '';
    flex: 1;
    height: 0.5px;
    background: rgba(200,160,80,0.2);
  }
  .session-date-big {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px;
    font-weight: 300;
    color: white;
    line-height: 1;
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }
  .session-month {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 1.25rem;
  }
  .session-details-row {
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 0.5px solid rgba(255,255,255,0.08);
  }
  .session-detail {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .session-detail-label {
    font-size: 8px;
    color: rgba(200,160,80,0.6);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .session-detail-value {
    font-size: 13px;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.04em;
  }
  .session-none {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 300;
    color: rgba(255,255,255,0.6);
    font-style: italic;
  }

  /* Credits card */
  .credits-card {
    animation: fadeUp 0.8s ease 0.75s both;
  }
  .credits-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.25rem;
  }
  .credits-label {
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #B07070;
    margin-bottom: 6px;
  }
  .credits-package-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 400;
    color: #2C1A1A;
    letter-spacing: 0.04em;
  }
  .credits-number {
    text-align: right;
  }
  .credits-big {
    font-family: 'Cormorant Garamond', serif;
    font-size: 52px;
    font-weight: 300;
    color: #8C4A4A;
    line-height: 1;
    background: linear-gradient(135deg, #8C4A4A, #C4A0A0, #8C4A4A);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
  .credits-of {
    font-size: 10px;
    color: #C4A0A0;
    letter-spacing: 0.1em;
  }

  /* Progress dots */
  .credits-dots {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 0.75rem;
  }
  .credit-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  .credit-dot.used {
    background: #EDD8D8;
  }
  .credit-dot.active {
    background: linear-gradient(135deg, #8C4A4A, #C4A0A0);
    box-shadow: 0 0 6px rgba(140,74,74,0.4);
  }
  .credit-dot.active:first-of-type {
    animation: pulseRing 2s ease-out infinite;
  }

  /* CTA button */
  .home-cta {
    animation: fadeUp 0.8s ease 0.9s both;
    margin-top: 0.5rem;
  }
  .cta-btn {
    width: 100%;
    padding: 1.1rem;
    background: linear-gradient(135deg, #8C4A4A 0%, #A05C5C 50%, #8C4A4A 100%);
    background-size: 200% auto;
    border: none;
    border-radius: 16px;
    color: white;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 8px 32px rgba(140,74,74,0.25);
    animation: shimmer 3s linear infinite;
  }
  .cta-btn::before {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: 15px;
    border: 0.5px solid rgba(255,255,255,0.2);
    pointer-events: none;
  }
  .cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(140,74,74,0.35);
  }
  .cta-btn:active { transform: translateY(0); }

  /* Quick links */
  .home-quick {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-top: 0.75rem;
    animation: fadeUp 0.8s ease 1s both;
  }
  .quick-btn {
    background: white;
    border: 0.5px solid #EDD8D8;
    border-radius: 14px;
    padding: 1rem;
    cursor: pointer;
    text-align: left;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  .quick-btn::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 0.5px;
    background: linear-gradient(90deg, transparent, rgba(200,160,80,0.3), transparent);
  }
  .quick-btn:hover {
    border-color: #C4A0A0;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(140,74,74,0.08);
  }
  .quick-icon {
    font-size: 20px;
    display: block;
    margin-bottom: 6px;
  }
  .quick-label {
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #B07070;
    display: block;
  }
  .quick-sub {
    font-family: 'Cormorant Garamond', serif;
    font-size: 14px;
    color: #2C1A1A;
    margin-top: 2px;
  }

  /* Loading skeleton */
  .skeleton {
    background: linear-gradient(90deg, #F5EDED 25%, #EDD8D8 50%, #F5EDED 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }
`

const MESI = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']
const GIORNI = ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato']

export default function Home({ supabase, session, setPage }) {
  const [client, setClient] = useState(null)
  const [nextBooking, setNextBooking] = useState(undefined) // undefined = loading
  const [activePackage, setActivePackage] = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const email = session.user.email

      // 1. Fetch client info
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('email', email)
        .single()
      setClient(clientData)

      if (clientData) {
        // 2. Fetch next booking
        const today = new Date().toISOString()
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            *,
            availability ( date, start_time, end_time ),
            classes ( name )
          `)
          .eq('client_id', clientData.id)
          .gte('availability.date', today.split('T')[0])
          .in('status', ['confirmed', 'pending'])
          .order('created_at', { ascending: true })
          .limit(1)

        setNextBooking(bookings?.[0] || null)

        // 3. Fetch active package
        const { data: pkgs } = await supabase
          .from('client_packages')
          .select(`
            *,
            packages ( name, sessions )
          `)
          .eq('client_id', clientData.id)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(1)

        setActivePackage(pkgs?.[0] || null)
      }

      setLoading(false)
    }
    load()
  }, [session])

  const firstName = client?.name?.split(' ')[0] || '...'

  // Format next session date
  const formatSessionDate = (booking) => {
    if (!booking?.availability?.date) return null
    const d = new Date(booking.availability.date)
    return {
      day: d.getDate(),
      month: MESI[d.getMonth()].toUpperCase(),
      weekday: GIORNI[d.getDay()],
      time: booking.availability.start_time?.slice(0,5) || '',
      className: booking.classes?.name || 'Sessione Reformer',
    }
  }

  const sessionInfo = formatSessionDate(nextBooking)

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buongiorno'
    if (h < 18) return 'Buon pomeriggio'
    return 'Buonasera'
  }

  const remaining = activePackage?.sessions_remaining ?? 0
  const total = activePackage?.packages?.sessions ?? 0

  return (
    <div className="home-root">
      <style>{homeStyles}</style>

      {/* Hero */}
      <div className="home-hero">
        <div className="home-moon-wrap">
          <span className="home-moon-img">🌙</span>
          <div className="home-moon-ring" />
        </div>
        <div className="home-greeting">{getGreeting()}</div>
        <div className="home-name">{loading ? '...' : firstName}</div>
        <div className="home-tagline">Il tuo rituale · The DŌME Studio</div>
      </div>

      {/* Ornament */}
      <div className="home-ornament">
        <div className="home-ornament-line" />
        <div className="home-ornament-dot" />
        <div style={{fontSize:'10px', color:'#C4A0A0', letterSpacing:'0.2em'}}>✦</div>
        <div className="home-ornament-dot" />
        <div className="home-ornament-line" />
      </div>

      {/* Next Session Card */}
      <div className="session-card">
        <div className="session-label">Prossima sessione</div>
        {nextBooking === undefined || loading ? (
          <div className="skeleton" style={{height:'60px', borderRadius:'12px'}} />
        ) : nextBooking === null || !sessionInfo ? (
          <div className="session-none">Nessuna sessione prenotata</div>
        ) : (
          <>
            <div className="session-date-big">{sessionInfo.day}</div>
            <div className="session-month">{sessionInfo.month} · {sessionInfo.weekday}</div>
            <div className="session-details-row">
              <div className="session-detail">
                <span className="session-detail-label">Orario</span>
                <span className="session-detail-value">{sessionInfo.time}</span>
              </div>
              <div className="session-detail">
                <span className="session-detail-label">Tipo</span>
                <span className="session-detail-value">{sessionInfo.className}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Active Package */}
      {!loading && activePackage && (
        <div className="home-card credits-card">
          <div className="credits-top">
            <div>
              <div className="credits-label">Pacchetto attivo</div>
              <div className="credits-package-name">{activePackage.packages?.name || 'Pacchetto'}</div>
            </div>
            <div className="credits-number">
              <div className="credits-big">{remaining}</div>
              <div className="credits-of">di {total} sessioni</div>
            </div>
          </div>
          <div className="credits-dots">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`credit-dot ${i < (total - remaining) ? 'used' : 'active'}`}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && !activePackage && (
        <div className="home-card credits-card" style={{textAlign:'center', padding:'1.5rem'}}>
          <div style={{fontFamily:'Cormorant Garamond, serif', fontSize:'16px', color:'#8C6060', fontStyle:'italic', marginBottom:'4px'}}>
            Nessun pacchetto attivo
          </div>
          <div style={{fontSize:'10px', color:'#C4A0A0', letterSpacing:'0.15em', textTransform:'uppercase'}}>
            Scopri i nostri rituali
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="home-cta">
        <button className="cta-btn" onClick={() => setPage('prenota')}>
          ○ &nbsp; Prenota una sessione
        </button>
      </div>

      {/* Quick links */}
      <div className="home-quick">
        <button className="quick-btn" onClick={() => setPage('prenotazioni')}>
          <span className="quick-icon">◑</span>
          <span className="quick-label">Le mie sessioni</span>
          <span className="quick-sub">Storico</span>
        </button>
        <button className="quick-btn" onClick={() => setPage('pacchetti')}>
          <span className="quick-icon">✦</span>
          <span className="quick-label">Pacchetti</span>
          <span className="quick-sub">Rinnova</span>
        </button>
      </div>

      <div style={{height:'1rem'}} />
    </div>
  )
}