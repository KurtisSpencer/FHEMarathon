// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint16, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AnonymousMarathon is SepoliaConfig {

    address public organizer;
    uint256 public currentMarathonId;
    uint256 public registrationFee;

    struct Marathon {
        string name;
        uint256 eventDate;
        uint256 registrationDeadline;
        uint32 maxParticipants;
        uint32 currentRegistrations;
        bool isActive;
        bool isCompleted;
        uint256 prizePool;
    }

    struct Runner {
        euint32 encryptedAge;          // Encrypted age for privacy
        euint8 encryptedExperience;    // Encrypted experience level (1-10)
        euint16 encryptedPreviousTime; // Previous marathon time in minutes (encrypted)
        bool hasRegistered;
        bool hasFinished;
        euint32 encryptedFinishTime;   // Final finish time (encrypted)
        uint256 registrationTime;
        bytes32 anonymousId;           // Anonymous identifier
    }

    struct LeaderboardEntry {
        bytes32 anonymousId;
        bool isRevealed;
        uint32 finishTime;  // Only revealed after race completion
    }

    mapping(uint256 => Marathon) public marathons;
    mapping(uint256 => mapping(address => Runner)) public runners;
    mapping(uint256 => mapping(bytes32 => bool)) public usedAnonymousIds;
    mapping(uint256 => LeaderboardEntry[]) public leaderboards;
    mapping(uint256 => address[]) public participants;

    event MarathonCreated(uint256 indexed marathonId, string name, uint256 eventDate);
    event RunnerRegistered(uint256 indexed marathonId, bytes32 anonymousId);
    event MarathonStarted(uint256 indexed marathonId);
    event RunnerFinished(uint256 indexed marathonId, bytes32 anonymousId);
    event LeaderboardRevealed(uint256 indexed marathonId);
    event PrizeDistributed(uint256 indexed marathonId, address winner, uint256 amount);

    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Only organizer can perform this action");
        _;
    }

    modifier marathonExists(uint256 marathonId) {
        require(marathonId > 0 && marathonId <= currentMarathonId, "Marathon does not exist");
        _;
    }

    modifier registrationOpen(uint256 marathonId) {
        require(marathons[marathonId].isActive, "Marathon not active");
        require(block.timestamp < marathons[marathonId].registrationDeadline, "Registration closed");
        require(marathons[marathonId].currentRegistrations < marathons[marathonId].maxParticipants, "Marathon full");
        _;
    }

    constructor() {
        organizer = msg.sender;
        registrationFee = 0.001 ether; // Default registration fee
    }

    // Create a new marathon event
    function createMarathon(
        string calldata _name,
        uint256 _eventDate,
        uint256 _registrationDeadline,
        uint32 _maxParticipants
    ) external onlyOrganizer {
        require(_eventDate > block.timestamp, "Event date must be in the future");
        require(_registrationDeadline < _eventDate, "Registration deadline must be before event");
        require(_maxParticipants > 0, "Max participants must be greater than 0");

        currentMarathonId++;

        marathons[currentMarathonId] = Marathon({
            name: _name,
            eventDate: _eventDate,
            registrationDeadline: _registrationDeadline,
            maxParticipants: _maxParticipants,
            currentRegistrations: 0,
            isActive: true,
            isCompleted: false,
            prizePool: 0
        });

        emit MarathonCreated(currentMarathonId, _name, _eventDate);
    }

    // Anonymous registration for marathon
    function registerForMarathon(
        uint256 marathonId,
        uint32 _age,
        uint8 _experienceLevel,
        uint16 _previousBestTime,
        bytes32 _anonymousId
    ) external payable marathonExists(marathonId) registrationOpen(marathonId) {
        require(msg.value >= registrationFee, "Insufficient registration fee");
        require(!runners[marathonId][msg.sender].hasRegistered, "Already registered");
        require(!usedAnonymousIds[marathonId][_anonymousId], "Anonymous ID already used");
        require(_experienceLevel >= 1 && _experienceLevel <= 10, "Experience level must be 1-10");
        require(_anonymousId != bytes32(0), "Invalid anonymous ID");

        // Encrypt sensitive data
        euint32 encryptedAge = FHE.asEuint32(_age);
        euint8 encryptedExperience = FHE.asEuint8(_experienceLevel);
        euint16 encryptedPreviousTime = FHE.asEuint16(_previousBestTime);

        // Store runner data
        runners[marathonId][msg.sender] = Runner({
            encryptedAge: encryptedAge,
            encryptedExperience: encryptedExperience,
            encryptedPreviousTime: encryptedPreviousTime,
            hasRegistered: true,
            hasFinished: false,
            encryptedFinishTime: FHE.asEuint32(0),
            registrationTime: block.timestamp,
            anonymousId: _anonymousId
        });

        // Set access permissions
        FHE.allowThis(encryptedAge);
        FHE.allowThis(encryptedExperience);
        FHE.allowThis(encryptedPreviousTime);

        marathons[marathonId].currentRegistrations++;
        marathons[marathonId].prizePool += msg.value;
        participants[marathonId].push(msg.sender);
        usedAnonymousIds[marathonId][_anonymousId] = true;

        emit RunnerRegistered(marathonId, _anonymousId);
    }

    // Record finish time for a runner (called by organizer with timing system)
    function recordFinishTime(
        uint256 marathonId,
        address runner,
        uint32 finishTimeMinutes
    ) external onlyOrganizer marathonExists(marathonId) {
        require(runners[marathonId][runner].hasRegistered, "Runner not registered");
        require(!runners[marathonId][runner].hasFinished, "Already finished");
        require(block.timestamp >= marathons[marathonId].eventDate, "Marathon not started");

        // Encrypt finish time
        euint32 encryptedFinishTime = FHE.asEuint32(finishTimeMinutes);

        runners[marathonId][runner].encryptedFinishTime = encryptedFinishTime;
        runners[marathonId][runner].hasFinished = true;

        FHE.allowThis(encryptedFinishTime);

        // Add to leaderboard (initially encrypted)
        leaderboards[marathonId].push(LeaderboardEntry({
            anonymousId: runners[marathonId][runner].anonymousId,
            isRevealed: false,
            finishTime: 0  // Will be revealed later
        }));

        emit RunnerFinished(marathonId, runners[marathonId][runner].anonymousId);
    }

    // Complete marathon and start result revelation process
    function completeMarathon(uint256 marathonId) external onlyOrganizer marathonExists(marathonId) {
        require(!marathons[marathonId].isCompleted, "Marathon already completed");
        require(block.timestamp >= marathons[marathonId].eventDate + 6 hours, "Wait for all runners to finish");

        marathons[marathonId].isCompleted = true;
        marathons[marathonId].isActive = false;

        // Start async decryption process for leaderboard
        _revealLeaderboard(marathonId);
    }

    // Reveal leaderboard by decrypting finish times
    function _revealLeaderboard(uint256 marathonId) private {
        uint256 participantCount = participants[marathonId].length;
        bytes32[] memory ciphertexts = new bytes32[](participantCount);

        // Collect all encrypted finish times
        for (uint256 i = 0; i < participantCount; i++) {
            address participant = participants[marathonId][i];
            if (runners[marathonId][participant].hasFinished) {
                ciphertexts[i] = FHE.toBytes32(runners[marathonId][participant].encryptedFinishTime);
            }
        }

        // Request decryption
        FHE.requestDecryption(ciphertexts, this.processLeaderboardReveal.selector);
    }

    // Process decrypted results and create final leaderboard
    function processLeaderboardReveal(
        uint256 requestId,
        uint32[] memory finishTimes,
        bytes memory signatures
    ) external {
        // Create the bytes array for ciphertexts used in verification
        bytes memory ciphertexts = abi.encode(finishTimes.length);
        for (uint256 i = 0; i < finishTimes.length; i++) {
            ciphertexts = abi.encodePacked(ciphertexts, keccak256(abi.encodePacked(requestId, i)));
        }

        FHE.checkSignatures(requestId, ciphertexts, signatures);

        // Update leaderboard with decrypted times
        uint256 marathonId = currentMarathonId; // Simplified - in production, map requestId to marathonId

        for (uint256 i = 0; i < finishTimes.length && i < leaderboards[marathonId].length; i++) {
            leaderboards[marathonId][i].finishTime = finishTimes[i];
            leaderboards[marathonId][i].isRevealed = true;
        }

        // Sort leaderboard by finish time (bubble sort for simplicity)
        _sortLeaderboard(marathonId);

        emit LeaderboardRevealed(marathonId);

        // Distribute prizes to top finishers
        _distributePrizes(marathonId);
    }

    // Sort leaderboard by finish time
    function _sortLeaderboard(uint256 marathonId) private {
        LeaderboardEntry[] storage leaderboard = leaderboards[marathonId];
        uint256 length = leaderboard.length;

        for (uint256 i = 0; i < length - 1; i++) {
            for (uint256 j = 0; j < length - i - 1; j++) {
                if (leaderboard[j].finishTime > leaderboard[j + 1].finishTime) {
                    LeaderboardEntry memory temp = leaderboard[j];
                    leaderboard[j] = leaderboard[j + 1];
                    leaderboard[j + 1] = temp;
                }
            }
        }
    }

    // Distribute prizes to winners
    function _distributePrizes(uint256 marathonId) private {
        uint256 prizePool = marathons[marathonId].prizePool;
        uint256 participantCount = participants[marathonId].length;

        if (participantCount == 0) return;

        // Prize distribution: 50% to 1st, 30% to 2nd, 20% to 3rd
        uint256[] memory prizePercentages = new uint256[](3);
        prizePercentages[0] = 50; // 1st place
        prizePercentages[1] = 30; // 2nd place
        prizePercentages[2] = 20; // 3rd place

        for (uint256 i = 0; i < 3 && i < participantCount; i++) {
            bytes32 winnerAnonymousId = leaderboards[marathonId][i].anonymousId;
            address winner = _findRunnerByAnonymousId(marathonId, winnerAnonymousId);

            if (winner != address(0)) {
                uint256 prize = (prizePool * prizePercentages[i]) / 100;
                payable(winner).transfer(prize);
                emit PrizeDistributed(marathonId, winner, prize);
            }
        }
    }

    // Find runner address by anonymous ID
    function _findRunnerByAnonymousId(uint256 marathonId, bytes32 anonymousId) private view returns (address) {
        for (uint256 i = 0; i < participants[marathonId].length; i++) {
            address participant = participants[marathonId][i];
            if (runners[marathonId][participant].anonymousId == anonymousId) {
                return participant;
            }
        }
        return address(0);
    }

    // View functions
    function getMarathonInfo(uint256 marathonId) external view marathonExists(marathonId) returns (
        string memory name,
        uint256 eventDate,
        uint256 registrationDeadline,
        uint32 maxParticipants,
        uint32 currentRegistrations,
        bool isActive,
        bool isCompleted,
        uint256 prizePool
    ) {
        Marathon storage marathon = marathons[marathonId];
        return (
            marathon.name,
            marathon.eventDate,
            marathon.registrationDeadline,
            marathon.maxParticipants,
            marathon.currentRegistrations,
            marathon.isActive,
            marathon.isCompleted,
            marathon.prizePool
        );
    }

    function getRunnerStatus(uint256 marathonId, address runner) external view returns (
        bool hasRegistered,
        bool hasFinished,
        bytes32 anonymousId,
        uint256 registrationTime
    ) {
        Runner storage runnerData = runners[marathonId][runner];
        return (
            runnerData.hasRegistered,
            runnerData.hasFinished,
            runnerData.anonymousId,
            runnerData.registrationTime
        );
    }

    function getLeaderboard(uint256 marathonId) external view returns (
        bytes32[] memory anonymousIds,
        uint32[] memory finishTimes,
        bool[] memory isRevealed
    ) {
        LeaderboardEntry[] storage leaderboard = leaderboards[marathonId];
        uint256 length = leaderboard.length;

        anonymousIds = new bytes32[](length);
        finishTimes = new uint32[](length);
        isRevealed = new bool[](length);

        for (uint256 i = 0; i < length; i++) {
            anonymousIds[i] = leaderboard[i].anonymousId;
            finishTimes[i] = leaderboard[i].finishTime;
            isRevealed[i] = leaderboard[i].isRevealed;
        }
    }

    // Administrative functions
    function updateRegistrationFee(uint256 newFee) external onlyOrganizer {
        registrationFee = newFee;
    }

    function emergencyWithdraw() external onlyOrganizer {
        payable(organizer).transfer(address(this).balance);
    }

    function cancelMarathon(uint256 marathonId) external onlyOrganizer marathonExists(marathonId) {
        require(!marathons[marathonId].isCompleted, "Cannot cancel completed marathon");

        marathons[marathonId].isActive = false;

        // Refund participants
        for (uint256 i = 0; i < participants[marathonId].length; i++) {
            address participant = participants[marathonId][i];
            if (runners[marathonId][participant].hasRegistered) {
                payable(participant).transfer(registrationFee);
            }
        }

        marathons[marathonId].prizePool = 0;
    }
}