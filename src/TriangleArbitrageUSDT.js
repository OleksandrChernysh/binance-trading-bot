/*
 * TriangleArbitrageUSDT: check USDT -> X -> Y -> USDT routes
 * Uses only pairs: BTCUSDT, ETHUSDT, SOLUSDT
 * Data source: /api/v3/ticker/bookTicker (best bid/ask)
 * Fee is applied to every executed trade (4 times per full cycle)
 */

import BookTicker from './BookTicker.js';

export default class TriangleArbitrageUSDT {
  /**
   * @param {object} client - @binance/connector Spot client
   * @param {object} [opts]
   * @param {number} [opts.feeRate=0.001] - taker fee per trade (0.001 = 0.1%)
   */
  constructor(client, { feeRate = 0.001 } = {}) {
    if (!client)
      throw new Error('TriangleArbitrageUSDT: Binance Spot client is required');
    this.client = client;
    this.feeRate = feeRate;
  }

  _needSymbols(cryptos) {
    return cryptos.map((a) => `${a}USDT`);
  }

  _getAsk(bookMap, asset) {
    const sym = `${asset}USDT`;
    return Number(bookMap[sym]?.askPrice);
  }

  _getBid(bookMap, asset) {
    const sym = `${asset}USDT`;
    return Number(bookMap[sym]?.bidPrice);
  }

  _isFinitePos(n) {
    return Number.isFinite(n) && n > 0;
  }

  /**
   * Evaluate a single path: USDT -> A -> B -> USDT
   * Trade model:
   * 1) USDT -> A at ask(AUSDT)  (buy, -fee)
   * 2) A -> USDT at bid(AUSDT)  (sell, -fee)
   * 3) USDT -> B at ask(BUSDT)  (buy, -fee)
   * 4) B -> USDT at bid(BUSDT)  (sell, -fee)
   */
  _evalPath(bookMap, startUsdt, A, B) {
    const fee = 1 - this.feeRate;

    const askA = this._getAsk(bookMap, A);
    const bidA = this._getBid(bookMap, A);
    const askB = this._getAsk(bookMap, B);
    const bidB = this._getBid(bookMap, B);

    if (![askA, bidA, askB, bidB].every(this._isFinitePos)) {
      return {
        path: ['USDT', A, B, 'USDT'],
        valid: false,
        reason: 'No valid bid/ask found for one of the pairs',
      };
    }

    // 1) USDT -> A (buy at askA)
    const qtyA = (startUsdt / askA) * fee;

    // 2) A -> USDT (sell at bidA)
    const usdtAfterA = qtyA * bidA * fee;

    // 3) USDT -> B (buy at askB)
    const qtyB = (usdtAfterA / askB) * fee;

    // 4) B -> USDT (sell at bidB)
    const endUsdt = qtyB * bidB * fee;

    const profit = endUsdt - startUsdt;
    const profitPct = (profit / startUsdt) * 100;

    return {
      path: ['USDT', A, B, 'USDT'],
      valid: true,
      startUsdt,
      endUsdt,
      profit,
      profitPct,
      steps: [
        { action: 'BUY', symbol: `${A}USDT`, price: askA, from: 'USDT', to: A },
        {
          action: 'SELL',
          symbol: `${A}USDT`,
          price: bidA,
          from: A,
          to: 'USDT',
        },
        { action: 'BUY', symbol: `${B}USDT`, price: askB, from: 'USDT', to: B },
        {
          action: 'SELL',
          symbol: `${B}USDT`,
          price: bidB,
          from: B,
          to: 'USDT',
        },
      ],
    };
  }

  /**
   * Check all 6 routes for three cryptocurrencies (e.g. ['BTC','ETH','SOL'])
   * @param {string[]} cryptos - exactly 3 crypto assets without 'USDT' (e.g. ['BTC','ETH','SOL'])
   * @param {number} [startingUsdt=100] - starting amount in USDT
   */
  async checkAllPaths(cryptos = ['BTC', 'ETH', 'SOL'], startingUsdt = 100) {
    if (!Array.isArray(cryptos) || cryptos.length !== 3) {
      throw new Error(
        'Exactly 3 assets are expected, e.g. ["BTC","ETH","SOL"]'
      );
    }
    const [X, Y, Z] = cryptos.map((s) => s.trim().toUpperCase());

    // Fetch best bid/ask for all required USDT pairs
    const symbols = this._needSymbols([X, Y, Z]);
    const book = new BookTicker(this.client);
    const bookMap = await book.getBookTickersMap(symbols);

    // 6 routes: USDT -> X -> Y -> USDT and all permutations
    const results = [];
    results.push(this._evalPath(bookMap, startingUsdt, X, Y));
    results.push(this._evalPath(bookMap, startingUsdt, X, Z));
    results.push(this._evalPath(bookMap, startingUsdt, Y, X));
    results.push(this._evalPath(bookMap, startingUsdt, Y, Z));
    results.push(this._evalPath(bookMap, startingUsdt, Z, X));
    results.push(this._evalPath(bookMap, startingUsdt, Z, Y));
    return results;
  }

  async logOpportunities(cryptos = ['BTC', 'ETH', 'SOL'], startingUsdt = 100) {
    const res = await this.checkAllPaths(cryptos, startingUsdt);
    console.log('--- Triangle Arbitrage (USDT-only) ---');
    for (const r of res) {
      const label = r.path.join(' -> ');
      if (!r.valid) {
        console.log(`${label}: invalid (${r.reason})`);
        continue;
      }
      console.log(
        `${label}: start=${r.startUsdt} end=${r.endUsdt.toFixed(8)} profit=${r.profit.toFixed(8)} (${r.profitPct.toFixed(5)}%)`
      );
      for (const s of r.steps) {
        console.log(`  ${s.action} ${s.symbol} @ ${s.price}`);
      }
    }
    return res;
  }
}
