export const CONTRACT_ADDRESS = "0x99674BfC7631264e3869e4d5208F924a93393A17"

export const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"

export const CONTRACT_ABI = [
  "function createMarket(string memory _question) external",
  "function placeBet(uint256 _marketId, bool _isYes, uint256 _amount) external",
  "function resolveMarket(uint256 _marketId, bool _yesWon) external",
  "function claimWinnings(uint256 _marketId) external",
  "function withdrawFees() external",
  "function getMarket(uint256 _marketId) external view returns (tuple(uint256 id, string question, uint256 yesPool, uint256 noPool, bool resolved, bool yesWon, bool exists))",
  "function getBet(uint256 _marketId, address _bettor) external view returns (tuple(uint256 amount, bool isYes, bool claimed))",
  "function getCollectedFees() external view returns (uint256)",
  "function marketCount() external view returns (uint256)",
  "function feePercent() external view returns (uint256)",
  "function owner() external view returns (address)"
]

export const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function transfer(address to, uint256 amount) external returns (bool)"
]