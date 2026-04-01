import { NextResponse } from "next/server";
import type { Country } from "@/lib/types";
import countriesData from "../../../../../data/countries.json";

export const dynamic = "force-static";

export function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  return params.then(({ code }) => {
    const country = (countriesData as Country[]).find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );
    if (!country) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(country);
  });
}
