import { useState } from 'react'
import { connectWallet, getUSDCBalance } from './wallet'

function WalletButton() {
  const [address, setAddress] = useState(null)
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleConnect() {
    setLoading(true)
    try {
      const wallet = await connectWallet()
      if (wallet) {
        setAddress(wallet.address)
        const bal = await getUSDCBalance(wallet.address)
        setBalance(parseFloat(bal).toFixed(2))
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  function shortAddress(addr) {
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  if (address) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#1a1a2e",
        border: "1px solid #2a2a4a",
        borderRadius: "20px",
        padding: "6px 12px"
      }}>
        <div style={{
          width: "8px", height: "8px",
          borderRadius: "50%",
          background: "#1a9e5c"
        }} />
        <span style={{ color: "white", fontSize: "12px", fontWeight: "600" }}>
          {shortAddress(address)}
        </span>
        <span style={{ color: "#ffd700", fontSize: "12px", fontWeight: "700" }}>
          ${balance} USDC
        </span>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      style={{
        background: "linear-gradient(135deg, #8247e5, #6c35c9)",
        border: "none",
        color: "white",
        padding: "7px 14px",
        borderRadius: "20px",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: "12px",
        fontWeight: "700",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}>
      {loading ? 'Connecting...' : '🦊 Connect Wallet'}
    </button>
  )
}

export default WalletButton