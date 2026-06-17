"use client";

import { useState, useMemo } from "react";
import { bangaloreAreas, AreaData } from "@/data/areaData";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  TrendingUp,
  Plus,
  X,
  Award,
  Home,
  Globe,
} from "lucide-react";

// ── Pattem Score: composite 0–100 ────────────────────────────────────────────
// Weights: YoY growth 30% · rental yield 25% · connectivity 20% · infra 15% · affordability 10%
function computePattemScore(area: AreaData): number {
  const allAreas = bangaloreAreas;
  const maxYoY = Math.max(...allAreas.map((a) => a.yoy_change_pct));
  const maxYield = Math.max(...allAreas.map((a) => a.rental_yield_pct));
  const maxPrice = Math.max(...allAreas.map((a) => a.current_price_psft));
  const minPrice = Math.min(...allAreas.map((a) => a.current_price_psft));

  const yoyScore = (area.yoy_change_pct / maxYoY) * 30;
  const yieldScore = (area.rental_yield_pct / maxYield) * 25;
  const connectivityScore = (area.connectivity_score / 10) * 20;
  const infraScore = (area.infrastructure_score / 10) * 15;
  // Affordability: cheaper = higher score
  const affordabilityScore =
    ((maxPrice - area.current_price_psft) / (maxPrice - minPrice)) * 10;

  return parseFloat(
    (yoyScore + yieldScore + connectivityScore + infraScore + affordabilityScore).toFixed(1)
  );
}

// ── Badge logic ───────────────────────────────────────────────────────────────
function getBadges(area: AreaData, score: number, allScored: { id: string; score: number }[]) {
  const badges: { label: string; type: "investment" | "enduse" | "nri" }[] = [];
  const rank = allScored.findIndex((a) => a.id === area.id) + 1;

  // Best for investment: top YoY + yield
  if (area.yoy_change_pct >= 14 || area.rental_yield_pct >= 4.5) {
    badges.push({ label: "Best for Investment", type: "investment" });
  }

  // Best for end use: high connectivity + infra
  if (area.connectivity_score >= 9 && area.infrastructure_score >= 9) {
    badges.push({ label: "Best for End Use", type: "enduse" });
  }

  // Best for NRI: high yield + strong appreciation + good infra
  if (area.rental_yield_pct >= 3.8 && area.yoy_change_pct >= 12 && rank <= 4) {
    badges.push({ label: "Best for NRI", type: "nri" });
  }

  return badges;
}

// ── Sort types ────────────────────────────────────────────────────────────────
type SortKey =
  | "name"
  | "current_price_psft"
  | "yoy_change_pct"
  | "rental_yield_pct"
  | "connectivity_score"
  | "infrastructure_score"
  | "pattem_score";

type SortDir = "asc" | "desc";

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color =
    pct >= 80 ? "#10b981" : pct >= 60 ? "#3b82f6" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-6 text-right">{value}</span>
    </div>
  );
}

// ── Pattem score ring ─────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 70 ? "#10b981" : score >= 55 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {score}
    </div>
  );
}

// ── Sort header button ────────────────────────────────────────────────────────
function SortHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = currentKey === sortKey;
  return (
    <th
      className={`px-4 py-3 text-left cursor-pointer select-none group ${className ?? ""}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span
          className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
            active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
          }`}
        >
          {label}
        </span>
        <span className="text-slate-300">
          {active ? (
            currentDir === "asc" ? (
              <ChevronUp size={13} className="text-blue-500" />
            ) : (
              <ChevronDown size={13} className="text-blue-500" />
            )
          ) : (
            <ChevronsUpDown size={13} />
          )}
        </span>
      </div>
    </th>
  );
}

// ── Area selector dropdown ────────────────────────────────────────────────────
interface AreaSelectorProps {
  selected: AreaData[];
  onAdd: (area: AreaData) => void;
  onRemove: (id: string) => void;
}

function AreaSelector({ selected, onAdd, onRemove }: AreaSelectorProps) {
  const [open, setOpen] = useState(false);
  const available = bangaloreAreas.filter(
    (a) => !selected.find((s) => s.id === a.id)
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {selected.map((area) => (
        <div
          key={area.id}
          className="flex items-center gap-1.5 bg-slate-800 text-white text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full"
        >
          {area.name}
          <button
            onClick={() => onRemove(area.id)}
            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      ))}

      {selected.length < 5 && available.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 border border-dashed border-blue-300 px-2.5 py-1 rounded-full hover:bg-blue-50 transition-colors"
          >
            <Plus size={12} /> Add area
          </button>
          {open && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-52 py-1 max-h-60 overflow-y-auto">
              {available.map((area) => (
                <button
                  key={area.id}
                  onClick={() => { onAdd(area); setOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>{area.name}</span>
                  <span className="text-xs text-slate-400">
                    ₹{(area.current_price_psft / 1000).toFixed(0)}k/sqft
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface AreaComparisonTableProps {
  highlightAreaId?: string | null;
}

export default function AreaComparisonTable({ highlightAreaId }: AreaComparisonTableProps) {
  // Default: top 5 by Pattem score
  const defaultAreas = useMemo(() => {
    return [...bangaloreAreas]
      .sort((a, b) => computePattemScore(b) - computePattemScore(a))
      .slice(0, 5);
  }, []);

  const [selectedAreas, setSelectedAreas] = useState<AreaData[]>(defaultAreas);
  const [sortKey, setSortKey] = useState<SortKey>("pattem_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pre-compute Pattem scores for all areas (for badge ranking)
  const allScored = useMemo(() =>
    bangaloreAreas
      .map((a) => ({ id: a.id, score: computePattemScore(a) }))
      .sort((a, b) => b.score - a.score),
    []
  );

  // Scored + badged rows
  const rows = useMemo(() => {
    return selectedAreas.map((area) => {
      const score = computePattemScore(area);
      const badges = getBadges(area, score, allScored);
      return { area, score, badges };
    });
  }, [selectedAreas, allScored]);

  // Sorted rows
  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      if (sortKey === "name") {
        aVal = a.area.name;
        bVal = b.area.name;
      } else if (sortKey === "pattem_score") {
        aVal = a.score;
        bVal = b.score;
      } else {
        aVal = a.area[sortKey] as number;
        bVal = b.area[sortKey] as number;
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function addArea(area: AreaData) {
    setSelectedAreas((prev) => [...prev, area]);
  }

  function removeArea(id: string) {
    if (selectedAreas.length <= 2) return; // keep at least 2
    setSelectedAreas((prev) => prev.filter((a) => a.id !== id));
  }

  const badgeConfig = {
    investment: {
      icon: <TrendingUp size={10} />,
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    enduse: {
      icon: <Home size={10} />,
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    nri: {
      icon: <Globe size={10} />,
      className: "bg-purple-100 text-purple-700 border-purple-200",
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award size={18} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-800">Area Comparison</h3>
            </div>
            <p className="text-xs text-slate-400">
              Click any column header to sort · Add up to 5 areas · Pattem Score is a weighted composite index
            </p>
          </div>
          <AreaSelector
            selected={selectedAreas}
            onAdd={addArea}
            onRemove={removeArea}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-225">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <SortHeader label="Area" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="min-w-40" />
              <SortHeader label="₹/sqft" sortKey="current_price_psft" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="YoY %" sortKey="yoy_change_pct" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="Rental Yield" sortKey="rental_yield_pct" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="Connectivity" sortKey="connectivity_score" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="Infrastructure" sortKey="infrastructure_score" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortHeader label="Pattem Score" sortKey="pattem_score" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Badges
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {sorted.map(({ area, score, badges }, idx) => {
              const isHighlighted = area.id === highlightAreaId;
              const isTop = idx === 0;

              return (
                <tr
                  key={area.id}
                  className={`transition-colors ${
                    isHighlighted
                      ? "bg-blue-50"
                      : isTop
                      ? "bg-emerald-50/40"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {/* Area name */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {isTop && (
                        <span className="w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                          1
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {area.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{area.city}</p>
                      </div>
                    </div>
                  </td>

                  {/* Price per sqft */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-slate-800">
                      ₹{area.current_price_psft.toLocaleString("en-IN")}
                    </p>
                  </td>

                  {/* YoY */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full ${
                        area.yoy_change_pct >= 15
                          ? "bg-emerald-100 text-emerald-700"
                          : area.yoy_change_pct >= 10
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <TrendingUp size={11} />+{area.yoy_change_pct}%
                    </span>
                  </td>

                  {/* Rental yield */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-slate-700">
                      {area.rental_yield_pct}%
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Net {(area.rental_yield_pct * 0.85).toFixed(2)}%
                    </p>
                  </td>

                  {/* Connectivity */}
                  <td className="px-4 py-4 min-w-30">
                    <ScoreBar value={area.connectivity_score} />
                  </td>

                  {/* Infrastructure */}
                  <td className="px-4 py-4 min-w-30">
                    <ScoreBar value={area.infrastructure_score} />
                  </td>

                  {/* Pattem Score */}
                  <td className="px-4 py-4">
                    <ScoreRing score={score} />
                  </td>

                  {/* Badges */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      {badges.length === 0 ? (
                        <span className="text-xs text-slate-300">—</span>
                      ) : (
                        badges.map((badge) => (
                          <span
                            key={badge.label}
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border w-fit ${
                              badgeConfig[badge.type].className
                            }`}
                          >
                            {badgeConfig[badge.type].icon}
                            {badge.label}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer — legend */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-6 flex-wrap">
        <p className="text-[11px] text-slate-400 font-medium">Pattem Score breakdown:</p>
        {[
          { label: "YoY Growth", weight: "30%" },
          { label: "Rental Yield", weight: "25%" },
          { label: "Connectivity", weight: "20%" },
          { label: "Infrastructure", weight: "15%" },
          { label: "Affordability", weight: "10%" },
        ].map(({ label, weight }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500">{label}</span>
            <span className="text-[11px] font-bold text-slate-700">{weight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}