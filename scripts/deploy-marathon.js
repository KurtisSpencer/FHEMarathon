const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying AnonymousMarathon with Gateway integration...");

  // Get gateway address from environment or prompt
  const GATEWAY_ADDRESS = process.env.GATEWAY_ADDRESS || "0x0000000000000000000000000000000000000000";

  if (GATEWAY_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Error: GATEWAY_ADDRESS not set!");
    console.log("   Please deploy PrivacyGateway first and set GATEWAY_ADDRESS in .env");
    console.log("   Example: GATEWAY_ADDRESS=0x1234567890abcdef...");
    process.exit(1);
  }

  console.log("📍 Using Gateway address:", GATEWAY_ADDRESS);

  // Deploy AnonymousMarathon
  const AnonymousMarathon = await hre.ethers.getContractFactory("AnonymousMarathon");
  const marathon = await AnonymousMarathon.deploy(GATEWAY_ADDRESS);

  await marathon.waitForDeployment();

  const marathonAddress = await marathon.getAddress();
  console.log("✅ AnonymousMarathon deployed to:", marathonAddress);

  // Get deployment details
  const organizer = await marathon.organizer();
  const registrationFee = await marathon.registrationFee();
  const gatewayAddr = await marathon.gatewayAddress();

  console.log("\n📊 Deployment Details:");
  console.log("   Contract:", marathonAddress);
  console.log("   Organizer:", organizer);
  console.log("   Registration Fee:", hre.ethers.formatEther(registrationFee), "ETH");
  console.log("   Gateway:", gatewayAddr);

  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await marathon.deploymentTransaction().wait(5);

  console.log("\n📝 Verify with:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${marathonAddress} ${GATEWAY_ADDRESS}`);

  console.log("\n✅ Deployment complete!");
  console.log("\n🎯 Next steps:");
  console.log("   1. Verify contracts on Etherscan");
  console.log("   2. Test marathon creation");
  console.log("   3. Test participant registration");
  console.log("   4. Monitor SecurityEvent emissions");
  console.log("\n📚 Documentation:");
  console.log("   - ARCHITECTURE.md - System architecture");
  console.log("   - PRIVACY_GUIDE.md - Privacy and security");
  console.log("   - README.md - API documentation");

  return marathonAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
