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
}
