import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import WalletButton from './WalletButton'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CryptoChart from './CryptoChart'

const categoryColors = {
  Cricket: "#00C2FF",
  Politics: "#FF6B6B",
  Cinema: "#B24BF3",
  Infrastructure: "#FFB347",
  Health: "#FF6B6B",
  Weather: "#00C2FF",
  Crypto: "#F7931A"
}

const categoryEmojis = {
  Cricket: "🏏",
  Politics: "🗳️",
  Cinema: "🎬",
  Infrastructure: "🏗️",
  Health: "🏥",
  Weather: "🌤️",
  Crypto: "₿"
}

const cryptoBasePrice = {
  'BTC': 70000,
  'ETH': 2100,
  'SOL': 90,
  'POL': 0.09
}

const cryptoColor = {
  'BTC': '#F7931A',
  'ETH': '#627EEA',
  'SOL': '#9945FF',
  'POL': '#8247E5'
}

function getCryptoSymbol(question) {
  if (question.includes('BTC') || question.toLowerCase().includes('bitcoin')) return 'BTC'
  if (question.includes('ETH') || question.toLowerCase().includes('ethereum')) return 'ETH'
  if (question.includes('SOL') || question.toLowerCase().includes('solana')) return 'SOL'
  if (question.includes('POL') || question.toLowerCase().includes('polygon') || question.toLowerCase().includes('matic')) return 'POL'
  return 'BTC'
}

function formatVolume(amount) {
  if (!amount) return '₹0'
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L'
  if (amount >= 1000) return '₹' + (amount / 1000).toFixed(1) + 'K'
  return '₹' + amount
}

function timeAgo(dateStr) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return mins + 'm ago'
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return hrs + 'h ago'
    return Math.floor(hrs / 24) + 'd ago'
  } catch (e) { return '' }
}

function generateChartData(yesPercent) {
  try {
    const data = []
    let price = 50
    for (let i = 0; i < 20; i++) {
      price = price + (Math.random() - 0.48) * 4
      price = Math.max(5, Math.min(95, price))
      data.push({ t: i, v: Math.round(price) })
    }
    data.push({ t: 20, v: yesPercent || 50 })
    return data
  } catch (e) { return [{ t: 0, v: 50 }] }
}

function WeatherWidget({ darkMode }) {
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(false)
  const [activeCity, setActiveCity] = useState('Chennai')
  const cities = ['Chennai', 'Bangalore', 'Hyderabad', 'Kochi']

  useEffect(function() { fetchWeather(activeCity) }, [activeCity])

  async function fetchWeather(city) {
    setError(false)
    setWeather(null)
    try {
      const res = await fetch('https://wttr.in/' + city + '?format=j1')
      if (!res.ok) throw new Error('error')
      const data = await res.json()
      if (data && data.current_condition && data.current_condition[0]) {
        setWeather(data)
      } else { setError(true) }
    } catch (err) { setError(true) }
  }

  const border = darkMode ? '#2a2a4a' : '#e8e8e8'
  const bg = darkMode ? '#1a1a2e' : '#ffffff'
  const textPrimary = darkMode ? '#ffffff' : '#0d0d0d'
  const textSecondary = darkMode ? '#888' : '#888'

  return (
    <div style={{ background: bg, border: '1px solid ' + border, borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ color: textPrimary, fontSize: '13px', fontWeight: '700', margin: 0 }}>🌤️ Weather</h3>
        <div style={{ display: 'flex', gap: '3px' }}>
          {cities.map(function(city) {
            return (
              <button key={city} onClick={function() { setActiveCity(city) }} style={{
                padding: '3px 7px', borderRadius: '6px', border: 'none',
                background: activeCity === city ? '#00C087' : 'transparent',
                color: activeCity === city ? 'white' : textSecondary,
                cursor: 'pointer', fontSize: '10px', fontWeight: activeCity === city ? '700' : '400'
              }}>{city}</button>
            )
          })}
        </div>
      </div>
      {error ? (
        <p style={{ color: textSecondary, fontSize: '12px', margin: 0 }}>Weather unavailable</p>
      ) : !weather ? (
        <p style={{ color: textSecondary, fontSize: '12px', margin: 0 }}>Loading {activeCity}...</p>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <p style={{ color: textPrimary, fontSize: '28px', fontWeight: '800', margin: 0, lineHeight: 1 }}>
              {weather.current_condition[0].temp_C}°C
            </p>
            <p style={{ color: textSecondary, fontSize: '11px', margin: '4px 0 0' }}>
              {weather.current_condition[0].weatherDesc[0].value}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div>
              <p style={{ color: textSecondary, fontSize: '10px', margin: 0 }}>Humidity</p>
              <p style={{ color: textPrimary, fontSize: '12px', fontWeight: '600', margin: '2px 0 0' }}>
                {weather.current_condition[0].humidity}%
              </p>
            </div>
            <div>
              <p style={{ color: textSecondary, fontSize: '10px', margin: 0 }}>Wind</p>
              <p style={{ color: textPrimary, fontSize: '12px', fontWeight: '600', margin: '2px 0 0' }}>
                {weather.current_condition[0].windspeedKmph} km/h
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NewsSidebar({ darkMode }) {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('South India')
  const tabs = ['South India', 'Cricket', 'Cinema', 'Politics']
  const queries = {
    'South India': 'Tamil Nadu Karnataka Kerala Telangana',
    'Cricket': 'IPL cricket India',
    'Cinema': 'Tamil film Telugu cinema',
    'Politics': 'Tamil Nadu DMK election'
  }

  useEffect(function() { fetchNews(activeTab) }, [activeTab])

  async function fetchNews(tab) {
    setLoading(true)
    try {
      const query = encodeURIComponent(queries[tab])
      const res = await fetch('https://newsdata.io/api/1/news?apikey=pub_91dc0c56caca41de97305b08b0dc3c22&q=' + query + '&language=en&size=8')
      if (!res.ok) throw new Error('error')
      const data = await res.json()
      if (data && Array.isArray(data.results)) {
        setNews(data.results)
      } else { setNews([]) }
    } catch (err) { setNews([]) }
    setLoading(false)
  }

  const bg = darkMode ? '#1a1a2e' : '#ffffff'
  const border = darkMode ? '#2a2a4a' : '#e8e8e8'
  const textPrimary = darkMode ? '#ffffff' : '#0d0d0d'
  const textSecondary = darkMode ? '#888' : '#888'

  return (
    <div style={{ background: bg, border: '1px solid ' + border, borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 0', borderBottom: '1px solid ' + border }}>
        <h3 style={{ color: textPrimary, fontSize: '14px', fontWeight: '700', margin: '0 0 12px' }}>Latest News</h3>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {tabs.map(function(tab) {
            return (
              <button key={tab} onClick={function() { setActiveTab(tab) }} style={{
                padding: '5px 10px', borderRadius: '6px 6px 0 0', border: 'none',
                background: activeTab === tab ? (darkMode ? '#0f0f23' : '#f7f7f7') : 'transparent',
                color: activeTab === tab ? '#00C087' : textSecondary,
                cursor: 'pointer', fontSize: '11px',
                fontWeight: activeTab === tab ? '700' : '400', whiteSpace: 'nowrap'
              }}>{tab}</button>
            )
          })}
        </div>
      </div>
      <div style={{ padding: '12px', maxHeight: '500px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: textSecondary, fontSize: '13px' }}>Loading...</div>
        ) : news.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: textSecondary, fontSize: '13px' }}>No news found</div>
        ) : (
          news.map(function(item, i) {
            return (
              <div key={i} onClick={function() { window.open(item.link, '_blank') }} style={{
                padding: '10px 0',
                borderBottom: i < news.length - 1 ? '1px solid ' + border : 'none',
                cursor: 'pointer'
              }}>
                {item.image_url && (
                  <img src={item.image_url}
                    style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }}
                    onError={function(e) { e.target.style.display = 'none' }} />
                )}
                <p style={{ color: textPrimary, fontSize: '12px', fontWeight: '600', margin: '0 0 4px', lineHeight: '1.4' }}>
                  {item.title}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#00C087', fontSize: '10px', fontWeight: '600' }}>{item.source_id}</span>
                  <span style={{ color: textSecondary, fontSize: '10px' }}>{item.pubDate ? timeAgo(item.pubDate) : ''}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function MarketCard({ market, onBet, user, darkMode, isGrid }) {
  const [voted, setVoted] = useState(null)
  const [betAmount, setBetAmount] = useState(10)
  const [showConfirm, setShowConfirm] = useState(null)
  const [showChart, setShowChart] = useState(false)
  const [lineChartData] = useState(function() { return generateChartData(market.yes_percent || 50) })
  const [animating, setAnimating] = useState(false)

  const bg = darkMode ? '#1a1a2e' : '#ffffff'
  const border = darkMode ? '#2a2a4a' : '#e8e8e8'
  const textPrimary = darkMode ? '#ffffff' : '#0d0d0d'
  const textSecondary = darkMode ? '#888' : '#666'
  const inputBg = darkMode ? '#0f0f23' : '#f5f5f5'

  const isCrypto = market.category === 'Crypto'
  const cryptoSymbol = isCrypto ? getCryptoSymbol(market.question) : null
  const cryptoPrice = cryptoSymbol ? cryptoBasePrice[cryptoSymbol] : null
  const cryptoCol = cryptoSymbol ? cryptoColor[cryptoSymbol] : '#F7931A'

  const yesPool = market.yes_pool || (market.yes_percent * 100) || 5000
  const noPool = market.no_pool || ((100 - market.yes_percent) * 100) || 5000
  const totalPool = yesPool + noPool
  const yesPrice = Math.round((yesPool / totalPool) * 100)
  const noPrice = 100 - yesPrice
  const yesMultiplier = (100 / Math.max(yesPrice, 1)).toFixed(2)
  const noMultiplier = (100 / Math.max(noPrice, 1)).toFixed(2)

  function getNewPrice(choice, amount) {
    try {
      const newYesPool = choice === 'yes' ? yesPool + amount : yesPool
      const newNoPool = choice === 'no' ? noPool + amount : noPool
      const newTotal = newYesPool + newNoPool
      const newYes = Math.round((newYesPool / newTotal) * 100)
      return choice === 'yes' ? newYes : (100 - newYes)
    } catch (e) { return yesPrice }
  }

  function handleVote(choice) {
    if (!user) { alert('Please sign in to place a bet!'); return }
    if (voted || market.resolved) return
    setShowConfirm(choice)
  }

  async function confirmBet() {
    setAnimating(true)
    setVoted(showConfirm)
    await onBet(market.id, showConfirm, betAmount)
    setShowConfirm(null)
    setTimeout(function() { setAnimating(false) }, 600)
  }

  function shareOnWhatsApp() {
    const text = 'SouthPredict\n\n' + market.question + '\n\nYES ' + yesPrice + '% | NO ' + noPrice + '%\n\nBet now: https://southpredict-app.vercel.app'
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
  }

  return (
    <div style={{
      background: bg,
      border: '1px solid ' + (market.resolved
        ? (market.resolution === 'yes' ? 'rgba(0,192,135,0.4)' : 'rgba(255,77,77,0.4)')
        : border),
      borderRadius: '12px', padding: '16px',
      boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'all 0.2s ease',
      opacity: market.resolved ? 0.9 : 1,
      display: 'flex', flexDirection: 'column',
      marginBottom: isGrid ? '0' : '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{
          background: darkMode ? 'rgba(255,255,255,0.08)' : '#f0f0f0',
          color: categoryColors[market.category] || '#888',
          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'
        }}>
          {(categoryEmojis[market.category] || '') + ' ' + market.category}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {market.resolved && (
            <span style={{
              background: market.resolution === 'yes' ? 'rgba(0,192,135,0.2)' : 'rgba(255,77,77,0.2)',
              color: market.resolution === 'yes' ? '#00C087' : '#FF4D4D',
              padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700'
            }}>RESOLVED</span>
          )}
          <span style={{ color: textSecondary, fontSize: '11px' }}>{market.closes}</span>
        </div>
      </div>

      <h3 style={{ color: textPrimary, marginBottom: '12px', fontSize: '14px', lineHeight: '1.5', fontWeight: '600', flex: 1 }}>
        {market.question}
      </h3>

      {market.resolved && (
        <div style={{
          background: market.resolution === 'yes' ? 'rgba(0,192,135,0.12)' : 'rgba(255,77,77,0.12)',
          border: '1px solid ' + (market.resolution === 'yes' ? 'rgba(0,192,135,0.4)' : 'rgba(255,77,77,0.4)'),
          borderRadius: '8px', padding: '8px 12px', marginBottom: '12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ color: market.resolution === 'yes' ? '#00C087' : '#FF4D4D', fontWeight: '700', fontSize: '13px' }}>
            {market.resolution === 'yes' ? '✅ YES Won' : '❌ NO Won'}
          </span>
          {voted && (
            <span style={{ color: voted === market.resolution ? '#00C087' : '#FF4D4D', fontWeight: '700', fontSize: '12px' }}>
              {voted === market.resolution ? '🎉 You Won!' : '😔 You Lost'}
            </span>
          )}
        </div>
      )}

      {showChart && isCrypto && (
        <CryptoChart
          darkMode={darkMode}
          basePrice={cryptoPrice}
          symbol={cryptoSymbol}
          color={cryptoCol}
        />
      )}

      {showChart && !isCrypto && (
        <div style={{ marginBottom: '12px', height: '80px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData}>
              <Line type="monotone" dataKey="v" stroke="#00C087" strokeWidth={2} dot={false} />
              <XAxis dataKey="t" hide={true} />
              <YAxis domain={[0, 100]} hide={true} />
              <Tooltip
                formatter={function(value) { return [value + '¢', 'YES Price'] }}
                contentStyle={{
                  background: darkMode ? '#1a1a2e' : '#fff',
                  border: '1px solid ' + border,
                  borderRadius: '6px', fontSize: '11px'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#00C087', fontWeight: '700', fontSize: '12px' }}>Yes {yesPrice}%</span>
            <span style={{ color: '#FF4D4D', fontWeight: '700', fontSize: '12px' }}>No {noPrice}%</span>
          </div>
          <div style={{ background: darkMode ? '#2a2a4a' : '#eeeeee', borderRadius: '4px', height: '3px', overflow: 'hidden' }}>
            <div style={{
              width: yesPrice + '%',
              background: market.resolved
                ? (market.resolution === 'yes' ? '#00C087' : '#FF4D4D')
                : 'linear-gradient(90deg, #00C087, #00a876)',
              height: '3px', borderRadius: '4px',
              transition: animating ? 'width 0.6s ease' : 'width 0.3s ease'
            }} />
          </div>
        </div>
        <div style={{
          background: darkMode ? 'rgba(0,192,135,0.15)' : 'rgba(0,192,135,0.1)',
          border: '1px solid rgba(0,192,135,0.3)',
          borderRadius: '6px', padding: '4px 8px', textAlign: 'center', minWidth: '48px'
        }}>
          <p style={{ color: '#00C087', fontSize: '14px', fontWeight: '800', margin: 0, lineHeight: 1 }}>
            {market.resolved ? (market.resolution === 'yes' ? '100¢' : '0¢') : yesPrice + '¢'}
          </p>
          <p style={{ color: textSecondary, fontSize: '9px', margin: '1px 0 0' }}>YES</p>
        </div>
      </div>

      {showConfirm && !market.resolved && (
        <div style={{
          background: inputBg,
          border: '1px solid ' + (showConfirm === 'yes' ? 'rgba(0,192,135,0.4)' : 'rgba(255,77,77,0.4)'),
          borderRadius: '10px', padding: '12px', marginBottom: '10px'
        }}>
          <p style={{ color: textSecondary, margin: '0 0 4px', fontSize: '11px' }}>
            Buying <strong style={{ color: textPrimary }}>{showConfirm.toUpperCase()}</strong>
            {' · New price: '}
            <strong style={{ color: showConfirm === 'yes' ? '#00C087' : '#FF4D4D' }}>
              {getNewPrice(showConfirm, betAmount)}¢
            </strong>
          </p>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            {[10, 50, 100, 500].map(function(amt) {
              return (
                <button key={amt} onClick={function() { setBetAmount(amt) }} style={{
                  flex: 1, padding: '6px 2px', borderRadius: '6px', border: '1px solid',
                  borderColor: betAmount === amt ? (darkMode ? 'white' : '#0d0d0d') : border,
                  background: betAmount === amt ? (darkMode ? 'white' : '#0d0d0d') : 'transparent',
                  color: betAmount === amt ? (darkMode ? '#0d0d0d' : 'white') : textSecondary,
                  cursor: 'pointer', fontSize: '11px', fontWeight: betAmount === amt ? '700' : '400'
                }}>{'₹' + amt}</button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={confirmBet} style={{
              flex: 1, padding: '10px',
              background: showConfirm === 'yes' ? '#00C087' : '#FF4D4D',
              border: 'none', color: 'white', borderRadius: '8px',
              cursor: 'pointer', fontWeight: '700', fontSize: '13px'
            }}>
              {'Buy ' + showConfirm.toUpperCase() + ' · ₹' + betAmount}
            </button>
            <button onClick={function() { setShowConfirm(null) }} style={{
              padding: '10px 12px', background: 'transparent',
              border: '1px solid ' + border, color: textSecondary,
              borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
            }}>X</button>
          </div>
        </div>
      )}

      {!showConfirm && !market.resolved && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          <button onClick={function() { handleVote('yes') }} disabled={!!voted} style={{
            flex: 1, padding: '9px',
            background: voted === 'yes' ? '#00C087' : (darkMode ? 'rgba(0,192,135,0.1)' : 'rgba(0,192,135,0.08)'),
            border: '1px solid ' + (voted === 'yes' ? '#00C087' : 'rgba(0,192,135,0.3)'),
            color: voted === 'yes' ? 'white' : '#00C087',
            borderRadius: '8px', cursor: voted ? 'default' : 'pointer',
            fontWeight: '700', fontSize: '12px',
            opacity: voted && voted !== 'yes' ? 0.3 : 1, transition: 'all 0.15s'
          }}>
            {voted === 'yes' ? 'Bought Yes' : 'Buy Yes ' + yesMultiplier + 'x'}
          </button>
          <button onClick={function() { handleVote('no') }} disabled={!!voted} style={{
            flex: 1, padding: '9px',
            background: voted === 'no' ? '#FF4D4D' : (darkMode ? 'rgba(255,77,77,0.1)' : 'rgba(255,77,77,0.08)'),
            border: '1px solid ' + (voted === 'no' ? '#FF4D4D' : 'rgba(255,77,77,0.3)'),
            color: voted === 'no' ? 'white' : '#FF4D4D',
            borderRadius: '8px', cursor: voted ? 'default' : 'pointer',
            fontWeight: '700', fontSize: '12px',
            opacity: voted && voted !== 'no' ? 0.3 : 1, transition: 'all 0.15s'
          }}>
            {voted === 'no' ? 'Bought No' : 'Buy No ' + noMultiplier + 'x'}
          </button>
        </div>
      )}

      {market.resolved && !voted && (
        <div style={{
          padding: '8px', background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          borderRadius: '8px', marginBottom: '10px', textAlign: 'center'
        }}>
          <p style={{ color: textSecondary, fontSize: '12px', margin: 0 }}>Market resolved — no more bets</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: textSecondary, fontSize: '11px' }}>{formatVolume(market.volume)} vol.</span>
          {voted && !market.resolved && (
            <span style={{ color: '#FFB347', fontSize: '11px', fontWeight: '600' }}>{voted.toUpperCase()}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={function() { setShowChart(!showChart) }} style={{
            background: showChart ? (isCrypto ? cryptoCol + '22' : 'rgba(0,192,135,0.15)') : 'transparent',
            border: '1px solid ' + (showChart ? (isCrypto ? cryptoCol : '#00C087') : border),
            color: showChart ? (isCrypto ? cryptoCol : '#00C087') : textSecondary,
            padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px'
          }}>📈</button>
          <button onClick={shareOnWhatsApp} style={{
            background: 'transparent', border: '1px solid ' + border,
            color: textSecondary, padding: '3px 8px', borderRadius: '6px',
            cursor: 'pointer', fontSize: '11px'
          }}>Share</button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [markets, setMarkets] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [search, setSearch] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  const [showResolved, setShowResolved] = useState(false)

  const categories = ['All', 'Cricket', 'Politics', 'Cinema', 'Infrastructure', 'Health', 'Weather', 'Crypto']

  const bg = darkMode ? '#0f0f23' : '#f7f7f7'
  const headerBg = darkMode ? 'rgba(15,15,35,0.97)' : 'rgba(247,247,247,0.97)'
  const border = darkMode ? '#1a1a3a' : '#e8e8e8'
  const textPrimary = darkMode ? '#ffffff' : '#0d0d0d'
  const textSecondary = darkMode ? '#666' : '#888'
  const inputBg = darkMode ? '#1a1a2e' : '#ffffff'

  useEffect(function() {
    fetchMarkets()
    supabase.auth.getSession().then(function(result) {
      setUser(result.data.session ? result.data.session.user : null)
    })
    const authListener = supabase.auth.onAuthStateChange(function(_event, session) {
      setUser(session ? session.user : null)
    })
    function handleResize() { setIsMobile(window.innerWidth < 900) }
    window.addEventListener('resize', handleResize)
    return function() {
      authListener.data.subscription.unsubscribe()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  async function fetchMarkets() {
    setLoading(true)
    try {
      const result = await supabase.from('markets').select('*').order('volume', { ascending: false })
      if (!result.error && result.data) setMarkets(result.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleBet(marketId, choice, amount) {
    try {
      await supabase.from('bets').insert({
        market_id: marketId, choice, amount,
        user_session: user ? user.id : Math.random().toString(36).substr(2, 9),
        user_id: user ? user.id : null,
        user_name: user && user.user_metadata ? user.user_metadata.full_name : 'Anonymous',
        user_avatar: user && user.user_metadata ? user.user_metadata.avatar_url : null
      })
      const market = markets.find(function(m) { return m.id === marketId })
      const yesPool = market.yes_pool || (market.yes_percent * 100) || 5000
      const noPool = market.no_pool || ((100 - market.yes_percent) * 100) || 5000
      const newYesPool = choice === 'yes' ? yesPool + amount : yesPool
      const newNoPool = choice === 'no' ? noPool + amount : noPool
      const totalPool = newYesPool + newNoPool
      const newYesPercent = Math.round((newYesPool / totalPool) * 100)
      await supabase.from('markets').update({
        yes_pool: newYesPool, no_pool: newNoPool,
        yes_percent: newYesPercent, volume: (market.volume || 0) + amount
      }).eq('id', marketId)
      fetchMarkets()
    } catch (e) { console.error(e) }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://southpredict-app.vercel.app' }
    })
  }

  async function handleLogout() { await supabase.auth.signOut() }

  const activeMarkets = markets.filter(function(m) { return !m.resolved })
  const resolvedMarkets = markets.filter(function(m) { return m.resolved })

  const filtered = activeMarkets
    .filter(function(m) { return filter === 'All' || m.category === filter })
    .filter(function(m) { return m.question.toLowerCase().includes(search.toLowerCase()) })

  const filteredResolved = resolvedMarkets
    .filter(function(m) { return filter === 'All' || m.category === filter })
    .filter(function(m) { return m.question.toLowerCase().includes(search.toLowerCase()) })

  return (
    <div style={{ background: bg, minHeight: '100vh', transition: 'background 0.3s' }}>
      <div style={{
        position: 'sticky', top: 0, background: headerBg,
        backdropFilter: 'blur(12px)', borderBottom: '1px solid ' + border, zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🏏</span>
              <span style={{ color: textPrimary, fontSize: '17px', fontWeight: '800', letterSpacing: '-0.3px' }}>
                SouthPredict
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={function() { setDarkMode(!darkMode) }} style={{
                background: darkMode ? '#1a1a2e' : '#e8e8e8',
                border: '1px solid ' + border, color: textPrimary,
                width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{darkMode ? '☀️' : '🌙'}</button>
              <WalletButton />
              <a href="/leaderboard" style={{ color: '#FFB347', fontSize: '18px', textDecoration: 'none' }}>🏆</a>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={user.user_metadata ? user.user_metadata.avatar_url : ''}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #00C087' }} />
                  <button onClick={handleLogout} style={{
                    background: 'transparent', border: '1px solid ' + border,
                    color: textSecondary, padding: '4px 8px', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '11px'
                  }}>Out</button>
                </div>
              ) : (
                <button onClick={handleGoogleLogin} style={{
                  background: '#00C087', border: 'none', color: 'white',
                  padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '700'
                }}>Sign in</button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center',
              background: inputBg, border: '1px solid ' + border,
              borderRadius: '10px', padding: '8px 12px'
            }}>
              <span style={{ color: textSecondary, marginRight: '8px', fontSize: '14px' }}>🔍</span>
              <input type="text" placeholder="Search markets..." value={search}
                onChange={function(e) { setSearch(e.target.value) }}
                style={{
                  background: 'transparent', border: 'none',
                  color: textPrimary, fontSize: '13px', outline: 'none', width: '100%'
                }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', paddingTop: '10px' }}>
            {categories.map(function(cat) {
              return (
                <button key={cat} onClick={function() { setFilter(cat) }} style={{
                  padding: '5px 14px', borderRadius: '20px', border: '1px solid',
                  borderColor: filter === cat ? '#00C087' : border,
                  background: filter === cat ? 'rgba(0,192,135,0.15)' : 'transparent',
                  color: filter === cat ? '#00C087' : textSecondary,
                  cursor: 'pointer', fontSize: '12px',
                  fontWeight: filter === cat ? '700' : '400',
                  whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s'
                }}>{(categoryEmojis[cat] || '') + ' ' + cat}</button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {!user && (
            <div style={{
              background: darkMode ? 'rgba(0,192,135,0.08)' : 'rgba(0,192,135,0.06)',
              border: '1px solid rgba(0,192,135,0.2)', borderRadius: '10px',
              padding: '12px 16px', marginBottom: '14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <p style={{ color: textSecondary, fontSize: '13px', margin: 0 }}>Sign in to trade and track predictions</p>
              <button onClick={handleGoogleLogin} style={{
                background: '#00C087', border: 'none', color: 'white',
                padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '12px', fontWeight: '700', marginLeft: '12px'
              }}>Sign in</button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ color: textSecondary, fontSize: '12px', margin: 0 }}>{filtered.length} markets</p>
            <button onClick={function() { setShowResolved(!showResolved) }} style={{
              background: 'transparent', border: '1px solid ' + border,
              color: textSecondary, padding: '4px 10px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '11px'
            }}>
              {showResolved ? 'Hide Resolved' : 'Resolved (' + resolvedMarkets.length + ')'}
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ color: textSecondary, fontSize: '14px' }}>Loading markets...</div>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '12px', marginBottom: '12px'
              }}>
                {filtered.map(function(market) {
                  return (
                    <MarketCard key={market.id} market={market} onBet={handleBet}
                      user={user} darkMode={darkMode} isGrid={!isMobile} />
                  )
                })}
              </div>

              {showResolved && filteredResolved.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '20px 0 12px' }}>
                    <div style={{ flex: 1, height: '1px', background: border }} />
                    <span style={{ color: textSecondary, fontSize: '12px', whiteSpace: 'nowrap' }}>Resolved Markets</span>
                    <div style={{ flex: 1, height: '1px', background: border }} />
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: '12px'
                  }}>
                    {filteredResolved.map(function(market) {
                      return (
                        <MarketCard key={market.id} market={market} onBet={handleBet}
                          user={user} darkMode={darkMode} isGrid={!isMobile} />
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {isMobile && (
            <div style={{ marginTop: '24px' }}>
              <WeatherWidget darkMode={darkMode} />
              <NewsSidebar darkMode={darkMode} />
            </div>
          )}
        </div>

        {!isMobile && (
          <div style={{ width: '300px', flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: '120px' }}>
              <WeatherWidget darkMode={darkMode} />
              <NewsSidebar darkMode={darkMode} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App