import { useState } from 'react'

const initialMarkets = [
  {
    id: 1,
    question: "Will CSK win IPL 2026?",
    category: "Cricket",
    yesPercent: 67,
    volume: 24000,
    closes: "May 2026"
  },
  {
    id: 2,
    question: "Will DMK win more than 150 seats in TN 2026 elections?",
    category: "Politics",
    yesPercent: 54,
    volume: 18000,
    closes: "Apr 2026"
  },
  {
    id: 3,
    question: "Will Pushpa 3 gross over ₹1000cr opening weekend?",
    category: "Cinema",
    yesPercent: 41,
    volume: 8900,
    closes: "Dec 2026"
  },
  {
    id: 4,
    question: "Will Bengaluru get a new metro line by Dec 2026?",
    category: "Infrastructure",
    yesPercent: 72,
    volume: 11000,
    closes: "Dec 2026"
  },
  {
    id: 5,
    question: "Will Vijay's TVTV party contest all 234 TN seats?",
    category: "Politics",
    yesPercent: 38,
    volume: 32000,
    closes: "Mar 2026"
  }
]

const categoryColors = {
  Cricket: "#1a9e5c",
  Politics: "#e05c2a",
  Cinema: "#9b59b6",
  Infrastructure: "#2980b9"
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

  function confirmBet() {
    setVoted(showConfirm)
    onBet(market.id, showConfirm, betAmount)
    setShowConfirm(null)
  }

  return (
    <div style={{
      background: "#1a1a2e",
      border: "1px solid #2a2a4a",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      transition: "border-color 0.2s"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <span style={{
          background: categoryColors[market.category],
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
          <span style={{ color: "#1a9e5c", fontWeight: "bold" }}>YES {market.yesPercent}%</span>
          <span style={{ color: "#e05c2a", fontWeight: "bold" }}>NO {100 - market.yesPercent}%</span>
        </div>
        <div style={{ background: "#2a2a4a", borderRadius: "4px", height: "8px" }}>
          <div style={{
            width: `${market.yesPercent}%`,
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
              <button
                key={amt}
                onClick={() => setBetAmount(amt)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid",
                  borderColor: betAmount === amt ? "white" : "#444",
                  background: betAmount === amt ? "white" : "transparent",
                  color: betAmount === amt ? "#0f0f23" : "#888",
                  cursor: "pointer",
                  fontSize: "13px"
                }}>
                ₹{amt}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={confirmBet}
              style={{
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
            <button
              onClick={() => setShowConfirm(null)}
              style={{
                padding: "10px 16px",
                background: "transparent",
                border: "1px solid #444",
                color: "#888",
                borderRadius: "8px",
                cursor: "pointer"
              }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showConfirm && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <button
            onClick={() => handleVote('yes')}
            disabled={!!voted}
            style={{
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
          <button
            onClick={() => handleVote('no')}
            disabled={!!voted}
            style={{
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

      <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "12px" }}>
        <span>Volume: {formatVolume(market.volume)}</span>
        {voted && <span style={{ color: "#ffd700" }}>✓ You bet {voted.toUpperCase()}</span>}
      </div>
    </div>
  )
}

function App() {
  const [markets, setMarkets] = useState(initialMarkets)
  const [filter, setFilter] = useState("All")

  const categories = ["All", "Cricket", "Politics", "Cinema", "Infrastructure"]

  function handleBet(marketId, choice, amount) {
    setMarkets(prev => prev.map(m => {
      if (m.id !== marketId) return m
      const impact = Math.min(3, amount / 100)
      const newYes = choice === 'yes'
        ? Math.min(97, m.yesPercent + impact)
        : Math.max(3, m.yesPercent - impact)
      return {
        ...m,
        yesPercent: Math.round(newYes),
        volume: m.volume + amount
      }
    }))
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
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: filter === cat ? "white" : "#444",
                background: filter === cat ? "white" : "transparent",
                color: filter === cat ? "#0f0f23" : "#888",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: filter === cat ? "bold" : "normal"
              }}>
              {cat}
            </button>
          ))}
        </div>

        {filtered.map(market => (
          <MarketCard key={market.id} market={market} onBet={handleBet} />
        ))}

      </div>
    </div>
  )
}

export default App