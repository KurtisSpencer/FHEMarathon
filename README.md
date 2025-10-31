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
# Install root dependencies
npm install

# Install anonymous-marathon dependencies
cd anonymous-marathon
npm install

# Install React frontend dependencies (optional)
cd frontend
npm install
cd ../..
```

### Smart Contract Development

```bash
# Navigate to anonymous-marathon
cd anonymous-marathon

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
npm run verify:sepolia

# Interact with contract
npm run interact
```

### Frontend Development

#### Option 1: Static HTML Version (Original)
```bash
cd anonymous-marathon/static
# Open index.html in browser or serve with:
npx serve .
```

#### Option 2: React Version (with Universal FHEVM SDK)
```bash
cd anonymous-marathon/frontend

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
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

#### Static Version (Original)
- **HTML5, CSS3, JavaScript**: Modern web standards
- **Responsive Design**: Mobile-first approach
- **MetaMask Integration**: Seamless wallet connection
- **Location**: `./static/` directory

#### React Version (New - Universal FHEVM SDK)
- **Framework**: Next.js 14 with App Router
- **SDK**: Universal FHEVM SDK (`@fhevm/universal-sdk`)
- **Language**: TypeScript with full type safety
- **UI Components**: React components with FHE integration
- **Hooks**: Custom React hooks for FHE operations
- **Location**: `./anonymous-marathon/frontend/` directory
- **Features**:
  - Framework-agnostic SDK architecture
  - Wagmi-like API for Web3 developers
  - Pre-built UI components for FHE operations
  - Complete encryption/decryption workflow
  - Type-safe contract interactions

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
D:\
├── anonymous-marathon/          # 🆕 Enhanced with React frontend
│   ├── contracts/
│   │   └── AnonymousMarathon.sol    # Main smart contract
│   ├── frontend/                # 🆕 React/Next.js frontend with SDK
│   │   ├── src/
│   │   │   └── app/             # Next.js App Router
│   │   ├── package.json         # Frontend dependencies
│   │   ├── next.config.js       # Next.js configuration
│   │   └── tsconfig.json        # TypeScript configuration
│   ├── static/                  # Original HTML/JS frontend
│   │   ├── index.html
│   │   └── app.js
│   ├── scripts/
│   │   ├── deploy.js            # Deployment script
│   │   ├── verify.js            # Contract verification
│   │   ├── interact.js          # Interactive CLI
│   │   └── simulate.js          # Full workflow simulation
│   ├── test/                    # Contract tests
│   ├── public/                  # Static assets
│   ├── hardhat.config.js        # Hardhat configuration
│   ├── package.json             # Project dependencies
│   └── README.md                # Marathon documentation
│
├── fhevm-react-template/        # Universal FHEVM SDK Repository
│   ├── packages/
│   │   └── fhevm-sdk/           # Core SDK package
│   ├── templates/               # Framework templates
│   ├── examples/                # SDK examples
│   └── docs/                    # SDK documentation
│
├── contracts/                   # Additional smart contracts
├── scripts/                     # Build and deployment scripts
├── test/                        # Test suites
├── .env.example                 # Environment template
├── hardhat.config.js            # Root Hardhat configuration
├── package.json                 # Root dependencies
├── DEPLOYMENT.md                # Deployment guide
├── SECURITY_PERFORMANCE.md      # Security documentation
├── TESTING.md                   # Testing documentation
├── CI_CD.md                     # CI/CD pipeline documentation
└── README.md                    # This file
```

## 🎨 User Interface

### Static Version (Original)
The static HTML/JavaScript application features:

- **Green Theme**: Professional, eco-friendly design aesthetic
- **Wallet Connection**: Seamless MetaMask integration
- **Form Validation**: Real-time input validation and error handling
- **Responsive Layout**: Mobile-first design approach
- **Status Indicators**: Clear visual feedback for all operations

### React Version (Universal FHEVM SDK)
The new React/Next.js frontend leverages the Universal FHEVM SDK:

- **Modern Architecture**: Next.js 14 App Router with server and client components
- **SDK Integration**: Built on `@fhevm/universal-sdk` for simplified FHE operations
- **Type Safety**: Full TypeScript support with IntelliSense
- **Reusable Components**: Pre-built UI components for encryption/decryption
- **Custom Hooks**: React hooks for FHE operations (`useFhevm`, `useEncrypt`, `useDecrypt`)
- **Developer Experience**: Wagmi-like API familiar to Web3 developers
- **Quick Setup**: Get started with less than 10 lines of code

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

**Smart Contracts**:
See DEPLOYMENT.md for:
- Detailed deployment instructions
- Network configuration
- Troubleshooting guide
- Gas estimation
- Security best practices

**Frontend Development**:

Choose your preferred frontend approach:

1. **Static Version** (`./anonymous-marathon/static/`):
   - Pure HTML/CSS/JavaScript
   - Direct Ethers.js integration
   - No build process required
   - Ideal for simple deployments

2. **React Version** (`./anonymous-marathon/frontend/`):
   - Next.js 14 with TypeScript
   - Universal FHEVM SDK integration
   - Modern development experience
   - Advanced features and scalability

**Universal FHEVM SDK Usage**:
```typescript
import { FhevmProvider, useFhevm, useEncrypt } from '@fhevm/universal-sdk';

function App() {
  return (
    <FhevmProvider config={{ network: 'sepolia' }}>
      <MyComponent />
    </FhevmProvider>
  );
}

function MyComponent() {
  const { instance, ready } = useFhevm();
  const { encrypt } = useEncrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(42, 'uint32');
    // Use encrypted data in contract calls
  };

  return <button onClick={handleEncrypt}>Encrypt Data</button>;
}
```

**SDK Documentation**:
- See `./fhevm-react-template/README.md` for complete SDK documentation
- API Reference: `./fhevm-react-template/docs/API.md`
- More examples in `./fhevm-react-template/examples/`

## 🆕 What's New - Universal FHEVM SDK Integration

This project now includes two frontend implementations:

### 1. Original Static Version
- **Location**: `./anonymous-marathon/static/`
- **Technology**: HTML5, CSS3, JavaScript
- **Status**: Fully functional, production-ready
- **Best For**: Simple deployments, learning FHE basics

### 2. New React Version with Universal FHEVM SDK
- **Location**: `./anonymous-marathon/frontend/`
- **Technology**: Next.js 14, TypeScript, Universal FHEVM SDK
- **Status**: Development version with SDK integration showcase
- **Best For**: Modern development, scalable applications, SDK learning

### Universal FHEVM SDK Features

The new React frontend demonstrates the power of the Universal FHEVM SDK:

✨ **Framework Agnostic**: Core functionality works with React, Next.js, Vue, or Node.js

✨ **Simplified API**: Wagmi-like hooks for Web3 developers
```typescript
const { instance, ready } = useFhevm();
const { encrypt, encrypting } = useEncrypt();
const { decrypt, decrypting } = useDecrypt();
```

✨ **Pre-built Components**: Ready-to-use UI components
```typescript
<FhevmProvider config={{ network: 'sepolia' }}>
  <EncryptInput onEncrypt={handleEncrypt} />
  <DecryptOutput encryptedValue={data} />
</FhevmProvider>
```

✨ **Type Safety**: Full TypeScript support with IntelliSense

✨ **Quick Setup**: Get started in less than 10 lines of code

✨ **Modular Design**: Use only what you need

### SDK Repository

The complete Universal FHEVM SDK is available in:
- **Path**: `./fhevm-react-template/`
- **Package**: `@fhevm/universal-sdk`
- **Documentation**: See `./fhevm-react-template/README.md`
- **Examples**: Multiple framework examples included
- **Templates**: Quick-start templates for Next.js, React, Vue, Node.js

### Migration Path

Developers can choose their preferred approach:
- Use the **static version** for immediate deployment
- Explore the **React version** to learn the SDK
- Build new features using the SDK's modern architecture
- Mix both approaches based on project needs

## 🤝 Contributing

We welcome contributions from the community! Areas where you can help:

- **Smart Contract Development**: Enhance contract functionality
- **UI/UX Improvements**: Enhance the user interface (both versions)
- **SDK Integration**: Help improve the React version with more SDK features
- **Security Audits**: Review smart contract code
- **Feature Development**: Add new functionality
- **Documentation**: Improve guides and tutorials
- **Testing**: Help identify and report bugs
- **SDK Examples**: Create more examples using the Universal FHEVM SDK

## 📧 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Check existing documentation in DEPLOYMENT.md
- Review the demo video for guidance
- Consult Hardhat documentation
- For SDK questions: See `./fhevm-react-template/README.md`
- SDK API Reference: `./fhevm-react-template/docs/API.md`

## 🔗 Related Resources

### Universal FHEVM SDK
- **Documentation**: `./fhevm-react-template/README.md`
- **API Reference**: `./fhevm-react-template/docs/API.md`
- **Examples**: `./fhevm-react-template/examples/`
- **Templates**: `./fhevm-react-template/templates/`

### Smart Contracts
- **Deployment Guide**: `./DEPLOYMENT.md`
- **Security**: `./SECURITY_PERFORMANCE.md`
- **Testing**: `./TESTING.md`
- **CI/CD**: `./CI_CD.md`

### Anonymous Marathon
- **Main Documentation**: `./anonymous-marathon/README.md`
- **Static Frontend**: `./anonymous-marathon/static/`
- **React Frontend**: `./anonymous-marathon/frontend/`
- **Contracts**: `./anonymous-marathon/contracts/`

## 📊 Frontend Technology Comparison

| Feature | Static Version | React Version (SDK) |
|---------|---------------|---------------------|
| **Framework** | Vanilla JS | Next.js 14 + TypeScript |
| **FHE Integration** | Direct fhevmjs | Universal FHEVM SDK |
| **Setup Time** | Immediate | < 10 lines of code |
| **Type Safety** | None | Full TypeScript |
| **Reusable Components** | None | Pre-built components |
| **Build Process** | Not required | Next.js build |
| **Learning Curve** | Moderate | Easy (wagmi-like API) |
| **Scalability** | Limited | High |
| **Best For** | Quick demos | Production apps |
| **Status** | Production | Development showcase |

### Which Version Should I Use?

**Use the Static Version if**:
- You need immediate deployment
- You want to learn FHE from scratch
- You prefer simple, direct integration
- You don't need TypeScript

**Use the React Version if**:
- You're building a production application
- You want modern development tools
- You need TypeScript and type safety
- You prefer component-based architecture
- You want to leverage the Universal FHEVM SDK

**Use Both if**:
- You want to compare implementations
- You're learning both approaches
- You need to migrate from static to React

## 🙏 Acknowledgments

This project demonstrates the power of combining blockchain technology with Fully Homomorphic Encryption to create privacy-preserving applications.

**Special Thanks**:
- **Zama**: For the groundbreaking FHEVM technology and fhevmjs library
- **Universal FHEVM SDK**: For simplifying FHE integration in modern web applications
- **Web3 Community**: For continuous innovation in decentralized systems
- **FHE Research Community**: For advancing homomorphic encryption technology

**Technology Stack Credits**:
- Hardhat for smart contract development
- Ethers.js for blockchain interaction
- Next.js for modern React framework
- TypeScript for type safety

## 📄 License

MIT License - see LICENSE file for details

---

**Built with privacy in mind. Run with confidence. Compete with anonymity.**

🔐 **Two frontends. One vision. Complete privacy.**
