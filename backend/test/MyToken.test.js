const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken Contract", function () {
  let MyToken;
  let myToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get signers (accounts) from Hardhat
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract before each test
    MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy(owner.address);
    await myToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await myToken.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await myToken.name()).to.equal("OrdoToken");
      expect(await myToken.symbol()).to.equal("O");
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const tokenId = 1;
      const tokenURI = "https://example.com/token/1";
      await myToken.safeMint(addr1.address, tokenId, tokenURI);

      expect(await myToken.ownerOf(tokenId)).to.equal(addr1.address);
      expect(await myToken.tokenURI(tokenId)).to.equal(tokenURI);
    });

    it("Should fail when non-owner tries to mint", async function () {
      const tokenId = 1;
      await expect(
        myToken.connect(addr1).safeMint(addr2.address, tokenId, "uri")
      ).to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Token Transfers", function () {
    beforeEach(async function () {
      // Mint a token before each transfer test
      await myToken.safeMint(addr1.address, 1, "uri");
    });

    it("Should allow token transfer between accounts", async function () {
      await myToken
        .connect(addr1)
        .transferFrom(addr1.address, addr2.address, 1);
      expect(await myToken.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should fail when unauthorized account attempts transfer", async function () {
      await expect(
        myToken.connect(addr2).transferFrom(addr1.address, addr2.address, 1)
      ).to.be.revertedWithCustomError(myToken, "ERC721InsufficientApproval");
    });
  });
});
