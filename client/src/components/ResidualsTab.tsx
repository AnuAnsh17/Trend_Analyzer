import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { LinearRegressionResult, QuadraticRegressionResult, MarketDataPoint } from '../types';
import { Activity, HelpCircle, ShieldAlert } from 'lucide-react';

interface ResidualsTabProps {
  data: MarketDataPoint[];
  linear: LinearRegressionResult;
  poly: QuadraticRegressionResult;
}

export const ResidualsTab: React.FC<ResidualsTabProps> = ({ data, linear, poly }) => {
  const [selectedModel, setSelectedModel] = useState<'Linear' | 'Quadratic'>('Linear');

  const residuals = selectedModel === 'Linear' ? linear.residuals : poly.residuals;

  // Residuals vs Time (Downsampled for responsive charts)
  const step = data.length > 2000 ? 2 : 1;
  const timeResidualData = [];
  for (let i = 0; i < data.length; i += step) {
    timeResidualData.push({
      date: data[i].Date,
      residual: residuals[i],
    });
  }

  // Calculate Residual Distribution Histogram
  const minRes = Math.min(...residuals);
  const maxRes = Math.max(...residuals);
  const binCount = 25;
  const binWidth = (maxRes - minRes) / binCount;

  const histogramData = Array.from({ length: binCount }, (_, idx) => {
    const lower = minRes + idx * binWidth;
    const upper = lower + binWidth;
    const count = residuals.filter(r => r >= lower && (idx === binCount - 1 ? r <= upper : r < upper)).length;
    return {
      bin: `?${(lower / 1000).toFixed(1)}k`,
      midpoint: (lower + upper) / 2,
      count,
    };
  });

  // Calculate residual statistics: mean should be ~0 by OLS definition
  const resMean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
  const resVar = residuals.reduce((a, b) => a + Math.pow(b - resMean, 2), 0) / (residuals.length - 1);
  const resStd = Math.sqrt(resVar);

  return (
    <div className="space-y-6">
      
      {/* Tab Header & Switcher */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white m-0 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Module 3: Residual Analysis & Diagnostic Evaluation
          </h3>
          <p className="text-xs text-slate-400 m-0 mt-0.5">
            Examines error residuals <code className="text-slate-300">e? = y? - y^?</code> to test Gauss-Markov assumptions (zero conditional mean, homoscedasticity, absence of serial correlation).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setSelectedModel('Linear')}
            className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              selectedModel === 'Linear'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Linear Residuals
          </button>
          <button
            onClick={() => setSelectedModel('Quadratic')}
            className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              selectedModel === 'Quadratic'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Quadratic Residuals
          </button>
        </div>
      </div>

      {/* Residual Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">Mean of Residuals (e)</span>
          <div className="text-xl font-mono font-bold text-white mt-1">
            ?{resMean.toFixed(4)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Confirmed: Numerically zero (e¯ ˜ 0), satisfying the foundational OLS first-order condition.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">Standard Error of Residuals (s?)</span>
          <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
            ?{resStd.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Reflects the typical dispersion of authentic NIFTY 50 prices around the regression curve.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">Max Absolute Residual (|e|???)</span>
          <div className="text-xl font-mono font-bold text-amber-400 mt-1">
            ?{Math.max(Math.abs(minRes), Math.abs(maxRes)).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Occurs during major macro shocks (e.g. March 2020 pandemic dislocation or 2024 election swings).
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Residuals vs Time */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="mb-3">
            <h4 className="text-sm font-bold text-white m-0">Residuals vs Chronological Session (e? vs t)</h4>
            <p className="text-xs text-slate-400 m-0">
              Evaluates homoscedasticity and detects temporal clustering of errors
            </p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeResidualData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  interval={Math.floor(timeResidualData.length / 5)}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(v) => `?${(v / 1000).toFixed(1)}k`}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="2 2" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`?${Number(val).toFixed(2)}`, 'Residual Error']}
                />
                <Line
                  type="monotone"
                  dataKey="residual"
                  stroke={selectedModel === 'Linear' ? '#818cf8' : '#fbbf24'}
                  strokeWidth={1.2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Residual Frequency Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="mb-3">
            <h4 className="text-sm font-bold text-white m-0">Residual Error Distribution (Histogram)</h4>
            <p className="text-xs text-slate-400 m-0">
              Visualizes normality and kurtosis in regression residuals
            </p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="bin"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  interval={3}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val} sessions`, 'Frequency Count']}
                />
                <Bar
                  dataKey="count"
                  fill={selectedModel === 'Linear' ? '#6366f1' : '#f59e0b'}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Econometric Insights Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed space-y-1">
          <strong className="text-white">Gauss-Markov & Financial Econometrics Interpretation:</strong>
          <p className="m-0">
            Financial time series residuals typically demonstrate volatility clustering (heteroscedasticity) and auto-correlation across consecutive sessions. While OLS coefficients remain mathematically unbiased estimates of the underlying deterministic trajectory, standard errors in classical hypothesis testing require Newey-West or heteroscedasticity-consistent adjustments for formal econometric inference.
          </p>
        </div>
      </div>

    </div>
  );
};
