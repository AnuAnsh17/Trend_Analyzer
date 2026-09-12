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
  Legend,
} from 'recharts';
import { MarketDataPoint } from '../types';
import { calculateMarketTechnicals } from '../math/analysis';
import { CandlestickChart, Activity, Gauge, TrendingUp } from 'lucide-react';

interface TechnicalsTabProps {
  data: MarketDataPoint[];
}

export const TechnicalsTab: React.FC<TechnicalsTabProps> = ({ data }) => {
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);

  const { returns, sma20, sma50, sma200, vol20 } = calculateMarketTechnicals(data);

  // Downsample for rendering
  const step = data.length > 2000 ? 2 : 1;
  const chartData = [];
  for (let i = 0; i < data.length; i += step) {
    chartData.push({
      date: data[i].Date,
      close: data[i].Close,
      volume: data[i].Volume,
      sma20: sma20[i],
      sma50: sma50[i],
      sma200: sma200[i],
      returnPct: returns[i],
      volatility: vol20[i],
    });
  }

  const latestVol = vol20[vol20.length - 1] ?? 0;
  const avgVol = vol20.filter(v => v !== null).reduce((a, b) => (a as number) + (b as number), 0) / (vol20.filter(v => v !== null).length || 1);

  return (
    <div className="space-y-6">
      
      {/* Intro */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-950/60 rounded-lg text-cyan-400 border border-cyan-800/40 mt-0.5">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white m-0">
              Module 5: Market Technical Structure, Moving Averages & Volatility
            </h3>
            <p className="text-xs text-slate-400 m-0 mt-1 leading-relaxed">
              Provides essential financial context alongside pure statistical regression: 20-day, 50-day, and 200-day Simple Moving Averages (SMA), session volume, daily percentage return distributions, and 20-day annualized rolling volatility.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">Current 200-Day SMA</span>
          <div className="text-xl font-mono font-bold text-white mt-1">
            {sma200[sma200.length - 1] ? `?${sma200[sma200.length - 1]?.toFixed(1)}` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Standard institutional benchmark for primary long-term market trend regime.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">Latest Annualized Volatility</span>
          <div className="text-xl font-mono font-bold text-amber-400 mt-1">
            {latestVol.toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            20-day rolling standard deviation annualized by <code className="text-slate-300">v252</code>.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">Window Mean Volatility</span>
          <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
            {avgVol.toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Average annualized volatility experienced across the selected analytical horizon.
          </p>
        </div>
      </div>

      {/* Moving Averages Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white m-0">NIFTY 50 Close with Moving Average Envelopes</h4>
            <p className="text-xs text-slate-400 m-0">Dynamic moving averages filter daily price noise into smooth trend consensus</p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2 py-1 rounded cursor-pointer border ${
                showSMA20 ? 'bg-amber-950/60 text-amber-300 border-amber-800/50' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              20 SMA
            </button>
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2 py-1 rounded cursor-pointer border ${
                showSMA50 ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              50 SMA
            </button>
            <button
              onClick={() => setShowSMA200(!showSMA200)}
              className={`px-2 py-1 rounded cursor-pointer border ${
                showSMA200 ? 'bg-rose-950/60 text-rose-300 border-rose-800/50' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              200 SMA
            </button>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                interval={Math.floor(chartData.length / 6)}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={(v) => `?${(v / 1000).toFixed(1)}k`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                }}
                formatter={(val: any, name: any) => {
                  if (val === null || val === undefined) return ['N/A', name];
                  return [`?${Number(val).toFixed(1)}`, name];
                }}
              />
              <Line
                type="monotone"
                dataKey="close"
                name="Close"
                stroke="#94a3b8"
                strokeWidth={1.2}
                dot={false}
                isAnimationActive={false}
              />
              {showSMA20 && (
                <Line
                  type="monotone"
                  dataKey="sma20"
                  name="SMA 20"
                  stroke="#fbbf24"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {showSMA50 && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  name="SMA 50"
                  stroke="#06b6d4"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {showSMA200 && (
                <Line
                  type="monotone"
                  dataKey="sma200"
                  name="SMA 200"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volatility & Volume Subcharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Rolling Volatility */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white mb-2">20-Day Annualized Rolling Volatility (%)</h4>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.filter(d => d.volatility !== null)} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" hide />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${v.toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '0.375rem',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Volatility']}
                />
                <Line
                  type="monotone"
                  dataKey="volatility"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Session Trading Volume */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white mb-2">Daily Session Trading Volume (NSE)</h4>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" hide />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '0.375rem',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} shares`, 'Volume']}
                />
                <Bar
                  dataKey="volume"
                  fill="#475569"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
