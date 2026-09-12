import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { LinearRegressionResult, QuadraticRegressionResult, MarketDataPoint } from '../types';

interface ResidualsTabProps {
  data: MarketDataPoint[];
  linear: LinearRegressionResult;
  poly: QuadraticRegressionResult;
}

export const ResidualsTab: React.FC<ResidualsTabProps> = ({ data, linear, poly }) => {
  const [selectedModel, setSelectedModel] = useState<'Linear' | 'Quadratic'>('Linear');

  const residuals = selectedModel === 'Linear' ? linear.residuals : poly.residuals;

  const step = data.length > 2000 ? 2 : 1;
  const timeResidualData = data.filter((_, i) => i % step === 0).map((d, i) => ({
    date: d.Date,
    residual: residuals[i * step],
  }));

  const minRes = Math.min(...residuals);
  const maxRes = Math.max(...residuals);
  const binCount = 25;
  const binWidth = (maxRes - minRes) / binCount;

  const histogramData = Array.from({ length: binCount }, (_, idx) => {
    const lower = minRes + idx * binWidth;
    const upper = lower + binWidth;
    const count = residuals.filter(r => r >= lower && (idx === binCount - 1 ? r <= upper : r < upper)).length;
    return { bin: `?${(lower / 1000).toFixed(1)}k`, count };
  });

  const resMean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
  const resStd = Math.sqrt(residuals.reduce((a, b) => a + Math.pow(b - resMean, 2), 0) / (residuals.length - 1));

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Residual Diagnostics</h3>
          <p className="text-sm text-slate-500 mt-1">Analyzing error terms (e? = y? - y^?) to validate model assumptions.</p>
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button onClick={() => setSelectedModel('Linear')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${selectedModel === 'Linear' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Linear</button>
          <button onClick={() => setSelectedModel('Quadratic')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${selectedModel === 'Quadratic' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Quadratic</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Mean of Residuals</div>
          <div className="text-xl font-mono font-black text-slate-800">?{resMean.toFixed(4)}</div>
          <div className="text-xs text-slate-500 mt-1">Expected: ~0 (OLS Property)</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Standard Error</div>
          <div className="text-xl font-mono font-black text-indigo-600">?{resStd.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">Dispersion around fit</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Max Absolute Error</div>
          <div className="text-xl font-mono font-black text-amber-600">?{Math.max(Math.abs(minRes), Math.abs(maxRes)).toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">Peak deviation</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-4">Residuals vs Time (Homoscedasticity check)</h4>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeResidualData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} interval={Math.floor(timeResidualData.length / 5)} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `?${(v/1000).toFixed(1)}k`} />
                <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => [`?${val.toFixed(2)}`, 'Error']} />
                <Line type="monotone" dataKey="residual" stroke={selectedModel === 'Linear' ? '#6366f1' : '#f59e0b'} strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-4">Error Distribution (Normality check)</h4>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="bin" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} interval={4} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8fafc' }} formatter={(val: any) => [`${val} sessions`, 'Frequency']} />
                <Bar dataKey="count" fill={selectedModel === 'Linear' ? '#818cf8' : '#fbbf24'} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
