import { useEffect, useState } from 'react';
import './App.css';
import { BrowserProvider, Contract } from 'ethers';

import vrfAbi from './abis/vrfAbi.json';
import myTokenAbi from './abis/myTokenAbi.json';

const VRFD5_CONTRACT_ADDRESS = '0xbAfDB26723B56635982703419e3A023084075292';
const MYTOKEN_CONTRACT_ADDRESS = '0x7D5BE3bB9E7bC18194929D8641aeD44d7cB6d2D0';

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [message, setMessage] = useState('');

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      setMessage('🦊 Please install Metamask to interact with this application.');
      return;
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      setCurrentAccount(accounts[0]);
      setMessage('✅ Wallet connected.');
    } else {
      setMessage('❌ No authorized account found.');
    }
  };

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

  const requestMetadataHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const vrfContract = new Contract(VRFD5_CONTRACT_ADDRESS, vrfAbi, signer);

        const currentState = await vrfContract.s_result();
        if (currentState.toString() === '42') {
          setMessage('⏳ Randomness request is in progress. Please wait.');
          return;
        }

        if (currentState.toString() !== '0') {
          setMessage('⚠️ Random number already generated. Reset required.');
          return;
        }

        setMessage('Requesting metadata from VRFD5 contract...');
        const tx = await vrfContract.requestNumber();
        await tx.wait();

        setMessage('✅ Randomness requested. Please fetch metadata.');
      } else {
        setMessage('❌ Ethereum object not found.');
      }
    } catch (err) {
      console.error('Error requesting metadata:', err);
      setMessage('❌ Error requesting metadata. Check console for details.');
    }
  };

  const resetRequestHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const vrfContract = new Contract(VRFD5_CONTRACT_ADDRESS, vrfAbi, signer);

        const tx = await vrfContract.resetRequest();
        await tx.wait();

        setMessage('✅ Request state has been reset.');
      } else {
        setMessage('❌ Ethereum object not found.');
      }
    } catch (err) {
      console.error('Error resetting request:', err);
      setMessage('❌ Error resetting request. Check console for details.');
    }
  };

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();

        const vrfContract = new Contract(VRFD5_CONTRACT_ADDRESS, vrfAbi, signer);
        const metadata = await vrfContract.getMetadata();

        const myTokenContract = new Contract(MYTOKEN_CONTRACT_ADDRESS, myTokenAbi, signer);
        setMessage('Minting NFT...');

        const tx = await myTokenContract.safeMint(
          currentAccount,
          Date.now(),
          metadata
        );
        await tx.wait();

        setMessage(`🎉 NFT minted successfully! Transaction: ${tx.hash}`);
      } else {
        setMessage('❌ Ethereum object not found.');
      }
    } catch (err) {
      console.error('Error minting NFT:', err);
      setMessage('❌ Error minting NFT. Check console for details.');
    }
  };

  const connectWalletButton = () => (
    <button onClick={connectWalletHandler} className="cta-button connect-wallet-button">
      Connect Wallet
    </button>
  );

  const actionButtons = () => (
    <div>
      <h3 className="text-style">🦊 Account Address: {currentAccount}</h3>
      <button onClick={requestMetadataHandler} className="cta-button request-metadata-button">
        Request Metadata
      </button>
      <button onClick={mintNftHandler} className="cta-button mint-nft-button">
        Mint NFT
      </button>
      <button onClick={resetRequestHandler} className="cta-button reset-button">
        Reset Request
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
      <hr />
      <div className="container">
        {currentAccount ? actionButtons() : connectWalletButton()}
      </div>
      <div>
        <hr />
        <h4>{message}</h4>
      </div>
    </div>
  );
}

export default App;
