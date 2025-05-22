/*
 * Log info
 */

import { config } from 'dotenv';
import { IS_DEVELOPMENT } from '../../constants/index.js';
import configuration from '../../configuration/index.js';
import Log from './Log.js';
config();

const log = new Log();

export default function logEnvInfo() {
  if (IS_DEVELOPMENT) {
    log.logWarning(`Environment: ${process.env.NODE_ENV}`);
  } else {
    log.logSuccess(`Environment: ${process.env.NODE_ENV}`);
  }

  // console.log('Configuration: ', configuration);
  console.log('');
}
