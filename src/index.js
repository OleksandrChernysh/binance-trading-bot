import { config } from 'dotenv';
import logEnvInfo from './helpers/Log/index.js';
import client from './client.js';
import Account from './Account.js';
// import Market from './Market.js';

config();

logEnvInfo();

const account = new Account(client);
// const market = new Market(client);

// const symbol = process.env.SYMBOL;
// const buyPriceThreshold = process.env.BUY_PRICE_THRESHOLD;
// const sellPriceThreshold = process.env.SELL_PRICE_THRESHOLD;
// const tradeQuantity = process.env.TRADE_QUANTITY;

// account.getFundingWallet();
// market.getThickerData(client, symbol);
account.getAccountData();
account.getFundingAssets();
