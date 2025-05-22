/*
 * Configuration
 */

import { SPOT_REST_API_TESTNET_URL } from '@binance/spot';
import {
  IS_DEVELOPMENT,
  MAIN_API_KEY,
  MAIN_API_SECRET,
  TEST_API_KEY,
  TEST_API_SECRET,
} from '../constants/index.js';

export default {
  apiKey: IS_DEVELOPMENT ? TEST_API_KEY : MAIN_API_KEY,
  apiSecret: IS_DEVELOPMENT ? TEST_API_SECRET : MAIN_API_SECRET,
  baseURL: IS_DEVELOPMENT ? SPOT_REST_API_TESTNET_URL : undefined,
};
