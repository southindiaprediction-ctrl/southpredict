const hre = require("hardhat")

const CONTRACT_ADDRESS = "0x99674BfC7631264e3869e4d5208F924a93393A17"
const CONTRACT_ABI = [
  "function createMarket(string memory _question) external",
  "function marketCount() external view returns (uint256)"
]

async function main() {
  const signer = (await hre.ethers.getSigners())[0]
  const contract = new hre.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

  const markets = [
    "Will Rajinikanth announce a new film in 2026?",
    "Will Vijay's TVK party contest all 234 TN seats?",
    "Will CSK win IPL 2026?",
    "Will RCB win IPL 2026?",
    "Will DMK win more than 150 seats in TN 2026 elections?",
    "Will BTC price exceed $90,000 by end of March 2026?",
    "Will ETH price exceed $2,500 by end of March 2026?",
    "Will SOL price exceed $150 by end of March 2026?"
  ]

  console.log("Creating markets on chain...")
  for (let i = 0; i < markets.length; i++) {
    console.log("Creating market", i + 1, ":", markets[i])
    const tx = await contract.createMarket(markets[i])
    await tx.wait()
    console.log("Market", i + 1, "created!")
  }

  const count = await contract.marketCount()
  console.log("Total markets on chain:", count.toString())
}

main().catch(function(error) {
  console.error(error)
  process.exit(1)
})