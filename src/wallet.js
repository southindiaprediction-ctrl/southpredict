const [walletConnected, setWalletConnected] = useState(false)

useEffect(function() {
  async function checkWallet() {
    if (!window.ethereum) return
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    setWalletConnected(accounts && accounts.length > 0)
  }
  checkWallet()
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', function(accounts) {
      setWalletConnected(accounts && accounts.length > 0)
    })
  }
}, [])