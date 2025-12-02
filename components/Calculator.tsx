import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Calculator, DollarSign, Clock, TrendingUp, TrendingDown, Info, Store, Dumbbell, Coffee, Trophy, FileText, Layers } from 'lucide-react';
import { 
  COURTS, 
  CASH_OPEX_MONTHLY, 
  TOTAL_CAPEX, 
  DAYS_IN_MONTH,
  formatIDR,
  formatBillions,
  formatMillions,
  DEFAULT_REVENUE_FB,
  DEFAULT_REVENUE_FITNESS,
  DEFAULT_REVENUE_PRO_SHOP,
  DEFAULT_REVENUE_SPONSORSHIP,
  CAPEX_DETAILS,
  OPEX_DETAILS
} from '../constants';
import { PriceMode, FinancialMetrics } from '../types';
import { InfoCard } from './InfoCard';

const CalculatorComponent: React.FC = () => {
  // --- State ---
  
  // Individual Court Hours
  const [courtHours, setCourtHours] = useState<Record<string, number>>({
    'Side Courts': 8,
    'Center Courts': 8,
    'Stadium Court': 8
  });

  // Global Price Mode
  const [priceMode, setPriceMode] = useState<PriceMode>(PriceMode.NORMAL);
  
  // Individual Non-Court Revenue Streams
  const [nonCourtRevenue, setNonCourtRevenue] = useState({
    fb: DEFAULT_REVENUE_FB,
    proShop: DEFAULT_REVENUE_PRO_SHOP,
    sponsorship: DEFAULT_REVENUE_SPONSORSHIP,
    fitness: DEFAULT_REVENUE_FITNESS
  });

  // Tab State
  const [activeTab, setActiveTab] = useState<'summary' | 'capex' | 'opex'>('summary');

  const handleCourtHourChange = (courtName: string, hours: number) => {
    setCourtHours(prev => ({ ...prev, [courtName]: hours }));
  };

  const handleRevenueChangeMillion = (key: keyof typeof nonCourtRevenue, value: string) => {
    // Input is in Millions, store in raw IDR
    const numValue = parseFloat(value) || 0;
    setNonCourtRevenue(prev => ({ ...prev, [key]: numValue * 1_000_000 }));
  };

  // --- Calculations ---
  const metrics = useMemo<FinancialMetrics>(() => {
    // 1. Calculate Court Revenue
    let totalCourtRevenue = 0;
    const courtsBreakdown: Record<string, number> = {};
    
    COURTS.forEach(court => {
      const price = priceMode === PriceMode.NORMAL ? court.priceNormal : court.priceDiscount;
      const hours = courtHours[court.name] || 0;
      // Formula: Qty * Price * Specific Hours * 30 Days
      const dailyRevenue = court.qty * price * hours;
      const monthlyRev = dailyRevenue * DAYS_IN_MONTH;
      
      courtsBreakdown[court.name] = monthlyRev;
      totalCourtRevenue += monthlyRev;
    });

    // 2. Calculate Non-Court Revenue
    const fbRevenue = nonCourtRevenue.fb;
    const fitnessRevenue = nonCourtRevenue.fitness;
    const proShopRevenue = nonCourtRevenue.proShop;
    const sponsorshipRevenue = nonCourtRevenue.sponsorship;
    const totalNonCourt = fbRevenue + fitnessRevenue + proShopRevenue + sponsorshipRevenue;

    const monthlyRevenue = totalCourtRevenue + totalNonCourt;

    // 3. EBITDA
    // EBITDA = Revenue - Cash Opex
    const monthlyEBITDA = monthlyRevenue - CASH_OPEX_MONTHLY;
    const annualEBITDA = monthlyEBITDA * 12;

    // 4. Payback Period
    const paybackYears = annualEBITDA > 0 ? TOTAL_CAPEX / annualEBITDA : 999;

    return {
      monthlyRevenue,
      monthlyEBITDA,
      annualEBITDA,
      paybackYears,
      revenueBreakdown: {
        courtsTotal: totalCourtRevenue,
        courtsBreakdown,
        fb: fbRevenue,
        fitness: fitnessRevenue,
        proShop: proShopRevenue,
        sponsorship: sponsorshipRevenue,
        totalNonCourt
      }
    };
  }, [courtHours, priceMode, nonCourtRevenue]);

  // --- Chart Data ---
  // Detailed breakdown for pie chart
  const revenueData = [
    { name: 'Side Courts', value: metrics.revenueBreakdown.courtsBreakdown['Side Courts'], color: '#0284c7' }, // Darker Blue
    { name: 'Center Courts', value: metrics.revenueBreakdown.courtsBreakdown['Center Courts'], color: '#0ea5e9' }, // Medium Blue
    { name: 'Stadium', value: metrics.revenueBreakdown.courtsBreakdown['Stadium Court'], color: '#38bdf8' }, // Light Blue
    { name: 'F&B', value: metrics.revenueBreakdown.fb, color: '#f59e0b' }, // Amber
    { name: 'Fitness', value: metrics.revenueBreakdown.fitness, color: '#10b981' }, // Emerald
    { name: 'Pro Shop', value: metrics.revenueBreakdown.proShop, color: '#8b5cf6' }, // Violet
    { name: 'Sponsorship', value: metrics.revenueBreakdown.sponsorship, color: '#ec4899' }, // Pink
  ].filter(d => d.value > 0);

  const comparisonData = [
    {
      name: 'Current Sim',
      ebitda: metrics.monthlyEBITDA,
      revenue: metrics.monthlyRevenue,
    },
    {
      name: 'Scenario A (8h)', // Reference from PDF
      ebitda: 1_112_000_000,
      revenue: 1_445_000_000,
    },
    {
      name: 'Scenario F (6h)', // Reference from PDF (Low case)
      ebitda: 582_000_000,
      revenue: 914_000_000,
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN: Controls */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-6 border-b border-slate-100 pb-4">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Operational Controls</h2>
          </div>

          {/* Control: Pricing Strategy */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-slate-700 mb-3 block flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Pricing Strategy
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPriceMode(PriceMode.NORMAL)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  priceMode === PriceMode.NORMAL
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Normal Price
              </button>
              <button
                onClick={() => setPriceMode(PriceMode.DISCOUNT)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  priceMode === PriceMode.DISCOUNT
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Discount (-100k)
              </button>
            </div>
          </div>

          {/* Section: Court Hours */}
          <div className="mb-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-700" />
              <label className="text-sm font-bold text-slate-700">Daily Sold Hours (Per Court)</label>
            </div>
            
            {COURTS.map((court) => {
              const currentPrice = priceMode === PriceMode.NORMAL ? court.priceNormal : court.priceDiscount;
              return (
                <div key={court.name} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{court.name}</span>
                            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">x{court.qty} units</span>
                        </div>
                        <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 w-fit">
                             {formatIDR(currentPrice)}<span className="font-normal text-slate-500"> / hr</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <span className="text-3xl font-bold text-blue-600 leading-none">{courtHours[court.name]}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Hours / Day</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="0.5"
                    value={courtHours[court.name]}
                    onChange={(e) => handleCourtHourChange(court.name, Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-slate-400">0h</span>
                    <span className="text-xs text-blue-600 font-medium">
                       Est. {formatMillions(metrics.revenueBreakdown.courtsBreakdown[court.name])} / mo
                    </span>
                    <span className="text-xs text-slate-400">16h</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section: Non-Court Revenue Inputs */}
          <div className="space-y-5 pt-6 border-t border-slate-100">
             <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-slate-700" />
                <label className="text-sm font-bold text-slate-700">Non-Court Monthly Revenue</label>
             </div>
             <p className="text-xs text-slate-500 -mt-3 mb-4 italic">Input values in Millions (Juta Rupiah)</p>

             {/* F&B */}
             <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
                   <div className="flex items-center gap-1"><Coffee className="w-3 h-3" /> F&B (Cafe + Resto)</div>
                   <span className="text-slate-400 font-normal">{formatBillions(nonCourtRevenue.fb)}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-medium">Rp</span>
                  <input 
                    type="number"
                    min="0"
                    value={nonCourtRevenue.fb / 1_000_000}
                    onChange={(e) => handleRevenueChangeMillion('fb', e.target.value)}
                    className="w-full pl-10 pr-12 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-sm">Juta</span>
                </div>
             </div>

             {/* Fitness */}
             <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
                   <div className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> Fitness Membership</div>
                   <span className="text-slate-400 font-normal">{formatBillions(nonCourtRevenue.fitness)}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-medium">Rp</span>
                  <input 
                    type="number"
                    min="0"
                    value={nonCourtRevenue.fitness / 1_000_000}
                    onChange={(e) => handleRevenueChangeMillion('fitness', e.target.value)}
                    className="w-full pl-10 pr-12 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-sm">Juta</span>
                </div>
             </div>

             {/* Pro Shop */}
             <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
                   <div className="flex items-center gap-1"><Store className="w-3 h-3" /> Pro Shop & Rentals</div>
                   <span className="text-slate-400 font-normal">{formatBillions(nonCourtRevenue.proShop)}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-medium">Rp</span>
                  <input 
                    type="number"
                    min="0"
                    value={nonCourtRevenue.proShop / 1_000_000}
                    onChange={(e) => handleRevenueChangeMillion('proShop', e.target.value)}
                    className="w-full pl-10 pr-12 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-sm">Juta</span>
                </div>
             </div>

             {/* Sponsorship */}
             <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
                   <div className="flex items-center gap-1"><Trophy className="w-3 h-3" /> Sponsorship & Branding</div>
                   <span className="text-slate-400 font-normal">{formatBillions(nonCourtRevenue.sponsorship)}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-medium">Rp</span>
                  <input 
                    type="number"
                    min="0"
                    value={nonCourtRevenue.sponsorship / 1_000_000}
                    onChange={(e) => handleRevenueChangeMillion('sponsorship', e.target.value)}
                    className="w-full pl-10 pr-12 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-sm">Juta</span>
                </div>
             </div>

          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="flex items-start gap-2 bg-slate-50 p-3 rounded text-xs text-slate-500">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Simulating fixed Monthly Cash OPEX of {formatBillions(CASH_OPEX_MONTHLY)}.</p>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Results */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard 
            title="Monthly Revenue" 
            value={formatBillions(metrics.monthlyRevenue)}
            subValue={formatIDR(metrics.monthlyRevenue)}
            icon={<DollarSign className="w-5 h-5" />}
            trend="positive"
          />
          <InfoCard 
            title="Monthly EBITDA" 
            value={formatBillions(metrics.monthlyEBITDA)} 
            subValue={`Margin: ${((metrics.monthlyEBITDA / metrics.monthlyRevenue) * 100).toFixed(1)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color={metrics.monthlyEBITDA > 0 ? 'bg-white' : 'bg-red-50'}
            trend={metrics.monthlyEBITDA > 0 ? 'positive' : 'negative'}
          />
          <InfoCard 
            title="Payback Period" 
            value={`${metrics.paybackYears < 50 ? metrics.paybackYears.toFixed(1) : '> 50'} Years`}
            subValue={`Inv: ${formatBillions(TOTAL_CAPEX)}`}
            icon={<TrendingDown className="w-5 h-5" />}
            color="bg-slate-800 text-white"
            trend="neutral"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center">
            <div className="w-full sm:w-1/2">
                <h3 className="text-base font-bold text-slate-800 mb-6">Revenue Breakdown (Monthly)</h3>
                <div className="flex flex-col gap-3">
                  {revenueData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                        <span className="text-xs sm:text-sm text-slate-600 font-medium truncate max-w-[120px]">{d.name}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">{formatBillions(d.value)}</span>
                    </div>
                  ))}
                </div>
            </div>
            <div className="w-full sm:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatBillions(value)}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scenario Comparison */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-6">EBITDA Comparison (Monthly)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 12}} />
                  <Tooltip 
                    formatter={(value: number) => formatBillions(value)}
                    cursor={{fill: 'transparent'}}
                  />
                  <Bar dataKey="ebitda" radius={[0, 4, 4, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#0ea5e9' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Tabs & Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'summary' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Simulation Summary
              </div>
            </button>
            <button
              onClick={() => setActiveTab('capex')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'capex' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Layers className="w-4 h-4" />
                CAPEX Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('opex')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'opex' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ActivityIcon className="w-4 h-4" />
                OPEX Details
              </div>
            </button>
          </div>

          {/* Tab Content: Summary */}
          {activeTab === 'summary' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-3">Component</th>
                    <th className="px-6 py-3 text-right">Value (Monthly)</th>
                    <th className="px-6 py-3 text-right">Value (Annual)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-6 py-4 font-medium text-slate-700">Total Court Revenue</td>
                    <td className="px-6 py-4 text-right">{formatIDR(metrics.revenueBreakdown.courtsTotal)}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{formatBillions(metrics.revenueBreakdown.courtsTotal * 12)}</td>
                  </tr>
                  {/* Court Details */}
                  {Object.entries(metrics.revenueBreakdown.courtsBreakdown).map(([name, val]) => {
                    // Look up current price for display
                    const court = COURTS.find(c => c.name === name);
                    const currentPrice = court ? (priceMode === PriceMode.NORMAL ? court.priceNormal : court.priceDiscount) : 0;
                    
                    return (
                      <tr key={name} className="bg-slate-50/50">
                          <td className="px-6 py-2 pl-10 text-xs text-slate-500">
                            {name} 
                            <span className="ml-2 text-slate-400">({formatIDR(currentPrice)}/hr)</span>
                          </td>
                          <td className="px-6 py-2 text-right text-xs text-slate-500">{formatBillions(val)}</td>
                          <td className="px-6 py-2 text-right text-xs text-slate-400">-</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td className="px-6 py-4 font-medium text-slate-700">F&B Revenue</td>
                    <td className="px-6 py-4 text-right">{formatIDR(metrics.revenueBreakdown.fb)}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{formatBillions(metrics.revenueBreakdown.fb * 12)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-slate-700">Other (Gym, Pro Shop, Sponsor)</td>
                    <td className="px-6 py-4 text-right">{formatIDR(metrics.revenueBreakdown.fitness + metrics.revenueBreakdown.proShop + metrics.revenueBreakdown.sponsorship)}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{formatBillions((metrics.revenueBreakdown.fitness + metrics.revenueBreakdown.proShop + metrics.revenueBreakdown.sponsorship) * 12)}</td>
                  </tr>
                  
                  <tr className="bg-blue-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800">Total Revenue</td>
                    <td className="px-6 py-4 text-right font-bold text-blue-700">{formatIDR(metrics.monthlyRevenue)}</td>
                    <td className="px-6 py-4 text-right font-bold text-blue-700">{formatBillions(metrics.monthlyRevenue * 12)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-slate-700 text-rose-600">(-) Cash OPEX</td>
                    <td className="px-6 py-4 text-right text-rose-600">{formatIDR(CASH_OPEX_MONTHLY)}</td>
                    <td className="px-6 py-4 text-right text-rose-600">{formatBillions(CASH_OPEX_MONTHLY * 12)}</td>
                  </tr>
                  <tr className="bg-emerald-50">
                    <td className="px-6 py-4 font-bold text-emerald-900">EBITDA</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">{formatIDR(metrics.monthlyEBITDA)}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">{formatBillions(metrics.annualEBITDA)}</td>
                  </tr>

                  {/* Investment & Payback Section */}
                  <tr className="border-t border-slate-200">
                    <td colSpan={3} className="px-6 py-2 bg-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Return on Investment Analysis
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-slate-700">Total Investment (CAPEX)</td>
                    <td className="px-6 py-4 text-right text-slate-400">-</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-800">{formatBillions(TOTAL_CAPEX)}</td>
                  </tr>
                  <tr className="bg-slate-900 text-white">
                    <td className="px-6 py-4 font-bold">
                      Payback Period
                      <span className="block text-xs font-normal text-slate-400 mt-0.5">Investment / Annual EBITDA</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">-</td>
                    <td className="px-6 py-4 text-right font-bold text-yellow-400 text-lg">
                      {metrics.paybackYears < 50 ? metrics.paybackYears.toFixed(1) : '> 50'} Years
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tab Content: CAPEX */}
          {activeTab === 'capex' && (
            <div className="overflow-x-auto">
               <div className="p-4 bg-blue-50/50 text-sm text-blue-800 border-b border-blue-100">
                 <p><strong>Note:</strong> Static data from Financial Summary PDF. Total Investment: {formatBillions(TOTAL_CAPEX)}.</p>
               </div>
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3">Investment Component</th>
                      <th className="px-6 py-3 text-right">Value (IDR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CAPEX_DETAILS.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">{item.item}</td>
                        <td className="px-6 py-4 text-right text-slate-600">{formatIDR(item.value)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold">
                       <td className="px-6 py-4 text-slate-800">TOTAL CAPEX</td>
                       <td className="px-6 py-4 text-right text-slate-800">{formatIDR(TOTAL_CAPEX)}</td>
                    </tr>
                  </tbody>
               </table>
            </div>
          )}

          {/* Tab Content: OPEX */}
          {activeTab === 'opex' && (
            <div className="overflow-x-auto">
               <div className="p-4 bg-rose-50/50 text-sm text-rose-800 border-b border-rose-100">
                 <p><strong>Note:</strong> Static data from Financial Summary PDF. Used to calculate Cash OPEX.</p>
               </div>
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3">Operational Cost Component</th>
                      <th className="px-6 py-3 text-right">Value (Monthly)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {OPEX_DETAILS.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">{item.item}</td>
                        <td className="px-6 py-4 text-right text-slate-600">{formatIDR(item.value)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold">
                       <td className="px-6 py-4 text-slate-800">TOTAL MONTHLY OPEX</td>
                       <td className="px-6 py-4 text-right text-slate-800">{formatIDR(OPEX_DETAILS.reduce((acc, curr) => acc + curr.value, 0))}</td>
                    </tr>
                    <tr className="bg-rose-50 text-rose-800 text-xs">
                       <td className="px-6 py-2" colSpan={2}>
                          * Cash OPEX used in simulation excludes Depreciation Reserve ({formatIDR(105400000)}) = {formatIDR(CASH_OPEX_MONTHLY)}
                       </td>
                    </tr>
                  </tbody>
               </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

// Helper for OPEX tab icon
const ActivityIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default CalculatorComponent;