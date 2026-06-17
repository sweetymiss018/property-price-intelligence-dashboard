import { NextRequest, NextResponse } from "next/server";
import { AreaData } from "@/data/areaData";

// ── Mock fallback — uses real area data, looks AI-generated ──────────────────
function getMockCommentary(area: AreaData): string {
  const trend =
    area.yoy_change_pct >= 15 ? "exceptional momentum"
    : area.yoy_change_pct >= 12 ? "strong upward momentum"
    : area.yoy_change_pct >= 9  ? "steady appreciation"
    : "measured growth";

  const supplySignal =
    area.unsold_inventory_months < 4 ? "tight supply conditions"
    : area.unsold_inventory_months < 6 ? "balanced inventory levels"
    : "elevated inventory";

  const demandSignal =
    area.days_on_market_avg < 35 ? "properties moving exceptionally fast"
    : area.days_on_market_avg < 50 ? "healthy buyer absorption"
    : "steady transaction pace";

  const yieldAngle =
    area.rental_yield_pct >= 4.5
      ? `rental yields of ${area.rental_yield_pct}% make this one of Bangalore's most attractive investment corridors`
      : area.rental_yield_pct >= 3.5
      ? `rental yields of ${area.rental_yield_pct}% offer solid income returns alongside capital appreciation`
      : `end-user demand rather than rental income is the primary investment thesis here`;

  const infraDriver = area.upcoming_infrastructure[0] ?? "improving civic infrastructure";
  const employerDriver = area.key_employers_nearby[0] ?? "major IT employers";

  const outlook =
    area.yoy_change_pct >= 14
      ? `With ${area.new_launches_last_quarter} new project launches last quarter and ${area.days_on_market_avg}-day average selling times, near-term price pressure remains firmly upward — early entry before infrastructure completion is the optimal window.`
      : area.yoy_change_pct >= 10
      ? `The ${infraDriver} completion timeline makes the next 18–24 months a compelling accumulation window before price discovery fully reflects these catalysts.`
      : `While appreciation is moderate, ${yieldAngle}, making it suitable for income-focused investors with a 5–7 year horizon.`;

  return (
    `${area.name} is demonstrating ${trend} at ₹${area.current_price_psft.toLocaleString("en-IN")}/sqft, ` +
    `up ${area.yoy_change_pct}% year-on-year — driven primarily by proximity to ${employerDriver} ` +
    `and the anticipated ${infraDriver}. ` +
    `${supplySignal.charAt(0).toUpperCase() + supplySignal.slice(1)} with ${demandSignal} at ${area.days_on_market_avg} days on market ` +
    `signal a market where sellers hold pricing power; ${yieldAngle}. ` +
    outlook
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const area: AreaData = body.area;

  if (!area) {
    return NextResponse.json({ error: "area is required" }, { status: 400 });
  }

  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_AI === "true"
    || !process.env.ANTHROPIC_API_KEY;

    console.log("USE_MOCK:", process.env.NEXT_PUBLIC_USE_MOCK_AI);
console.log("API_KEY:", process.env.ANTHROPIC_API_KEY);
console.log("useMock:", useMock);

  // ── Mock path ─────────────────────────────────────────────────────────────
  if (useMock) {
    // Small delay to simulate API latency — makes the loading state visible
    await new Promise((r) => setTimeout(r, 900));
    return NextResponse.json({ commentary: getMockCommentary(area) });
  }

  // ── Real Claude API path ──────────────────────────────────────────────────
  try {
    const systemPrompt = `You are a senior real estate market analyst for Pattem Estates, India's advisory-first real estate platform. Write concise, data-backed market commentary for a specific Bangalore micro-market. Your audience is a buyer deciding whether to invest.

Rules:
- Write exactly 3 sentences.
- Sentence 1: Current market status using the price and trend data provided.
- Sentence 2: Key driver explaining WHY prices are moving this way.
- Sentence 3: Forward-looking insight or actionable recommendation.
- Use specific numbers from the data. Never be vague.
- Tone: authoritative, advisory, confident. Not salesy. Not generic.
- Do not start with "I" or mention Pattem Estates in the output.`;

    const userPrompt = `Area: ${area.name}, Bangalore (${area.zone} zone)
Current price: ₹${area.current_price_psft.toLocaleString("en-IN")}/sqft
YoY change: +${area.yoy_change_pct}%
5-year CAGR: ${area.five_year_cagr_pct}%
Rental yield: ${area.rental_yield_pct}%
Days on market: ${area.days_on_market_avg} days (${area.days_on_market_avg < 45 ? "fast-moving" : "standard pace"})
Inventory: ${area.unsold_inventory_months} months (${area.unsold_inventory_months < 4 ? "tight supply" : "balanced"})
New launches last quarter: ${area.new_launches_last_quarter}
Key employers nearby: ${area.key_employers_nearby.join(", ")}
Upcoming infrastructure: ${area.upcoming_infrastructure.join(", ")}
NRI interest score: ${area.nri_interest_score}/10`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      // Fall back to mock if API call fails
      return NextResponse.json({ commentary: getMockCommentary(area) });
    }

    const data = await response.json();
    const commentary = data.content?.[0]?.text ?? getMockCommentary(area);
    return NextResponse.json({ commentary });

  } catch {
    // Always fall back gracefully
    return NextResponse.json({ commentary: getMockCommentary(area) });
  }
}