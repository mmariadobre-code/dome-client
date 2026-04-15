import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Login from './pages/Login'
import Home from './pages/Home'
import Pacchetti from './pages/Pacchetti'
import Prenota from './pages/Prenota'
import LeMMiePrenotazioni from './pages/LeMiePrenotazioni'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export { supabase }

const moonLoadingStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #FDF8F5; font-family: 'DM Sans', sans-serif; }

  @keyframes moonAppear {
    from { opacity: 0; transform: translateY(8px) scale(0.8); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes moonPulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.1); }
  }
  .client-loading {
    min-height: 100vh;
    background: #FDF8F5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }
  .client-loading .moon { font-size: 48px; animation: moonPulse 2s ease-in-out infinite; }
  .client-loading .title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    color: #2C1A1A;
    letter-spacing: 0.1em;
    font-weight: 300;
    animation: moonAppear 0.8s ease forwards;
  }
  .client-loading .sub {
    font-size: 10px;
    color: #B07070;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    animation: moonAppear 0.8s ease 0.3s forwards;
    opacity: 0;
  }
`

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'pacchetti', label: 'Pacchetti' },
  { id: 'prenota', label: 'Prenota' },
  { id: 'prenotazioni', label: 'Le mie sessioni' },
]

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [page, setPage] = useState('home')

  const checkIfClient = async (session) => {
    if (!session) { setIsClient(false); return }
    const { data } = await supabase
      .from('clients')
      .select('id')
      .eq('email', session.user.email)
      .single()
    setIsClient(!!data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      checkIfClient(session).then(() => setLoading(false))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      checkIfClient(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Loading iniziale
  if (loading) return (
    <div className="client-loading">
      <style>{moonLoadingStyles}</style>
      <div className="moon">🌙</div>
      <div className="title">The DŌME Studio</div>
      <div className="sub">eat, sleep, reform your mind and repeat</div>
    </div>
  )

  // Non autenticato
  if (!session) return <Login supabase={supabase} />

  // Autenticato ma non è un cliente registrato
  if (!isClient) return (
    <div className="client-loading">
      <style>{moonLoadingStyles}</style>
      <div className="moon">🌙</div>
      <div className="title">Accesso non autorizzato</div>
      <div className="sub">contatta lo studio</div>
      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          marginTop: '1rem', fontSize: '11px', color: '#8C6060',
          background: 'none', border: 'none', cursor: 'pointer',
          letterSpacing: '0.08em', textTransform: 'uppercase'
        }}
      >
        Esci
      </button>
    </div>
  )

  // Cliente autenticato e autorizzato
  return (
    <div style={{ minHeight: '100vh', background: '#FDF8F5' }}>
      <style>{moonLoadingStyles}</style>

      {/* Topbar */}
      <div style={{
        background: 'white', borderBottom: '0.5px solid #E8C4C4',
        padding: '0 1.5rem', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🌙</span>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#2C1A1A', letterSpacing: '0.06em' }}>
            The DŌME Studio
          </span>
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{
          background: 'none', border: '0.5px solid #E8C4C4', borderRadius: '20px',
          padding: '4px 12px', fontSize: '10px', color: '#8C6060',
          cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase'
        }}>Esci</button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1rem 6rem' }}>
        {page === 'home' && <Home supabase={supabase} session={session} setPage={setPage} />}
        {page === 'pacchetti' && <Pacchetti supabase={supabase} session={session} setPage={setPage} />}
        {page === 'prenota' && <Prenota supabase={supabase} session={session} setPage={setPage} />}
        {page === 'prenotazioni' && <LeMiePrenotazioni supabase={supabase} session={session} />}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white', borderTop: '0.5px solid #E8C4C4',
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 0 16px'
      }}>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            color: page === n.id ? '#8C4A4A' : '#B07070',
            fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase',
            fontFamily: 'DM Sans, sans-serif'
          }}>
            <span style={{ fontSize: '18px' }}>
              {n.id === 'home' ? '🌙' : n.id === 'pacchetti' ? '✦' : n.id === 'prenota' ? '○' : '◑'}
            </span>
            {n.label}
          </button>
        ))}
      </div>
    </div>
  )
}