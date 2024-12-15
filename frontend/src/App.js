import { useEffect, useState } from "react";
import "./App.css";
import { BrowserProvider, Contract } from "ethers";

import vrfData from "./abis/vrfAbi.json";
import myTokenData from "./abis/myTokenAbi.json";

<<<<<<< HEAD
const vrfAbi = vrfData.abi ? vrfData.abi : vrfData;
const myTokenAbi = myTokenData.abi ? myTokenData.abi : myTokenData;

const VRFD5_CONTRACT_ADDRESS = "0x31D17056f59AD0D479dF6F2Fca9BA05B0f18bb57";
const MYTOKEN_CONTRACT_ADDRESS = "0x1AaD2aeD79C4f3698f05e969187A9b830f2E049C";
=======
const VRFD5_CONTRACT_ADDRESS = '0xbAfDB26723B56635982703419e3A023084075292';
const MYTOKEN_CONTRACT_ADDRESS = '0x7D5BE3bB9E7bC18194929D8641aeD44d7cB6d2D0';
>>>>>>> c8c11f839b4a98c3a31031b6d2920f3c4847ec7b

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [message, setMessage] = useState("");
  const [isRandomNumberReady, setIsRandomNumberReady] = useState(false);

  const checkWalletIsConnected = async () => {
<<<<<<< HEAD
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setMessage(
          "🦊 Please install Metamask to interact with this application."
        );

        return;
=======
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
>>>>>>> c8c11f839b4a98c3a31031b6d2920f3c4847ec7b
      } else {
        setMessage("✅ Metamask is installed.");
      }
<<<<<<< HEAD

      const provider = new BrowserProvider(ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        setMessage(`💳 Connected account: ${account}`);

        await checkRandomNumberReady(account, provider);
      } else {
        setMessage("🦊 Please connect your Metamask wallet.");
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      setMessage("⚠️ Error checking wallet connection.");
    }
  };

  const connectWalletHandler = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setMessage(
          "🦊 Please install Metamask to interact with this application."
        );

        return;
      }

      const provider = new BrowserProvider(ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        setMessage(`💳 Connected account: ${account}`);

        await checkRandomNumberReady(account, provider);
      }
    } catch (error) {
      console.error("Error connecting to Metamask:", error);
      setMessage("⚠️ Error connecting to Metamask.");
    }
  };

  const checkRandomNumberReady = async (account, provider) => {
    try {
      const vrfContract = new Contract(
        VRFD5_CONTRACT_ADDRESS,
        vrfAbi,
        provider
      );

      const randomNumber = await vrfContract.s_result();

      if (randomNumber.toString() !== "0" && randomNumber.toString() !== "42") {
        setIsRandomNumberReady(true);
        setMessage(
          `✅ Random number already generated: ${randomNumber.toString()}`
        );
      } else if (randomNumber.toString() === "42") {
        setMessage("🔄 A random number request is in progress.");
      } else {
        setMessage("🟡 No random number generated yet.");
      }
    } catch (error) {
      console.error("Error checking random number:", error);
      setMessage("⚠️ Error checking random number.");
=======
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
>>>>>>> c8c11f839b4a98c3a31031b6d2920f3c4847ec7b
    }
  };

  const mintNftHandler = async () => {
    try {
      setMessage("🛠️ Minting NFT...");

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const myTokenContract = new Contract(
        MYTOKEN_CONTRACT_ADDRESS,
        myTokenAbi,
        signer
      );
      console.log("MyToken Contract Initialized:", myTokenContract);

      const tx = await myTokenContract.safeMint(
        currentAccount,
        Date.now(),
        await getMetadataURL()
      );

      setMessage(`🛠️ Mint transaction sent: ${tx.hash}`);

      await tx.wait();

      setMessage(`🎉 NFT minted successfully! Transaction: ${tx.hash}`);
    } catch (error) {
      console.error("Error minting NFT:", error);
      // Extract revert reason if available
      if (error.data && error.data.message) {
        setMessage(`⚠️ Error minting NFT: ${error.data.message}`);
      } else if (error.reason) {
        setMessage(`⚠️ Error minting NFT: ${error.reason}`);
      } else {
        setMessage("⚠️ Error minting NFT. Check console for details.");
      }
    }
  };

  const getMetadataURL = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const vrfContract = new Contract(
        VRFD5_CONTRACT_ADDRESS,
        vrfAbi,
        provider
      );

      const metadata = await vrfContract.getMetadata();

      return metadata;
    } catch (error) {
      console.error("Error fetching metadata:', error");
      setMessage("⚠️ Error fetching metadata.");
      return "";
    }
  };

  useEffect(() => {
    const setupEventListener = async () => {
      try {
        if (!window.ethereum) {
          console.log("Ethereum object not found. Install Metamask.");
          return;
        }

        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
<<<<<<< HEAD
        const vrfContract = new Contract(
          VRFD5_CONTRACT_ADDRESS,
          vrfAbi,
          signer
        );

        vrfContract.on("RandomNumberFulfilled", (randomNumber) => {
          setIsRandomNumberReady(true);
          setMessage(`✅ Random number generated: ${randomNumber.toString()}`);
        });
      } catch (error) {
        console.error("Error setting up event listener:", error);
      }
    };

    setupEventListener();

    return () => {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const vrfContract = new Contract(
          VRFD5_CONTRACT_ADDRESS,
          vrfAbi,
          provider
        );
        vrfContract.off("RandomNumberFulfilled");
      }
    };
  }, [vrfAbi]);
=======

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
>>>>>>> c8c11f839b4a98c3a31031b6d2920f3c4847ec7b

  useEffect(() => {
    checkWalletIsConnected();
    console.log("Initialized App and checked wallet connection.");
  }, []);

  return (
<<<<<<< HEAD
    <div className="main-app">
      <h1>My NFT Minting App</h1>
      {currentAccount ? (
        <div>
          <p>{message}</p>

          <button onClick={mintNftHandler} disabled={!isRandomNumberReady}>
            Mint NFT
          </button>
        </div>
      ) : (
        <button onClick={connectWalletHandler}>Connect Metamask Wallet</button>
      )}
=======
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
>>>>>>> c8c11f839b4a98c3a31031b6d2920f3c4847ec7b
    </div>
  );
}

export default App;
