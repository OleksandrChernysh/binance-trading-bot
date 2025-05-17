/*
 * Configuration
 */

import { config } from 'dotenv';
import { SPOT_REST_API_TESTNET_URL } from '@binance/spot';
config();

export const isDevelopment = process.env.NODE_ENV === 'development';

export const configuration = {
  apiKey: isDevelopment ? process.env.TEST_API_KEY : process.env.MAIN_API_KEY,
  apiSecret: isDevelopment
    ? process.env.TEST_API_SECRET
    : process.env.MAIN_API_SECRET,
  baseURL: isDevelopment ? SPOT_REST_API_TESTNET_URL : undefined,
};
