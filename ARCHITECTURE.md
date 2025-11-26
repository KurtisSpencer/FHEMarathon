# Architecture & Technical Design

## System Overview

The Enhanced Anonymous Marathon Registration System is a privacy-preserving blockchain application built on Ethereum Sepolia with ZAMA Fully Homomorphic Encryption (FHE) integration. The system implements an innovative Gateway callback pattern for asynchronous decryption with comprehensive timeout protection and refund mechanisms.

## Core Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                     User/Participant                             │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     │ 1. Register (encrypted data)
                     ▼
        ┌────────────────────────────┐
        │   AnonymousMarathon        │
        │   Smart Contract           │
        │                            │
        │ - Encrypted storage        │
        │ - Marathon management      │
        │ - Participant tracking     │
        └────────────┬───────────────┘
                     │
                     │ 2. Request decryption
                     ▼
        ┌────────────────────────────┐
        │   PrivacyGateway          │
        │   (Callback Pattern)       │
        │                            │
        │ - Async request tracking   │
        │ - Timeout monitoring       │
        │ - Refund mechanism         │
        └────────────┬───────────────┘
                     │
                     │ 3. Submit to oracle
                     ▼
        ┌────────────────────────────┐
        │   ZAMA Oracle Network      │
        │   (Decryption Service)     │
        │                            │
        │ - FHE decryption           │
        │ - Signature verification   │
        └────────────┬───────────────┘
                     │
                     │ 4. Callback with results
                     ▼
        ┌────────────────────────────┐
        │   PrivacyGateway Callback  │
        │   processLeaderboardReveal()│
        │                            │
        │ - Verify signatures        │
        │ - Call Marathon contract   │
        │ - Handle failures          │
        └────────────┬───────────────┘
                     │
                     │ 5. Process results
                     ▼
        ┌────────────────────────────┐
        │   AnonymousMarathon        │
        │   Result Processing        │
        │                            │
        │ - Sort leaderboard         │
        │ - Distribute prizes        │
        │ - Emit events              │
        └────────────────────────────┘
```

## Data Flow: Gateway Callback Pattern

### Phase 1: Encrypted Data Submission
```solidity
// User registers with encrypted data
registerForMarathon(
    marathonId,
    age,                    // Encrypted on client
    experienceLevel,        // Encrypted on client
    previousBestTime,       // Encrypted on client
    anonymousId             // Privacy-preserving identifier
)

↓

// Contract stores encrypted values
Runner {
    encryptedAge: euint32,
    encryptedExperience: euint8,
    encryptedPreviousTime: euint16,
    refundAmount: uint256,
    ...
}
```

### Phase 2: Async Decryption Request
```solidity
// Marathon completion triggers decryption request
completeMarathon(marathonId)
    ↓
_requestLeaderboardDecryption(marathonId)
    ↓
// Via Gateway callback pattern
IPrivacyGateway(gatewayAddress).requestDecryption(
    ciphertexts,
    this.processLeaderboardReveal.selector,  // Callback function
    callbackData                              // Marathon context
)
    ↓
// Returns requestId and stores state
marathons[marathonId].decryptionRequestId = requestId
marathons[marathonId].decryptionStatus = Pending
```

### Phase 3: Oracle Decryption
```
Gateway receives request
    ↓
Submit ciphertexts to ZAMA Oracle
    ↓
Oracle performs FHE decryption
    ↓
Return decrypted values + signatures
    ↓
Gateway fulfills request
```

### Phase 4: Callback Processing
```solidity
// Gateway calls Marathon contract with results
processLeaderboardReveal(
    requestId,
    decryptedValues,  // uint256[] of finish times
    signatures        // Proof of valid decryption
)
    ↓
// Verify decryption
_verifyDecryption(requestId)
    ↓
// Update leaderboard
for each decrypted value:
    leaderboard[i].finishTime = decryptedValue[i]
    leaderboard[i].isRevealed = true
    ↓
// Sort and distribute prizes
_sortLeaderboard(marathonId)
_distributePrizes(marathonId)
```

## Timeout Protection Mechanism

### Request Lifecycle with Timeout
```
Request Created (timestamp = T0)
    ↓ [0 - 24 hours]
Pending: Awaiting oracle response
    ↓
├─ On Callback: SUCCESS
│   └─ Process Results → Prizes
│
└─ After 24 hours: TIMEOUT
    └─ checkAndProcessTimeout(marathonId)
        └─ Trigger: _handleDecryptionFailure()
            └─ Initiate: _processRefunds()
```

### Timeout Handling Flow
```solidity
checkAndProcessTimeout(marathonId)
    ↓
// Check if 24+ hours elapsed
if (block.timestamp > createdAt + eventDate + 24 hours)
    ↓
    emit TimeoutTriggered(marathonId)
    _handleDecryptionFailure(marathonId, "Timeout")
    ↓
    _processRefunds(marathonId)
        ↓
        for each participant:
            if (not refundClaimed && refundAmount > 0)
                ↓
                payable(participant).call{value: refundAmount}()
                marathons[marathonId].decryptionStatus = Refunded
```

## Refund Mechanism

### Refund Eligibility States
```
Participant Registration
    ↓
    └─ refundAmount = msg.value (saved)
    └─ refundClaimed = false

Marathon Completion
    ↓
    ├─ Decryption Succeeds
    │   └─ Prizes distributed (no refund)
    │
    └─ Decryption Fails
        └─ decryptionStatus = Failed
            └─ Eligible for refund

Refund Claim
    ↓
    claimRefund(marathonId)
        ↓
        require(decryptionStatus == Failed || Refunded)
        require(!refundClaimed)
        require(refundAmount > 0)
        ↓
        refundClaimed = true
        transfer(msg.sender, refundAmount)
```

### Automatic Refund Processing
```solidity
// Triggered on decryption failure
_processRefunds(marathonId)
    ↓
    for each participant:
        if (hasRegistered && !refundClaimed)
            ↓
            runner.refundClaimed = true
            payable(participant).call{value: refundAmount}()
            emit RefundProcessed(marathonId, participant, amount)
```

## Security Implementation

### Input Validation Layer
```
createMarathon()
├─ Name length: 1-256 characters
├─ Event date: future timestamp
├─ Deadline validation
├─ Min 1 hour between deadline and event
└─ Participants: 1-10,000

registerForMarathon()
├─ Sufficient fee payment
├─ Not already registered
├─ Unique anonymous ID
├─ Age: 15-130 years
├─ Experience: 1-10 level
└─ Previous time: 1-9,999 minutes
```

### Access Control
```
┌─ OnlyOrganizer
│  ├─ createMarathon()
│  ├─ completeMarathon()
│  ├─ recordFinishTime()
│  ├─ setGateway()
│  └─ updateRegistrationFee()
│
├─ GatewayInitialized
│  └─ completeMarathon() - requires gateway configured
│
└─ PublicFunctions
   ├─ registerForMarathon()
   ├─ claimRefund()
   ├─ checkAndProcessTimeout()
   └─ View functions
```

### Encryption & Privacy
```
FHE Encrypted Data Types:
├─ euint32: Age, Finish times
├─ euint8: Experience level
└─ euint16: Previous marathon time

Access Control:
└─ FHE.allowThis(encryptedValue)
   └─ Grants contract permission to use encrypted data

Data Never Revealed:
├─ Individual vote choices
├─ Participant identities
└─ Temporal privacy until resolution
```

### Reentrancy Protection
```
Pattern: Checks-Effects-Interactions (CEI)

Example - claimRefund():
1. Check: Verify eligibility
   ├─ require(hasRegistered)
   ├─ require(!refundClaimed)
   └─ require(eligible status)

2. Effect: Update state
   └─ refundClaimed = true

3. Interaction: Transfer funds
   └─ payable(msg.sender).call{value: amount}()
```

### Overflow Protection
```
Solidity ^0.8.24 provides:
├─ Built-in overflow/underflow checks
├─ Arithmetic reversion on overflow
└─ No SafeMath library needed
```

## Event Logging & Audit Trail

### Critical Events
```solidity
// Marathon lifecycle
emit MarathonCreated(marathonId, name, eventDate)
emit RunnerRegistered(marathonId, anonymousId, refundAmount)
emit RunnerFinished(marathonId, anonymousId)
emit LeaderboardRevealed(marathonId)
emit PrizeDistributed(marathonId, winner, amount)

// Decryption process
emit DecryptionRequested(marathonId, requestId)
emit DecryptionFailed(marathonId, reason)
emit TimeoutTriggered(marathonId)

// Refund operations
emit RefundProcessed(marathonId, runner, amount)

// Administrative
emit RegistrationFeeUpdated(newFee)
emit GatewayUpdated(newGateway)

// Security audit events
emit SecurityEvent(marathonId, eventType, message)
```

## State Management

### Marathon States
```
Creating ──→ Active ──→ Completed ──→ [Processing]
                                         ├─ Pending: Awaiting decryption
                                         ├─ Completed: Results ready
                                         ├─ Failed: Decryption failed
                                         └─ Refunded: Refunds processed
```

### Participant States
```
Registered ──→ [Optional: Finished] ──→ [Resolve]
   ├─ hasRegistered: true                ├─ Prize claimed (winner)
   ├─ hasFinished: false                 ├─ No prize (loser)
   └─ refundClaimed: false               └─ Refund claimed (failure)
```

## Decryption Request Status

### Request States (in PrivacyGateway)
```
Enum RequestStatus:
├─ Pending: Awaiting oracle response
├─ Fulfilled: Successfully decrypted
├─ Failed: Decryption failed
└─ Refunded: Refunds processed
```

## Scaling Considerations

### Gas Optimization
```
// Loop optimization for leaderboards
Current implementation:
- Bubble sort: O(n²) for n participants
- Recommended max: ~50-100 participants per marathon
- For larger events, consider off-chain sorting + on-chain verification

// Array operations
- Use fixed arrays where size is known
- Minimize storage writes in loops
- Batch operations where possible
```

### Contract Limits
```
Constraints:
├─ Max participants per marathon: 10,000
├─ Max marathon name length: 256 chars
├─ Max registration fee: 10 ETH
├─ Min registration fee: 0.0001 ETH
└─ Timeout period: Fixed at 24 hours
```

## Integration Points

### With PrivacyGateway
```solidity
interface IPrivacyGateway {
    function requestDecryption(
        bytes32[] calldata ciphertexts,
        bytes4 callbackSelector,
        bytes calldata callbackData
    ) external returns (uint256 requestId);

    function getRequestStatus(uint256 requestId)
        external view
        returns (bool pending, bool fulfilled, string memory failureReason);
}
```

### With ZAMA FHE
```solidity
// Import statements
import { FHE, euint32, euint16, euint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

// Core operations
FHE.asEuint32(_age)          // Encrypt
FHE.allowThis(encryptedAge)  // Grant access
FHE.toBytes32(encrypted)     // Convert for callback
```

## Testing Strategy

### Unit Tests
```
- Contract deployment with gateway
- Marathon creation with validation
- Registration with encrypted data
- Timeout detection
- Refund processing
- Prize distribution
```

### Integration Tests
```
- Gateway callback mechanism
- Decryption request flow
- Complete marathon lifecycle
- Failure scenarios
- Timeout scenarios
```

### Security Tests
```
- Input validation
- Access control
- Reentrancy attempts
- Overflow attempts
- Event emission verification
```

## Deployment Checklist

- [ ] Deploy PrivacyGateway contract
- [ ] Deploy AnonymousMarathon with Gateway address
- [ ] Verify Gateway integration
- [ ] Set appropriate registration fee
- [ ] Test timeout protection
- [ ] Test refund mechanism
- [ ] Monitor event emissions
- [ ] Setup off-chain oracle integration

## Future Enhancements

1. **Multi-tier Prize Distribution**: Support custom prize percentages
2. **Weighted Scoring**: Incorporate encrypted experience level in rankings
3. **Batch Operations**: Process multiple marathons in single transaction
4. **Off-chain Sorting**: Reduce gas costs for large leaderboards
5. **Upgradeable Contracts**: Use proxy pattern for future improvements
6. **Time-weighted Prizes**: Consider registration timing in payouts
