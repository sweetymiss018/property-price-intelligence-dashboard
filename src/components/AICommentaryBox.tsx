"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AreaData } from "@/data/areaData";
import { Sparkles, RefreshCw, AlertCircle, ChevronDown } from "lucide-react";

type Status = "idle" | "loading" | "done" | "error";

interface AICommentaryBoxProps {
  area: AreaData;
  autoLoad?: boolean;
  onCommentaryReady?: (areaId: string, text: string) => void; // ← add this
}

export default function AICommentaryBox({
  area,
  autoLoad = false,
  onCommentaryReady,
}: AICommentaryBoxProps) {
  const [commentary, setCommentary] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [expanded, setExpanded] = useState(true);
  const prevAreaId = useRef<string>("");

const fetchCommentary = useCallback(async () => {
  setStatus("loading");
  setCommentary("");

  try {
    const res = await fetch("/api/ai/market-commentary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area }),
    });

    if (!res.ok) throw new Error("API error");

    const data = await res.json();

    setCommentary(data.commentary ?? "");
    setStatus("done");
    onCommentaryReady?.(area.id, data.commentary ?? "");
  } catch {
    setStatus("error");
  }
}, [area, onCommentaryReady]);

  // // Auto-load on mount or when area changes (if autoLoad)
  // useEffect(() => {
  //   if (autoLoad && area.id !== prevAreaId.current) {
  //     prevAreaId.current = area.id;
  //     fetchCommentary();
  //   }
  // }, [area.id, autoLoad]);

  // // Reset when area changes
  // useEffect(() => {
  //   if (area.id !== prevAreaId.current && status === "done") {
  //     setStatus("idle");
  //     setCommentary("");
  //   }
  // }, [area.id, status]);

useEffect(() => {
  if (prevAreaId.current !== area.id) {
    setCommentary("");
    setStatus("idle");
    prevAreaId.current = area.id;
  }
}, [area.id]);

useEffect(() => {
  if (!autoLoad) return;

  const timer = setTimeout(() => {
    fetchCommentary();
  }, 0);

  return () => clearTimeout(timer);
}, [area.id, autoLoad, fetchCommentary]);

  return (
    <div className="rounded-xl border border-violet-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-violet-50 to-indigo-50 border-b border-violet-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-900">
              AI Market Commentary
            </p>
            <p className="text-[10px] text-violet-400">
              Powered by Claude · {area.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "done" && (
            <button
              onClick={fetchCommentary}
              className="flex items-center gap-1 text-xs text-violet-500 hover:text-violet-700 px-2 py-1 rounded-md hover:bg-violet-100 transition-colors"
            >
              <RefreshCw size={11} />
              Regenerate
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded-md hover:bg-violet-100 text-violet-400 transition-colors"
          >
            <ChevronDown
              size={15}
              className={`transition-transform ${expanded ? "" : "-rotate-90"}`}
            />
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-4">
          {/* Idle state */}
          {status === "idle" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-12 h-12 bg-violet-50 rounded-full flex items-center justify-center">
                <Sparkles size={22} className="text-violet-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  Get AI-powered market analysis
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  3-sentence expert commentary on {area.name} using live data
                </p>
              </div>
              <button
                onClick={fetchCommentary}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <Sparkles size={14} />
                Generate Analysis
              </button>
            </div>
          )}

          {/* Loading state */}
          {status === "loading" && (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 text-xs text-violet-600 font-medium mb-3">
                <RefreshCw size={12} className="animate-spin" />
                Analysing {area.name} market data...
              </div>
              {/* Skeleton lines */}
              {[100, 95, 88, 60].map((w, i) => (
                <div
                  key={i}
                  className="h-3 bg-violet-100 rounded-full animate-pulse"
                  style={{ width: `${w}%`, animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          )}

          {/* Done state */}
          {status === "done" && commentary && (
            <div className="space-y-3">
              {/* Commentary text — split into sentences for better display */}
              <div className="space-y-2">
                {commentary
                  .split(/(?<=[.!?])\s+/)
                  .filter(Boolean)
                  .map((sentence, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-violet-600">
                          {i + 1}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {sentence.trim()}
                      </p>
                    </div>
                  ))}
              </div>

              {/* Data used tags */}
              <div className="pt-3 border-t border-violet-100">
                <p className="text-[10px] text-violet-400 font-medium mb-2">
                  Data points used:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    `₹${area.current_price_psft.toLocaleString("en-IN")}/sqft`,
                    `+${area.yoy_change_pct}% YoY`,
                    `${area.rental_yield_pct}% yield`,
                    `${area.days_on_market_avg}d on market`,
                    `${area.unsold_inventory_months}mo inventory`,
                    area.key_employers_nearby[0],
                    area.upcoming_infrastructure[0],
                  ]
                    .filter(Boolean)
                    .map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="flex items-start gap-3 py-3">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">
                  Could not generate commentary
                </p>
                <p className="text-xs text-red-400 mt-0.5">
                  Check your API key or network connection
                </p>
                <button
                  onClick={fetchCommentary}
                  className="mt-2 text-xs text-red-600 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
