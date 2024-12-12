const hre = require("hardhat");

async function main() {

  const subscriptionId = BigInt("104656582696108738248702857397658776654620229310228848685086532546669758574670");
  console.log("Deploying VRFD5 contract...");
  const VRFD5 = await hre.ethers.getContractFactory("VRFD5");

  const vrfD5 = await VRFD5.deploy(subscriptionId);

  await vrfD5.waitForDeployment();

  const contractAddress = await vrfD5.getAddress();

  console.log("VRFD5 deployed to:", contractAddress);
}

main().catch((error) => {
  console.error("Error during deployment:", error);
  process.exitCode = 1;
});
