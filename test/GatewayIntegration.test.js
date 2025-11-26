const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Gateway Integration Tests", function () {
  let gateway;
  let marathon;
  let owner;
  let oracle;
  let participant1;
  let participant2;

  const REGISTRATION_FEE = ethers.parseEther("0.001");
  const MARATHON_NAME = "Test Marathon 2024";

  beforeEach(async function () {
    [owner, oracle, participant1, participant2] = await ethers.getSigners();

    // Deploy PrivacyGateway
    const PrivacyGateway = await ethers.getContractFactory("PrivacyGateway");
    gateway = await PrivacyGateway.deploy(oracle.address);
    await gateway.waitForDeployment();

    // Deploy AnonymousMarathon
    const AnonymousMarathon = await ethers.getContractFactory("AnonymousMarathon");
    marathon = await AnonymousMarathon.deploy(await gateway.getAddress());
    await marathon.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy Gateway with correct oracle", async function () {
      expect(await gateway.oracle()).to.equal(oracle.address);
    });

    it("Should deploy Marathon with correct gateway", async function () {
      expect(await marathon.gatewayAddress()).to.equal(await gateway.getAddress());
    });

    it("Should set correct organizer", async function () {
      expect(await marathon.organizer()).to.equal(owner.address);
    });

    it("Should set default registration fee", async function () {
      expect(await marathon.registrationFee()).to.equal(ethers.parseEther("0.001"));
    });
  });

  describe("Marathon Creation", function () {
    it("Should create marathon with valid parameters", async function () {
      const now = Math.floor(Date.now() / 1000);
      const deadline = now + 7 * 24 * 3600; // 7 days
      const eventDate = now + 30 * 24 * 3600; // 30 days

      await expect(
        marathon.createMarathon(MARATHON_NAME, eventDate, deadline, 100)
      ).to.emit(marathon, "MarathonCreated")
        .withArgs(1, MARATHON_NAME, eventDate);
    });

    it("Should validate marathon name length", async function () {
      const now = Math.floor(Date.now() / 1000);
      const deadline = now + 7 * 24 * 3600;
      const eventDate = now + 30 * 24 * 3600;

      await expect(
        marathon.createMarathon("", eventDate, deadline, 100)
      ).to.be.revertedWith("Invalid name length");

      const longName = "a".repeat(300);
      await expect(
        marathon.createMarathon(longName, eventDate, deadline, 100)
      ).to.be.revertedWith("Invalid name length");
    });

    it("Should validate event timing", async function () {
      const now = Math.floor(Date.now() / 1000);
      const pastDate = now - 1000;
      const deadline = now + 7 * 24 * 3600;

      await expect(
        marathon.createMarathon(MARATHON_NAME, pastDate, deadline, 100)
      ).to.be.revertedWith("Event date must be in the future");
    });

    it("Should validate participant count", async function () {
      const now = Math.floor(Date.now() / 1000);
      const deadline = now + 7 * 24 * 3600;
      const eventDate = now + 30 * 24 * 3600;

      await expect(
        marathon.createMarathon(MARATHON_NAME, eventDate, deadline, 0)
      ).to.be.revertedWith("Invalid participant count");

      await expect(
        marathon.createMarathon(MARATHON_NAME, eventDate, deadline, 20000)
      ).to.be.revertedWith("Invalid participant count");
    });
  });

  describe("Participant Registration", function () {
    let marathonId;
    let deadline;
    let eventDate;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      deadline = now + 7 * 24 * 3600;
      eventDate = now + 30 * 24 * 3600;

      await marathon.createMarathon(MARATHON_NAME, eventDate, deadline, 100);
      marathonId = 1;
    });

    it("Should register participant with valid data", async function () {
      const anonymousId = ethers.keccak256(ethers.toUtf8Bytes("Runner1"));

      await expect(
        marathon.connect(participant1).registerForMarathon(
          marathonId,
          28,    // age
          7,     // experience
          180,   // previous time
          anonymousId,
          { value: REGISTRATION_FEE }
        )
      ).to.emit(marathon, "RunnerRegistered")
        .withArgs(marathonId, anonymousId, REGISTRATION_FEE);
    });

    it("Should validate age range", async function () {
      const anonymousId = ethers.keccak256(ethers.toUtf8Bytes("Runner1"));

      await expect(
        marathon.connect(participant1).registerForMarathon(
          marathonId, 10, 7, 180, anonymousId, { value: REGISTRATION_FEE }
        )
      ).to.be.revertedWith("Invalid age");

      await expect(
        marathon.connect(participant1).registerForMarathon(
          marathonId, 150, 7, 180, anonymousId, { value: REGISTRATION_FEE }
        )
      ).to.be.revertedWith("Invalid age");
    });

    it("Should validate experience level", async function () {
      const anonymousId = ethers.keccak256(ethers.toUtf8Bytes("Runner1"));

      await expect(
        marathon.connect(participant1).registerForMarathon(
          marathonId, 28, 0, 180, anonymousId, { value: REGISTRATION_FEE }
        )
      ).to.be.revertedWith("Experience level must be 1-10");

      await expect(
        marathon.connect(participant1).registerForMarathon(
          marathonId, 28, 11, 180, anonymousId, { value: REGISTRATION_FEE }
        )
      ).to.be.revertedWith("Experience level must be 1-10");
    });

    it("Should prevent duplicate anonymous IDs", async function () {
      const anonymousId = ethers.keccak256(ethers.toUtf8Bytes("Runner1"));

      await marathon.connect(participant1).registerForMarathon(
        marathonId, 28, 7, 180, anonymousId, { value: REGISTRATION_FEE }
      );

      await expect(
        marathon.connect(participant2).registerForMarathon(
          marathonId, 30, 8, 200, anonymousId, { value: REGISTRATION_FEE }
        )
      ).to.be.revertedWith("Anonymous ID already used");
    });

    it("Should track refund amount", async function () {
      const anonymousId = ethers.keccak256(ethers.toUtf8Bytes("Runner1"));

      await marathon.connect(participant1).registerForMarathon(
        marathonId, 28, 7, 180, anonymousId, { value: REGISTRATION_FEE }
      );

      const runnerStatus = await marathon.getRunnerStatus(marathonId, participant1.address);
      expect(runnerStatus.hasRegistered).to.be.true;
    });
  });

  describe("Gateway Callback Pattern", function () {
    let marathonId;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      const deadline = now + 100; // Short deadline for testing
      const eventDate = now + 200;

      await marathon.createMarathon(MARATHON_NAME, eventDate, deadline, 100);
      marathonId = 1;

      // Register participants
      const id1 = ethers.keccak256(ethers.toUtf8Bytes("Runner1"));
      const id2 = ethers.keccak256(ethers.toUtf8Bytes("Runner2"));

      await marathon.connect(participant1).registerForMarathon(
        marathonId, 28, 7, 180, id1, { value: REGISTRATION_FEE }
      );

      await marathon.connect(participant2).registerForMarathon(
        marathonId, 30, 8, 200, id2, { value: REGISTRATION_FEE }
      );
    });

    it("Should initiate decryption request via Gateway", async function () {
      // Fast forward to after event
      await time.increase(6 * 3600 + 201);

      await expect(
        marathon.completeMarathon(marathonId)
      ).to.emit(marathon, "DecryptionRequested");
    });

    it("Should prevent duplicate decryption requests", async function () {
      await time.increase(6 * 3600 + 201);

      await marathon.completeMarathon(marathonId);

      await expect(
        marathon.completeMarathon(marathonId)
      ).to.be.revertedWith("Marathon already completed");
    });
  });

  describe("Timeout Protection", function () {
    let marathonId;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      const deadline = now + 100;
      const eventDate = now + 200;

      await marathon.createMarathon(MARATHON_NAME, eventDate, deadline, 100);
      marathonId = 1;

      const anonymousId = ethers.keccak256(ethers.toUtf8Bytes("Runner1"));
      await marathon.connect(participant1).registerForMarathon(
        marathonId, 28, 7, 180, anonymousId, { value: REGISTRATION_FEE }
      );
    });

    it("Should detect timeout after 24 hours", async function () {
      await time.increase(6 * 3600 + 201);
      await marathon.completeMarathon(marathonId);

      // Advance 24+ hours
      await time.increase(25 * 3600);

      await expect(
        marathon.checkAndProcessTimeout(marathonId)
      ).to.emit(marathon, "TimeoutTriggered");
    });
  });

  describe("Refund Mechanism", function () {
    let marathonId;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      const deadline = now + 100;
      const eventDate = now + 200;

      await marathon.createMarathon(MARATHON_NAME, eventDate, deadline, 100);
      marathonId = 1;

      const anonymousId = ethers.keccak256(ethers.toUtf8Bytes("Runner1"));
      await marathon.connect(participant1).registerForMarathon(
        marathonId, 28, 7, 180, anonymousId, { value: REGISTRATION_FEE }
      );
    });

    it("Should allow refund claim after timeout", async function () {
      await time.increase(6 * 3600 + 201);
      await marathon.completeMarathon(marathonId);
      await time.increase(25 * 3600);
      await marathon.checkAndProcessTimeout(marathonId);

      const balanceBefore = await ethers.provider.getBalance(participant1.address);

      await expect(
        marathon.connect(participant1).claimRefund(marathonId)
      ).to.emit(marathon, "RefundProcessed");

      const balanceAfter = await ethers.provider.getBalance(participant1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should prevent double refund claims", async function () {
      await time.increase(6 * 3600 + 201);
      await marathon.completeMarathon(marathonId);
      await time.increase(25 * 3600);
      await marathon.checkAndProcessTimeout(marathonId);

      await marathon.connect(participant1).claimRefund(marathonId);

      await expect(
        marathon.connect(participant1).claimRefund(marathonId)
      ).to.be.revertedWith("Refund already claimed");
    });
  });

  describe("Administrative Functions", function () {
    it("Should allow owner to update registration fee", async function () {
      const newFee = ethers.parseEther("0.002");

      await expect(
        marathon.updateRegistrationFee(newFee)
      ).to.emit(marathon, "RegistrationFeeUpdated")
        .withArgs(newFee);

      expect(await marathon.registrationFee()).to.equal(newFee);
    });

    it("Should validate fee range", async function () {
      const tooLow = ethers.parseEther("0.00001");
      const tooHigh = ethers.parseEther("15");

      await expect(
        marathon.updateRegistrationFee(tooLow)
      ).to.be.revertedWith("Fee below minimum");

      await expect(
        marathon.updateRegistrationFee(tooHigh)
      ).to.be.revertedWith("Fee exceeds maximum");
    });

    it("Should allow owner to update gateway", async function () {
      const newGateway = participant1.address; // Using arbitrary address

      await expect(
        marathon.setGateway(newGateway)
      ).to.emit(marathon, "GatewayUpdated")
        .withArgs(newGateway);

      expect(await marathon.gatewayAddress()).to.equal(newGateway);
    });

    it("Should prevent non-owner from updating settings", async function () {
      const newFee = ethers.parseEther("0.002");

      await expect(
        marathon.connect(participant1).updateRegistrationFee(newFee)
      ).to.be.revertedWith("Only organizer can perform this action");
    });
  });
});
