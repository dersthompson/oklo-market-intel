export type Region = "EU" | "SE_ASIA";
export type Status = "FOCUS" | "TRACK" | "SHELVE";
export type SaleStrategy = "ELECTRONS" | "JV" | "BOTH";
export type CompanyType = "SOE" | "PRIVATE" | "REGULATOR";
export type CompanyRole = "OPERATOR" | "DEVELOPER" | "VENDOR" | "REGULATOR";
export type PartnerType = "FUEL" | "ENGINEERING" | "GRID" | "FINANCE" | "CONSTRUCTION";
export type PartnershipMode = "JV" | "OFFTAKE" | "INVESTMENT" | "SUPPLIER";

export interface NuclearCompany {
  name: string;
  type: CompanyType;
  role: CompanyRole;
  strategicValue: number;
  notes: string;
}

export interface Partner {
  name: string;
  partnerType: PartnerType;
  partnershipMode: PartnershipMode;
  notes: string;
}

export interface RawScores {
  energyPriceScore: number;
  carbonCommitmentScore: number;
  nuclearFrameworkScore: number;
  marketDeregScore: number;
  partnerEcosystemScore: number;
  licensingClarityScore: number;
  geopoliticalRiskScore: number;
  financingSupportScore: number;
}

export interface Country extends RawScores {
  code: string;
  name: string;
  region: Region;
  status: Status;
  saleStrategy: SaleStrategy;
  avgElectricityPrice: number;
  carbonTarget: "2030" | "2040" | "2050" | "None";
  topHurdle: string;
  rationale: string;
  nuclearCompanies: NuclearCompany[];
  partners: Partner[];
}

export interface WeightConfig {
  energyPriceScore: number;
  carbonCommitmentScore: number;
  nuclearFrameworkScore: number;
  marketDeregScore: number;
  partnerEcosystemScore: number;
  licensingClarityScore: number;
  geopoliticalRiskScore: number;
  financingSupportScore: number;
}

export const DEFAULT_WEIGHTS: WeightConfig = {
  energyPriceScore: 1,
  carbonCommitmentScore: 1,
  nuclearFrameworkScore: 1.5,
  marketDeregScore: 1,
  partnerEcosystemScore: 1,
  licensingClarityScore: 1.5,
  geopoliticalRiskScore: 2,
  financingSupportScore: 1,
};

export const WEIGHT_LABELS: Record<keyof WeightConfig, string> = {
  energyPriceScore: "Energy Prices",
  carbonCommitmentScore: "Carbon Commitment",
  nuclearFrameworkScore: "Nuclear Framework",
  marketDeregScore: "Market Deregulation",
  partnerEcosystemScore: "Partner Ecosystem",
  licensingClarityScore: "Licensing Clarity",
  geopoliticalRiskScore: "Geopolitical Safety",
  financingSupportScore: "Financing Support",
};

export const WEIGHT_DESCRIPTIONS: Record<keyof WeightConfig, string> = {
  energyPriceScore: "How expensive the market is — high prices improve ROI",
  carbonCommitmentScore: "Strength of net-zero / carbon reduction goals",
  nuclearFrameworkScore: "Maturity of nuclear regulatory and legal framework",
  marketDeregScore: "Degree of market deregulation enabling private entry",
  partnerEcosystemScore: "Quality of local nuclear industry partners",
  licensingClarityScore: "How clear and navigable the licensing pathway is",
  geopoliticalRiskScore: "Political stability, US alignment, sanctions risk",
  financingSupportScore: "Government/sovereign financial backing for nuclear",
};

export interface ScoredCountry extends Country {
  weightedScore: number;
}
