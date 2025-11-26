const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PrivacyGateway...");

  // Get oracle address from environment or use default
  const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS || "0x0000000000000000000000000000000000000000";

  if (ORACLE_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.warn("⚠️  Warning: Using placeholder oracle address. Please set ORACLE_ADDRESS in .env");
  }

  // Deploy PrivacyGateway
  const PrivacyGateway = await hre.ethers.getContractFactory("PrivacyGateway");
  const gateway = await PrivacyGateway.deploy(ORACLE_ADDRESS);

  await gateway.waitForDeployment();

  const gatewayAddress = await gateway.getAddress();
  console.log("✅ PrivacyGateway deployed to:", gatewayAddress);
  console.log("   Oracle address:", ORACLE_ADDRESS);

  // Wait for block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await gateway.deploymentTransaction().wait(5);

  console.log("\n📝 Verify with:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${gatewayAddress} ${ORACLE_ADDRESS}`);

  console.log("\n✅ Deployment complete!");
  console.log("   Gateway Address:", gatewayAddress);
  console.log("   Use this address when deploying AnonymousMarathon");

  return gatewayAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
