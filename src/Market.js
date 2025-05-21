/*
 * Market
 */

export default class Market {
  constructor(client, symbol) {
    this.client = client;
    this.symbol = symbol;
  }

  logThicker24Hr() {
    this.client
      .ticker24hr(this.symbol)
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error));
  }

  async getThicker24Hr() {
    try {
      const response = await this.client.ticker24hr(this.symbol);
      return response.data;
    } catch (error) {
      console.error(`Error fetching 24hr ticker for ${this.symbol}:`, error);
      return null;
    }
  }

  // Method to fetch the current price of the symbol
  logTickerPrice() {
    this.client
      .tickerPrice(this.symbol)
      .then((response) => {
        console.log(`Price for ${this.symbol}:`, response.data);
      })
      .catch((error) => {
        console.error(`Error fetching price for ${this.symbol}:`, error);
      });
  }

  async getTickerPrice() {
    try {
      const response = await this.client.tickerPrice(this.symbol);
      return response.data;
    } catch (error) {
      console.error(`Error fetching price for ${this.symbol}:`, error);
      return null;
    }
  }

  logDepth() {
    this.client
      .depth(this.symbol, { limit: 5 })
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error));
  }

  async getDepth() {
    try {
      const response = await this.client.depth(this.symbol, { limit: 5 });
      return response.data;
    } catch (error) {
      console.error(`Error fetching depth for ${this.symbol}:`, error);
      return null;
    }
  }

  async placeBuyOrder(quantity) {
    try {
      const response = await this.client.newOrder(this.symbol, 'BUY', 'MARKET', {
        quantity: quantity,
      });
      console.log(`Buy order placed for ${quantity} ${this.symbol}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error placing buy order for ${this.symbol}:`, error);
      return null;
    }
  }

  async placeSellOrder(quantity) {
    try {
      const response = await this.client.newOrder(this.symbol, 'SELL', 'MARKET', {
        quantity: quantity,
      });
      console.log(`Sell order placed for ${quantity} ${this.symbol}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error placing sell order for ${this.symbol}:`, error);
      return null;
    }
  }
}
