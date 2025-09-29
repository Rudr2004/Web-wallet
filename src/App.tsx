import BitcoinWallet from './components/BitcoinWallet.tsx'
import CronosWallet from './components/CronosWallet.tsx'
import './App.css'

function App() {
  return (
    <div className="container">
      <div className="header">
        <h1>Multi-Chain Wallet Tester</h1>
        <p>Test Bitcoin and Cronos wallet operations with ERC20 token support</p>
      </div>

      <div className="wallet-grid">
        <BitcoinWallet />
        <CronosWallet />
      </div>
    </div>
  )
}

export default App
