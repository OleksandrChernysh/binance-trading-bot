/*
 * Prices helper: fetch ticker prices for multiple symbols at once
 */

export default class Prices {
  constructor(client) {
    if (!client || typeof client.publicRequest !== 'function') {
      throw new Error(
        'Prices requires a Binance Spot client with publicRequest().'
      );
    }
    this.client = client;
  }

  // internal: simple chunker to avoid very long query strings for huge lists
  _chunk(arr, size = 100) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get ticker prices for multiple symbols.
   * @param {string[]} symbols - e.g. ['BTCUSDT','ETHUSDT','SOLUSDT']
   * @returns {Promise<Array<{ symbol: string, price: number }>>}
   */
  async getTickerPrices(symbols) {
    if (!Array.isArray(symbols) || symbols.length === 0) {
      throw new Error(
        'getTickerPrices: symbols must be a non-empty array of strings'
      );
    }

    // Normalize and de-duplicate
    const unique = Array.from(
      new Set(
        symbols
          .map((s) => (typeof s === 'string' ? s.trim().toUpperCase() : ''))
          .filter(Boolean)
      )
    );

    const chunks = this._chunk(unique, 100); // conservative chunk size
    const results = [];

    for (const chunk of chunks) {
      const params = { symbols: JSON.stringify(chunk) };
      try {
        const resp = await this.client.publicRequest(
          'GET',
          '/api/v3/ticker/price',
          params
        );
        const data = resp?.data;
        if (Array.isArray(data)) {
          for (const item of data) {
            // Binance returns price as string; convert to number
            const sym = item?.symbol;
            const priceNum = Number(item?.price);
            if (sym && Number.isFinite(priceNum)) {
              results.push({ symbol: sym, price: priceNum });
            }
          }
        }
      } catch (error) {
        console.error(
          'Error fetching ticker prices chunk:',
          error?.response?.data || error?.message || error
        );
      }
    }

    return results;
  }

  /**
   * Get a map of symbol -> price for convenience.
   * @param {string[]} symbols
   * @returns {Promise<Record<string, number>>}
   */
  async getTickerPricesMap(symbols) {
    const list = await this.getTickerPrices(symbols);
    return Object.fromEntries(list.map((x) => [x.symbol, x.price]));
  }

  /**
   * Pretty-print prices.
   * @param {string[]} symbols
   */
  async logTickerPrices(symbols) {
    const list = await this.getTickerPrices(symbols);
    console.log('--- Ticker Prices ---');
    console.log(JSON.stringify(list, null, 2));
    return list;
  }
}
