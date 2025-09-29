// walletApi.jsx - API service for wallet operations
import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bitcoin API functions
export const bitcoinApi = {
  async generateWallet() {
    try {
      const response = await api.post('/bitcoin/generate');
      return response.data;
    } catch (error) {
      console.error('Error generating Bitcoin wallet:', error);
      return { success: false, error: error.message };
    }
  },

  async generateFromSeed(mnemonic = null) {
    try {
      const response = await api.post('/bitcoin/generate-from-seed', { mnemonic });
      return response.data;
    } catch (error) {
      console.error('Error generating Bitcoin wallet from seed:', error);
      return { success: false, error: error.message };
    }
  },

  async importWallet(privateKey) {
    try {
      const response = await api.post('/bitcoin/import', { privateKey });
      return response.data;
    } catch (error) {
      console.error('Error importing Bitcoin wallet:', error);
      return { success: false, error: error.message };
    }
  },

  async getBalance(address) {
    try {
      const response = await api.get(`/bitcoin/balance/${address}`);
      return response.data;
    } catch (error) {
      console.error('Error getting Bitcoin balance:', error);
      return { success: false, error: error.message };
    }
  },

  async sendBitcoin(fromAddress, toAddress, amount, privateKey) {
    try {
      const response = await api.post('/bitcoin/send', {
        fromAddress,
        toAddress,
        amount,
        privateKey,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending Bitcoin:', error);
      return { success: false, error: error.message };
    }
  },

  async getTransactionStatus(txid) {
    try {
      const response = await api.get(`/bitcoin/transaction/${txid}`);
      return response.data;
    } catch (error) {
      console.error('Error getting Bitcoin transaction status:', error);
      return { success: false, error: error.message };
    }
  },
};

// Cronos API functions
export const cronosApi = {
  async generateWallet() {
    try {
      const response = await api.post('/cronos/generate');
      return response.data;
    } catch (error) {
      console.error('Error generating Cronos wallet:', error);
      return { success: false, error: error.message };
    }
  },

  async generateFromSeed(mnemonic = null) {
    try {
      const response = await api.post('/cronos/generate-from-seed', { mnemonic });
      return response.data;
    } catch (error) {
      console.error('Error generating Cronos wallet from seed:', error);
      return { success: false, error: error.message };
    }
  },

  async importWallet(privateKey) {
    try {
      const response = await api.post('/cronos/import', { privateKey });
      return response.data;
    } catch (error) {
      console.error('Error importing Cronos wallet:', error);
      return { success: false, error: error.message };
    }
  },

  async getBalance(address) {
    try {
      const response = await api.get(`/cronos/balance/${address}`);
      return response.data;
    } catch (error) {
      console.error('Error getting Cronos balance:', error);
      return { success: false, error: error.message };
    }
  },

  async sendCRO(fromAddress, toAddress, amount, privateKey) {
    try {
      const response = await api.post('/cronos/send', {
        fromAddress,
        toAddress,
        amount,
        privateKey,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending CRO:', error);
      return { success: false, error: error.message };
    }
  },

  async getTransactionStatus(txHash) {
    try {
      const response = await api.get(`/cronos/transaction/${txHash}`);
      return response.data;
    } catch (error) {
      console.error('Error getting Cronos transaction status:', error);
      return { success: false, error: error.message };
    }
  },

  async getNetworkInfo() {
    try {
      const response = await api.get('/cronos/network');
      return response.data;
    } catch (error) {
      console.error('Error getting Cronos network info:', error);
      return { success: false, error: error.message };
    }
  },

  // Token-specific functions
  async getTokenInfo(tokenAddress) {
    try {
      const response = await api.post('/cronos/token/info', { tokenAddress });
      return response.data;
    } catch (error) {
      console.error('Error getting token info:', error);
      return { success: false, error: error.message };
    }
  },

  async getTokenBalance(walletAddress, tokenAddress) {
    try {
      const response = await api.post('/cronos/token/balance', {
        walletAddress,
        tokenAddress,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return { success: false, error: error.message };
    }
  },

  async sendToken(fromAddress, toAddress, tokenAddress, amount, privateKey) {
    try {
      const response = await api.post('/cronos/token/send', {
        fromAddress,
        toAddress,
        tokenAddress,
        amount,
        privateKey,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending token:', error);
      return { success: false, error: error.message };
    }
  },
};

// General API functions
export const generalApi = {
  async getHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking API health:', error);
      return { success: false, error: error.message };
    }
  },

  async getNetworks() {
    try {
      const response = await api.get('/networks');
      return response.data;
    } catch (error) {
      console.error('Error getting networks info:', error);
      return { success: false, error: error.message };
    }
  },
};

export default { bitcoinApi, cronosApi, generalApi };