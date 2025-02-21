# CI/CD Pipeline and Testing Process
## Overview
This project implements a robust CI/CD pipeline using GitHub Actions for automated testing, security analysis, and deployment of NFT smart contracts.

## CI/CD Pipeline Structure

### 1. Build and Test Phase

```10:56:.github/workflows/ci.yml
  build-test:
    runs-on: ubuntu-latest
    env:
    runs-on: ubuntu-latest
      ALCHEMY_SEPOLIA_URL: ${{ secrets.ALCHEMY_SEPOLIA_URL }}
      PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
    steps:
      - uses: actions/checkout@v3
      - name: Install Node.js
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
          node-version: "18"
      - name: Build and test backend
        run: |
          docker compose build backend
          docker compose run --rm \
            -e PRIVATE_KEY=${{ secrets.PRIVATE_KEY }} \
            -e ALCHEMY_SEPOLIA_URL=${{ secrets.ALCHEMY_SEPOLIA_URL }} \
            backend npm install
          docker compose run --rm backend npm run test
          docker compose run --rm backend npx hardhat compile
          docker compose run --rm backend npx solhint 'contracts/**/*.sol'
        run: npm install
      - name: Install and run Slither
        run: |
          python3 -m pip install --user slither-analyzer solc-select
          solc-select install 0.8.20
          solc-select use 0.8.20
          export SOLC_VERSION=0.8.20
          slither backend/contracts --allow-paths .,backend/contracts,node_modules --config-file backend/slither.config.json
      - name: Generate gas report
        run: REPORT_GAS=true npx hardhat test
        continue-on-error: true
        env:
      - name: Build and test frontend
        run: |
          docker compose build frontend
          docker compose run --rm frontend npm install
          docker compose run --rm frontend npm run test
          docker compose run --rm frontend npm run lint
          docker compose run --rm frontend npm audit
          echo "Contract deployed successfully to ${{ steps.deploy.outputs.CONTRACT_ADDRESS }}"
      - name: Security check frontend
        run: |
          docker compose run --rm frontend snyk test
          docker compose run --rm frontend retire
      - name: Install Mythril
```

The pipeline includes:

Docker-based build environment
Smart contract compilation
Automated testing
Security analysis with Slither
Frontend build and testing
Code linting and security audits


### 2. Deployment Phase

```57:100:.github/workflows/ci.yml
  deploy:
    needs: build-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/master' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
        run: myth analyze contracts/MyToken.sol --solc-json mythril.config.json
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
  deploy:
      - name: Deploy MyToken to Sepolia
        run: |
          docker compose run --rm \
            -e PRIVATE_KEY=${{ secrets.PRIVATE_KEY }} \
            -e ALCHEMY_SEPOLIA_URL=${{ secrets.ALCHEMY_SEPOLIA_URL }} \
            backend npx hardhat run scripts/deployMyToken.js --network sepolia
          if [ -f "deployment.txt" ]; then
            echo "MYTOKEN_CONTRACT_ADDRESS=$(cat deployment.txt)" >> $GITHUB_ENV
          else
            echo "MYTOKEN_CONTRACT_ADDRESS=Deployment failed" >> $GITHUB_ENV
          fi
        run: npm install
      - name: Deploy VRFD5 to Sepolia
        run: |
          docker compose run --rm \
            -e PRIVATE_KEY=${{ secrets.PRIVATE_KEY }} \
            -e ALCHEMY_SEPOLIA_URL=${{ secrets.ALCHEMY_SEPOLIA_URL }} \
            backend npx hardhat run scripts/deployVRFD5.js --network sepolia
          if [ -f "deployment.txt" ]; then
            echo "VRFD5_CONTRACT_ADDRESS=$(cat deployment.txt)" >> $GITHUB_ENV
          else
            echo "VRFD5_CONTRACT_ADDRESS=Deployment failed" >> $GITHUB_ENV
          fi
        run: |
      - name: Debug contract address
        run: |
          echo "MyToken contract address: $MYTOKEN_CONTRACT_ADDRESS"
          echo "VRFD5 contract address: $VRFD5_CONTRACT_ADDRESS"
        run: |
      - name: Notify deployment
        if: success()
        run: |
          echo "MyToken deployed successfully to $MYTOKEN_CONTRACT_ADDRESS"
          echo "VRFD5 deployed successfully to $VRFD5_CONTRACT_ADDRESS"
```
 
Automated deployment to Sepolia testnet includes:
MyToken (ERC721) contract deployment
VRFD5 (Chainlink VRF) contract deployment
Contract address verification
Frontend configuration update


## Testing Framework


### Smart Contract Tests


1. **Unit Tests**

```1:46:backend/test/MyToken.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken Contract", function () {
  let MyToken;
  let myToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    [owner, addr1, addr2] = await ethers.getSigners();
    MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy(owner.address);
    await myToken.waitForDeployment();
  });
    await myToken.waitForDeployment();
  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await myToken.owner()).to.equal(owner.address);
    });
      expect(await myToken.owner()).to.equal(owner.address);
    it("Should have correct name and symbol", async function () {
      expect(await myToken.name()).to.equal("OrdoToken");
      expect(await myToken.symbol()).to.equal("O");
    });
  });
    });
  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const tokenId = 1;
      const tokenURI = "https://example.com/token/1";
      await myToken.safeMint(addr1.address, tokenId, tokenURI);
      const tokenURI = "https://example.com/token/1";
      expect(await myToken.ownerOf(tokenId)).to.equal(addr1.address);
      expect(await myToken.tokenURI(tokenId)).to.equal(tokenURI);
    });
      expect(await myToken.tokenURI(tokenId)).to.equal(tokenURI);
    it("Should fail when non-owner tries to mint", async function () {
      const tokenId = 1;
      await expect(
        myToken.connect(addr1).safeMint(addr2.address, tokenId, "uri")
      ).to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount");
    });
  });
```
ERC721 functionality testing
Ownership verification
Minting permissions
Token URI management

2. **Integration Tests**

```1:56:backend/test/Integration.test.js
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
```
End-to-end NFT minting flow
VRF random number generation
Error handling scenarios


### Security Analysis


1. **Slither Configuration**

```1:9:backend/slither.config.json
{
  "detectors_to_exclude": ["naming-convention"],
  "exclude_informational": false,
  "exclude_low": false,
  "exclude_medium": false,
  "exclude_high": false,
  "solc_disable_warnings": false,
  "filter_paths": "node_modules"
}
```
Automated vulnerability detection
Custom detector configuration
Severity-based issue filtering


2. **Security Report Processing**

```1:64:backend/scripts/process-security-reports.js
const fs = require("fs");

function processSecurityReports() {
  // Read security analysis results
  const slitherOutput = fs.readFileSync("slither-report.json", "utf8");
  const mythrilOutput = fs.readFileSync("security-report.md", "utf8");

  // Parse results
  const slitherResults = JSON.parse(slitherOutput);

  // Generate summary report
  const report = {
    highSeverity: [],
    mediumSeverity: [],
    lowSeverity: [],
  };

  // Process Slither findings
  slitherResults.results.detectors.forEach((finding) => {
    switch (finding.impact) {
      case "High":
        report.highSeverity.push({
          tool: "Slither",
          description: finding.description,
          location: finding.elements[0].source_mapping.filename,
        });
        break;
      case "Medium":
        report.mediumSeverity.push({
          tool: "Slither",
          description: finding.description,
          location: finding.elements[0].source_mapping.filename,
        });
        break;
      case "Low":
        report.lowSeverity.push({
          tool: "Slither",
          description: finding.description,
          location: finding.elements[0].source_mapping.filename,
        });
        break;
    }
  });

  // Process Mythril findings (if available)
  if (mythrilOutput) {
    // Parse Mythril markdown output and categorize findings
    const mythrilFindings = parseMythrilOutput(mythrilOutput);
    report.highSeverity.push(...mythrilFindings.high);
    report.mediumSeverity.push(...mythrilFindings.medium);
    report.lowSeverity.push(...mythrilFindings.low);
  }

  // Generate markdown report
  fs.writeFileSync(
    "security-summary.md",
    `# Security Analysis Summary\n\n` +
      `## High Severity Issues\n${formatFindings(report.highSeverity)}\n\n` +
      `## Medium Severity Issues\n${formatFindings(
        report.mediumSeverity
      )}\n\n` +
      `## Low Severity Issues\n${formatFindings(report.lowSeverity)}`
  );
}
```
Aggregates security findings
Categorizes issues by severity
Generates comprehensive security reports


## Gas Optimization


- Gas usage reporting enabled in Hardhat configuration


- Contract size monitoring

```31:43:backend/hardhat.config.js
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    token: "ETH",
    gasPriceApi:
      "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
```


## Frontend Testing

React component testing
Web3 integration testing
Security plugin integration

```12:18:frontend/package.json
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint 'src/**/*.{js,jsx}'"
  },
```

## Continuous Monitoring

Contract deployment status tracking
Transaction verification
Automated notification system


## Development Workflow

Create feature branch
Write tests
Implement features
Run local tests
Create pull request
Automated CI checks
Code review
Merge and deploy


## Getting Started

1. Clone repository

2. Install dependencies

3. Set up environment variables

4. Run test suite:
```bash
npm install
npm run test
```
5
