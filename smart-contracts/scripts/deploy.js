const hre = require("hardhat");

async function main() {
  console.log("Deploying WasteManagement contract...");

  const WasteManagement = await hre.ethers.getContractFactory("WasteManagement");
  const wasteManagement = await WasteManagement.deploy();

  await wasteManagement.deployed();

  console.log("WasteManagement deployed to:", wasteManagement.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
