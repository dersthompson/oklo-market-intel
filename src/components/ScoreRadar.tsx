"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Country, WeightConfig } from "@/lib/types";

interface ScoreRadarProps {
  country: Country;
  weights?: WeightConfig;
}

export function ScoreRadar({ country }: ScoreRadarProps) {
  const data = [
    { subject: "Energy\nPrice", score: country.energyPriceScore, fullMark: 10 },
    { subject: "Carbon\nGoals", score: country.carbonCommitmentScore, fullMark: 10 },
    { subject: "Nuclear\nFramework", score: country.nuclearFrameworkScore, fullMark: 10 },
    { subject: "Deregulation", score: country.marketDeregScore, fullMark: 10 },
    { subject: "Partners", score: country.partnerEcosystemScore, fullMark: 10 },
    { subject: "Licensing\nClarity", score: country.licensingClarityScore, fullMark: 10 },
    { subject: "Geo\nSafety", score: country.geopoliticalRiskScore, fullMark: 10 },
    { subject: "Financing", score: country.financingSupportScore, fullMark: 10 },
  ];

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="var(--card-border)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: "var(--muted)", fontFamily: "inherit" }}
        />
        <Radar
          name={country.name}
          dataKey="score"
          stroke="var(--accent)"
          fill="var(--accent)"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "var(--foreground)",
          }}
          formatter={(v) => [`${v ?? 0}/10`, "Score"]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function ScoreBar({
  label,
  value,
  weight,
}: {
  label: string;
  value: number;
  weight?: number;
}) {
  const pct = value * 10;
  const color = value >= 7 ? "var(--success)" : value >= 4 ? "var(--warning)" : "var(--danger)";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--muted)] w-36 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-[var(--card-border)] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold text-[var(--foreground)] w-8 text-right">{value}/10</span>
      {weight !== undefined && (
        <span className="text-[10px] text-[var(--muted)] w-10 text-right">x{weight.toFixed(1)}</span>
      )}
    </div>
  );
}
