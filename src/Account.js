/*
 * Account class
 */

export default class Account {
  constructor(client) {
    this.client = client;
  }

  getAccountData() {
    this.client
      .account()
      .then((response) => console.log('Account data: ', response.data))
      .catch((error) => console.error('Error: ', error));
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

      console.log('--- Selected Funding Wallet Assets ---');
      console.log(JSON.stringify(results, null, 2));
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
