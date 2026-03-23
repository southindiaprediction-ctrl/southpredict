require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");

module.exports = {
  solidity: "0.8.19",
  networks: {
    amoy: {
      url: process.env.POLYGON_AMOY_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    polygon: {
      url: "https://polygon-mainnet.g.alchemy.com/v2/F7hzZkVUys7jec-RCWh9i",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};