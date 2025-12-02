import { CourtConfig } from './types';

// Financial Constants from PDF
export const TOTAL_CAPEX = 30_000_000_000; // 30 Miliar

// Operational Costs
const TOTAL_OPEX_MONTHLY = 437_708_125;
const DEPRECIATION_RESERVE = 105_400_000;
// PDF Note: EBITDA = Revenue - Cash Opex (excluding depreciation)
export const CASH_OPEX_MONTHLY = TOTAL_OPEX_MONTHLY - DEPRECIATION_RESERVE; // ~332.3M

// Revenue Configurations
export const COURTS: CourtConfig[] = [
  {
    name: 'Side Courts',
    qty: 6,
    priceNormal: 382_500,
    priceDiscount: 292_500,
  },
  {
    name: 'Center Courts',
    qty: 2,
    priceNormal: 472_500,
    priceDiscount: 382_500,
  },
  {
    name: 'Stadium Court',
    qty: 1,
    priceNormal: 675_000,
    priceDiscount: 585_000,
  },
];

// Non-Court Revenue Defaults (Monthly) - Broken down for simulation
export const DEFAULT_REVENUE_FB = 300_000_000; // Cafeteria (150M) + Restaurant (150M)
export const DEFAULT_REVENUE_PRO_SHOP = 45_000_000;
export const DEFAULT_REVENUE_SPONSORSHIP = 135_000_000;
export const DEFAULT_REVENUE_FITNESS = 25_000_000;

export const DAYS_IN_MONTH = 30;

// CAPEX Breakdown from PDF
export const CAPEX_DETAILS = [
  { item: 'Building & Structure', value: 21_190_000_000 },
  { item: 'Land Rental (6,000m², 3 tahun)', value: 5_400_000_000 },
  { item: 'Padel Courts (9 unit @ Rp 250jt)', value: 2_250_000_000 },
  { item: 'Pickle Ball Courts (2 unit)', value: 100_000_000 },
  { item: 'Gym Equipment', value: 500_000_000 },
  { item: 'Other Equipment', value: 250_000_000 },
  { item: 'Legal & Administration', value: 310_000_000 },
];

// OPEX Breakdown from PDF (Monthly)
export const OPEX_DETAILS = [
  { item: 'Land Rental', value: 169_600_000 },
  { item: 'Depreciation Reserve', value: 105_400_000 },
  { item: 'Salaries (17 staff)', value: 84_300_000 },
  { item: 'Electricity', value: 23_200_000 },
  { item: 'Hygiene & Cleanliness', value: 13_900_000 },
  { item: 'Maintenance', value: 11_600_000 },
  { item: 'Management Fee (4%)', value: 9_300_000 },
  { item: 'Customer Experience', value: 7_000_000 },
  { item: 'Marketing & Campaign', value: 4_600_000 },
  { item: 'Court Supplies', value: 4_600_000 },
  { item: 'Other Supplies', value: 2_300_000 },
  { item: 'Phone & Internet', value: 1_700_000 },
];

// Helper to format currency
export const formatIDR = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatBillions = (value: number): string => {
  return (value / 1_000_000_000).toFixed(2) + ' M';
};

export const formatMillions = (value: number): string => {
  return (value / 1_000_000).toFixed(1) + ' Juta';
};
