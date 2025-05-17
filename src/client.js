/*
 * Client
 */

import { isDevelopment, configuration } from './configuration/index.js';
import { Spot } from '@binance/connector';

export default new Spot(
  configuration.apiKey,
  configuration.apiSecret,
  isDevelopment ? { baseURL: configuration.baseURL } : {}
);
