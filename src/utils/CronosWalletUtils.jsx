// CronosWalletUtils.jsx - Frontend Cronos wallet utilities
import { useMemo } from 'react';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';

// Standard ERC20 ABI - only the functions we need
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

// Cronos wallet utility class for frontend operations
export class CronosWalletUtils {
  constructor() {
    this.rpcUrl = "https://evm-t3.cronos.org";
    this.chainId = 338;
    this.explorerUrl = "https://testnet.cronoscan.com";

    try {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      console.log("Ethers.js provider initialized for Cronos");
    } catch (error) {
      console.error("Failed to initialize ethers provider:", error.message);
      throw error;
    }
  }

  // Generate a new Cronos wallet
  generateWallet() {
    try {
      const wallet = ethers.Wallet.createRandom();

      return {
        success: true,
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase,
        network: "Cronos Testnet",
        chainId: this.chainId,
      };
    } catch (error) {
      console.error('Error generating Cronos wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate wallet from seed phrase
  generateFromSeed(mnemonic = null) {
    try {
      const seedPhrase = mnemonic || bip39.generateMnemonic();

      if (!bip39.validateMnemonic(seedPhrase)) {
        throw new Error("Invalid mnemonic phrase");
      }

      const wallet = ethers.Wallet.fromPhrase(seedPhrase);

      return {
        success: true,
        mnemonic: seedPhrase,
        address: wallet.address,
        privateKey: wallet.privateKey,
        derivationPath: "m/44'/60'/0'/0/0",
        network: "Cronos Testnet",
        chainId: this.chainId,
      };
    } catch (error) {
      console.error('Error generating Cronos wallet from seed:', error);
      return { success: false, error: error.message };
    }
  }

  // Import wallet from private key
  importFromPrivateKey(privateKey) {
    try {
      if (!privateKey.startsWith("0x")) {
        privateKey = "0x" + privateKey;
      }

      const wallet = new ethers.Wallet(privateKey);

      return {
        success: true,
        address: wallet.address,
        privateKey: wallet.privateKey,
        network: "Cronos Testnet",
        chainId: this.chainId,
      };
    } catch (error) {
      console.error('Error importing Cronos wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Get wallet balance
  async getBalance(address) {
    try {
      console.log(`Getting balance for address: ${address}`);
      
      const balance = await this.provider.getBalance(address);
      const balanceCRO = ethers.formatEther(balance);

      return {
        success: true,
        address: address,
        balance: parseFloat(balanceCRO),
        balanceWei: balance.toString(),
        symbol: "CRO"
      };
    } catch (error) {
      console.error('Error getting Cronos balance:', error);
      return { success: false, error: error.message };
    }
  }

  // Send CRO transaction
  async sendCRO(fromAddress, toAddress, amount, privateKey) {
    try {
      console.log("\n=== CRO TRANSACTION ===");
      console.log(`From: ${fromAddress}`);
      console.log(`To: ${toAddress}`);
      console.log(`Amount: ${amount} CRO`);

      // Validate inputs
      if (!fromAddress || !toAddress || !amount || !privateKey) {
        throw new Error("Missing required transaction parameters");
      }

      if (fromAddress === toAddress) {
        throw new Error("Cannot send to the same address");
      }

      // Create wallet instance
      const wallet = new ethers.Wallet(privateKey, this.provider);

      // Validate address matches
      if (wallet.address.toLowerCase() !== fromAddress.toLowerCase()) {
        throw new Error("Private key does not match the from address");
      }

      // Check balance
      const balanceResult = await this.getBalance(fromAddress);
      if (!balanceResult.success) {
        throw new Error(`Failed to get balance: ${balanceResult.error}`);
      }

      console.log(`Available balance: ${balanceResult.balance} CRO`);

      if (balanceResult.balance < amount) {
        throw new Error(`Insufficient balance. Available: ${balanceResult.balance} CRO, Required: ${amount} CRO`);
      }

      // Get gas price and estimate gas
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice;

      const tx = {
        to: toAddress,
        value: ethers.parseEther(amount.toString()),
        gasLimit: 21000,
        gasPrice: gasPrice,
      };

      console.log("Estimating gas...");
      const gasEstimate = await wallet.estimateGas(tx);
      tx.gasLimit = gasEstimate;

      console.log(`Gas estimate: ${gasEstimate.toString()}`);
      console.log(`Gas price: ${ethers.formatUnits(gasPrice, "gwei")} Gwei`);

      const gasCost = gasEstimate * gasPrice;
      const gasCostCRO = parseFloat(ethers.formatEther(gasCost));
      console.log(`Estimated gas cost: ${gasCostCRO.toFixed(6)} CRO`);

      console.log("Sending CRO transaction...");
      const txResponse = await wallet.sendTransaction(tx);

      console.log(`Transaction sent: ${txResponse.hash}`);
      console.log("Waiting for confirmation...");

      const receipt = await txResponse.wait();

      console.log("Transaction confirmed!");

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: gasPrice.toString(),
        explorerUrl: `${this.explorerUrl}/tx/${receipt.hash}`,
        fee: gasCostCRO
      };
    } catch (error) {
      console.error("CRO transaction failed:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get token information
  async getTokenInfo(tokenAddress) {
    try {
      console.log(`Getting token info for: ${tokenAddress}`);
      
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);

      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
      ]);

      return {
        success: true,
        address: tokenAddress,
        name: name,
        symbol: symbol,
        decimals: Number(decimals),
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return { success: false, error: error.message };
    }
  }

  // Get token balance
  async getTokenBalance(walletAddress, tokenAddress) {
    try {
      console.log(`Getting token balance for wallet: ${walletAddress}, token: ${tokenAddress}`);
      
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);

      const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(walletAddress),
        contract.decimals(),
        contract.symbol(),
      ]);

      const formattedBalance = ethers.formatUnits(balance, decimals);

      return {
        success: true,
        walletAddress: walletAddress,
        tokenAddress: tokenAddress,
        balance: parseFloat(formattedBalance),
        balanceRaw: balance.toString(),
        symbol: symbol,
        decimals: Number(decimals),
      };
    } catch (error) {
      console.error('Error getting token balance:', error);
      return { success: false, error: error.message };
    }
  }

  // Send ERC20 token
  async sendToken(fromAddress, toAddress, tokenAddress, amount, privateKey) {
    try {
      console.log("\n=== ERC20 TOKEN TRANSFER ===");
      console.log(`From: ${fromAddress}`);
      console.log(`To: ${toAddress}`);
      console.log(`Token: ${tokenAddress}`);
      console.log(`Amount: ${amount}`);

      // Validate inputs
      if (!fromAddress || !toAddress || !tokenAddress || !amount || !privateKey) {
        throw new Error("Missing required transaction parameters");
      }

      if (fromAddress === toAddress) {
        throw new Error("Cannot send to the same address");
      }

      // Create wallet and contract instances
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

      // Validate address matches
      if (wallet.address.toLowerCase() !== fromAddress.toLowerCase()) {
        throw new Error("Private key does not match the from address");
      }

      // Get token info
      const tokenInfo = await this.getTokenInfo(tokenAddress);
      if (!tokenInfo.success) {
        throw new Error(`Failed to get token info: ${tokenInfo.error}`);
      }

      const { symbol, decimals } = tokenInfo;
      console.log(`Token: ${symbol}, Decimals: ${decimals}`);

      // Convert amount to token units
      const amountInTokenUnits = ethers.parseUnits(amount.toString(), decimals);
      console.log(`Amount in token units: ${amountInTokenUnits.toString()}`);

      // Check token balance
      const balanceResult = await this.getTokenBalance(fromAddress, tokenAddress);
      if (!balanceResult.success) {
        throw new Error(`Failed to get token balance: ${balanceResult.error}`);
      }

      if (balanceResult.balance < amount) {
        throw new Error(`Insufficient token balance. Available: ${balanceResult.balance} ${symbol}, Required: ${amount} ${symbol}`);
      }

      // Check CRO balance for gas
      const croBalance = await this.getBalance(fromAddress);
      if (!croBalance.success) {
        throw new Error(`Failed to get CRO balance: ${croBalance.error}`);
      }

      console.log("Estimating gas...");

      // Estimate gas for the transaction
      const gasEstimate = await contract.transfer.estimateGas(toAddress, amountInTokenUnits);
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      const gasLimit = gasEstimate + BigInt(10000); // Add buffer

      console.log(`Gas estimate: ${gasEstimate.toString()}`);
      console.log(`Gas limit (with buffer): ${gasLimit.toString()}`);

      const gasCost = gasLimit * gasPrice;
      const gasCostCRO = parseFloat(ethers.formatEther(gasCost));

      console.log(`Estimated gas cost: ${gasCostCRO.toFixed(6)} CRO`);

      if (croBalance.balance < gasCostCRO) {
        throw new Error(`Insufficient CRO for gas. Available: ${croBalance.balance} CRO, Required: ${gasCostCRO.toFixed(6)} CRO`);
      }

      console.log("Sending token transfer transaction...");

      const tx = await contract.transfer(toAddress, amountInTokenUnits, {
        gasLimit: gasLimit,
        gasPrice: gasPrice,
      });

      console.log(`Transaction sent: ${tx.hash}`);
      console.log("Waiting for confirmation...");

      const receipt = await tx.wait();

      console.log("Transaction confirmed!");

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: gasPrice.toString(),
        explorerUrl: `${this.explorerUrl}/tx/${receipt.hash}`,
        fee: gasCostCRO,
        token: {
          address: tokenAddress,
          symbol: symbol,
          amount: amount
        }
      };
    } catch (error) {
      console.error("Token transfer failed:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get transaction status
  async getTransactionStatus(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          success: true,
          txHash: txHash,
          status: "pending",
          confirmed: false,
          explorerUrl: `${this.explorerUrl}/tx/${txHash}`
        };
      }

      return {
        success: true,
        txHash: txHash,
        status: receipt.status === 1 ? "success" : "failed",
        confirmed: true,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        explorerUrl: `${this.explorerUrl}/tx/${txHash}`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get network information
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const feeData = await this.provider.getFeeData();

      return {
        success: true,
        name: "Cronos Testnet",
        chainId: Number(network.chainId),
        blockNumber: blockNumber,
        gasPrice: ethers.formatUnits(feeData.gasPrice, "gwei") + " Gwei",
        explorerUrl: this.explorerUrl,
        rpcUrl: this.rpcUrl
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Hook for using Cronos wallet utilities
export const useCronosWallet = () => {
  return useMemo(() => new CronosWalletUtils(), []);
};

// Export default instance
export default new CronosWalletUtils();