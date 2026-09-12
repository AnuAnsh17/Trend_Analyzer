import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { HorizonComparisonItem, MarketDataPoint } from '../types';
import { filterDataByHorizon } from '../math/analysis';
import { calculateLinearRegression } from '../math/regression';
import { CalendarRange, Sparkles, TrendingUp } from 'lucide-react';

interface HorizonComparisonTabProps {
  allData: MarketDataPoint[];
  comparisons: HorizonComparisonItem[];
}

export const HorizonComparisonTab: React.FC<HorizonComparisonTabProps> = ({
  allData,
  comparisons,
}) => {
  // Mini chart generators for the 4 horizons
  const horizons: ('1Y' | '3Y' | '5Y' | '10Y')[] = ['1Y', '3Y', '5Y', '10Y'];

  return (
    <div className="space-y-6">
      
      {/* Intro */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-950/60 rounded-lg text-emerald-400 border border-emerald-800/40 mt-0.5">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white m-0">
              Module 4: Multi-Horizon Statistical & Structural Comparison
            </h3>
            <p className="text-xs text-slate-400 m-0 mt-1 leading-relaxed">
              Examines how regression slope parameters, R² explanatory power, and correlation stability evolve as the analytical horizon expands from short-term cyclical noise (1 Year) to secular economic expansion (10 Years).
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Horizon Metrics Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>Comparative Mathematical Matrix across Standard Horizons</span>
          <span className="text-xs text-slate-400 font-mono">1Y • 3Y • 5Y • 10Y</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Horizon</th>
                <th className="py-2.5 px-3">Observations (n)</th>
                <th className="py-2.5 px-3">Date Range</th>
                <th className="py-2.5 px-3">Mean Close (?)</th>
                <th className="py-2.5 px-3">Std Dev (s)</th>
                <th className="py-2.5 px-3">Pearson (r)</th>
                <th className="py-2.5 px-3">Linear Slope (Yr)</th>
                <th className="py-2.5 px-3">Linear R²</th>
                <th className="py-2.5 px-3">Poly R²</th>
                <th className="py-2.5 px-3 text-right">Optimal Fit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {comparisons.map((c) => (
                <tr key={c.horizon} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans font-bold text-cyan-400">{c.horizon}</td>
                  <td className="py-2.5 px-3 text-slate-200">{c.count.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">{c.startDate} to {c.endDate}</td>
                  <td className="py-2.5 px-3 text-slate-200">?{c.mean.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-slate-200">?{c.stdDev.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{c.correlation.toFixed(3)}</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-semibold">?{c.linearSlopeAnnual.toFixed(0)}/yr</td>
                  <td className="py-2.5 px-3 text-indigo-300 font-bold">{(c.linearR2 * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-amber-300 font-bold">{(c.polyR2 * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                      c.bestModel === 'Quadratic'
                        ? 'text-amber-300 bg-amber-950/60 border border-amber-800/50'
                        : 'text-indigo-300 bg-indigo-950/60 border border-indigo-800/50'
                    }`}>
                      {c.bestModel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Multi-Horizon Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {horizons.map((h) => {
          const subset = filterDataByHorizon(allData, h);
          const lin = calculateLinearRegression(subset.map(d => d.Close));
          const step = subset.length > 500 ? 2 : 1;
          const miniData = [];
          for (let i = 0; i < subset.length; i += step) {
            miniData.push({
              date: subset[i].Date,
              close: subset[i].Close,
              linear: lin.fitted[i],
            });
          }

          return (
            <div key={h} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-cyan-400">{h} Horizon</span>
                  <span className="text-xs text-slate-400">({subset.length} days)</span>
                </div>
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  R² = {(lin.rSquared * 100).toFixed(1)}%
                </span>
              </div>

              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={miniData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#1e293b',
                        borderRadius: '0.375rem',
                        fontSize: '11px',
                      }}
                      formatter={(val: any) => [`?${Number(val).toFixed(0)}`, 'Price']}
                    />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="linear"
                      dataKey="linear"
                      stroke="#818cf8"
                      strokeWidth={1.75}
                      strokeDasharray="4 2"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 border-t border-slate-800/70 pt-2 font-mono mt-1">
                <span>Slope: ?{lin.slope.toFixed(2)}/day</span>
                <span>RMSE: ?{lin.rmse.toFixed(1)}</span>
                <span className="text-slate-300">Annual: ~?{lin.annualizedSlope.toFixed(0)}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
