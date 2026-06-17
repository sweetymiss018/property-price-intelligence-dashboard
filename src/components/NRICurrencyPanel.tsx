"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { AreaData } from "@/data/areaData";
import {
  fetchCurrentRates, fetchHistoricalRates,
  ExchangeRates, HistoricalRate,
  inrToAED, inrToUSD,
  formatAED, formatUSD, formatINR,
  calcCurrencyMovement,
} from "@/lib/api/currency";
import { Globe, TrendingUp, TrendingDown, RefreshCw, Info } from "lucide-react";

// ── Apartment sizes for "what does it cost" examples ─────────────────────────
const EXAMPLE_SIZES = [
  { label: "1 BHK",  sqft: 650  },
  { label: "2 BHK",  sqft: 1100 },
  { label: "3 BHK",  sqft: 1600 },
  { label: "4 BHK+", sqft: 2400 },
];

// ── Currency toggle ────────────────────────────────────────────────────────────
type Currency = "AED" | "USD";

// ── Custom chart tooltip ──────────────────────────────────────────────────────
function ChartTooltip({
  active, payload, label, currency,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
  currency: Currency;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-2.5 text-xs">
      <p className="text-slate-400 font-medium mb-1">
        {label ? new Date(label).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : ""}
      </p>
      <p className="font-bold text-slate-800">
        1 INR = {currency === "AED"
          ? `${val?.toFixed(5)} AED`
          : `${val?.toFixed(5)} USD`}
      </p>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function CurrencyStat({
  label, value, sub, highlight,
}: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 border ${highlight
      ? "bg-emerald-50 border-emerald-200"
      : "bg-white border-slate-200"}`}
    >
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-xl font-bold ${highlight ? "text-emerald-700" : "text-slate-800"}`}>
        {value}
      </p>
      {sub && (
        <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface NRICurrencyPanelProps {
  prefillArea?: AreaData | null;
  allAreas: AreaData[];
}

export default function NRICurrencyPanel({
  prefillArea,
  allAreas,
}: NRICurrencyPanelProps) {
  const [rates, setRates]       = useState<ExchangeRates | null>(null);
  const [history, setHistory]   = useState<HistoricalRate[]>([]);
  const [loading, setLoading]   = useState(true);
  const [currency, setCurrency] = useState<Currency>("AED");
  const [selectedAreaId, setSelectedAreaId] = useState(
    prefillArea?.id ?? allAreas[0]?.id ?? ""
  );
  const [carpetSqft, setCarpetSqft] = useState(1200);

  const selectedArea = allAreas.find((a) => a.id === selectedAreaId) ?? allAreas[0];

  // Sync prefill from map click
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (prefillArea) setSelectedAreaId(prefillArea.id);
  }, [prefillArea?.id]);

  // Fetch rates on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const [r, h] = await Promise.all([
        fetchCurrentRates(),
        fetchHistoricalRates(),
      ]);
      setRates(r);
      setHistory(h);
      setLoading(false);
    }
    load();
  }, []);

  if (!selectedArea) return null;

  const psft = selectedArea.current_price_psft;
  const totalINR = psft * carpetSqft;

  // Currency values
  const psftAED = rates ? inrToAED(psft, rates.INR_to_AED) : null;
  const psftUSD = rates ? inrToUSD(psft, rates.INR_to_USD) : null;
  const totalAED = rates ? inrToAED(totalINR, rates.INR_to_AED) : null;
  const totalUSD = rates ? inrToUSD(totalINR, rates.INR_to_USD) : null;

  // Currency movement
  const { aedMovement, usdMovement } = calcCurrencyMovement(history);
  const movement = currency === "AED" ? aedMovement : usdMovement;

  // Effective appreciation = property appreciation adjusted for currency movement
  // If INR weakened vs AED, the property got cheaper in AED terms (negative for NRI)
  const effectiveAppreciation = parseFloat(
    (selectedArea.yoy_change_pct + movement).toFixed(1)
  );

  // Chart data — sample monthly (take every ~22nd entry for monthly)
  const chartData = history.filter((_, i) =>
    history.length <= 15 || i % Math.floor(history.length / 12) === 0
  ).slice(0, 13);

  const isMock = rates?.fetchedAt === "mock";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center shrink-0">
              <Globe size={17} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                NRI Currency Intelligence
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isMock
                  ? "Using reference rates (June 2026) · Add live data via Frankfurter API"
                  : `Live rates · Updated ${rates?.fetchedAt}`}
              </p>
            </div>
          </div>

          {/* Currency toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Show in:</span>
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
              {(["AED", "USD"] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    currency === c
                      ? "bg-white shadow-sm text-slate-800"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {c === "AED" ? "🇦🇪 AED" : "🇺🇸 USD"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Area + size selector row */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-40 space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Area
            </label>
            <select
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allAreas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-40 space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Property Size
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {EXAMPLE_SIZES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setCarpetSqft(s.sqft)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    carpetSqft === s.sqft
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {s.label}
                  <span className="text-[10px] ml-1 opacity-70">{s.sqft}sqft</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-slate-100 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}

        {/* Main content */}
        {!loading && rates && (
          <>
            {/* Exchange rate banner */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs text-blue-500 font-medium">Current Rate</p>
                <p className="text-base font-bold text-blue-900">
                  {currency === "AED"
                    ? `1 INR = ${rates.INR_to_AED.toFixed(5)} AED`
                    : `1 INR = ${rates.INR_to_USD.toFixed(5)} USD`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-500 font-medium">
                  12-Month Currency Move
                </p>
                <div className="flex items-center justify-end gap-1">
                  {movement >= 0
                    ? <TrendingUp size={14} className="text-emerald-600" />
                    : <TrendingDown size={14} className="text-red-500" />}
                  <p className={`text-base font-bold ${
                    movement >= 0 ? "text-emerald-700" : "text-red-600"
                  }`}>
                    {movement >= 0 ? "+" : ""}{movement}%
                  </p>
                </div>
                <p className="text-[10px] text-blue-400">
                  INR vs {currency}
                </p>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <CurrencyStat
                label={`Price/sqft in ${currency}`}
                value={currency === "AED"
                  ? `AED ${psftAED?.toLocaleString()}`
                  : `$${psftUSD?.toLocaleString()}`}
                sub={`₹${psft.toLocaleString("en-IN")}/sqft`}
              />
              <CurrencyStat
                label={`${carpetSqft} sqft apartment`}
                value={currency === "AED"
                  ? formatAED(totalAED ?? 0)
                  : formatUSD(totalUSD ?? 0)}
                sub={formatINR(totalINR)}
                highlight
              />
              <CurrencyStat
                label="INR Appreciation (YoY)"
                value={`+${selectedArea.yoy_change_pct}%`}
                sub="In Indian Rupee terms"
              />
              <CurrencyStat
                label={`Effective for ${currency === "AED" ? "UAE" : "US"} buyer`}
                value={`${effectiveAppreciation >= 0 ? "+" : ""}${effectiveAppreciation}%`}
                sub={`After ${movement >= 0 ? "+" : ""}${movement}% currency move`}
                highlight={effectiveAppreciation > 0}
              />
            </div>

            {/* "What does it cost" table */}
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between">
                <p className="text-xs font-semibold text-white">
                  What does a property in {selectedArea.name} cost?
                </p>
                <p className="text-[10px] text-slate-400">
                  At ₹{psft.toLocaleString("en-IN")}/sqft · {rates.fetchedAt === "mock" ? "Reference rates" : `Rates as of ${rates.fetchedAt}`}
                </p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Size</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Sqft</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">INR</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                      {currency === "AED" ? "🇦🇪 AED" : "🇺🇸 USD"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {EXAMPLE_SIZES.map((size, i) => {
                    const inr = psft * size.sqft;
                    const foreign = currency === "AED"
                      ? inrToAED(inr, rates.INR_to_AED)
                      : inrToUSD(inr, rates.INR_to_USD);
                    const isSelected = carpetSqft === size.sqft;
                    return (
                      <tr
                        key={size.label}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        } hover:bg-blue-50`}
                        onClick={() => setCarpetSqft(size.sqft)}
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                          {size.label}
                          {isSelected && (
                            <span className="ml-2 text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                              selected
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{size.sqft}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">
                          {formatINR(inr)}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-700">
                          {currency === "AED"
                            ? formatAED(foreign)
                            : formatUSD(foreign)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 12-month currency chart */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    12-Month INR / {currency} Movement
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {movement >= 0
                      ? `INR strengthened ${movement}% vs ${currency} — property got more expensive for ${currency === "AED" ? "UAE" : "US"} buyers`
                      : `INR weakened ${Math.abs(movement)}% vs ${currency} — property got cheaper for ${currency === "AED" ? "UAE" : "US"} buyers`}
                  </p>
                </div>
                {isMock && (
                  <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                    Reference data
                  </span>
                )}
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(d) =>
                      new Date(d).toLocaleDateString("en-IN", {
                        month: "short",
                      })
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      currency === "AED"
                        ? v.toFixed(4)
                        : v.toFixed(4)
                    }
                    width={52}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip currency={currency} />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey={currency === "AED" ? "INR_to_AED" : "INR_to_USD"}
                    stroke={currency === "AED" ? "#1d4ed8" : "#0f766e"}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "white" }}
                    animationDuration={600}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Effective appreciation explainer */}
            <div className="flex items-start gap-3 bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
              <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  What is &quot;effective appreciation&quot;?
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  A property in {selectedArea.name} appreciated{" "}
                  <span className="font-semibold text-slate-700">
                    +{selectedArea.yoy_change_pct}%
                  </span>{" "}
                  in INR. But INR moved{" "}
                  <span className={`font-semibold ${movement >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {movement >= 0 ? "+" : ""}{movement}%
                  </span>{" "}
                  vs {currency} over the same period. So for a{" "}
                  {currency === "AED" ? "UAE-based" : "US-based"} NRI buyer, the
                  effective appreciation is{" "}
                  <span className={`font-semibold ${effectiveAppreciation >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {effectiveAppreciation >= 0 ? "+" : ""}{effectiveAppreciation}%
                  </span>{" "}
                  in {currency} terms.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}