import { useEffect, useRef, useState } from 'react'

const TIMEFRAMES = [
  { label: '5M', minutes: 5, days: 1 },
  { label: '15M', minutes: 15, days: 3 },
  { label: '1H', minutes: 60, days: 7 },
  { label: '4H', minutes: 240, days: 14 },
  { label: '1D', minutes: 1440, days: 30 }
]

function generateCandles(basePrice, count, minutesPerCandle) {
  const candles = []
  let price = basePrice || 100
  const now = Math.floor(Date.now() / 1000)
  const intervalSeconds = minutesPerCandle * 60

  for (let i = count; i >= 0; i--) {
    const time = now - (i * intervalSeconds)
    const open = price
    const volatility = basePrice * 0.006
    const change = (Math.random() - 0.49) * volatility
    const close = Math.max(open * 0.97, open + change)
    const high = Math.max(open, close) + Math.random() * volatility * 0.3
    const low = Math.min(open, close) - Math.random() * volatility * 0.3
    candles.push({
      time: time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2))
    })
    price = close
  }
  return candles
}

function CryptoChart({ darkMode, basePrice, symbol, color }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const [selectedTF, setSelectedTF] = useState(TIMEFRAMES[2])
  const [currentPrice, setCurrentPrice] = useState(basePrice)
  const [mounted, setMounted] = useState(false)

  const bg = darkMode ? '#0f0f23' : '#f7f7f7'
  const border = darkMode ? '#2a2a4a' : '#e8e8e8'
  const textSecondary = darkMode ? '#666' : '#aaa'
  const chartBg = darkMode ? '#1a1a2e' : '#ffffff'

  useEffect(function() {
    setMounted(true)
    return function() { setMounted(false) }
  }, [])

  useEffect(function() {
    if (!mounted) return
    initChart()
    return function() {
      if (chartRef.current) {
        try { chartRef.current.remove() } catch (e) {}
        chartRef.current = null
        seriesRef.current = null
      }
    }
  }, [mounted, selectedTF, darkMode, basePrice])

  async function initChart() {
    if (!containerRef.current) return
    try {
      const LW = await import('lightweight-charts')
      if (!containerRef.current) return

      if (chartRef.current) {
        try { chartRef.current.remove() } catch (e) {}
        chartRef.current = null
      }

      containerRef.current.innerHTML = ''

      const chart = LW.createChart(containerRef.current, {
        width: containerRef.current.clientWidth || 500,
        height: 200,
        layout: {
          background: { type: 'solid', color: chartBg },
          textColor: textSecondary,
          fontSize: 10
        },
        grid: {
          vertLines: { color: darkMode ? '#1e1e3a' : '#f0f0f0', style: 1 },
          horzLines: { color: darkMode ? '#1e1e3a' : '#f0f0f0', style: 1 }
        },
        crosshair: { mode: 1 },
        rightPriceScale: {
          borderVisible: false,
          textColor: textSecondary,
          scaleMargins: { top: 0.1, bottom: 0.1 }
        },
        timeScale: {
          borderVisible: false,
          textColor: textSecondary,
          timeVisible: true,
          secondsVisible: false,
          fixLeftEdge: true,
          fixRightEdge: true
        },
        handleScroll: false,
        handleScale: false
      })

      chartRef.current = chart

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#00C087',
        downColor: '#FF4D4D',
        borderUpColor: '#00C087',
        borderDownColor: '#FF4D4D',
        wickUpColor: '#00C087',
        wickDownColor: '#FF4D4D',
        borderVisible: true,
        wickVisible: true
      })

      seriesRef.current = candleSeries

      const count = selectedTF.minutes <= 15 ? 80 : selectedTF.minutes <= 60 ? 60 : selectedTF.minutes <= 240 ? 42 : 30
      const candles = generateCandles(basePrice || 100, count, selectedTF.minutes)
      candleSeries.setData(candles)

      const last = candles[candles.length - 1]
      setCurrentPrice(last.close)

      chart.timeScale().fitContent()

      chart.subscribeCrosshairMove(function(param) {
        if (param.seriesData && param.seriesData.get(candleSeries)) {
          const d = param.seriesData.get(candleSeries)
          if (d && d.close) setCurrentPrice(d.close)
        }
      })

    } catch (err) {
      console.error('Chart init error:', err)
    }
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: color || '#00C087', fontSize: '13px', fontWeight: '700' }}>
            {symbol}/USD
          </span>
          <span style={{ color: color || '#00C087', fontSize: '12px', fontWeight: '600' }}>
            ${currentPrice ? currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '...'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
          {TIMEFRAMES.map(function(tf) {
            return (
              <button key={tf.label} onClick={function() { setSelectedTF(tf) }} style={{
                padding: '3px 7px', borderRadius: '4px', border: 'none',
                background: selectedTF.label === tf.label ? (color || '#00C087') : (darkMode ? '#2a2a4a' : '#f0f0f0'),
                color: selectedTF.label === tf.label ? 'white' : textSecondary,
                cursor: 'pointer', fontSize: '10px', fontWeight: '700',
                transition: 'all 0.15s'
              }}>{tf.label}</button>
            )
          })}
        </div>
      </div>
      <div ref={containerRef} style={{
        width: '100%', height: '200px',
        borderRadius: '8px', overflow: 'hidden',
        border: '1px solid ' + border
      }} />
    </div>
  )
}

export default CryptoChart