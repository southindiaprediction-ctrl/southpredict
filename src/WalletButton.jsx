import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { connectWallet, switchToPolygon } from './wallet'

const USDT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
]

function WalletButton() {
  const [address, setAddress] = useState(null)
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(function() {
    checkExistingConnection()
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', function() { window.location.reload() })
    }
    return function() {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  async function checkExistingConnection() {
    try {
      if (!window.ethereum) return
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        fetchUSDTBalance(accounts[0])
      }
    } catch (err) {
      console.error(err)
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      setAddress(null)
      setBalance(null)
    } else {
      setAddress(accounts[0])
      fetchUSDTBalance(accounts[0])
    }
  }

  async function fetchUSDTBalance(addr) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider)
      const bal = await usdt.balanceOf(addr)
      const decimals = await usdt.decimals()
      setBalance(parseFloat(ethers.formatUnits(bal, decimals)).toFixed(2))
    } catch (err) {
      console.error('USDT balance error:', err)
      setBalance('0.00')
    }
  }

  async function handleConnect() {
    setLoading(true)
    try {
      const wallet = await connectWallet()
      if (wallet) {
        setAddress(wallet.address)
        await fetchUSDTBalance(wallet.address)
      }
    } catch (err) {
      console.error(err)
      alert('Connection failed: ' + (err.message || 'Unknown error'))
    }
    setLoading(false)
  }

  async function handleDisconnect() {
    setAddress(null)
    setBalance(null)
    setShowMenu(false)
    window.ethereum.selectedAddress = null
  }

  async function handleSwitchNetwork() {
    try {
      await switchToPolygon()
      setShowMenu(false)
    } catch (err) {
      console.error(err)
    }
  }

  function shortAddress(addr) {
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  function copyAddress() {
    navigator.clipboard.writeText(address)
    setShowMenu(false)
  }

  if (address) {
    return (
      <div style={{ position: 'relative' }}>
        <button onClick={function() { setShowMenu(!showMenu) }} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#1a1a2e', border: '1px solid #2a2a4a',
          borderRadius: '20px', padding: '6px 12px', cursor: 'pointer'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00C087' }} />
          <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>
            {shortAddress(address)}
          </span>
          {balance !== null && (
            <span style={{ color: '#26A17B', fontSize: '12px', fontWeight: '700' }}>
              ${balance} USDT
            </span>
          )}
          <span style={{ color: '#888', fontSize: '10px' }}>▼</span>
        </button>

        {showMenu && (
          <div style={{
            position: 'absolute', top: '40px', right: '0',
            background: '#1a1a2e', border: '1px solid #2a2a4a',
            borderRadius: '12px', padding: '8px', minWidth: '180px',
            zIndex: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ padding: '6px 8px', marginBottom: '4px' }}>
              <p style={{ color: '#888', fontSize: '10px', margin: '0 0 2px' }}>Connected wallet</p>
              <p style={{ color: 'white', fontSize: '11px', margin: 0, fontFamily: 'monospace' }}>
                {shortAddress(address)}
              </p>
            </div>
            <div style={{ height: '1px', background: '#2a2a4a', margin: '6px 0' }} />
            <button onClick={copyAddress} style={{
              width: '100%', padding: '8px', background: 'transparent',
              border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px',
              textAlign: 'left', borderRadius: '6px', display: 'flex', gap: '8px'
            }}>
              📋 Copy Address
            </button>
            <button onClick={handleSwitchNetwork} style={{
              width: '100%', padding: '8px', background: 'transparent',
              border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px',
              textAlign: 'left', borderRadius: '6px', display: 'flex', gap: '8px'
            }}>
              🔄 Switch to Polygon
            </button>
            <button onClick={function() { fetchUSDTBalance(address) }} style={{
              width: '100%', padding: '8px', background: 'transparent',
              border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px',
              textAlign: 'left', borderRadius: '6px', display: 'flex', gap: '8px'
            }}>
              💰 Refresh Balance
            </button>
            <div style={{ height: '1px', background: '#2a2a4a', margin: '6px 0' }} />
            <button onClick={handleDisconnect} style={{
              width: '100%', padding: '8px', background: 'rgba(255,77,77,0.1)',
              border: 'none', color: '#FF4D4D', cursor: 'pointer', fontSize: '12px',
              textAlign: 'left', borderRadius: '6px', fontWeight: '600',
              display: 'flex', gap: '8px'
            }}>
              🔌 Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button onClick={handleConnect} disabled={loading} style={{
      background: 'linear-gradient(135deg, #8247e5, #6c35c9)',
      border: 'none', color: 'white', padding: '7px 14px',
      borderRadius: '20px', cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: '12px', fontWeight: '700',
      display: 'flex', alignItems: 'center', gap: '6px',
      opacity: loading ? 0.7 : 1
    }}>
      🦊 {loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}

export default WalletButton