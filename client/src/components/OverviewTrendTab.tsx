import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { MarketDataPoint, LinearRegressionResult, QuadraticRegressionResult, TrendAnalysisResult, DescriptiveStats } from '../types';
import { TrendingUp, TrendingDown, Minus, Info, CheckSquare, Square, Calculator, Activity } from 'lucide-react';

interface OverviewTrendTabProps {
  data: MarketDataPoint[];
  stats: DescriptiveStats;
  linear: LinearRegressionResult;
  poly: QuadraticRegressionResult;
  trend: TrendAnalysisResult;
}

export const OverviewTrendTab: React.FC<OverviewTrendTabProps> = ({
  data,
  stats,
  linear,
  poly,
  trend,
}) => {
  const [showActual, setShowActual] = useState(true);
  const [showLinear, setShowLinear] = useState(true);
  const [showPoly, setShowPoly] = useState(true);

  // Prepare chart data combining real price and regression lines
  // Sample if too dense for smooth browser rendering (> 1500 points)
  const step = data.length > 2000 ? 2 : 1;
  const chartData = [];
  for (let i = 0; i < data.length; i += step) {
    chartData.push({
      date: data[i].Date,
      close: data[i].Close,
      linear: linear.fitted[i],
      poly: poly.fitted[i],
      open: data[i].Open,
      high: data[i].High,
      low: data[i].Low,
      volume: data[i].Volume,
    });
  }

  const minPrice = Math.min(...data.map(d => d.Close));
  const maxPrice = Math.max(...data.map(d => d.Close));
  const padding = (maxPrice - minPrice) * 0.05;

  return (
    <div className="space-y-6">
      
      {/* Top Trend Classification & Executive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Trend Classification Badge Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trend Direction</span>
            {trend.classification === 'UPWARD' && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" /> Upward
              </span>
            )}
            {trend.classification === 'DOWNWARD' && (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/70 border border-rose-800/60 px-2 py-0.5 rounded-full">
                <TrendingDown className="w-3.5 h-3.5" /> Downward
              </span>
            )}
            {trend.classification === 'RELATIVELY FLAT' && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-full">
                <Minus className="w-3.5 h-3.5" /> Sideways
              </span>
            )}
          </div>
          <div className="my-2">
            <div className="text-xl font-extrabold text-white tracking-tight">
              {trend.classification}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Confidence: <span className="font-semibold text-cyan-400">{trend.confidence}</span> (R² = {(linear.rSquared * 100).toFixed(1)}%)
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 leading-relaxed">
            Net window change: <span className={trend.totalChangePct >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {trend.totalChangePct >= 0 ? '+' : ''}{trend.totalChangePct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Linear Slope Metric */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Linear Gradient (b)</span>
            <Calculator className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-xl font-mono font-extrabold text-cyan-400">
              {linear.slope >= 0 ? '+' : ''}?{linear.slope.toFixed(2)}
              <span className="text-xs font-normal text-slate-400"> / session</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Annualized: <span className="font-mono text-slate-200 font-medium">~?{linear.annualizedSlope.toFixed(0)}</span> / year
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            Ordinary Least Squares linear velocity
          </div>
        </div>

        {/* Model Fit Comparison Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Goodness-of-Fit</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Linear R²:</span>
              <span className="font-mono font-bold text-cyan-300">{(linear.rSquared * 100).toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Polynomial R²:</span>
              <span className="font-mono font-bold text-amber-300">{(poly.rSquared * 100).toFixed(2)}%</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            {poly.rSquared > linear.rSquared + 0.015
              ? 'Quadratic captures meaningful cyclical curvature.'
              : 'Linear model provides robust and parsimonious fit.'}
          </div>
        </div>

        {/* Window Volatility & Extrema */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dispersion & Bounds</span>
            <Info className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-2 space-y-0.5">
            <div className="text-xs text-slate-400">
              Sample Std Dev (s): <span className="font-mono text-slate-200 font-semibold">?{stats.stdDev.toFixed(2)}</span>
            </div>
            <div className="text-xs text-slate-400">
              Range: <span className="font-mono text-slate-200 font-semibold">?{stats.min.toFixed(0)} - ?{stats.max.toFixed(0)}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            Sample mean (y¯): <span className="font-mono text-slate-200 font-semibold">?{stats.mean.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* Main Quantitative Trend Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white m-0">
              NIFTY 50 Historical Close with Fitted Regression Trajectories
            </h2>
            <p className="text-xs text-slate-400 m-0">
              Comparing authentic NSE closing prices against first-degree OLS linear trend and second-degree polynomial curves
            </p>
          </div>

          {/* Trace Visibility Checkboxes */}
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setShowActual(!showActual)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer"
            >
              {showActual ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
              <span className="inline-block w-2.5 h-0.5 bg-cyan-400 rounded mr-0.5"></span>
              Actual Close
            </button>

            <button
              onClick={() => setShowLinear(!showLinear)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer"
            >
              {showLinear ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4 text-slate-600" />}
              <span className="inline-block w-2.5 h-0.5 bg-indigo-400 rounded mr-0.5"></span>
              Linear Trend (y^1)
            </button>

            <button
              onClick={() => setShowPoly(!showPoly)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer"
            >
              {showPoly ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4 text-slate-600" />}
              <span className="inline-block w-2.5 h-0.5 bg-amber-400 rounded mr-0.5"></span>
              Polynomial Degree 2 (y^2)
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
                interval={Math.floor(chartData.length / 7)}
              />
              <YAxis
                domain={[Math.floor(minPrice - padding), Math.ceil(maxPrice + padding)]}
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={(v) => `?${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
                formatter={(val: any, name: any) => {
                  const num = Number(val);
                  let label = 'Actual Close';
                  if (name === 'linear') label = 'Linear OLS';
                  if (name === 'poly') label = 'Quadratic Fit';
                  return [`?${num.toFixed(2)}`, label];
                }}
                labelFormatter={(label) => `Session Date: ${label}`}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }}
              />

              {showActual && (
                <Line
                  type="monotone"
                  dataKey="close"
                  name="Actual Close"
                  stroke="#38bdf8"
                  strokeWidth={1.75}
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {showLinear && (
                <Line
                  type="linear"
                  dataKey="linear"
                  name="Linear OLS"
                  stroke="#818cf8"
                  strokeWidth={2.2}
                  strokeDasharray="5 3"
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {showPoly && (
                <Line
                  type="monotone"
                  dataKey="poly"
                  name="Quadratic Fit"
                  stroke="#fbbf24"
                  strokeWidth={2.2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Live Mathematical Formula Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800">
          
          <div className="bg-slate-950/70 border border-indigo-900/40 rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-indigo-400">OLS Linear Fitted Equation</span>
              <span className="font-mono text-[11px] text-slate-400">R² = {(linear.rSquared * 100).toFixed(2)}% • RMSE: ?{linear.rmse.toFixed(1)}</span>
            </div>
            <div className="font-mono text-sm text-slate-100 bg-slate-900 px-3 py-2 rounded border border-slate-800">
              {linear.equation}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Where <code className="text-indigo-300">x</code> represents trading session index <code className="text-indigo-300">0..{data.length - 1}</code>. 
              Baseline intercept <code className="text-indigo-300">a = ?{linear.intercept.toFixed(2)}</code>, constant rate of change <code className="text-indigo-300">b = ?{linear.slope.toFixed(4)}/day</code>.
            </div>
          </div>

          <div className="bg-slate-950/70 border border-amber-900/40 rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-amber-400">Polynomial Degree 2 Fitted Equation</span>
              <span className="font-mono text-[11px] text-slate-400">R² = {(poly.rSquared * 100).toFixed(2)}% • RMSE: ?{poly.rmse.toFixed(1)}</span>
            </div>
            <div className="font-mono text-sm text-slate-100 bg-slate-900 px-3 py-2 rounded border border-slate-800">
              {poly.equation}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Curvature: <span className="font-semibold text-amber-300">
                {poly.curvatureDirection === 'concave_up' ? 'Convex / Accelerating (+c)' : poly.curvatureDirection === 'concave_down' ? 'Concave / Decelerating (-c)' : 'Nearly Linear'}
              </span>. Solved via normal equations <code className="text-amber-300">(X?X)ß = X?Y</code>.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
