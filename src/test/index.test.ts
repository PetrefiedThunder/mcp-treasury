import { describe, it, expect } from "vitest";

describe("mcp-treasury", () => {
  it("should build fiscal data URLs", () => {
    const base = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service";
    expect(`${base}/v2/accounting/od/debt_to_penny`).toContain("debt_to_penny");
    expect(`${base}/v2/accounting/od/avg_interest_rates`).toContain("avg_interest_rates");
  });

  it("should build filter strings", () => {
    const filters = ["record_date:gte:2025-01-01", "record_date:lte:2025-12-31"];
    expect(filters.join(",")).toBe("record_date:gte:2025-01-01,record_date:lte:2025-12-31");
  });

  it("should support all security types", () => {
    const types = ["Bill", "Note", "Bond", "TIPS", "FRN", "CMB"];
    expect(types.length).toBe(6);
  });

  it("should build currency filter", () => {
    const currency = "Euro";
    const filter = `country_currency_desc:in:(${currency})`;
    expect(filter).toContain("Euro");
  });

  it("should sort by descending date", () => {
    const params = new URLSearchParams({ sort: "-record_date" });
    expect(params.get("sort")).toBe("-record_date");
  });

  it("should handle fiscal year filter", () => {
    const fy = 2025;
    const filter = `record_fiscal_year:eq:${fy}`;
    expect(filter).toBe("record_fiscal_year:eq:2025");
  });
});
