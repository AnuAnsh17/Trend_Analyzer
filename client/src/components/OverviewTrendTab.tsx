import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MarketDataPoint, LinearRegressionResult, QuadraticRegressionResult, TrendAnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Minus, CheckSquare, Square } from 'lucide-react';

interface OverviewTrendTabProps {
  data: MarketDataPoint[];
  linear: LinearRegressionResult;
  poly: QuadraticRegressionResult;
  trend: TrendAnalysisResult;
}

export const OverviewTrendTab: React.FC<OverviewTrendTabProps> = ({ data, linear, poly, trend }) => {
  const [showActual, setShowActual] = useState(true);
  const [showLinear, setShowLinear] = useState(true);
  const [showPoly, setShowPoly] = useState(true);

  const step = data.length > 2000 ? 2 : 1;
  const chartData = data.filter((_, i) => i % step === 0).map((d, i) => ({
    date: d.Date,
    close: d.Close,
    linear: linear.fitted[i * step],
    poly: poly.fitted[i * step],
  }));

  const minPrice = Math.min(...data.map(d => d.Close));
  const maxPrice = Math.max(...data.map(d => d.Close));

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trend Direction</span>
            {trend.classification === 'UPWARD' && <TrendingUp className="w-5 h-5 text-emerald-500" />}
            {trend.classification === 'DOWNWARD' && <TrendingDown className="w-5 h-5 text-rose-500" />}
            {trend.classification === 'RELATIVELY FLAT' && <Minus className="w-5 h-5 text-amber-500" />}
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{trend.classification}</div>
          <div className="text-sm text-slate-500 mt-1">Confidence: <span className="font-semibold text-indigo-600">{trend.confidence}</span></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Linear Gradient</div>
          <div className="text-2xl font-black font-mono text-indigo-600 tracking-tight">
            {linear.slope >= 0 ? '+' : ''}?{linear.slope.toFixed(2)}
            <span className="text-sm font-sans font-medium text-slate-400"> / day</span>
          </div>
          <div className="text-sm text-slate-500 mt-1">Annualized: ?{linear.annualizedSlope.toFixed(0)}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Linear Fit (R²)</div>
          <div className="text-2xl font-black font-mono text-emerald-600 tracking-tight">
            {(linear.rSquared * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-slate-500 mt-1">Poly R²: {(poly.rSquared * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="font-bold text-slate-800 m-0">Historical Close vs Regression Models</h2>
          
          <div className="flex items-center gap-4 text-sm font-medium">
            <button onClick={() => setShowActual(!showActual)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              {showActual ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4" />}
              Actual
            </button>
            <button onClick={() => setShowLinear(!showLinear)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              {showLinear ? <CheckSquare className="w-4 h-4 text-indigo-500" /> : <Square className="w-4 h-4" />}
              Linear
            </button>
            <button onClick={() => setShowPoly(!showPoly)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              {showPoly ? <CheckSquare className="w-4 h-4 text-amber-500" /> : <Square className="w-4 h-4" />}
              Quadratic
            </button>
          </div>
        </div>

        <div className="w-full h-[400px] p-4 bg-white">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 6)} />
              <YAxis domain={[Math.floor(minPrice * 0.95), Math.ceil(maxPrice * 1.05)]} stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `?${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => `?${val.toFixed(2)}`} />
              {showActual && <Line type="monotone" dataKey="close" name="Close Price" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />}
              {showLinear && <Line type="linear" dataKey="linear" name="Linear Fit" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="5 5" dot={false} isAnimationActive={false} />}
              {showPoly && <Line type="monotone" dataKey="poly" name="Quadratic Fit" stroke="#f59e0b" strokeWidth={2.5} dot={false} isAnimationActive={false} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
