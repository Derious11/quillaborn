import { NextResponse } from "next/server";

// 1. Define allowed table keys as a type
const TABLES = {
  waitlist: "Waitlist",
  bug: "Bugs",
  feature: "Features",
} as const;

type TableType = keyof typeof TABLES;

// Helper: check for missing env vars
function checkEnv() {
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    throw new Error("Airtable environment variables not set.");
  }
}

export async function POST(req: Request) {
  try {
    checkEnv();

    const body = await req.json();

    // 2. Ensure type is a string and is a valid key
    const { type, ...fields } = body;

    if (!type || typeof type !== "string" || !(type in TABLES)) {
      return NextResponse.json(
        { error: "Invalid or missing 'type' field." },
        { status: 400 }
      );
    }

    if (Object.keys(fields).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to submit to Airtable." },
        { status: 400 }
      );
    }

    // 3. Cast type to TableType
    const tableName = TABLES[type as TableType];

    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(
        tableName
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
        body: JSON.stringify({ fields }),
      }
    );

    if (!res.ok) {
      const msg = await res.text();
      return NextResponse.json(
        { error: "Airtable error", detail: msg },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
