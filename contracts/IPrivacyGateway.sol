// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IPrivacyGateway
 * @dev Interface for privacy-preserving decryption gateway with callback mechanism
 */
interface IPrivacyGateway {
    /**
     * @notice Request encrypted data decryption with callback
     * @param ciphertexts Array of encrypted data to decrypt
     * @param callbackSelector Function selector to call with results
     * @param callbackData Additional data to pass to callback
     * @return requestId Unique identifier for tracking the decryption request
     */
    function requestDecryption(
        bytes32[] calldata ciphertexts,
        bytes4 callbackSelector,
        bytes calldata callbackData
    ) external returns (uint256 requestId);

    /**
     * @notice Process decrypted data and invoke callback
     * @param requestId Original request identifier
     * @param decryptedValues Array of decrypted values
     * @param signatures Proof of valid decryption
     */
    function fulfillDecryption(
        uint256 requestId,
        uint256[] calldata decryptedValues,
        bytes calldata signatures
    ) external;

    /**
     * @notice Get status of a decryption request
     * @param requestId Request identifier
     * @return pending Whether request is still pending
     * @return fulfilled Whether request has been fulfilled
     * @return failureReason Reason if request failed
     */
    function getRequestStatus(uint256 requestId)
        external
        view
        returns (
            bool pending,
            bool fulfilled,
            string memory failureReason
        );
}
