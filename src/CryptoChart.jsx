import { useEffect, useRef, useState } from 'react'

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
  const now = Math.floor(Date.now() / 1000)
  const intervalSeconds = minutesPerCandle * 60
  for (let i = count; i >= 0; i--) {
    const time = now - (i * intervalSeconds)
    const open = price
    const volatility = basePrice * 0.005
    const change = (Math.random() - 0.49) * volatility
    const close = Math.max(open * 0.97, open + change)
    const high = Math.max(open, close) + Math.random() * volatility * 0.3
    const low = Math.min(open, close) - Math.random() * volatility * 0.3
    candles.push({
      time,
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
  const chartInstanceRef = useRef(null)
  const [selectedTF, setSelectedTF] = useState(TIMEFRAMES[2])
  const [currentPrice, setCurrentPrice] = useState(basePrice)
  const [status, setStatus] = useState('loading')

  const border = darkMode ? '#2a2a4a' : '#e8e8e8'
  const textSecondary = darkMode ? '#666' : '#aaa'
  const chartBg = darkMode ? '#1a1a2e' : '#ffffff'

  useEffect(function() {
    let cancelled = false

    async function buildChart() {
      setStatus('loading')
      if (!containerRef.current) return

      try {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.remove()
          chartInstanceRef.current = null
        }
        containerRef.current.innerHTML = ''

        const mod = await import('lightweight-charts')
        const createChart = mod.createChart || mod.default?.createChart
        if (!createChart) throw new Error('createChart not found')
        if (cancelled || !containerRef.current) return

        const w = containerRef.current.clientWidth || 400

        const chart = createChart(containerRef.current, {
          width: w,
          height: 200,
          layout: {
            background: { color: chartBg },
            textColor: textSecondary,
            fontSize: 10
          },
          grid: {
            vertLines: { color: darkMode ? '#1e1e3a' : '#f0f0f0' },
            horzLines: { color: darkMode ? '#1e1e3a' : '#f0f0f0' }
          },
          rightPriceScale: {
            borderVisible: false,
            textColor: textSecondary,
            scaleMargins: { top: 0.1, bottom: 0.1 }
          },
          timeScale: {
            borderVisible: false,
            textColor: textSecondary,
            timeVisible: true,
            secondsVisible: false
          },
          handleScroll: false,
          handleScale: false,
          crosshair: { mode: 1 }
        })

        chartInstanceRef.current = chart

        const series = chart.addCandlestickSeries({
          upColor: '#00C087',
          downColor: '#FF4D4D',
          borderUpColor: '#00C087',
          borderDownColor: '#FF4D4D',
          wickUpColor: '#00C087',
          wickDownColor: '#FF4D4D'
        })

        const count = selectedTF.minutes <= 15 ? 80 : selectedTF.minutes <= 60 ? 60 : selectedTF.minutes <= 240 ? 42 : 30
        const candles = generateCandles(basePrice || 100, count, selectedTF.minutes)
        series.setData(candles)

        const last = candles[candles.length - 1]
        if (!cancelled) setCurrentPrice(last.close)

        chart.timeScale().fitContent()

        chart.subscribeCrosshairMove(function(param) {
          if (!cancelled && param.seriesData) {
            const d = param.seriesData.get(series)
            if (d && d.close) setCurrentPrice(d.close)
          }
        })

        if (!cancelled) setStatus('ready')

      } catch (err) {
        console.error('Chart error:', err)
        if (!cancelled) setStatus('error')
      }
    }

    buildChart()

    return function() {
      cancelled = true
      if (chartInstanceRef.current) {
        try { chartInstanceRef.current.remove() } catch (e) {}
        chartInstanceRef.current = null
      }
    }
  }, [selectedTF, darkMode, basePrice])

  useEffect(function() {
    function handleResize() {
      if (chartInstanceRef.current && containerRef.current) {
        chartInstanceRef.current.applyOptions({
          width: containerRef.current.clientWidth
        })
      }
    }
    window.addEventListener('resize', handleResize)
    return function() { window.removeEventListener('resize', handleResize) }
  }, [])

  return (
    <div style={{ marginTop: '8px', marginBottom: '12px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: color || '#F7931A', fontSize: '13px', fontWeight: '700' }}>
            {symbol}/USD
          </span>
          <span style={{ color: color || '#F7931A', fontSize: '12px', fontWeight: '600' }}>
            ${currentPrice
              ? currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : '...'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
          {TIMEFRAMES.map(function(tf) {
            return (
              <button key={tf.label} onClick={function() { setSelectedTF(tf) }} style={{
                padding: '3px 7px', borderRadius: '4px', border: 'none',
                background: selectedTF.label === tf.label
                  ? (color || '#F7931A')
                  : (darkMode ? '#2a2a4a' : '#f0f0f0'),
                color: selectedTF.label === tf.label ? 'white' : textSecondary,
                cursor: 'pointer', fontSize: '10px', fontWeight: '700',
                transition: 'all 0.15s'
              }}>{tf.label}</button>
            )
          })}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {status === 'loading' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: chartBg, borderRadius: '8px', zIndex: 1,
            border: '1px solid ' + border
          }}>
            <span style={{ color: textSecondary, fontSize: '12px' }}>Loading chart...</span>
          </div>
        )}
        {status === 'error' && (
          <div style={{
            height: '200px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: chartBg, borderRadius: '8px',
            border: '1px solid ' + border
          }}>
            <span style={{ color: textSecondary, fontSize: '12px' }}>Chart unavailable</span>
          </div>
        )}
        <div
          ref={containerRef}
          style={{
            width: '100%', height: '200px',
            borderRadius: '8px', overflow: 'hidden',
            border: '1px solid ' + border,
            visibility: status === 'error' ? 'hidden' : 'visible'
          }}
        />
      </div>
    </div>
  )
}

export default CryptoChart