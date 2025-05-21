import { config } from 'dotenv';
import logEnvInfo from './helpers/LogComponent/index.js';
import client from './client.js';
import Account from './Account.js';
import Market from './Market.js';

config();

logEnvInfo();

const account = new Account(client);

const { SYMBOL: symbol, BUY_PRICE_THRESHOLD, SELL_PRICE_THRESHOLD, TRADE_QUANTITY } = process.env;

if (!symbol || !BUY_PRICE_THRESHOLD || !SELL_PRICE_THRESHOLD || !TRADE_QUANTITY) {
  console.error('Error: Missing one or more required environment variables (SYMBOL, BUY_PRICE_THRESHOLD, SELL_PRICE_THRESHOLD, TRADE_QUANTITY). Trading logic will not run.');
} else {
  const buyPriceThreshold = parseFloat(BUY_PRICE_THRESHOLD);
  const sellPriceThreshold = parseFloat(SELL_PRICE_THRESHOLD);
  const tradeQuantity = parseFloat(TRADE_QUANTITY);

  if (isNaN(buyPriceThreshold) || isNaN(sellPriceThreshold) || isNaN(tradeQuantity)) {
    console.error('Error: BUY_PRICE_THRESHOLD, SELL_PRICE_THRESHOLD, or TRADE_QUANTITY is not a valid number. Trading logic will not run.');
  } else {
    const market = new Market(client, symbol);

    async function runTradingLogic() {
      let currentPrice;
      try {
        console.log(`Fetching price for ${symbol}...`);
        const ticker = await market.getTickerPrice();

        if (!ticker || typeof ticker.price !== 'string') {
          console.error(`Could not fetch ticker price for ${symbol}, or price is not a string. Response:`, ticker);
          return;
        }
        currentPrice = parseFloat(ticker.price);
        if (isNaN(currentPrice)) {
          console.error(`Error parsing fetched price for ${symbol}. Price string was: "${ticker.price}".`);
          return;
        }
        console.log(`Current price for ${symbol}: ${currentPrice}`);
        console.log(`Buy threshold: ${buyPriceThreshold}, Sell threshold: ${sellPriceThreshold}, Trade quantity: ${tradeQuantity}`);
      } catch (error) {
        console.error(`Error during price fetching or parsing for ${symbol}:`, error);
        return; // Skip trading decision if price cannot be determined
      }

      if (currentPrice < buyPriceThreshold) {
    console.log(`Attempting to buy ${tradeQuantity} ${symbol} at ${currentPrice} (Threshold: < ${buyPriceThreshold})`);
    try {
      const buyOrderResponse = await market.placeBuyOrder(tradeQuantity);
      if (buyOrderResponse) {
        console.log('Buy order placed successfully:', buyOrderResponse);
      } else {
        console.log('Buy order failed or no response.');
      }
    } catch (error) {
      console.error('Error placing buy order:', error);
    }
  } else if (currentPrice > sellPriceThreshold) {
    console.log(`Attempting to sell ${tradeQuantity} ${symbol} at ${currentPrice} (Threshold: > ${sellPriceThreshold})`);
    try {
      const sellOrderResponse = await market.placeSellOrder(tradeQuantity);
      if (sellOrderResponse) {
        console.log('Sell order placed successfully:', sellOrderResponse);
      } else {
        console.log('Sell order failed or no response.');
      }
    } catch (error) {
      console.error('Error placing sell order:', error);
    }
  } else {
    console.log(`No action taken for ${symbol}. Price ${currentPrice} is between buy threshold ${buyPriceThreshold} and sell threshold ${sellPriceThreshold}.`);
  }
}

// account.getFundingWallet();
// market.getThickerData(client, symbol); // This method does not exist, getThicker24Hr is the correct one
account.getAccountData();
account.getFundingAssets();
  // Only run trading logic if environment variables were successfully loaded and parsed
  if (symbol && BUY_PRICE_THRESHOLD && SELL_PRICE_THRESHOLD && TRADE_QUANTITY &&
      !isNaN(parseFloat(BUY_PRICE_THRESHOLD)) && 
      !isNaN(parseFloat(SELL_PRICE_THRESHOLD)) && 
      !isNaN(parseFloat(TRADE_QUANTITY))) {
    runTradingLogic();
  }
}
