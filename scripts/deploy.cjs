const hre = require("hardhat");

async function main() {
  const USDT_POLYGON = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

  console.log("Deploying SouthPredict with USDT on Polygon Mainnet...");
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);
  console.log("USDT address:", USDT_POLYGON);

  const SouthPredict = await hre.ethers.getContractFactory("SouthPredict");
  const contract = await SouthPredict.deploy(USDT_POLYGON);

  console.log("Waiting for deployment...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SouthPredict deployed to:", address)
  console.log("Save this address for the frontend")
}

main().catch(function(error) {
  console.error(error);
  process.exit(1);
});