import { logEnvInfo } from './helpers/LogComponent/index.js';
import { checkTradeVariables } from './helpers/Checks/index.js';
import {
  SYMBOL,
  TRADE_QUANTITY,
  BUY_PRICE_THRESHOLD,
  SELL_PRICE_THRESHOLD,
} from './constants/index.js';
import client from './client/index.js';
import Account from './Account.js';
import Market from './Market.js';
import TradingBot from './TradingBot.js';

logEnvInfo();
checkTradeVariables();

const checkTradeVariablesResult = checkTradeVariables();
if (!checkTradeVariablesResult) {
  console.error(
    'Error: One or more environment variables are not set correctly. Trading logic will not run.'
  );
  process.exit(1);
}

const account = new Account(client);
// account.logAccountData();
account.logFundingAssets();

// const market = new Market(client, SYMBOL);
// const tradingBot = new TradingBot(
//   SYMBOL,
//   BUY_PRICE_THRESHOLD,
//   SELL_PRICE_THRESHOLD,
//   TRADE_QUANTITY,
//   market
// );

// tradingBot.init()

// async function runTradingLogic() {
// let currentPrice;
// try {
//   console.log(`Fetching price for ${SYMBOL}...`);
//   const ticker = await market.getTickerPrice();

//   if (!ticker || typeof ticker.price !== 'string') {
//     console.error(
//       `Could not fetch ticker price for ${SYMBOL}, or price is not a string. Response:`,
//       ticker
//     );
//     return;
//   }

//   currentPrice = parseFloat(ticker.price);
//   if (isNaN(currentPrice)) {
//     console.error(
//       `Error parsing fetched price for ${SYMBOL}. Price string was: "${ticker.price}".`
//     );
//     return;
//   }

//   console.log(`Current price for ${SYMBOL}: ${currentPrice}`);
//   console.log(
//     `Buy threshold: ${BUY_PRICE_THRESHOLD}, Sell threshold: ${SELL_PRICE_THRESHOLD}, Trade quantity: ${TRADE_QUANTITY}`
//   );
// } catch (error) {
//   console.error(
//     `Error during price fetching or parsing for ${SYMBOL}:`,
//     error
//   );
//   return; // Skip trading decision if price cannot be determined
// }

//   if (currentPrice < BUY_PRICE_THRESHOLD) {
//     console.log(
//       `Attempting to buy ${TRADE_QUANTITY} ${SYMBOL} at ${currentPrice} (Threshold: < ${BUY_PRICE_THRESHOLD})`
//     );
//     try {
//       const buyOrderResponse = await market.placeBuyOrder(TRADE_QUANTITY);
//       if (buyOrderResponse) {
//         console.log('Buy order placed successfully:', buyOrderResponse);
//       } else {
//         console.log('Buy order failed or no response.');
//       }
//     } catch (error) {
//       console.error('Error placing buy order:', error);
//     }
//   } else if (currentPrice > SELL_PRICE_THRESHOLD) {
//     console.log(
//       `Attempting to sell ${TRADE_QUANTITY} ${SYMBOL} at ${currentPrice} (Threshold: > ${SELL_PRICE_THRESHOLD})`
//     );
//     try {
//       const sellOrderResponse = await market.placeSellOrder(TRADE_QUANTITY);
//       if (sellOrderResponse) {
//         console.log('Sell order placed successfully:', sellOrderResponse);
//       } else {
//         console.log('Sell order failed or no response.');
//       }
//     } catch (error) {
//       console.error('Error placing sell order:', error);
//     }
//   } else {
//     console.log(
//       `No action taken for ${SYMBOL}. Price ${currentPrice} is between buy threshold ${BUY_PRICE_THRESHOLD} and sell threshold ${SELL_PRICE_THRESHOLD}.`
//     );
//   }
// }

// await runTradingLogic().catch((error) => {
//   console.error('Error running trading logic:', error);
// });
