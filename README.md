# Blockchain-based Waste Management System

A decentralized waste management system built with Solidity, React, Node.js, and MongoDB.

## Project Structure
```
waste-management/
├── smart-contracts/     # Solidity smart contracts
├── backend/            # Node.js Express server
├── frontend/          # React.js application
└── README.md
```

## Prerequisites

- Node.js v16+ and npm
- MongoDB
- MetaMask browser extension
- Hardhat for smart contract development

## Quick Start

### 1. Smart Contracts Setup
```bash
cd smart-contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CONTRACT_ADDRESS=deployed_contract_address
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_CONTRACT_ADDRESS=deployed_contract_address
REACT_APP_CHAIN_ID=80001  # Mumbai testnet
```

## Features

- **Citizens**: Report waste and earn rewards
- **Collectors**: Mark waste as collected and manage pickups
- **Admins**: Monitor system activity and manage users
- **Blockchain Integration**: Transparent waste tracking and reward distribution
- **MetaMask Authentication**: Secure user authentication

## Tech Stack

- **Frontend**: React.js, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Blockchain**: Solidity (Polygon Mumbai Testnet)
- **Authentication**: MetaMask

## License

MIT
