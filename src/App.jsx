import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const categoryColors = {
  Cricket: "#1a9e5c",
  Politics: "#e05c2a",
  Cinema: "#9b59b6",
  Infrastructure: "#2980b9",
  Health: "#e74c3c"
}

function formatVolume(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

function MarketCard({ market, onBet }) {
  const [voted, setVoted] = useState(null)
  const [betAmount, setBetAmount] = useState(100)
  const [showConfirm, setShowConfirm] = useState(null)

  function handleVote(choice) {
    if (voted) return
    setShowConfirm(choice)
  }

  async function confirmBet() {
    setVoted(showConfirm)
    await onBet(market.id, showConfirm, betAmount)
    setShowConfirm(null)
  }

  function shareOnWhatsApp() {
    const text = `🏏 SouthPredict\n\n${market.question}\n\nYES ${market.yes_percent}% | NO ${100 - market.yes_percent}%\n\nBet now 👉 https://southpredict-app.vercel.app`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div style={{
      background: "#1a1a2e",
      border: "1px solid #2a2a4a",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <span style={{
          background: categoryColors[market.category] || "#444",
          color: "white",
          padding: "3px 10px",
          borderRadius: "20px",
          fontSize: "12px"
        }}>
          {market.category}
        </span>
        <span style={{ color: "#888", fontSize: "12px" }}>Closes {market.closes}</span>
      </div>

      <h3 style={{ color: "white", marginBottom: "16px", fontSize: "16px", lineHeight: "1.4" }}>
        {market.question}
      </h3>

      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ color: "#1a9e5c", fontWeight: "bold" }}>YES {market.yes_percent}%</span>
          <span style={{ color: "#e05c2a", fontWeight: "bold" }}>NO {100 - market.yes_percent}%</span>
        </div>
        <div style={{ background: "#2a2a4a", borderRadius: "4px", height: "8px" }}>
          <div style={{
            width: `${market.yes_percent}%`,
            background: "linear-gradient(90deg, #1a9e5c, #27ae60)",
            height: "8px",
            borderRadius: "4px",
            transition: "width 0.5s ease"
          }} />
        </div>
      </div>

      {showConfirm && (
        <div style={{
          background: "#0f0f23",
          border: `1px solid ${showConfirm === 'yes' ? '#1a9e5c' : '#e05c2a'}`,
          borderRadius: "8px",
          padding: "14px",
          marginBottom: "14px"
        }}>
          <p style={{ color: "white", margin: "0 0 10px", fontSize: "14px" }}>
            Bet on <strong>{showConfirm.toUpperCase()}</strong> — how much?
          </p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            {[50, 100, 500, 1000].map(amt => (
              <button key={amt} onClick={() => setBetAmount(amt)} style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: betAmount === amt ? "white" : "#444",
                background: betAmount === amt ? "white" : "transparent",
                color: betAmount === amt ? "#0f0f23" : "#888",
                cursor: "pointer",
                fontSize: "13px"
              }}>₹{amt}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={confirmBet} style={{
              flex: 1,
              padding: "10px",
              background: showConfirm === 'yes' ? "#1a9e5c" : "#e05c2a",
              border: "none",
              color: "white",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}>
              Confirm ₹{betAmount} on {showConfirm.toUpperCase()}
            </button>
            <button onClick={() => setShowConfirm(null)} style={{
              padding: "10px 16px",
              background: "transparent",
              border: "1px solid #444",
              color: "#888",
              borderRadius: "8px",
              cursor: "pointer"
            }}>Cancel</button>
          </div>
        </div>
      )}

      {!showConfirm && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <button onClick={() => handleVote('yes')} disabled={!!voted} style={{
            flex: 1,
            padding: "10px",
            background: voted === 'yes' ? "#1a9e5c" : "transparent",
            border: "1px solid #1a9e5c",
            color: voted === 'yes' ? "white" : "#1a9e5c",
            borderRadius: "8px",
            cursor: voted ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            opacity: voted && voted !== 'yes' ? 0.4 : 1
          }}>
            {voted === 'yes' ? '✓ Bet YES' : 'YES'}
          </button>
          <button onClick={() => handleVote('no')} disabled={!!voted} style={{
            flex: 1,
            padding: "10px",
            background: voted === 'no' ? "#e05c2a" : "transparent",
            border: "1px solid #e05c2a",
            color: voted === 'no' ? "white" : "#e05c2a",
            borderRadius: "8px",
            cursor: voted ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            opacity: voted && voted !== 'no' ? 0.4 : 1
          }}>
            {voted === 'no' ? '✓ Bet NO' : 'NO'}
          </button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#888", fontSize: "12px" }}>
        <span>Volume: {formatVolume(market.volume)}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {voted && <span style={{ color: "#ffd700" }}>✓ You bet {voted.toUpperCase()}</span>}
          <button onClick={shareOnWhatsApp} style={{
            background: "#25D366",
            border: "none",
            color: "white",
            padding: "5px 10px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            Share on WhatsApp
          </button>
        </div>
      </div>

    </div>
  )
}

function App() {
  const [markets, setMarkets] = useState([])
  const [filter, setFilter] = useState("All")
  const [loading, setLoading] = useState(true)

  const categories = ["All", "Cricket", "Politics", "Cinema", "Infrastructure", "Health"]

  useEffect(() => {
    fetchMarkets()
  }, [])

  async function fetchMarkets() {
    setLoading(true)
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .order('volume', { ascending: false })
    if (!error) setMarkets(data)
    setLoading(false)
  }

  async function handleBet(marketId, choice, amount) {
    await supabase.from('bets').insert({
      market_id: marketId,
      choice: choice,
      amount: amount,
      user_session: Math.random().toString(36).substr(2, 9)
    })

    const market = markets.find(m => m.id === marketId)
    const impact = Math.min(3, amount / 100)
    const newYes = choice === 'yes'
      ? Math.min(97, market.yes_percent + impact)
      : Math.max(3, market.yes_percent - impact)

    await supabase.from('markets').update({
      yes_percent: Math.round(newYes),
      volume: market.volume + amount
    }).eq('id', marketId)

    fetchMarkets()
  }

  const filtered = filter === "All" ? markets : markets.filter(m => m.category === filter)

  return (
    <div style={{ background: "#0f0f23", minHeight: "100vh", padding: "24px 16px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>

        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ color: "white", fontSize: "24px", margin: "0 0 4px 0" }}>
            🏏 SouthPredict
          </h1>
          <p style={{ color: "#888", margin: 0, fontSize: "14px" }}>
            Prediction markets for South India
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: "6px 16px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: filter === cat ? "white" : "#444",
              background: filter === cat ? "white" : "transparent",
              color: filter === cat ? "#0f0f23" : "#888",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: filter === cat ? "bold" : "normal"
            }}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: "#888", textAlign: "center", padding: "40px" }}>
            Loading markets...
          </div>
        ) : (
          filtered.map(market => (
            <MarketCard key={market.id} market={market} onBet={handleBet} />
          ))
        )}

      </div>
    </div>
  )
}

export default App