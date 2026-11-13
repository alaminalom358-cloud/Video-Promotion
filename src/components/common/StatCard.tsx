import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  icon: LucideIcon;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  badge
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-sm transition-all duration-200 hover:border-purple-500/40 hover:shadow-purple-500/5">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 h-28 w-28 rounded-full bg-purple-600/10 blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="rounded-lg bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/20">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-slate-400">{subValue}</span>
        )}
      </div>

      {(trend || badge) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <div className={`flex items-center gap-1 font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span className="font-mono tabular-nums">{trend.value}</span>
              {trend.label && <span className="text-slate-400 font-normal ml-0.5">{trend.label}</span>}
            </div>
          )}
          {badge && (
            <span className="text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded text-[11px] font-medium border border-purple-700/50">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
