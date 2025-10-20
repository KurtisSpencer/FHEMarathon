# Anonymous Marathon Registration System

[![CI/CD Pipeline](https://github.com/KurtisSpencer/FHEMarathon/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/KurtisSpencer/FHEMarathon/actions)
[![Tests](https://github.com/KurtisSpencer/FHEMarathon/workflows/Tests/badge.svg)](https://github.com/KurtisSpencer/FHEMarathon/actions)
[![codecov](https://codecov.io/gh/KurtisSpencer/FHEMarathon/branch/main/graph/badge.svg)](https://codecov.io/gh/KurtisSpencer/FHEMarathon)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)

A privacy-first long-distance running competition platform built with Fully Homomorphic Encryption (FHE) technology, enabling runners to participate in marathons while keeping their personal information completely confidential.

## 🌐 Live Demo

**Website**: [https://fhe-marathon.vercel.app/](https://fhe-marathon.vercel.app/)

**GitHub Repository**: [https://github.com/KurtisSpencer/FHEMarathon](https://github.com/KurtisSpencer/FHEMarathon)

**Demo Video**: Download and view `demo.mp4` from this repository (the video file needs to be downloaded locally to watch, direct links cannot be opened)

## 📦 Quick Start

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn
- MetaMask or compatible Web3 wallet
- Testnet ETH for deployment

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia
npm run deploy:sepolia

# Verify contract
npm run verify

# Interact with contract
npm run interact

# Run simulation
npm run simulate
```

## 📋 Overview

The Anonymous Marathon Registration System revolutionizes traditional race management by leveraging blockchain technology and Fully Homomorphic Encryption (FHE) to protect participant privacy. Runners can register for events, submit sensitive personal data, and compete without revealing their identities or private information to organizers or other participants.

## 🔐 Core Concepts

### FHE Contract Anonymous Marathon Registration - Privacy Long-Distance Running Competition System

This project represents a revolutionary approach to marathon registration and competition management through the integration of Fully Homomorphic Encryption (FHE) smart contracts. The core innovation lies in enabling runners to participate in competitive long-distance running events while maintaining complete privacy of their personal information throughout the entire process.

#### What is FHE Contract Technology?

Fully Homomorphic Encryption (FHE) in smart contracts allows computations to be performed directly on encrypted data without ever needing to decrypt it. This breakthrough technology means:

- **Privacy Protection**: Personal information (age, experience level, previous race times) remains encrypted at all times, even during verification and computation
- **Verifiable Results**: Race organizers can verify eligibility, calculate rankings, and determine winners without accessing raw participant data
- **Zero-Knowledge Participation**: Runners compete under anonymous identifiers while maintaining complete data integrity and competitive fairness
- **On-Chain Privacy**: Unlike traditional blockchain systems where all data is publicly visible, FHE contracts keep sensitive information encrypted on-chain

#### Anonymous Marathon Registration System

The FHE contract enables a privacy-preserving long-distance running competition platform with the following key features:

1. **Encrypted Profile Data**: When runners register, their age, experience level, and historical performance data are encrypted using FHE before being stored on the blockchain
2. **Anonymous Identifiers**: Each participant selects a unique anonymous ID (pseudonym) for all public-facing race activities and leaderboards
3. **Privacy-Preserving Leaderboards**: Results can be displayed, sorted, and ranked without compromising participant identities or decrypting personal data
4. **Secure Prize Distribution**: Winners can be verified and rewarded through smart contracts without revealing personal details to anyone
5. **Homomorphic Computations**: Rankings, eligibility checks, and statistical calculations are performed directly on encrypted data

#### Smart Contract Architecture

The FHE smart contract system ensures:

- **Decentralized Trust**: No single entity controls or can access participant data in plaintext
- **Transparent Operations**: All race rules, eligibility criteria, and logic are publicly verifiable on the blockchain
- **Immutable Records**: Race results, registrations, and finish times cannot be tampered with or altered after submission
- **Automated Execution**: Registration verification, time recording, leaderboard updates, and prize distribution happen automatically through smart contract logic
- **Privacy by Design**: The architecture ensures privacy is maintained at every layer, from registration to final results

## 🎯 Key Features

### For Runners

- **Privacy-First Registration**: Submit personal data that remains encrypted end-to-end
- **Anonymous Competition**: Participate under pseudonyms while maintaining competitive integrity
- **Secure Data Storage**: All sensitive information protected by cryptographic encryption
- **Transparent Results**: View race outcomes and leaderboards without compromising privacy

### For Organizers

- **Encrypted Data Management**: Access aggregated insights without viewing individual participant details
- **Fair Competition**: Verify participant eligibility without accessing raw personal data
- **Automated Administration**: Smart contracts handle registration, verification, and results
- **Fraud Prevention**: Cryptographic proofs ensure data integrity and prevent cheating

### Technical Features

- **Hardhat Development Framework**: Professional development environment with full tooling support
- **Blockchain Integration**: Built on Ethereum-compatible networks
- **MetaMask Support**: Easy wallet connection for seamless user experience
- **Real-time Updates**: Live leaderboards and race status
- **Comprehensive Scripts**: Deploy, verify, interact, and simulate with ease
- **Responsive Design**: Optimized for desktop and mobile devices

## 📊 How It Works

### 1. Marathon Creation

Organizers create new marathon events by specifying:
- Event name and date
- Registration deadline
- Maximum participant capacity
- Registration fee (optional)

### 2. Participant Registration

Runners register by providing:
- **Encrypted Personal Data**: Age, experience level, previous best time
- **Anonymous Identifier**: A unique pseudonym for public display
- **Registration Fee**: Paid in cryptocurrency via smart contract

All personal data is encrypted using FHE before being stored on the blockchain.

### 3. Race Participation

During the event:
- Runners compete under their anonymous identifiers
- Finish times are recorded and encrypted
- Real-time leaderboards display anonymous rankings

### 4. Results & Verification

After race completion:
- Encrypted finish times are processed using FHE computations
- Winners are determined without decrypting individual data
- Prize distribution is automated through smart contracts
- Participants can verify their encrypted results

## 🔧 Technology Stack

### Development Framework
- **Hardhat**: Smart contract development environment
- **Hardhat Tasks**: Custom task automation
- **Hardhat Toolbox**: Comprehensive development tools
- **Gas Reporter**: Transaction cost analysis
- **Etherscan Plugin**: Automated contract verification

### Blockchain & Smart Contracts
- **Solidity**: 0.8.24 with optimization enabled
- **Ethereum**: Sepolia testnet deployment
- **FHE Library**: @fhevm/solidity for encryption
- **Web3 Integration**: Ethers.js v6

### Frontend & UI
- **HTML5, CSS3, JavaScript**: Modern web standards
- **Responsive Design**: Mobile-first approach
- **MetaMask Integration**: Seamless wallet connection

## 📝 Smart Contract Details

### Deployment Information

**Network**: Ethereum Sepolia Testnet
**Contract Address**: `0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1`
**Chain ID**: 11155111

**Etherscan Links**:
- **Contract**: https://sepolia.etherscan.io/address/0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1
- **Verified Source**: https://sepolia.etherscan.io/address/0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1#code

### Key Contract Functions

- `createMarathon()`: Create a new marathon event
- `registerForMarathon()`: Register as a participant with encrypted data
- `recordFinishTime()`: Record encrypted finish times
- `getLeaderboard()`: Retrieve anonymous rankings
- `completeMarathon()`: Finalize event and distribute prizes
- `updateRegistrationFee()`: Adjust registration fee (organizer only)
- `cancelMarathon()`: Cancel event and refund participants (organizer only)

## 🛠 Development & Deployment

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Deploy to Network

```bash
# Local development
npm run node
npm run deploy

# Sepolia testnet
npm run deploy:sepolia
```

### Verify on Etherscan

```bash
npm run verify
```

### Interactive Contract Interface

```bash
npm run interact
```

Available actions:
1. Create Marathon
2. Register for Marathon
3. View Marathon Info
4. View Runner Status
5. View Leaderboard
6. Record Finish Time (Organizer Only)
7. Complete Marathon (Organizer Only)
8. Update Registration Fee (Organizer Only)
9. Cancel Marathon (Organizer Only)
10. View Contract Info

### Run Full Simulation

```bash
npm run simulate
```

The simulation demonstrates:
- Creating a marathon event
- Registering multiple anonymous runners
- Recording finish times
- Viewing encrypted leaderboard
- Prize distribution calculations

## 📁 Project Structure

```
anonymous-marathon-platform/
├── contracts/
│   └── AnonymousMarathon.sol    # Main smart contract
├── scripts/
│   ├── deploy.js                # Deployment script
│   ├── verify.js                # Contract verification
│   ├── interact.js              # Interactive CLI
│   └── simulate.js              # Full workflow simulation
├── test/
│   └── [test files]             # Contract tests
├── deployments/
│   └── sepolia-deployment.json  # Deployment info
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Dependencies and scripts
├── .env.example                 # Environment template
├── DEPLOYMENT.md                # Detailed deployment guide
└── README.md                    # This file
```

## 🎨 User Interface

The application features a modern, intuitive interface with:

- **Green Theme**: Professional, eco-friendly design aesthetic
- **Wallet Connection**: Seamless MetaMask integration
- **Form Validation**: Real-time input validation and error handling
- **Responsive Layout**: Mobile-first design approach
- **Status Indicators**: Clear visual feedback for all operations

## 🔒 Privacy & Security

### Data Protection

- **End-to-End Encryption**: All personal data encrypted before leaving user's device
- **On-Chain Privacy**: Encrypted data stored on blockchain, never exposed
- **Anonymous Identifiers**: Public-facing pseudonyms protect real identities
- **Cryptographic Proofs**: Verify data integrity without decryption

### Security Measures

- **Smart Contract Testing**: Comprehensive test coverage
- **Access Control**: Only authorized operations permitted
- **Immutable Records**: Blockchain ensures data cannot be altered
- **Decentralized Storage**: No central point of failure
- **Code Verification**: Source code verified on Etherscan

## 🌟 Use Cases

### Traditional Marathon Events

- City marathons with privacy-conscious participants
- International races with diverse privacy regulations
- Corporate running events requiring employee data protection

### Specialized Competitions

- Age-group competitions without age disclosure
- Experience-based seeding without revealing history
- Performance-based registration without public data

### Research & Development

- Privacy-preserving sports analytics
- Anonymous performance tracking
- Encrypted health and fitness data collection

## 📚 Documentation

### For Participants

**Registration Process**:
1. Select a marathon from the available events list
2. Enter your age (will be encrypted)
3. Choose your experience level (1-10 scale, will be encrypted)
4. Provide your previous best time in minutes (will be encrypted)
5. Create a unique anonymous identifier
6. Pay the registration fee and submit

**Understanding Privacy**:
- Your personal data is encrypted before submission
- Only you can decrypt your own information
- Race organizers never see your raw data
- Anonymous identifiers are used for all public displays

### For Organizers

**Creating an Event**:
1. Connect your wallet
2. Fill in marathon details (name, date, deadline, capacity)
3. Submit transaction to create event on blockchain
4. Share event details with potential participants

**Managing Results**:
- View encrypted participant data
- Record finish times (encrypted automatically)
- Complete race to finalize results
- Smart contract handles prize distribution

### For Developers

**See DEPLOYMENT.md for**:
- Detailed deployment instructions
- Network configuration
- Troubleshooting guide
- Gas estimation
- Security best practices

## 🤝 Contributing

We welcome contributions from the community! Areas where you can help:

- **Smart Contract Development**: Enhance contract functionality
- **UI/UX Improvements**: Enhance the user interface
- **Security Audits**: Review smart contract code
- **Feature Development**: Add new functionality
- **Documentation**: Improve guides and tutorials
- **Testing**: Help identify and report bugs

## 📧 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Check existing documentation in DEPLOYMENT.md
- Review the demo video for guidance
- Consult Hardhat documentation

## 🙏 Acknowledgments

This project demonstrates the power of combining blockchain technology with Fully Homomorphic Encryption to create privacy-preserving applications. Special thanks to the FHE and Web3 communities for their groundbreaking work in cryptography and decentralized systems.

## 📄 License

MIT License - see LICENSE file for details

---

**Built with privacy in mind. Run with confidence. Compete with anonymity.**
