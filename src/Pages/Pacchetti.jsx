import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const sessioneLabel = t => t === 'small_group' ? 'Small Group' : t === 'duo_trio' ? 'Duo/Trio' : 'Individuale'
const tipiOrdine = ['individuale', 'duo_trio', 'small_group']

export default function Pacchetti({ supabase, session }) {
  const [pacchetti, setPacchetti] = useState([])
  const [pacchettoAttivo, setPacchettoAttivo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acquistando, setAcquistando] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: packs } = await supabase.from('packages').select('*').order('session_type').order('price')
      const { data: attivo } = await supabase
        .from('client_packages')
        .select('*, packages(name, session_type)')
        .eq('client_id', session.user.id)
        .gt('sessions_remaining', 0)
        .limit(1)
      setPacchetti(packs || [])
      setPacchettoAttivo(attivo?.[0] || null)
      setLoading(false)
    }
    load()
  }, [])

  const acquista = async (pack) => {
    setAcquistando(pack.id)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          package_id: pack.id,
          client_id: session.user.id,
          success_url: window.location.href + '?success=1',
          cancel_url: window.location.href,
        })
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      alert('Errore: ' + err.message)
    }
    setAcquistando(null)
  }

  if (loading) return <div style={{textAlign:'center',padding:'3rem',color:'#B07070',fontFamily:'Cormorant Garamond,serif'}}>🌙</div>

  return (
    <div style={{fontFamily:'DM Sans,sans-serif'}}>
      <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'26px',color:'#2C1A1A',fontWeight:300,marginBottom:'6px'}}>Pacchetti</div>
      <div style={{fontSize:'11px',color:'#8C6060',marginBottom:'24px'}}>Scegli il percorso più adatto a te</div>

      {pacchettoAttivo && (
        <div style={{background:'#FFF8E8',border:'0.5px solid #E8D4A0',borderRadius:'12px',padding:'14px 16px',marginBottom:'20px',fontSize:'12px',color:'#8C6A2A'}}>
          ⚠ Hai già un pacchetto attivo: <strong>{pacchettoAttivo.packages?.name} {sessioneLabel(pacchettoAttivo.packages?.session_type)}</strong>. Esauriscilo prima di acquistarne uno nuovo.
        </div>
      )}

      {tipiOrdine.map(tipo => {
        const packsTipo = pacchetti.filter(p => p.session_type === tipo)
        if (!packsTipo.length) return null
        return (
          <div key={tipo} style={{marginBottom:'28px'}}>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'18px',color:'#2C1A1A',fontStyle:'italic',marginBottom:'12px'}}>
              {sessioneLabel(tipo)}
            </div>
            {packsTipo.map(p => (
              <div key={p.id} style={{background:'white',border:'0.5px solid #E8C4C4',borderRadius:'16px',padding:'20px',marginBottom:'10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'18px',color:'#2C1A1A'}}>{p.name}</div>
                  <div style={{fontSize:'11px',color:'#8C6060',marginTop:'4px'}}>
                    {p.sessions_total} {p.sessions_total === 1 ? 'sessione' : 'sessioni'} · {p.validity_days} giorni
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',color:'#8C4A4A',marginBottom:'8px'}}>€{p.price}</div>
                  <button
                    onClick={() => acquista(p)}
                    disabled={!!pacchettoAttivo || acquistando === p.id}
                    style={{
                      background: pacchettoAttivo ? '#F5F0ED' : '#8C4A4A',
                      border:'none',borderRadius:'20px',
                      padding:'6px 14px',color: pacchettoAttivo ? '#B07070' : 'white',
                      fontSize:'10px',cursor: pacchettoAttivo ? 'not-allowed' : 'pointer',
                      letterSpacing:'0.08em',textTransform:'uppercase',
                      whiteSpace:'nowrap'
                    }}
                  >
                    {acquistando === p.id ? '...' : 'Acquista'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}