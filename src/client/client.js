/*
 * Client
 */

import { Spot } from '@binance/connector';
import { IS_DEVELOPMENT } from '../constants/index.js';
import configuration from '../configuration/index.js';

export default new Spot(
  configuration.apiKey,
  configuration.apiSecret,
  IS_DEVELOPMENT ? { baseURL: configuration.baseURL } : {}
);
