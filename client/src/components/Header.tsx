import React from 'react';
import { TrendingUp, Award, Calendar, Database, ShieldCheck } from 'lucide-react';
import { MarketDataPoint } from '../types';

interface HeaderProps {
  data: MarketDataPoint[];
  currentClose: number;
  prevClose: number;
}

export const Header: React.FC<HeaderProps> = ({ data, currentClose, prevClose }) => {
  const change = currentClose - prevClose;
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;
  const isUp = change >= 0;

  const startDate = data[0]?.Date ?? '2016-08-01';
  const endDate = data[data.length - 1]?.Date ?? '2026-09-11';
  const totalObs = data.length;

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Title & Module Scope */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 p-[1px] shadow-lg shadow-cyan-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white m-0 leading-tight">
                NIFTY 50 Statistical Trend Analyzer
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950/70 text-cyan-400 border border-cyan-800/50">
                <Award className="w-3 h-3" />
                V1.0 Rigor
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0">
              National Stock Exchange of India (NSE) • Historical OLS Regression & Statistical Modeling
            </p>
          </div>
        </div>

        {/* Live Metrics & Scope Badge */}
        <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs">
          
          {/* Latest Price & Net Daily Change */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                Latest Close
              </span>
              <span className="font-mono text-sm font-bold text-white">
                ?{currentClose.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className={`font-mono text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-0.5 ${
              isUp ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/40' : 'text-rose-400 bg-rose-950/50 border border-rose-800/40'
            }`}>
              {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </div>
          </div>

          {/* Dataset Span */}
          <div className="hidden sm:flex items-center gap-2 text-slate-400 bg-slate-900/50 border border-slate-800/80 px-3 py-1.5 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{startDate} ? {endDate}</span>
          </div>

          {/* Data Points */}
          <div className="hidden sm:flex items-center gap-2 text-slate-400 bg-slate-900/50 border border-slate-800/80 px-3 py-1.5 rounded-lg">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-slate-200 font-medium">{totalObs.toLocaleString()}</span>
            <span>records</span>
          </div>

          {/* Academic Verification Badge */}
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-1.5 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-[11px]">Bessel Corrected (ddof=1)</span>
          </div>

        </div>
      </div>
    </header>
  );
};
