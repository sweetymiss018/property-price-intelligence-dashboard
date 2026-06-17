"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { bangaloreAreas, AreaData } from "@/data/areaData";
import { FileText, Download, Sparkles, X, ChevronRight, CheckCircle } from "lucide-react";

// Dynamic import — @react-pdf/renderer must not run on server
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false }
);

// Lazy load the document too
const { MarketReportDocument } = await import("./pdf/MarketReport").catch(() => ({
  MarketReportDocument: null,
}));

// ── Lead form ─────────────────────────────────────────────────────────────────
interface LeadFormProps {
  onSubmit: (name: string, phone: string) => void;
  onSkip: () => void;
}

function LeadForm({ onSubmit, onSkip }: LeadFormProps) {
  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <FileText size={22} className="text-white" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Your report is ready
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Where should we send the advisory callback?
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="tel"
          placeholder="WhatsApp number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={() => onSubmit(name || "Investor", phone)}
        disabled={!name || !phone}
        className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
      >
        <Download size={15} />
        Download Report + Advisor Callback
      </button>

      <button
        onClick={() => onSkip()}
        className="w-full text-xs text-slate-400 hover:text-slate-600 py-1"
      >
        Download without sharing →
      </button>
    </div>
  );
}

// ── Report preview card ───────────────────────────────────────────────────────
function ReportPreview({
  areas,
  commentary,
}: {
  areas: AreaData[];
  commentary: Record<string, string>;
}) {
  const hasCommentary = Object.keys(commentary).length;

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Report Contents
      </p>
      {[
        { label: "Executive Summary", desc: "City-wide market overview + key insights", done: true },
        { label: "Area Rankings Table", desc: `${areas.length} areas ranked by YoY appreciation`, done: true },
        { label: "Area Deep Dives", desc: `${areas.length} areas with all metrics`, done: true },
        {
          label: "AI Market Commentary",
          desc: hasCommentary
            ? `${hasCommentary} area${hasCommentary > 1 ? "s" : ""} with AI analysis`
            : "Generate commentary first for richer report",
          done: hasCommentary > 0,
        },
        { label: "Disclaimer + CTA", desc: "Data sources, RERA note, advisor contact", done: true },
      ].map(({ label, desc, done }) => (
        <div key={label} className="flex items-start gap-2.5">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
            done ? "bg-emerald-100" : "bg-slate-200"
          }`}>
            {done
              ? <CheckCircle size={11} className="text-emerald-600" />
              : <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">{label}</p>
            <p className="text-[10px] text-slate-400">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface ReportGeneratorProps {
  selectedArea?: AreaData | null;
  commentary?: Record<string, string>;
}

export default function ReportGenerator({
  selectedArea,
  commentary = {},
}: ReportGeneratorProps) {
  const [showGate, setShowGate]   = useState(false);
  const [userName, setUserName]   = useState("");
  const [gateCleared, setGateCleared] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [DocComponent, setDocComponent] = useState<typeof MarketReportDocument | null>(null);

  // Lazy load the PDF document on client
  useEffect(() => {
    import("./pdf/MarketReport").then((m) => {
      setDocComponent(() => m.MarketReportDocument);
    });
  }, []);

  function handleGenerate() {
    setShowGate(true);
  }

  function handleLeadSubmit(name: string, phone: string) {
    setUserName(name);
    // Write lead to API (fire and forget)
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        source: "market_report",
        areas_viewed: bangaloreAreas.map((a) => a.id),
        report_generated: true,
      }),
    }).catch(() => {});
    setGateCleared(true);
    setReportReady(true);
  }

  function handleSkip() {
    setUserName("Investor");
    setGateCleared(true);
    setReportReady(true);
  }

  const displayAreas = selectedArea
    ? bangaloreAreas.filter(
        (a) =>
          a.id === selectedArea.id ||
          bangaloreAreas
            .sort((x, y) => y.yoy_change_pct - x.yoy_change_pct)
            .slice(0, 3)
            .find((t) => t.id === a.id)
      )
    : bangaloreAreas.sort((a, b) => b.yoy_change_pct - a.yoy_change_pct).slice(0, 4);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
              <FileText size={17} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Market Report Generator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Branded PDF · 5 sections · Downloadable instantly
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Report preview */}
          <ReportPreview areas={bangaloreAreas} commentary={commentary} />

          {/* Report scope */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <Sparkles size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-800">
                Report scope
              </p>
              <p className="text-xs text-blue-500 mt-0.5">
                {selectedArea
                  ? `Deep-dive on ${selectedArea.name} + top 3 performers by YoY growth`
                  : "Top 4 Bangalore areas by YoY growth · All 12 areas in rankings table"}
                {Object.keys(commentary).length > 0
                  ? ` · AI commentary for ${Object.keys(commentary).length} area${Object.keys(commentary).length > 1 ? "s" : ""} included`
                  : " · Generate AI commentary first for richer deep-dives"}
              </p>
            </div>
          </div>

          {/* Download section */}
          {!reportReady ? (
            <button
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <FileText size={16} />
              Generate Market Report
              <ChevronRight size={15} className="ml-1" />
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <CheckCircle size={15} />
                Report ready — click below to download
              </div>

              {DocComponent && (
                <PDFDownloadLink
                  document={
                    <DocComponent
                      areas={bangaloreAreas}
                      selectedAreas={displayAreas}
                      userName={userName}
                      commentary={commentary}
                    />
                  }
                  fileName={`Pattem_Estates_Bangalore_Market_Report_June2026.pdf`}
                >
                  {({ loading }) => (
                    <button
                      className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-colors text-sm ${
                        loading
                          ? "bg-slate-300 text-slate-500 cursor-wait"
                          : "bg-blue-700 hover:bg-blue-800 text-white"
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                          Preparing PDF...
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Download PDF Report
                        </>
                      )}
                    </button>
                  )}
                </PDFDownloadLink>
              )}

              <button
                onClick={() => { setReportReady(false); setGateCleared(false); }}
                className="w-full text-xs text-slate-400 hover:text-slate-600 py-1"
              >
                ← Regenerate with different areas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lead gate modal */}
      {showGate && !gateCleared && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowGate(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <X size={16} />
            </button>
            <LeadForm onSubmit={handleLeadSubmit} onSkip={handleSkip} />
          </div>
        </div>
      )}
    </>
  );
}