// SPDX-License-Identifier: MIT

// pragma solidity ^0.8.26;
pragma solidity ^0.8.19;
  
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

// After the contract asks for randomness from Chainlink VRF, the result will be converted into a number
// between 1 and 5 which will be used to select a json file stored on IPFS that stores NFT metadata.

// Note: if a random number is stored on the blockchain, a hacker could predict the outcome.
// We ask for randomness from the Oracle, which generates a number and cryptographic proof of randomness.
// The Oracle returns the result to the requesting (consuming) contract.

contract VRFD5 is VRFConsumerBaseV2Plus {

    uint256 private constant REQUEST_IN_PROGRESS = 42;
    // subscription ID will be passed in via the constructor
    uint256 public s_subscriptionId;

    // The VRF request is funded by our subscription account.
    // The Subscription Manager lets you create an account to pre-pay VRF Requests,
    // so that all funding is handled from a single location.

    // Sepolia Testnet Coordinator
    address public vrfCoordinator = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    // used to specify max gas price to pay for transaction
    bytes32 public s_keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    // Value depends on # of requested values sent to randomness function.
    // Adjust based on selected network, request size, and callback function processing.
    uint32 public callbackGasLimit = 40000;
    uint16 public requestConfirmations = 3; // default

    // in this contract retrieve one random value in one request.
    // cannot be greater than VRFCoordinatorV2_5.MAX_NUM_WORDS
    uint32 public numWords = 1;

    // returned random number
    uint256 s_result = 0;
    
    // Constructor inherits VRFConsumerBaseV2Plus
    // Network: Sepolia
    // subscriptionId this consumer contract can use

    constructor(uint256 subscriptionId) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_subscriptionId = subscriptionId;
    }

    // Request randomness
    // Note: if the VRF response is delayed, do not repeatedly call requestRandomness
    
   function requestNumber() public returns (uint256 requestId) {
    // Ensure the current randomness has been consumed before requesting a new one
    require(s_result == 0 || s_result != REQUEST_IN_PROGRESS, "A random number is already being processed or hasn't been consumed.");

    // Request randomness
    requestId = s_vrfCoordinator.requestRandomWords(
        VRFV2PlusClient.RandomWordsRequest({
            keyHash: s_keyHash,
            subId: s_subscriptionId,
            requestConfirmations: requestConfirmations,
            callbackGasLimit: callbackGasLimit,
            numWords: numWords,
            extraArgs: VRFV2PlusClient._argsToBytes(
                VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
            )
        })
    );
    s_result = REQUEST_IN_PROGRESS; // Update state to indicate request in progress
}
 function resetRequest() public {
    require(s_result != REQUEST_IN_PROGRESS, "Randomness request is still in progress.");
    s_result = 0; // Reset the state to allow a new request
}


    // callback function used by VRF Coordinator to return random number to the contract
    // randomWords uint256[] is the random result returned by the Oracle
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 d5Value = (randomWords[0] % 5) + 1;
        s_result = d5Value;
    }
   
   function getMetadata() public view returns (string memory) {
    require(s_result != 0, "Random number has not been requested yet.");
    require(s_result != REQUEST_IN_PROGRESS, "Randomness is still being fetched. Please wait.");

    // Metadata IPFS URLs
    string[5] memory Metadata = [
        "https://aquamarine-fascinating-guan-567.mypinata.cloud/ipfs/bafkreiccz2c2fqangyi24rd5beja5yypzwzsfxiuxtcikvmdq2n5cjonoe",
        "https://aquamarine-fascinating-guan-567.mypinata.cloud/ipfs/bafkreiar2u4v7enhqitcc5nggu6p5oykhayjwbxidclaigeon3gjymxo2m",
        "https://aquamarine-fascinating-guan-567.mypinata.cloud/ipfs/bafkreiazowf6c7ci4g34j5lamggfnuuefrg2iewidwbgo5nsr22fivahvm",
        "https://aquamarine-fascinating-guan-567.mypinata.cloud/ipfs/bafkreictslpu6qot2blia6lywml734zi46isrxej7m4ordqbphc4fwukba",
        "https://aquamarine-fascinating-guan-567.mypinata.cloud/ipfs/bafkreie7vhbvd3s3kbxmi7wuialxoezdzabfatzuhbdnpbd4vomvwnorj4"
    ];
    return Metadata[s_result - 1];
}

}
