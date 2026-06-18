# POC-02 — Property Price Intelligence Dashboard
### Pattem Estates V2 · Developer Documentation

---

## 1. What This POC Does

A full-stack property price intelligence dashboard built in Next.js 16 + TypeScript. It gives buyers, investors, and NRIs institutional-grade Bangalore real estate market data through four interconnected tabs:

- **Price Heatmap** — 12 Bangalore micro-markets on a Leaflet map (CartoDB dark tiles), colour-coded by ₹/sqft with hover tooltips and click-to-drill-down
- **Investment Calculator** — Live sliders for price, down payment, rent, and tenure; real financial logic for gross/net yield, ROI, break-even year, and a year-by-year bar chart
- **Area Comparison Table** — Sortable columns, composite Pattem Score (0–100), and smart badges (Best for Investment / End Use / NRI)
- **AI Market Commentary** — Claude-generated 3-sentence expert analysis per area using live data
- **AVM Valuation Estimator** — Automated Valuation Model with adjustment factors and confidence score gauge
- **Demand Signal Tracker** — Market temperature (Hot / Warm / Balanced / Cooling) with 3 supporting stats
- **NRI Currency Panel** — Property prices in AED and USD via Frankfurter API, 12-month currency movement chart, effective NRI appreciation
- **PDF Report Generator** — Branded 5-section downloadable report with soft lead gate

---

## 2. Setup Instructions

```bash
# Clone and install
npm install

# Add environment variables
cp .env.example .env.local
# Fill in values (see Section 4)

# Run dev server
npm run dev
```

Open `http://localhost:3000`

---

## 3. Feature Walkthrough

### 🗺️ Price Heatmap
1. Load the dashboard — map renders immediately with 12 colour-coded Bangalore areas
2. Hover any area → tooltip shows ₹/sqft, YoY%, rental yield
3. Click any area → map pans, 8-quarter trend chart slides in below
4. Add a second area to the chart using "Add area" → two lines appear for comparison
5. Green dashed ★ marker shows the lowest price quarter ("Best time to buy")

### 📊 Investment Calculator
1. Switch to **Investment Calculator** tab
2. Click any area on the heatmap first → appreciation rate pre-fills automatically
3. Drag sliders for property price, down payment %, monthly rent, holding period
4. Watch ROI, break-even year, and bar chart update in real time
5. Bar colours: grey = below break-even, blue = break-even year, green = profitable

### ⚖️ Area Comparison
1. Switch to **Area Comparison** tab
2. Default shows top 5 areas by Pattem Score
3. Click any column header to sort (ascending/descending)
4. Use "Add area" to add up to 5 areas
5. Pattem Score = YoY 30% + Yield 25% + Connectivity 20% + Infrastructure 15% + Affordability 10%

### 🏠 Valuation Estimator (AVM)
1. Switch to **Valuation Estimator** tab
2. Select area, property type, BHK, floor level, building age, carpet area, amenities
3. Estimated value + range appears instantly
4. Click "How this value was calculated" → adjustment breakdown shows each factor's ₹ impact
5. Confidence gauge (SVG ring) animates to score — High / Medium / Low

### ✨ AI Market Commentary
1. On the Heatmap tab, click any area
2. AI Commentary box appears — click "Generate Analysis"
3. 3-sentence expert commentary loads (mock fallback if no API key)
4. Each sentence numbered, data-point tags shown below
5. Click "Regenerate" to refresh

### 🌏 NRI Currency Panel
1. Switch to **NRI Intelligence** tab
2. Toggle AED / USD using the switcher
3. Click any BHK size chip to see total property cost in foreign currency
4. 12-month chart shows INR movement vs selected currency
5. "Effective appreciation" box explains NRI-adjusted returns in plain English

### 📄 PDF Report
1. Generate AI commentary for 2–3 areas first (makes the report richer)
2. Switch to **Market Report** tab
3. Click "Generate Market Report" → lead gate modal appears
4. Fill name + WhatsApp, or click "Download without sharing"
5. Click "Download PDF Report" → branded 5-page PDF downloads

---

## 4. Environment Variables

```bash
# .env.local

# Required for AI Market Commentary (Feature 6)
# Leave empty to use mock fallback — app works without it
ANTHROPIC_API_KEY=your_key_here

# Set to "true" to always use mock AI regardless of key
NEXT_PUBLIC_USE_MOCK_AI=true

# WhatsApp number for report CTA
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

> **Note:** The Frankfurter currency API (NRI panel) is completely free — no key needed.
> The Leaflet map uses CartoDB free tiles — no key needed.

---

## 5. Data Sources

| Data | Source |
|---|---|
| ₹/sqft price ranges per area | 99acres Bangalore page (June 2026) |
| Quarterly price trend values | NHB RESIDEX quarterly indices (seeded) |
| YoY change percentages | 99acres Insite Report Q2 2026 |
| Rental yield estimates | 99acres + MagicBricks cross-referenced |
| Interest rate baseline (8.5%) | RBI DBIE repo rate (June 2026) |
| Ward boundaries (dark map) | BBMP via DataMeet / OpenStreetMap |
| Area polygon coordinates | OpenStreetMap Overpass API + manual correction |
| Exchange rates (AED/USD) | Frankfurter API (live) / reference rates (mock) |

---

## 6. AI Usage Log

> Required per POC brief — documents every AI interaction, what was accepted, what was changed, and what the AI got wrong.

### Tool Used: Claude (claude.ai — Sonnet 4.6)

---

| # | What I Prompted For | Accepted As-Is? | What I Modified / Fixed |
|---|---|---|---|
| 1 | Full project setup — Next.js 16, TypeScript, Leaflet, folder structure | ✅ Yes | Added `"use client"` directives where missing; fixed `tsconfig` strict mode issues that Claude didn't account for |
| 2 | `AreaData` TypeScript interface with all fields | ✅ Yes | Extended interface in later steps to add `days_on_market_avg`, `nri_interest_score`, `five_year_cagr_pct` fields as features were added |
| 3 | Mock data for 12 Bangalore areas with realistic ₹/sqft values | ⚠️ Partial | Initial prices were round numbers — cross-referenced with 99acres and adjusted to realistic values (e.g. Whitefield ₹8,900 not ₹8,500, Indiranagar ₹14,800 not ₹15,000) |
| 4 | Leaflet map component with SSR fix for Next.js App Router | ✅ Yes | The `dynamic` import pattern Claude provided was correct. Minor: had to add `"use client"` to `HeatmapWrapper.tsx` explicitly |
| 5 | GeoJSON polygon coordinates for 12 Bangalore areas | ❌ No — wrong | First set of coordinates drew weird leaf-shaped polygons nowhere near the correct areas. Second set still had some areas misplaced. Had to manually verify all 12 against Google Maps and correct lat/lng values. This was the most significant AI failure in the project. |
| 6 | Overpass API script to fetch real OSM boundaries | ⚠️ Partial | Script logic was correct but missing `User-Agent` header which caused HTTP 406 errors. Added header fix. Network restrictions on development machine meant the script couldn't run — required hotspot workaround |
| 7 | CartoDB dark tile integration to replace OSM default tiles | ✅ Yes | One-line change, worked immediately |
| 8 | EMI / gross yield / net yield / ROI financial formulas in TypeScript | ✅ Yes — logic correct | Verified manually: `EMI = P × r × (1+r)^n / ((1+r)^n - 1)` confirmed against BankBazaar calculator. Break-even year formula confirmed against manual spreadsheet |
| 9 | Recharts `LineChart` with `ReferenceLine` for "Best time to buy" marker | ✅ Yes | Restyled tooltip colours and adjusted label position — `position: "top"` was getting clipped at chart edges |
| 10 | Pattem Score composite weighting system | ❌ No — redesigned | Claude initially gave equal weights (20% each across 5 factors). Manually redesigned to 30/25/20/15/10 weighting to align with the brief's evaluation criteria emphasis on growth and yield |
| 11 | Investment calculator bar chart with colour-coded bars (grey/blue/green) | ✅ Yes | Minor: `Cell` component import was missing from the initial Recharts code |
| 12 | AVM adjustment factors (floor, age, amenities, BHK, type) | ⚠️ Partial | Multiplier values were reasonable but not calibrated. Adjusted: new build premium from 1.06 to 1.08, villa premium from 1.08 to 1.12 based on market research |
| 13 | SVG confidence gauge ring (circular progress) | ✅ Yes | Calculation was correct. Added `transition: stroke-dashoffset 0.8s ease` for animation — Claude omitted this |
| 14 | AI market commentary system prompt and API route | ⚠️ Partial | System prompt structure was good. Modified the tone instruction from "warm and friendly" to "authoritative, advisory, confident" to match the brief's requirement. Added mock fallback that Claude initially omitted |
| 15 | Mock commentary fallback using real area data | ✅ Yes | Text quality was high — used actual field values (days_on_market, inventory, employer names) to produce convincing non-generic output |
| 16 | NRI Currency Panel with Frankfurter API | ✅ Yes | API endpoint format changed slightly — `frankfurter.dev/v2` instead of `api.frankfurter.app`. Updated URL and tested |
| 17 | 12-month historical rate chart using Recharts | ✅ Yes | Minor: chart data sampling logic needed adjustment for when API returns daily data (needed to filter to ~monthly intervals) |
| 18 | "Effective appreciation" NRI explainer calculation | ✅ Yes | Formula `effective = property_yoy + currency_movement` verified conceptually correct |
| 19 | Badge logic (Investment / End Use / NRI thresholds) | ⚠️ Partial | Initial thresholds were too generous — nearly every area got all three badges. Tightened: Investment requires YoY ≥ 14% OR yield ≥ 4.5% (not just 12%/3.5%) |
| 20 | `@react-pdf/renderer` PDF document with StyleSheet | ✅ Yes | Font rendering: `fontFamily: "Helvetica-Bold"` had to be used instead of `fontWeight: "bold"` — react-pdf doesn't support fontWeight on Text components |
| 21 | Lead gate modal before PDF download | ✅ Yes | Added `onSkip` path that Claude initially left as a TODO comment |
| 22 | Leads API route writing to JSON file | ✅ Yes | Added `fs.existsSync` check before reading — Claude's version threw on first run before file existed |
| 23 | Demand Signal thermometer visual component | ✅ Yes | Adjusted bar heights — Claude's version had all bars the same height. Fixed to use `(i + 1) * 14px` for stepped visual |
| 24 | Area Comparison Table sortable columns | ✅ Yes | TypeScript: `SortKey` union type needed explicit casting when accessing `area[sortKey]` — added `as number` type assertion |
| 25 | Presentation deck (python-pptx) | ✅ Yes | Colour values adjusted to match brand palette. Slide 9 demo script updated to reflect actual feature order |

---

## 7. Financial Logic References

All formulas are documented with sources per TypeScript standards requirement.

```typescript
/**
 * Monthly EMI calculation — standard reducing balance formula.
 * Source: RBI Master Circular on Interest Rate on Advances
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 */
const calculateEMI = (principal, annualRate, tenureMonths) => { ... }

/**
 * Gross Rental Yield — annual rent as % of property value.
 * Source: NHB RESIDEX methodology
 * Formula: (monthly_rent × 12 / property_value) × 100
 */
const calculateGrossRentalYield = (monthlyRent, propertyValue) => { ... }

/**
 * Net Rental Yield — deducts 15% for maintenance and vacancy.
 * Source: Standard industry assumption per 99acres and ANAROCK research
 */
const calculateNetRentalYield = (grossYield) => grossYield * 0.85

/**
 * FOIR — Fixed Obligation to Income Ratio for loan eligibility.
 * Source: RBI guidelines, standard 40% FOIR used by most Indian banks
 */
const maxEligibleEMI = (monthlyIncome, existingEMIs) =>
  (monthlyIncome * 0.40) - existingEMIs
```

---

## 8. Known Limitations

| Limitation | Production Fix |
|---|---|
| Area polygon coordinates are manually verified approximations | Fetch exact boundaries from BBMP GIS portal or OSM Overpass with proper ward relation IDs |
| Price data is seeded mock data | Integrate NHB RESIDEX API or 99acres data feed |
| AI commentary uses mock fallback without API key | Add `ANTHROPIC_API_KEY` — fallback activates automatically on API failure |
| Currency rates fall back to June 2026 reference rates if Frankfurter unreachable | Already handled gracefully — mock rates are realistic |
| PDF report uses algorithmic ward pricing (`Math.random` seeded per ward) | Replace with real transaction data per ward |
| Leads written to `leads.json` flat file | Replace with PostgreSQL / Supabase in production |
| No authentication on `/admin/leads` | Add NextAuth or Clerk in production |
| BBMP ward GeoJSON fetched from GitHub at runtime | Host on own CDN, cache aggressively |

---

## 9. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript (`strict: true`) |
| Map | Leaflet + react-leaflet + CartoDB Dark tiles |
| Charts | Recharts (LineChart, BarChart, ComposedChart) |
| Styling | Tailwind CSS |
| State | React `useState` / `useMemo` |
| AI | Claude API (`claude-sonnet-4-6`) + mock fallback |
| Currency | Frankfurter API (free, no key) |
| PDF | `@react-pdf/renderer` |
| Icons | `lucide-react` |
| Storage | `fs` module → `leads.json` (POC only) |

---

## 10. Repository Structure

```
pattem-estates-poc-02-price-intelligence/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main dashboard — all tabs
│   │   └── api/
│   │       ├── ai/market-commentary/   # Claude API route
│   │       └── leads/                  # Lead capture API route
│   ├── components/
│   │   ├── PriceHeatmap.tsx            # Leaflet map + BBMP wards
│   │   ├── HeatmapWrapper.tsx          # SSR-safe dynamic import
│   │   ├── AreaTrendChart.tsx          # 8-quarter Recharts line chart
│   │   ├── InvestmentCalculator.tsx    # ROI calculator + bar chart
│   │   ├── AreaComparisonTable.tsx     # Sortable table + Pattem Score
│   │   ├── AICommentaryBox.tsx         # Claude commentary widget
│   │   ├── AVMWidget.tsx               # Valuation estimator
│   │   ├── DemandSignal.tsx            # Market temperature component
│   │   ├── NRICurrencyPanel.tsx        # AED/USD converter + chart
│   │   ├── ReportGenerator.tsx         # PDF lead gate + download
│   │   └── pdf/
│   │       └── MarketReport.tsx        # react-pdf document
│   ├── data/
│   │   └── areaData.ts                 # 12 areas, all typed interfaces
│   ├── lib/
│   │   ├── calculations/
│   │   │   ├── avm.ts                  # AVM adjustment logic
│   │   │   └── investmentROI.ts        # Financial formulas
│   │   ├── api/
│   │   │   └── currency.ts             # Frankfurter + mock fallback
│   │   └── map/
│   │       └── wardData.ts             # BBMP ward GeoJSON + pricing
│   └── types/                          # Shared TypeScript interfaces
├── scripts/
│   └── fetchBoundaries.mjs             # OSM Overpass boundary fetcher
├── leads.json                          # Lead storage (auto-generated)
├── .env.local                          # Environment variables
└── README.md                           # This file
```

---

*POC-02 · Pattem Estates V2 · Built with Next.js 16 + TypeScript · June 2026*