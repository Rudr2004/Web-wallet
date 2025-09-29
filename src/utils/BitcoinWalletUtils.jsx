// BitcoinWalletUtils.jsx - Frontend Bitcoin wallet utilities
import { useMemo } from 'react';
import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';

// Initialize with ecc
const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

// Bitcoin wallet utility class for frontend operations
export class BitcoinWalletUtils {
  constructor() {
    this.network = bitcoin.networks.testnet;
    this.apiUrl = 'https://blockstream.info/testnet/api';
  }

  // Generate a new Bitcoin wallet
  generateWallet() {
    try {
      const keyPair = ECPair.makeRandom({ network: this.network });
      
      const { address } = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: this.network
      });
      
      return {
        success: true,
        address: address,
        privateKey: keyPair.toWIF(),
        publicKey: keyPair.publicKey.toString('hex'),
        network: 'Bitcoin Testnet'
      };
    } catch (error) {
      console.error('Error generating Bitcoin wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate wallet from seed phrase
  generateFromSeed(mnemonic = null) {
    try {
      const seedPhrase = mnemonic || bip39.generateMnemonic();
      
      if (!bip39.validateMnemonic(seedPhrase)) {
        throw new Error('Invalid mnemonic phrase');
      }

      const seed = bip39.mnemonicToSeedSync(seedPhrase);
      const root = bip32.fromSeed(seed, this.network);
      const path = "m/44'/1'/0'/0/0";
      const child = root.derivePath(path);
      
      const keyPair = ECPair.fromPrivateKey(child.privateKey, { network: this.network });
      const { address } = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: this.network
      });
      
      return {
        success: true,
        mnemonic: seedPhrase,
        address: address,
        privateKey: keyPair.toWIF(),
        publicKey: keyPair.publicKey.toString('hex'),
        derivationPath: path,
        network: 'Bitcoin Testnet'
      };
    } catch (error) {
      console.error('Error generating Bitcoin wallet from seed:', error);
      return { success: false, error: error.message };
    }
  }

  // Import wallet from private key
  importFromPrivateKey(privateKeyWIF) {
    try {
      const keyPair = ECPair.fromWIF(privateKeyWIF, this.network);
      const { address } = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: this.network
      });
      
      return {
        success: true,
        address: address,
        privateKey: privateKeyWIF,
        publicKey: keyPair.publicKey.toString('hex'),
        network: 'Bitcoin Testnet'
      };
    } catch (error) {
      console.error('Error importing Bitcoin wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Get wallet balance
  async getBalance(address) {
    try {
      console.log(`Fetching balance for ${address}...`);
      
      const response = await fetch(`${this.apiUrl}/address/${address}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const balance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
      const balanceBTC = balance / 100000000; // Convert satoshis to BTC
      
      console.log(`Balance for ${address}: ${balanceBTC} BTC`);
      
      return {
        success: true,
        address: address,
        balance: balanceBTC,
        balanceSats: balance,
        confirmed: data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
        unconfirmed: data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum
      };
    } catch (error) {
      console.error(`Balance fetch error:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Get UTXOs for address
  async getUtxos(address) {
    try {
      console.log(`Fetching UTXOs for ${address}...`);
      
      const response = await fetch(`${this.apiUrl}/address/${address}/utxo`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const utxos = await response.json();
      console.log(`Found ${utxos.length} UTXOs`);
      
      return utxos;
    } catch (error) {
      console.error(`UTXO fetch error:`, error.message);
      return [];
    }
  }

  // Get raw transaction
  async getRawTransaction(txid) {
    for (let i = 0; i < 3; i++) {
      try {
        console.log(`Fetching raw transaction ${txid} (attempt ${i + 1})`);
        
        const response = await fetch(`${this.apiUrl}/tx/${txid}/hex`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const rawTx = await response.text();
        return rawTx;
      } catch (error) {
        if (i === 2) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Send Bitcoin transaction
  async sendBitcoin(fromAddress, toAddress, amountBTC, privateKeyWIF) {
    try {
      console.log(`\n=== BITCOIN TRANSACTION ===`);
      console.log(`From: ${fromAddress}`);
      console.log(`To: ${toAddress}`);
      console.log(`Amount: ${amountBTC} BTC`);

      // Validate inputs
      if (!fromAddress || !toAddress || !amountBTC || !privateKeyWIF) {
        throw new Error('Missing required transaction parameters');
      }

      if (fromAddress === toAddress) {
        throw new Error('Cannot send to the same address');
      }

      // Get balance
      const balanceResult = await this.getBalance(fromAddress);
      if (!balanceResult.success) {
        throw new Error('Failed to get balance: ' + balanceResult.error);
      }

      console.log(`Available balance: ${balanceResult.balance} BTC`);

      if (balanceResult.balance < amountBTC) {
        throw new Error(`Insufficient balance. Available: ${balanceResult.balance} BTC, Required: ${amountBTC} BTC`);
      }

      // Get UTXOs
      const utxos = await this.getUtxos(fromAddress);
      if (utxos.length === 0) {
        throw new Error('No UTXOs available for spending');
      }

      // Calculate amounts in satoshis
      const targetAmount = Math.floor(amountBTC * 100000000);
      const feeRate = 1; // 1 sat/byte
      const estimatedSize = utxos.length * 148 + 2 * 34 + 10;
      const feeAmount = estimatedSize * feeRate;

      console.log(`Target: ${targetAmount} sats, Fee: ${feeAmount} sats`);

      // Select UTXOs
      let inputSum = 0;
      const selectedUtxos = [];

      for (const utxo of utxos) {
        selectedUtxos.push(utxo);
        inputSum += utxo.value;
        
        if (inputSum >= targetAmount + feeAmount) {
          console.log(`Added UTXO: ${utxo.value} sats, Total: ${inputSum} sats`);
          break;
        }
      }

      if (inputSum < targetAmount + feeAmount) {
        throw new Error(`Insufficient funds. Need: ${targetAmount + feeAmount} sats, Have: ${inputSum} sats`);
      }

      // Build transaction
      const psbt = new bitcoin.Psbt({ network: this.network });
      const keyPair = ECPair.fromWIF(privateKeyWIF, this.network);

      // Add inputs
      for (const utxo of selectedUtxos) {
        const rawTx = await this.getRawTransaction(utxo.txid);
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          nonWitnessUtxo: Buffer.from(rawTx, 'hex'),
        });
      }

      console.log('Signing transaction...');

      // Add outputs
      psbt.addOutput({
        address: toAddress,
        value: targetAmount,
      });

      // Add change output if necessary
      const changeAmount = inputSum - targetAmount - feeAmount;
      if (changeAmount > 546) { // Dust threshold
        psbt.addOutput({
          address: fromAddress,
          value: changeAmount,
        });
      }

      // Sign all inputs
      for (let i = 0; i < selectedUtxos.length; i++) {
        psbt.signInput(i, keyPair);
      }

      psbt.finalizeAllInputs();
      const txHex = psbt.extractTransaction().toHex();
      const txId = psbt.extractTransaction().getId();

      console.log(`Transaction ID: ${txId}`);

      console.log('Broadcasting...');

      // Broadcast transaction
      const broadcastResponse = await fetch(`${this.apiUrl}/tx`, {
        method: 'POST',
        body: txHex,
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      if (!broadcastResponse.ok) {
        const errorText = await broadcastResponse.text();
        throw new Error(`Broadcast failed: ${errorText}`);
      }

      const broadcastResult = await broadcastResponse.text();
      console.log('Transaction sent successfully!');

      return {
        success: true,
        txId: broadcastResult,
        explorerUrl: `https://blockstream.info/testnet/tx/${broadcastResult}`,
        fee: feeAmount,
        changeAmount: changeAmount
      };
    } catch (error) {
      console.error('Transaction failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get transaction status
  async getTransactionStatus(txId) {
    try {
      const response = await fetch(`${this.apiUrl}/tx/${txId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        txId: txId,
        confirmed: data.status.confirmed,
        blockHeight: data.status.block_height,
        blockHash: data.status.block_hash,
        confirmations: data.status.confirmed ? 1 : 0,
        explorerUrl: `https://blockstream.info/testnet/tx/${txId}`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Hook for using Bitcoin wallet utilities
export const useBitcoinWallet = () => {
  return useMemo(() => new BitcoinWalletUtils(), []);
};

// Export default instance
export default new BitcoinWalletUtils();