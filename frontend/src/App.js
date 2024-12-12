import { useEffect, useState } from 'react';
import './App.css';
import { BrowserProvider, Contract } from 'ethers';

import vrfAbi from './abis/vrfAbi.json';
import myTokenAbi from './abis/myTokenAbi.json';

// Contract addresses for Sepolia network (update these after deployment)
const VRFD5_CONTRACT_ADDRESS = '0xbAfDB26723B56635982703419e3A023084075292'; // VRFD5 Contract Address
const MYTOKEN_CONTRACT_ADDRESS = '0x7D5BE3bB9E7bC18194929D8641aeD44d7cB6d2D0'; // MyToken Contract Address

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [message, setMessage] = useState('');

  // Check if Metamask is installed and connected
  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      setMessage('🦊 Please install Metamask to interact with this application.');
      return;
    } else {
      setMessage('✅ Metamask is installed.');
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
      setMessage('✅ Wallet connected.');
    } else {
      setMessage('❌ No authorized account found.');
    }
  };

  // Connect to Metamask wallet
  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      setMessage('🦊 Please install Metamask to connect your wallet.');
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
      setMessage('✅ Wallet connected.');
    } catch (err) {
      console.error('Error connecting wallet:', err);
    }
  };

  // Request metadata from VRFD5 contract
  const requestMetadataHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();

        const vrfContract = new Contract(
          VRFD5_CONTRACT_ADDRESS,
          vrfAbi,
          signer
        );

        setMessage('Requesting metadata from VRFD5 contract...');

        const tx = await vrfContract.requestNumber();
        await tx.wait();

        const metadata = await vrfContract.getMetadata();
        setMessage(`🎉 Metadata URL: ${metadata}`);
      } else {
        setMessage('❌ Ethereum object not found.');
      }
    } catch (err) {
      console.error('Error requesting metadata:', err);
      setMessage('❌ Error requesting metadata.');
    }
  };

  // Mint NFT using MyToken contract
  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();

        const myTokenContract = new Contract(
          MYTOKEN_CONTRACT_ADDRESS,
          myTokenAbi,
          signer
        );

        setMessage('Fetching metadata from VRFD5 contract...');

        // Fetch metadata from VRFD5 contract
        const vrfContract = new Contract(
          VRFD5_CONTRACT_ADDRESS,
          vrfAbi,
          signer
        );

        const metadata = await vrfContract.getMetadata();
        setMessage(`Metadata URL fetched: ${metadata}`);

        setMessage('Minting NFT...');

        // Mint NFT
        const tx = await myTokenContract.safeMint(
          currentAccount, // Mint to current user's wallet
          Date.now(), // Use a unique token ID (timestamp)
          metadata // Metadata URL from VRFD5
        );

        await tx.wait();

        setMessage(`🎉 NFT minted successfully! Transaction: ${tx.hash}`);
      } else {
        setMessage('❌ Ethereum object not found.');
      }
    } catch (err) {
      console.error('Error minting NFT:', err);
      setMessage('❌ Error minting NFT.');
    }
  };

  // Render connect wallet button
  const connectWalletButton = () => (
    <button
      onClick={connectWalletHandler}
      className="cta-button connect-wallet-button"
    >
      Connect Wallet
    </button>
  );

  // Render mint NFT button
  const mintNftButton = () => (
    <div>
      <h3 className="text-style">🦊 Account Address: {currentAccount}</h3>
      <button
        onClick={requestMetadataHandler}
        className="cta-button request-metadata-button"
      >
        Request Metadata
      </button>
      <button onClick={mintNftHandler} className="cta-button mint-nft-button">
        Mint NFT
      </button>
    </div>
  );

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  return (
    <div className="card">
      <div className="header">
        <h3 className="text-color">Sepolia NFT Minter</h3>
      </div>
      <hr></hr>
      <div className="container">
        {currentAccount ? mintNftButton() : connectWalletButton()}
      </div>
      <div>
        <hr></hr>
        <h4>{message}</h4>
      </div>
    </div>
  );
}

export default App;