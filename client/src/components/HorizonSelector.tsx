import React from 'react';
import { Sparkles, CalendarRange } from 'lucide-react';

export type Horizon = '1Y' | '3Y' | '5Y' | '10Y' | 'Custom';

interface HorizonSelectorProps {
  currentHorizon: Horizon;
  onSelect: (h: Horizon) => void;
  customStart: string;
  customEnd: string;
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
  minDate: string;
  maxDate: string;
  totalFiltered: number;
}

export const HorizonSelector: React.FC<HorizonSelectorProps> = ({
  currentHorizon,
  onSelect,
  customStart,
  customEnd,
  onStartChange,
  onEndChange,
  minDate,
  maxDate,
  totalFiltered,
}) => {
  const horizons: Horizon[] = ['1Y', '3Y', '5Y', '10Y', 'Custom'];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Timeframe
        </span>
        {horizons.map(h => (
          <button
            key={h}
            onClick={() => onSelect(h)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              currentHorizon === h
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {h}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm">
        {currentHorizon === 'Custom' && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <CalendarRange className="w-4 h-4 text-slate-400" />
            <input type="date" value={customStart} min={minDate} max={customEnd} onChange={e => onStartChange(e.target.value)} className="bg-transparent border-none outline-none text-slate-700 font-mono text-xs" />
            <span className="text-slate-400">-</span>
            <input type="date" value={customEnd} min={customStart} max={maxDate} onChange={e => onEndChange(e.target.value)} className="bg-transparent border-none outline-none text-slate-700 font-mono text-xs" />
          </div>
        )}
        <div className="text-xs font-medium text-slate-500">
          <span className="font-mono font-bold text-indigo-600">{totalFiltered.toLocaleString()}</span> sessions analyzed
        </div>
      </div>
    </div>
  );
};
