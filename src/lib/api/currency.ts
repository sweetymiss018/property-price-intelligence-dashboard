const BASE = "https://api.frankfurter.dev/v2";

export interface ExchangeRates {
  INR_to_AED: number;
  INR_to_USD: number;
  fetchedAt: string;
}

export interface HistoricalRate {
  date: string;
  INR_to_AED: number;
  INR_to_USD: number;
}

// ── Mock fallback rates (June 2026 approximate) ───────────────────────────────
const MOCK_RATES: ExchangeRates = {
  INR_to_AED: 0.04372,
  INR_to_USD: 0.01190,
  fetchedAt: "mock",
};

// Build 12 months of mock history with slight drift
function getMockHistory(): HistoricalRate[] {
  const history: HistoricalRate[] = [];
  const now = new Date("2026-06-01");

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const label = d.toISOString().slice(0, 10);

    // Simulate INR weakening slightly over the year
    const drift = i * 0.00008;
    history.push({
      date: label,
      INR_to_AED: parseFloat((0.04372 - drift + (Math.random() - 0.5) * 0.001).toFixed(5)),
      INR_to_USD: parseFloat((0.0119  - drift * 0.3 + (Math.random() - 0.5) * 0.0003).toFixed(5)),
    });
  }
  return history;
}

// ── Live fetch ────────────────────────────────────────────────────────────────
export async function fetchCurrentRates(): Promise<ExchangeRates> {
  try {
    // Frankfurter base currency is AED — get how many AED per 1 unit of each
    // We want INR→AED and INR→USD
    // Fetch: 1 INR = ? AED, ? USD
    const res = await fetch(
      `${BASE}/latest?base=INR&symbols=AED,USD`,
      { next: { revalidate: 3600 } } // cache 1 hour
    );
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return {
      INR_to_AED: data.rates.AED,
      INR_to_USD: data.rates.USD,
      fetchedAt: data.date,
    };
  } catch {
    return MOCK_RATES;
  }
}

export async function fetchHistoricalRates(): Promise<HistoricalRate[]> {
  try {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);

    const startStr = start.toISOString().slice(0, 10);
    const endStr   = end.toISOString().slice(0, 10);

    const res = await fetch(
      `${BASE}/${startStr}..${endStr}?base=INR&symbols=AED,USD`,
      { next: { revalidate: 86400 } } // cache 24 hours
    );
    if (!res.ok) throw new Error("fetch failed");

    const data = await res.json();
    // data.rates is { "2025-06-01": { AED: 0.044, USD: 0.012 }, ... }
    return Object.entries(data.rates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, rates]) => ({
        date,
        INR_to_AED: (rates as Record<string, number>).AED,
        INR_to_USD: (rates as Record<string, number>).USD,
      }));
  } catch {
    return getMockHistory();
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function inrToAED(inr: number, rate: number): number {
  return Math.round(inr * rate);
}

export function inrToUSD(inr: number, rate: number): number {
  return Math.round(inr * rate);
}

export function formatAED(v: number): string {
  if (v >= 1_000_000) return `AED ${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `AED ${(v / 1_000).toFixed(0)}K`;
  return `AED ${v.toLocaleString()}`;
}

export function formatUSD(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
}

export function formatINR(v: number): string {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(2)} Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

// Currency movement: how much has INR changed vs AED over the period
export function calcCurrencyMovement(history: HistoricalRate[]): {
  aedMovement: number; // % change INR/AED over 12 months
  usdMovement: number;
} {
  if (history.length < 2) return { aedMovement: 0, usdMovement: 0 };
  const first = history[0];
  const last  = history[history.length - 1];
  return {
    aedMovement: parseFloat((((last.INR_to_AED - first.INR_to_AED) / first.INR_to_AED) * 100).toFixed(2)),
    usdMovement: parseFloat((((last.INR_to_USD - first.INR_to_USD) / first.INR_to_USD) * 100).toFixed(2)),
  };
}