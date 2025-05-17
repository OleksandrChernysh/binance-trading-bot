/*
 * ClientWrapper
 */

import fs from 'fs';

export default class ClientWrapper {
  constructor(client) {
    this.client = client;
    this.filePath = './src/helpers/ClientWrapper/client-methods.md';
  }

  getAllMethodNames() {
    const methods = new Set();
    let obj = this.client;

    while (obj) {
      Object.getOwnPropertyNames(obj)
        .filter((prop) => typeof obj[prop] === 'function')
        .forEach((method) => methods.add(method));
      obj = Object.getPrototypeOf(obj);
    }

    return Array.from(methods).sort(); // Alphabetically sorted
  }

  writeAllMethodNamesToFile() {
    const methods = this.getAllMethodNames();
    fs.writeFileSync(this.filePath, methods.join('\n'), 'utf8');
    console.log(`✅ Methods written to ${this.filePath}`);
  }
}
