import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const LEADS_FILE = path.join(process.cwd(), "leads.json");

function readLeads(): unknown[] {
  try {
    if (!fs.existsSync(LEADS_FILE)) return [];
    return JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeLeads(leads: unknown[]): void {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const lead = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ...body,
    status: "new",
  };

  const leads = readLeads();
  leads.unshift(lead);
  writeLeads(leads);

  return NextResponse.json({ success: true, id: lead.id });
}

export async function GET() {
  const leads = readLeads();
  return NextResponse.json({ leads });
}