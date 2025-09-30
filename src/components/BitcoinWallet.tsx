// BitcoinWallet.tsx - Bitcoin wallet component
import React, { useState, useEffect } from 'react';
import WalletCard from './WalletCard';
import { useBitcoinWallet } from '../utils/BitcoinWalletUtils';
import QRCode from 'qrcode';

const BitcoinWallet = () => {
  const bitcoinWallet = useBitcoinWallet();
  const [activeTab, setActiveTab] = useState('generate');
  const [walletInfo, setWalletInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // Form states
  const [seedInput, setSeedInput] = useState('');
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(null);

  // Generate QR code when address changes
  useEffect(() => {
    if (walletInfo.address) {
      QRCode.toDataURL(walletInfo.address, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('QR code generation error:', err));
    } else {
      setQrCodeUrl('');
    }
  }, [walletInfo.address]);

  const showResult = (data, isError = false) => {
    if (isError) {
      setError(JSON.stringify(data, null, 2));
      setResult('');
    } else {
      setResult(JSON.stringify(data, null, 2));
      setError('');
    }
  };

  const generateWallet = async () => {
    setLoading(true);
    try {
      const response = await bitcoinWallet.generateWallet();
      if (response.success) {
        setWalletInfo(response);
        showResult(response);
      } else {
        showResult(response, true);
      }
    } catch (error) {
      showResult({ error: error.message }, true);
    }
    setLoading(false);
  };

  const generateFromSeed = async () => {
    setLoading(true);
    try {
      const mnemonic = seedInput.trim() || null;
      const response = await bitcoinWallet.generateFromSeed(mnemonic);
      if (response.success) {
        setWalletInfo(response);
        showResult(response);
      } else {
        showResult(response, true);
      }
    } catch (error) {
      showResult({ error: error.message }, true);
    }
    setLoading(false);
  };

  const importWallet = async () => {
    if (!privateKeyInput.trim()) {
      showResult({ error: 'Please enter a private key' }, true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await bitcoinWallet.importFromPrivateKey(privateKeyInput.trim());
      if (response.success) {
        setWalletInfo(response);
        showResult(response);
      } else {
        showResult(response, true);
      }
    } catch (error) {
      showResult({ error: error.message }, true);
    }
    setLoading(false);
  };

  const checkBalance = async () => {
    if (!walletInfo.address) {
      showResult({ error: 'Please generate or import a wallet first' }, true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await bitcoinWallet.getBalance(walletInfo.address);
      if (response.success) {
        setBalance(response);
        showResult(response);
      } else {
        showResult(response, true);
      }
    } catch (error) {
      showResult({ error: error.message }, true);
    }
    setLoading(false);
  };

  const sendBitcoin = async () => {
    if (!walletInfo.address || !walletInfo.privateKey) {
      showResult({ error: 'Please generate or import a wallet first' }, true);
      return;
    }
    
    if (!toAddress.trim() || !amount) {
      showResult({ error: 'Please enter recipient address and amount' }, true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await bitcoinWallet.sendBitcoin(
        walletInfo.address,
        toAddress.trim(),
        parseFloat(amount),
        walletInfo.privateKey
      );
      showResult(response, !response.success);
    } catch (error) {
      showResult({ error: error.message }, true);
    }
    setLoading(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <div className="section">
            <h3>Generate New Wallet</h3>
            <button 
              className="btn btn-primary" 
              onClick={generateWallet}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Random Wallet'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={generateFromSeed}
              disabled={loading}
            >
              Generate from Seed
            </button>
            
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Custom Seed Phrase (optional)</label>
              <input 
                type="text" 
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                placeholder="Leave empty for random generation"
              />
            </div>
            
            <button 
              className="btn btn-warning" 
              onClick={checkBalance}
              disabled={loading}
              style={{ marginTop: '10px' }}
            >
              Check Balance
            </button>
          </div>
        );
        
      case 'import':
        return (
          <div className="section">
            <h3>Import from Private Key</h3>
            <div className="form-group">
              <label>Private Key (WIF format)</label>
              <input 
                type="text" 
                value={privateKeyInput}
                onChange={(e) => setPrivateKeyInput(e.target.value)}
                placeholder="Enter Bitcoin private key"
              />
            </div>
            <button 
              className="btn btn-primary" 
              onClick={importWallet}
              disabled={loading}
            >
              {loading ? 'Importing...' : 'Import Wallet'}
            </button>
            <button 
              className="btn btn-warning" 
              onClick={checkBalance}
              disabled={loading}
            >
              Check Balance
            </button>
          </div>
        );
        
      case 'receive':
        return (
          <div className="section">
            <h3>Receive Bitcoin</h3>
            {walletInfo.address ? (
              <div>
                {qrCodeUrl && (
                  <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: '200px', border: '2px solid #ddd', borderRadius: '8px' }} />
                  </div>
                )}
                <div className="address-display">
                  {walletInfo.address}
                </div>
                <div className="receive-instructions">
                  <p><strong>Instructions:</strong></p>
                  <p>1. Scan the QR code or copy the address above</p>
                  <p>2. Use a Bitcoin testnet faucet to get test coins</p>
                  <p>3. Send Bitcoin to this address</p>
                  <p><strong>Faucets:</strong></p>
                  <ul>
                    <li><a href="https://bitcoinfaucet.uo1.net/" target="_blank" rel="noopener noreferrer">bitcoinfaucet.uo1.net</a></li>
                    <li><a href="https://testnet-faucet.mempool.co/" target="_blank" rel="noopener noreferrer">testnet-faucet.mempool.co</a></li>
                    <li><a href="https://coinfaucet.eu/en/btc-testnet/" target="_blank" rel="noopener noreferrer">coinfaucet.eu</a></li>
                  </ul>
                </div>
                {balance && (
                  <div className="balance-display">
                    <div className="balance-amount">{balance.balance} BTC</div>
                    <div className="balance-label">Current Balance</div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                Please generate or import a wallet first
              </p>
            )}
          </div>
        );
        
      case 'send':
        return (
          <div className="section">
            <h3>Send Bitcoin</h3>
            <div className="form-group">
              <label>To Address</label>
              <input 
                type="text" 
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="Recipient address"
              />
            </div>
            <div className="form-group">
              <label>Amount (BTC)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.00000001" 
                placeholder="0.001"
              />
            </div>
            <button 
              className="btn btn-success" 
              onClick={sendBitcoin}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Bitcoin'}
            </button>
            <button 
              className="btn btn-warning" 
              onClick={checkBalance}
              disabled={loading}
            >
              Check Balance
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <WalletCard
      title="Bitcoin Testnet"
      icon="₿"
      iconClass="bitcoin-icon"
      walletInfo={walletInfo}
      onTabChange={setActiveTab}
      activeTab={activeTab}
    >
      {renderTabContent()}
      
      {(result || error) && (
        <div className={`result-box ${error ? 'error-box' : ''}`}>
          <pre>{error || result}</pre>
        </div>
      )}
    </WalletCard>
  );
};

export default BitcoinWallet;