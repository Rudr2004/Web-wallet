import { useMemo } from 'react';
import * as bitcoin from 'bitcoinjs-lib';
import ecc from '@bitcoinerlab/secp256k1';
import { HDKey } from '@scure/bip32';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { ECPairFactory } from 'ecpair';

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

const TESTNET = bitcoin.networks.testnet;
const API_URL = 'https://blockstream.info/testnet/api';

export class BitcoinWalletUtils {
  constructor() {
    this.network = TESTNET;
    this.apiUrl = API_URL;
    console.log('Bitcoin wallet utilities initialized for testnet');
  }

  generateWallet() {
    try {
      const mnemonic = bip39.generateMnemonic(wordlist, 128);
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      
      const root = HDKey.fromMasterSeed(seed);
      const path = "m/84'/1'/0'/0/0";
      const child = root.derive(path);
      
      if (!child.privateKey) {
        throw new Error('Failed to derive private key');
      }

      const keyPair = ECPair.fromPrivateKey(Buffer.from(child.privateKey));
      
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(keyPair.publicKey),
        network: this.network
      });

      return {
        success: true,
        mnemonic,
        address,
        privateKey: keyPair.toWIF(),
        path,
        publicKey: Buffer.from(keyPair.publicKey).toString('hex')
      };
    } catch (error) {
      console.error('Error generating Bitcoin wallet:', error);
      return { success: false, error: error.message };
    }
  }

  generateFromSeed(mnemonic) {
    try {
      if (!mnemonic) {
        const newMnemonic = bip39.generateMnemonic(wordlist, 128);
        return this.generateFromSeed(newMnemonic);
      }

      if (!bip39.validateMnemonic(mnemonic, wordlist)) {
        throw new Error('Invalid mnemonic phrase');
      }

      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const root = HDKey.fromMasterSeed(seed);
      const path = "m/84'/1'/0'/0/0";
      const child = root.derive(path);
      
      if (!child.privateKey) {
        throw new Error('Failed to derive private key');
      }

      const keyPair = ECPair.fromPrivateKey(Buffer.from(child.privateKey));
      
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(keyPair.publicKey),
        network: this.network
      });

      return {
        success: true,
        mnemonic,
        address,
        privateKey: keyPair.toWIF(),
        path,
        publicKey: Buffer.from(keyPair.publicKey).toString('hex')
      };
    } catch (error) {
      console.error('Error generating Bitcoin wallet from seed:', error);
      return { success: false, error: error.message };
    }
  }

  importFromPrivateKey(privateKeyWIF) {
    try {
      if (!privateKeyWIF) {
        throw new Error('Private key is required');
      }

      const keyPair = ECPair.fromWIF(privateKeyWIF, this.network);
      
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(keyPair.publicKey),
        network: this.network
      });

      return {
        success: true,
        address,
        privateKey: privateKeyWIF,
        publicKey: Buffer.from(keyPair.publicKey).toString('hex')
      };
    } catch (error) {
      console.error('Error importing Bitcoin wallet:', error);
      return { success: false, error: error.message };
    }
  }

  async getBalance(address) {
    try {
      if (!address) {
        throw new Error('Address is required');
      }

      console.log(`Fetching balance for ${address}...`);
      
      const response = await fetch(`${this.apiUrl}/address/${address}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const balance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
      const balanceBTC = balance / 100000000;
      
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

  async getUTXOs(address) {
    try {
      const response = await fetch(`${this.apiUrl}/address/${address}/utxo`);
      if (!response.ok) {
        throw new Error(`Failed to fetch UTXOs: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching UTXOs:', error);
      throw error;
    }
  }

  async getTxHex(txid) {
    try {
      const response = await fetch(`${this.apiUrl}/tx/${txid}/hex`);
      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async getFeeRate() {
    try {
      const response = await fetch(`${this.apiUrl}/fee-estimates`);
      if (!response.ok) {
        return 3;
      }
      const feeEstimates = await response.json();
      return feeEstimates['6'] || 3;
    } catch (error) {
      console.warn('Using default fee rate:', error);
      return 3;
    }
  }

  async sendBitcoin(fromAddress, toAddress, amountBTC, privateKeyWIF) {
    try {
      if (!fromAddress || !toAddress || !amountBTC || !privateKeyWIF) {
        throw new Error('All parameters are required');
      }

      const amountSats = Math.floor(amountBTC * 100000000);
      if (amountSats <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      console.log(`Preparing to send ${amountBTC} BTC (${amountSats} sats) from ${fromAddress} to ${toAddress}`);

      const keyPair = ECPair.fromWIF(privateKeyWIF, this.network);
      const payment = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(keyPair.publicKey),
        network: this.network
      });

      if (payment.address !== fromAddress) {
        throw new Error('Private key does not match from address');
      }

      const utxos = await this.getUTXOs(fromAddress);
      if (!utxos || utxos.length === 0) {
        throw new Error('No UTXOs found for this address');
      }

      const feeRate = await this.getFeeRate();
      console.log(`Using fee rate: ${feeRate} sat/vB`);

      const psbt = new bitcoin.Psbt({ network: this.network });
      let inputSum = 0;

      for (const utxo of utxos) {
        const txHex = await this.getTxHex(utxo.txid);
        const tx = bitcoin.Transaction.fromHex(txHex);
        
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: payment.output,
            value: utxo.value
          }
        });

        inputSum += utxo.value;

        const estimatedSize = utxos.length * 68 + 2 * 31 + 10;
        const estimatedFee = Math.ceil(estimatedSize * feeRate);
        
        if (inputSum >= amountSats + estimatedFee) {
          break;
        }
      }

      const estimatedSize = psbt.txInputs.length * 68 + 2 * 31 + 10;
      const fee = Math.ceil(estimatedSize * feeRate);
      const change = inputSum - amountSats - fee;

      console.log(`Input: ${inputSum} sats, Amount: ${amountSats} sats, Fee: ${fee} sats, Change: ${change} sats`);

      if (inputSum < amountSats + fee) {
        throw new Error(`Insufficient funds. Have ${inputSum} sats, need ${amountSats + fee} sats (including fee)`);
      }

      psbt.addOutput({
        address: toAddress,
        value: amountSats
      });

      if (change > 546) {
        psbt.addOutput({
          address: fromAddress,
          value: change
        });
      }

      for (let i = 0; i < psbt.txInputs.length; i++) {
        psbt.signInput(i, keyPair);
      }

      psbt.finalizeAllInputs();
      const txHex = psbt.extractTransaction().toHex();

      console.log('Broadcasting transaction...');
      const response = await fetch(`${this.apiUrl}/tx`, {
        method: 'POST',
        body: txHex
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Broadcast failed: ${errorText}`);
      }

      const txId = await response.text();
      console.log(`Transaction broadcast successfully: ${txId}`);

      return {
        success: true,
        txId,
        amount: amountBTC,
        amountSats,
        fee: fee / 100000000,
        feeSats: fee,
        explorerUrl: `https://blockstream.info/testnet/tx/${txId}`
      };
    } catch (error) {
      console.error('Transaction failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTransactionStatus(txId) {
    try {
      if (!txId) {
        throw new Error('Transaction ID is required');
      }

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

export const useBitcoinWallet = () => {
  return useMemo(() => new BitcoinWalletUtils(), []);
};

export default new BitcoinWalletUtils();