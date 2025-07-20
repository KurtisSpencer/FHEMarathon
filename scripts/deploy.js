import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("========================================");
  console.log("Anonymous Marathon Platform Deployment");
  console.log("========================================\n");

  // Get network information
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deployment Configuration:");
  console.log("------------------------");
  console.log(`Network: ${network}`);
  console.log(`Deployer Address: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Verify sufficient balance
  if (balance < hre.ethers.parseEther("0.01")) {
    console.warn("⚠️  Warning: Low balance. Deployment may fail.\n");
  }

  console.log("Deploying AnonymousMarathon Contract...");
  console.log("---------------------------------------");

  const AnonymousMarathon = await hre.ethers.getContractFactory("AnonymousMarathon");

  console.log("Sending deployment transaction...");
  const deploymentStartTime = Date.now();

  const anonymousMarathon = await AnonymousMarathon.deploy();
  await anonymousMarathon.waitForDeployment();

  const contractAddress = await anonymousMarathon.getAddress();
  const deploymentDuration = ((Date.now() - deploymentStartTime) / 1000).toFixed(2);

  console.log("\n✅ Deployment Successful!");
  console.log("========================\n");

  console.log("Contract Details:");
  console.log("----------------");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Deployment Duration: ${deploymentDuration}s`);
  console.log(`Transaction Hash: ${anonymousMarathon.deploymentTransaction().hash}`);
  console.log(`Block Number: ${(await anonymousMarathon.deploymentTransaction().wait()).blockNumber}`);

  // Get gas information
  const receipt = await anonymousMarathon.deploymentTransaction().wait();
  console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
  console.log(`Gas Price: ${hre.ethers.formatUnits(receipt.gasPrice, "gwei")} gwei`);

  const deploymentCost = receipt.gasUsed * receipt.gasPrice;
  console.log(`Deployment Cost: ${hre.ethers.formatEther(deploymentCost)} ETH\n`);

  // Verify initial contract state
  console.log("Verifying Contract State:");
  console.log("------------------------");
  const organizer = await anonymousMarathon.organizer();
  const registrationFee = await anonymousMarathon.registrationFee();
  const currentMarathonId = await anonymousMarathon.currentMarathonId();

  console.log(`Organizer: ${organizer}`);
  console.log(`Registration Fee: ${hre.ethers.formatEther(registrationFee)} ETH`);
  console.log(`Current Marathon ID: ${currentMarathonId}\n`);

  // Network-specific information
  if (network === "sepolia") {
    console.log("Network Information:");
    console.log("-------------------");
    console.log("Network: Ethereum Sepolia Testnet");
    console.log("Chain ID: 11155111");
    console.log(`Explorer: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`Verify Contract: npx hardhat verify --network sepolia ${contractAddress}\n`);
  } else if (network === "localhost" || network === "hardhat") {
    console.log("Local Development Network");
    console.log("Contract deployed to local node\n");
  }

  // Save deployment information
  const deploymentInfo = {
    network: network,
    chainId: hre.network.config.chainId,
    contractAddress: contractAddress,
    deployer: deployer.address,
    transactionHash: anonymousMarathon.deploymentTransaction().hash,
    blockNumber: (await anonymousMarathon.deploymentTransaction().wait()).blockNumber,
    deploymentDate: new Date().toISOString(),
    gasUsed: receipt.gasUsed.toString(),
    gasPrice: receipt.gasPrice.toString(),
    deploymentCost: hre.ethers.formatEther(deploymentCost),
    organizer: organizer,
    registrationFee: hre.ethers.formatEther(registrationFee),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`📝 Deployment info saved to: ${deploymentFile}\n`);

  // Update .env file with contract address
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env file updated with contract address\n");
  }

  console.log("========================================");
  console.log("Next Steps:");
  console.log("========================================");
  console.log("1. Verify the contract on Etherscan:");
  console.log(`   npm run verify`);
  console.log("\n2. Interact with the contract:");
  console.log(`   npm run interact`);
  console.log("\n3. Run simulation:");
  console.log(`   npm run simulate\n`);

  return contractAddress;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed!");
    console.error("===================");
    console.error(error);
    process.exit(1);
  });
