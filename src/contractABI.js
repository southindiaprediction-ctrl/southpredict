import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDT_ADDRESS, USDT_ABI } from './contractABI'

const POLYGON_CHAIN_ID = '0x89'

export async function getProvider() {
  if (!window.ethereum) throw new Error('MetaMask not installed')
  const provider = new ethers.BrowserProvider(window.ethereum)
  return provider
}

export async function getSigner() {
  const provider = await getProvider()
  const signer = await provider.getSigner()
  return signer
}

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
    } else {
      throw err
    }
  }
}

export async function getUSDTBalance(address) {
  try {
    const provider = await getProvider()
    const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider)
    const balance = await usdt.balanceOf(address)
    const decimals = await usdt.decimals()
    return parseFloat(ethers.formatUnits(balance, decimals)).toFixed(2)
  } catch (err) {
    console.error('Balance error:', err)
    return '0.00'
  }
}

export async function approveUSDT(amountUSDT) {
  await switchToPolygon()
  const signer = await getSigner()
  const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer)
  const decimals = await usdt.decimals()
  const amount = ethers.parseUnits(amountUSDT.toString(), decimals)
  const tx = await usdt.approve(CONTRACT_ADDRESS, amount)
  await tx.wait()
  return tx
}

export async function placeBetOnChain(marketId, isYes, amountUSDT) {
  await switchToPolygon()
  const signer = await getSigner()

  const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer)
  const decimals = await usdt.decimals()
  const amount = ethers.parseUnits(amountUSDT.toString(), decimals)

  const allowance = await usdt.allowance(await signer.getAddress(), CONTRACT_ADDRESS)
  if (allowance < amount) {
    console.log('Approving USDT...')
    const approveTx = await usdt.approve(CONTRACT_ADDRESS, amount)
    await approveTx.wait()
    console.log('USDT approved')
  }

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  console.log('Placing bet on chain...')
  const tx = await contract.placeBet(marketId, isYes, amount)
  await tx.wait()
  console.log('Bet placed on chain:', tx.hash)
  return tx
}

export async function claimWinningsOnChain(marketId) {
  await switchToPolygon()
  const signer = await getSigner()
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  const tx = await contract.claimWinnings(marketId)
  await tx.wait()
  return tx
}

export async function getOnChainMarket(marketId) {
  const provider = await getProvider()
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
  const market = await contract.getMarket(marketId)
  return market
}

export async function getOnChainBet(marketId, address) {
  const provider = await getProvider()
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
  const bet = await contract.getBet(marketId, address)
  return bet
}