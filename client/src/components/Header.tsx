import React from 'react';
import { TrendingUp, ArrowLeft, Calendar } from 'lucide-react';
import { MarketDataPoint } from '../types';

interface HeaderProps {
  data: MarketDataPoint[];
  currentClose: number;
  prevClose: number;
  onBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({ data, currentClose, prevClose, onBack }) => {
  const change = currentClose - prevClose;
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;
  const isUp = change >= 0;

  const startDate = data[0]?.Date ?? '2016-08-01';
  const endDate = data[data.length - 1]?.Date ?? '2026-09-11';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 m-0 leading-none">
                NIFTY 50 Analyzer
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">Statistical Method Module</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="hidden sm:flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-xs">{startDate} ? {endDate}</span>
          </div>
          
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-1.5 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Latest Close</span>
              <span className="font-mono text-base font-bold text-slate-900">
                ?{currentClose.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className={`font-mono text-xs font-bold px-2 py-1 rounded-md ${
              isUp ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-rose-700 bg-rose-50 border border-rose-100'
            }`}>
              {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
