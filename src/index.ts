#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const USER_AGENT = "mcp-treasury/1.0.0";
const RATE_LIMIT_MS = 500;
let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<any> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed));
  }
  lastRequestTime = Date.now();

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Treasury API error: ${res.status} — ${body.slice(0, 500)}`);
  }
  return res.json();
}

const server = new McpServer({
  name: "mcp-treasury",
  version: "1.0.0",
});

// Treasury interest rates
server.tool(
  "get_treasury_rates",
  "Get daily Treasury yield curve rates (bill, note, bond rates).",
  {
    dateFrom: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("End date (YYYY-MM-DD)"),
    pageSize: z.number().min(1).max(1000).default(30),
  },
  async ({ dateFrom, dateTo, pageSize }) => {
    const params = new URLSearchParams({
      type: "daily_treasury_yield_curve",
      page_size: String(pageSize),
      sort: "-record_date",
      format: "json",
    });
    if (dateFrom) params.set("filter", `record_date:gte:${dateFrom}`);
    if (dateFrom && dateTo) params.set("filter", `record_date:gte:${dateFrom},record_date:lte:${dateTo}`);

    const data = await rateLimitedFetch(`https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?${params}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// National debt
server.tool(
  "get_national_debt",
  "Get the US national debt (total public debt outstanding).",
  {
    dateFrom: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("End date (YYYY-MM-DD)"),
    pageSize: z.number().min(1).max(1000).default(30),
  },
  async ({ dateFrom, dateTo, pageSize }) => {
    const params = new URLSearchParams({
      sort: "-record_date",
      page_size: String(pageSize),
      format: "json",
    });
    if (dateFrom && dateTo) {
      params.set("filter", `record_date:gte:${dateFrom},record_date:lte:${dateTo}`);
    } else if (dateFrom) {
      params.set("filter", `record_date:gte:${dateFrom}`);
    }

    const data = await rateLimitedFetch(`https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?${params}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// Treasury auctions
server.tool(
  "get_auction_results",
  "Get Treasury securities auction results (bills, notes, bonds, TIPS, FRN).",
  {
    securityType: z.enum(["Bill", "Note", "Bond", "TIPS", "FRN", "CMB"]).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    pageSize: z.number().min(1).max(100).default(20),
  },
  async ({ securityType, dateFrom, dateTo, pageSize }) => {
    const params = new URLSearchParams({
      sort: "-auction_date",
      page_size: String(pageSize),
      format: "json",
    });
    const filters: string[] = [];
    if (securityType) filters.push(`security_type:eq:${securityType}`);
    if (dateFrom) filters.push(`auction_date:gte:${dateFrom}`);
    if (dateTo) filters.push(`auction_date:lte:${dateTo}`);
    if (filters.length) params.set("filter", filters.join(","));

    const data = await rateLimitedFetch(`https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/auctions_query?${params}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// Exchange rates
server.tool(
  "get_exchange_rates",
  "Get Treasury-reported foreign exchange rates.",
  {
    currency: z.string().optional().describe("Currency name (e.g. 'Euro', 'Japanese Yen', 'British Pound')"),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    pageSize: z.number().min(1).max(1000).default(30),
  },
  async ({ currency, dateFrom, dateTo, pageSize }) => {
    const params = new URLSearchParams({
      sort: "-record_date",
      page_size: String(pageSize),
      format: "json",
    });
    const filters: string[] = [];
    if (currency) filters.push(`country_currency_desc:in:(${currency})`);
    if (dateFrom) filters.push(`record_date:gte:${dateFrom}`);
    if (dateTo) filters.push(`record_date:lte:${dateTo}`);
    if (filters.length) params.set("filter", filters.join(","));

    const data = await rateLimitedFetch(`https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange?${params}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// Federal spending
server.tool(
  "get_federal_spending",
  "Get monthly Treasury statement data on federal revenue and spending.",
  {
    fiscalYear: z.number().optional().describe("Fiscal year (e.g. 2025)"),
    pageSize: z.number().min(1).max(1000).default(50),
  },
  async ({ fiscalYear, pageSize }) => {
    const params = new URLSearchParams({
      sort: "-record_date",
      page_size: String(pageSize),
      format: "json",
    });
    if (fiscalYear) params.set("filter", `record_fiscal_year:eq:${fiscalYear}`);

    const data = await rateLimitedFetch(`https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5?${params}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
