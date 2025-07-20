import hre from "hardhat";
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function getContractAddress(network) {
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFile = path.join(deploymentsDir, `${network}-deployment.json`);

  if (fs.existsSync(deploymentFile)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    return deploymentInfo.contractAddress;
  }

  return process.env.CONTRACT_ADDRESS;
}

async function displayMenu() {
  console.log("\n========================================");
  console.log("Anonymous Marathon - Contract Interaction");
  console.log("========================================\n");
  console.log("Select an action:");
  console.log("1. Create Marathon");
  console.log("2. Register for Marathon");
  console.log("3. View Marathon Info");
  console.log("4. View Runner Status");
  console.log("5. View Leaderboard");
  console.log("6. Record Finish Time (Organizer Only)");
  console.log("7. Complete Marathon (Organizer Only)");
  console.log("8. Update Registration Fee (Organizer Only)");
  console.log("9. Cancel Marathon (Organizer Only)");
  console.log("10. View Contract Info");
  console.log("0. Exit\n");
}

async function createMarathon(contract, signer) {
  console.log("\n--- Create New Marathon ---\n");

  const name = await question("Marathon Name: ");
  const daysUntilEvent = await question("Days until event: ");
  const daysUntilDeadline = await question("Days until registration deadline: ");
  const maxParticipants = await question("Maximum participants: ");

  const eventDate = Math.floor(Date.now() / 1000) + parseInt(daysUntilEvent) * 86400;
  const deadline = Math.floor(Date.now() / 1000) + parseInt(daysUntilDeadline) * 86400;

  console.log("\nCreating marathon...");
  const tx = await contract.createMarathon(name, eventDate, deadline, maxParticipants);
  const receipt = await tx.wait();

  console.log(`✅ Marathon created!`);
  console.log(`Transaction Hash: ${receipt.hash}`);

  // Get the marathon ID from the event
  const event = receipt.logs.find((log) => {
    try {
      return contract.interface.parseLog(log).name === "MarathonCreated";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsedEvent = contract.interface.parseLog(event);
    console.log(`Marathon ID: ${parsedEvent.args[0]}`);
  }
}

async function registerForMarathon(contract, signer) {
  console.log("\n--- Register for Marathon ---\n");

  const marathonId = await question("Marathon ID: ");
  const age = await question("Your Age: ");
  const experience = await question("Experience Level (1-10): ");
  const previousTime = await question("Previous Best Time (minutes): ");
  const anonymousId = await question("Choose Anonymous ID (e.g., Runner123): ");

  // Convert string to bytes32
  const bytes32Id = hre.ethers.encodeBytes32String(anonymousId.substring(0, 31));

  const registrationFee = await contract.registrationFee();
  console.log(`\nRegistration Fee: ${hre.ethers.formatEther(registrationFee)} ETH`);

  console.log("\nRegistering...");
  const tx = await contract.registerForMarathon(marathonId, age, experience, previousTime, bytes32Id, {
    value: registrationFee,
  });

  const receipt = await tx.wait();
  console.log(`✅ Registration successful!`);
  console.log(`Transaction Hash: ${receipt.hash}`);
  console.log(`Anonymous ID: ${anonymousId}`);
}

async function viewMarathonInfo(contract) {
  console.log("\n--- Marathon Information ---\n");

  const marathonId = await question("Marathon ID: ");

  try {
    const info = await contract.getMarathonInfo(marathonId);

    console.log("\nMarathon Details:");
    console.log("----------------");
    console.log(`Name: ${info[0]}`);
    console.log(`Event Date: ${new Date(Number(info[1]) * 1000).toLocaleString()}`);
    console.log(`Registration Deadline: ${new Date(Number(info[2]) * 1000).toLocaleString()}`);
    console.log(`Max Participants: ${info[3]}`);
    console.log(`Current Registrations: ${info[4]}`);
    console.log(`Active: ${info[5]}`);
    console.log(`Completed: ${info[6]}`);
    console.log(`Prize Pool: ${hre.ethers.formatEther(info[7])} ETH`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function viewRunnerStatus(contract) {
  console.log("\n--- Runner Status ---\n");

  const marathonId = await question("Marathon ID: ");
  const runnerAddress = await question("Runner Address (press Enter for your address): ");

  const address = runnerAddress || (await contract.runner.getAddress());

  try {
    const status = await contract.getRunnerStatus(marathonId, address);

    console.log("\nRunner Status:");
    console.log("-------------");
    console.log(`Registered: ${status[0]}`);
    console.log(`Finished: ${status[1]}`);
    console.log(`Anonymous ID: ${hre.ethers.decodeBytes32String(status[2]) || "N/A"}`);
    console.log(`Registration Time: ${new Date(Number(status[3]) * 1000).toLocaleString()}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function viewLeaderboard(contract) {
  console.log("\n--- Leaderboard ---\n");

  const marathonId = await question("Marathon ID: ");

  try {
    const leaderboard = await contract.getLeaderboard(marathonId);

    console.log("\nLeaderboard:");
    console.log("------------");

    if (leaderboard[0].length === 0) {
      console.log("No entries yet.");
    } else {
      for (let i = 0; i < leaderboard[0].length; i++) {
        const anonymousId = hre.ethers.decodeBytes32String(leaderboard[0][i]) || "Unknown";
        const finishTime = leaderboard[1][i];
        const revealed = leaderboard[2][i];

        console.log(`${i + 1}. ${anonymousId}`);
        if (revealed) {
          console.log(`   Finish Time: ${finishTime} minutes`);
        } else {
          console.log(`   Finish Time: [Encrypted]`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function recordFinishTime(contract) {
  console.log("\n--- Record Finish Time (Organizer Only) ---\n");

  const marathonId = await question("Marathon ID: ");
  const runnerAddress = await question("Runner Address: ");
  const finishTime = await question("Finish Time (minutes): ");

  console.log("\nRecording finish time...");
  try {
    const tx = await contract.recordFinishTime(marathonId, runnerAddress, finishTime);
    const receipt = await tx.wait();

    console.log(`✅ Finish time recorded!`);
    console.log(`Transaction Hash: ${receipt.hash}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function completeMarathon(contract) {
  console.log("\n--- Complete Marathon (Organizer Only) ---\n");

  const marathonId = await question("Marathon ID: ");

  console.log("\nCompleting marathon...");
  try {
    const tx = await contract.completeMarathon(marathonId);
    const receipt = await tx.wait();

    console.log(`✅ Marathon completed!`);
    console.log(`Transaction Hash: ${receipt.hash}`);
    console.log("\nThe leaderboard will be revealed and prizes distributed.");
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function updateRegistrationFee(contract) {
  console.log("\n--- Update Registration Fee (Organizer Only) ---\n");

  const currentFee = await contract.registrationFee();
  console.log(`Current Fee: ${hre.ethers.formatEther(currentFee)} ETH`);

  const newFee = await question("New Registration Fee (in ETH): ");

  console.log("\nUpdating fee...");
  try {
    const tx = await contract.updateRegistrationFee(hre.ethers.parseEther(newFee));
    const receipt = await tx.wait();

    console.log(`✅ Registration fee updated!`);
    console.log(`Transaction Hash: ${receipt.hash}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function cancelMarathon(contract) {
  console.log("\n--- Cancel Marathon (Organizer Only) ---\n");

  const marathonId = await question("Marathon ID: ");

  const confirm = await question("Are you sure you want to cancel this marathon? (yes/no): ");

  if (confirm.toLowerCase() !== "yes") {
    console.log("Cancelled.");
    return;
  }

  console.log("\nCancelling marathon...");
  try {
    const tx = await contract.cancelMarathon(marathonId);
    const receipt = await tx.wait();

    console.log(`✅ Marathon cancelled! Participants will be refunded.`);
    console.log(`Transaction Hash: ${receipt.hash}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function viewContractInfo(contract, signer) {
  console.log("\n--- Contract Information ---\n");

  const organizer = await contract.organizer();
  const registrationFee = await contract.registrationFee();
  const currentMarathonId = await contract.currentMarathonId();
  const contractBalance = await hre.ethers.provider.getBalance(await contract.getAddress());

  console.log("Contract Details:");
  console.log("----------------");
  console.log(`Address: ${await contract.getAddress()}`);
  console.log(`Organizer: ${organizer}`);
  console.log(`Your Address: ${await signer.getAddress()}`);
  console.log(`Registration Fee: ${hre.ethers.formatEther(registrationFee)} ETH`);
  console.log(`Total Marathons Created: ${currentMarathonId}`);
  console.log(`Contract Balance: ${hre.ethers.formatEther(contractBalance)} ETH`);
}

async function main() {
  const network = hre.network.name;
  console.log(`\nConnected to network: ${network}`);

  const contractAddress = await getContractAddress(network);

  if (!contractAddress) {
    console.error("\n❌ Error: Contract address not found");
    console.error("Please deploy the contract first or set CONTRACT_ADDRESS in .env\n");
    rl.close();
    return;
  }

  console.log(`Contract Address: ${contractAddress}`);

  const [signer] = await hre.ethers.getSigners();
  console.log(`Using account: ${await signer.getAddress()}\n`);

  const AnonymousMarathon = await hre.ethers.getContractFactory("AnonymousMarathon");
  const contract = AnonymousMarathon.attach(contractAddress);

  let running = true;

  while (running) {
    await displayMenu();
    const choice = await question("Enter your choice: ");

    try {
      switch (choice) {
        case "1":
          await createMarathon(contract, signer);
          break;
        case "2":
          await registerForMarathon(contract, signer);
          break;
        case "3":
          await viewMarathonInfo(contract);
          break;
        case "4":
          await viewRunnerStatus(contract);
          break;
        case "5":
          await viewLeaderboard(contract);
          break;
        case "6":
          await recordFinishTime(contract);
          break;
        case "7":
          await completeMarathon(contract);
          break;
        case "8":
          await updateRegistrationFee(contract);
          break;
        case "9":
          await cancelMarathon(contract);
          break;
        case "10":
          await viewContractInfo(contract, signer);
          break;
        case "0":
          running = false;
          console.log("\nGoodbye!\n");
          break;
        default:
          console.log("\n❌ Invalid choice. Please try again.");
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
    }

    if (running && choice !== "0") {
      await question("\nPress Enter to continue...");
    }
  }

  rl.close();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    rl.close();
    process.exit(1);
  });
