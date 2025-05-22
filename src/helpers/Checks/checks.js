/*
 * Checks
 */
import {
  SYMBOL,
  BUY_PRICE_THRESHOLD,
  SELL_PRICE_THRESHOLD,
  TRADE_QUANTITY,
} from '../../constants/index.js';

export function checkTradeVariables() {
  if (!SYMBOL) {
    console.error('Error: SYMBOL environment variable is not set.');
    return false;
  }
  if (isNaN(BUY_PRICE_THRESHOLD)) {
    console.error('Error: BUY_PRICE_THRESHOLD is not a valid number.');
    return false;
  }
  if (isNaN(SELL_PRICE_THRESHOLD)) {
    console.error('Error: SELL_PRICE_THRESHOLD is not a valid number.');
    return false;
  }
  if (isNaN(TRADE_QUANTITY)) {
    console.error('Error: TRADE_QUANTITY is not a valid number.');
    return false;
  }
  return true;
}
