
export enum PriceMode {
  NORMAL = 'NORMAL',
  DISCOUNT = 'DISCOUNT'
}

export interface CourtConfig {
  name: string;
  qty: number;
  priceNormal: number;
  priceDiscount: number;
}

export interface FinancialMetrics {
  monthlyRevenue: number;
  monthlyEBITDA: number;
  annualEBITDA: number;
  paybackYears: number;
  revenueBreakdown: {
    courtsTotal: number;
    courtsBreakdown: Record<string, number>; // key: court name, value: revenue
    fb: number;
    fitness: number;
    proShop: number;
    sponsorship: number;
    totalNonCourt: number;
  };
}

export interface ScenarioResult {
  label: string;
  monthlyRevenue: number;
  monthlyEBITDA: number;
  paybackYears: number;
  isBaseline?: boolean;
}
