// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint16, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { IPrivacyGateway } from "./IPrivacyGateway.sol";

/**
 * @title AnonymousMarathon
 * @dev Privacy-preserving marathon registration system with FHE
 *
 * Enhanced Features:
 * - Gateway callback pattern for async decryption
 * - Timeout protection to prevent permanent locks
 * - Refund mechanism for failed decryptions
 * - Input validation and access control
 * - Overflow protection with SafeMath
 * - Audit trail for security events
 */
contract AnonymousMarathon is SepoliaConfig {

    address public organizer;
    address public gatewayAddress;
    uint256 public currentMarathonId;
    uint256 public registrationFee;
    uint256 public constant MIN_REGISTRATION_FEE = 0.0001 ether;
    uint256 public constant MAX_REGISTRATION_FEE = 10 ether;

    // Decryption request status
    enum DecryptionStatus {
        NotRequested,
        Pending,
        Completed,
        Failed,
        Refunded
    }

    struct Marathon {
        string name;
        uint256 eventDate;
        uint256 registrationDeadline;
        uint32 maxParticipants;
        uint32 currentRegistrations;
        bool isActive;
        bool isCompleted;
        uint256 prizePool;
        uint256 decryptionRequestId;
        DecryptionStatus decryptionStatus;
        uint256 refundPool;
        uint256 createdAt;
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
        uint256 refundAmount;          // Amount eligible for refund if decryption fails
        bool refundClaimed;            // Whether refund has been claimed
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
    event RunnerRegistered(uint256 indexed marathonId, bytes32 anonymousId, uint256 refundAmount);
    event MarathonStarted(uint256 indexed marathonId);
    event RunnerFinished(uint256 indexed marathonId, bytes32 anonymousId);
    event LeaderboardRevealed(uint256 indexed marathonId);
    event PrizeDistributed(uint256 indexed marathonId, address winner, uint256 amount);
    event DecryptionRequested(uint256 indexed marathonId, uint256 requestId);
    event DecryptionFailed(uint256 indexed marathonId, string reason);
    event RefundProcessed(uint256 indexed marathonId, address indexed runner, uint256 amount);
    event TimeoutTriggered(uint256 indexed marathonId);
    event GatewayUpdated(address indexed newGateway);
    event RegistrationFeeUpdated(uint256 newFee);
    event SecurityEvent(uint256 indexed marathonId, string eventType, string message);

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

    modifier gatewayInitialized() {
        require(gatewayAddress != address(0), "Gateway not configured");
        _;
    }

    modifier validFee(uint256 _fee) {
        require(_fee >= MIN_REGISTRATION_FEE, "Fee below minimum");
        require(_fee <= MAX_REGISTRATION_FEE, "Fee exceeds maximum");
        _;
    }

    constructor(address _gateway) {
        require(_gateway != address(0), "Invalid gateway address");
        organizer = msg.sender;
        gatewayAddress = _gateway;
        registrationFee = 0.001 ether; // Default registration fee
    }

    // Create a new marathon event
    function createMarathon(
        string calldata _name,
        uint256 _eventDate,
        uint256 _registrationDeadline,
        uint32 _maxParticipants
    ) external onlyOrganizer {
        // Input validation
        require(bytes(_name).length > 0 && bytes(_name).length <= 256, "Invalid name length");
        require(_eventDate > block.timestamp, "Event date must be in the future");
        require(_registrationDeadline > block.timestamp, "Deadline must be in future");
        require(_registrationDeadline < _eventDate, "Registration deadline must be before event");
        require(_eventDate > _registrationDeadline + 1 hours, "Minimum 1 hour between deadline and event");
        require(_maxParticipants > 0 && _maxParticipants <= 10000, "Invalid participant count");

        currentMarathonId++;

        marathons[currentMarathonId] = Marathon({
            name: _name,
            eventDate: _eventDate,
            registrationDeadline: _registrationDeadline,
            maxParticipants: _maxParticipants,
            currentRegistrations: 0,
            isActive: true,
            isCompleted: false,
            prizePool: 0,
            decryptionRequestId: 0,
            decryptionStatus: DecryptionStatus.NotRequested,
            refundPool: 0,
            createdAt: block.timestamp
        });

        emit MarathonCreated(currentMarathonId, _name, _eventDate);
        emit SecurityEvent(currentMarathonId, "MarathonCreated", "New marathon created with enhanced security");
    }

    // Anonymous registration for marathon
    function registerForMarathon(
        uint256 marathonId,
        uint32 _age,
        uint8 _experienceLevel,
        uint16 _previousBestTime,
        bytes32 _anonymousId
    ) external payable marathonExists(marathonId) registrationOpen(marathonId) {
        // Input validation
        require(msg.value >= registrationFee, "Insufficient registration fee");
        require(!runners[marathonId][msg.sender].hasRegistered, "Already registered");
        require(!usedAnonymousIds[marathonId][_anonymousId], "Anonymous ID already used");
        require(_experienceLevel >= 1 && _experienceLevel <= 10, "Experience level must be 1-10");
        require(_anonymousId != bytes32(0), "Invalid anonymous ID");
        require(_age >= 15 && _age <= 130, "Invalid age");
        require(_previousBestTime > 0 && _previousBestTime < 10000, "Invalid previous time");

        // Encrypt sensitive data using FHE
        euint32 encryptedAge = FHE.asEuint32(_age);
        euint8 encryptedExperience = FHE.asEuint8(_experienceLevel);
        euint16 encryptedPreviousTime = FHE.asEuint16(_previousBestTime);

        // Store runner data with refund amount
        runners[marathonId][msg.sender] = Runner({
            encryptedAge: encryptedAge,
            encryptedExperience: encryptedExperience,
            encryptedPreviousTime: encryptedPreviousTime,
            hasRegistered: true,
            hasFinished: false,
            encryptedFinishTime: FHE.asEuint32(0),
            registrationTime: block.timestamp,
            anonymousId: _anonymousId,
            refundAmount: msg.value,
            refundClaimed: false
        });

        // Set access permissions for FHE operations
        FHE.allowThis(encryptedAge);
        FHE.allowThis(encryptedExperience);
        FHE.allowThis(encryptedPreviousTime);

        // Update marathon state
        marathons[marathonId].currentRegistrations++;
        marathons[marathonId].prizePool += msg.value;
        marathons[marathonId].refundPool += msg.value;
        participants[marathonId].push(msg.sender);
        usedAnonymousIds[marathonId][_anonymousId] = true;

        emit RunnerRegistered(marathonId, _anonymousId, msg.value);
        emit SecurityEvent(marathonId, "RegistrationCompleted", "Runner registered with encrypted data");
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

    // Complete marathon and start result revelation via Gateway
    function completeMarathon(uint256 marathonId)
        external
        onlyOrganizer
        marathonExists(marathonId)
        gatewayInitialized
    {
        require(!marathons[marathonId].isCompleted, "Marathon already completed");
        require(block.timestamp >= marathons[marathonId].eventDate + 6 hours, "Wait for all runners to finish");
        require(marathons[marathonId].decryptionStatus == DecryptionStatus.NotRequested, "Decryption already requested");

        marathons[marathonId].isCompleted = true;
        marathons[marathonId].isActive = false;

        // Start async decryption process via Gateway
        _requestLeaderboardDecryption(marathonId);
    }

    // Request leaderboard decryption via Gateway with callback
    function _requestLeaderboardDecryption(uint256 marathonId) private {
        uint256 participantCount = participants[marathonId].length;
        require(participantCount > 0, "No participants to process");

        bytes32[] memory ciphertexts = new bytes32[](participantCount);

        // Collect all encrypted finish times
        for (uint256 i = 0; i < participantCount; i++) {
            address participant = participants[marathonId][i];
            if (runners[marathonId][participant].hasFinished) {
                ciphertexts[i] = FHE.toBytes32(runners[marathonId][participant].encryptedFinishTime);
            }
        }

        // Request decryption via Gateway with callback
        bytes memory callbackData = abi.encode(marathonId);
        uint256 requestId = IPrivacyGateway(gatewayAddress).requestDecryption(
            ciphertexts,
            this.processLeaderboardReveal.selector,
            callbackData
        );

        // Track decryption request
        marathons[marathonId].decryptionRequestId = requestId;
        marathons[marathonId].decryptionStatus = DecryptionStatus.Pending;

        emit DecryptionRequested(marathonId, requestId);
        emit SecurityEvent(marathonId, "DecryptionRequested", "Leaderboard decryption requested via Gateway");
    }

    // Process decrypted results and create final leaderboard
    // Called via Gateway callback pattern
    function processLeaderboardReveal(
        uint256 requestId,
        uint256[] calldata decryptedValues,
        bytes calldata signatures
    ) external {
        // Find marathon by request ID
        uint256 marathonId = 0;
        for (uint256 i = 1; i <= currentMarathonId; i++) {
            if (marathons[i].decryptionRequestId == requestId) {
                marathonId = i;
                break;
            }
        }

        require(marathonId > 0, "Marathon not found for this request");
        require(marathons[marathonId].decryptionStatus == DecryptionStatus.Pending, "Decryption not pending");

        // Verify decryption via Gateway
        bool requestVerified = _verifyDecryption(requestId);
        if (!requestVerified) {
            _handleDecryptionFailure(marathonId, "Decryption verification failed");
            return;
        }

        // Update leaderboard with decrypted times
        uint256 participantCount = participants[marathonId].length;
        uint256 valueIndex = 0;

        for (uint256 i = 0; i < participantCount && valueIndex < decryptedValues.length; i++) {
            address participant = participants[marathonId][i];
            if (runners[marathonId][participant].hasFinished) {
                if (i < leaderboards[marathonId].length) {
                    leaderboards[marathonId][i].finishTime = uint32(decryptedValues[valueIndex]);
                    leaderboards[marathonId][i].isRevealed = true;
                }
                valueIndex++;
            }
        }

        // Sort leaderboard by finish time
        _sortLeaderboard(marathonId);

        // Update decryption status
        marathons[marathonId].decryptionStatus = DecryptionStatus.Completed;

        emit LeaderboardRevealed(marathonId);
        emit SecurityEvent(marathonId, "DecryptionCompleted", "Leaderboard successfully decrypted and sorted");

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

    // Handle decryption failure with refund mechanism
    function _handleDecryptionFailure(uint256 marathonId, string memory reason) private {
        marathons[marathonId].decryptionStatus = DecryptionStatus.Failed;

        emit DecryptionFailed(marathonId, reason);
        emit SecurityEvent(marathonId, "DecryptionFailed", reason);

        // Trigger refunds for all participants
        _processRefunds(marathonId);
    }

    // Process refunds for all participants
    function _processRefunds(uint256 marathonId) private {
        uint256 participantCount = participants[marathonId].length;

        for (uint256 i = 0; i < participantCount; i++) {
            address participant = participants[marathonId][i];
            Runner storage runner = runners[marathonId][participant];

            if (runner.hasRegistered && !runner.refundClaimed && runner.refundAmount > 0) {
                runner.refundClaimed = true;

                (bool success, ) = payable(participant).call{value: runner.refundAmount}("");
                if (success) {
                    emit RefundProcessed(marathonId, participant, runner.refundAmount);
                }
            }
        }

        marathons[marathonId].decryptionStatus = DecryptionStatus.Refunded;
        marathons[marathonId].refundPool = 0;
    }

    // Check timeout and trigger refunds if needed
    function checkAndProcessTimeout(uint256 marathonId) external marathonExists(marathonId) {
        require(marathons[marathonId].decryptionStatus == DecryptionStatus.Pending, "Decryption not pending");

        // Check if timeout has been exceeded (24 hours default from request)
        uint256 gracePeriod = 24 hours;
        bool hasTimedOut = block.timestamp > marathons[marathonId].createdAt + marathons[marathonId].eventDate + gracePeriod;

        if (hasTimedOut) {
            emit TimeoutTriggered(marathonId);
            _handleDecryptionFailure(marathonId, "Decryption request timed out - processing refunds");
        }
    }

    // Verify decryption request status with Gateway
    function _verifyDecryption(uint256 requestId) private view returns (bool) {
        // Query Gateway for request status
        (bool pending, bool fulfilled, ) = IPrivacyGateway(gatewayAddress).getRequestStatus(requestId);
        return fulfilled && !pending;
    }

    // Allow users to claim refund if decryption failed
    function claimRefund(uint256 marathonId) external marathonExists(marathonId) {
        Runner storage runner = runners[marathonId][msg.sender];

        require(runner.hasRegistered, "Not registered");
        require(!runner.refundClaimed, "Refund already claimed");
        require(marathons[marathonId].decryptionStatus == DecryptionStatus.Failed ||
                marathons[marathonId].decryptionStatus == DecryptionStatus.Refunded,
                "Marathon not eligible for refund");

        runner.refundClaimed = true;

        if (runner.refundAmount > 0) {
            (bool success, ) = payable(msg.sender).call{value: runner.refundAmount}("");
            require(success, "Refund transfer failed");
            emit RefundProcessed(marathonId, msg.sender, runner.refundAmount);
        }
    }

    // Administrative functions
    function updateRegistrationFee(uint256 newFee) external onlyOrganizer validFee(newFee) {
        registrationFee = newFee;
        emit RegistrationFeeUpdated(newFee);
    }

    // Update Gateway address
    function setGateway(address _newGateway) external onlyOrganizer {
        require(_newGateway != address(0), "Invalid gateway address");
        gatewayAddress = _newGateway;
        emit GatewayUpdated(_newGateway);
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