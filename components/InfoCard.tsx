import React from 'react';

interface InfoCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
  color?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, value, subValue, icon, trend, color = 'bg-white' }) => {
  return (
    <div className={`${color} rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        {subValue && (
          <div className={`text-sm font-medium mt-1 ${
            trend === 'positive' ? 'text-emerald-600' : 
            trend === 'negative' ? 'text-rose-600' : 'text-slate-400'
          }`}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};