/*
 * Account class
 */

export default class Account {
  constructor(client) {
    this.client = client;
  }

  async logAccountData() {
    try {
      const accountData = await this.getAccountData();
      console.log('--- Account Data ---');
      console.log(JSON.stringify(accountData, null, 2));
    } catch (error) {
      console.error(
        'Error logging account data:',
        error?.response?.data || error.message
      );
    }
  }

  async getAccountData() {
    try {
      const response = await this.client.account();
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching account data:',
        error?.response?.data || error.message
      );
      return null;
    }
  }

  async logFundingAssets(assets = ['USDT', 'BTC', 'SOL']) {
    try {
      const fundingAssets = await this.getFundingAssets(assets);
      console.log('--- Selected Funding Wallet Assets ---');
      console.log(JSON.stringify(fundingAssets, null, 2));
    } catch (error) {
      console.error(
        'Error logging funding wallet assets:',
        error?.response?.data || error.message
      );
    }
  }

  async getFundingAssets(assets = ['USDT', 'BTC', 'SOL']) {
    try {
      const results = [];
      for (const asset of assets) {
        const response = await this.client.fundingWallet({ asset });
        if (Array.isArray(response.data) && response.data.length > 0) {
          results.push(response.data[0]);
        }
      }
      return results;
    } catch (error) {
      console.error(
        'Error fetching funding wallet assets:',
        error?.response?.data || error.message
      );
      return [];
    }
  }
}
