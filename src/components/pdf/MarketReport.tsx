"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { AreaData } from "@/data/areaData";

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    paddingBottom: 40,
  },

  // Cover
  coverPage: {
    backgroundColor: "#0F234E",
    padding: 0,
    flex: 1,
  },
  coverAccent: {
    backgroundColor: "#008B8B",
    height: 6,
    width: "100%",
  },
  coverGold: {
    backgroundColor: "#F5A623",
    height: 6,
    width: "100%",
  },
  coverBody: {
    padding: 48,
    flex: 1,
  },
  coverTag: {
    fontSize: 8,
    color: "#008B8B",
    letterSpacing: 2,
    marginBottom: 32,
    fontFamily: "Helvetica-Bold",
  },
  coverTitle: {
    fontSize: 36,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.2,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 16,
    color: "#F5A623",
    fontFamily: "Helvetica-Bold",
    marginBottom: 32,
  },
  coverDivider: {
    height: 2,
    backgroundColor: "#008B8B",
    width: 60,
    marginBottom: 24,
  },
  coverMeta: {
    fontSize: 10,
    color: "#A0AEC0",
    lineHeight: 1.8,
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: "#1A3360",
    paddingTop: 16,
    marginTop: 48,
  },
  coverFooterText: {
    fontSize: 8,
    color: "#64748B",
  },

  // Section header
  sectionHeader: {
    backgroundColor: "#0F234E",
    paddingHorizontal: 40,
    paddingVertical: 12,
    marginBottom: 20,
  },
  sectionTag: {
    fontSize: 7,
    color: "#008B8B",
    letterSpacing: 2,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
  },

  // Page padding
  pageBody: {
    paddingHorizontal: 40,
  },

  // Stat cards row
  statRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statCardHighlight: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  statLabel: {
    fontSize: 7,
    color: "#94A3B8",
    letterSpacing: 1,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: "#1E293B",
    fontFamily: "Helvetica-Bold",
  },
  statValueBlue: {
    fontSize: 16,
    color: "#1D4ED8",
    fontFamily: "Helvetica-Bold",
  },
  statSub: {
    fontSize: 8,
    color: "#94A3B8",
    marginTop: 2,
  },

  // Area card
  areaCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  areaCardHeader: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  areaCardName: {
    fontSize: 12,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
  },
  areaCardBadge: {
    backgroundColor: "#008B8B",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  areaCardBadgeText: {
    fontSize: 8,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
  },
  areaCardBody: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  areaMetric: {
    width: "22%",
  },
  areaMetricLabel: {
    fontSize: 7,
    color: "#94A3B8",
    marginBottom: 2,
  },
  areaMetricValue: {
    fontSize: 11,
    color: "#1E293B",
    fontFamily: "Helvetica-Bold",
  },
  areaMetricGreen: {
    fontSize: 11,
    color: "#059669",
    fontFamily: "Helvetica-Bold",
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0F234E",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 8,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
  },
  tableCell: {
    fontSize: 9,
    color: "#374151",
  },
  tableCellBold: {
    fontSize: 9,
    color: "#1E293B",
    fontFamily: "Helvetica-Bold",
  },
  tableCellGreen: {
    fontSize: 9,
    color: "#059669",
    fontFamily: "Helvetica-Bold",
  },

  // Text styles
  bodyText: {
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.7,
    marginBottom: 12,
  },
  callout: {
    backgroundColor: "#F0FDF4",
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderRadius: 4,
  },
  calloutText: {
    fontSize: 10,
    color: "#065F46",
    lineHeight: 1.6,
  },
  disclaimer: {
    fontSize: 8,
    color: "#94A3B8",
    lineHeight: 1.6,
    marginTop: 8,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },

  // Footer
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: "#94A3B8",
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatINR(v: number): string {
  if (v >= 10_000_000) return `Rs.${(v / 10_000_000).toFixed(2)} Cr`;
  if (v >= 100_000)    return `Rs.${(v / 100_000).toFixed(1)} L`;
  return `Rs.${v.toLocaleString("en-IN")}`;
}

function getTemperatureLabel(area: AreaData): string {
  if (area.days_on_market_avg < 35 && area.unsold_inventory_months < 4) return "HOT";
  if (area.days_on_market_avg < 55 && area.unsold_inventory_months < 6) return "WARM";
  if (area.days_on_market_avg > 75 || area.unsold_inventory_months > 9) return "COOLING";
  return "BALANCED";
}

function getBadgeColor(temp: string): string {
  return temp === "HOT" ? "#EF4444"
    : temp === "WARM"    ? "#F59E0B"
    : temp === "COOLING" ? "#64748B"
    : "#3B82F6";
}

// ── Page footer ───────────────────────────────────────────────────────────────
function Footer({ page }: { page: number }) {
  return (
    <View style={S.pageFooter} fixed>
      <Text style={S.footerText}>
        Pattem Estates · Bangalore Price Intelligence Report · June 2026
      </Text>
      <Text style={S.footerText}>Page {page}</Text>
    </View>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface MarketReportProps {
  areas: AreaData[];
  selectedAreas: AreaData[];
  userName?: string;
  commentary: Record<string, string>;
}

// ── Document ──────────────────────────────────────────────────────────────────
export function MarketReportDocument({
  areas,
  selectedAreas,
  userName,
  commentary,
}: MarketReportProps) {
  // City stats
  const avgPrice = Math.round(
    areas.reduce((s, a) => s + a.current_price_psft, 0) / areas.length
  );
  const topYoY = [...areas].sort((a, b) => b.yoy_change_pct - a.yoy_change_pct)[0];
  const topYield = [...areas].sort((a, b) => b.rental_yield_pct - a.rental_yield_pct)[0];
  const topNRI   = [...areas].sort((a, b) => b.nri_interest_score - a.nri_interest_score)[0];

  // Ranked table areas (top 8 by YoY)
  const ranked = [...areas]
    .sort((a, b) => b.yoy_change_pct - a.yoy_change_pct)
    .slice(0, 8);

  const displayAreas = selectedAreas.length > 0 ? selectedAreas : areas.slice(0, 4);

  return (
    <Document
      title="Pattem Estates — Bangalore Price Intelligence Report"
      author="Pattem Estates"
    >

      {/* ── Cover page ──────────────────────────────────────────────────── */}
      <Page size="A4" style={S.coverPage}>
        <View style={S.coverAccent} />
        <View style={S.coverBody}>
          <Text style={S.coverTag}>PATTEM ESTATES · MARKET INTELLIGENCE</Text>

          <Text style={S.coverTitle}>Bangalore Real Estate</Text>
          <Text style={S.coverTitle}>Market Intelligence</Text>
          <Text style={S.coverSubtitle}>Price Intelligence Report — June 2026</Text>

          <View style={S.coverDivider} />

          <Text style={S.coverMeta}>
            {userName ? `Prepared for: ${userName}` : "Prepared for: Prospective Investor"}
          </Text>
          <Text style={S.coverMeta}>Coverage: 12 Bangalore Micro-Markets</Text>
          <Text style={S.coverMeta}>Data Sources: NHB RESIDEX · 99acres · RBI DBIE · Pattem Estates</Text>
          <Text style={S.coverMeta}>Report Type: Quarterly Price Intelligence · Q2 2026</Text>

          {/* City highlights */}
          <View style={[S.statRow, { marginTop: 32 }]}>
            <View style={[S.statCard, { backgroundColor: "#1A3360" }]}>
              <Text style={[S.statLabel, { color: "#8899AA" }]}>CITY AVG PRICE</Text>
              <Text style={[S.statValue, { color: "#FFFFFF" }]}>
                Rs.{avgPrice.toLocaleString("en-IN")}/sqft
              </Text>
            </View>
            <View style={[S.statCard, { backgroundColor: "#1A3360" }]}>
              <Text style={[S.statLabel, { color: "#8899AA" }]}>TOP PERFORMER</Text>
              <Text style={[S.statValue, { color: "#F5A623" }]}>
                +{topYoY.yoy_change_pct}% YoY
              </Text>
              <Text style={[S.statSub, { color: "#8899AA" }]}>{topYoY.name}</Text>
            </View>
            <View style={[S.statCard, { backgroundColor: "#1A3360" }]}>
              <Text style={[S.statLabel, { color: "#8899AA" }]}>BEST NRI PICK</Text>
              <Text style={[S.statValue, { color: "#008B8B" }]}>
                {topNRI.name}
              </Text>
              <Text style={[S.statSub, { color: "#8899AA" }]}>
                NRI score {topNRI.nri_interest_score}/10
              </Text>
            </View>
          </View>

          <View style={S.coverFooter}>
            <Text style={S.coverFooterText}>
              This report is prepared by Pattem Estates based on publicly available market
              data and proprietary analytics. It is intended for informational purposes
              only and does not constitute investment advice.
            </Text>
          </View>
        </View>
        <View style={S.coverGold} />
      </Page>

      {/* ── Page 2: Executive Summary ──────────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <View style={S.sectionHeader}>
          <Text style={S.sectionTag}>SECTION 01</Text>
          <Text style={S.sectionTitle}>Executive Summary</Text>
        </View>

        <View style={S.pageBody}>
          <Text style={S.bodyText}>
            The Bangalore residential real estate market continues to demonstrate strong
            fundamentals in Q2 2026, with the city average standing at
            Rs.{avgPrice.toLocaleString("en-IN")}/sqft across the 12 micro-markets
            tracked in this report. Transaction volumes remain healthy, supported by
            robust IT sector employment, infrastructure investments, and sustained NRI
            demand — particularly in the northern and eastern corridors.
          </Text>

          <View style={S.callout}>
            <Text style={S.calloutText}>
              Key Insight: {topYoY.name} leads city appreciation at +{topYoY.yoy_change_pct}%
              YoY, driven by {topYoY.upcoming_infrastructure[0] ?? "upcoming infrastructure"}{" "}
              and proximity to {topYoY.key_employers_nearby[0] ?? "major employers"}.
              Devanahalli and Sarjapur Road continue to attract early-stage investors
              ahead of infrastructure completions.
            </Text>
          </View>

          <Text style={S.bodyText}>
            Rental yields remain most attractive in Electronic City ({
              areas.find(a => a.id === "electronic-city")?.rental_yield_pct ?? 4.3
            }%) and Devanahalli ({
              areas.find(a => a.id === "devanahalli")?.rental_yield_pct ?? 4.8
            }%), while premium localities such as Indiranagar and Koramangala offer
            lower yields but superior capital preservation and liquidity. The NRI segment
            shows particular interest in airport-adjacent and IT-corridor properties,
            with {topNRI.name} scoring highest on NRI interest at {topNRI.nri_interest_score}/10.
          </Text>

          {/* Summary stats grid */}
          <View style={S.statRow}>
            <View style={S.statCard}>
              <Text style={S.statLabel}>AREAS ANALYSED</Text>
              <Text style={S.statValue}>12</Text>
              <Text style={S.statSub}>Bangalore micro-markets</Text>
            </View>
            <View style={S.statCardHighlight}>
              <Text style={S.statLabel}>BEST YOY GROWTH</Text>
              <Text style={S.statValueBlue}>+{topYoY.yoy_change_pct}%</Text>
              <Text style={S.statSub}>{topYoY.name}</Text>
            </View>
            <View style={S.statCard}>
              <Text style={S.statLabel}>BEST RENTAL YIELD</Text>
              <Text style={S.statValue}>{topYield.rental_yield_pct}%</Text>
              <Text style={S.statSub}>{topYield.name}</Text>
            </View>
            <View style={S.statCard}>
              <Text style={S.statLabel}>BEST NRI PICK</Text>
              <Text style={S.statValue}>{topNRI.name}</Text>
              <Text style={S.statSub}>Score {topNRI.nri_interest_score}/10</Text>
            </View>
          </View>
        </View>
        <Footer page={2} />
      </Page>

      {/* ── Page 3: Area Rankings Table ────────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <View style={S.sectionHeader}>
          <Text style={S.sectionTag}>SECTION 02</Text>
          <Text style={S.sectionTitle}>Area Rankings — Sorted by YoY Appreciation</Text>
        </View>

        <View style={S.pageBody}>
          <View style={S.table}>
            <View style={S.tableHeader}>
              {["#", "Area", "Rs./sqft", "YoY %", "Yield", "5Y CAGR", "Demand", "NRI Score"].map((h, i) => (
                <Text
                  key={h}
                  style={[S.tableHeaderCell, {
                    flex: i === 1 ? 2.2 : i === 0 ? 0.5 : 1,
                  }]}
                >
                  {h}
                </Text>
              ))}
            </View>

            {ranked.map((area, i) => {
              const temp = getTemperatureLabel(area);
              const Row = i % 2 === 0 ? S.tableRow : S.tableRowAlt;
              return (
                <View key={area.id} style={Row}>
                  <Text style={[S.tableCellBold, { flex: 0.5 }]}>{i + 1}</Text>
                  <Text style={[S.tableCellBold, { flex: 2.2 }]}>{area.name}</Text>
                  <Text style={[S.tableCell, { flex: 1 }]}>
                    Rs.{area.current_price_psft.toLocaleString("en-IN")}
                  </Text>
                  <Text style={[S.tableCellGreen, { flex: 1 }]}>
                    +{area.yoy_change_pct}%
                  </Text>
                  <Text style={[S.tableCell, { flex: 1 }]}>
                    {area.rental_yield_pct}%
                  </Text>
                  <Text style={[S.tableCell, { flex: 1 }]}>
                    {area.five_year_cagr_pct}%
                  </Text>
                  <Text style={[
                    S.tableCell,
                    { flex: 1, color: getBadgeColor(temp), fontFamily: "Helvetica-Bold" },
                  ]}>
                    {temp}
                  </Text>
                  <Text style={[S.tableCell, { flex: 1 }]}>
                    {area.nri_interest_score}/10
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Badge legend */}
          <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
            {[
              { label: "HOT — Fast-moving, low inventory, high demand", color: "#EF4444" },
              { label: "WARM — Strong buyer activity, balanced supply", color: "#F59E0B" },
              { label: "BALANCED — Normal market conditions", color: "#3B82F6" },
              { label: "COOLING — Higher inventory, longer selling times", color: "#64748B" },
            ].map((b) => (
              <View key={b.label} style={{ flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: b.color, marginRight: 4 }} />
                <Text style={{ fontSize: 7, color: "#64748B" }}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <Footer page={3} />
      </Page>

      {/* ── Pages 4+: Area Deep Dives ───────────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <View style={S.sectionHeader}>
          <Text style={S.sectionTag}>SECTION 03</Text>
          <Text style={S.sectionTitle}>Area Intelligence — Deep Dives</Text>
        </View>

        <View style={S.pageBody}>
          {displayAreas.map((area) => {
            const temp = getTemperatureLabel(area);
            const areaCommentary = commentary[area.id];
            return (
              <View key={area.id} style={S.areaCard}>
                {/* Card header */}
                <View style={S.areaCardHeader}>
                  <Text style={S.areaCardName}>{area.name}</Text>
                  <View style={[S.areaCardBadge, { backgroundColor: getBadgeColor(temp) }]}>
                    <Text style={S.areaCardBadgeText}>{temp} MARKET</Text>
                  </View>
                </View>

                {/* Metrics */}
                <View style={S.areaCardBody}>
                  {[
                    { label: "Price/sqft", value: `Rs.${area.current_price_psft.toLocaleString("en-IN")}`, green: false },
                    { label: "YoY Change", value: `+${area.yoy_change_pct}%`, green: true },
                    { label: "Rental Yield", value: `${area.rental_yield_pct}%`, green: false },
                    { label: "5Y CAGR", value: `${area.five_year_cagr_pct}%`, green: true },
                    { label: "Days on Market", value: `${area.days_on_market_avg}d`, green: false },
                    { label: "Inventory", value: `${area.unsold_inventory_months} mo`, green: false },
                    { label: "NRI Interest", value: `${area.nri_interest_score}/10`, green: false },
                    { label: "New Launches", value: `${area.new_launches_last_quarter} Q`, green: false },
                  ].map(({ label, value, green }) => (
                    <View key={label} style={S.areaMetric}>
                      <Text style={S.areaMetricLabel}>{label}</Text>
                      <Text style={green ? S.areaMetricGreen : S.areaMetricValue}>
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* AI commentary if available */}
                {areaCommentary && (
                  <View style={{
                    borderTopWidth: 1,
                    borderTopColor: "#E2E8F0",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: "#F8FAFF",
                  }}>
                    <Text style={{ fontSize: 7, color: "#6366F1", fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
                      AI MARKET COMMENTARY
                    </Text>
                    <Text style={{ fontSize: 8.5, color: "#374151", lineHeight: 1.6 }}>
                      {areaCommentary}
                    </Text>
                  </View>
                )}

                {/* Employers + infrastructure */}
                <View style={{
                  paddingHorizontal: 16,
                  paddingBottom: 12,
                  paddingTop: 8,
                  flexDirection: "row",
                  gap: 16,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 7, color: "#94A3B8", marginBottom: 4 }}>
                      KEY EMPLOYERS NEARBY
                    </Text>
                    <Text style={{ fontSize: 8.5, color: "#374151" }}>
                      {area.key_employers_nearby.join(" · ")}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 7, color: "#94A3B8", marginBottom: 4 }}>
                      UPCOMING INFRASTRUCTURE
                    </Text>
                    <Text style={{ fontSize: 8.5, color: "#374151" }}>
                      {area.upcoming_infrastructure.join(" · ")}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        <Footer page={4} />
      </Page>

      {/* ── Page 5: Disclaimer + CTA ───────────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <View style={S.sectionHeader}>
          <Text style={S.sectionTag}>SECTION 04</Text>
          <Text style={S.sectionTitle}>Disclaimer & Next Steps</Text>
        </View>

        <View style={S.pageBody}>
          <View style={S.callout}>
            <Text style={[S.calloutText, { fontFamily: "Helvetica-Bold", marginBottom: 6 }]}>
              Ready to invest in Bangalore real estate?
            </Text>
            <Text style={S.calloutText}>
              Our advisory team specialises in helping NRI and HNI buyers identify
              high-potential properties before the market catches up. Get a personalised
              investment brief for your shortlisted areas.
            </Text>
            <Text style={[S.calloutText, { marginTop: 8, fontFamily: "Helvetica-Bold" }]}>
              WhatsApp: +91 98765 43210  ·  pattemestates.com
            </Text>
          </View>

          <Text style={[S.bodyText, { fontFamily: "Helvetica-Bold", color: "#1E293B" }]}>
            Data Sources
          </Text>
          <Text style={S.bodyText}>
            Price data derived from NHB RESIDEX quarterly indices, 99acres Bangalore
            micro-market reports, RBI DBIE interest rate publications, and Pattem
            Estates proprietary transaction records. All prices are indicative averages
            for the area and may vary significantly by project, floor, and configuration.
          </Text>

          <Text style={[S.bodyText, { fontFamily: "Helvetica-Bold", color: "#1E293B" }]}>
            Disclaimer
          </Text>
          <Text style={S.disclaimer}>
            This report is prepared by Pattem Estates for informational purposes only.
            It does not constitute financial, legal, or investment advice. Real estate
            investments are subject to market risks. Past appreciation is not indicative
            of future returns. Rental yields are estimates based on prevailing market
            rates and may vary. Buyers are advised to conduct independent due diligence
            and consult qualified professionals before making any investment decision.
            RERA registrations for specific projects should be verified on the Karnataka
            RERA portal (rera.karnataka.gov.in) before transacting.
          </Text>

          <Text style={[S.bodyText, { marginTop: 16, color: "#94A3B8", fontSize: 8 }]}>
            © 2026 Pattem Estates Pvt. Ltd. All rights reserved.
            Report generated: June 2026. For personal use only — not for redistribution.
          </Text>
        </View>
        <Footer page={5} />
      </Page>

    </Document>
  );
}