import { ethers } from 'ethers'

export async function connectWallet() {
  if (!window.ethereum) {
    alert('MetaMask not found. Please install MetaMask from metamask.io')
    return null
  }
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    if (!accounts || accounts.length === 0) {
      alert('No accounts found. Please unlock MetaMask.')
      return null
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    await switchToPolygon()
    return { provider, signer, address }
  } catch (err) {
    if (err.code === 4001) {
      alert('Connection rejected. Please approve the MetaMask connection.')
    } else {
      console.error('Wallet connect error:', err)
    }
    return null
  }
}

export async function switchToPolygon() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }]
    })
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x89',
          chainName: 'Polygon Mainnet',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://polygon-rpc.com/'],
          blockExplorerUrls: ['https://polygonscan.com/']
        }]
      })
    } else {
      throw error
    }
  }
}

export async function getUSDTBalance(address) {
  const USDT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
  const USDT_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)'
  ]
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider)
    const balance = await usdt.balanceOf(address)
    const decimals = await usdt.decimals()
    return parseFloat(ethers.formatUnits(balance, decimals)).toFixed(2)
  } catch (err) {
    console.error('Balance error:', err)
    return '0.00'
  }
}