# Anonymous Marathon - React Frontend

React-based frontend for the Anonymous Marathon Registration System using the Universal FHEVM SDK.

## Features

- **React + Next.js**: Modern React application with Next.js framework
- **SDK Integration**: Uses `@fhevm/universal-sdk` for all FHE operations
- **TypeScript**: Full type safety throughout the application
- **Wallet Connection**: MetaMask integration for Ethereum connectivity

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   └── lib/              # Utilities and helpers
├── public/               # Static assets
└── package.json
```

## Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **Create Marathon**: Organizers can create new marathon events
3. **Register**: Runners can register with encrypted personal data
4. **View Leaderboard**: See anonymous rankings and results

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **SDK**: Universal FHEVM SDK
- **Blockchain**: Ethereum-compatible networks
- **Encryption**: Fully Homomorphic Encryption (FHE)

## Related

- See `../static/` for the original HTML/JS version
- See `../contracts/` for the smart contracts
- See main README for full project documentation
