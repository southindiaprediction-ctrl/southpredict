import { ethers } from 'ethers'

export async function connectWallet() {
  if (!window.ethereum) {
    alert('MetaMask not found. Please install MetaMask from metamask.io')
    return null
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  await provider.send('eth_requestAccounts', [])
  const signer = await provider.getSigner()
  const address = await signer.getAddress()

  await switchToPolygon()

  return { provider, signer, address }
}

export async function switchToPolygon() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }],
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
    }
  }
}

export async function getUSDCBalance(address) {
  const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
  const USDC_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)'
  ]
  const provider = new ethers.BrowserProvider(window.ethereum)
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider)
  const balance = await usdc.balanceOf(address)
  const decimals = await usdc.decimals()
  return ethers.formatUnits(balance, decimals)
}