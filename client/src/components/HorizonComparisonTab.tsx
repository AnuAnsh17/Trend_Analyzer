import React from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { HorizonComparisonItem, MarketDataPoint } from '../types';
import { filterDataByHorizon } from '../math/analysis';
import { calculateLinearRegression } from '../math/regression';

interface HorizonComparisonTabProps {
  allData: MarketDataPoint[];
  comparisons: HorizonComparisonItem[];
}

export const HorizonComparisonTab: React.FC<HorizonComparisonTabProps> = ({ allData, comparisons }) => {
  const horizons: ('1Y' | '3Y' | '5Y' | '10Y')[] = ['1Y', '3Y', '5Y', '10Y'];

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800">Multi-Horizon Comparison</h3>
        <p className="text-sm text-slate-500 mt-1">Comparing 1, 3, 5, and 10 year trajectories side-by-side.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {horizons.map((h) => {
          const subset = filterDataByHorizon(allData, h);
          const lin = calculateLinearRegression(subset.map(d => d.Close));
          const step = subset.length > 500 ? 2 : 1;
          const miniData = subset.filter((_, i) => i % step === 0).map((d, i) => ({
            date: d.Date,
            close: d.Close,
            linear: lin.fitted[i * step],
          }));

          const r2Color = lin.rSquared > 0.7 ? 'text-emerald-600' : lin.rSquared > 0.4 ? 'text-indigo-600' : 'text-amber-600';

          return (
            <div key={h} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-800">{h}</span>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{subset.length} days</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Linear R²</span>
                  <span className={`font-mono font-black ${r2Color}`}>{(lin.rSquared * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="w-full h-48 bg-slate-50 rounded-xl p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={miniData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: any) => `?${val.toFixed(0)}`}
                      labelStyle={{ display: 'none' }}
                    />
                    <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    <Line type="linear" dataKey="linear" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between text-xs font-medium text-slate-500 mt-4 px-1">
                <span>Rate: <strong className="text-slate-800">?{lin.annualizedSlope.toFixed(0)}/yr</strong></span>
                <span>RMSE: <strong className="text-slate-800">?{lin.rmse.toFixed(0)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
