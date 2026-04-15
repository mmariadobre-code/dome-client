import { useState } from 'react'

const styles = `
  .login-wrap {
    min-height: 100vh;
    background: #FDF8F5;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    font-family: 'DM Sans', sans-serif;
  }
  .login-card {
    background: white;
    border: 0.5px solid #E8C4C4;
    border-radius: 20px;
    padding: 2.5rem;
    width: 100%;
    max-width: 380px;
  }
  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .login-moon { font-size: 40px; margin-bottom: 12px; display: block; }
  .login-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    color: #2C1A1A;
    font-weight: 300;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }
  .login-sub {
    font-size: 9px;
    color: #B07070;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .login-divider {
    border: none;
    border-top: 0.5px solid #E8C4C4;
    margin: 1.5rem 0;
  }
  .login-label {
    display: block;
    font-size: 9px;
    color: #B07070;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .login-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 0.5px solid #E8C4C4;
    border-radius: 12px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #2C1A1A;
    background: white;
    outline: none;
    margin-bottom: 1rem;
    box-sizing: border-box;
  }
  .login-input:focus { border-color: #8C4A4A; }
  .login-btn {
    width: 100%;
    padding: 0.85rem;
    background: #8C4A4A;
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    margin-top: 0.5rem;
  }
  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .login-error {
    background: #fff0f0;
    border: 0.5px solid #E8C4C4;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 12px;
    color: #8C4A4A;
    margin-bottom: 1rem;
  }
  .login-quote {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-size: 13px;
    color: #8C6060;
    text-align: center;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
`

export default function Login({ supabase }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    if (!email || !password) { setError('Inserisci email e password'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Credenziali non valide — contatta lo studio')
    setLoading(false)
  }

  return (
    <div className="login-wrap">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap'); ${styles}`}</style>
      <div className="login-card">
        <div className="login-header">
          <span className="login-moon">🌙</span>
          <div className="login-title">The DŌME Studio</div>
          <div className="login-sub">San Lazzaro di Bologna</div>
        </div>
        <hr className="login-divider" />
        <div className="login-quote">
          "Non trovavo il posto perfetto per me.<br/>Poi ho trovato The DŌME."
        </div>
        {error && <div className="login-error">{error}</div>}
        <label className="login-label">Email</label>
        <input className="login-input" type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="la-tua@email.com"
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <label className="login-label">Password</label>
        <input className="login-input" type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Accesso...' : 'Accedi'}
        </button>
      </div>
    </div>
  )
}