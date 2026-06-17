"use client";

import { useState, useMemo } from "react";
import { bangaloreAreas, AreaData } from "@/data/areaData";
import { estimatePropertyValue, AVMParams, AVMResult } from "@/lib/calculations/avm";
import {
  Home,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Info,
  ChevronDown,
  BarChart2,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatINR(v: number): string {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(2)} Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

function formatINRShort(v: number): string {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)} Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(0)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

// ── Confidence gauge ──────────────────────────────────────────────────────────
function ConfidenceGauge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80 ? "#10b981"
    : score >= 65 ? "#f59e0b"
    : "#ef4444";

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle
            cx="44" cy="44" r={radius}
            fill="none" stroke="#e2e8f0" strokeWidth="8"
          />
          <circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-800">{score}</span>
          <span className="text-[9px] text-slate-400 font-medium">/ 100</span>
        </div>
      </div>
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: `${color}20`,
          color,
        }}
      >
        {label} Confidence
      </span>
      <p className="text-[10px] text-slate-400 text-center max-w-25">
        {score >= 80
          ? "Strong comparable data"
          : score >= 65
          ? "Moderate data available"
          : "Limited comparables"}
      </p>
    </div>
  );
}

// ── Adjustment bar ────────────────────────────────────────────────────────────
function AdjustmentBar({
  label,
  factor,
  impact,
}: {
  label: string;
  factor: number;
  impact: number;
}) {
  const isPositive = factor > 1;
  const pct = Math.abs((factor - 1) * 100).toFixed(1);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-32 shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              isPositive ? "bg-emerald-400" : "bg-red-400"
            }`}
            style={{ width: `${Math.min(Math.abs((factor - 1) * 100) * 8, 100)}%` }}
          />
        </div>
        <span
          className={`text-xs font-semibold w-10 text-right ${
            isPositive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {isPositive ? "+" : ""}{pct}%
        </span>
        <span
          className={`text-xs w-20 text-right ${
            isPositive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {isPositive ? "+" : ""}{formatINRShort(impact)}
        </span>
      </div>
    </div>
  );
}

// ── Select input ──────────────────────────────────────────────────────────────
function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

// ── Number input ──────────────────────────────────────────────────────────────
function NumberField({
  label,
  value,
  min,
  max,
  unit,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 pr-14"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
          {unit}
        </span>
      </div>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface AVMWidgetProps {
  prefillArea?: AreaData | null;
}

export default function AVMWidget({ prefillArea }: AVMWidgetProps) {
  const defaultArea = prefillArea ?? bangaloreAreas[0];

  const [areaId, setAreaId]           = useState(defaultArea.id);
  const [propertyType, setPropertyType] = useState<"apartment" | "villa">("apartment");
  const [bhk, setBhk]                 = useState<1 | 2 | 3 | 4>(3);
  const [floor, setFloor]             = useState<"low" | "mid" | "high">("mid");
  const [buildingAge, setBuildingAge] = useState(3);
  const [carpetArea, setCarpetArea]   = useState(1200);
  const [amenities, setAmenities]     = useState<"basic" | "standard" | "premium">("standard");
  const [showAdjustments, setShowAdjustments] = useState(false);

  const selectedArea = bangaloreAreas.find((a) => a.id === areaId) ?? bangaloreAreas[0];

  const params: AVMParams = {
    areaId,
    propertyType,
    bhk,
    floor,
    buildingAge,
    carpetArea,
    amenitiesQuality: amenities,
  };

  const result: AVMResult = useMemo(
    () => estimatePropertyValue(params, selectedArea),
    [areaId, propertyType, bhk, floor, buildingAge, carpetArea, amenities]
  );

  const areaOptions = bangaloreAreas.map((a) => ({ value: a.id, label: a.name }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Home size={17} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Property Valuation Estimator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              AVM — Automated Valuation Model · Based on {result.dataPoints.toLocaleString()} comparable transactions
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

        {/* ── Left: Inputs ─────────────────────────────────────────────────── */}
        <div className="p-6 space-y-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Property Details
          </h4>

          <SelectField
            label="Area"
            value={areaId}
            options={areaOptions}
            onChange={setAreaId}
          />

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Property Type"
              value={propertyType}
              options={[
                { value: "apartment", label: "Apartment" },
                { value: "villa",     label: "Villa" },
              ]}
              onChange={setPropertyType}
            />
            <SelectField
              label="BHK"
              value={String(bhk) as "1" | "2" | "3" | "4"}
              options={[
                { value: "1", label: "1 BHK" },
                { value: "2", label: "2 BHK" },
                { value: "3", label: "3 BHK" },
                { value: "4", label: "4 BHK+" },
              ]}
              onChange={(v) => setBhk(Number(v) as 1 | 2 | 3 | 4)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Floor Level"
              value={floor}
              options={[
                { value: "low",  label: "Low (1–4)" },
                { value: "mid",  label: "Mid (5–12)" },
                { value: "high", label: "High (13+)" },
              ]}
              onChange={setFloor}
            />
            <SelectField
              label="Amenities"
              value={amenities}
              options={[
                { value: "basic",    label: "Basic" },
                { value: "standard", label: "Standard" },
                { value: "premium",  label: "Premium" },
              ]}
              onChange={setAmenities}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Carpet Area"
              value={carpetArea}
              min={300}
              max={8000}
              unit="sqft"
              onChange={setCarpetArea}
              hint="Enter carpet area (not super area)"
            />
            <NumberField
              label="Building Age"
              value={buildingAge}
              min={0}
              max={40}
              unit="years"
              onChange={setBuildingAge}
              hint="0 for new launch / under construction"
            />
          </div>

          {/* Area reference price */}
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2.5">
            <BarChart2 size={14} className="text-indigo-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-indigo-700">
                {selectedArea.name} base price: ₹{selectedArea.current_price_psft.toLocaleString("en-IN")}/sqft
              </p>
              <p className="text-[10px] text-indigo-400 mt-0.5">
                YoY +{selectedArea.yoy_change_pct}% · {selectedArea.new_launches_last_quarter} launches last quarter
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: Output ─────────────────────────────────────────────────── */}
        <div className="p-6 flex flex-col gap-5">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Estimated Value
          </h4>

          {/* Main value display */}
          <div className="bg-linear-to-br from-indigo-600 to-indigo-800 rounded-xl p-5 text-white">
            <p className="text-xs font-medium text-indigo-300 mb-1">Estimated Market Value</p>
            <p className="text-4xl font-bold tracking-tight">
              {formatINR(result.estimatedValue)}
            </p>
            <p className="text-sm text-indigo-300 mt-1">
              Range: {formatINRShort(result.rangeMin)} – {formatINRShort(result.rangeMax)}
            </p>

            {/* Range bar */}
            <div className="mt-3 relative">
              <div className="h-1.5 bg-indigo-500 rounded-full">
                <div
                  className="absolute h-3 w-3 bg-white rounded-full -top-0.75 border-2 border-indigo-600"
                  style={{
                    left: `${((result.estimatedValue - result.rangeMin) /
                      (result.rangeMax - result.rangeMin)) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-indigo-300">
                  {formatINRShort(result.rangeMin)}
                </span>
                <span className="text-[10px] text-indigo-300">
                  {formatINRShort(result.rangeMax)}
                </span>
              </div>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium mb-1">Price/sqft</p>
              <p className="text-sm font-bold text-slate-800">
                ₹{result.pricePerSqft.toLocaleString("en-IN")}
              </p>
            </div>
            <div
              className={`rounded-lg p-3 text-center border ${
                result.vsAreaAverage > 0
                  ? "bg-emerald-50 border-emerald-100"
                  : result.vsAreaAverage < 0
                  ? "bg-red-50 border-red-100"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <p className="text-[10px] text-slate-400 font-medium mb-1">vs Area Avg</p>
              <div className="flex items-center justify-center gap-0.5">
                {result.vsAreaAverage > 0 ? (
                  <TrendingUp size={12} className="text-emerald-600" />
                ) : result.vsAreaAverage < 0 ? (
                  <TrendingDown size={12} className="text-red-500" />
                ) : null}
                <p
                  className={`text-sm font-bold ${
                    result.vsAreaAverage > 0
                      ? "text-emerald-700"
                      : result.vsAreaAverage < 0
                      ? "text-red-600"
                      : "text-slate-700"
                  }`}
                >
                  {result.vsAreaAverage > 0 ? "+" : ""}
                  {result.vsAreaAverage}%
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium mb-1">Carpet Area</p>
              <p className="text-sm font-bold text-slate-800">{carpetArea} sqft</p>
            </div>
          </div>

          {/* Confidence gauge */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl border border-slate-100 px-5 py-4">
            <ConfidenceGauge
              score={result.confidenceScore}
              label={result.confidenceLabel}
            />
            <div className="flex-1 pl-5">
              <div className="flex items-center gap-1.5 mb-2">
                <ShieldCheck size={14} className="text-slate-500" />
                <p className="text-xs font-semibold text-slate-700">
                  Valuation Basis
                </p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Based on{" "}
                <span className="font-semibold text-slate-700">
                  {result.dataPoints.toLocaleString()}
                </span>{" "}
                comparable transactions in {selectedArea.name} over the last 6 months.
              </p>
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                Area avg: ₹{result.areaAvgPsft.toLocaleString("en-IN")}/sqft ·
                Your estimate: ₹{result.pricePerSqft.toLocaleString("en-IN")}/sqft
              </p>
            </div>
          </div>

          {/* Adjustments toggle */}
          {result.adjustments.length > 0 && (
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowAdjustments((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600">
                    How this value was calculated
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${
                    showAdjustments ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showAdjustments && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wide border-b border-slate-100 pb-2">
                    <span>Factor</span>
                    <div className="flex gap-12 pr-1">
                      <span>Impact</span>
                      <span>Value</span>
                    </div>
                  </div>

                  {/* Base price row */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-32 shrink-0">
                      Base (area avg)
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                        <div className="h-full w-1/2 bg-slate-300 rounded-full" />
                      </div>
                      <span className="text-xs text-slate-500 w-10 text-right">—</span>
                      <span className="text-xs font-semibold text-slate-700 w-20 text-right">
                        ₹{result.areaAvgPsft.toLocaleString("en-IN")}/sqft
                      </span>
                    </div>
                  </div>

                  {result.adjustments.map((adj) => (
                    <AdjustmentBar
                      key={adj.label}
                      label={adj.label}
                      factor={adj.factor}
                      impact={adj.impact}
                    />
                  ))}

                  {/* Final */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Final Estimate
                    </span>
                    <span className="text-sm font-bold text-indigo-700">
                      {formatINR(result.estimatedValue)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
            ⚠️ This is an algorithmic estimate based on available market data. Actual value
            may vary. Get a professional valuation before transacting. Data sourced from
            NHB RESIDEX, 99acres, and Pattem Estates transaction records (June 2026).
          </p>
        </div>
      </div>
    </div>
  );
}