require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    polygon: {
      url: process.env.POLYGON_MAINNET_URL || "https://polygon-mainnet.g.alchemy.com/v2/F7hzZkVUys7jec-RCWh9i",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    amoy: {
      url: process.env.POLYGON_AMOY_URL || "https://polygon-amoy.g.alchemy.com/v2/F7hzZkVUys7jec-RCWh9i",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
}