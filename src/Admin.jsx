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

  useEffect(function() {
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
      yes_pool: parseInt(form.yes_percent) * 100,
      no_pool: (100 - parseInt(form.yes_percent)) * 100,
      volume: parseInt(form.volume),
      closes: form.closes,
      resolved: false
    })
    if (!error) {
      setSuccess('Market added!')
      setForm({ question: '', category: 'Cricket', yes_percent: 50, volume: 0, closes: '' })
      fetchMarkets()
      setTimeout(function() { setSuccess('') }, 3000)
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this market?')) return
    await supabase.from('markets').delete().eq('id', id)
    fetchMarkets()
  }

  async function handleResolve(market, resolution) {
    if (!confirm('Resolve market as ' + resolution.toUpperCase() + ' WON? This cannot be undone.')) return
    const { error } = await supabase.from('markets').update({
      resolved: true,
      resolution: resolution,
      resolved_at: new Date().toISOString(),
      yes_percent: resolution === 'yes' ? 100 : 0
    }).eq('id', market.id)
    if (!error) {
      setSuccess('Market resolved as ' + resolution.toUpperCase() + ' WON!')
      setTimeout(function() { setSuccess('') }, 3000)
      fetchMarkets()
    }
  }

  async function handleUnresolve(id) {
    if (!confirm('Unresolve this market?')) return
    await supabase.from('markets').update({
      resolved: false,
      resolution: null,
      resolved_at: null
    }).eq('id', id)
    fetchMarkets()
  }

  if (!authenticated) {
    return (
      <div style={{
        background: '#0f0f23', minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px'
      }}>
        <div style={{
          background: '#1a1a2e', border: '1px solid #2a2a4a',
          borderRadius: '16px', padding: '32px',
          width: '100%', maxWidth: '360px'
        }}>
          <h2 style={{ color: 'white', marginBottom: '8px', fontSize: '20px' }}>Admin Panel</h2>
          <p style={{ color: '#555', marginBottom: '24px', fontSize: '13px' }}>SouthPredict</p>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={function(e) { setPassword(e.target.value) }}
            onKeyDown={function(e) { if (e.key === 'Enter') handleLogin() }}
            style={{
              width: '100%', padding: '12px',
              background: '#0f0f23', border: '1px solid #2a2a4a',
              borderRadius: '10px', color: 'white', fontSize: '14px',
              marginBottom: '12px', outline: 'none', boxSizing: 'border-box'
            }}
          />
          <button onClick={handleLogin} style={{
            width: '100%', padding: '12px',
            background: '#00C087', border: 'none',
            borderRadius: '10px', color: 'white',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer'
          }}>Login</button>
        </div>
      </div>
    )
  }

  const activeMarkets = markets.filter(function(m) { return !m.resolved })
  const resolvedMarkets = markets.filter(function(m) { return m.resolved })

  return (
    <div style={{ background: '#0f0f23', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>Admin Panel</h1>
            <p style={{ color: '#555', fontSize: '12px', margin: '4px 0 0' }}>SouthPredict</p>
          </div>
          <a href="/" style={{ color: '#00C087', fontSize: '13px', textDecoration: 'none' }}>← View Site</a>
        </div>

        {success && (
          <div style={{
            background: 'rgba(0,192,135,0.15)', border: '1px solid #00C087',
            borderRadius: '8px', padding: '10px 14px',
            color: '#00C087', fontSize: '13px', marginBottom: '16px'
          }}>
            {success}
          </div>
        )}

        <div style={{
          background: '#1a1a2e', border: '1px solid #2a2a4a',
          borderRadius: '16px', padding: '20px', marginBottom: '24px'
        }}>
          <h2 style={{ color: 'white', fontSize: '16px', marginBottom: '16px' }}>Add New Market</h2>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
              Question
            </label>
            <input
              type="text"
              placeholder="Will CSK win IPL 2026?"
              value={form.question}
              onChange={function(e) { setForm({ ...form, question: e.target.value }) }}
              style={{
                width: '100%', padding: '10px 12px',
                background: '#0f0f23', border: '1px solid #2a2a4a',
                borderRadius: '8px', color: 'white', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={function(e) { setForm({ ...form, category: e.target.value }) }}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: '#0f0f23', border: '1px solid #2a2a4a',
                  borderRadius: '8px', color: 'white',
                  fontSize: '14px', outline: 'none'
                }}>
                {categories.map(function(c) { return <option key={c} value={c}>{c}</option> })}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Starting YES %
              </label>
              <input
                type="number" min="3" max="97"
                value={form.yes_percent}
                onChange={function(e) { setForm({ ...form, yes_percent: e.target.value }) }}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: '#0f0f23', border: '1px solid #2a2a4a',
                  borderRadius: '8px', color: 'white', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Closes
              </label>
              <input
                type="text" placeholder="May 2026"
                value={form.closes}
                onChange={function(e) { setForm({ ...form, closes: e.target.value }) }}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: '#0f0f23', border: '1px solid #2a2a4a',
                  borderRadius: '8px', color: 'white', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button onClick={handleAddMarket} disabled={loading} style={{
            width: '100%', padding: '12px',
            background: loading ? '#333' : '#00C087',
            border: 'none', borderRadius: '10px', color: 'white',
            fontSize: '14px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Adding...' : '+ Add Market'}
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: 'white', fontSize: '16px', marginBottom: '12px' }}>
            Active Markets ({activeMarkets.length})
          </h2>
          {activeMarkets.length === 0 && (
            <p style={{ color: '#555', fontSize: '13px' }}>No active markets</p>
          )}
          {activeMarkets.map(function(market) {
            return (
              <div key={market.id} style={{
                background: '#1a1a2e', border: '1px solid #2a2a4a',
                borderRadius: '12px', padding: '14px 16px', marginBottom: '8px'
              }}>
                <p style={{ color: 'white', fontSize: '13px', marginBottom: '4px', fontWeight: '600' }}>
                  {market.question}
                </p>
                <p style={{ color: '#555', fontSize: '11px', marginBottom: '12px' }}>
                  {market.category} · YES {market.yes_percent}% · Closes {market.closes} · Vol {market.volume}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={function() { handleResolve(market, 'yes') }} style={{
                    padding: '8px 16px',
                    background: 'rgba(0,192,135,0.15)',
                    border: '1px solid #00C087',
                    color: '#00C087', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '700'
                  }}>
                    ✅ Resolve YES Won
                  </button>
                  <button onClick={function() { handleResolve(market, 'no') }} style={{
                    padding: '8px 16px',
                    background: 'rgba(255,77,77,0.15)',
                    border: '1px solid #FF4D4D',
                    color: '#FF4D4D', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '700'
                  }}>
                    ❌ Resolve NO Won
                  </button>
                  <button onClick={function() { handleDelete(market.id) }} style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid #333',
                    color: '#555', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '12px'
                  }}>
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {resolvedMarkets.length > 0 && (
          <div>
            <h2 style={{ color: 'white', fontSize: '16px', marginBottom: '12px' }}>
              Resolved Markets ({resolvedMarkets.length})
            </h2>
            {resolvedMarkets.map(function(market) {
              return (
                <div key={market.id} style={{
                  background: '#1a1a2e',
                  border: '1px solid ' + (market.resolution === 'yes' ? 'rgba(0,192,135,0.3)' : 'rgba(255,77,77,0.3)'),
                  borderRadius: '12px', padding: '14px 16px',
                  marginBottom: '8px', opacity: 0.8
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: 'white', fontSize: '13px', marginBottom: '4px', fontWeight: '600' }}>
                        {market.question}
                      </p>
                      <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>
                        {market.category} · Vol {market.volume}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                      <span style={{
                        background: market.resolution === 'yes' ? 'rgba(0,192,135,0.2)' : 'rgba(255,77,77,0.2)',
                        color: market.resolution === 'yes' ? '#00C087' : '#FF4D4D',
                        padding: '4px 10px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap'
                      }}>
                        {market.resolution === 'yes' ? 'YES WON' : 'NO WON'}
                      </span>
                      <button onClick={function() { handleUnresolve(market.id) }} style={{
                        padding: '4px 10px', background: 'transparent',
                        border: '1px solid #333', color: '#555',
                        borderRadius: '6px', cursor: 'pointer', fontSize: '11px'
                      }}>Unresolve</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default Admin