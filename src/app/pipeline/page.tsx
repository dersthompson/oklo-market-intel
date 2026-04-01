"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Country, WeightConfig, ScoredCountry } from "@/lib/types";
import { DEFAULT_WEIGHTS, WEIGHT_LABELS } from "@/lib/types";
import { scoreCountries, scoreLabel } from "@/lib/scoring";
import countriesRaw from "../../../data/countries.json";

const allCountries = countriesRaw as Country[];
type SortKey = "weightedScore" | "name" | "region" | "status" | "avgElectricityPrice";
type SortDir = "asc" | "desc";

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  FOCUS: { color: "var(--focus-color)", label: "Focus" },
  TRACK: { color: "var(--track-color)", label: "Track" },
  SHELVE: { color: "var(--shelve-color)", label: "Shelve" },
};

const REGION_LABELS: Record<string, string> = { EU: "Europe", SE_ASIA: "SE Asia" };
const STRATEGY_LABELS: Record<string, string> = { ELECTRONS: "Electrons", JV: "Joint Venture", BOTH: "Both" };

export default function PipelinePage() {
  const [weights] = useState<WeightConfig>(DEFAULT_WEIGHTS);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "weightedScore", dir: "desc" });
  const [regionFilter, setRegionFilter] = useState<"ALL" | "EU" | "SE_ASIA">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "FOCUS" | "TRACK" | "SHELVE">("ALL");
  const [search, setSearch] = useState("");

  const scored: ScoredCountry[] = useMemo(() => scoreCountries(allCountries, weights), [weights]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return scored
      .filter((c) => regionFilter === "ALL" || c.region === regionFilter)
      .filter((c) => statusFilter === "ALL" || c.status === statusFilter)
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.topHurdle.toLowerCase().includes(q))
      .sort((a, b) => {
        const dir = sort.dir === "asc" ? 1 : -1;
        const av = a[sort.key], bv = b[sort.key];
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
  }, [scored, regionFilter, statusFilter, search, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((prev) => prev.key === key ? { key, dir: prev.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" });

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort.key === k ? <span className="ml-1">{sort.dir === "desc" ? "v" : "^"}</span> : <span className="ml-1 opacity-30">-</span>;

  const focusCount = scored.filter((c) => c.status === "FOCUS").length;
  const trackCount = scored.filter((c) => c.status === "TRACK").length;
  const avgScore = Math.round(scored.reduce((s, c) => s + c.weightedScore, 0) / scored.length);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Market Pipeline</h1>
          <p className="text-sm text-[var(--muted)] mt-1">All {scored.length} countries scored across EU and SE Asia.</p>
        </div>
        <Link href="/" className="text-sm text-[var(--accent)] hover:underline">Back to Map</Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Markets", value: scored.length, sub: "under assessment" },
          { label: "Focus Markets", value: focusCount, sub: "priority pursuit", color: "var(--focus-color)" },
          { label: "Track Markets", value: trackCount, sub: "monitor & build", color: "var(--track-color)" },
          { label: "Avg. Score", value: avgScore, sub: "out of 100" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-5 py-4">
            <div className="text-3xl font-black" style={{ color: color || "var(--foreground)" }}>{value}</div>
            <div className="text-sm font-semibold text-[var(--foreground)] mt-1">{label}</div>
            <div className="text-xs text-[var(--muted)]">{sub}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input type="text" placeholder="Search markets..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-52" />
        <div className="flex items-center gap-1.5">
          {(["ALL", "EU", "SE_ASIA"] as const).map((r) => (
            <button key={r} onClick={() => setRegionFilter(r)} className="text-xs px-2.5 py-1 rounded-md border transition-all"
              style={{ background: regionFilter === r ? "var(--accent)" : "transparent", color: regionFilter === r ? "#fff" : "var(--muted)", borderColor: regionFilter === r ? "var(--accent)" : "var(--card-border)" }}>
              {r === "ALL" ? "All Regions" : r === "EU" ? "Europe" : "SE Asia"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {(["ALL", "FOCUS", "TRACK", "SHELVE"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className="text-xs px-2.5 py-1 rounded-md border transition-all"
              style={{ background: statusFilter === s ? (s === "ALL" ? "var(--accent)" : STATUS_STYLES[s]?.color) : "transparent", color: statusFilter === s ? "#fff" : "var(--muted)", borderColor: statusFilter === s ? (s === "ALL" ? "var(--accent)" : STATUS_STYLES[s]?.color) : "var(--card-border)" }}>
              {s === "ALL" ? "All Status" : STATUS_STYLES[s]?.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--muted)] ml-auto">{filtered.length} results</span>
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--background)]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">#</th>
                {([["name","Country"],["region","Region"],["weightedScore","Score"],["status","Status"],["avgElectricityPrice","$/MWh"]] as [SortKey,string][]).map(([key, label]) => (
                  <th key={key} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase cursor-pointer hover:text-[var(--foreground)]" onClick={() => toggleSort(key)}>
                    {label}<SortIcon k={key} />
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Strategy</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Top Hurdle</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const s = STATUS_STYLES[c.status];
                const scoreClass = c.weightedScore >= 65 ? "score-high" : c.weightedScore >= 45 ? "score-mid" : "score-low";
                return (
                  <tr key={c.code} className="border-b border-[var(--card-border)] hover:bg-[var(--accent-light)] transition-colors">
                    <td className="px-4 py-3 text-xs text-[var(--muted)] font-mono">{i + 1}</td>
                    <td className="px-4 py-3"><Link href={`/country/${c.code}`} className="font-semibold text-[var(--foreground)] hover:text-[var(--accent)]">{c.name}</Link></td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">{REGION_LABELS[c.region]}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded ${scoreClass}`}>{c.weightedScore}</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: s?.color + "22", color: s?.color }}>{s?.label}</span></td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">${c.avgElectricityPrice}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">{STRATEGY_LABELS[c.saleStrategy]}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)] max-w-xs"><span className="line-clamp-2">{c.topHurdle}</span></td>
                    <td className="px-4 py-3"><Link href={`/country/${c.code}`} className="text-xs text-[var(--accent)] hover:underline">Deep dive</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
