import { logEnvInfo } from './helpers/LogComponent/index.js';
import Log from './helpers/LogComponent/Log.js';
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

logEnvInfo();
checkTradeVariables();

const log = new Log();

const checkTradeVariablesResult = checkTradeVariables();
if (!checkTradeVariablesResult) {
  log.error(
    'Error: One or more environment variables are not set correctly. Trading logic will not run.'
  );
  process.exit(1);
}

// Account verification
try {
  const account = new Account(client);
  const accountData = await account.getAccountData();
  if (accountData) {
    log.info('API credentials verified successfully.');
  } else {
    // This case might not be strictly necessary if getAccountData always throws on error or returns data.
    // However, it's good practice to handle it.
    log.error(
      'Error verifying API credentials. Account data was not received. Please check your API_KEY and API_SECRET. Exiting.'
    );
    process.exit(1);
  }
} catch (error) {
  log.error(
    `Error verifying API credentials. Please check your API_KEY and API_SECRET. Exiting. Details: ${error.message}`
  );
  process.exit(1);
}

const market = new Market(client, SYMBOL);

async function runTradingLogic() {
  let currentPrice;
  try {
    console.log(`Fetching price for ${SYMBOL}...`);
    const ticker = await market.getTickerPrice();

    if (!ticker || typeof ticker.price !== 'string') {
      console.error(
        `Could not fetch ticker price for ${SYMBOL}, or price is not a string. Response:`,
        ticker
      );
      return;
    }

    currentPrice = parseFloat(ticker.price);
    if (isNaN(currentPrice)) {
      console.error(
        `Error parsing fetched price for ${SYMBOL}. Price string was: "${ticker.price}".`
      );
      return;
    }

    console.log(`Current price for ${SYMBOL}: ${currentPrice}`);
    console.log(
      `Buy threshold: ${BUY_PRICE_THRESHOLD}, Sell threshold: ${SELL_PRICE_THRESHOLD}, Trade quantity: ${TRADE_QUANTITY}`
    );
  } catch (error) {
    console.error(
      `Error during price fetching or parsing for ${SYMBOL}:`,
      error
    );
    return; // Skip trading decision if price cannot be determined
  }

  if (currentPrice < BUY_PRICE_THRESHOLD) {
    console.log(
      `Attempting to buy ${TRADE_QUANTITY} ${SYMBOL} at ${currentPrice} (Threshold: < ${BUY_PRICE_THRESHOLD})`
    );
    try {
      const buyOrderResponse = await market.placeBuyOrder(TRADE_QUANTITY);
      if (buyOrderResponse) {
        console.log('Buy order placed successfully:', buyOrderResponse);
      } else {
        console.log('Buy order failed or no response.');
      }
    } catch (error) {
      console.error('Error placing buy order:', error);
    }
  } else if (currentPrice > SELL_PRICE_THRESHOLD) {
    console.log(
      `Attempting to sell ${TRADE_QUANTITY} ${SYMBOL} at ${currentPrice} (Threshold: > ${SELL_PRICE_THRESHOLD})`
    );
    try {
      const sellOrderResponse = await market.placeSellOrder(TRADE_QUANTITY);
      if (sellOrderResponse) {
        console.log('Sell order placed successfully:', sellOrderResponse);
      } else {
        console.log('Sell order failed or no response.');
      }
    } catch (error) {
      console.error('Error placing sell order:', error);
    }
  } else {
    console.log(
      `No action taken for ${SYMBOL}. Price ${currentPrice} is between buy threshold ${BUY_PRICE_THRESHOLD} and sell threshold ${SELL_PRICE_THRESHOLD}.`
    );
  }
}

await runTradingLogic().catch((error) => {
  console.error('Error running trading logic:', error);
});
