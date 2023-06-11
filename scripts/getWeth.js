const { getNamedAccounts, ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

// Define the amount of WETH to deposit
const AMOUNT = ethers.utils.parseEther("100");

// Aave only works with ERC20 tokens so first we need to convert the ETH to WETH
async function getWeth() {
    // Get the `deployer` account
    const { deployer } = await getNamedAccounts();
    // We need abi and contract address to call the "deposit" function on the weth contract
    // For abi we used IWeth Interface (from course github) and for contract address we used Weth mainnet contract address https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

    // getContractAt() allows us to get a contract at a specific address
    // Get iWeth contract with the abi of IWeth at this address (Weth mainnet address 0xc02...6cc2) connected to deployer
    // Get the contract for the WETH token
    const iWeth = await ethers.getContractAt(
        "IWeth",
        networkConfig[network.config.chainId].wethToken,
        deployer
    );

    // Deposit the specified amount of WETH
    const txResponse = await iWeth.deposit({ value: AMOUNT });
    // Wait for the transaction to be mined
    await txResponse.wait(1);

    // Get the balance of WETH in the `deployer` account
    const wethBalance = await iWeth.balanceOf(deployer);
    // Log the balance of WETH
    console.log(`deployer balance: ${wethBalance.toString()} WETH`); // deployer balance: 100000000000000000 WETH
}

module.exports = { getWeth, AMOUNT };
