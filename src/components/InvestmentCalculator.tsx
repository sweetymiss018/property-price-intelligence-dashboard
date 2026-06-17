"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { AreaData } from "@/data/areaData";
import { TrendingUp, IndianRupee, Calendar, Percent, Info } from "lucide-react";

// ── Financial logic ───────────────────────────────────────────────────────────

interface CalcInputs {
  propertyPrice: number;      // ₹
  downPaymentPct: number;     // %
  monthlyRent: number;        // ₹/month
  holdingYears: number;       // years
  appreciationPct: number;    // % per year (from area data)
}

interface YearlyReturn {
  year: number;
  propertyValue: number;
  cumulativeRent: number;
  totalReturn: number;        // capital gain + rent - maintenance
  roi: number;                // % return on initial investment
}

interface CalcResult {
  downPayment: number;
  loanAmount: number;
  grossRentalYield: number;
  netRentalYield: number;
  totalRentCollected: number;
  finalPropertyValue: number;
  capitalGain: number;
  totalReturn: number;
  totalROI: number;
  breakEvenYear: number;
  yearlyData: YearlyReturn[];
}

function calculate(inputs: CalcInputs): CalcResult {
  const {
    propertyPrice,
    downPaymentPct,
    monthlyRent,
    holdingYears,
    appreciationPct,
  } = inputs;

  const downPayment = (propertyPrice * downPaymentPct) / 100;
  const loanAmount = propertyPrice - downPayment;

  // Yields
  const annualRent = monthlyRent * 12;
  const grossRentalYield = (annualRent / propertyPrice) * 100;
  const netRentalYield = grossRentalYield * 0.85; // 15% maintenance deduction

  const netAnnualRent = annualRent * 0.85;

  // Year-by-year
  const yearlyData: YearlyReturn[] = [];
  let cumulativeRent = 0;

  for (let year = 1; year <= holdingYears; year++) {
    const propertyValue =
      propertyPrice * Math.pow(1 + appreciationPct / 100, year);
    cumulativeRent += netAnnualRent;
    const capitalGainSoFar = propertyValue - propertyPrice;
    const totalReturn = capitalGainSoFar + cumulativeRent;
    const roi = (totalReturn / downPayment) * 100;

    yearlyData.push({
      year,
      propertyValue: Math.round(propertyValue),
      cumulativeRent: Math.round(cumulativeRent),
      totalReturn: Math.round(totalReturn),
      roi: parseFloat(roi.toFixed(1)),
    });
  }

  const finalPropertyValue =
    propertyPrice * Math.pow(1 + appreciationPct / 100, holdingYears);
  const capitalGain = finalPropertyValue - propertyPrice;
  const totalRentCollected = netAnnualRent * holdingYears;
  const totalReturn = capitalGain + totalRentCollected;
  const totalROI = (totalReturn / downPayment) * 100;

  // Break-even: first year where cumulative return covers down payment
  const breakEvenYear =
    yearlyData.find((y) => y.totalReturn >= downPayment)?.year ?? holdingYears;

  return {
    downPayment,
    loanAmount,
    grossRentalYield: parseFloat(grossRentalYield.toFixed(2)),
    netRentalYield: parseFloat(netRentalYield.toFixed(2)),
    totalRentCollected: Math.round(totalRentCollected),
    finalPropertyValue: Math.round(finalPropertyValue),
    capitalGain: Math.round(capitalGain),
    totalReturn: Math.round(totalReturn),
    totalROI: parseFloat(totalROI.toFixed(1)),
    breakEvenYear,
    yearlyData,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

// ── Slider input ──────────────────────────────────────────────────────────────
interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  hint?: string;
}

function SliderInput({
  label, value, min, max, step, display, onChange, hint,
}: SliderInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
      />
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: "green" | "blue" | "amber" | "red";
  icon?: React.ReactNode;
  tooltip?: string;
}

function StatCard({ label, value, sub, highlight, icon, tooltip }: StatCardProps) {
  const colors = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? colors[highlight] : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <p className={`text-xs font-medium mb-1 ${highlight ? "" : "text-slate-500"}`}>
          {label}
        </p>
        {tooltip && (
          <div className="group relative">
            <Info size={12} className="text-slate-300 cursor-help" />
            <div className="absolute right-0 top-5 w-48 bg-slate-800 text-white text-[10px] rounded-lg p-2 hidden group-hover:block z-10 leading-relaxed">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <p className={`text-xl font-bold ${highlight ? "" : "text-slate-800"}`}>{value}</p>
        {icon && <div className="opacity-60">{icon}</div>}
      </div>
      {sub && (
        <p className={`text-[11px] mt-1 ${highlight ? "opacity-70" : "text-slate-400"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Custom bar chart tooltip ──────────────────────────────────────────────────
interface BarTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}

function BarTooltip({ active, payload, label }: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">Year {label}</p>
      <p className="text-slate-500">
        Total Return:{" "}
        <span className="font-bold text-slate-800">{formatINR(d.value)}</span>
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface InvestmentCalculatorProps {
  prefillArea?: AreaData | null;
}

export default function InvestmentCalculator({ prefillArea }: InvestmentCalculatorProps) {
  const defaultPrice = prefillArea
    ? prefillArea.current_price_psft * 1000 // assume ~1000 sqft
    : 8500000;

  const [propertyPrice, setPropertyPrice] = useState(defaultPrice);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [holdingYears, setHoldingYears] = useState(5);

  const appreciationPct = prefillArea?.yoy_change_pct ?? 12;

  const result = useMemo(
    () =>
      calculate({
        propertyPrice,
        downPaymentPct,
        monthlyRent,
        holdingYears,
        appreciationPct,
      }),
    [propertyPrice, downPaymentPct, monthlyRent, holdingYears, appreciationPct]
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Investment Calculator</h3>
            <p className="text-xs text-slate-400">
              {prefillArea
                ? `Pre-filled from ${prefillArea.name} · ${appreciationPct}% appreciation rate`
                : "Enter property details to calculate returns"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* ── Left: Inputs ───────────────────────────────────────────────── */}
        <div className="p-6 space-y-6">
          <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Inputs
          </h4>

          <SliderInput
            label="Property Price"
            value={propertyPrice}
            min={2000000}
            max={50000000}
            step={500000}
            display={formatINR(propertyPrice)}
            onChange={setPropertyPrice}
            hint="Drag to adjust property value"
          />

          <SliderInput
            label="Down Payment"
            value={downPaymentPct}
            min={10}
            max={100}
            step={5}
            display={`${downPaymentPct}% · ${formatINR(result.downPayment)}`}
            onChange={setDownPaymentPct}
            hint="Minimum 10% required by most banks"
          />

          <SliderInput
            label="Expected Monthly Rent"
            value={monthlyRent}
            min={5000}
            max={150000}
            step={1000}
            display={formatINR(monthlyRent) + "/mo"}
            onChange={setMonthlyRent}
          />

          <SliderInput
            label="Holding Period"
            value={holdingYears}
            min={1}
            max={20}
            step={1}
            display={`${holdingYears} ${holdingYears === 1 ? "year" : "years"}`}
            onChange={setHoldingYears}
          />

          {/* Appreciation rate badge */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
            <Percent size={14} className="text-blue-500 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-700">
                Capital Appreciation Rate: {appreciationPct}% / year
              </p>
              <p className="text-[10px] text-blue-500 mt-0.5">
                {prefillArea
                  ? `Based on ${prefillArea.name}'s historical trend`
                  : "Based on Bangalore average"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: Outputs ─────────────────────────────────────────────── */}
        <div className="p-6 space-y-5">
          <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Returns
          </h4>

          {/* Key stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Total ROI"
              value={`${result.totalROI.toFixed(1)}%`}
              sub={`Over ${holdingYears} years`}
              highlight="green"
              icon={<TrendingUp size={20} />}
              tooltip="Total return on your down payment investment including capital gain and net rental income."
            />
            <StatCard
              label="Break-even Year"
              value={`Year ${result.breakEvenYear}`}
              sub="Returns cover down payment"
              highlight="blue"
              icon={<Calendar size={20} />}
              tooltip="The year when your cumulative returns (rent + appreciation) equal your initial down payment."
            />
            <StatCard
              label="Gross Rental Yield"
              value={`${result.grossRentalYield}%`}
              sub={`Net: ${result.netRentalYield}% after maintenance`}
              icon={<Percent size={18} />}
              tooltip="Annual rent ÷ property price. Net yield deducts 15% for maintenance and vacancy."
            />
            <StatCard
              label="Capital Gain"
              value={formatINR(result.capitalGain)}
              sub={`Property → ${formatINR(result.finalPropertyValue)}`}
              highlight="amber"
              icon={<IndianRupee size={18} />}
              tooltip="Estimated property value appreciation over your holding period."
            />
          </div>

          {/* Summary line */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Return</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatINR(result.totalReturn)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {formatINR(result.capitalGain)} capital gain +{" "}
                {formatINR(result.totalRentCollected)} net rent
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">On investment of</p>
              <p className="text-lg font-bold text-slate-600">
                {formatINR(result.downPayment)}
              </p>
              <p className="text-[11px] text-slate-400">down payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bar chart: year-by-year returns ─────────────────────────────── */}
      <div className="px-6 pb-6 pt-2 border-t border-slate-100">
        <p className="text-sm font-semibold text-slate-600 mb-4">
          Year-by-Year Total Returns
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={result.yearlyData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `Yr ${v}`}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatINR(v)}
              width={60}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: "#f8fafc" }} />
            <ReferenceLine
              y={result.downPayment}
              stroke="#3b82f6"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: "Down payment",
                position: "right",
                fontSize: 9,
                fill: "#3b82f6",
              }}
            />
            <Bar dataKey="totalReturn" radius={[4, 4, 0, 0]}>
              {result.yearlyData.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={
                    entry.year === result.breakEvenYear
                      ? "#3b82f6"
                      : entry.totalReturn >= result.downPayment
                      ? "#10b981"
                      : "#94a3b8"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 justify-center">
          <Legend color="#94a3b8" label="Below break-even" />
          <Legend color="#3b82f6" label="Break-even year" />
          <Legend color="#10b981" label="Profitable years" />
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
  );
}