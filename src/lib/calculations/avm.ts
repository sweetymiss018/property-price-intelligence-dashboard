import { AreaData } from "@/data/areaData";

export interface AVMParams {
  areaId: string;
  propertyType: "apartment" | "villa";
  bhk: 1 | 2 | 3 | 4;
  floor: "low" | "mid" | "high";
  buildingAge: number; // years
  carpetArea: number; // sqft
  amenitiesQuality: "basic" | "standard" | "premium";
}

export interface AVMResult {
  estimatedValue: number;
  rangeMin: number;
  rangeMax: number;
  pricePerSqft: number;
  areaAvgPsft: number;
  vsAreaAverage: number; // % above or below area avg
  confidenceScore: number; // 0–100
  confidenceLabel: "High" | "Medium" | "Low";
  dataPoints: number; // simulated comparable transactions
  adjustments: {
    label: string;
    factor: number; // e.g. 1.05 = +5%
    impact: number; // in ₹
  }[];
}

export function estimatePropertyValue(
  params: AVMParams,
  area: AreaData
): AVMResult {
  const base = area.current_price_psft;

  // ── Adjustment factors ────────────────────────────────────────────────────
  const floorFactor =
    params.floor === "high" ? 1.05
    : params.floor === "low" ? 0.96
    : 1.0;

  const ageFactor =
    params.buildingAge <= 2  ? 1.08
    : params.buildingAge <= 5  ? 1.03
    : params.buildingAge <= 10 ? 1.00
    : params.buildingAge <= 20 ? 0.94
    : 0.88;

  const amenitiesFactor =
    params.amenitiesQuality === "premium" ? 1.06
    : params.amenitiesQuality === "basic"   ? 0.95
    : 1.0;

  const bhkFactor =
    params.bhk >= 4 ? 1.04
    : params.bhk === 1 ? 0.96
    : 1.0;

  const typeFactor = params.propertyType === "villa" ? 1.12 : 1.0;

  const adjustedPsft = Math.round(
    base * floorFactor * ageFactor * amenitiesFactor * bhkFactor * typeFactor
  );

  const estimatedValue = adjustedPsft * params.carpetArea;

  // ── Confidence score ──────────────────────────────────────────────────────
  let confidence = 88;
  if (params.buildingAge > 20)  confidence -= 12;
  else if (params.buildingAge > 10) confidence -= 5;
  if (params.bhk >= 4)          confidence -= 5;
  if (params.floor === "low")   confidence -= 3;
  if (params.propertyType === "villa") confidence -= 4;
  confidence = Math.max(55, Math.min(95, confidence));

  const confidenceLabel: "High" | "Medium" | "Low" =
    confidence >= 80 ? "High"
    : confidence >= 65 ? "Medium"
    : "Low";

  // ── Adjustment breakdown for UI ───────────────────────────────────────────
  const adjustments = [
    {
      label: "Floor level",
      factor: floorFactor,
      impact: Math.round((floorFactor - 1) * base * params.carpetArea),
    },
    {
      label: "Building age",
      factor: ageFactor,
      impact: Math.round((ageFactor - 1) * base * params.carpetArea),
    },
    {
      label: "Amenities quality",
      factor: amenitiesFactor,
      impact: Math.round((amenitiesFactor - 1) * base * params.carpetArea),
    },
    {
      label: "BHK configuration",
      factor: bhkFactor,
      impact: Math.round((bhkFactor - 1) * base * params.carpetArea),
    },
    {
      label: "Property type",
      factor: typeFactor,
      impact: Math.round((typeFactor - 1) * base * params.carpetArea),
    },
  ].filter((a) => a.factor !== 1.0);

  const vsAreaAverage = Math.round(((adjustedPsft / base) - 1) * 100);

  // Simulated data points — more data in popular areas
  const dataPoints =
    750 +
    Math.floor(area.enquiries_per_listing * 18) +
    Math.floor(Math.random() * 150);

  return {
    estimatedValue,
    rangeMin: Math.round(estimatedValue * 0.92),
    rangeMax: Math.round(estimatedValue * 1.08),
    pricePerSqft: adjustedPsft,
    areaAvgPsft: base,
    vsAreaAverage,
    confidenceScore: confidence,
    confidenceLabel,
    dataPoints,
    adjustments,
  };
}