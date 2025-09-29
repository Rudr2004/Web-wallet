// WalletCard.jsx - Individual wallet component
import React, { useState } from 'react';
import './WalletCard.css';

const WalletCard = ({ 
  title, 
  icon, 
  iconClass, 
  children, 
  walletInfo, 
  onTabChange,
  activeTab = 'generate' 
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleTabClick = (tabName) => {
    setCurrentTab(tabName);
    if (onTabChange) {
      onTabChange(tabName);
    }
  };

  const tabs = [
    { id: 'generate', label: 'Generate' },
    { id: 'import', label: 'Import' },
    { id: 'receive', label: 'Receive' },
    { id: 'send', label: 'Send' }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  return (
    <div className="wallet-card">
      <div className="wallet-header">
        <div className={`wallet-icon ${iconClass}`}>
          {icon}
        </div>
        <h2 className="wallet-title">{title}</h2>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className="tab-content active">
        {children}
      </div>

      {walletInfo && walletInfo.address && (
        <div className="wallet-info">
          <p>
            <strong>Address:</strong> 
            <span>{walletInfo.address}</span>
            <button 
              className="copy-btn" 
              onClick={() => copyToClipboard(walletInfo.address)}
            >
              Copy
            </button>
          </p>
          {walletInfo.privateKey && (
            <p>
              <strong>Private Key:</strong> 
              <span>{walletInfo.privateKey}</span>
              <button 
                className="copy-btn" 
                onClick={() => copyToClipboard(walletInfo.privateKey)}
              >
                Copy
              </button>
            </p>
          )}
          {walletInfo.mnemonic && (
            <p>
              <strong>Mnemonic:</strong> 
              <span>{walletInfo.mnemonic}</span>
              <button 
                className="copy-btn" 
                onClick={() => copyToClipboard(walletInfo.mnemonic)}
              >
                Copy
              </button>
            </p>
          )}
          {walletInfo.network && (
            <p><strong>Network:</strong> {walletInfo.network}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletCard;