import { NextResponse } from "next/server";
import type { Country } from "@/lib/types";
import countriesData from "../../../../data/countries.json";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(countriesData as Country[]);
}
