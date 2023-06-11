// This file contains code to deposit ETH into a lending pool.

const { getWeth, AMOUNT } = require("./getWeth");
const { getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

async function main() {
    // Converts deployer's ETH to WETH token
    await getWeth();

    // Get the `deployer` account from the named accounts.
    const { deployer } = await getNamedAccounts();

    /* --------------------Step-2-------------------- */
    // Get the lending pool contract.
    const lendingPool = await getLendingPool(deployer);
    // Log the lending pool address.
    console.log(`Lending address: ${lendingPool.address}`); // Lending address: 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9

    /* --------------------Step-4-------------------- */
    // In LendingPool contract the deposit function will call .safeTransferFrom basically transferFrom, this is the function that actually going to pull the money out of our wallet. So in order to give aave contract the ability to pull the money out of our wallet, we need to approve the aave contract. Aave Lending contract https://github.com/aave/protocol-v2/blob/ice/mainnet-deployment-03-12-2020/contracts/protocol/lendingpool/LendingPool.sol#L105
    // Get the WETH token address.
    const wethTokenAddress = networkConfig[network.config.chainId].wethToken;

    // Approve the lending pool to spend the specified amount of ETH.
    // We're giving approval to lendingPool to pull our WETH token from our account
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
    console.log("Depositing WETH...");

    // Deposit the specified amount of ETH into the lending pool.
    // lendingPool.deposit(addressOf asset, amount, addressOf onBehalfOf, referralCode(always 0 because it's discontinued))
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log("Deposited!");

    /* --------------------Step-6-------------------- */
    // Getting borrowing stats
    console.log("Getting the users account data");
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,
        deployer
    );

    /* --------------------Step-8-------------------- */
    // Gives us 1 DAI price in ETH
    const daiPrice = await getDaiPrice();

    // This will give us the amount of DAI that we can borrow.
    const amountDaiToBorrow =
        // In 82.5 ETH we're borrowing 95 percent
        // 82.5 * 0.95 * (1/0.00056897 = 1,757.56)
        availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());
    console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`); // You can borrow 137748.41040269533 DAI

    // Similar to ETH, DAI also has 18 decimal points. This gives the amount of DAI that we can borrow in Wei.
    const amountDaiToBorrowWei = ethers.utils.parseEther(
        amountDaiToBorrow.toString()
    );
    console.log(`You can borrow ${amountDaiToBorrowWei} Wei DAI`); // You can borrow 137748410402695330000000 Wei DAI

    /* --------------------Step-10-------------------- */
    // Borrow
    await borrowDai(
        networkConfig[network.config.chainId].daiToken,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    );

    await getBorrowUserData(lendingPool, deployer);

    /* --------------------Step-12-------------------- */
    await repay(
        amountDaiToBorrowWei,
        networkConfig[network.config.chainId].daiToken,
        lendingPool,
        deployer
    );

    await getBorrowUserData(lendingPool, deployer);
}

/* --------------------Step-1-------------------- */
async function getLendingPool({ account }) {
    // Get the lending pool address provider contract.
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        networkConfig[network.config.chainId].lendingPoolAddressesProvider,
        account
    );

    // Get the lending pool address from the lending pool address provider contract.
    const lendingPoolAddress =
        await lendingPoolAddressProvider.getLendingPool();
    // Log the lending pool address.
    console.log(lendingPoolAddress); // 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9

    // Get the lending pool contract.
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    );
    // Return the lending pool contract.
    return lendingPool;
}

/* --------------------Step-3-------------------- */
async function approveErc20(erc20Address, spenderAddress, amount, signer) {
    // Get the ERC-20 token contract.
    const erc20Token = await ethers.getContractAt(
        "IERC20",
        erc20Address,
        signer
    );
    // Approve the spender to spend the specified amount of tokens.
    const tx = await erc20Token.approve(spenderAddress, amount);
    // Wait for the approval transaction to be mined.
    await tx.wait(1);
    console.log("Approved!");
}

/* --------------------Step-5-------------------- */
// Borrowing

// function getUserAccountData(address user) Returns the user account data across all the reserves
async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account);
    console.log(`You have ${totalCollateralETH} worth of ETH deposited,`); // You have 100000000000000000000 worth of ETH deposited, (100 ETH)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`); // You have 0 worth of ETH borrowed.
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`); // You can borrow 82500000000000000000 worth of ETH. (82.5 ETH)
    return { availableBorrowsETH, totalDebtETH };
}

/* --------------------Step-7-------------------- */
// To check how much DAI we can borrow based off of the value of ETH. Using Chainlink's priceFeed
async function getDaiPrice() {
    // we don't need to connect this to the deployer account. Since we're not going to be sending any transactions, we're just going to be reading from this contract.
    // For reading we don't need a signer, for sending we need a signer.
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        networkConfig[network.config.chainId].daiEthPriceFeed
    );
    // Once below await returns, we're just gonna grab it's first index.
    const price = (await daiEthPriceFeed.latestRoundData())[1];
    console.log(`The DAI/ETH price is ${price.toString()}`); // The DAI/ETH price is 568972083023518 (1 DAI = 0.00056897 ETH)
    return price;
}

/* --------------------Step-9-------------------- */
// To check how much DAI we can borrow based off of the value of ETH. Using Chainlink's priceFeed
async function borrowDai(
    daiAddress,
    lendingPool,
    amountDaiToBorrowWei,
    account
) {
    // function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)
    // https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#borrow
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrowWei,
        1,
        0,
        account
    );
    await borrowTx.wait(1);
    console.log("You've borrowed!");
}

/* --------------------Step-11-------------------- */
// https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#repay
async function repay(amount, daiAddress, lendingPool, signer) {
    await approveErc20(daiAddress, lendingPool.address, amount, signer);
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, signer);
    await repayTx.wait(1);
    console.log("Repaid!");
}
https: main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

/* Terminal Commands */
// yarn hardhat run scripts/aaveBorrow.js

/* 
deployer balance: 100000000000000000000 WETH
0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9
Lending address: 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9
Approved!
Depositing WETH...
Deposited!
Getting the users account data
You have 100000000000000000000 worth of ETH deposited,
You have 0 worth of ETH borrowed.
You can borrow 82500000000000000000 worth of ETH.
The DAI/ETH price is 568972083023518
You can borrow 137748.41040269533 DAI
You can borrow 137748410402695330000000 Wei DAI
You've borrowed!
You have 100000001162005158797 worth of ETH deposited,
You have 78374999999999997840 worth of ETH borrowed.
You can borrow 4125000958654258168 worth of ETH.
Approved!
Repaid!
You have 100000001975408769955 worth of ETH deposited,
You have 4134548799740 worth of ETH borrowed.
You can borrow 82499997495163435473 worth of ETH.
*/
