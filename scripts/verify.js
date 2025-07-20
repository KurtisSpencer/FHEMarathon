import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("========================================");
  console.log("Contract Verification Script");
  console.log("========================================\n");

  const network = hre.network.name;

  // Check if we're on a supported network
  if (network === "hardhat" || network === "localhost") {
    console.log("⚠️  Verification is not available for local networks");
    console.log("Deploy to a public testnet or mainnet to verify contracts\n");
    return;
  }

  // Try to get contract address from deployment file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFile = path.join(deploymentsDir, `${network}-deployment.json`);

  let contractAddress;

  if (fs.existsSync(deploymentFile)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    contractAddress = deploymentInfo.contractAddress;
    console.log(`📄 Found deployment file for ${network}`);
    console.log(`Contract Address: ${contractAddress}\n`);
  } else {
    // Try to get from environment variable
    contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
      console.error("❌ Error: Contract address not found");
      console.error("Please provide contract address via:");
      console.error("1. Deploy the contract first (npm run deploy)");
      console.error("2. Set CONTRACT_ADDRESS in .env file");
      console.error("3. Pass as argument: npx hardhat run scripts/verify.js --network sepolia <address>\n");
      return;
    }
  }

  // If address is provided as command line argument, use it
  if (process.argv.length > 2) {
    contractAddress = process.argv[2];
    console.log(`Using contract address from argument: ${contractAddress}\n`);
  }

  console.log("Verification Configuration:");
  console.log("--------------------------");
  console.log(`Network: ${network}`);
  console.log(`Contract: AnonymousMarathon`);
  console.log(`Address: ${contractAddress}\n`);

  console.log("Starting verification process...\n");

  try {
    // Verify the contract
    // Note: AnonymousMarathon constructor has no arguments
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: "contracts/AnonymousMarathon.sol:AnonymousMarathon",
    });

    console.log("\n✅ Contract Verified Successfully!");
    console.log("=================================\n");

    if (network === "sepolia") {
      console.log("View on Etherscan:");
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code\n`);
    }

    // Update deployment info with verification status
    if (fs.existsSync(deploymentFile)) {
      const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
      deploymentInfo.verified = true;
      deploymentInfo.verificationDate = new Date().toISOString();
      fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
      console.log("📝 Deployment info updated with verification status\n");
    }
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!\n");

      if (network === "sepolia") {
        console.log("View on Etherscan:");
        console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code\n`);
      }
    } else {
      console.error("\n❌ Verification Failed!");
      console.error("=====================");
      console.error(error.message);

      console.log("\nTroubleshooting:");
      console.log("----------------");
      console.log("1. Ensure ETHERSCAN_API_KEY is set in .env file");
      console.log("2. Wait a few moments after deployment before verifying");
      console.log("3. Check that the contract address is correct");
      console.log("4. Verify constructor arguments match deployment");
      console.log("5. Ensure the contract is compiled with the same settings\n");

      throw error;
    }
  }

  console.log("Verification Details:");
  console.log("--------------------");
  console.log("Compiler Version: 0.8.24");
  console.log("Optimization: Enabled (200 runs)");
  console.log("License: MIT\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
