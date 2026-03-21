import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const categoryColors = {
  Cricket: "#1a9e5c",
  Politics: "#e05c2a",
  Cinema: "#9b59b6",
  Infrastructure: "#2980b9",
  Health: "#e74c3c"
}

const categoryEmojis = {
  Cricket: "🏏",
  Politics: "🗳️",
  Cinema: "🎬",
  Infrastructure: "🏗️",
  Health: "🏥"
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
  const [animating, setAnimating] = useState(false)

  function handleVote(choice) {
    if (voted) return
    setShowConfirm(choice)
  }

  async function confirmBet() {
    setAnimating(true)
    setVoted(showConfirm)
    await onBet(market.id, showConfirm, betAmount)
    setShowConfirm(null)
    setTimeout(() => setAnimating(false), 600)
  }

  function shareOnWhatsApp() {
    const text = `🏏 SouthPredict\n\n${market.question}\n\nYES ${market.yes_percent}% | NO ${100 - market.yes_percent}%\n\nBet now 👉 https://southpredict-app.vercel.app`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div style={{
      background: "#1a1a2e",
      border: "1px solid #2a2a4a",
      borderRadius: "16px",
      padding: "16px",
      marginBottom: "12px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.3)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{
          background: categoryColors[market.category] || "#444",
          color: "white",
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "0.3px"
        }}>
          {categoryEmojis[market.category]} {market.category}
        </span>
        <span style={{ color: "#666", fontSize: "11px" }}>Closes {market.closes}</span>
      </div>

      <h3 style={{
        color: "white",
        marginBottom: "14px",
        fontSize: "15px",
        lineHeight: "1.5",
        fontWeight: "600"
      }}>
        {market.question}
      </h3>

      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ color: "#1a9e5c", fontWeight: "700", fontSize: "14px" }}>YES {market.yes_percent}%</span>
          <span style={{ color: "#e05c2a", fontWeight: "700", fontSize: "14px" }}>NO {100 - market.yes_percent}%</span>
        </div>
        <div style={{ background: "#2a2a4a", borderRadius: "6px", height: "6px", overflow: "hidden" }}>
          <div style={{
            width: `${market.yes_percent}%`,
            background: "linear-gradient(90deg, #1a9e5c, #27ae60)",
            height: "6px",
            borderRadius: "6px",
            transition: animating ? "width 0.6s ease" : "width 0.3s ease"
          }} />
        </div>
      </div>

      {showConfirm && (
        <div style={{
          background: "#0f0f23",
          border: `1px solid ${showConfirm === 'yes' ? '#1a9e5c' : '#e05c2a'}`,
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "12px"
        }}>
          <p style={{ color: "#aaa", margin: "0 0 10px", fontSize: "13px" }}>
            Bet on <strong style={{ color: "white" }}>{showConfirm.toUpperCase()}</strong> — pick amount
          </p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {[50, 100, 500, 1000].map(amt => (
              <button key={amt} onClick={() => setBetAmount(amt)} style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: betAmount === amt ? "white" : "#333",
                background: betAmount === amt ? "white" : "#1a1a2e",
                color: betAmount === amt ? "#0f0f23" : "#888",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: betAmount === amt ? "700" : "400"
              }}>₹{amt}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={confirmBet} style={{
              flex: 1,
              padding: "12px",
              background: showConfirm === 'yes' ? "#1a9e5c" : "#e05c2a",
              border: "none",
              color: "white",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "14px"
            }}>
              Confirm ₹{betAmount}
            </button>
            <button onClick={() => setShowConfirm(null)} style={{
              padding: "12px 16px",
              background: "transparent",
              border: "1px solid #333",
              color: "#666",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px"
            }}>✕</button>
          </div>
        </div>
      )}

      {!showConfirm && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <button onClick={() => handleVote('yes')} disabled={!!voted} style={{
            flex: 1,
            padding: "12px",
            background: voted === 'yes' ? "#1a9e5c" : "rgba(26,158,92,0.1)",
            border: `1.5px solid ${voted === 'yes' ? '#1a9e5c' : 'rgba(26,158,92,0.4)'}`,
            color: voted === 'yes' ? "white" : "#1a9e5c",
            borderRadius: "10px",
            cursor: voted ? "default" : "pointer",
            fontWeight: "700",
            fontSize: "14px",
            opacity: voted && voted !== 'yes' ? 0.3 : 1,
            transition: "all 0.2s"
          }}>
            {voted === 'yes' ? '✓ YES' : 'YES'}
          </button>
          <button onClick={() => handleVote('no')} disabled={!!voted} style={{
            flex: 1,
            padding: "12px",
            background: voted === 'no' ? "#e05c2a" : "rgba(224,92,42,0.1)",
            border: `1.5px solid ${voted === 'no' ? '#e05c2a' : 'rgba(224,92,42,0.4)'}`,
            color: voted === 'no' ? "white" : "#e05c2a",
            borderRadius: "10px",
            cursor: voted ? "default" : "pointer",
            fontWeight: "700",
            fontSize: "14px",
            opacity: voted && voted !== 'no' ? 0.3 : 1,
            transition: "all 0.2s"
          }}>
            {voted === 'no' ? '✓ NO' : 'NO'}
          </button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#555", fontSize: "12px" }}>
          {formatVolume(market.volume)} volume
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {voted && (
            <span style={{ color: "#ffd700", fontSize: "12px" }}>
              ✓ {voted.toUpperCase()}
            </span>
          )}
          <button onClick={shareOnWhatsApp} style={{
            background: "#25D366",
            border: "none",
            color: "white",
            padding: "6px 12px",
            borderRadius: "20px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            Share
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
      choice,
      amount,
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
    <div style={{ background: "#0f0f23", minHeight: "100vh" }}>
      <div style={{
        position: "sticky",
        top: 0,
        background: "rgba(15,15,35,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #1a1a3a",
        padding: "14px 16px 0",
        zIndex: 100
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "20px" }}>🏏</span>
            <div>
              <h1 style={{ color: "white", fontSize: "18px", fontWeight: "700", lineHeight: 1 }}>
                SouthPredict
              </h1>
              <p style={{ color: "#555", fontSize: "11px", marginTop: "2px" }}>
                Prediction markets for South India
              </p>
            </div>
          </div>

          <div style={{
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            paddingBottom: "12px",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: filter === cat ? "white" : "#2a2a4a",
                background: filter === cat ? "white" : "transparent",
                color: filter === cat ? "#0f0f23" : "#666",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: filter === cat ? "700" : "400",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all 0.2s"
              }}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ color: "#555", fontSize: "14px" }}>Loading markets...</div>
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