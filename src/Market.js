/*
 * Market
 */

export default class Market {
  constructor(client, symbol) {
    this.client = client;
    this.symbol = symbol;
  }

  getThickerData() {
    this.client
      .ticker24hr(this.symbol)
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error));
  }
}
