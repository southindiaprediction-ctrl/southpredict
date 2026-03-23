export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

export const CONTRACT_ABI = [
  "function createMarket(string memory _question) external",
  "function placeBet(uint256 _marketId, bool _isYes, uint256 _amount) external",
  "function resolveMarket(uint256 _marketId, bool _yesWon) external",
  "function claimWinnings(uint256 _marketId) external",
  "function getMarket(uint256 _marketId) external view returns (tuple(uint256 id, string question, uint256 yesPool, uint256 noPool, bool resolved, bool yesWon, bool exists))",
  "function getBet(uint256 _marketId, address _bettor) external view returns (tuple(uint256 amount, bool isYes, bool claimed))",
  "function marketCount() external view returns (uint256)"
]