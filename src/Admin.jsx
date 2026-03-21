import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const ADMIN_PASSWORD = 'southpredict2026'

const categories = ['Cricket', 'Politics', 'Cinema', 'Infrastructure', 'Health']

function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    question: '',
    category: 'Cricket',
    yes_percent: 50,
    volume: 0,
    closes: ''
  })

  useEffect(() => {
    if (authenticated) fetchMarkets()
  }, [authenticated])

  async function fetchMarkets() {
    const { data } = await supabase
      .from('markets')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setMarkets(data)
  }

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
    } else {
      alert('Wrong password')
    }
  }

  async function handleAddMarket() {
    if (!form.question || !form.closes) {
      alert('Fill in all fields')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('markets').insert({
      question: form.question,
      category: form.category,
      yes_percent: parseInt(form.yes_percent),
      volume: parseInt(form.volume),
      closes: form.closes
    })
    if (!error) {
      setSuccess('Market added successfully!')
      setForm({ question: '', category: 'Cricket', yes_percent: 50, volume: 0, closes: '' })
      fetchMarkets()
      setTimeout(() => setSuccess(''), 3000)
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this market?')) return
    await supabase.from('markets').delete().eq('id', id)
    fetchMarkets()
  }

  async function handleToggle(market) {
    await supabase.from('markets')
      .update({ yes_percent: market.yes_percent })
      .eq('id', market.id)
    fetchMarkets()
  }

  if (!authenticated) {
    return (
      <div style={{
        background: "#0f0f23",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <div style={{
          background: "#1a1a2e",
          border: "1px solid #2a2a4a",
          borderRadius: "16px",
          padding: "32px",
          width: "100%",
          maxWidth: "360px"
        }}>
          <h2 style={{ color: "white", marginBottom: "8px", fontSize: "20px" }}>Admin Panel</h2>
          <p style={{ color: "#555", marginBottom: "24px", fontSize: "13px" }}>SouthPredict</p>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: "100%",
              padding: "12px",
              background: "#0f0f23",
              border: "1px solid #2a2a4a",
              borderRadius: "10px",
              color: "white",
              fontSize: "14px",
              marginBottom: "12px",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <button onClick={handleLogin} style={{
            width: "100%",
            padding: "12px",
            background: "#1a9e5c",
            border: "none",
            borderRadius: "10px",
            color: "white",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer"
          }}>
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: "#0f0f23", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ color: "white", fontSize: "20px", fontWeight: "700" }}>Admin Panel</h1>
            <p style={{ color: "#555", fontSize: "12px" }}>SouthPredict</p>
          </div>
          <a href="/" style={{
            color: "#1a9e5c",
            fontSize: "13px",
            textDecoration: "none"
          }}>← View Site</a>
        </div>

        <div style={{
          background: "#1a1a2e",
          border: "1px solid #2a2a4a",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px"
        }}>
          <h2 style={{ color: "white", fontSize: "16px", marginBottom: "16px" }}>Add New Market</h2>

          {success && (
            <div style={{
              background: "rgba(26,158,92,0.2)",
              border: "1px solid #1a9e5c",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#1a9e5c",
              fontSize: "13px",
              marginBottom: "16px"
            }}>
              {success}
            </div>
          )}

          <div style={{ marginBottom: "12px" }}>
            <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>
              Question
            </label>
            <input
              type="text"
              placeholder="Will CSK win IPL 2026?"
              value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#0f0f23",
                border: "1px solid #2a2a4a",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0f0f23",
                  border: "1px solid #2a2a4a",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none"
                }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: "140px" }}>
              <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>
                Starting YES %
              </label>
              <input
                type="number"
                min="3"
                max="97"
                value={form.yes_percent}
                onChange={e => setForm({ ...form, yes_percent: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0f0f23",
                  border: "1px solid #2a2a4a",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: "140px" }}>
              <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>
                Closes
              </label>
              <input
                type="text"
                placeholder="May 2026"
                value={form.closes}
                onChange={e => setForm({ ...form, closes: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0f0f23",
                  border: "1px solid #2a2a4a",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          <button
            onClick={handleAddMarket}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#333" : "#1a9e5c",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "14px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer"
            }}>
            {loading ? 'Adding...' : '+ Add Market'}
          </button>
        </div>

        <div>
          <h2 style={{ color: "white", fontSize: "16px", marginBottom: "12px" }}>
            All Markets ({markets.length})
          </h2>
          {markets.map(market => (
            <div key={market.id} style={{
              background: "#1a1a2e",
              border: "1px solid #2a2a4a",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px"
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: "white", fontSize: "13px", marginBottom: "4px" }}>
                  {market.question}
                </p>
                <p style={{ color: "#555", fontSize: "11px" }}>
                  {market.category} · YES {market.yes_percent}% · {market.closes} · Vol {market.volume}
                </p>
              </div>
              <button
                onClick={() => handleDelete(market.id)}
                style={{
                  background: "rgba(224,92,42,0.1)",
                  border: "1px solid rgba(224,92,42,0.3)",
                  color: "#e05c2a",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  whiteSpace: "nowrap"
                }}>
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Admin