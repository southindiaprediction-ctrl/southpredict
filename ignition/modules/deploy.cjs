const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SouthPredict contract...");

  const USDC_AMOY = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";

  const SouthPredict = await ethers.getContractFactory("SouthPredict");
  const contract = await SouthPredict.deploy(USDC_AMOY);

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SouthPredict deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});