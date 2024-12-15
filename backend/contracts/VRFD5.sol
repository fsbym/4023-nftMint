// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Import Chainlink VRF V2 Plus Consumer Base and Client libraries
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title VRFD5
 * @dev This contract requests a random number from Chainlink VRF and uses it to select NFT metadata.
 */
contract VRFD5 is VRFConsumerBaseV2Plus {
    // Indicates a random number request is in progress
    uint256 private constant REQUEST_IN_PROGRESS = 42;

    // Subscription ID for Chainlink VRF
    uint256 public s_subscriptionId;

    // VRF Coordinator address (Sepolia Testnet)
    address public vrfCoordinator = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;

    // Key hash for the Chainlink VRF (Sepolia Testnet)
    bytes32 public s_keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;

    // Callback gas limit for the VRF response
    uint32 public callbackGasLimit = 40000;

    // Number of confirmations before the VRF response
    uint16 public requestConfirmations = 3;

    // Number of random words requested
    uint32 public numWords = 1;

    // Holds the result of the random number; 0 means not requested yet
    uint256 public s_result = 0;

    // Event emitted when the random number is fulfilled
    event RandomNumberFulfilled(uint256 randomNumber);

    /**
     * @dev Constructor initializes the contract with the subscription ID
     * @param subscriptionId The Chainlink VRF subscription ID
     */
    constructor(uint256 subscriptionId) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_subscriptionId = subscriptionId;
    }

    /**
     * @dev Requests a random number from Chainlink VRF
     * @return requestId The ID of the VRF request
     */
    function requestNumber() public returns (uint256 requestId) {
        require(s_result != REQUEST_IN_PROGRESS, "A random number request is already in progress.");

        // Request randomness from Chainlink VRF
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    // Set native payment to false to use LINK token
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        s_result = REQUEST_IN_PROGRESS;
    }

    /**
     * @dev Callback function used by VRF Coordinator to return the random number
     * @param requestId The ID of the VRF request
     * @param randomWords The array containing the random numbers
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 d5Value = (randomWords[0] % 5) + 1;
        s_result = d5Value;
        emit RandomNumberFulfilled(s_result);
    }

    /**
     * @dev Retrieves the metadata URL based on the generated random number
     * @return The metadata URL string
     */
    function getMetadata() public view returns (string memory) {
        require(s_result != 0, "Random number not requested yet.");
        require(s_result != REQUEST_IN_PROGRESS, "Random number request is in progress.");

        // Updated IPFS metadata URLs
        string[5] memory Metadata = [
            "https://aquamarine-fascinating-guan-567.mypinata.cloud/ipfs/bafkreiccz2c2fqangyi24rd5beja5yypzwzsfxiuxtcikvmdq2n5cjonoe",
            "https://aquamarine-fascinating-guan-567.mypinata.cloud/ipfs/bafkreiar2u4v7enhqitcc5nggu6p5oykhayjwbxidclaigeon3gjymxo2m",
            "https://aquamarine-fascinating-guan-567.mypinata.cloud/ipfs/bafkreiazowf6c7ci4g34j5lamggfnuuefrg2iewidwbgo5nsr22fivahvm",
            "https://aquamarine-fascinating-guan-567.mypinata.cloud/ipfs/bafkreictslpu6qot2blia6lywml734zi46isrxej7m4ordqbphc4fwukba",
            "https://aquamarine-fascinating-guan-567.mypinata.cloud/ipfs/bafkreie7vhbvd3s3kbxmi7wuialxoezdzabfatzuhbdnpbd4vomvwnorj4"
        ];
        return Metadata[s_result - 1];
    }

    /**
     * @dev Resets the random result to allow a new random number request
     */
    function resetRandomResult() public {
        require(s_result != REQUEST_IN_PROGRESS, "Random number request is still in progress.");
        s_result = 0;
    }
}