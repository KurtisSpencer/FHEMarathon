# Privacy & Security Guide

## Privacy-Preserving Architecture

This system implements **Fully Homomorphic Encryption (FHE)** to ensure complete privacy of participant data while maintaining functional integrity of the marathon registration and leaderboard system.

## Core Privacy Features

### 1. Encrypted Data at Rest
All sensitive participant information is encrypted **before** storage on the blockchain:

```
Plaintext (Client) → FHE Encryption → Blockchain Storage
     ↓
Age: 28              euint32 (encrypted)
Experience: 7        euint8 (encrypted)
Previous Time: 180   euint16 (encrypted)
```

**What this means:**
- Even contract owner/organizer cannot see individual data
- Blockchain explorers show only encrypted ciphertext
- No information leakage to third parties
- Temporal privacy maintained until resolution

### 2. Anonymous Identifiers
```solidity
// Participants choose anonymous IDs
bytes32 anonymousId = keccak256("RunnerAlias2024")
```

**Benefits:**
- Public-facing leaderboards use pseudonyms
- Real identities never linked on-chain
- Privacy preserved even in public results
- Prevents discrimination based on demographics

### 3. Homomorphic Computation
Calculations performed **directly on encrypted data**:

```
FHE Operations (ZAMA):
├─ FHE.asEuint32(value)     - Encrypt plaintext
├─ FHE.add(a, b)            - Add encrypted values
├─ FHE.eq(a, b)             - Compare encrypted values
├─ FHE.select(cond, a, b)   - Conditional selection
└─ FHE.toBytes32(encrypted)  - Convert for callback
```

**Result:** Leaderboards sorted, winners determined, prizes calculated — all without decrypting individual data.

## Privacy Threat Model

### What We Protect Against ✅

1. **Data Exposure**
   - ❌ Contract owner accessing participant age
   - ❌ Blockchain explorers revealing personal info
   - ❌ Competitors seeing each other's experience level
   - ✅ All data encrypted with FHE

2. **Identity Linkage**
   - ❌ Linking wallet address to real identity
   - ❌ Cross-referencing marathon registrations
   - ✅ Anonymous identifiers prevent linkage

3. **Temporal Privacy**
   - ❌ Observing finish times before official reveal
   - ✅ Results encrypted until decryption callback

4. **Statistical Inference**
   - ❌ Inferring participant demographics from patterns
   - ✅ Homomorphic aggregation prevents inference

### Potential Privacy Limitations ⚠️

1. **Blockchain Transparency**
   - Registration timestamps are public
   - Transaction fees/gas costs are visible
   - Smart contract interactions are on-chain

2. **Side-Channel Leakage**
   - Network analysis may reveal participation
   - Transaction patterns could link identities
   - **Mitigation**: Use privacy tools (Tornado Cash equivalents)

3. **Decryption Point**
   - Final results must be decrypted for prize distribution
   - Individual finish times revealed post-marathon
   - **Mitigation**: Aggregate statistics only, individual data hidden

## Security Best Practices

### For Participants

#### 1. Wallet Privacy
```bash
# Use separate wallet for marathon registration
# Don't reuse wallets linked to your identity

✅ GOOD: Create new wallet → Register → Claim prizes → Mix funds
❌ BAD: Use same wallet for all activities
```

#### 2. Anonymous ID Selection
```solidity
// Generate cryptographically random anonymous ID
bytes32 anonymousId = keccak256(abi.encodePacked(
    block.timestamp,
    msg.sender,
    randomSalt
))

✅ GOOD: Random, unguessable IDs
❌ BAD: IDs like "JohnSmith123" (reveals identity)
```

#### 3. Network Privacy
```
Use privacy-enhancing technologies:
├─ VPN/Tor for transaction submission
├─ RPC endpoints that don't log IPs
└─ Privacy-focused wallets (Brave Wallet, Frame)
```

### For Organizers

#### 1. Gateway Security
```solidity
// Always verify Gateway address before deployment
constructor(address _gateway) {
    require(_gateway != address(0), "Invalid gateway");
    require(_gateway == TRUSTED_GATEWAY, "Untrusted gateway");
    gatewayAddress = _gateway;
}
```

#### 2. Registration Fee Management
```solidity
// Validate fee ranges to prevent economic attacks
updateRegistrationFee(newFee)
    ├─ MIN_REGISTRATION_FEE: 0.0001 ETH (prevent spam)
    └─ MAX_REGISTRATION_FEE: 10 ETH (prevent abuse)
```

#### 3. Timeout Configuration
```solidity
// Monitor decryption requests
24-hour timeout ensures:
├─ Failed requests don't lock funds forever
├─ Participants can claim refunds
└─ System maintains liveness
```

## Security Audit Recommendations

### Critical Areas for Review

#### 1. Access Control
```
AUDIT FOCUS: Ensure only authorized calls
├─ onlyOrganizer modifier enforcement
├─ gatewayInitialized verification
└─ Callback function access (only Gateway)
```

#### 2. Reentrancy Protection
```
AUDIT FOCUS: Check CEI pattern compliance
├─ State updates before external calls
├─ Refund processing order
└─ Prize distribution sequence
```

#### 3. Arithmetic Overflow
```
AUDIT FOCUS: Verify Solidity ^0.8.24 protections
├─ Prize calculations
├─ Participant counting
└─ Timestamp arithmetic
```

#### 4. Input Validation
```
AUDIT FOCUS: Comprehensive validation
├─ Age: 15-130 range
├─ Experience: 1-10 level
├─ Previous time: 0-10,000 minutes
├─ Marathon name: 1-256 characters
└─ Anonymous ID: non-zero, unique
```

#### 5. Gas Optimization
```
AUDIT FOCUS: Prevent DoS via high gas costs
├─ Loop iterations bounded
├─ Storage writes minimized
└─ Array operations efficient
```

## Privacy-Preserving Workflows

### Participant Registration Flow
```
1. Client-Side Encryption
   ├─ Generate or retrieve FHE public key
   ├─ Encrypt age, experience, previous time
   └─ Generate anonymous identifier

2. Transaction Submission
   ├─ Call registerForMarathon() with encrypted data
   ├─ Pay registration fee
   └─ Receive confirmation event

3. Privacy Verification
   ├─ Blockchain explorer shows ciphertext only
   ├─ No plaintext data exposed
   └─ Anonymous ID used in all public events
```

### Decryption & Result Revelation
```
1. Request Decryption (Organizer)
   ├─ completeMarathon(marathonId)
   └─ Gateway.requestDecryption(ciphertexts)

2. Oracle Processing
   ├─ ZAMA Oracle receives encrypted finish times
   ├─ Performs FHE decryption
   └─ Returns decrypted values + signatures

3. Callback Verification
   ├─ Gateway verifies signatures
   ├─ Calls processLeaderboardReveal()
   └─ Marathon contract processes results

4. Privacy Preservation
   ├─ Only final finish times revealed
   ├─ Age/experience remain encrypted
   └─ Anonymous IDs protect real identities
```

## Handling Decryption Failures

### Refund Mechanism (Privacy-Aware)
```
If Decryption Fails:
├─ checkAndProcessTimeout(marathonId)
├─ Trigger: _handleDecryptionFailure()
├─ Process: _processRefunds(marathonId)
└─ Result: Participants receive full refunds

Privacy Maintained:
├─ No individual data revealed during refund
├─ All participants treated equally
└─ Refund amounts based on registration fee
```

### Timeout Protection
```
24-Hour Timeout Window:
├─ Prevents permanent fund locks
├─ Allows automatic refund processing
├─ Maintains system liveness
└─ Protects participant funds

Privacy Impact:
├─ Timeout public (system design)
├─ Individual refund claims private
└─ No correlation to encrypted data
```

## Privacy Compliance

### GDPR Considerations
```
Right to be Forgotten:
├─ Encrypted data cannot be decrypted without key
├─ Anonymous IDs prevent personal data linkage
├─ Blockchain immutability vs. erasure rights
└─ Recommend: Off-chain personal data storage

Data Minimization:
├─ Only necessary data collected (age, experience, time)
├─ Encrypted on blockchain
└─ No identifiable information stored
```

### Data Protection Impact Assessment (DPIA)
```
Required for:
├─ Large-scale privacy-sensitive processing
├─ Use of new technologies (FHE)
└─ Public blockchain storage

Key Areas:
├─ Purpose limitation: Marathon registration only
├─ Necessity: Encrypted data for fair competition
├─ Proportionality: Minimal data collection
└─ Safeguards: FHE + anonymous identifiers
```

## Privacy Monitoring

### On-Chain Privacy Verification
```bash
# Verify encrypted storage
cast call $CONTRACT_ADDRESS \
  "runners(uint256,address)(euint32,euint8,euint16,bool,bool,euint32,uint256,bytes32,uint256,bool)" \
  $MARATHON_ID $PARTICIPANT_ADDRESS

# Expected: Encrypted ciphertext, not plaintext values
```

### Event Log Analysis
```solidity
// Audit security events for privacy violations
event SecurityEvent(
    uint256 indexed marathonId,
    string eventType,
    string message
)

Monitor for:
├─ "DecryptionRequested" - Normal flow
├─ "DecryptionFailed" - Investigate causes
└─ "RefundProcessed" - Verify refund amounts
```

## Incident Response Plan

### Privacy Breach Response
```
If Plaintext Data Exposed:
1. Identify breach source
2. Assess scope of exposure
3. Notify affected participants
4. Implement additional safeguards
5. Update contracts if necessary

Current Protections:
├─ FHE ensures no plaintext on-chain
├─ Gateway callback isolates decryption
└─ Timeout protection prevents permanent exposure
```

### Contract Vulnerability
```
If Security Issue Found:
1. Pause affected functions (if implemented)
2. Process pending refunds
3. Deploy patched contract
4. Migrate state (if necessary)
5. Audit new deployment
```

## Best Practices Summary

### ✅ DO
- Use FHE for all sensitive data
- Generate random anonymous IDs
- Implement timeout protection
- Process refunds on failures
- Audit event emissions
- Monitor decryption requests
- Use separate wallets for privacy

### ❌ DON'T
- Store plaintext personal data on-chain
- Reuse identifiable anonymous IDs
- Skip input validation
- Ignore decryption timeouts
- Log sensitive data in events
- Link wallet addresses to real identities
- Deploy without security audit

## Testing Privacy & Security

### Privacy Test Cases
```
- Verify encrypted storage (no plaintext visible)
- Test anonymous ID uniqueness
- Validate decryption callback privacy
- Check refund mechanism preserves privacy
- Ensure event logs don't leak data
```

### Security Test Cases
```
- Input validation fuzzing
- Reentrancy attack attempts
- Access control bypass attempts
- Overflow/underflow scenarios
- Gas limit DoS attacks
```

## Recommended Tools

### Privacy Auditing
- Etherscan: Verify bytecode and ciphertext
- Tenderly: Simulate transactions privately
- ZAMA fhevmjs: Client-side encryption library

### Security Auditing
- Slither: Static analysis for Solidity
- Mythril: Symbolic execution
- Echidna: Property-based fuzzing
- Foundry: Comprehensive testing framework

## Contact & Reporting

For privacy concerns or security vulnerabilities:
1. Do NOT disclose publicly
2. Contact via secure channel
3. Provide detailed reproduction steps
4. Allow reasonable response time

---

**Remember**: Privacy is a continuous process, not a one-time implementation. Regular audits, updates, and monitoring are essential for maintaining participant trust and system security.
