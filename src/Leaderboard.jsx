import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total_bets: 0, total_users: 0, total_volume: 0 })

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    setLoading(true)
    const { data: bets } = await supabase
      .from('bets')
      .select('*')
      .not('user_id', 'is', null)

    if (bets && bets.length > 0) {
      const userMap = {}
      bets.forEach(bet => {
        if (!bet.user_id) return
        if (!userMap[bet.user_id]) {
          userMap[bet.user_id] = {
            user_id: bet.user_id,
            user_name: bet.user_name || 'Anonymous',
            user_avatar: bet.user_avatar,
            total_bets: 0,
            total_amount: 0,
          }
        }
        userMap[bet.user_id].total_bets += 1
        userMap[bet.user_id].total_amount += bet.amount
      })

      const leadersList = Object.values(userMap)
        .sort((a, b) => b.total_amount - a.total_amount)

      setLeaders(leadersList)
      setStats({
        total_bets: bets.length,
        total_users: leadersList.length,
        total_volume: bets.reduce((sum, b) => sum + b.amount, 0)
      })
    }
    setLoading(false)
  }

  function formatVolume(amount) {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount}`
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ background: "#0f0f23", minHeight: "100vh" }}>
      <div style={{
        position: "sticky", top: 0,
        background: "rgba(15,15,35,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #1a1a3a",
        padding: "14px 16px",
        zIndex: 100
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🏆</span>
            <div>
              <h1 style={{ color: "white", fontSize: "18px", fontWeight: "700", lineHeight: 1 }}>Leaderboard</h1>
              <p style={{ color: "#555", fontSize: "11px", marginTop: "2px" }}>Top predictors on SouthPredict</p>
            </div>
          </div>
          <a href="/" style={{ color: "#1a9e5c", fontSize: "13px", textDecoration: "none" }}>← Markets</a>
        </div>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px" }}>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "Total Bets", value: stats.total_bets },
            { label: "Players", value: stats.total_users },
            { label: "Volume", value: formatVolume(stats.total_volume) }
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1,
              background: "#1a1a2e",
              border: "1px solid #2a2a4a",
              borderRadius: "12px",
              padding: "12px",
              textAlign: "center"
            }}>
              <p style={{ color: "white", fontSize: "18px", fontWeight: "700", margin: "0 0 4px" }}>{stat.value}</p>
              <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#555" }}>Loading leaderboard...</div>
        ) : leaders.length === 0 ? (
          <div style={{
            background: "#1a1a2e",
            border: "1px solid #2a2a4a",
            borderRadius: "16px",
            padding: "40px",
            textAlign: "center"
          }}>
            <p style={{ fontSize: "32px", marginBottom: "12px" }}>🏆</p>
            <p style={{ color: "white", fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>No players yet</p>
            <p style={{ color: "#555", fontSize: "13px" }}>Sign in and place bets to appear here</p>
            <a href="/" style={{
              display: "inline-block",
              marginTop: "16px",
              background: "#1a9e5c",
              color: "white",
              padding: "10px 20px",
              borderRadius: "20px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "700"
            }}>Start Predicting</a>
          </div>
        ) : (
          leaders.map((leader, index) => (
            <div key={leader.user_id} style={{
              background: index === 0 ? "rgba(255,215,0,0.05)" : "#1a1a2e",
              border: `1px solid ${index === 0 ? 'rgba(255,215,0,0.3)' : '#2a2a4a'}`,
              borderRadius: "14px",
              padding: "14px 16px",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span style={{ fontSize: "20px", minWidth: "28px", textAlign: "center" }}>
                {index < 3 ? medals[index] : `#${index + 1}`}
              </span>

              {leader.user_avatar ? (
                <img src={leader.user_avatar} style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  border: index === 0 ? "2px solid gold" : "none"
                }} />
              ) : (
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "#2a2a4a", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "14px", fontWeight: "700"
                }}>
                  {leader.user_name?.charAt(0) || '?'}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <p style={{ color: "white", fontSize: "14px", fontWeight: "600", margin: "0 0 2px" }}>
                  {leader.user_name}
                </p>
                <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
                  {leader.total_bets} bets
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <p style={{ color: "#ffd700", fontSize: "14px", fontWeight: "700", margin: "0 0 2px" }}>
                  {formatVolume(leader.total_amount)}
                </p>
                <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>volume</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Leaderboard