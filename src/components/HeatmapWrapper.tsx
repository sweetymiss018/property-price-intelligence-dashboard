"use client";

import dynamic from "next/dynamic";
import { AreaData } from "@/data/areaData";

// Dynamic import = Leaflet only loads in the browser, never on the server
const PriceHeatmap = dynamic(() => import("./PriceHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

interface HeatmapWrapperProps {
  onAreaClick?: (area: AreaData) => void;
}

export default function HeatmapWrapper({ onAreaClick }: HeatmapWrapperProps) {
  return <PriceHeatmap onAreaClick={onAreaClick} />;
}