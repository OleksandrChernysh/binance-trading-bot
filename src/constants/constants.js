/*
 * Constants
 */

import { config } from 'dotenv';
config();

export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const TEST_API_KEY = process.env.TEST_API_KEY;
export const TEST_API_SECRET = process.env.TEST_API_SECRET;
export const MAIN_API_KEY = process.env.MAIN_API_KEY;
export const MAIN_API_SECRET = process.env.MAIN_API_SECRET;
export const SYMBOL = process.env.SYMBOL;
export const TRADE_QUANTITY = parseFloat(process.env.TRADE_QUANTITY);
export const BUY_PRICE_THRESHOLD = parseFloat(process.env.BUY_PRICE_THRESHOLD);
export const SELL_PRICE_THRESHOLD = parseFloat(
  process.env.SELL_PRICE_THRESHOLD
);
