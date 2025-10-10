import { logEnvInfo } from './helpers/LogComponent/index.js';
import { checkTradeVariables } from './helpers/Checks/index.js';
import client from './client/index.js';
import Prices from './Prices.js';
import BookTicker from './BookTicker.js';
import TriangleArbitrage from './TriangleArbitrage.js';
import TriangleArbitrageUSDT from './TriangleArbitrageUSDT.js';

logEnvInfo();
checkTradeVariables();

const checkTradeVariablesResult = checkTradeVariables();
if (!checkTradeVariablesResult) {
  console.error(
    'Error: One or more environment variables are not set correctly. Trading logic will not run.'
  );
  process.exit(1);
}

// Add this block to fetch multiple symbols at once:
(async () => {
  const prices = new Prices(client);
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']; // customize
  await prices.logTickerPrices(symbols);

  // Or get as a map:
  // const priceMap = await prices.getTickerPricesMap(symbols);
  // console.log(priceMap);
})();

// Add this block to fetch best bid/ask for the same symbols:
(async () => {
  const bookTicker = new BookTicker(client);
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']; // customize
  await bookTicker.logBookTickers(symbols);

  // Or as a map:
  // const bookMap = await bookTicker.getBookTickersMap(symbols);
  // console.log(bookMap.BTCUSDT.bidPrice, bookMap.BTCUSDT.askPrice);
})();

// Triangle arbitrage between BTC/ETH/USDT
(async () => {
  const tri = new TriangleArbitrage(client, { feeRate: 0.001 }); // 0.1% taker fee, adjust as needed
  const assets = ['BTC', 'ETH', 'USDT'];
  await tri.logOpportunities(assets, 1); // starting with 1 BTC (in this example)
})();

// Triangle arbitrage between BTC/ETH/SOL through USDT
(async () => {
  const tri = new TriangleArbitrageUSDT(client, { feeRate: 0.001 }); // 0.1% taker fee
  const cryptos = ['BTC', 'ETH', 'SOL']; // cryptocurrencies without 'USDT'
  await tri.logOpportunities(cryptos, 100); // starting with 100 USDT
})();
