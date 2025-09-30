# Wallet Integration Project

## Overview
This is a React + TypeScript + Vite frontend-only application for cryptocurrency wallet integration, supporting both Bitcoin and Cronos testnets. The project uses browser-compatible libraries to provide full wallet functionality without requiring a backend server.

## Project Structure
- **Frontend**: React 19 with TypeScript and Vite
- **Wallet Support**: Bitcoin testnet and Cronos testnet integration
- **Build System**: Vite for development and production builds
- **Port**: 5000 (configured for Replit environment)

## Recent Changes (September 30, 2025)
- ✅ Implemented complete Bitcoin wallet functionality with browser-compatible libraries
- ✅ Installed @scure/bip39, @scure/bip32, @bitcoinerlab/secp256k1, bitcoinjs-lib, ecpair
- ✅ Configured vite-plugin-node-polyfills for Buffer/crypto/stream browser support
- ✅ Bitcoin wallet now supports: generate, import (mnemonic/WIF), balance, send, transaction status
- ✅ All operations working error-free in frontend-only setup
- ✅ Cronos wallet fully functional with ethers.js
- ✅ Added QR code generation to Receive tabs for both Bitcoin and Cronos wallets

## Architecture
- **Frontend Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.7 with React plugin
- **Development Server**: Configured for Replit with allowedHosts: true
- **Bitcoin Libraries**: 
  - @scure/bip39 for mnemonic generation
  - @scure/bip32 for HD key derivation
  - @bitcoinerlab/secp256k1 for ECC operations
  - bitcoinjs-lib v6 for Bitcoin protocol
  - ecpair for key pair management
- **Cronos Libraries**: ethers.js v6 for Ethereum-compatible operations
- **Polyfills**: vite-plugin-node-polyfills for Node.js core modules
- **QR Code**: qrcode library for address QR code generation

## Bitcoin Wallet Features
- **Generate Wallet**: BIP39 mnemonic + BIP84 HD derivation (m/84'/1'/0'/0/0)
- **Import**: Support for mnemonic phrases and WIF private keys
- **Balance**: Real-time balance checking via Blockstream API
- **Send**: PSBT-based transactions with UTXO management and fee estimation
- **Transaction Status**: Confirmation tracking via Blockstream API
- **Address Type**: P2WPKH (SegWit bech32) on Bitcoin testnet
- **QR Code**: Automatic QR code generation for receiving addresses

## Cronos Wallet Features
- **Generate Wallet**: Random wallet generation with ethers.js
- **Import**: Support for private keys
- **Balance**: CRO balance checking via Cronos testnet RPC
- **Send**: CRO token transfers with gas estimation
- **ERC20 Support**: Token balance, info, and transfer capabilities
- **QR Code**: Automatic QR code generation for receiving addresses

## Configuration
- **Development**: `npm run dev` serves on port 5000
- **Production Build**: `npm run build` creates optimized build
- **Preview**: `npm run preview` serves production build
- **Deployment**: Configured for autoscale with build step

## Development Workflow
1. Use the "React Dev Server" workflow for development
2. The app runs on port 5000 and is accessible via Replit's preview
3. Hot reloading is enabled for rapid development
4. TypeScript compilation and ESLint checking are integrated

## API Endpoints
- **Bitcoin Testnet**: https://blockstream.info/testnet/api (Blockstream Esplora)
- **Cronos Testnet**: https://evm-t3.cronos.org (RPC endpoint)

## User Preferences
- Frontend-only architecture (no backend required)
- React/TypeScript/Vite stack
- Browser-compatible Bitcoin libraries
- Keep development server on port 5000 for Replit compatibility