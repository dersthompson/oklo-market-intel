"use client";

import type { ScoredCountry } from "@/lib/types";
import { scoreLabel } from "@/lib/scoring";

interface CountryHoverCardProps {
  country: ScoredCountry | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  FOCUS: { bg: "var(--focus-color)", text: "#fff", label: "Focus" },
  TRACK: { bg: "var(--track-color)", text: "#fff", label: "Track" },
  SHELVE: { bg: "var(--shelve-color)", text: "#fff", label: "Shelve" },
};

export function CountryHoverCard({ country }: CountryHoverCardProps) {
  if (!country) return null;

  const s = STATUS_STYLES[country.status] ?? STATUS_STYLES.TRACK;
  const scoreClass =
    country.weightedScore >= 65
      ? "score-high"
      : country.weightedScore >= 45
      ? "score-mid"
      : "score-low";

  return (
    <div className="absolute bottom-6 left-6 z-[9999] bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-2xl p-4 w-64 pointer-events-none">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-sm text-[var(--foreground)]">{country.name}</h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">{country.region === "EU" ? "Europe" : "SE Asia"}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreClass}`}>
            {country.weightedScore}/100
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: s.bg, color: s.text }}
          >
            {s.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {[
          { label: "Energy Price", val: country.energyPriceScore },
          { label: "Carbon Goals", val: country.carbonCommitmentScore },
          { label: "Nuclear Frame", val: country.nuclearFrameworkScore },
          { label: "Deregulation", val: country.marketDeregScore },
          { label: "Partners", val: country.partnerEcosystemScore },
          { label: "Geo Safety", val: country.geopoliticalRiskScore },
        ].map(({ label, val }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--muted)]">{label}</span>
            <div className="flex items-center gap-1">
              <div className="w-12 h-1.5 rounded-full bg-[var(--card-border)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${val * 10}%`,
                    background: val >= 7 ? "var(--success)" : val >= 4 ? "var(--warning)" : "var(--danger)",
                  }}
                />
              </div>
              <span className="text-[10px] font-semibold text-[var(--foreground)] w-4 text-right">{val}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[var(--muted)] leading-relaxed border-t border-[var(--card-border)] pt-2">
        <span className="font-semibold text-[var(--warning)]">! </span>
        {country.topHurdle}
      </p>
      <p className="text-[10px] text-[var(--accent)] mt-1.5 font-medium">
        Click to explore
      </p>
    </div>
  );
}
