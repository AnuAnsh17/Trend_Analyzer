import React from 'react';
import { CalendarRange, Sparkles } from 'lucide-react';

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
  const horizons: { key: Horizon; label: string; sub: string }[] = [
    { key: '1Y', label: '1 Year', sub: 'Short-term horizon' },
    { key: '3Y', label: '3 Years', sub: 'Medium-term cyclical' },
    { key: '5Y', label: '5 Years', sub: 'Long-term structural' },
    { key: '10Y', label: '10 Years', sub: 'Full secular cycle' },
    { key: 'Custom', label: 'Custom Window', sub: 'User-specified bounds' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Horizon Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Time Horizon:
          </span>
          {horizons.map(h => {
            const isActive = currentHorizon === h.key;
            return (
              <button
                key={h.key}
                onClick={() => onSelect(h.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
                }`}
                title={h.sub}
              >
                {h.label}
              </button>
            );
          })}
        </div>

        {/* Custom Range Controls or Summary */}
        <div className="flex items-center gap-3">
          {currentHorizon === 'Custom' ? (
            <div className="flex items-center gap-2 text-xs bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1">
              <CalendarRange className="w-3.5 h-3.5 text-indigo-400" />
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={customStart}
                  min={minDate}
                  max={customEnd || maxDate}
                  onChange={(e) => onStartChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
                <span className="text-slate-500">to</span>
                <input
                  type="date"
                  value={customEnd}
                  min={customStart || minDate}
                  max={maxDate}
                  onChange={(e) => onEndChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          ) : null}

          <div className="text-xs text-slate-400 bg-slate-950/60 border border-slate-800/80 px-2.5 py-1 rounded-lg">
            Window sample: <span className="font-mono text-cyan-400 font-semibold">{totalFiltered.toLocaleString()}</span> sessions
          </div>
        </div>

      </div>
    </div>
  );
};
