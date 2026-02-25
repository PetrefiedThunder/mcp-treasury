# mcp-treasury

MCP server for [US Treasury Fiscal Data API](https://fiscaldata.treasury.gov/api-documentation/). National debt, interest rates, auctions, exchange rates, federal spending. No API key required.

## Tools

| Tool | Description |
|------|-------------|
| `get_treasury_rates` | Daily Treasury yield curve rates |
| `get_national_debt` | Total public debt outstanding |
| `get_auction_results` | Treasury securities auction results |
| `get_exchange_rates` | Treasury foreign exchange rates |
| `get_federal_spending` | Monthly federal revenue and spending |

## Install

```bash
npm install
npm run build
```

## Usage with Claude Desktop

```json
{
  "mcpServers": {
    "treasury": {
      "command": "node",
      "args": ["/path/to/mcp-treasury/dist/index.js"]
    }
  }
}
```

## No API Key Required

The Treasury Fiscal Data API is free and open. No authentication needed.

## License

MIT
