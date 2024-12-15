import { useEffect, useState } from "react";
import "./App.css";
import { BrowserProvider, Contract } from "ethers";

// Import ABI JSON files
import vrfData from "./abis/vrfAbi.json";
import myTokenData from "./abis/myTokenAbi.json";

// Determine if ABI is nested under an "abi" key or is a standalone array
const vrfAbi = vrfData.abi ? vrfData.abi : vrfData;
const myTokenAbi = myTokenData.abi ? myTokenData.abi : myTokenData;

// Contract addresses on Sepolia Testnet
const VRFD5_CONTRACT_ADDRESS = "0x31D17056f59AD0D479dF6F2Fca9BA05B0f18bb57";
const MYTOKEN_CONTRACT_ADDRESS = "0x6125620e31746A0EB0b6D1657a00D7F3Ad614813";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [message, setMessage] = useState("");
  const [isRandomNumberReady, setIsRandomNumberReady] = useState(false);

  /**
   * 🔍 **Function:** checkWalletIsConnected
   * @description Checks if Metamask is installed and if the wallet is connected.
   */
  const checkWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setMessage(
          "🦊 Please install Metamask to interact with this application."
        );
        console.log("Metamask not detected.");
        return;
      } else {
        setMessage("✅ Metamask is installed.");
        console.log("Metamask is installed.");
      }

      const provider = new BrowserProvider(ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        setMessage(`💳 Connected account: ${account}`);
        console.log(`Connected account: ${account}`);
        // Check if a random number is already available
        await checkRandomNumberReady(account, provider);
      } else {
        setMessage("🦊 Please connect your Metamask wallet.");
        console.log("No connected accounts found.");
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      setMessage("⚠️ Error checking wallet connection.");
    }
  };

  /**
   * 🔗 **Function:** connectWalletHandler
   * @description Requests access to the user's Metamask account.
   */
  const connectWalletHandler = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setMessage(
          "🦊 Please install Metamask to interact with this application."
        );
        console.log("Metamask not detected.");
        return;
      }

      const provider = new BrowserProvider(ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        setMessage(`💳 Connected account: ${account}`);
        console.log(`Connected account: ${account}`);
        // Check if a random number is already available
        await checkRandomNumberReady(account, provider);
      }
    } catch (error) {
      console.error("Error connecting to Metamask:", error);
      setMessage("⚠️ Error connecting to Metamask.");
    }
  };

  /**
   * 🔍 **Function:** checkRandomNumberReady
   * @description Checks if a random number has already been generated.
   * @param {string} account - The user's Ethereum account address.
   * @param {BrowserProvider} provider - The ethers.js provider instance.
   */
  const checkRandomNumberReady = async (account, provider) => {
    try {
      const vrfContract = new Contract(
        VRFD5_CONTRACT_ADDRESS,
        vrfAbi,
        provider
      );
      console.log("VRFD5 Contract Initialized:", vrfContract);

      const randomNumber = await vrfContract.s_result();
      console.log("Fetched Random Number:", randomNumber.toString());

      if (randomNumber.toString() !== "0" && randomNumber.toString() !== "42") {
        setIsRandomNumberReady(true);
        setMessage(
          `✅ Random number already generated: ${randomNumber.toString()}`
        );
        console.log(
          `Random number already generated: ${randomNumber.toString()}`
        );
      } else if (randomNumber.toString() === "42") {
        setMessage("🔄 A random number request is in progress.");
        console.log("A random number request is currently in progress.");
      } else {
        setMessage("🟡 No random number generated yet.");
        console.log("No random number generated yet.");
      }
    } catch (error) {
      console.error("Error checking random number:", error);
      setMessage("⚠️ Error checking random number.");
    }
  };

  /**
   * 🔄 **Function:** requestRandomNumberHandler
   * @description Sends a transaction to request a random number from the VRFD5 contract.
   */
  const requestRandomNumberHandler = async () => {
    try {
      setMessage("🔄 Requesting random number...");
      console.log("Requesting random number...");

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const vrfContract = new Contract(VRFD5_CONTRACT_ADDRESS, vrfAbi, signer);
      console.log("VRFD5 Contract Initialized for Request:", vrfContract);

      // Call the requestNumber function
      const tx = await vrfContract.requestNumber();
      console.log("Transaction Sent:", tx.hash);
      setMessage(`🔄 Transaction sent: ${tx.hash}`);

      await tx.wait();
      console.log("Transaction Mined:", tx.hash);
      setMessage(`⌛ Random number requested. Waiting for fulfillment...`);
    } catch (error) {
      console.error("Error requesting random number:", error);
      setMessage("⚠️ Error requesting random number.");
    }
  };

  /**
   * 🛠️ **Function:** mintNftHandler
   * @description Sends a transaction to mint an NFT using the MyToken contract.
   */
  const mintNftHandler = async () => {
    try {
      setMessage("🛠️ Minting NFT...");
      console.log("Minting NFT...");

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const myTokenContract = new Contract(
        MYTOKEN_CONTRACT_ADDRESS,
        myTokenAbi,
        signer
      );
      console.log("MyToken Contract Initialized:", myTokenContract);

      // Call the mintNFT function
      const tx = await myTokenContract.safeMint(
        currentAccount,
        Date.now(),
        await getMetadataURL()
      );
      console.log("Mint Transaction Sent:", tx.hash);
      setMessage(`🛠️ Mint transaction sent: ${tx.hash}`);

      await tx.wait();
      console.log("NFT Minted:", tx.hash);
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

  /**
   * 🔗 **Function:** getMetadataURL
   * @description Retrieves the metadata URL from the VRFD5 contract.
   * @returns {Promise<string>} - The metadata URL.
   */
  const getMetadataURL = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const vrfContract = new Contract(
        VRFD5_CONTRACT_ADDRESS,
        vrfAbi,
        provider
      );
      const metadata = await vrfContract.getMetadata();
      console.log("Fetched Metadata URL:", metadata);
      return metadata;
    } catch (error) {
      console.error("Error fetching metadata:', error");
      setMessage("⚠️ Error fetching metadata.");
      return "";
    }
  };

  /**
   * 🔔 **Effect Hook:** Setup Event Listener
   * @description Listens for the RandomNumberFulfilled event from the VRFD5 contract.
   */
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
        console.log("Setting up event listener on VRFD5 contract...");

        // Listen for the RandomNumberFulfilled event
        vrfContract.on("RandomNumberFulfilled", (randomNumber) => {
          console.log(
            "RandomNumberFulfilled Event Received:",
            randomNumber.toString()
          );
          setIsRandomNumberReady(true);
          setMessage(`✅ Random number generated: ${randomNumber.toString()}`);
        });
      } catch (error) {
        console.error("Error setting up event listener:", error);
      }
    };

    setupEventListener();

    // Cleanup the event listener on component unmount
    return () => {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const vrfContract = new Contract(
          VRFD5_CONTRACT_ADDRESS,
          vrfAbi,
          provider
        );
        vrfContract.off("RandomNumberFulfilled");
        console.log("Event listener removed.");
      }
    };
  }, [vrfAbi]);

  /**
   * 🏁 **Effect Hook:** Initialize App on Mount
   * @description Checks wallet connection when the component mounts.
   */
  useEffect(() => {
    checkWalletIsConnected();
    console.log("Initialized App and checked wallet connection.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="main-app">
      <h1>My NFT Minting App</h1>
      {currentAccount ? (
        <div>
          <p>{message}</p>
          <button onClick={requestRandomNumberHandler}>
            Request Random Number
          </button>
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
