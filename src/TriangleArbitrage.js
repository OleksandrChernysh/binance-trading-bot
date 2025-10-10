/*
 * TriangleArbitrage: checks A->B->C->A and A->C->B->A cycles
 * - Discovers available symbols via exchangeInfo
 * - Fetches best bid/ask for needed pairs via BookTicker
 * - Uses correct side/price per direction and applies taker fee
 */

import BookTicker from './BookTicker.js';

export default class TriangleArbitrage {
  /**
   * @param {object} client - @binance/connector Spot client
   * @param {object} [opts]
   * @param {number} [opts.feeRate=0.001] - taker fee per trade (0.001 = 0.1%)
   */
  constructor(client, { feeRate = 0.001 } = {}) {
    if (!client || typeof client.exchangeInfo !== 'function') {
      throw new Error(
        'TriangleArbitrage requires a Binance Spot client with exchangeInfo().'
      );
    }
    this.client = client;
    this.feeRate = feeRate;
    this._exchange = null; // cache of exchangeInfo
    this._symbolByBaseQuote = null; // map "<BASE><QUOTE>" -> { symbol, base, quote }
    this._metaBySymbol = null; // map "SYMBOL" -> { base, quote }
  }

  async _loadExchangeInfo() {
    if (this._exchange) return;
    const resp = await this.client.exchangeInfo();
    const data = resp?.data;
    if (!data || !Array.isArray(data.symbols)) {
      throw new Error('exchangeInfo returned unexpected payload');
    }
    this._exchange = data;
    this._symbolByBaseQuote = {};
    this._metaBySymbol = {};
    for (const s of data.symbols) {
      const base = s.baseAsset;
      const quote = s.quoteAsset;
      const symbol = s.symbol;
      this._symbolByBaseQuote[`${base}${quote}`] = { symbol, base, quote };
      this._metaBySymbol[symbol] = { base, quote };
    }
  }

  _getSymbolFor(base, quote) {
    return this._symbolByBaseQuote[`${base}${quote}`]?.symbol;
  }

  /**
   * For assets like ['BTC','ETH','USDT'], find all existing pair symbols among them.
   * Includes both directions when available (e.g., ETHBTC and BTCETH if they exist).
   */
  async _getRequiredSymbols(assets) {
    await this._loadExchangeInfo();
    const out = new Set();
    for (let i = 0; i < assets.length; i++) {
      for (let j = 0; j < assets.length; j++) {
        if (i === j) continue;
        const base = assets[i];
        const quote = assets[j];
        const sym = this._getSymbolFor(base, quote);
        if (sym) out.add(sym);
      }
    }
    return Array.from(out);
  }

  /**
   * Convert an amount from one asset to another using top-of-book and taker fee.
   * - If pair from/to exists (FROM is base, TO is quote), we SELL FROM -> receive TO at bid.
   * - Else if pair to/from exists (TO is base, FROM is quote), we BUY TO using FROM at ask.
   * Returns { amount, step } or null if neither pair exists or book missing.
   */
  _convert(amount, from, to, bookMap) {
    // Try direct: FROM/TO (sell FROM -> get TO) using bid
    const directSymbol = this._getSymbolFor(from, to);
    if (directSymbol && bookMap[directSymbol]) {
      const { bidPrice } = bookMap[directSymbol];
      const price = Number(bidPrice);
      if (Number.isFinite(price) && price > 0) {
        const received = amount * price * (1 - this.feeRate);
        return {
          amount: received,
          step: {
            side: 'SELL',
            symbol: directSymbol,
            from,
            to,
            usedPrice: price,
          },
        };
      }
    }

    // Try inverse: TO/FROM (buy TO with FROM) using ask
    const inverseSymbol = this._getSymbolFor(to, from);
    if (inverseSymbol && bookMap[inverseSymbol]) {
      const { askPrice } = bookMap[inverseSymbol];
      const price = Number(askPrice);
      if (Number.isFinite(price) && price > 0) {
        const received = (amount / price) * (1 - this.feeRate);
        return {
          amount: received,
          step: {
            side: 'BUY',
            symbol: inverseSymbol,
            from,
            to,
            usedPrice: price,
          },
        };
      }
    }

    return null;
  }

  /**
   * Evaluate a specific path like ['BTC','ETH','USDT','BTC']
   */
  _evalPath(path, bookMap) {
    const steps = [];
    let amt = 1; // normalized starting amount (1 unit of path[0])
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const res = this._convert(amt, from, to, bookMap);
      if (!res) {
        return { valid: false, reason: `No route ${from} -> ${to}`, steps };
      }
      amt = res.amount;
      steps.push(res.step);
    }
    return {
      valid: true,
      endAmount: amt,
      profit: amt - 1,
      profitPct: (amt - 1) * 100,
      steps,
    };
  }

  /**
   * Check both triangle cycles for the given assets.
   * @param {string[]} assets - e.g. ['BTC','ETH','USDT']
   * @param {number} [startingAmount=1] - Scale results to a specific starting amount (in units of assets[0])
   * @returns {Promise<Array<{ path: string[], valid: boolean, profitPct?: number, endAmount?: number, steps?: any[], reason?: string }>>}
   */
  async checkPaths(assets, startingAmount = 1) {
    if (!Array.isArray(assets) || assets.length !== 3) {
      throw new Error(
        'checkPaths requires exactly 3 assets, e.g. ["BTC","ETH","USDT"]'
      );
    }
    const [A, B, C] = assets.map((s) => s.toUpperCase().trim());

    // Gather all required pair symbols among these assets and fetch book tickers
    const symbols = await this._getRequiredSymbols([A, B, C]);
    if (symbols.length === 0) {
      return [
        {
          path: [A, B, C, A],
          valid: false,
          reason: 'No trading pairs found among assets',
        },
      ];
    }

    // Fetch book tickers (best bid/ask) as a map by symbol
    const book = new BookTicker(this.client);
    const bookMap = await book.getBookTickersMap(symbols);

    // Evaluate both cycles (A->B->C->A and A->C->B->A)
    const p1 = this._evalPath([A, B, C, A], bookMap);
    const p2 = this._evalPath([A, C, B, A], bookMap);

    // Scale to desired startingAmount (multiplying endAmount and profit)
    const scale = (res) => {
      if (!res.valid) return res;
      const factor = startingAmount;
      return {
        ...res,
        endAmount: res.endAmount * factor,
        profit: res.profit * factor,
        profitPct: res.profitPct, // unchanged
      };
    };

    return [
      { path: [A, B, C, A], ...scale(p1) },
      { path: [A, C, B, A], ...scale(p2) },
    ];
  }

  /**
   * Convenience logger
   */
  async logOpportunities(assets, startingAmount = 1) {
    const results = await this.checkPaths(assets, startingAmount);
    console.log('--- Triangle Arbitrage Check ---');
    for (const r of results) {
      const label = r.path.join(' -> ');
      if (!r.valid) {
        console.log(`${label}: invalid (${r.reason})`);
        continue;
      }
      console.log(
        `${label}: end=${r.endAmount.toFixed(10)} (start=${startingAmount}) profit=${r.profit.toFixed(10)} (${r.profitPct.toFixed(5)}%)`
      );
      for (const s of r.steps) {
        console.log(`  ${s.side} via ${s.symbol} @ ${s.usedPrice}`);
      }
    }
    return results;
  }
}
