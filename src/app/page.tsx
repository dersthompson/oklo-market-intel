"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Country, ScoredCountry, WeightConfig } from "@/lib/types";
import { DEFAULT_WEIGHTS } from "@/lib/types";
import { scoreCountries, computeWeightedScore } from "@/lib/scoring";
import { FilterPanel } from "@/components/FilterPanel";
import { CountryHoverCard } from "@/components/CountryHoverCard";
import countriesRaw from "../../data/countries.json";

const WorldMap = dynamic(
  () => import("@/components/WorldMap").then((m) => m.WorldMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#1a1a2e] rounded-xl animate-pulse" /> }
);

interface FilterState {
  minScore: number;
  regions: Set<string>;
  statuses: Set<string>;
  saleStrategies: Set<string>;
  carbonTargets: Set<string>;
  requireNuclearFramework: boolean;
  requireDeregulated: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  minScore: 0,
  regions: new Set(["EU", "SE_ASIA"]),
  statuses: new Set(["FOCUS", "TRACK", "SHELVE"]),
  saleStrategies: new Set(["ELECTRONS", "JV", "BOTH"]),
  carbonTargets: new Set(["2030", "2040", "2050", "None"]),
  requireNuclearFramework: false,
  requireDeregulated: false,
};

const allCountries = countriesRaw as Country[];

export default function MapPage() {
  const [weights, setWeights] = useState<WeightConfig>(DEFAULT_WEIGHTS);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const scoredCountries: ScoredCountry[] = useMemo(
    () => scoreCountries(allCountries, weights),
    [weights]
  );

  const activeFilters = useMemo(() => {
    const passing = new Set<string>();
    for (const c of scoredCountries) {
      const score = computeWeightedScore(c, weights);
      if (score < filters.minScore) continue;
      if (!filters.regions.has(c.region)) continue;
      if (!filters.statuses.has(c.status)) continue;
      if (!filters.saleStrategies.has(c.saleStrategy)) continue;
      if (!filters.carbonTargets.has(c.carbonTarget)) continue;
      if (filters.requireNuclearFramework && c.nuclearFrameworkScore < 4) continue;
      if (filters.requireDeregulated && c.marketDeregScore < 5) continue;
      passing.add(c.code);
    }
    return passing;
  }, [scoredCountries, weights, filters]);

  const hoveredCountry = useMemo(
    () => hoveredCode ? scoredCountries.find((c) => c.code === hoveredCode) ?? null : null,
    [hoveredCode, scoredCountries]
  );

  const sidebarCountries = useMemo(() => {
    const q = search.toLowerCase().trim();
    return scoredCountries
      .filter((c) => activeFilters.has(c.code))
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [scoredCountries, activeFilters, search]);

  const handleHover = useCallback((code: string | null) => { setHoveredCode(code); }, []);

  return (
    <div className="flex h-[calc(100vh-53px)] overflow-hidden">
      <FilterPanel filters={filters} weights={weights} onFilterChange={setFilters} onWeightChange={setWeights} qualifyingCount={activeFilters.size} totalCount={scoredCountries.length} />
      <div className="flex-1 relative overflow-hidden">
        <WorldMap countries={scoredCountries} weights={weights} activeFilters={activeFilters} onCountryHover={handleHover} />
        {hoveredCountry && activeFilters.has(hoveredCountry.code) && <CountryHoverCard country={hoveredCountry} />}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[var(--card)]/90 backdrop-blur-sm border border-[var(--card-border)] rounded-full px-4 py-1.5 flex items-center gap-4 z-[9999] text-[11px]">
          <span className="font-semibold text-[var(--foreground)]">Score:</span>
          {[
            { color: "#991b1b", label: "< 25" },
            { color: "#ca8a04", label: "25-45" },
            { color: "#65a30d", label: "45-55" },
            { color: "#16a34a", label: "55-70" },
            { color: "#15803d", label: "70+" },
            { color: "#94a3b8", label: "Filtered" },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color }} />
              <span className="text-[var(--muted)]">{label}</span>
            </span>
          ))}
        </div>
      </div>
      <aside className="w-64 shrink-0 flex flex-col border-l border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <div className="px-3 py-3 border-b border-[var(--card-border)]">
          <input type="text" placeholder="Search countries..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-xs placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
          <p className="text-[10px] text-[var(--muted)] mt-1.5">{sidebarCountries.length} qualifying</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebarCountries.map((c) => {
            const scoreClass = c.weightedScore >= 65 ? "score-high" : c.weightedScore >= 45 ? "score-mid" : "score-low";
            return (
              <a key={c.code} href={`/country/${c.code}`}
                className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--card-border)] hover:bg-[var(--accent-light)] transition-colors group">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--accent)]">{c.name}</div>
                  <div className="text-[10px] text-[var(--muted)] mt-0.5">
                    {c.region === "EU" ? "Europe" : "SE Asia"} · {c.saleStrategy === "ELECTRONS" ? "Electrons" : c.saleStrategy === "JV" ? "JV" : "Both"}
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 ${scoreClass}`}>{c.weightedScore}</span>
              </a>
            );
          })}
          {sidebarCountries.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-[var(--muted)]">No countries match current filters</div>
          )}
        </div>
        <div className="px-3 py-3 border-t border-[var(--card-border)]">
          <a href="/pipeline" className="block w-full text-center text-xs font-semibold bg-[var(--accent)] text-white rounded-lg py-2 hover:opacity-90 transition-opacity">
            View Pipeline
          </a>
        </div>
      </aside>
    </div>
  );
}
