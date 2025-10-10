/*
 * BookTicker helper: fetch best bid/ask for multiple symbols at once
 * Uses public endpoint: GET /api/v3/ticker/bookTicker with symbols array
 */

export default class BookTicker {
  constructor(client) {
    if (!client || typeof client.publicRequest !== 'function') {
      throw new Error(
        'BookTicker requires a Binance Spot client with publicRequest().'
      );
    }
    this.client = client;
  }

  _chunk(arr, size = 100) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  /**
   * Fetch best bid/ask for multiple symbols.
   * @param {string[]} symbols - e.g. ['BTCUSDT','ETHUSDT','SOLUSDT']
   * @returns {Promise<Array<{ symbol: string, bidPrice: number, bidQty: number, askPrice: number, askQty: number }>>}
   */
  async getBookTickers(symbols) {
    if (!Array.isArray(symbols) || symbols.length === 0) {
      throw new Error(
        'getBookTickers: symbols must be a non-empty array of strings'
      );
    }

    // Normalize and dedupe
    const unique = Array.from(
      new Set(
        symbols
          .map((s) => (typeof s === 'string' ? s.trim().toUpperCase() : ''))
          .filter(Boolean)
      )
    );

    const results = [];
    const chunks = this._chunk(unique, 100);

    for (const chunk of chunks) {
      const params = { symbols: JSON.stringify(chunk) };
      try {
        const resp = await this.client.publicRequest(
          'GET',
          '/api/v3/ticker/bookTicker',
          params
        );
        let data = resp?.data;

        // API returns array for multiple symbols. If we ever get an object, normalize to array.
        if (!Array.isArray(data) && data && typeof data === 'object') {
          data = [data];
        }

        if (Array.isArray(data)) {
          for (const item of data) {
            const sym = item?.symbol;
            const bidPrice = Number(item?.bidPrice);
            const bidQty = Number(item?.bidQty);
            const askPrice = Number(item?.askPrice);
            const askQty = Number(item?.askQty);

            if (
              sym &&
              Number.isFinite(bidPrice) &&
              Number.isFinite(bidQty) &&
              Number.isFinite(askPrice) &&
              Number.isFinite(askQty)
            ) {
              results.push({ symbol: sym, bidPrice, bidQty, askPrice, askQty });
            }
          }
        }
      } catch (error) {
        console.error(
          'Error fetching bookTicker chunk:',
          error?.response?.data || error?.message || error
        );
      }
    }

    return results;
  }

  /**
   * Return a map: symbol -> { bidPrice, bidQty, askPrice, askQty }
   * @param {string[]} symbols
   * @returns {Promise<Record<string, { bidPrice: number, bidQty: number, askPrice: number, askQty: number }>>}
   */
  async getBookTickersMap(symbols) {
    const list = await this.getBookTickers(symbols);
    return Object.fromEntries(
      list.map((x) => [
        x.symbol,
        {
          bidPrice: x.bidPrice,
          bidQty: x.bidQty,
          askPrice: x.askPrice,
          askQty: x.askQty,
        },
      ])
    );
  }

  /**
   * Pretty-print book tickers.
   * @param {string[]} symbols
   */
  async logBookTickers(symbols) {
    const list = await this.getBookTickers(symbols);
    console.log('--- Book Tickers (best bid/ask) ---');
    console.log(JSON.stringify(list, null, 2));
    return list;
  }
}
