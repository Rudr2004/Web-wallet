// BitcoinWalletUtils.jsx - Frontend Bitcoin wallet utilities
import axios from 'axios';
import { useMemo } from 'react';

// Bitcoin wallet utility class for frontend operations
export class BitcoinWalletUtils {
  constructor() {
    this.apiUrl = '/api/bitcoin'; // Use proxy to backend
  }

  // Generate a new Bitcoin wallet
  async generateWallet() {
    try {
      const response = await axios.post(`${this.apiUrl}/generate`);
      return response.data;
    } catch (error) {
      console.error('Error generating Bitcoin wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate wallet from seed phrase
  async generateFromSeed(mnemonic = null) {
    try {
      const response = await axios.post(`${this.apiUrl}/generate-from-seed`, { mnemonic });
      return response.data;
    } catch (error) {
      console.error('Error generating Bitcoin wallet from seed:', error);
      return { success: false, error: error.message };
    }
  }

  // Import wallet from private key
  async importFromPrivateKey(privateKey) {
    try {
      const response = await axios.post(`${this.apiUrl}/import`, { privateKey });
      return response.data;
    } catch (error) {
      console.error('Error importing Bitcoin wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Get wallet balance
  async getBalance(address) {
    try {
      const response = await axios.get(`${this.apiUrl}/balance/${address}`);
      return response.data;
    } catch (error) {
      console.error('Error getting Bitcoin balance:', error);
      return { success: false, error: error.message };
    }
  }

  // Send Bitcoin transaction
  async sendBitcoin(fromAddress, toAddress, amount, privateKey) {
    try {
      const response = await axios.post(`${this.apiUrl}/send`, {
        fromAddress,
        toAddress,
        amount,
        privateKey
      });
      return response.data;
    } catch (error) {
      console.error('Error sending Bitcoin:', error);
      return { success: false, error: error.message };
    }
  }

  // Get transaction status
  async getTransactionStatus(txid) {
    try {
      const response = await axios.get(`${this.apiUrl}/transaction/${txid}`);
      return response.data;
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return { success: false, error: error.message };
    }
  }

  // Validate Bitcoin address (basic validation)
  isValidAddress(address) {
    // Basic Bitcoin testnet address validation
    const testnetRegex = /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const bech32Regex = /^tb1[a-z0-9]{39,59}$/;
    return testnetRegex.test(address) || bech32Regex.test(address);
  }

  // Format Bitcoin amount
  formatAmount(amount) {
    return parseFloat(amount).toFixed(8) + ' BTC';
  }

  // Convert satoshis to BTC
  satoshisToBTC(satoshis) {
    return satoshis / 100000000;
  }

  // Convert BTC to satoshis
  btcToSatoshis(btc) {
    return Math.floor(btc * 100000000);
  }

  // Get faucet URLs for testnet
  getFaucets() {
    return [
      {
        name: 'Bitcoin Faucet UO1',
        url: 'https://bitcoinfaucet.uo1.net/',
        description: 'Get free Bitcoin testnet coins'
      },
      {
        name: 'Mempool Testnet Faucet',
        url: 'https://testnet-faucet.mempool.co/',
        description: 'Mempool.space testnet faucet'
      },
      {
        name: 'CoinFaucet EU',
        url: 'https://coinfaucet.eu/en/btc-testnet/',
        description: 'European Bitcoin testnet faucet'
      }
    ];
  }

  // Generate QR code data for receiving
  generateReceiveQR(address, amount = null, label = null) {
    let qrData = `bitcoin:${address}`;
    const params = [];
    
    if (amount) {
      params.push(`amount=${amount}`);
    }
    if (label) {
      params.push(`label=${encodeURIComponent(label)}`);
    }
    
    if (params.length > 0) {
      qrData += '?' + params.join('&');
    }
    
    return qrData;
  }

  // Estimate transaction fee (simplified)
  estimateFee(inputCount = 1, outputCount = 2) {
    // Simplified fee estimation for Bitcoin
    const inputSize = 148; // bytes per input
    const outputSize = 34; // bytes per output
    const baseSize = 10; // base transaction size
    
    const txSize = baseSize + (inputCount * inputSize) + (outputCount * outputSize);
    const feeRate = 1; // sat/byte for testnet
    
    return txSize * feeRate;
  }
}

// React component for Bitcoin wallet utilities
export const BitcoinWalletProvider = ({ children }) => {
  const bitcoinWallet = new BitcoinWalletUtils();
  
  return (
    <div className="bitcoin-wallet-provider">
      {children}
    </div>
  );
};

// Hook for using Bitcoin wallet utilities
export const useBitcoinWallet = () => {
  return useMemo(() => new BitcoinWalletUtils(), []);
};

// Export default instance
export default new BitcoinWalletUtils();