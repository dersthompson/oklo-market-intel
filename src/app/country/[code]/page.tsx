import { notFound } from "next/navigation";
import Link from "next/link";
import type { Country } from "@/lib/types";
import { WEIGHT_LABELS, DEFAULT_WEIGHTS } from "@/lib/types";
import { computeWeightedScore, scoreLabel, scoreToColor } from "@/lib/scoring";
import { ScoreRadar, ScoreBar } from "@/components/ScoreRadar";
import countriesData from "../../../../data/countries.json";

export async function generateStaticParams() {
  return (countriesData as Country[]).map((c) => ({ code: c.code }));
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; desc: string }> = {
  FOCUS: { bg: "#0ea5e9", text: "#fff", label: "Focus", desc: "Priority market — actively pursue licensing & partnerships" },
  TRACK: { bg: "#8b5cf6", text: "#fff", label: "Track", desc: "Monitor developments — build relationships, defer commitments" },
  SHELVE: { bg: "#94a3b8", text: "#fff", label: "Shelve", desc: "Insufficient conditions — revisit when circumstances change" },
};

const STRATEGY_LABELS: Record<string, string> = {
  ELECTRONS: "Electrons Sale — sell power into deregulated market",
  JV: "Joint Venture — partner with state or private entity",
  BOTH: "Both — hybrid approach depending on project",
};

const ROLE_LABELS: Record<string, string> = { OPERATOR: "Operator", DEVELOPER: "Developer", VENDOR: "Vendor", REGULATOR: "Regulator" };
const TYPE_COLORS: Record<string, string> = { SOE: "#0ea5e9", PRIVATE: "#8b5cf6", REGULATOR: "#94a3b8" };
const PARTNER_TYPE_LABELS: Record<string, string> = { FUEL: "Fuel", ENGINEERING: "Engineering", GRID: "Grid", FINANCE: "Finance", CONSTRUCTION: "Construction" };
const MODE_LABELS: Record<string, string> = { JV: "Joint Venture", OFFTAKE: "Off-take Agreement", INVESTMENT: "Strategic Investment", SUPPLIER: "Supplier" };

interface PageProps { params: Promise<{ code: string }>; }

export default async function CountryPage({ params }: PageProps) {
  const { code } = await params;
  const country = (countriesData as Country[]).find((c) => c.code.toUpperCase() === code.toUpperCase());
  if (!country) notFound();

  const weightedScore = computeWeightedScore(country, DEFAULT_WEIGHTS);
  const status = STATUS_STYLES[country.status] ?? STATUS_STYLES.TRACK;
  const scoreClass = weightedScore >= 65 ? "score-high" : weightedScore >= 45 ? "score-mid" : "score-low";
  const scoreKeys = Object.keys(WEIGHT_LABELS) as (keyof typeof WEIGHT_LABELS)[];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-6">
        <Link href="/" className="hover:text-[var(--accent)]">Map</Link>
        <span>/</span>
        <Link href="/pipeline" className="hover:text-[var(--accent)]">Pipeline</Link>
        <span>/</span>
        <span className="text-[var(--foreground)]">{country.name}</span>
      </nav>

      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[var(--foreground)]">{country.name}</h1>
            <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: status.bg, color: status.text }}>{status.label}</span>
          </div>
          <p className="text-sm text-[var(--muted)] mb-1">{status.desc}</p>
          <p className="text-sm text-[var(--muted)]">
            {country.region === "EU" ? "Europe" : "SE Asia"} · Carbon target: <strong>{country.carbonTarget}</strong> · Avg. electricity: <strong>${country.avgElectricityPrice}/MWh</strong>
          </p>
        </div>
        <div className="text-center shrink-0">
          <div className={`text-4xl font-black px-5 py-3 rounded-2xl ${scoreClass}`}>{weightedScore}</div>
          <p className="text-xs text-[var(--muted)] mt-1">{scoreLabel(weightedScore)} Opportunity</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
          <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Strategic Rationale</h3>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">{country.rationale}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--warning)]/30 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-[var(--warning)] uppercase tracking-wider mb-2">Top Hurdle</h3>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">{country.topHurdle}</p>
          <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
            <span className="text-xs text-[var(--muted)]">Entry strategy: </span>
            <span className="text-xs font-medium text-[var(--foreground)]">{STRATEGY_LABELS[country.saleStrategy]}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6 mb-8">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[var(--foreground)] mb-4">Dimension Scores</h2>
          <div className="flex flex-col gap-3">
            {scoreKeys.map((key) => (
              <ScoreBar key={key} label={WEIGHT_LABELS[key]} value={country[key]} weight={DEFAULT_WEIGHTS[key]} />
            ))}
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
          <h2 className="text-sm font-bold text-[var(--foreground)] mb-2">Opportunity Profile</h2>
          <ScoreRadar country={country} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[var(--foreground)] mb-4">Nuclear Industry Players</h2>
          <div className="flex flex-col gap-3">
            {country.nuclearCompanies.map((co, i) => (
              <div key={i} className="border border-[var(--card-border)] rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <span className="text-sm font-semibold text-[var(--foreground)]">{co.name}</span>
                    <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ background: TYPE_COLORS[co.type] + "22", color: TYPE_COLORS[co.type] }}>{co.type}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <div key={s} className="w-2 h-2 rounded-full" style={{ background: s < co.strategicValue ? "var(--accent)" : "var(--card-border)" }} />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-[var(--muted)] uppercase mb-1">{ROLE_LABELS[co.role]}</p>
                <p className="text-xs text-[var(--muted)]">{co.notes}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[var(--foreground)] mb-4">Partnership Opportunities</h2>
          <div className="flex flex-col gap-3">
            {country.partners.map((p, i) => (
              <div key={i} className="border border-[var(--card-border)] rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{p.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--success)]/15 text-[var(--success)] uppercase">{MODE_LABELS[p.partnershipMode]}</span>
                </div>
                <p className="text-[10px] text-[var(--muted)] uppercase mb-1">{PARTNER_TYPE_LABELS[p.partnerType]}</p>
                <p className="text-xs text-[var(--muted)]">{p.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--card-border)]">
        <Link href="/" className="text-sm text-[var(--accent)] hover:underline">Back to Map</Link>
        <Link href="/pipeline" className="text-sm text-[var(--accent)] hover:underline">View full pipeline</Link>
      </div>
    </div>
  );
                     }
