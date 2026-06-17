"use client";

import { useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { AreaData, bangaloreAreas } from "@/data/areaData";
import { X, TrendingUp, TrendingDown, Plus, Star } from "lucide-react";

// ── One colour per area line ──────────────────────────────────────────────────
const AREA_COLORS: Record<string, string> = {
  whitefield: "#3b82f6",
  yelahanka: "#10b981",
  sarjapur: "#f59e0b",
  "electronic-city": "#8b5cf6",
  hebbal: "#ef4444",
  koramangala: "#ec4899",
  indiranagar: "#06b6d4",
  "hsr-layout": "#84cc16",
  devanahalli: "#f97316",
  bannerghatta: "#6366f1",
  kanakapura: "#14b8a6",
  marathahalli: "#e11d48",
};

// ── Merge quarterly data for multiple areas into one chart dataset ────────────
function buildChartData(areas: AreaData[]) {
  if (areas.length === 0) return [];
  const quarters = areas[0].quarterly_prices.map((q) => q.quarter);
  return quarters.map((quarter, i) => {
    const row: Record<string, string | number> = { quarter };
    areas.forEach((area) => {
      row[area.id] = area.quarterly_prices[i]?.price_psft ?? 0;
    });
    return row;
  });
}

// ── Find the quarter with the lowest price for primary area ───────────────────
function getBestBuyQuarter(area: AreaData): string {
  const sorted = [...area.quarterly_prices].sort(
    (a, b) => a.price_psft - b.price_psft
  );
  return sorted[0].quarter;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
interface CustomTooltipProps {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
  bestBuyQuarter: string;
}

function CustomTooltip({ active, payload, label, bestBuyQuarter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xl p-3 min-w-45">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        {label === bestBuyQuarter && (
          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1">
            <Star size={9} /> Best Buy
          </span>
        )}
      </div>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-6 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-slate-600 truncate max-w-25">
              {bangaloreAreas.find((a) => a.id === entry.name)?.name ?? entry.name}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-800">
            ₹{entry.value.toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface AreaTrendChartProps {
  primaryArea: AreaData;
  onClose: () => void;
}

export default function AreaTrendChart({ primaryArea, onClose }: AreaTrendChartProps) {
  const [comparedAreas, setComparedAreas] = useState<AreaData[]>([primaryArea]);
  const [propertyType, setPropertyType] = useState<"apartment" | "villa" | "plot">("apartment");
  const [showAddMenu, setShowAddMenu] = useState(false);

  const bestBuyQuarter = getBestBuyQuarter(primaryArea);
  const chartData = buildChartData(comparedAreas);

  // Areas available to add (not already in comparison, supports this property type)
  const availableToAdd = bangaloreAreas.filter(
    (a) =>
      !comparedAreas.find((c) => c.id === a.id) &&
      a.property_types_available.includes(propertyType)
  );

  const addArea = useCallback((area: AreaData) => {
    if (comparedAreas.length >= 4) return;
    setComparedAreas((prev) => [...prev, area]);
    setShowAddMenu(false);
  }, [comparedAreas]);

  const removeArea = useCallback((areaId: string) => {
    if (areaId === primaryArea.id) return; // can't remove primary
    setComparedAreas((prev) => prev.filter((a) => a.id !== areaId));
  }, [primaryArea.id]);

  // Stats for primary area
  const firstPrice = primaryArea.quarterly_prices[0].price_psft;
  const lastPrice = primaryArea.quarterly_prices[primaryArea.quarterly_prices.length - 1].price_psft;
  const totalGrowth = (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden animate-slideUp">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-800">{primaryArea.name}</h3>
            <span
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                primaryArea.yoy_change_pct >= 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {primaryArea.yoy_change_pct >= 0 ? (
                <TrendingUp size={11} />
              ) : (
                <TrendingDown size={11} />
              )}
              {primaryArea.yoy_change_pct >= 0 ? "+" : ""}
              {primaryArea.yoy_change_pct}% YoY
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Price trend · Last 8 quarters
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Stat pills ─────────────────────────────────────────────────────── */}
      <div className="flex gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100 flex-wrap">
        <StatPill label="Current ₹/sqft" value={`₹${primaryArea.current_price_psft.toLocaleString("en-IN")}`} />
        <StatPill label="2-Year Growth" value={`+${totalGrowth}%`} highlight />
        <StatPill label="Rental Yield" value={`${primaryArea.rental_yield_pct}%`} />
        <StatPill label="Connectivity" value={`${primaryArea.connectivity_score}/10`} />
      </div>

      {/* ── Controls row ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 gap-4 flex-wrap">
        {/* Property type toggle */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(["apartment", "villa", "plot"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setPropertyType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                propertyType === type
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Area comparison pills + add */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Comparing:</span>
          {comparedAreas.map((area) => (
            <div
              key={area.id}
              className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: AREA_COLORS[area.id] }}
            >
              {area.name}
              {area.id !== primaryArea.id && (
                <button
                  onClick={() => removeArea(area.id)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          ))}

          {/* Add area button */}
          {comparedAreas.length < 4 && (
            <div className="relative">
              <button
                onClick={() => setShowAddMenu((v) => !v)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors"
              >
                <Plus size={11} /> Add area
              </button>

              {showAddMenu && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-50 min-w-45 py-1 max-h-52 overflow-y-auto">
                  {availableToAdd.length === 0 ? (
                    <p className="text-xs text-slate-400 px-3 py-2">No more areas to add</p>
                  ) : (
                    availableToAdd.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => addArea(area)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: AREA_COLORS[area.id] }}
                        />
                        {area.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Chart ──────────────────────────────────────────────────────────── */}
      <div className="px-5 pb-5">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="quarter"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              width={48}
            />
            <Tooltip content={<CustomTooltip bestBuyQuarter={bestBuyQuarter} />} />
            <Legend
              formatter={(value) =>
                bangaloreAreas.find((a) => a.id === value)?.name ?? value
              }
              wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
            />

            {/* Best time to buy — vertical reference line */}
            <ReferenceLine
              x={bestBuyQuarter}
              stroke="#10b981"
              strokeDasharray="4 3"
              strokeWidth={2}
              label={{
                value: "★ Best Buy",
                position: "top",
                fontSize: 10,
                fill: "#10b981",
                fontWeight: 600,
              }}
            />

            {comparedAreas.map((area) => (
              <Line
                key={area.id}
                type="monotone"
                dataKey={area.id}
                stroke={AREA_COLORS[area.id]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: AREA_COLORS[area.id], strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
                animationDuration={600}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Small stat pill ───────────────────────────────────────────────────────────
function StatPill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`px-3 py-1.5 rounded-lg ${highlight ? "bg-emerald-50" : "bg-white border border-slate-200"}`}>
      <p className="text-[10px] text-slate-500 font-medium">{label}</p>
      <p className={`text-sm font-bold ${highlight ? "text-emerald-700" : "text-slate-800"}`}>
        {value}
      </p>
    </div>
  );
}