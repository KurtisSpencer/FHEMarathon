# Deployment Guide

This document provides comprehensive information about deploying and managing the Anonymous Marathon Platform smart contract.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment Process](#deployment-process)
- [Contract Verification](#contract-verification)
- [Deployment Information](#deployment-information)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the contract, ensure you have:

1. **Node.js and npm**: Version 16.0 or higher
2. **Hardhat**: Installed via npm
3. **MetaMask or Web3 Wallet**: With testnet ETH for gas fees
4. **Etherscan API Key**: For contract verification (optional but recommended)

### Getting Testnet ETH

For Sepolia testnet deployment, obtain test ETH from:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

## Installation

1. Clone the repository and navigate to the project directory:

```bash
cd D:/
```

2. Install dependencies:

```bash
npm install
```

3. Verify installation:

```bash
npx hardhat version
```

## Configuration

### 1. Environment Setup

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your details:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Private Key (NEVER share or commit this!)
PRIVATE_KEY=your_private_key_here

# Etherscan API Key
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Gas Reporter
REPORT_GAS=false
```

**Security Warning**: Never commit your `.env` file or share your private key!

### 3. Get Your Private Key

From MetaMask:
1. Click the account menu
2. Select "Account Details"
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key (starts with 0x)

### 4. Get Etherscan API Key

1. Create an account at [Etherscan.io](https://etherscan.io/)
2. Navigate to API Keys
3. Click "Add" to create a new API key
4. Copy the API key to your `.env` file

## Deployment Process

### Local Deployment (Hardhat Network)

For testing purposes, deploy to a local Hardhat network:

```bash
# Start local node
npm run node

# In a new terminal, deploy
npx hardhat run scripts/deploy.js --network localhost
```

### Sepolia Testnet Deployment

Deploy to Sepolia testnet:

```bash
npm run deploy:sepolia
```

Or using Hardhat directly:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Deployment Output

The deployment script provides detailed information:

```
========================================
Anonymous Marathon Platform Deployment
========================================

Deployment Configuration:
------------------------
Network: sepolia
Deployer Address: 0x1234...5678
Deployer Balance: 0.5 ETH

Deploying AnonymousMarathon Contract...
---------------------------------------
Sending deployment transaction...

✅ Deployment Successful!
========================

Contract Details:
----------------
Contract Address: 0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1
Deployment Duration: 15.32s
Transaction Hash: 0xabcd...efgh
Block Number: 4567890
Gas Used: 2345678
Gas Price: 1.5 gwei
Deployment Cost: 0.0035 ETH

Verifying Contract State:
------------------------
Organizer: 0x1234...5678
Registration Fee: 0.001 ETH
Current Marathon ID: 0

Network Information:
-------------------
Network: Ethereum Sepolia Testnet
Chain ID: 11155111
Explorer: https://sepolia.etherscan.io/address/0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1
Verify Contract: npx hardhat verify --network sepolia 0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1

📝 Deployment info saved to: deployments/sepolia-deployment.json
✅ .env file updated with contract address
```

## Contract Verification

After deployment, verify the contract on Etherscan:

```bash
npm run verify
```

Or manually:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Verification Output

```
========================================
Contract Verification Script
========================================

Verification Configuration:
--------------------------
Network: sepolia
Contract: AnonymousMarathon
Address: 0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1

Starting verification process...

✅ Contract Verified Successfully!
=================================

View on Etherscan:
https://sepolia.etherscan.io/address/0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1#code

📝 Deployment info updated with verification status
```

## Deployment Information

### Current Deployment

**Network**: Ethereum Sepolia Testnet

**Contract Information**:
- **Contract Address**: `0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1`
- **Chain ID**: `11155111`
- **Deployment Date**: 2024-10-29
- **Compiler Version**: 0.8.24
- **Optimization**: Enabled (200 runs)
- **License**: MIT

**Network Details**:
- **Network Name**: Sepolia
- **RPC URL**: https://ethereum-sepolia-rpc.publicnode.com
- **Explorer**: https://sepolia.etherscan.io/

**Etherscan Links**:
- **Contract**: https://sepolia.etherscan.io/address/0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1
- **Verified Source**: https://sepolia.etherscan.io/address/0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1#code
- **Read Contract**: https://sepolia.etherscan.io/address/0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1#readContract
- **Write Contract**: https://sepolia.etherscan.io/address/0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1#writeContract

### Contract Configuration

**Initial Settings**:
- **Organizer**: Deployer address
- **Registration Fee**: 0.001 ETH (adjustable by organizer)
- **Current Marathon ID**: 0 (increments with each marathon created)

### Deployment Files

Deployment information is saved in:
- `deployments/sepolia-deployment.json` - Full deployment details
- `.env` - Updated with contract address

## Contract Interaction

### Using the Interaction Script

Run the interactive CLI:

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

### Running a Simulation

Test the full marathon workflow:

```bash
npm run simulate
```

The simulation:
1. Creates a new marathon event
2. Registers 5 anonymous runners
3. Records finish times for each runner
4. Displays the encrypted leaderboard
5. Shows expected prize distribution

## Troubleshooting

### Common Issues

#### 1. Insufficient Balance

**Error**: "sender doesn't have enough funds"

**Solution**:
- Get testnet ETH from faucets
- Check balance: `npx hardhat run scripts/check-balance.js`

#### 2. Network Connection Issues

**Error**: "could not detect network"

**Solution**:
- Verify RPC URL in `.env`
- Try alternative RPC endpoints:
  - `https://rpc.sepolia.org`
  - `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
  - `https://sepolia.gateway.tenderly.co`

#### 3. Private Key Issues

**Error**: "invalid private key"

**Solution**:
- Ensure private key starts with `0x`
- Remove any spaces or special characters
- Verify key is from the correct wallet

#### 4. Verification Fails

**Error**: "verification failed"

**Solutions**:
- Wait 1-2 minutes after deployment before verifying
- Check Etherscan API key is valid
- Ensure contract is compiled with same settings
- Verify constructor arguments match

#### 5. Gas Price Too Low

**Error**: "replacement transaction underpriced"

**Solution**:
- Set higher gas price in hardhat.config.js
- Wait for network congestion to decrease
- Use gas price estimation tools

### Getting Help

If you encounter issues:

1. Check Hardhat documentation: https://hardhat.org/
2. Review contract logs in `deployments/` folder
3. Check transaction on Etherscan
4. Verify network status: https://sepolia.etherscan.io/

## Gas Estimation

Estimated gas costs on Sepolia (at 1 gwei):

| Operation | Gas Used | Cost (ETH) |
|-----------|----------|------------|
| Deploy Contract | ~2,500,000 | 0.0025 |
| Create Marathon | ~150,000 | 0.00015 |
| Register Runner | ~180,000 | 0.00018 |
| Record Finish Time | ~100,000 | 0.0001 |
| Complete Marathon | ~200,000 | 0.0002 |

**Note**: Gas prices vary based on network congestion. Check current prices at [ETH Gas Station](https://ethgasstation.info/).

## Security Best Practices

1. **Never commit private keys**: Always use `.env` files and add to `.gitignore`
2. **Use testnet first**: Test thoroughly before mainnet deployment
3. **Verify contracts**: Always verify on Etherscan for transparency
4. **Audit code**: Consider professional audits for production use
5. **Monitor deployment**: Watch for unusual activity after deployment
6. **Backup keys**: Securely backup private keys and seed phrases
7. **Use hardware wallets**: For mainnet deployments, use hardware wallets

## Upgrading and Maintenance

### Updating Registration Fee

```bash
npm run interact
# Select option 8: Update Registration Fee
```

### Canceling a Marathon

```bash
npm run interact
# Select option 9: Cancel Marathon
# Participants will be automatically refunded
```

### Emergency Withdrawal

If needed, the organizer can withdraw contract funds:

```javascript
// In interact.js or custom script
await contract.emergencyWithdraw();
```

## Additional Resources

- **Hardhat Documentation**: https://hardhat.org/docs
- **Ethers.js Documentation**: https://docs.ethers.org/
- **Sepolia Testnet Info**: https://sepolia.dev/
- **FHE Library Docs**: https://docs.fhevm.io/
- **Smart Contract Security**: https://consensys.github.io/smart-contract-best-practices/

## Support

For issues or questions:
- Create an issue in the GitHub repository
- Check existing documentation
- Review demo video for guidance

---

**Last Updated**: October 2024
**Version**: 1.0.0
**Network**: Sepolia Testnet
