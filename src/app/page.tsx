"use client";

import { useState } from "react";
import HeatmapWrapper from "@/components/HeatmapWrapper";
import AreaTrendChart from "@/components/AreaTrendChart";
import InvestmentCalculator from "@/components/InvestmentCalculator";
import AreaComparisonTable from "@/components/AreaComparisonTable";
import { AreaData, bangaloreAreas } from "@/data/areaData";
import DemandSignal from "@/components/DemandSignal";
import AVMWidget from "@/components/AVMWidget";
import AICommentaryBox from "@/components/AICommentaryBox";
import NRICurrencyPanel from "@/components/NRICurrencyPanel";
import ReportGenerator from "@/components/ReportGenerator";

type ActiveTab =
  | "heatmap"
  | "calculator"
  | "comparison"
  | "avm"
  | "nri"
  | "report";

export default function Home() {
  const [selectedArea, setSelectedArea] = useState<AreaData | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("heatmap");
  const [commentaryMap, setCommentaryMap] = useState<Record<string, string>>(
    {},
  );

  const tabs: { id: ActiveTab; label: string; emoji: string }[] = [
    { id: "heatmap", label: "Price Heatmap", emoji: "🗺️" },
    { id: "calculator", label: "Investment Calculator", emoji: "📊" },
    { id: "comparison", label: "Area Comparison", emoji: "⚖️" },
    { id: "avm", label: "Valuation Estimator", emoji: "🏠" },
    { id: "nri", label: "NRI Intelligence", emoji: "🌏" },
    { id: "report", label: "Market Report", emoji: "📄" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">PE</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-none">
                Pattem Estates
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Price Intelligence Dashboard
              </p>
            </div>
          </div>

          {/* Tab nav */}
          <nav className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white shadow-sm text-slate-800"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span>{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
            <span className="text-sm font-medium text-slate-700">
              📍 Bangalore
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* ── Heatmap tab ──────────────────────────────────────────────────── */}
        {activeTab === "heatmap" && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Property Price Heatmap
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Hover to see prices · Click an area to drill into price trends
              </p>
            </div>

            <div className="w-full h-140 rounded-xl overflow-hidden shadow-md border border-slate-200">
              <HeatmapWrapper onAreaClick={(area) => setSelectedArea(area)} />
            </div>

            {selectedArea && (
              <>
                <AreaTrendChart
                  primaryArea={selectedArea}
                  onClose={() => setSelectedArea(null)}
                />
                <AICommentaryBox
                  area={selectedArea}
                  autoLoad={false}
                  onCommentaryReady={(areaId, text) =>
                    setCommentaryMap((prev) => ({ ...prev, [areaId]: text }))
                  }
                />
                <DemandSignal area={selectedArea} />
              </>
            )}

            {!selectedArea && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
                <span className="text-2xl">👆</span>
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Click any area on the map
                  </p>
                  <p className="text-xs text-blue-500 mt-0.5">
                    Opens an 8-quarter price trend chart with multi-area
                    comparison
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Calculator tab ────────────────────────────────────────────── */}
        {activeTab === "calculator" && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Investment Calculator
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {selectedArea
                  ? `Pre-filled from ${selectedArea.name} — switch to Heatmap tab and click a different area to update`
                  : "Switch to the Heatmap tab and click any area to pre-fill with real market data"}
              </p>
            </div>
            <InvestmentCalculator prefillArea={selectedArea} />
          </>
        )}

        {/* ── Comparison tab ────────────────────────────────────────────── */}
        {activeTab === "comparison" && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Area Comparison
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Compare up to 5 areas side by side · Sort by any column · Pattem
                Score ranks overall value
              </p>
            </div>
            <AreaComparisonTable highlightAreaId={selectedArea?.id} />
          </>
        )}

        {/* ── AVM tab ────────────────────────────────────────────── */}
        {activeTab === "avm" && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Property Valuation Estimator
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {selectedArea
                  ? `Showing valuation for ${selectedArea.name} · Change area on map to update`
                  : "AVM — Automated Valuation Model based on comparable transactions"}
              </p>
            </div>
            <AVMWidget prefillArea={selectedArea} />
          </>
        )}

        {/* ── NRI tab ────────────────────────────────────────────── */}
        {activeTab === "nri" && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                NRI Currency Intelligence
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {selectedArea
                  ? `Showing ${selectedArea.name} in AED & USD · Click areas on the Heatmap tab to update`
                  : "Property prices in AED and USD · 12-month currency movement · Effective NRI returns"}
              </p>
            </div>
            <NRICurrencyPanel
              prefillArea={selectedArea}
              allAreas={bangaloreAreas}
            />
          </>
        )}

        {/* ── Report tab ────────────────────────────────────────────── */}
        {activeTab === "report" && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Market Report Generator
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Branded PDF report · Generate AI commentary on the Heatmap tab
                first for richer output
              </p>
            </div>
            <ReportGenerator
              selectedArea={selectedArea}
              commentary={commentaryMap}
            />
          </>
        )}
      </div>
    </main>
  );
}
