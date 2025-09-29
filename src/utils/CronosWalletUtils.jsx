// CronosWalletUtils.jsx - Frontend Cronos wallet utilities
import axios from 'axios';
import { useMemo } from 'react';

// Cronos wallet utility class for frontend operations
export class CronosWalletUtils {
  constructor() {
    this.apiUrl = '/api/cronos'; // Use proxy to backend
    this.chainId = 338; // Cronos testnet
    this.explorerUrl = 'https://testnet.cronoscan.com';
    this.rpcUrl = 'https://evm-t3.cronos.org';
  }

  // Generate a new Cronos wallet
  async generateWallet() {
    try {
      const response = await axios.post(`${this.apiUrl}/generate`);
      return response.data;
    } catch (error) {
      console.error('Error generating Cronos wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate wallet from seed phrase
  async generateFromSeed(mnemonic = null) {
    try {
      const response = await axios.post(`${this.apiUrl}/generate-from-seed`, { mnemonic });
      return response.data;
    } catch (error) {
      console.error('Error generating Cronos wallet from seed:', error);
      return { success: false, error: error.message };
    }
  }

  // Import wallet from private key
  async importFromPrivateKey(privateKey) {
    try {
      const response = await axios.post(`${this.apiUrl}/import`, { privateKey });
      return response.data;
    } catch (error) {
      console.error('Error importing Cronos wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Get CRO balance
  async getBalance(address) {
    try {
      const response = await axios.get(`${this.apiUrl}/balance/${address}`);
      return response.data;
    } catch (error) {
      console.error('Error getting Cronos balance:', error);
      return { success: false, error: error.message };
    }
  }

  // Send CRO transaction
  async sendCRO(fromAddress, toAddress, amount, privateKey) {
    try {
      const response = await axios.post(`${this.apiUrl}/send`, {
        fromAddress,
        toAddress,
        amount,
        privateKey
      });
      return response.data;
    } catch (error) {
      console.error('Error sending CRO:', error);
      return { success: false, error: error.message };
    }
  }

  // Get transaction status
  async getTransactionStatus(txHash) {
    try {
      const response = await axios.get(`${this.apiUrl}/transaction/${txHash}`);
      return response.data;
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return { success: false, error: error.message };
    }
  }

  // Get network information
  async getNetworkInfo() {
    try {
      const response = await axios.get(`${this.apiUrl}/network`);
      return response.data;
    } catch (error) {
      console.error('Error getting network info:', error);
      return { success: false, error: error.message };
    }
  }

  // Token operations
  async getTokenInfo(tokenAddress) {
    try {
      const response = await axios.post(`${this.apiUrl}/token/info`, { tokenAddress });
      return response.data;
    } catch (error) {
      console.error('Error getting token info:', error);
      return { success: false, error: error.message };
    }
  }

  async getTokenBalance(walletAddress, tokenAddress) {
    try {
      const response = await axios.post(`${this.apiUrl}/token/balance`, {
        walletAddress,
        tokenAddress
      });
      return response.data;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return { success: false, error: error.message };
    }
  }

  async sendToken(fromAddress, toAddress, tokenAddress, amount, privateKey) {
    try {
      const response = await axios.post(`${this.apiUrl}/token/send`, {
        fromAddress,
        toAddress,
        tokenAddress,
        amount,
        privateKey
      });
      return response.data;
    } catch (error) {
      console.error('Error sending token:', error);
      return { success: false, error: error.message };
    }
  }

  // Validate Ethereum/Cronos address
  isValidAddress(address) {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  }

  // Format CRO amount
  formatAmount(amount) {
    return parseFloat(amount).toFixed(6) + ' CRO';
  }

  // Convert Wei to CRO
  weiToCRO(wei) {
    return parseFloat(wei) / Math.pow(10, 18);
  }

  // Convert CRO to Wei
  croToWei(cro) {
    return (parseFloat(cro) * Math.pow(10, 18)).toString();
  }

  // Format token amount with decimals
  formatTokenAmount(amount, decimals, symbol) {
    const divisor = Math.pow(10, decimals);
    const formatted = (parseFloat(amount) / divisor).toFixed(6);
    return `${formatted} ${symbol}`;
  }

  // Get faucet information
  getFaucetInfo() {
    return {
      name: 'Cronos Testnet Faucet',
      url: 'https://cronos.org/faucet',
      amount: '100 CRO per request',
      cooldown: '24 hours',
      requirements: 'Twitter account required',
      description: 'Official Cronos testnet faucet for getting test CRO tokens'
    };
  }

  // Generate QR code data for receiving
  generateReceiveQR(address, amount = null, tokenAddress = null) {
    let qrData = address;
    
    if (amount || tokenAddress) {
      // For ERC20 tokens or specific amounts, could include more metadata
      qrData = {
        address,
        amount,
        tokenAddress,
        chainId: this.chainId
      };
    }
    
    return typeof qrData === 'object' ? JSON.stringify(qrData) : qrData;
  }

  // Get MetaMask configuration for Cronos testnet
  getMetaMaskConfig() {
    return {
      chainId: '0x152', // 338 in hex
      chainName: 'Cronos Testnet',
      nativeCurrency: {
        name: 'CRO',
        symbol: 'CRO',
        decimals: 18
      },
      rpcUrls: [this.rpcUrl],
      blockExplorerUrls: [this.explorerUrl]
    };
  }

  // Add Cronos testnet to MetaMask
  async addToMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [this.getMetaMaskConfig()]
        });
        return { success: true, message: 'Cronos testnet added to MetaMask' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      return { success: false, error: 'MetaMask not detected' };
    }
  }

  // Estimate gas for transactions
  estimateGas(type = 'transfer') {
    const gasEstimates = {
      transfer: 21000, // CRO transfer
      tokenTransfer: 65000, // ERC20 token transfer
      tokenApprove: 50000, // ERC20 approve
      contractInteraction: 100000 // General contract interaction
    };
    
    return gasEstimates[type] || gasEstimates.contractInteraction;
  }

  // Calculate transaction fee
  calculateFee(gasLimit, gasPriceGwei) {
    const gasPrice = parseFloat(gasPriceGwei) * Math.pow(10, 9); // Convert Gwei to Wei
    const fee = gasLimit * gasPrice;
    return this.weiToCRO(fee);
  }

  // Common ERC20 token addresses on Cronos testnet (example)
  getCommonTokens() {
    return [
      {
        name: 'USD Coin',
        symbol: 'USDC',
        address: '0x...',
        decimals: 6,
        description: 'Example USDC on Cronos testnet'
      },
      {
        name: 'Wrapped CRO',
        symbol: 'WCRO',
        address: '0x...',
        decimals: 18,
        description: 'Wrapped CRO token'
      }
    ];
  }
}

// React component for Cronos wallet utilities
export const CronosWalletProvider = ({ children }) => {
  const cronosWallet = new CronosWalletUtils();
  
  return (
    <div className="cronos-wallet-provider">
      {children}
    </div>
  );
};

// Hook for using Cronos wallet utilities
export const useCronosWallet = () => {
  return useMemo(() => new CronosWalletUtils(), []);
};

// Export default instance
export default new CronosWalletUtils();