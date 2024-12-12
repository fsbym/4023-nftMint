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
        require(s_result == 0, "A random number has already been requested.");
        // this will revert if the subscription has not been created and adequately funded
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    // set the native payment to true to fund randomness requests with ETH instead of the default LINK
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        s_result = REQUEST_IN_PROGRESS;
    }

    // callback function used by VRF Coordinator to return random number to the contract
    // randomWords uint256[] is the random result returned by the Oracle
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 d5Value = (randomWords[0] % 5) + 1;
        s_result = d5Value;
    }
   
    function getMetadata() public view returns (string memory) {
        require(s_result != 0, "Random number not requested yet.");
        require(s_result != REQUEST_IN_PROGRESS, "In progress...Fetching randomness...");
        
        // Updated IPFS metadata URLs
        string[5] memory Metadata = [
            "https://amaranth-hidden-mastodon-476.mypinata.cloud/ipfs/bafkreifhwpmaokn62mo26vp5wim7xcb47nm7herjtvudpm6hhunh36vh6e",
            "https://amaranth-hidden-mastodon-476.mypinata.cloud/ipfs/bafkreibkr3gcwvdqa24ntoal2jrddoye5yxzrzxcvr3paitugxj6usegm4",
            "https://amaranth-hidden-mastodon-476.mypinata.cloud/ipfs/bafkreifb4fpmytjcf77hb3s5hk5gmxq7ztqozjpjtz7dygipx66vkef4dq",
            "https://amaranth-hidden-mastodon-476.mypinata.cloud/ipfs/bafkreifv7h34khg6q5lwgzfhekb6vapvm4q6zwhb5bjdz23ysjstopwqai",
            "https://amaranth-hidden-mastodon-476.mypinata.cloud/ipfs/bafkreie4c7je7fbgr5g63jqpj7bikfjm2bfzofbhpe4g3z6xrzcryrt36y"
        ];
        return Metadata[s_result - 1];
    }
}
