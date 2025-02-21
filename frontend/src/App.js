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
  const [addresses, setAddresses] = useState(null);
  const [isRandomNumberReady, setIsRandomNumberReady] = useState(false);

  useEffect(() => {
    fetch("/contractAddresses.json")
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data);
        console.log("Loaded contract addresses:", data);
      })
      .catch((err) => console.error("Failed to load contract addresses:", err));
  }, []);

  const checkWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setMessage(
          "🦊 Please install MetaMask to interact with this application."
        );
        return;
      } else {
        setMessage("✅ MetaMask is installed.");
      }

      const provider = new BrowserProvider(ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        setMessage(`💳 Connected account: ${account}`);

        await checkRandomNumberReady(provider);
      } else {
        setMessage("🦊 Please connect your MetaMask wallet.");
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
        setMessage("🦊 Please install MetaMask to connect your wallet.");
        return;
      }

      const provider = new BrowserProvider(ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        setMessage(`💳 Connected account: ${account}`);

        await checkRandomNumberReady(provider);
      }
    } catch (error) {
      console.error("Error connecting to Metamask:", error);
      setMessage("⚠️ Error connecting to Metamask.");
    }
  };

  const checkRandomNumberReady = async (provider) => {
    try {
      if (!addresses) {
        setMessage("🔄 Loading contract addresses...");
        return;
      }
      const vrfContract = new Contract(addresses.VRFD5, vrfAbi, provider);
      const randomNumber = await vrfContract.s_result();

      if (randomNumber.toString() !== "0" && randomNumber.toString() !== "42") {
        setIsRandomNumberReady(true);
        setMessage(`✅ Random number available: ${randomNumber.toString()}`);
      } else if (randomNumber.toString() === "42") {
        setMessage("🔄 A random number request is in progress...");
      } else {
        setMessage("🟡 No random number generated yet.");
      }
    } catch (error) {
      console.error("Error checking random number:", error);
      setMessage("⚠️ Error checking random number.");
    }
  };

  const mintWithRandomFlowHandler = async () => {
    try {
      if (!addresses) {
        setMessage("⚠️ Contract addresses not loaded yet.");
        return;
      }
      setMessage("🔄 Requesting random number...");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const vrfContract = new Contract(addresses.VRFD5, vrfAbi, signer);

      const txRequest = await vrfContract.requestNumber();
      setMessage(`🔄 Random number request tx sent: ${txRequest.hash}`);
      await txRequest.wait();
      setMessage("⌛ Waiting for Chainlink VRF to fulfill random number...");

      vrfContract.once("RandomNumberFulfilled", async (randomNumber) => {
        setIsRandomNumberReady(true);
        setMessage(
          `✅ Random number generated: ${randomNumber.toString()}. Now minting NFT...`
        );

        const metadata = await vrfContract.getMetadata();

        const myTokenContract = new Contract(
          addresses.MyToken,
          myTokenAbi,
          signer
        );
        console.log("metadata", metadata);

        const txMint = await myTokenContract.safeMint(
          currentAccount,
          Date.now(),
          metadata
        );
        setMessage(`🛠️ Mint transaction sent: ${txMint.hash}`);
        await txMint.wait();

        setMessage(`🎉 NFT minted successfully! Transaction: ${txMint.hash}`);
      });
    } catch (error) {
      console.error("Error in unified mint flow:", error);
      setMessage("⚠️ Error in unified mint flow.");
    }
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, [addresses]);

  return (
    <div className="main-app">
      <h1>NFT Minting App</h1>
      {currentAccount ? (
        <div>
          <p>{message}</p>
          <button onClick={mintWithRandomFlowHandler}>Mint NFT</button>
        </div>
      ) : (
        <button onClick={connectWalletHandler}>Connect Metamask Wallet</button>
      )}
    </div>
  );
}

export default App;
