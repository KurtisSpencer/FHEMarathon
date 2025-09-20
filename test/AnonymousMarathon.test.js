import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("AnonymousMarathon", function () {
  // Signers
  let signers;
  let deployer, organizer, runner1, runner2, runner3, runner4, runner5;

  // Contract and constants
  const REGISTRATION_FEE = ethers.parseEther("0.001");
  const ONE_DAY = 86400;
  const TWELVE_HOURS = 43200;
  const SIX_HOURS = 21600;

  // Deployment fixture
  async function deployFixture() {
    const AnonymousMarathon = await ethers.getContractFactory("AnonymousMarathon");
    const contract = await AnonymousMarathon.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    return { contract, contractAddress };
  }

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      organizer: ethSigners[0],
      runner1: ethSigners[1],
      runner2: ethSigners[2],
      runner3: ethSigners[3],
      runner4: ethSigners[4],
      runner5: ethSigners[5],
    };

    // Assign for easier access
    deployer = signers.deployer;
    organizer = signers.organizer;
    runner1 = signers.runner1;
    runner2 = signers.runner2;
    runner3 = signers.runner3;
    runner4 = signers.runner4;
    runner5 = signers.runner5;
  });

  // ========================================
  // 1. Deployment Tests (5 tests)
  // ========================================
  describe("1. Deployment and Initialization", function () {
    let contract, contractAddress;

    beforeEach(async function () {
      ({ contract, contractAddress } = await loadFixture(deployFixture));
    });

    it("should deploy successfully with valid address", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
      expect(contractAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should set the correct organizer", async function () {
      expect(await contract.organizer()).to.equal(organizer.address);
    });

    it("should set default registration fee to 0.001 ETH", async function () {
      expect(await contract.registrationFee()).to.equal(REGISTRATION_FEE);
    });

    it("should initialize marathon ID to 0", async function () {
      expect(await contract.currentMarathonId()).to.equal(0);
    });

    it("should start with zero contract balance", async function () {
      const balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.equal(0);
    });
  });

  // ========================================
  // 2. Marathon Creation Tests (10 tests)
  // ========================================
  describe("2. Marathon Creation", function () {
    let contract, contractAddress;

    beforeEach(async function () {
      ({ contract, contractAddress } = await loadFixture(deployFixture));
    });

    it("should allow organizer to create a marathon", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;

      await expect(
        contract.createMarathon("Test Marathon", eventDate, deadline, 100)
      )
        .to.emit(contract, "MarathonCreated")
        .withArgs(1, "Test Marathon", eventDate);

      const marathonId = await contract.currentMarathonId();
      expect(marathonId).to.equal(1);
    });

    it("should increment marathon ID on each creation", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;

      await contract.createMarathon("Marathon 1", eventDate, deadline, 100);
      expect(await contract.currentMarathonId()).to.equal(1);

      await contract.createMarathon("Marathon 2", eventDate + ONE_DAY, deadline + ONE_DAY, 50);
      expect(await contract.currentMarathonId()).to.equal(2);

      await contract.createMarathon("Marathon 3", eventDate + 2 * ONE_DAY, deadline + 2 * ONE_DAY, 75);
      expect(await contract.currentMarathonId()).to.equal(3);
    });

    it("should not allow non-organizer to create marathon", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;

      await expect(
        contract.connect(runner1).createMarathon("Test Marathon", eventDate, deadline, 100)
      ).to.be.revertedWith("Only organizer can perform this action");
    });

    it("should reject event date in the past", async function () {
      const pastDate = (await time.latest()) - ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;

      await expect(
        contract.createMarathon("Test Marathon", pastDate, deadline, 100)
      ).to.be.revertedWith("Event date must be in the future");
    });

    it("should reject registration deadline after event date", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const lateDeadline = eventDate + 3600;

      await expect(
        contract.createMarathon("Test Marathon", eventDate, lateDeadline, 100)
      ).to.be.revertedWith("Registration deadline must be before event");
    });

    it("should reject zero max participants", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;

      await expect(
        contract.createMarathon("Test Marathon", eventDate, deadline, 0)
      ).to.be.revertedWith("Max participants must be greater than 0");
    });

    it("should initialize marathon with correct parameters", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;
      const maxParticipants = 100;

      await contract.createMarathon("City Marathon 2024", eventDate, deadline, maxParticipants);

      const info = await contract.getMarathonInfo(1);
      expect(info[0]).to.equal("City Marathon 2024");
      expect(info[1]).to.equal(eventDate);
      expect(info[2]).to.equal(deadline);
      expect(info[3]).to.equal(maxParticipants);
      expect(info[4]).to.equal(0); // currentRegistrations
      expect(info[5]).to.equal(true); // isActive
      expect(info[6]).to.equal(false); // isCompleted
      expect(info[7]).to.equal(0); // prizePool
    });

    it("should allow marathon with minimum 1 participant", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;

      await expect(
        contract.createMarathon("Small Marathon", eventDate, deadline, 1)
      ).to.not.be.reverted;
    });

    it("should allow marathon with large participant capacity", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;

      await expect(
        contract.createMarathon("Mega Marathon", eventDate, deadline, 10000)
      ).to.not.be.reverted;
    });

    it("should allow creating marathons with same name", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;

      await contract.createMarathon("Annual Marathon", eventDate, deadline, 100);
      await expect(
        contract.createMarathon("Annual Marathon", eventDate + ONE_DAY, deadline + ONE_DAY, 100)
      ).to.not.be.reverted;
    });
  });

  // ========================================
  // 3. Runner Registration Tests (15 tests)
  // ========================================
  describe("3. Runner Registration", function () {
    let contract, contractAddress, marathonId;
    let eventDate, deadline;

    beforeEach(async function () {
      ({ contract, contractAddress } = await loadFixture(deployFixture));
      eventDate = (await time.latest()) + ONE_DAY;
      deadline = (await time.latest()) + TWELVE_HOURS;

      await contract.createMarathon("Test Marathon", eventDate, deadline, 100);
      marathonId = await contract.currentMarathonId();
    });

    it("should allow runner to register with valid data", async function () {
      const anonymousId = ethers.encodeBytes32String("Runner001");

      await expect(
        contract.connect(runner1).registerForMarathon(marathonId, 28, 8, 180, anonymousId, {
          value: REGISTRATION_FEE,
        })
      )
        .to.emit(contract, "RunnerRegistered")
        .withArgs(marathonId, anonymousId);
    });

    it("should reject registration with insufficient fee", async function () {
      const anonymousId = ethers.encodeBytes32String("Runner001");

      await expect(
        contract.connect(runner1).registerForMarathon(marathonId, 28, 8, 180, anonymousId, {
          value: ethers.parseEther("0.0001"),
        })
      ).to.be.revertedWith("Insufficient registration fee");
    });

    it("should reject registration with zero value", async function () {
      const anonymousId = ethers.encodeBytes32String("Runner001");

      await expect(
        contract.connect(runner1).registerForMarathon(marathonId, 28, 8, 180, anonymousId, {
          value: 0,
        })
      ).to.be.revertedWith("Insufficient registration fee");
    });

    it("should reject duplicate registration from same address", async function () {
      const anonymousId1 = ethers.encodeBytes32String("Runner001");
      const anonymousId2 = ethers.encodeBytes32String("Runner002");

      await contract.connect(runner1).registerForMarathon(marathonId, 28, 8, 180, anonymousId1, {
        value: REGISTRATION_FEE,
      });

      await expect(
        contract.connect(runner1).registerForMarathon(marathonId, 30, 9, 170, anonymousId2, {
          value: REGISTRATION_FEE,
        })
      ).to.be.revertedWith("Already registered");
    });

    it("should reject duplicate anonymous ID", async function () {
      const anonymousId = ethers.encodeBytes32String("Runner001");

      await contract.connect(runner1).registerForMarathon(marathonId, 28, 8, 180, anonymousId, {
        value: REGISTRATION_FEE,
      });

      await expect(
        contract.connect(runner2).registerForMarathon(marathonId, 30, 9, 170, anonymousId, {
          value: REGISTRATION_FEE,
        })
      ).to.be.revertedWith("Anonymous ID already used");
    });

    it("should reject experience level below 1", async function () {
      const anonymousId = ethers.encodeBytes32String("Runner001");

      await expect(
        contract.connect(runner1).registerForMarathon(marathonId, 28, 0, 180, anonymousId, {
          value: REGISTRATION_FEE,
        })
      ).to.be.revertedWith("Experience level must be 1-10");
    });

    it("should reject experience level above 10", async function () {
      const anonymousId = ethers.encodeBytes32String("Runner001");

      await expect(
        contract.connect(runner1).registerForMarathon(marathonId, 28, 11, 180, anonymousId, {
          value: REGISTRATION_FEE,
        })
      ).to.be.revertedWith("Experience level must be 1-10");
    });

    it("should reject invalid anonymous ID (zero bytes)", async function () {
      const anonymousId = ethers.ZeroHash;

      await expect(
        contract.connect(runner1).registerForMarathon(marathonId, 28, 8, 180, anonymousId, {
          value: REGISTRATION_FEE,
        })
      ).to.be.revertedWith("Invalid anonymous ID");
    });

    it("should reject registration for non-existent marathon", async function () {
      const anonymousId = ethers.encodeBytes32String("Runner001");

      await expect(
        contract.connect(runner1).registerForMarathon(999, 28, 8, 180, anonymousId, {
          value: REGISTRATION_FEE,
        })
      ).to.be.revertedWith("Marathon does not exist");
    });

    it("should reject registration after deadline", async function () {
      const anonymousId = ethers.encodeBytes32String("Runner001");

      await time.increaseTo(deadline + 1);

      await expect(
        contract.connect(runner1).registerForMarathon(marathonId, 28, 8, 180, anonymousId, {
          value: REGISTRATION_FEE,
        })
      ).to.be.revertedWith("Registration closed");
    });

    it("should update marathon current registrations", async function () {
      const anonymousId1 = ethers.encodeBytes32String("Runner001");
      const anonymousId2 = ethers.encodeBytes32String("Runner002");

      await contract.connect(runner1).registerForMarathon(marathonId, 28, 8, 180, anonymousId1, {
        value: REGISTRATION_FEE,
      });

      let info = await contract.getMarathonInfo(marathonId);
      expect(info[4]).to.equal(1);

      await contract.connect(runner2).registerForMarathon(marathonId, 30, 9, 170, anonymousId2, {
        value: REGISTRATION_FEE,
      });

      info = await contract.getMarathonInfo(marathonId);
      expect(info[4]).to.equal(2);
    });

    it("should increase contract prize pool on registration", async function () {
      const anonymousId = ethers.encodeBytes32String("Runner001");

      await contract.connect(runner1).registerForMarathon(marathonId, 28, 8, 180, anonymousId, {
        value: REGISTRATION_FEE,
      });

      const info = await contract.getMarathonInfo(marathonId);
      expect(info[7]).to.equal(REGISTRATION_FEE);
    });

    it("should reject registration when marathon is full", async function () {
      // Create marathon with capacity of 2
      const smallEventDate = (await time.latest()) + ONE_DAY;
      const smallDeadline = (await time.latest()) + TWELVE_HOURS;
      await contract.createMarathon("Small Marathon", smallEventDate, smallDeadline, 2);
      const smallMarathonId = await contract.currentMarathonId();

      await contract
        .connect(runner1)
        .registerForMarathon(
          smallMarathonId,
          28,
          8,
          180,
          ethers.encodeBytes32String("Runner001"),
          { value: REGISTRATION_FEE }
        );

      await contract
        .connect(runner2)
        .registerForMarathon(
          smallMarathonId,
          30,
          9,
          170,
          ethers.encodeBytes32String("Runner002"),
          { value: REGISTRATION_FEE }
        );

      await expect(
        contract
          .connect(runner3)
          .registerForMarathon(
            smallMarathonId,
            25,
            7,
            190,
            ethers.encodeBytes32String("Runner003"),
            { value: REGISTRATION_FEE }
          )
      ).to.be.revertedWith("Marathon full");
    });

    it("should allow registration with minimum age", async function () {
      const anonymousId = ethers.encodeBytes32String("Runner001");

      await expect(
        contract.connect(runner1).registerForMarathon(marathonId, 1, 1, 300, anonymousId, {
          value: REGISTRATION_FEE,
        })
      ).to.not.be.reverted;
    });

    it("should allow registration with maximum previous time", async function () {
      const anonymousId = ethers.encodeBytes32String("Runner001");

      await expect(
        contract.connect(runner1).registerForMarathon(marathonId, 28, 8, 65535, anonymousId, {
          value: REGISTRATION_FEE,
        })
      ).to.not.be.reverted;
    });
  });

  // ========================================
  // 4. View Functions Tests (5 tests)
  // ========================================
  describe("4. View Functions", function () {
    let contract, contractAddress, marathonId;

    beforeEach(async function () {
      ({ contract, contractAddress } = await loadFixture(deployFixture));
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;

      await contract.createMarathon("View Test Marathon", eventDate, deadline, 100);
      marathonId = await contract.currentMarathonId();

      await contract
        .connect(runner1)
        .registerForMarathon(
          marathonId,
          28,
          8,
          180,
          ethers.encodeBytes32String("ViewRunner"),
          { value: REGISTRATION_FEE }
        );
    });

    it("should return correct marathon information", async function () {
      const info = await contract.getMarathonInfo(marathonId);

      expect(info[0]).to.equal("View Test Marathon");
      expect(info[4]).to.equal(1); // current registrations
      expect(info[5]).to.equal(true); // is active
      expect(info[6]).to.equal(false); // is completed
      expect(info[7]).to.equal(REGISTRATION_FEE); // prize pool
    });

    it("should return correct runner status", async function () {
      const status = await contract.getRunnerStatus(marathonId, runner1.address);

      expect(status[0]).to.equal(true); // has registered
      expect(status[1]).to.equal(false); // has finished
      expect(status[2]).to.equal(ethers.encodeBytes32String("ViewRunner")); // anonymous ID
    });

    it("should return empty status for non-registered runner", async function () {
      const status = await contract.getRunnerStatus(marathonId, runner2.address);

      expect(status[0]).to.equal(false); // has registered
      expect(status[1]).to.equal(false); // has finished
    });

    it("should return empty leaderboard for new marathon", async function () {
      const leaderboard = await contract.getLeaderboard(marathonId);

      expect(leaderboard[0].length).to.equal(0); // anonymousIds
      expect(leaderboard[1].length).to.equal(0); // finishTimes
      expect(leaderboard[2].length).to.equal(0); // isRevealed
    });

    it("should revert for non-existent marathon", async function () {
      await expect(contract.getMarathonInfo(999)).to.be.revertedWith("Marathon does not exist");
    });
  });

  // ========================================
  // 5. Access Control Tests (5 tests)
  // ========================================
  describe("5. Access Control", function () {
    let contract, contractAddress, marathonId;
    let eventDate, deadline;

    beforeEach(async function () {
      ({ contract, contractAddress } = await loadFixture(deployFixture));
      eventDate = (await time.latest()) + ONE_DAY;
      deadline = (await time.latest()) + TWELVE_HOURS;

      await contract.createMarathon("Access Test Marathon", eventDate, deadline, 100);
      marathonId = await contract.currentMarathonId();

      await contract
        .connect(runner1)
        .registerForMarathon(
          marathonId,
          28,
          8,
          180,
          ethers.encodeBytes32String("AccessRunner"),
          { value: REGISTRATION_FEE }
        );
    });

    it("should allow organizer to update registration fee", async function () {
      const newFee = ethers.parseEther("0.002");

      await expect(contract.connect(organizer).updateRegistrationFee(newFee)).to.not.be.reverted;

      expect(await contract.registrationFee()).to.equal(newFee);
    });

    it("should not allow non-organizer to update fee", async function () {
      const newFee = ethers.parseEther("0.002");

      await expect(
        contract.connect(runner1).updateRegistrationFee(newFee)
      ).to.be.revertedWith("Only organizer can perform this action");
    });

    it("should allow organizer to record finish time", async function () {
      await time.increaseTo(eventDate + 1);

      await expect(contract.connect(organizer).recordFinishTime(marathonId, runner1.address, 180))
        .to.not.be.reverted;
    });

    it("should not allow non-organizer to record finish time", async function () {
      await time.increaseTo(eventDate + 1);

      await expect(
        contract.connect(runner2).recordFinishTime(marathonId, runner1.address, 180)
      ).to.be.revertedWith("Only organizer can perform this action");
    });

    it("should allow organizer to cancel marathon", async function () {
      await expect(contract.connect(organizer).cancelMarathon(marathonId)).to.not.be.reverted;
    });
  });

  // ========================================
  // 6. Edge Cases and Boundary Tests (5 tests)
  // ========================================
  describe("6. Edge Cases and Boundary Tests", function () {
    let contract, contractAddress;

    beforeEach(async function () {
      ({ contract, contractAddress } = await loadFixture(deployFixture));
    });

    it("should handle zero age registration", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;
      await contract.createMarathon("Edge Marathon", eventDate, deadline, 100);
      const marathonId = await contract.currentMarathonId();

      await expect(
        contract
          .connect(runner1)
          .registerForMarathon(marathonId, 0, 5, 180, ethers.encodeBytes32String("EdgeRunner"), {
            value: REGISTRATION_FEE,
          })
      ).to.not.be.reverted;
    });

    it("should handle zero previous time", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;
      await contract.createMarathon("Edge Marathon", eventDate, deadline, 100);
      const marathonId = await contract.currentMarathonId();

      await expect(
        contract
          .connect(runner1)
          .registerForMarathon(marathonId, 28, 5, 0, ethers.encodeBytes32String("EdgeRunner"), {
            value: REGISTRATION_FEE,
          })
      ).to.not.be.reverted;
    });

    it("should handle excess registration fee", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;
      await contract.createMarathon("Edge Marathon", eventDate, deadline, 100);
      const marathonId = await contract.currentMarathonId();

      await expect(
        contract
          .connect(runner1)
          .registerForMarathon(marathonId, 28, 5, 180, ethers.encodeBytes32String("EdgeRunner"), {
            value: ethers.parseEther("1.0"),
          })
      ).to.not.be.reverted;
    });

    it("should handle multiple marathons simultaneously", async function () {
      const eventDate1 = (await time.latest()) + ONE_DAY;
      const deadline1 = (await time.latest()) + TWELVE_HOURS;

      const eventDate2 = (await time.latest()) + 2 * ONE_DAY;
      const deadline2 = (await time.latest()) + ONE_DAY;

      await contract.createMarathon("Marathon 1", eventDate1, deadline1, 100);
      await contract.createMarathon("Marathon 2", eventDate2, deadline2, 50);

      const id1 = 1;
      const id2 = 2;

      await contract
        .connect(runner1)
        .registerForMarathon(id1, 28, 8, 180, ethers.encodeBytes32String("Runner1M1"), {
          value: REGISTRATION_FEE,
        });

      await contract
        .connect(runner1)
        .registerForMarathon(id2, 28, 8, 180, ethers.encodeBytes32String("Runner1M2"), {
          value: REGISTRATION_FEE,
        });

      const status1 = await contract.getRunnerStatus(id1, runner1.address);
      const status2 = await contract.getRunnerStatus(id2, runner1.address);

      expect(status1[0]).to.equal(true);
      expect(status2[0]).to.equal(true);
    });

    it("should handle marathon at edge of deadline", async function () {
      const eventDate = (await time.latest()) + ONE_DAY;
      const deadline = (await time.latest()) + TWELVE_HOURS;

      await contract.createMarathon("Deadline Marathon", eventDate, deadline, 100);
      const marathonId = await contract.currentMarathonId();

      // Register just before deadline
      await time.increaseTo(deadline - 10);

      await expect(
        contract
          .connect(runner1)
          .registerForMarathon(
            marathonId,
            28,
            8,
            180,
            ethers.encodeBytes32String("DeadlineRunner"),
            { value: REGISTRATION_FEE }
          )
      ).to.not.be.reverted;
    });
  });
});
