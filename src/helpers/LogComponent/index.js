/*
 * Log info
 */

import { config } from 'dotenv';
import Log from './Log.js';
import { configuration, isDevelopment } from '../../configuration/index.js';
config();

const log = new Log();

export default function logEnvInfo() {
  if (isDevelopment) {
    log.logWarning(`Environment: ${process.env.NODE_ENV}`);
  } else {
    log.logSuccess(`Environment: ${process.env.NODE_ENV}`);
  }

  // console.log('Configuration: ', configuration);
  console.log('');
}
