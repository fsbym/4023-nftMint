import { useEffect, useState } from "react";
import "./App.css";
import { BrowserProvider, Contract } from "ethers";

import vrfData from "./abis/vrfAbi.json";
import myTokenData from "./abis/myTokenAbi.json";

const vrfAbi = vrfData.abi ? vrfData.abi : vrfData;
const myTokenAbi = myTokenData.abi ? myTokenData.abi : myTokenData;

const VRFD5_CONTRACT_ADDRESS = "0x31D17056f59AD0D479dF6F2Fca9BA05B0f18bb57";
const MYTOKEN_CONTRACT_ADDRESS = "0x1AaD2aeD79C4f3698f05e969187A9b830f2E049C";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [message, setMessage] = useState("");
  const [isRandomNumberReady, setIsRandomNumberReady] = useState(false);

  const checkWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setMessage(
          "🦊 Please install Metamask to interact with this application."
        );

        return;
      } else {
        setMessage("✅ Metamask is installed.");
      }

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

  useEffect(() => {
    checkWalletIsConnected();
    console.log("Initialized App and checked wallet connection.");
  }, []);

  return (
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
    </div>
  );
}

export default App;
