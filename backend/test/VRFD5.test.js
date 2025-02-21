const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VRFD5 Contract", function () {
  let vrfd5;
  let owner;
  let user;
  const SUBSCRIPTION_ID = BigInt(
    "103413820047584116737990512707421460673027308105710436739736728878109784644730"
  );

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const VRFD5 = await ethers.getContractFactory("VRFD5");
    vrfd5 = await VRFD5.deploy(SUBSCRIPTION_ID);
    await vrfd5.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct subscription ID", async function () {
      expect(await vrfd5.s_subscriptionId()).to.equal(SUBSCRIPTION_ID);
    });

    it("Should set the correct VRF coordinator", async function () {
      const expectedCoordinator = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
      expect(await vrfd5.vrfCoordinator()).to.equal(expectedCoordinator);
    });

    it("Should initialize with correct parameters", async function () {
      expect(await vrfd5.callbackGasLimit()).to.equal(40000);
      expect(await vrfd5.requestConfirmations()).to.equal(3);
      expect(await vrfd5.numWords()).to.equal(1);
    });
  });

  describe("Random Number Request", function () {
    it("Should emit event when requesting random number", async function () {
      // Note: This test might need modification based on your actual implementation
      const tx = await vrfd5.requestNumber();
      const receipt = await tx.wait();

      // Check for relevant events in your implementation
      // expect(receipt.events[0].event).to.equal("RandomNumberRequested");
    });
  });

  describe("Random Number Fulfillment", function () {
    it("Should handle random number fulfillment", async function () {
      // This test needs to be implemented based on your VRF implementation
      // You might need to mock the VRF Coordinator's behavior
    });
  });
});
