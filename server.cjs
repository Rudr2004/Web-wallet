// server.js - Complete Multi-Chain Wallet Server
const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('Starting complete multi-chain wallet server...');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'http://0.0.0.0:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

console.log('Middleware loaded...');

// Initialize wallet classes
let BitcoinWallet, CronosWallet;
try {
  BitcoinWallet = require('./bitcoin_wallet.cjs');
  CronosWallet = require('./cronos_wallet.cjs');
  console.log('Wallet classes loaded successfully');
} catch (error) {
  console.error('Error loading wallet classes:', error.message);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Multi-chain wallet server is running!',
    timestamp: new Date().toISOString(),
    wallets: {
      bitcoin: BitcoinWallet ? 'Ready' : 'Error',
      cronos: CronosWallet ? 'Ready' : 'Error'
    }
  });
});

// ============= BITCOIN API ROUTES =============

// Generate new Bitcoin wallet
app.post('/api/bitcoin/generate', (req, res) => {
  try {
    console.log('Generating new Bitcoin wallet...');
    const btcWallet = new BitcoinWallet();
    const wallet = btcWallet.generateWallet();
    console.log('Bitcoin wallet generated:', wallet.success ? 'Success' : 'Failed');
    res.json(wallet);
  } catch (error) {
    console.error('Bitcoin generate error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Bitcoin wallet from seed
app.post('/api/bitcoin/generate-from-seed', (req, res) => {
  try {
    console.log('Generating Bitcoin wallet from seed...');
    const { mnemonic } = req.body;
    const btcWallet = new BitcoinWallet();
    const wallet = btcWallet.generateFromSeed(mnemonic);
    console.log('Bitcoin seed wallet generated:', wallet.success ? 'Success' : 'Failed');
    res.json(wallet);
  } catch (error) {
    console.error('Bitcoin seed generate error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Import Bitcoin wallet from private key
app.post('/api/bitcoin/import', (req, res) => {
  try {
    console.log('Importing Bitcoin wallet...');
    const { privateKey } = req.body;
    const btcWallet = new BitcoinWallet();
    const wallet = btcWallet.importFromPrivateKey(privateKey);
    console.log('Bitcoin wallet imported:', wallet.success ? 'Success' : 'Failed');
    res.json(wallet);
  } catch (error) {
    console.error('Bitcoin import error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Bitcoin balance
app.get('/api/bitcoin/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    console.log('Checking Bitcoin balance for:', address);
    const btcWallet = new BitcoinWallet();
    const balance = await btcWallet.getBalance(address);
    console.log('Bitcoin balance result:', balance);
    res.json(balance);
  } catch (error) {
    console.error('Bitcoin balance error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send Bitcoin
app.post('/api/bitcoin/send', async (req, res) => {
  try {
    console.log('Sending Bitcoin transaction...');
    const { fromAddress, toAddress, amount, privateKey } = req.body;
    const btcWallet = new BitcoinWallet();
    const result = await btcWallet.sendBitcoin(fromAddress, toAddress, amount, privateKey);
    console.log('Bitcoin send result:', result.success ? 'Success' : 'Failed');
    res.json(result);
  } catch (error) {
    console.error('Bitcoin send error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Bitcoin transaction status
app.get('/api/bitcoin/transaction/:txid', async (req, res) => {
  try {
    const { txid } = req.params;
    console.log('Getting Bitcoin transaction:', txid);
    const btcWallet = new BitcoinWallet();
    const transaction = await btcWallet.getTransactionStatus(txid);
    res.json(transaction);
  } catch (error) {
    console.error('Bitcoin transaction error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= CRONOS API ROUTES =============

// Generate new Cronos wallet
app.post('/api/cronos/generate', (req, res) => {
  try {
    console.log('Generating new Cronos wallet...');
    const cronosWallet = new CronosWallet();
    const wallet = cronosWallet.generateWallet();
    console.log('Cronos wallet generated:', wallet.success ? 'Success' : 'Failed');
    res.json(wallet);
  } catch (error) {
    console.error('Cronos generate error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Cronos wallet from seed
app.post('/api/cronos/generate-from-seed', (req, res) => {
  try {
    console.log('Generating Cronos wallet from seed...');
    const { mnemonic } = req.body;
    const cronosWallet = new CronosWallet();
    const wallet = cronosWallet.generateFromSeed(mnemonic);
    console.log('Cronos seed wallet generated:', wallet.success ? 'Success' : 'Failed');
    res.json(wallet);
  } catch (error) {
    console.error('Cronos seed generate error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Import Cronos wallet from private key
app.post('/api/cronos/import', (req, res) => {
  try {
    console.log('Importing Cronos wallet...');
    const { privateKey } = req.body;
    const cronosWallet = new CronosWallet();
    const wallet = cronosWallet.importFromPrivateKey(privateKey);
    console.log('Cronos wallet imported:', wallet.success ? 'Success' : 'Failed');
    res.json(wallet);
  } catch (error) {
    console.error('Cronos import error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Cronos balance
app.get('/api/cronos/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    console.log('Checking Cronos balance for:', address);
    const cronosWallet = new CronosWallet();
    const balance = await cronosWallet.getBalance(address);
    console.log('Cronos balance result:', balance);
    res.json(balance);
  } catch (error) {
    console.error('Cronos balance error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send CRO
app.post('/api/cronos/send', async (req, res) => {
  try {
    console.log('Sending CRO transaction...');
    const { fromAddress, toAddress, amount, privateKey } = req.body;
    const cronosWallet = new CronosWallet();
    const result = await cronosWallet.sendCRO(fromAddress, toAddress, amount, privateKey);
    console.log('CRO send result:', result.success ? 'Success' : 'Failed');
    res.json(result);
  } catch (error) {
    console.error('CRO send error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Cronos transaction status
app.get('/api/cronos/transaction/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    console.log('Getting Cronos transaction:', txHash);
    const cronosWallet = new CronosWallet();
    const transaction = await cronosWallet.getTransactionStatus(txHash);
    res.json(transaction);
  } catch (error) {
    console.error('Cronos transaction error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get token information
app.post('/api/cronos/token/info', async (req, res) => {
  try {
    console.log('Getting token info...');
    const { tokenAddress } = req.body;
    const cronosWallet = new CronosWallet();
    const tokenInfo = await cronosWallet.getTokenInfo(tokenAddress);
    console.log('Token info result:', tokenInfo);
    res.json(tokenInfo);
  } catch (error) {
    console.error('Token info error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get token balance
app.post('/api/cronos/token/balance', async (req, res) => {
  try {
    console.log('Getting token balance...');
    const { walletAddress, tokenAddress } = req.body;
    const cronosWallet = new CronosWallet();
    const balance = await cronosWallet.getTokenBalance(walletAddress, tokenAddress);
    console.log('Token balance result:', balance);
    res.json(balance);
  } catch (error) {
    console.error('Token balance error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send ERC20 tokens
app.post('/api/cronos/token/send', async (req, res) => {
  try {
    console.log('Sending ERC20 tokens...');
    const { fromAddress, toAddress, tokenAddress, amount, privateKey } = req.body;
    const cronosWallet = new CronosWallet();
    const result = await cronosWallet.sendToken(fromAddress, toAddress, tokenAddress, amount, privateKey);
    console.log('Token send result:', result.success ? 'Success' : 'Failed');
    res.json(result);
  } catch (error) {
    console.error('Token send error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Cronos network info
app.get('/api/cronos/network', async (req, res) => {
  try {
    console.log('Getting Cronos network info...');
    const cronosWallet = new CronosWallet();
    const networkInfo = await cronosWallet.getNetworkInfo();
    res.json(networkInfo);
  } catch (error) {
    console.error('Cronos network error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= UTILITY ROUTES =============

// Get supported networks
app.get('/api/networks', (req, res) => {
  res.json({
    success: true,
    networks: {
      bitcoin: {
        name: 'Bitcoin Testnet',
        type: 'UTXO',
        symbol: 'BTC',
        decimals: 8,
        explorer: 'https://blockstream.info/testnet/',
        faucets: [
          'https://bitcoinfaucet.uo1.net/',
          'https://testnet-faucet.mempool.co/',
          'https://coinfaucet.eu/en/btc-testnet/'
        ]
      },
      cronos: {
        name: 'Cronos Testnet',
        type: 'EVM',
        symbol: 'CRO',
        decimals: 18,
        chainId: 338,
        explorer: 'https://testnet.cronoscan.com/',
        rpcUrl: 'https://evm-t3.cronos.org',
        faucet: 'https://cronos.org/faucet'
      }
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Multi-chain wallet server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 CORS enabled for frontend on port 5000`);
  console.log('='*50);
});

module.exports = app;