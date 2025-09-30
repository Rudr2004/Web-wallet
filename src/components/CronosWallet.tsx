// CronosWallet.tsx - Cronos wallet component
import React, { useState, useEffect } from 'react';
import WalletCard from './WalletCard';
import { useCronosWallet } from '../utils/CronosWalletUtils';
import QRCode from 'qrcode';

const CronosWallet = () => {
  const cronosWallet = useCronosWallet();
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
  
  // Token states
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [tokenToAddress, setTokenToAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);

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
      const response = await cronosWallet.generateWallet();
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
      const response = await cronosWallet.generateFromSeed(mnemonic);
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
      const response = await cronosWallet.importFromPrivateKey(privateKeyInput.trim());
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
      const response = await cronosWallet.getBalance(walletInfo.address);
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

  const sendCRO = async () => {
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
      const response = await cronosWallet.sendCRO(
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

  const getTokenInfo = async () => {
    if (!tokenAddress.trim()) {
      showResult({ error: 'Please enter a token address' }, true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await cronosWallet.getTokenInfo(tokenAddress.trim());
      if (response.success) {
        setTokenInfo(response);
        showResult(response);
      } else {
        showResult(response, true);
      }
    } catch (error) {
      showResult({ error: error.message }, true);
    }
    setLoading(false);
  };

  const getTokenBalance = async () => {
    if (!walletInfo.address || !tokenAddress.trim()) {
      showResult({ error: 'Please generate wallet and enter token address' }, true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await cronosWallet.getTokenBalance(walletInfo.address, tokenAddress.trim());
      if (response.success) {
        setTokenBalance(response);
        showResult(response);
      } else {
        showResult(response, true);
      }
    } catch (error) {
      showResult({ error: error.message }, true);
    }
    setLoading(false);
  };

  const sendToken = async () => {
    if (!walletInfo.address || !walletInfo.privateKey) {
      showResult({ error: 'Please generate or import a wallet first' }, true);
      return;
    }
    
    if (!tokenToAddress.trim() || !tokenAmount || !tokenAddress.trim()) {
      showResult({ error: 'Please enter all required fields' }, true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await cronosWallet.sendToken(
        walletInfo.address,
        tokenToAddress.trim(),
        tokenAddress.trim(),
        parseFloat(tokenAmount),
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
              <label>Private Key (Hex format)</label>
              <input 
                type="text" 
                value={privateKeyInput}
                onChange={(e) => setPrivateKeyInput(e.target.value)}
                placeholder="Enter Cronos private key"
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
            <h3>Receive CRO</h3>
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
                  <p>2. Use the Cronos testnet faucet to get test tokens</p>
                  <p>3. Send CRO to this address</p>
                  <p><strong>Faucet:</strong></p>
                  <ul>
                    <li><a href="https://cronos.org/faucet" target="_blank" rel="noopener noreferrer">cronos.org/faucet</a></li>
                  </ul>
                </div>
                {balance && (
                  <div className="balance-display">
                    <div className="balance-amount">{balance.balance} CRO</div>
                    <div className="balance-label">Current Balance</div>
                  </div>
                )}
                
                {/* Token Section */}
                <div className="section" style={{ marginTop: '30px' }}>
                  <h4>ERC20 Token Operations</h4>
                  <div className="form-group">
                    <label>Token Contract Address</label>
                    <input 
                      type="text" 
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      placeholder="Enter ERC20 token address"
                    />
                  </div>
                  <button 
                    className="btn btn-info" 
                    onClick={getTokenInfo}
                    disabled={loading}
                  >
                    Get Token Info
                  </button>
                  <button 
                    className="btn btn-warning" 
                    onClick={getTokenBalance}
                    disabled={loading}
                  >
                    Check Token Balance
                  </button>
                  
                  {tokenInfo && (
                    <div className="token-balance-box">
                      <h4>Token Information</h4>
                      <div className="token-info">Name: {tokenInfo.name}</div>
                      <div className="token-info">Symbol: {tokenInfo.symbol}</div>
                      <div className="token-info">Decimals: {tokenInfo.decimals}</div>
                    </div>
                  )}
                  
                  {tokenBalance && (
                    <div className="token-balance-box">
                      <h4>Token Balance</h4>
                      <div className="token-info">Balance: {tokenBalance.balance} {tokenBalance.symbol}</div>
                    </div>
                  )}
                </div>
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
            <h3>Send CRO</h3>
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
              <label>Amount (CRO)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.000001" 
                placeholder="0.1"
              />
            </div>
            <button 
              className="btn btn-success" 
              onClick={sendCRO}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send CRO'}
            </button>
            <button 
              className="btn btn-warning" 
              onClick={checkBalance}
              disabled={loading}
            >
              Check Balance
            </button>
            
            {/* Token Send Section */}
            <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h4>Send ERC20 Tokens</h4>
              <div className="form-group">
                <label>Token Contract Address</label>
                <input 
                  type="text" 
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="Enter ERC20 token address"
                />
              </div>
              <div className="form-group">
                <label>To Address</label>
                <input 
                  type="text" 
                  value={tokenToAddress}
                  onChange={(e) => setTokenToAddress(e.target.value)}
                  placeholder="Recipient address"
                />
              </div>
              <div className="form-group">
                <label>Token Amount</label>
                <input 
                  type="number" 
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  step="0.000001" 
                  placeholder="1.0"
                />
              </div>
              <button 
                className="btn btn-success" 
                onClick={sendToken}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Token'}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <WalletCard
      title="Cronos Testnet"
      icon="🟣"
      iconClass="cronos-icon"
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

export default CronosWallet;