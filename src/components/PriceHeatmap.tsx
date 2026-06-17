"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../lib/leafletIconFix";
import { bangaloreAreas, AreaData, PRICE_MIN, PRICE_MAX } from "@/data/areaData";

// ── Colour scale: green → yellow → red based on ₹/sqft ──────────────────────
function getPriceColor(price: number): string {
  const ratio = (price - PRICE_MIN) / (PRICE_MAX - PRICE_MIN); // 0 → 1

  if (ratio < 0.25) return "#22c55e";       // green  — affordable
  if (ratio < 0.45) return "#86efac";       // light green
  if (ratio < 0.60) return "#fbbf24";       // yellow — mid
  if (ratio < 0.75) return "#f97316";       // orange
  if (ratio < 0.88) return "#ef4444";       // red
  return "#991b1b";                         // dark red — premium
}

interface TooltipInfo {
  area: AreaData;
  x: number;
  y: number;
}

interface PriceHeatmapProps {
  onAreaClick?: (area: AreaData) => void;
}

export default function PriceHeatmap({ onAreaClick }: PriceHeatmapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // ── Init map ──────────────────────────────────────────────────────────────
    const map = L.map(containerRef.current, {
      center: [12.9716, 77.5946], // Bangalore centre
      zoom: 11,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    // ── OpenStreetMap tiles (free, no key needed) ─────────────────────────────
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // ── Draw area polygons ────────────────────────────────────────────────────
    bangaloreAreas.forEach((area) => {
      const color = getPriceColor(area.current_price_psft);

      const polygon = L.polygon(area.polygon_coords, {
        color: color,
        fillColor: color,
        fillOpacity: 0.55,
        weight: 2,
        opacity: 0.9,
      }).addTo(map);

      // Store area id on polygon for selection tracking
      (polygon as unknown as { _areaId: string })._areaId = area.id;

      // ── Hover: show tooltip ───────────────────────────────────────────────
      polygon.on("mouseover", (e: L.LeafletMouseEvent) => {
        polygon.setStyle({ fillOpacity: 0.85, weight: 3 });

        const containerRect = containerRef.current!.getBoundingClientRect();
        setTooltip({
          area,
          x: e.originalEvent.clientX - containerRect.left,
          y: e.originalEvent.clientY - containerRect.top,
        });
      });

      polygon.on("mousemove", (e: L.LeafletMouseEvent) => {
        const containerRect = containerRef.current!.getBoundingClientRect();
        setTooltip((prev) =>
          prev ? { ...prev, x: e.originalEvent.clientX - containerRect.left, y: e.originalEvent.clientY - containerRect.top } : prev
        );
      });

      polygon.on("mouseout", () => {
        polygon.setStyle({ fillOpacity: 0.55, weight: 2 });
        setTooltip(null);
      });

      // ── Click: select area + drill down ──────────────────────────────────
      polygon.on("click", () => {
        setSelectedAreaId(area.id);
        onAreaClick?.(area);

        // Pulse effect on click
        polygon.setStyle({ fillOpacity: 0.9, weight: 4 });
        setTimeout(() => polygon.setStyle({ fillOpacity: 0.75, weight: 3 }), 300);

        // Pan map to area centre
        map.panTo([area.lat, area.lng], { animate: true, duration: 0.5 });
      });

      // ── Area name label ───────────────────────────────────────────────────
      L.marker([area.lat, area.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="
            background: white;
            border: 1.5px solid ${color};
            color: #1e293b;
            font-size: 10px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 4px;
            white-space: nowrap;
            box-shadow: 0 1px 4px rgba(0,0,0,0.15);
            pointer-events: none;
          ">${area.name}</div>`,
          iconAnchor: [40, 10],
        }),
        interactive: false,
      }).addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onAreaClick]);

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={containerRef} className="w-full h-full rounded-xl" />

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-1000 bg-white border border-slate-200 rounded-lg shadow-xl p-3 min-w-45"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 10,
            transform: tooltip.x > 600 ? "translateX(-110%)" : undefined,
          }}
        >
          <p className="font-bold text-slate-800 text-sm mb-1">{tooltip.area.name}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500">Avg ₹/sqft</span>
            <span className="text-sm font-semibold text-slate-800">
              ₹{tooltip.area.current_price_psft.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-0.5">
            <span className="text-xs text-slate-500">YoY Change</span>
            <span
              className={`text-sm font-semibold ${
                tooltip.area.yoy_change_pct >= 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {tooltip.area.yoy_change_pct >= 0 ? "+" : ""}
              {tooltip.area.yoy_change_pct}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-0.5">
            <span className="text-xs text-slate-500">Rental Yield</span>
            <span className="text-sm font-semibold text-blue-600">
              {tooltip.area.rental_yield_pct}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Click to see price trends →</p>
        </div>
      )}

      {/* Colour legend */}
      <div className="absolute bottom-6 left-4 z-1000 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-md">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Price per sqft
        </p>
        <div className="flex flex-col gap-1">
          {[
            { color: "#22c55e", label: "Under ₹6,000" },
            { color: "#86efac", label: "₹6,000 – ₹7,500" },
            { color: "#fbbf24", label: "₹7,500 – ₹9,500" },
            { color: "#f97316", label: "₹9,500 – ₹11,500" },
            { color: "#ef4444", label: "₹11,500 – ₹13,500" },
            { color: "#991b1b", label: "Above ₹13,500" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-[11px] text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected area badge */}
      {selectedAreaId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
          {bangaloreAreas.find((a) => a.id === selectedAreaId)?.name} — loading trend chart...
        </div>
      )}
    </div>
  );
}