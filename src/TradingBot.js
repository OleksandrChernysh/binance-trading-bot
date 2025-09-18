/*
 *
 */

export default class TradingBot {
  constructor(symbol, buyThreshold, sellThreshold, tradeQuantity, market) {
    this.symbol = symbol;
    this.buyThreshold = buyThreshold;
    this.sellThreshold = sellThreshold;
    this.tradeQuantity = tradeQuantity;
    this.market = market;
  }

  async init() {
    let tradeCount = 0;
    const maxTrades = 5;

    const tradeLoop = async () => {
      while (tradeCount < maxTrades) {
        console.log(`Trade attempt ${tradeCount + 1} of ${maxTrades}`);
        await this.trade();

        tradeCount++;
        if (tradeCount < maxTrades) {
          console.log(`Sleeping for 5 seconds before the next trade...`);
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Sleep for 5 seconds
        }
      }
      console.log('Trading session completed.');
    };

    tradeLoop();
  }

  async getPriceFromMarket() {
    let currentPrice;
    try {
      console.log(`Fetching price for ${this.symbol}...`);
      const ticker = await this.market.getTickerPrice();

      if (!ticker || typeof ticker.price !== 'string') {
        console.error(
          `Could not fetch ticker price for ${this.symbol}, or price is not a string. Response:`,
          ticker
        );
        return;
      }

      currentPrice = parseFloat(ticker.price);

      if (isNaN(currentPrice)) {
        console.error(
          `Error parsing fetched price for ${this.symbol}. Price string was: "${ticker.price}".`
        );
        return;
      }

      console.log(`Current price for ${this.symbol}: ${currentPrice}`);

      return currentPrice;
    } catch (error) {
      console.error(
        `Error during price fetching or parsing for ${this.symbol}:`,
        error
      );
      return;
    }
  }

  async buy() {
    const currentPrice = await this.getPriceFromMarket();

    console.log(
      `Attempting to buy ${this.tradeQuantity} ${this.symbol} at ${currentPrice} (Threshold: < ${this.buyThreshold})`
    );
    try {
      const buyOrderResponse = await this.market.placeBuyOrder(
        this.tradeQuantity
      );
      if (buyOrderResponse) {
        console.log('Buy order placed successfully:', buyOrderResponse);
      } else {
        console.log('Buy order failed or no response.');
      }
    } catch (error) {
      console.error('Error placing buy order:', error);
    }
  }

  async sell() {
    const currentPrice = await this.getPriceFromMarket();

    console.log(
      `Attempting to sell ${this.tradeQuantity} ${this.symbol} at ${currentPrice} (Threshold: > ${this.sellThreshold})`
    );
    try {
      const sellOrderResponse = await this.market.placeSellOrder(
        this.tradeQuantity
      );
      if (sellOrderResponse) {
        console.log('Sell order placed successfully:', sellOrderResponse);
      } else {
        console.log('Sell order failed or no response.');
      }
    } catch (error) {
      console.error('Error placing sell order:', error);
    }
  }

  async trade() {
    const currentPrice = await this.getPriceFromMarket();

    if (currentPrice < this.buyThreshold) {
      await this.buy();
    } else if (currentPrice > this.sellThreshold) {
      await this.sell();
    } else {
      console.log(
        `No action taken for ${this.symbol}. Price ${currentPrice} is between buy threshold ${this.buyThreshold} and sell threshold ${this.sellThreshold}.`
      );
    }
  }
}
