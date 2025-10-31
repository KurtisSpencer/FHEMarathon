# Anonymous Marathon Registration System

A privacy-first long-distance running competition platform built with Fully Homomorphic Encryption (FHE) technology, enabling runners to participate in marathons while keeping their personal information completely confidential.

## 🌐 Live Demo

**Website**: [https://anonymous-marathon.vercel.app/](https://anonymous-marathon.vercel.app/)

**Demo Video**: [View Demo](./AnonymousMarathon.mp4)

## 📋 Overview

The Anonymous Marathon Registration System revolutionizes traditional race management by leveraging blockchain technology and Fully Homomorphic Encryption (FHE) to protect participant privacy. Runners can register for events, submit sensitive personal data, and compete without revealing their identities or private information to organizers or other participants.

## 🔐 Core Concepts

### Fully Homomorphic Encryption (FHE)

At the heart of this system is FHE technology, which allows computations to be performed on encrypted data without ever decrypting it. This means:

- **Privacy Protection**: Personal information (age, experience level, previous race times) remains encrypted at all times
- **Verifiable Results**: Race organizers can verify eligibility and calculate results without accessing raw participant data
- **Zero-Knowledge Participation**: Runners compete under anonymous identifiers while maintaining data integrity

### Anonymous Marathon Registration

The system enables complete privacy in competitive running events:

1. **Encrypted Profile Data**: Age, experience level, and historical performance data are encrypted on submission
2. **Anonymous Identifiers**: Each participant selects a unique anonymous ID for public-facing race activities
3. **Privacy-Preserving Leaderboards**: Results can be displayed and ranked without compromising participant identities
4. **Secure Prize Distribution**: Winners can be verified and rewarded through smart contracts without revealing personal details

### Smart Contract Architecture

The system utilizes blockchain smart contracts to ensure:

- **Decentralized Trust**: No single entity controls participant data
- **Transparent Operations**: All race rules and logic are publicly verifiable
- **Immutable Records**: Race results and registrations cannot be tampered with
- **Automated Execution**: Registration, verification, and prize distribution happen automatically

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

- **Blockchain Integration**: Built on Ethereum-compatible networks
- **MetaMask Support**: Easy wallet connection for seamless user experience
- **Real-time Updates**: Live leaderboards and race status
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

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Blockchain**: Ethereum / EVM-compatible networks
- **Smart Contracts**: Solidity
- **Encryption**: Fully Homomorphic Encryption (FHE)
- **Web3**: Ethers.js
- **Wallet**: MetaMask integration

## 📝 Smart Contract

**Contract Address**: `0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1`

The smart contract provides the following key functions:

- `createMarathon()`: Create a new marathon event
- `registerForMarathon()`: Register as a participant with encrypted data
- `recordFinishTime()`: Record encrypted finish times
- `getLeaderboard()`: Retrieve anonymous rankings
- `completeMarathon()`: Finalize event and distribute prizes

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

- **Smart Contract Auditing**: Thoroughly tested contract logic
- **Access Control**: Only authorized operations permitted
- **Immutable Records**: Blockchain ensures data cannot be altered
- **Decentralized Storage**: No central point of failure

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

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, or Safari)
- MetaMask wallet extension installed
- Cryptocurrency for transaction fees and registration

### Quick Start

1. Visit [https://anonymous-marathon.vercel.app/](https://anonymous-marathon.vercel.app/)
2. Click "Connect Wallet" to link your MetaMask
3. Browse available marathons or create a new event
4. Register for an event with your encrypted personal data
5. Participate anonymously and track results on the leaderboard

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

## 🤝 Contributing

We welcome contributions from the community! Areas where you can help:

- **UI/UX Improvements**: Enhance the user interface
- **Security Audits**: Review smart contract code
- **Feature Development**: Add new functionality
- **Documentation**: Improve guides and tutorials
- **Testing**: Help identify and report bugs

## 🔗 Links

- **GitHub Repository**: [https://github.com/KurtisSpencer/AnonymousMarathon](https://github.com/KurtisSpencer/AnonymousMarathon)
- **Live Application**: [https://anonymous-marathon.vercel.app/](https://anonymous-marathon.vercel.app/)
- **Demo Video**: [Watch Demo](./AnonymousMarathon.mp4)

## 📧 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the demo video for guidance

## 🙏 Acknowledgments

This project demonstrates the power of combining blockchain technology with Fully Homomorphic Encryption to create privacy-preserving applications. Special thanks to the FHE and Web3 communities for their groundbreaking work in cryptography and decentralized systems.

---

**Built with privacy in mind. Run with confidence. Compete with anonymity.**
