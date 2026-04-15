import { useEffect, useState } from 'react'

const GIORNI = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom']
const sessioneLabel = t => t === 'small_group' ? 'Small Group' : t === 'duo_trio' ? 'Duo/Trio' : 'Individuale'

function getLunedi(data) {
  const d = new Date(data)
  d.setHours(12,0,0,0)
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  return d
}

const toLocalDate = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const dd = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${dd}`
}

export default function Prenota({ supabase, session, setPage }) {
  const [lunedi, setLunedi] = useState(getLunedi(new Date()))
  const [slots, setSlots] = useState([])
  const [clientPackage, setClientPackage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [prenotando, setPrenotando] = useState(null)
  const [messaggio, setMessaggio] = useState(null)

  const giorniSettimana = Array.from({length:7}, (_,i) => {
    const d = new Date(lunedi)
    d.setDate(lunedi.getDate()+i)
    d.setHours(12,0,0,0)
    return d
  })

  useEffect(() => {
    async function load() {
      // Pacchetto attivo
      const { data: packs } = await supabase
        .from('client_packages')
        .select('*, packages(name, session_type)')
        .eq('client_id', session.user.id)
        .gt('sessions_remaining', 0)
        .order('created_at', { ascending: false })
        .limit(1)
      setClientPackage(packs?.[0] || null)

      // Slots disponibili per la settimana
      const dal = toLocalDate(giorniSettimana[0])
      const al = toLocalDate(giorniSettimana[6])
      const { data: availability } = await supabase
        .from('availability')
        .select('*')
        .gte('date', dal)
        .lte('date', al)
        .eq('active', true)
        .order('date')
        .order('time')

      // Prenotazioni già esistenti
      const { data: bookings } = await supabase
        .from('bookings')
        .select('starts_at, session_type, client_id')
        .eq('status', 'confirmed')
        .gte('starts_at', `${dal}T00:00:00`)
        .lte('starts_at', `${al}T23:59:59`)

      // Combina slot con prenotazioni
      const slotsConInfo = (availability || []).map(s => {
        const prenotazioniSlot = (bookings || []).filter(b => {
          const bd = new Date(b.starts_at)
          const bDate = toLocalDate(bd)
          const bTime = bd.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})
          return bDate === s.date && bTime === s.time
        })
        const miaPrenotazione = prenotazioniSlot.find(b => b.client_id === session.user.id)
        const postiOccupati = prenotazioniSlot.length
        const postiMax = s.max_participants
        return { ...s, postiOccupati, postiMax, miaPrenotazione: !!miaPrenotazione, pieno: postiOccupati >= postiMax }
      })

      setSlots(slotsConInfo)
      setLoading(false)
    }
    load()
  }, [lunedi])

  const prenota = async (slot) => {
    if (!clientPackage) { alert('Acquista un pacchetto prima di prenotare'); setPage('pacchetti'); return }
    if (slot.pieno) return
    if (clientPackage.packages?.session_type !== slot.session_type) {
      alert(`Il tuo pacchetto è ${sessioneLabel(clientPackage.packages?.session_type)} — questo slot è ${sessioneLabel(slot.session_type)}`)
      return
    }

    setPrenotando(slot.id)
    const [year, month, day] = slot.date.split('-').map(Number)
    const [hour, minute] = slot.time.split(':').map(Number)
    const startsAt = new Date(year, month-1, day, hour, minute, 0)
    const endsAt = new Date(startsAt.getTime() + 60*60*1000)

    // Trova reformer libero
    const { data: reformers } = await supabase.from('reformers').select('*').eq('active', true)
    const { data: busy } = await supabase
      .from('bookings')
      .select('reformer_id')
      .eq('status', 'confirmed')
      .lt('starts_at', endsAt.toISOString())
      .gt('ends_at', startsAt.toISOString())
    const busyIds = busy?.map(b => b.reformer_id) || []
    const reformer = reformers?.find(r => !busyIds.includes(r.id))

    if (!reformer) { alert('Nessun reformer disponibile'); setPrenotando(null); return }

    const { error } = await supabase.from('bookings').insert([{
      client_id: session.user.id,
      client_package_id: clientPackage.id,
      reformer_id: reformer.id,
      session_type: slot.session_type,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'confirmed',
      session_charged: true,
    }])

    if (!error) {
      await supabase.from('client_packages')
        .update({ sessions_remaining: clientPackage.sessions_remaining - 1 })
        .eq('id', clientPackage.id)
      setMessaggio('Prenotazione confermata! 🌙')
      setTimeout(() => { setMessaggio(null); setPage('prenotazioni') }, 2000)
    }
    setPrenotando(null)
  }

  const getSlot = (giorno, ora) => slots.filter(s => s.date === toLocalDate(giorno) && s.time === ora)
  const orariUnici = [...new Set(slots.map(s => s.time))].sort()
  const oggi = new Date(); oggi.setHours(0,0,0,0)

  if (loading) return <div style={{textAlign:'center',padding:'3rem',color:'#B07070',fontFamily:'Cormorant Garamond,serif'}}>🌙</div>

  return (
    <div style={{fontFamily:'DM Sans,sans-serif'}}>
      <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'26px',color:'#2C1A1A',fontWeight:300,marginBottom:'6px'}}>Prenota</div>

      {!clientPackage && (
        <div style={{background:'#FFF8E8',border:'0.5px solid #E8D4A0',borderRadius:'12px',padding:'14px',marginBottom:'16px',fontSize:'12px',color:'#8C6A2A'}}>
          ⚠ Non hai un pacchetto attivo — <span style={{cursor:'pointer',textDecoration:'underline'}} onClick={() => setPage('pacchetti')}>acquistane uno</span>
        </div>
      )}

      {clientPackage && (
        <div style={{background:'#FBEAF0',border:'0.5px solid #F4C0D1',borderRadius:'12px',padding:'14px',marginBottom:'16px',fontSize:'12px',color:'#993556'}}>
          {clientPackage.packages?.name} · {sessioneLabel(clientPackage.packages?.session_type)} · {clientPackage.sessions_remaining} sessioni
        </div>
      )}

      {messaggio && (
        <div style={{background:'#f0fff4',border:'0.5px solid #B5C9A0',borderRadius:'12px',padding:'14px',marginBottom:'16px',fontSize:'13px',color:'#3B6D11',textAlign:'center',fontFamily:'Cormorant Garamond,serif',fontSize:'16px'}}>
          {messaggio}
        </div>
      )}

      {/* Nav settimana */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
        <button onClick={() => { const d=new Date(lunedi); d.setDate(d.getDate()-7); setLunedi(d) }}
          style={{background:'none',border:'0.5px solid #E8C4C4',borderRadius:'20px',padding:'4px 12px',fontSize:'12px',color:'#8C6060',cursor:'pointer'}}>←</button>
        <span style={{fontFamily:'Cormorant Garamond,serif',fontSize:'14px',color:'#2C1A1A'}}>
          {giorniSettimana[0].toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit'})} — {giorniSettimana[6].toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit'})}
        </span>
        <button onClick={() => { const d=new Date(lunedi); d.setDate(d.getDate()+7); setLunedi(d) }}
          style={{background:'none',border:'0.5px solid #E8C4C4',borderRadius:'20px',padding:'4px 12px',fontSize:'12px',color:'#8C6060',cursor:'pointer'}}>→</button>
      </div>

      {/* Slot */}
      {orariUnici.length === 0 && (
        <div style={{textAlign:'center',padding:'3rem',color:'#B07070',fontFamily:'Cormorant Garamond,serif',fontSize:'16px',fontStyle:'italic'}}>
          Nessuno slot disponibile questa settimana
        </div>
      )}

      {orariUnici.map(ora => (
        <div key={ora} style={{marginBottom:'20px'}}>
          <div style={{fontSize:'10px',color:'#B07070',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:'8px'}}>{ora}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px'}}>
            {giorniSettimana.map((g, gi) => {
              const cellSlots = getSlot(g, ora)
              const isPassato = g < oggi
              if (cellSlots.length === 0) return <div key={gi} style={{height:'52px'}}/>
              return cellSlots.map(s => {
                const isSmallGroup = s.session_type === 'small_group'
                const disponibile = !s.pieno && !isPassato && !s.miaPrenotazione
                const mio = s.miaPrenotazione
                return (
                  <button key={s.id}
                    onClick={() => disponibile && prenota(s)}
                    disabled={!disponibile || prenotando === s.id}
                    style={{
                      height:'52px',borderRadius:'10px',border:'0.5px solid',
                      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                      fontSize:'9px',gap:'2px',cursor:disponibile?'pointer':'not-allowed',
                      background: mio?'#8C4A4A':s.pieno||isPassato?'#F5F0ED':'white',
                      borderColor: mio?'#8C4A4A':s.pieno?'#E0D0D0':'#E8C4C4',
                      color: mio?'white':s.pieno||isPassato?'#C4B0B0':'#2C1A1A',
                    }}>
                    <span style={{fontSize:'7px',textTransform:'uppercase',letterSpacing:'0.08em'}}>{GIORNI[gi]}</span>
                    <span style={{fontSize:'11px',fontFamily:'Cormorant Garamond,serif'}}>{g.getDate()}</span>
                    {isSmallGroup && !s.pieno && !mio && (
                      <span style={{fontSize:'7px',color:'#8C6060'}}>{s.postiOccupati}/{s.postiMax}</span>
                    )}
                    {mio && <span style={{fontSize:'7px'}}>✓</span>}
                    {s.pieno && <span style={{fontSize:'7px'}}>pieno</span>}
                  </button>
                )
              })
            })}
          </div>
        </div>
      ))}
    </div>
  )
}