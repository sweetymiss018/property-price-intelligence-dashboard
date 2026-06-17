"use client";

import { AreaData, MarketTemperature, getMarketTemperature } from "@/data/areaData";
import { TrendingUp, TrendingDown, Clock, Package, Zap, BarChart2 } from "lucide-react";

// ── Temperature config ────────────────────────────────────────────────────────
const TEMP_CONFIG: Record <MarketTemperature,{ label: string; emoji: string; bg: string; text: string; bar: string; description: string }> = {
  hot: {
    label: "Hot Market",
    emoji: "🔥",
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    bar: "bg-red-500",
    description: "High demand, low inventory. Prices rising fast. Act quickly.",
  },
  warm: {
    label: "Warm Market",
    emoji: "☀️",
    bg: "bg-orange-50 border-orange-200",
    text: "text-orange-700",
    bar: "bg-orange-400",
    description: "Strong buyer interest with reasonable inventory levels.",
  },
  balanced: {
    label: "Balanced Market",
    emoji: "⚖️",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    bar: "bg-blue-400",
    description: "Fair negotiation room for buyers. Stable price environment.",
  },
  cooling: {
    label: "Cooling Market",
    emoji: "❄️",
    bg: "bg-slate-50 border-slate-200",
    text: "text-slate-600",
    bar: "bg-slate-400",
    description: "Higher inventory and longer selling times. Buyer's market.",
  },
};

// ── Thermometer visual ────────────────────────────────────────────────────────
function Thermometer({ temperature }: { temperature: MarketTemperature }) {
  const levels: MarketTemperature[] = ["cooling", "balanced", "warm", "hot"];
  const activeIndex = levels.indexOf(temperature);
  const colors = ["bg-slate-400", "bg-blue-400", "bg-orange-400", "bg-red-500"];
  const labels = ["Cooling", "Balanced", "Warm", "Hot"];

  return (
    <div className="flex items-end gap-1.5 h-16">
      {levels.map((level, i) => {
        const isActive = i <= activeIndex;
        const isCurrent = i === activeIndex;
        return (
          <div key={level} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 rounded-sm transition-all duration-500 ${
                isActive ? colors[i] : "bg-slate-200"
              } ${isCurrent ? "ring-2 ring-offset-1 ring-slate-400" : ""}`}
              style={{ height: `${(i + 1) * 14}px` }}
            />
            <span
              className={`text-[9px] font-medium ${
                isCurrent ? "text-slate-800" : "text-slate-400"
              }`}
            >
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Stat item ─────────────────────────────────────────────────────────────────
function SignalStat({
  icon,
  label,
  value,
  sub,
  good,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  good: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
          {label}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-base font-bold text-slate-800">{value}</span>
          {good ? (
            <TrendingUp size={12} className="text-emerald-500" />
          ) : (
            <TrendingDown size={12} className="text-slate-400" />
          )}
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface DemandSignalProps {
  area: AreaData;
  compact?: boolean; // slim version for cards
}

export default function DemandSignal({ area, compact = false }: DemandSignalProps) {
  const temperature = getMarketTemperature(area);
  const config = TEMP_CONFIG[temperature];

  // Demand score 0–100 (for the bar)
  const demandScore = Math.min(
    100,
    Math.round(
      ((60 - Math.min(area.days_on_market_avg, 90)) / 60) * 40 +
        ((10 - Math.min(area.unsold_inventory_months, 10)) / 10) * 40 +
        (area.enquiries_per_listing / 30) * 20
    )
  );

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${config.bg} ${config.text}`}
      >
        <span>{config.emoji}</span>
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-5 ${config.bg}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} className={config.text} />
            <h4 className="text-sm font-bold text-slate-800">Demand Signal</h4>
          </div>
          <p className="text-xs text-slate-500">{area.name} · June 2026</p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white text-sm font-bold ${config.text}`}
        >
          <span>{config.emoji}</span>
          <span>{config.label}</span>
        </div>
      </div>

      {/* Thermometer + description */}
      <div className="flex items-end gap-6 mb-5">
        <Thermometer temperature={temperature} />
        <div className="flex-1">
          <p className="text-sm text-slate-600 leading-relaxed">{config.description}</p>
          {/* Demand score bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                Demand Intensity
              </span>
              <span className="text-xs font-bold text-slate-700">{demandScore}/100</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ${config.bar}`}
                style={{ width: `${demandScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Three signal stats */}
      <div className="grid grid-cols-3 gap-3">
        <SignalStat
          icon={<Clock size={15} className="text-slate-500" />}
          label="Days on Market"
          value={`${area.days_on_market_avg}d`}
          sub={
            area.days_on_market_avg < 40
              ? "Fast-moving"
              : area.days_on_market_avg < 60
              ? "Normal pace"
              : "Slow moving"
          }
          good={area.days_on_market_avg < 50}
        />
        <SignalStat
          icon={<Package size={15} className="text-slate-500" />}
          label="Inventory"
          value={`${area.unsold_inventory_months} mo`}
          sub={
            area.unsold_inventory_months < 4
              ? "Tight supply"
              : area.unsold_inventory_months < 7
              ? "Balanced"
              : "Oversupplied"
          }
          good={area.unsold_inventory_months < 5}
        />
        <SignalStat
          icon={<BarChart2 size={15} className="text-slate-500" />}
          label="Enquiries/Listing"
          value={`${area.enquiries_per_listing}`}
          sub={
            area.enquiries_per_listing > 20
              ? "Very high interest"
              : area.enquiries_per_listing > 12
              ? "Good interest"
              : "Below average"
          }
          good={area.enquiries_per_listing > 12}
        />
      </div>

      {/* New launches chip */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[10px] text-slate-400 font-medium">New launches last quarter:</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            area.new_launches_last_quarter > 15
              ? "bg-emerald-100 text-emerald-700"
              : area.new_launches_last_quarter > 8
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {area.new_launches_last_quarter} projects
        </span>
      </div>
    </div>
  );
}