import { useEffect, useState } from 'react'

const sessioneLabel = t => t === 'small_group' ? 'Small Group' : t === 'duo_trio' ? 'Duo/Trio' : 'Individuale'

export default function LeMiePrenotazioni({ supabase, session }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellando, setCancellando] = useState(null)
  const [messaggio, setMessaggio] = useState(null)

  async function load() {
    const { data } = await supabase
      .from('bookings')
      .select('*, reformers(name)')
      .eq('client_id', session.user.id)
      .neq('status', 'cancelled')
      .order('starts_at', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const cancella = async (booking) => {
    const ora = new Date()
    const inizio = new Date(booking.starts_at)
    const diffOre = (inizio - ora) / (1000*60*60)

    const conferma = window.confirm(
      diffOre >= 24
        ? 'Vuoi cancellare questa sessione?\nLa sessione verrà restituita al tuo pacchetto.'
        : '⚠️ Mancano meno di 24h — la sessione non verrà restituita al pacchetto.\nContinuare?'
    )
    if (!conferma) return

    setCancellando(booking.id)
    await supabase.from('bookings').update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      session_charged: diffOre < 24
    }).eq('id', booking.id)

    if (diffOre >= 24 && booking.client_package_id) {
      const { data: pack } = await supabase
        .from('client_packages').select('sessions_remaining').eq('id', booking.client_package_id).single()
      if (pack) {
        await supabase.from('client_packages')
          .update({ sessions_remaining: pack.sessions_remaining + 1 })
          .eq('id', booking.client_package_id)
      }
    }

    setMessaggio(diffOre >= 24 ? 'Sessione cancellata — sessione restituita al pacchetto' : 'Sessione cancellata')
    await load()
    setCancellando(null)
    setTimeout(() => setMessaggio(null), 4000)
  }

  const prossime = bookings.filter(b => new Date(b.starts_at) > new Date() && b.status === 'confirmed')
  const passate = bookings.filter(b => new Date(b.starts_at) <= new Date() || b.status !== 'confirmed')

  if (loading) return <div style={{textAlign:'center',padding:'3rem',color:'#B07070',fontFamily:'Cormorant Garamond,serif'}}>🌙</div>

  return (
    <div style={{fontFamily:'DM Sans,sans-serif'}}>
      <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'26px',color:'#2C1A1A',fontWeight:300,marginBottom:'24px'}}>Le mie sessioni</div>

      {messaggio && (
        <div style={{background:'#f0fff4',border:'0.5px solid #B5C9A0',borderRadius:'12px',padding:'14px',marginBottom:'16px',fontSize:'12px',color:'#3B6D11'}}>
          {messaggio}
        </div>
      )}

      {/* Prossime */}
      <div style={{fontSize:'10px',color:'#B07070',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:'12px'}}>
        Prossime ({prossime.length})
      </div>
      {prossime.length === 0 && (
        <div style={{color:'#8C6060',fontSize:'13px',fontStyle:'italic',fontFamily:'Cormorant Garamond,serif',marginBottom:'24px'}}>
          Nessuna sessione in programma 🌙
        </div>
      )}
      {prossime.map(b => {
        const diffOre = (new Date(b.starts_at) - new Date()) / (1000*60*60)
        return (
          <div key={b.id} style={{background:'white',border:'0.5px solid #E8C4C4',borderRadius:'16px',padding:'16px',marginBottom:'8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'16px',color:'#2C1A1A'}}>
                {new Date(b.starts_at).toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'})}
              </div>
              <div style={{fontSize:'11px',color:'#8C6060',marginTop:'2px'}}>
                {new Date(b.starts_at).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})} · {sessioneLabel(b.session_type)} · {b.reformers?.name}
              </div>
              {diffOre < 24 && diffOre > 0 && (
                <div style={{fontSize:'9px',color:'#B07070',marginTop:'4px',textTransform:'uppercase',letterSpacing:'0.08em'}}>⚠ entro 24h</div>
              )}
            </div>
            <button onClick={() => cancella(b)} disabled={cancellando === b.id}
              style={{background:'none',border:'0.5px solid #E8C4C4',borderRadius:'20px',padding:'4px 12px',fontSize:'9px',color:'#B07070',cursor:'pointer',letterSpacing:'0.08em',textTransform:'uppercase',whiteSpace:'nowrap'}}>
              {cancellando === b.id ? '...' : 'Disdici'}
            </button>
          </div>
        )
      })}

      {/* Storico */}
      {passate.length > 0 && (
        <>
          <div style={{fontSize:'10px',color:'#B07070',letterSpacing:'0.15em',textTransform:'uppercase',margin:'24px 0 12px'}}>
            Storico ({passate.length})
          </div>
          {passate.map(b => (
            <div key={b.id} style={{background:'#FDFAF8',border:'0.5px solid #E8C4C4',borderRadius:'12px',padding:'14px',marginBottom:'6px',opacity:0.7}}>
              <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'15px',color:'#2C1A1A'}}>
                {new Date(b.starts_at).toLocaleDateString('it-IT',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}
              </div>
              <div style={{fontSize:'11px',color:'#8C6060',marginTop:'2px'}}>
                {new Date(b.starts_at).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})} · {sessioneLabel(b.session_type)}
                {b.status === 'cancelled' && ' · cancellata'}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}