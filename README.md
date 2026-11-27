# mcp-treasury

Access US Treasury data — debt, interest rates, spending, and auction results.

> **Free API** — No API key required.

## Tools

| Tool | Description |
|------|-------------|
| `get_treasury_rates` | Get daily Treasury yield curve rates (bill, note, bond rates). |
| `get_national_debt` | Get the US national debt (total public debt outstanding). |
| `get_auction_results` | Get Treasury securities auction results (bills, notes, bonds, TIPS, FRN). |
| `get_exchange_rates` | Get Treasury-reported foreign exchange rates. |
| `get_federal_spending` | Get monthly Treasury statement data on federal revenue and spending. |

## Installation

```bash
git clone https://github.com/PetrefiedThunder/mcp-treasury.git
cd mcp-treasury
npm install
npm run build
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

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

## Usage with npx

```bash
npx mcp-treasury
```

## License

Apache-2.0
