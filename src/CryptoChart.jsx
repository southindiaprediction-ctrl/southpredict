import { useState, useEffect, useMemo, useRef } from 'react'

const TIMEFRAMES = [
  { label: '5M', interval: '5m', limit: 60 },
  { label: '15M', interval: '15m', limit: 60 },
  { label: '1H', interval: '1h', limit: 48 },
  { label: '4H', interval: '4h', limit: 42 },
  { label: '1D', interval: '1d', limit: 30 }
]

const SYMBOL_MAP = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  SOL: 'SOLUSDT',
  BNB: 'BNBUSDT',
  XRP: 'XRPUSDT'
}

function formatTime(ts, interval) {
  const d = new Date(ts)
  if (interval === '1d') return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatPrice(price) {
  if (!price && price !== 0) return '...'
  if (price >= 1000) return '$' + Math.round(price).toLocaleString()
  if (price >= 1) return '$' + parseFloat(price).toFixed(3)
  return '$' + parseFloat(price).toFixed(5)
}

function CryptoChart({ darkMode, basePrice, symbol, color }) {
  const [selectedTF, setSelectedTF] = useState(TIMEFRAMES[2])
  const [candles, setCandles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [hoveredCandle, setHoveredCandle] = useState(null)

  const border = darkMode ? '#2a2a4a' : '#e8e8e8'
  const textSecondary = darkMode ? '#666' : '#aaa'
  const chartBg = darkMode ? '#1a1a2e' : '#ffffff'
  const gridColor = darkMode ? '#1e1e3a' : '#f5f5f5'
  const coinColor = color || '#F7931A'
  const binanceSymbol = SYMBOL_MAP[symbol] || 'BTCUSDT'

  useEffect(function() {
    fetchCandles()
  }, [selectedTF, symbol])

  async function fetchCandles() {
    setLoading(true)
    setError(false)
    setHoveredCandle(null)
    try {
      const url = 'https://api.binance.com/api/v3/klines?symbol=' + binanceSymbol +
        '&interval=' + selectedTF.interval + '&limit=' + selectedTF.limit
      const res = await fetch(url)
      if (!res.ok) throw new Error('Binance error')
      const data = await res.json()
      const parsed = data.map(function(k) {
        return {
          time: k[0],
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5])
        }
      })
      setCandles(parsed)
    } catch (e) {
      console.error(e)
      setError(true)
    }
    setLoading(false)
  }

  const currentPrice = hoveredCandle ? hoveredCandle.close : (candles.length > 0 ? candles[candles.length - 1].close : basePrice)
  const firstPrice = candles.length > 0 ? candles[0].open : basePrice
  const priceChange = firstPrice ? ((currentPrice - firstPrice) / firstPrice * 100) : 0
  const isUp = priceChange >= 0

  const W = 520
  const H = 200
  const padL = 80
  const padR = 8
  const padT = 12
  const padB = 28
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const allHighs = candles.map(function(c) { return c.high })
  const allLows = candles.map(function(c) { return c.low })
  const minP = candles.length > 0 ? Math.min.apply(null, allLows) * 0.9998 : 0
  const maxP = candles.length > 0 ? Math.max.apply(null, allHighs) * 1.0002 : 1
  const priceRange = maxP - minP || 1

  function toY(price) {
    return padT + chartH - ((price - minP) / priceRange) * chartH
  }

  const candleWidth = Math.max(2, (chartW / Math.max(candles.length, 1)) * 0.7)
  const spacing = chartW / Math.max(candles.length, 1)

  const gridLines = 4
  const gridPrices = []
  for (let i = 0; i <= gridLines; i++) {
    gridPrices.push(minP + (priceRange * i / gridLines))
  }

  const xLabels = []
  const step = Math.floor(candles.length / 5)
  for (let i = 0; i < candles.length; i += Math.max(step, 1)) {
    xLabels.push({ i, label: formatTime(candles[i].time, selectedTF.interval) })
  }

  return (
    <div style={{ marginTop: '8px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: coinColor, fontSize: '13px', fontWeight: '700' }}>
            {symbol}/USDT
          </span>
          <span style={{ color: coinColor, fontSize: '13px', fontWeight: '800' }}>
            {formatPrice(currentPrice)}
          </span>
          {!loading && candles.length > 0 && (
            <span style={{ color: isUp ? '#00C087' : '#FF4D4D', fontSize: '11px', fontWeight: '600' }}>
              {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
          {TIMEFRAMES.map(function(tf) {
            return (
              <button key={tf.label} onClick={function() { setSelectedTF(tf) }} style={{
                padding: '3px 7px', borderRadius: '4px', border: 'none',
                background: selectedTF.label === tf.label ? coinColor : (darkMode ? '#2a2a4a' : '#f0f0f0'),
                color: selectedTF.label === tf.label ? 'white' : textSecondary,
                cursor: 'pointer', fontSize: '10px', fontWeight: '700',
                transition: 'all 0.15s'
              }}>{tf.label}</button>
            )
          })}
        </div>
      </div>

      {hoveredCandle && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '6px', fontSize: '10px', color: textSecondary }}>
          <span style={{ color: textSecondary }}>{formatTime(hoveredCandle.time, selectedTF.interval)}</span>
          <span>O <strong style={{ color: hoveredCandle.open >= hoveredCandle.close ? '#FF4D4D' : '#00C087' }}>
            {formatPrice(hoveredCandle.open)}
          </strong></span>
          <span>H <strong style={{ color: '#00C087' }}>{formatPrice(hoveredCandle.high)}</strong></span>
          <span>L <strong style={{ color: '#FF4D4D' }}>{formatPrice(hoveredCandle.low)}</strong></span>
          <span>C <strong style={{ color: hoveredCandle.close >= hoveredCandle.open ? '#00C087' : '#FF4D4D' }}>
            {formatPrice(hoveredCandle.close)}
          </strong></span>
        </div>
      )}

      <div style={{ background: chartBg, border: '1px solid ' + border, borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: chartBg, zIndex: 2, borderRadius: '8px'
          }}>
            <span style={{ color: textSecondary, fontSize: '12px' }}>Loading {symbol}/USDT...</span>
          </div>
        )}
        {error && !loading && (
          <div style={{
            height: '200px', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: textSecondary, fontSize: '12px' }}>Chart unavailable</span>
          </div>
        )}
        {!error && !loading && candles.length > 0 && (
          <svg
            viewBox={'0 0 ' + W + ' ' + H}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            onMouseLeave={function() { setHoveredCandle(null) }}
          >
            {gridPrices.map(function(p, i) {
              const y = toY(p)
              return (
                <g key={i}>
                  <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={gridColor} strokeWidth="0.5" />
                  <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="7" fill={textSecondary}>
                    {formatPrice(p)}
                  </text>
                </g>
              )
            })}

            {xLabels.map(function(xl) {
              const x = padL + (xl.i + 0.5) * spacing
              return (
                <text key={xl.i} x={x} y={H - 6} textAnchor="middle" fontSize="7" fill={textSecondary}>
                  {xl.label}
                </text>
              )
            })}

            {candles.map(function(c, i) {
              const x = padL + (i + 0.5) * spacing
              const isGreen = c.close >= c.open
              const candleColor = isGreen ? '#00C087' : '#FF4D4D'
              const bodyTop = toY(Math.max(c.open, c.close))
              const bodyBot = toY(Math.min(c.open, c.close))
              const bodyH = Math.max(1, bodyBot - bodyTop)
              const wickTop = toY(c.high)
              const wickBot = toY(c.low)
              const isHovered = hoveredCandle === c

              return (
                <g key={i} onMouseEnter={function() { setHoveredCandle(c) }} style={{ cursor: 'crosshair' }}>
                  {isHovered && (
                    <rect x={x - spacing / 2} y={padT} width={spacing} height={chartH}
                      fill={coinColor} fillOpacity="0.05" />
                  )}
                  <line x1={x} y1={wickTop} x2={x} y2={bodyTop} stroke={candleColor} strokeWidth="1" />
                  <line x1={x} y1={bodyBot} x2={x} y2={wickBot} stroke={candleColor} strokeWidth="1" />
                  <rect
                    x={x - candleWidth / 2} y={bodyTop}
                    width={candleWidth} height={bodyH}
                    fill={isGreen ? '#00C087' : '#FF4D4D'}
                    fillOpacity={isGreen ? 0.9 : 1}
                    stroke={candleColor} strokeWidth="0.5"
                    rx="0.5"
                  />
                </g>
              )
            })}

            {candles.length > 0 && (function() {
              const lastClose = candles[candles.length - 1].close
              const y = toY(lastClose)
              const lastIsGreen = candles[candles.length - 1].close >= candles[candles.length - 1].open
              return (
                <g>
                  <line x1={padL} y1={y} x2={W - padR} y2={y}
                    stroke={lastIsGreen ? '#00C087' : '#FF4D4D'}
                    strokeWidth="0.5" strokeDasharray="4,2" opacity="0.7" />
                </g>
              )
            })()}

            {hoveredCandle && (function() {
              const idx = candles.indexOf(hoveredCandle)
              const x = padL + (idx + 0.5) * spacing
              const y = toY(hoveredCandle.close)
              return (
                <g>
                  <line x1={x} y1={padT} x2={x} y2={H - padB}
                    stroke={coinColor} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.6" />
                  <line x1={padL} y1={y} x2={W - padR} y2={y}
                    stroke={coinColor} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.6" />
                </g>
              )
            })()}
          </svg>
        )}
      </div>
    </div>
  )
}

export default CryptoChart