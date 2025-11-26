// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IPrivacyGateway } from "./IPrivacyGateway.sol";

/**
 * @title PrivacyGateway
 * @dev Gateway for privacy-preserving decryption with callback mechanism and timeout protection
 *
 * Architecture: User → Contract → Gateway → Oracle Decryption → Callback
 *
 * Features:
 * - Async decryption with callback mechanism
 * - Timeout protection to prevent permanent locks
 * - Refund mechanism for failed decryptions
 * - Request tracking and status monitoring
 */
contract PrivacyGateway is IPrivacyGateway {
    // Request status tracking
    enum RequestStatus {
        Pending,
        Fulfilled,
        Failed,
        Refunded
    }

    struct DecryptionRequest {
        address requester;
        address callbackContract;
        bytes4 callbackSelector;
        bytes calldata_data;
        uint256 timestamp;
        uint256 timeout;
        RequestStatus status;
        string failureReason;
        uint256 refundAmount;
        bool refundClaimed;
    }

    // State variables
    address public oracle;
    address public owner;
    uint256 public defaultTimeout = 24 hours;
    uint256 public constant MIN_TIMEOUT = 1 hours;
    uint256 public constant MAX_TIMEOUT = 30 days;
    uint256 public requestCounter;

    // Mappings
    mapping(uint256 => DecryptionRequest) public requests;
    mapping(address => uint256) public pendingRefunds;

    // Events
    event DecryptionRequested(
        uint256 indexed requestId,
        address indexed requester,
        address indexed callbackContract,
        uint256 timeout
    );

    event DecryptionFulfilled(
        uint256 indexed requestId,
        address indexed callbackContract,
        bool success
    );

    event DecryptionFailed(
        uint256 indexed requestId,
        address indexed requester,
        string reason
    );

    event RefundProcessed(
        uint256 indexed requestId,
        address indexed requester,
        uint256 amount
    );

    event TimeoutOccurred(
        uint256 indexed requestId,
        address indexed requester
    );

    event OracleUpdated(address indexed newOracle);
    event TimeoutUpdated(uint256 newTimeout);

    // Modifiers
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can fulfill requests");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier validRequest(uint256 requestId) {
        require(requestId > 0 && requestId <= requestCounter, "Invalid request ID");
        _;
    }

    constructor(address _oracle) {
        require(_oracle != address(0), "Invalid oracle address");
        oracle = _oracle;
        owner = msg.sender;
    }

    /**
     * @notice Request encrypted data decryption with callback
     * @param ciphertexts Array of encrypted data to decrypt
     * @param callbackSelector Function selector to call with results
     * @param callbackData Additional data to pass to callback
     * @return requestId Unique identifier for the request
     */
    function requestDecryption(
        bytes32[] calldata ciphertexts,
        bytes4 callbackSelector,
        bytes calldata callbackData
    ) external override returns (uint256 requestId) {
        require(ciphertexts.length > 0, "Must provide ciphertexts");
        require(callbackSelector != bytes4(0), "Invalid callback selector");

        requestCounter++;
        requestId = requestCounter;

        requests[requestId] = DecryptionRequest({
            requester: msg.sender,
            callbackContract: msg.sender,
            callbackSelector: callbackSelector,
            calldata_data: callbackData,
            timestamp: block.timestamp,
            timeout: defaultTimeout,
            status: RequestStatus.Pending,
            failureReason: "",
            refundAmount: 0,
            refundClaimed: false
        });

        emit DecryptionRequested(
            requestId,
            msg.sender,
            msg.sender,
            defaultTimeout
        );

        return requestId;
    }

    /**
     * @notice Fulfill decryption request and invoke callback
     * @param requestId Original request identifier
     * @param decryptedValues Array of decrypted values
     * @param signatures Proof of valid decryption
     */
    function fulfillDecryption(
        uint256 requestId,
        uint256[] calldata decryptedValues,
        bytes calldata signatures
    ) external override onlyOracle validRequest(requestId) {
        DecryptionRequest storage request = requests[requestId];

        require(
            request.status == RequestStatus.Pending,
            "Request already processed"
        );

        // Check timeout
        if (block.timestamp > request.timestamp + request.timeout) {
            _handleDecryptionFailure(
                requestId,
                "Decryption request timed out"
            );
            return;
        }

        // Invoke callback
        (bool success, ) = request.callbackContract.call(
            abi.encodeWithSelector(
                request.callbackSelector,
                requestId,
                decryptedValues,
                signatures
            )
        );

        if (success) {
            request.status = RequestStatus.Fulfilled;
            emit DecryptionFulfilled(requestId, request.callbackContract, true);
        } else {
            _handleDecryptionFailure(
                requestId,
                "Callback execution failed"
            );
        }
    }

    /**
     * @notice Handle decryption failure with refund mechanism
     * @param requestId Request identifier
     * @param reason Failure reason
     */
    function _handleDecryptionFailure(
        uint256 requestId,
        string memory reason
    ) internal {
        DecryptionRequest storage request = requests[requestId];

        request.status = RequestStatus.Failed;
        request.failureReason = reason;

        // Initialize refund (implementation depends on caller's design)
        // Contract can override to implement specific refund logic
        request.refundAmount = 0;

        emit DecryptionFailed(requestId, request.requester, reason);
    }

    /**
     * @notice Claim refund for failed or timed-out request
     * @param requestId Request identifier
     */
    function claimRefund(uint256 requestId)
        external
        validRequest(requestId)
    {
        DecryptionRequest storage request = requests[requestId];

        require(
            msg.sender == request.requester,
            "Only requester can claim refund"
        );

        require(
            request.status == RequestStatus.Failed ||
            block.timestamp > request.timestamp + request.timeout,
            "Request not eligible for refund"
        );

        require(!request.refundClaimed, "Refund already claimed");

        request.refundClaimed = true;
        request.status = RequestStatus.Refunded;

        uint256 refundAmount = request.refundAmount;
        if (refundAmount > 0) {
            (bool success, ) = payable(request.requester).call{
                value: refundAmount
            }("");
            require(success, "Refund transfer failed");
        }

        emit RefundProcessed(requestId, request.requester, refundAmount);
    }

    /**
     * @notice Check if request has timed out
     * @param requestId Request identifier
     * @return hasTimedOut Whether request has exceeded timeout
     */
    function hasRequestTimedOut(uint256 requestId)
        external
        view
        validRequest(requestId)
        returns (bool hasTimedOut)
    {
        DecryptionRequest storage request = requests[requestId];
        return block.timestamp > request.timestamp + request.timeout;
    }

    /**
     * @notice Get request status
     * @param requestId Request identifier
     * @return pending Whether request is still pending
     * @return fulfilled Whether request has been fulfilled
     * @return failureReason Reason if failed
     */
    function getRequestStatus(uint256 requestId)
        external
        view
        override
        validRequest(requestId)
        returns (
            bool pending,
            bool fulfilled,
            string memory failureReason
        )
    {
        DecryptionRequest storage request = requests[requestId];

        pending = request.status == RequestStatus.Pending &&
            block.timestamp <= request.timestamp + request.timeout;
        fulfilled = request.status == RequestStatus.Fulfilled;
        failureReason = request.failureReason;
    }

    /**
     * @notice Get full request details
     * @param requestId Request identifier
     * @return requester Address that made the request
     * @return status Current status of the request
     * @return timestamp When request was created
     * @return elapsed Time elapsed since request
     * @return timeRemaining Time remaining before timeout
     */
    function getRequestDetails(uint256 requestId)
        external
        view
        validRequest(requestId)
        returns (
            address requester,
            RequestStatus status,
            uint256 timestamp,
            uint256 elapsed,
            uint256 timeRemaining
        )
    {
        DecryptionRequest storage request = requests[requestId];
        uint256 now = block.timestamp;

        requester = request.requester;
        status = request.status;
        timestamp = request.timestamp;
        elapsed = now - request.timestamp;

        if (now > request.timestamp + request.timeout) {
            timeRemaining = 0;
        } else {
            timeRemaining = request.timestamp + request.timeout - now;
        }
    }

    // Admin functions

    /**
     * @notice Update oracle address
     * @param _newOracle New oracle address
     */
    function setOracle(address _newOracle) external onlyOwner {
        require(_newOracle != address(0), "Invalid oracle address");
        oracle = _newOracle;
        emit OracleUpdated(_newOracle);
    }

    /**
     * @notice Update default timeout duration
     * @param _timeout New timeout in seconds
     */
    function setDefaultTimeout(uint256 _timeout) external onlyOwner {
        require(_timeout >= MIN_TIMEOUT, "Timeout too short");
        require(_timeout <= MAX_TIMEOUT, "Timeout too long");
        defaultTimeout = _timeout;
        emit TimeoutUpdated(_timeout);
    }

    /**
     * @notice Recover accidentally sent funds (not from refunds)
     */
    function recoverFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        uint256 refundableAmount = 0;

        // Calculate total pending refunds
        for (uint256 i = 1; i <= requestCounter; i++) {
            if (requests[i].status == RequestStatus.Failed && !requests[i].refundClaimed) {
                refundableAmount += requests[i].refundAmount;
            }
        }

        require(balance > refundableAmount, "Insufficient excess funds");
        (bool success, ) = payable(owner).call{value: balance - refundableAmount}("");
        require(success, "Recovery transfer failed");
    }

    // Fallback functions
    receive() external payable {}
}
