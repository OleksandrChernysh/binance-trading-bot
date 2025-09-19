# Binance Trading Bot

A small Node.js trading bot that uses the official Binance connector. This README explains how to install, configure environment variables (including Testnet keys), and run the project.

## Requirements

- Node.js (v16+ recommended)
- npm
- A Binance API Key & Secret for production (MAIN)
- A Binance Testnet API Key & Secret for development/testing (TEST)

## Install

Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd binance-trading-bot
npm install
```

## Environment setup

Copy the example env file:
Edit .env and add your keys and settings.
Example .env.example (already included in repo):

```
MAIN_API_KEY =
MAIN_API_SECRET =

TEST_API_KEY =
TEST_API_SECRET =

SYMBOL=BTCUSDT
BUY_PRICE_THRESHOLD=100000
SELL_PRICE_THRESHOLD=108000
TRADE_QUANTITY=0.001
```

## Notes:

- When NODE*ENV is set to development (see npm run dev below), the app will use the Binance Spot Testnet base URL and the TEST*\_ keys.

- When NODE*ENV is production (see npm run main below), the app will use the MAIN*\_ keys for live trading.

Start in development mode (uses Testnet keys / base URL):

```
npm run dev
```

Start in production mode (uses live Binance):

```
npm run main
```

Lint:

```
npm run lint
```
