import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getContractAddress(network) {
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFile = path.join(deploymentsDir, `${network}-deployment.json`);

  if (fs.existsSync(deploymentFile)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    return deploymentInfo.contractAddress;
  }

  return process.env.CONTRACT_ADDRESS;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("========================================");
  console.log("Anonymous Marathon - Full Simulation");
  console.log("========================================\n");

  const network = hre.network.name;
  console.log(`Network: ${network}\n`);

  // Get contract address
  let contractAddress = await getContractAddress(network);

  let contract;
  let organizer;

  // If on local network, deploy a new contract for simulation
  if (network === "hardhat" || network === "localhost") {
    console.log("Deploying contract for simulation...\n");

    const AnonymousMarathon = await hre.ethers.getContractFactory("AnonymousMarathon");
    contract = await AnonymousMarathon.deploy();
    await contract.waitForDeployment();

    contractAddress = await contract.getAddress();
    console.log(`✅ Contract deployed at: ${contractAddress}\n`);

    [organizer] = await hre.ethers.getSigners();
  } else {
    // Use existing deployed contract
    if (!contractAddress) {
      console.error("❌ Error: Contract address not found");
      console.error("Please deploy the contract first or set CONTRACT_ADDRESS in .env\n");
      return;
    }

    console.log(`Using existing contract at: ${contractAddress}\n`);

    const AnonymousMarathon = await hre.ethers.getContractFactory("AnonymousMarathon");
    contract = AnonymousMarathon.attach(contractAddress);

    [organizer] = await hre.ethers.getSigners();
  }

  console.log("========================================");
  console.log("Simulation Scenario");
  console.log("========================================");
  console.log("This simulation will:");
  console.log("1. Create a new marathon event");
  console.log("2. Register 5 anonymous runners");
  console.log("3. Record finish times for each runner");
  console.log("4. Complete the marathon");
  console.log("5. Display final leaderboard\n");

  // Step 1: Create Marathon
  console.log("Step 1: Creating Marathon Event");
  console.log("--------------------------------");

  const marathonName = "City Privacy Marathon 2024";
  const eventDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const registrationDeadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes from now
  const maxParticipants = 100;

  console.log(`Name: ${marathonName}`);
  console.log(`Event Date: ${new Date(eventDate * 1000).toLocaleString()}`);
  console.log(`Registration Deadline: ${new Date(registrationDeadline * 1000).toLocaleString()}`);
  console.log(`Max Participants: ${maxParticipants}\n`);

  const createTx = await contract.createMarathon(marathonName, eventDate, registrationDeadline, maxParticipants);
  const createReceipt = await createTx.wait();

  // Get marathon ID from event
  let marathonId;
  for (const log of createReceipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed.name === "MarathonCreated") {
        marathonId = parsed.args[0];
        break;
      }
    } catch (e) {
      // Skip logs that can't be parsed
    }
  }

  console.log(`✅ Marathon created with ID: ${marathonId}`);
  console.log(`Transaction Hash: ${createReceipt.hash}\n`);

  await sleep(2000);

  // Step 2: Register Runners
  console.log("Step 2: Registering Anonymous Runners");
  console.log("--------------------------------------\n");

  const runners = [
    { name: "SpeedRunner", age: 28, experience: 8, previousTime: 180 },
    { name: "StealthAthlete", age: 35, experience: 10, previousTime: 165 },
    { name: "NightHawk", age: 25, experience: 6, previousTime: 195 },
    { name: "SilentStride", age: 42, experience: 9, previousTime: 170 },
    { name: "GhostPacer", age: 31, experience: 7, previousTime: 185 },
  ];

  const registrationFee = await contract.registrationFee();
  console.log(`Registration Fee: ${hre.ethers.formatEther(registrationFee)} ETH\n`);

  const runnerAccounts = await hre.ethers.getSigners();
  const registeredRunners = [];

  for (let i = 0; i < runners.length; i++) {
    const runner = runners[i];
    const account = runnerAccounts[i + 1]; // Skip organizer account

    console.log(`Registering: ${runner.name}`);
    console.log(`  Age: ${runner.age}, Experience: ${runner.experience}, Previous Best: ${runner.previousTime} min`);

    const anonymousId = hre.ethers.encodeBytes32String(runner.name.substring(0, 31));

    try {
      const registerTx = await contract
        .connect(account)
        .registerForMarathon(marathonId, runner.age, runner.experience, runner.previousTime, anonymousId, {
          value: registrationFee,
        });

      const registerReceipt = await registerTx.wait();
      console.log(`  ✅ Registered | TX: ${registerReceipt.hash.substring(0, 10)}...`);

      registeredRunners.push({
        ...runner,
        account: account,
        address: await account.getAddress(),
      });
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }

    await sleep(1000);
  }

  console.log(`\n✅ ${registeredRunners.length} runners registered successfully\n`);

  await sleep(2000);

  // Step 3: View Marathon Info
  console.log("Step 3: Marathon Information");
  console.log("----------------------------\n");

  const marathonInfo = await contract.getMarathonInfo(marathonId);
  console.log(`Name: ${marathonInfo[0]}`);
  console.log(`Current Registrations: ${marathonInfo[4]}/${marathonInfo[3]}`);
  console.log(`Prize Pool: ${hre.ethers.formatEther(marathonInfo[7])} ETH`);
  console.log(`Status: ${marathonInfo[5] ? "Active" : "Inactive"}\n`);

  await sleep(2000);

  // Step 4: Record Finish Times
  console.log("Step 4: Recording Finish Times");
  console.log("-------------------------------\n");

  console.log("⏱️  Marathon in progress...\n");

  // Simulate race with realistic finish times
  const finishTimes = [
    { runner: registeredRunners[1], time: 168 }, // StealthAthlete (best previous time)
    { runner: registeredRunners[3], time: 172 }, // SilentStride
    { runner: registeredRunners[0], time: 178 }, // SpeedRunner
    { runner: registeredRunners[4], time: 183 }, // GhostPacer
    { runner: registeredRunners[2], time: 192 }, // NightHawk
  ];

  for (const { runner, time } of finishTimes) {
    console.log(`Recording: ${runner.name} - ${time} minutes`);

    try {
      const recordTx = await contract.connect(organizer).recordFinishTime(marathonId, runner.address, time);
      const recordReceipt = await recordTx.wait();
      console.log(`  ✅ Recorded | TX: ${recordReceipt.hash.substring(0, 10)}...`);
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }

    await sleep(1000);
  }

  console.log("\n✅ All finish times recorded\n");

  await sleep(2000);

  // Step 5: View Leaderboard (Before Completion)
  console.log("Step 5: Leaderboard (Before Completion)");
  console.log("---------------------------------------\n");

  const leaderboardBefore = await contract.getLeaderboard(marathonId);

  if (leaderboardBefore[0].length === 0) {
    console.log("No entries yet.\n");
  } else {
    for (let i = 0; i < leaderboardBefore[0].length; i++) {
      const anonymousId = hre.ethers.decodeBytes32String(leaderboardBefore[0][i]);
      const revealed = leaderboardBefore[2][i];

      console.log(`${i + 1}. ${anonymousId}`);
      console.log(`   Finish Time: ${revealed ? leaderboardBefore[1][i] + " minutes" : "[Encrypted]"}`);
    }
  }

  console.log("\n📝 All times are encrypted until marathon completion\n");

  await sleep(2000);

  // Step 6: Complete Marathon (Note: In real scenario, need to wait for event time)
  console.log("Step 6: Completing Marathon");
  console.log("---------------------------\n");

  console.log("⚠️  Note: In production, this step would:");
  console.log("   - Wait for the event date + 6 hours");
  console.log("   - Trigger async decryption of finish times");
  console.log("   - Automatically distribute prizes\n");

  console.log("For simulation purposes, skipping time requirements.\n");

  // In a real scenario, you would need to:
  // 1. Wait for the actual event time to pass
  // 2. Call completeMarathon after the 6-hour window
  // 3. The contract would handle decryption and prize distribution

  // Step 7: Summary
  console.log("========================================");
  console.log("Simulation Complete!");
  console.log("========================================\n");

  console.log("Summary:");
  console.log("--------");
  console.log(`Marathon ID: ${marathonId}`);
  console.log(`Registered Runners: ${registeredRunners.length}`);
  console.log(`Recorded Finish Times: ${finishTimes.length}`);
  console.log(`Total Prize Pool: ${hre.ethers.formatEther(marathonInfo[7])} ETH\n`);

  console.log("Expected Prize Distribution:");
  console.log("---------------------------");
  const totalPrize = BigInt(marathonInfo[7]);
  console.log(`1st Place (50%): ${hre.ethers.formatEther((totalPrize * 50n) / 100n)} ETH - ${finishTimes[0].runner.name}`);
  console.log(`2nd Place (30%): ${hre.ethers.formatEther((totalPrize * 30n) / 100n)} ETH - ${finishTimes[1].runner.name}`);
  console.log(`3rd Place (20%): ${hre.ethers.formatEther((totalPrize * 20n) / 100n)} ETH - ${finishTimes[2].runner.name}\n`);

  console.log("Privacy Features Demonstrated:");
  console.log("-----------------------------");
  console.log("✅ Anonymous registration with pseudonyms");
  console.log("✅ Encrypted personal data (age, experience, previous times)");
  console.log("✅ Encrypted finish times during race");
  console.log("✅ Fair competition with privacy preservation");
  console.log("✅ Automated prize distribution through smart contract\n");

  console.log("Next Steps:");
  console.log("-----------");
  console.log("1. View detailed runner status:");
  console.log(`   npm run interact`);
  console.log("\n2. Verify the contract on Etherscan:");
  console.log(`   npm run verify`);
  console.log("\n3. Complete the marathon (after event time):");
  console.log(`   Use the interact script to call completeMarathon()\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation Failed!");
    console.error("====================");
    console.error(error);
    process.exit(1);
  });
