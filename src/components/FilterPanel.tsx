"use client";

import type { WeightConfig } from "@/lib/types";
import { WEIGHT_LABELS, WEIGHT_DESCRIPTIONS } from "@/lib/types";

interface FilterState {
  minScore: number;
  regions: Set<string>;
  statuses: Set<string>;
  saleStrategies: Set<string>;
  carbonTargets: Set<string>;
  requireNuclearFramework: boolean;
  requireDeregulated: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  weights: WeightConfig;
  onFilterChange: (f: FilterState) => void;
  onWeightChange: (w: WeightConfig) => void;
  qualifyingCount: number;
  totalCount: number;
}

const REGIONS = [
  { value: "EU", label: "European Union" },
  { value: "SE_ASIA", label: "SE Asia & Neighbors" },
];

const STATUSES = [
  { value: "FOCUS", label: "Focus", color: "var(--focus-color)" },
  { value: "TRACK", label: "Track", color: "var(--track-color)" },
  { value: "SHELVE", label: "Shelve", color: "var(--shelve-color)" },
];

const STRATEGIES = [
  { value: "ELECTRONS", label: "Electrons Sale" },
  { value: "JV", label: "Joint Venture" },
  { value: "BOTH", label: "Both" },
];

const CARBON_TARGETS = ["2030", "2040", "2050", "None"];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        className="relative w-8 h-4 rounded-full transition-colors"
        style={{ background: checked ? "var(--accent)" : "var(--card-border)" }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm"
          style={{ left: checked ? "calc(100% - 14px)" : "2px" }}
        />
      </div>
      <span className="text-xs text-[var(--foreground)]">{label}</span>
    </label>
  );
}

function CheckGroup({ options, selected, onChange }: { options: { value: string; label: string; color?: string }[]; selected: Set<string>; onChange: (s: Set<string>) => void }) {
  const toggle = (v: string) => {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v); else next.add(v);
    onChange(next);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = selected.has(o.value);
        return (
          <button key={o.value} onClick={() => toggle(o.value)}
            className="text-xs px-2 py-1 rounded-md border transition-all font-medium"
            style={{ background: active ? (o.color || "var(--accent)") : "transparent", color: active ? "#fff" : "var(--muted)", borderColor: active ? (o.color || "var(--accent)") : "var(--card-border)" }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterPanel({ filters, weights, onFilterChange, onWeightChange, qualifyingCount, totalCount }: FilterPanelProps) {
  const weightKeys = Object.keys(weights) as (keyof WeightConfig)[];
  return (
    <aside className="w-72 shrink-0 flex flex-col gap-0 overflow-y-auto h-full border-r border-[var(--card-border)] bg-[var(--card)]">
      <div className="px-4 py-4 border-b border-[var(--card-border)]">
        <div className="flex items-baseline justify-between">
          <h2 className="font-bold text-sm text-[var(--foreground)]">Filters</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)]">
            {qualifyingCount} / {totalCount}
          </span>
        </div>
        <p className="text-xs text-[var(--muted)] mt-0.5">Countries meeting all criteria</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <section className="px-4 py-3 border-b border-[var(--card-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--foreground)]">Min. Score</span>
            <span className="text-xs font-bold text-[var(--accent)]">{filters.minScore}+</span>
          </div>
          <input type="range" min={0} max={90} step={5} value={filters.minScore}
            className="weight-slider w-full"
            style={{ "--range-fill": `${(filters.minScore / 90) * 100}%` } as React.CSSProperties}
            onChange={(e) => onFilterChange({ ...filters, minScore: Number(e.target.value) })} />
          <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
            <span>0 (all)</span><span>45 (moderate)</span><span>65 (strong)</span>
          </div>
        </section>
        <section className="px-4 py-3 border-b border-[var(--card-border)]">
          <span className="text-xs font-semibold text-[var(--foreground)] block mb-2">Region</span>
          <CheckGroup options={REGIONS} selected={filters.regions} onChange={(s) => onFilterChange({ ...filters, regions: s })} />
        </section>
        <section className="px-4 py-3 border-b border-[var(--card-border)]">
          <span className="text-xs font-semibold text-[var(--foreground)] block mb-2">Status</span>
          <CheckGroup options={STATUSES} selected={filters.statuses} onChange={(s) => onFilterChange({ ...filters, statuses: s })} />
        </section>
        <section className="px-4 py-3 border-b border-[var(--card-border)]">
          <span className="text-xs font-semibold text-[var(--foreground)] block mb-2">Entry Strategy</span>
          <CheckGroup options={STRATEGIES} selected={filters.saleStrategies} onChange={(s) => onFilterChange({ ...filters, saleStrategies: s })} />
        </section>
        <section className="px-4 py-3 border-b border-[var(--card-border)]">
          <span className="text-xs font-semibold text-[var(--foreground)] block mb-2">Carbon Target</span>
          <CheckGroup options={CARBON_TARGETS.map((v) => ({ value: v, label: v }))} selected={filters.carbonTargets} onChange={(s) => onFilterChange({ ...filters, carbonTargets: s })} />
        </section>
        <section className="px-4 py-3 border-b border-[var(--card-border)] flex flex-col gap-2.5">
          <span className="text-xs font-semibold text-[var(--foreground)] block">Hard Requirements</span>
          <Toggle label="Nuclear framework present" checked={filters.requireNuclearFramework} onChange={(v) => onFilterChange({ ...filters, requireNuclearFramework: v })} />
          <Toggle label="Deregulated market" checked={filters.requireDeregulated} onChange={(v) => onFilterChange({ ...filters, requireDeregulated: v })} />
        </section>
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--foreground)]">Score Weights</span>
            <button className="text-[10px] text-[var(--accent)] hover:underline" onClick={() => { const r = {} as WeightConfig; weightKeys.forEach((k) => (r[k] = 1)); onWeightChange(r); }}>reset</button>
          </div>
          <div className="flex flex-col gap-3">
            {weightKeys.map((key) => {
              const val = weights[key];
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[var(--foreground)] font-medium truncate" title={WEIGHT_DESCRIPTIONS[key]}>{WEIGHT_LABELS[key]}</span>
                    <span className="text-[11px] font-bold text-[var(--accent)] ml-2 shrink-0">x{val.toFixed(1)}</span>
                  </div>
                  <input type="range" min={0} max={3} step={0.1} value={val}
                    className="weight-slider w-full"
                    style={{ "--range-fill": `${(val / 3) * 100}%` } as React.CSSProperties}
                    onChange={(e) => onWeightChange({ ...weights, [key]: Number(e.target.value) })} />
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-[var(--muted)] mt-3 leading-relaxed">
            Drag sliders to adjust how much each dimension contributes to the overall score.
          </p>
        </section>
      </div>
    </aside>
  );
}
