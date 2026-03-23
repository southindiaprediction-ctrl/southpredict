// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SouthPredict {
    address public owner;
    IERC20 public usdc;

    struct Market {
        uint256 id;
        string question;
        uint256 yesPool;
        uint256 noPool;
        bool resolved;
        bool yesWon;
        bool exists;
    }

    struct Bet {
        uint256 amount;
        bool isYes;
        bool claimed;
    }

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet)) public bets;
    uint256 public marketCount;

    event MarketCreated(uint256 indexed marketId, string question);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool yesWon);
    event WinningsClaimed(uint256 indexed marketId, address indexed bettor, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _usdc) {
        owner = msg.sender;
        usdc = IERC20(_usdc);
    }

    function createMarket(string memory _question) external onlyOwner {
        marketCount++;
        markets[marketCount] = Market({
            id: marketCount,
            question: _question,
            yesPool: 0,
            noPool: 0,
            resolved: false,
            yesWon: false,
            exists: true
        });
        emit MarketCreated(marketCount, _question);
    }

    function placeBet(uint256 _marketId, bool _isYes, uint256 _amount) external {
        Market storage market = markets[_marketId];
        require(market.exists, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        require(_amount > 0, "Amount must be greater than 0");
        require(bets[_marketId][msg.sender].amount == 0, "Already bet on this market");

        require(usdc.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");

        bets[_marketId][msg.sender] = Bet({
            amount: _amount,
            isYes: _isYes,
            claimed: false
        });

        if (_isYes) {
            market.yesPool += _amount;
        } else {
            market.noPool += _amount;
        }

        emit BetPlaced(_marketId, msg.sender, _isYes, _amount);
    }

    function resolveMarket(uint256 _marketId, bool _yesWon) external onlyOwner {
        Market storage market = markets[_marketId];
        require(market.exists, "Market does not exist");
        require(!market.resolved, "Already resolved");

        market.resolved = true;
        market.yesWon = _yesWon;

        emit MarketResolved(_marketId, _yesWon);
    }

    function claimWinnings(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved yet");

        Bet storage bet = bets[_marketId][msg.sender];
        require(bet.amount > 0, "No bet found");
        require(!bet.claimed, "Already claimed");
        require(bet.isYes == market.yesWon, "You did not win");

        bet.claimed = true;

        uint256 totalPool = market.yesPool + market.noPool;
        uint256 winningPool = market.yesWon ? market.yesPool : market.noPool;
        uint256 winnings = (bet.amount * totalPool) / winningPool;

        require(usdc.transfer(msg.sender, winnings), "Transfer failed");

        emit WinningsClaimed(_marketId, msg.sender, winnings);
    }

    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }

    function getBet(uint256 _marketId, address _bettor) external view returns (Bet memory) {
        return bets[_marketId][_bettor];
    }
}