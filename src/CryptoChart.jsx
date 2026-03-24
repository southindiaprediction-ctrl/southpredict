import { useState, useMemo } from 'react'

const TIMEFRAMES = [
  { label: '5M', minutes: 5 },
  { label: '15M', minutes: 15 },
  { label: '1H', minutes: 60 },
  { label: '4H', minutes: 240 },
  { label: '1D', minutes: 1440 }
]

function generateCandles(basePrice, count, minutesPerCandle) {
  const candles = []
  let price = basePrice || 100
  const now = Date.now()
  const intervalMs = minutesPerCandle * 60 * 1000
  for (let i = count; i >= 0; i--) {
    const time = new Date(now - (i * intervalMs))
    const open = price
    const volatility = basePrice * 0.005
    const change = (Math.random() - 0.49) * volatility
    const close = Math.max(open * 0.97, open + change)
    const high = Math.max(open, close) + Math.random() * volatility * 0.3
    const low = Math.min(open, close) - Math.random() * volatility * 0.3
    candles.push({ time, open, high, low, close })
    price = close
  }
  return candles
}

function formatTime(date, minutes) {
  if (minutes >= 1440) return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatPrice(price) {
  if (!price) return '$0'
  if (price >= 1000) return '$' + Math.round(price).toLocaleString()
  if (price >= 1) return '$' + price.toFixed(2)
  return '$' + price.toFixed(4)
}

function formatYAxis(price) {
  if (!price) return '$0'
  if (price >= 1000) return '$' + Math.round(price).toLocaleString()
  if (price >= 1) return '$' + price.toFixed(2)
  return '$' + price.toFixed(4)
}

function CryptoChart({ darkMode, basePrice, symbol, color }) {
  const [selectedTF, setSelectedTF] = useState(TIMEFRAMES[2])
  const [hoveredCandle, setHoveredCandle] = useState(null)

  const border = darkMode ? '#2a2a4a' : '#e8e8e8'
  const textSecondary = darkMode ? '#666' : '#aaa'
  const chartBg = darkMode ? '#1a1a2e' : '#ffffff'
  const gridColor = darkMode ? '#1e1e3a' : '#f5f5f5'
  const coinColor = color || '#F7931A'

  const candles = useMemo(function() {
    const count = selectedTF.minutes <= 15 ? 60 : selectedTF.minutes <= 60 ? 48 : selectedTF.minutes <= 240 ? 36 : 30
    return generateCandles(basePrice || 100, count, selectedTF.minutes)
  }, [selectedTF, basePrice])

  const currentPrice = hoveredCandle ? hoveredCandle.close : candles[candles.length - 1]?.close
  const firstPrice = candles[0]?.open
  const priceChange = firstPrice ? ((currentPrice - firstPrice) / firstPrice * 100) : 0
  const isUp = priceChange >= 0

  const W = 520
  const H = 180
  const padL = 70
  const padR = 8
  const padT = 12
  const padB = 28
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const allHighs = candles.map(function(c) { return c.high })
  const allLows = candles.map(function(c) { return c.low })
  const minP = Math.min.apply(null, allLows) * 0.9995
  const maxP = Math.max.apply(null, allHighs) * 1.0005
  const priceRange = maxP - minP

  function toY(price) {
    return padT + chartH - ((price - minP) / priceRange) * chartH
  }

  const candleWidth = Math.max(2, (chartW / candles.length) * 0.7)
  const spacing = chartW / candles.length

  const gridLines = 4
  const gridPrices = []
  for (let i = 0; i <= gridLines; i++) {
    gridPrices.push(minP + (priceRange * i / gridLines))
  }

  const xLabels = []
  const step = Math.floor(candles.length / 5)
  for (let i = 0; i < candles.length; i += step) {
    xLabels.push({ i, label: formatTime(candles[i].time, selectedTF.minutes) })
  }

  return (
    <div style={{ marginTop: '8px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: coinColor, fontSize: '13px', fontWeight: '700' }}>
            {symbol}/USD
          </span>
          <span style={{ color: coinColor, fontSize: '12px', fontWeight: '600' }}>
            {formatPrice(currentPrice || basePrice)}
          </span>
          <span style={{ color: isUp ? '#00C087' : '#FF4D4D', fontSize: '11px', fontWeight: '600' }}>
            {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
          </span>
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
        <div style={{ display: 'flex', gap: '12px', marginBottom: '6px', fontSize: '10px', color: textSecondary }}>
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

      <div style={{ background: chartBg, border: '1px solid ' + border, borderRadius: '8px', overflow: 'hidden' }}>
        <svg
          viewBox={'0 0 ' + W + ' ' + H}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={function() { setHoveredCandle(null) }}
        >
          {gridPrices.map(function(p, i) {
            const y = toY(p)
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={gridColor} strokeWidth="1" />
                <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="7.5" fill={textSecondary}>
                  {formatYAxis(p)}
                </text>
              </g>
            )
          })}

          {xLabels.map(function(xl) {
            const x = padL + (xl.i + 0.5) * spacing
            return (
              <text key={xl.i} x={x} y={H - 6} textAnchor="middle" fontSize="7.5" fill={textSecondary}>
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
                    fill={coinColor} fillOpacity="0.06" />
                )}
                <line x1={x} y1={wickTop} x2={x} y2={wickBot} stroke={candleColor} strokeWidth="1" />
                <rect x={x - candleWidth / 2} y={bodyTop} width={candleWidth} height={bodyH}
                  fill={candleColor} rx="0.5" />
              </g>
            )
          })}

          {hoveredCandle && (function() {
            const idx = candles.indexOf(hoveredCandle)
            const x = padL + (idx + 0.5) * spacing
            const y = toY(hoveredCandle.close)
            return (
              <g>
                <line x1={x} y1={padT} x2={x} y2={H - padB}
                  stroke={coinColor} strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
                <line x1={padL} y1={y} x2={W - padR} y2={y}
                  stroke={coinColor} strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
              </g>
            )
          })()}
        </svg>
      </div>
    </div>
  )
}

export default CryptoChart