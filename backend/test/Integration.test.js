const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Minting Integration", function () {
  let vrfd5;
  let myToken;
  let owner;
  let user;
  const SUBSCRIPTION_ID = BigInt(
    "103413820047584116737990512707421460673027308105710436739736728878109784644730"
  );

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy VRFD5
    const VRFD5 = await ethers.getContractFactory("VRFD5");
    vrfd5 = await VRFD5.deploy(SUBSCRIPTION_ID);
    await vrfd5.waitForDeployment();

    // Deploy MyToken
    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy(owner.address);
    await myToken.waitForDeployment();
  });

  describe("Full Minting Flow", function () {
    it("Should complete the VRF request and NFT minting process", async function () {
      // Request random number
      const requestTx = await vrfd5.requestNumber();
      await requestTx.wait();

      // In a real environment, we'd wait for the VRF callback
      // For testing, we can simulate the callback if your contract allows it

      // Mint NFT
      const tokenId = 1;
      const uri = "ipfs://example";
      await myToken.safeMint(user.address, tokenId, uri);

      // Verify NFT ownership
      expect(await myToken.ownerOf(tokenId)).to.equal(user.address);
      expect(await myToken.tokenURI(tokenId)).to.equal(uri);
    });
  });

  describe("Error Handling", function () {
    it("Should handle failed VRF requests gracefully", async function () {
      // Implement based on your error handling requirements
    });

    it("Should handle failed minting gracefully", async function () {
      // Test error cases in the minting process
    });
  });
});
