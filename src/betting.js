import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDT_ADDRESS, USDT_ABI } from './contractABI'

const POLYGON_CHAIN_ID = '0x89'

export async function switchToPolygon() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: POLYGON_CHAIN_ID }]
    })
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: POLYGON_CHAIN_ID,
          chainName: 'Polygon Mainnet',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://polygon-rpc.com'],
          blockExplorerUrls: ['https://polygonscan.com']
        }]
      })
    } else { throw err }
  }
}

export async function placeBetOnChain(chainMarketId, isYes, amountUSDT) {
  if (!window.ethereum) throw new Error('MetaMask not installed')

  if (!chainMarketId || chainMarketId === null) {
    throw new Error('This market is not available for on-chain betting yet')
  }

  const accounts = await window.ethereum.request({ method: 'eth_accounts' })
  if (!accounts || accounts.length === 0) {
    throw new Error('Wallet not connected')
  }

  await switchToPolygon()

  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()

  const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer)
  const decimals = await usdt.decimals()
  const amount = ethers.parseUnits(amountUSDT.toString(), decimals)

  const userAddress = await signer.getAddress()
  const allowance = await usdt.allowance(userAddress, CONTRACT_ADDRESS)

  if (allowance < amount) {
    console.log('Approving USDT...')
    const approveTx = await usdt.approve(CONTRACT_ADDRESS, amount)
    await approveTx.wait()
    console.log('USDT approved')
  }

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  console.log('Placing bet on chain market ID:', chainMarketId)
  const tx = await contract.placeBet(chainMarketId, isYes, amount)
  await tx.wait()
  console.log('Bet placed:', tx.hash)
  return tx
}

export async function claimWinningsOnChain(chainMarketId) {
  await switchToPolygon()
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  const tx = await contract.claimWinnings(chainMarketId)
  await tx.wait()
  return tx
}