import React, { useState } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MarketDataPoint } from '../types';
import { MarketToolsResult } from '../math/marketTools';

interface MarketToolsTabProps {
  data: MarketDataPoint[];
  tools: MarketToolsResult;
}

export const MarketToolsTab: React.FC<MarketToolsTabProps> = ({ data, tools }) => {
  const [view, setView] = useState<'PRICE_MA' | 'RETURNS' | 'VOLATILITY' | 'DRAWDOWN'>('PRICE_MA');

  const step = data.length > 2000 ? 2 : 1;
  const chartData = data.filter((_, i) => i % step === 0).map((d, i) => {
    const idx = i * step;
    return {
      date: d.Date,
      close: d.Close,
      volume: d.Volume,
      sma20: tools.sma20[idx],
      sma50: tools.sma50[idx],
      sma200: tools.sma200[idx],
      returns: tools.returns[idx] ? tools.returns[idx]! * 100 : 0, // as percentage
      volatility: tools.volatility20[idx] ? tools.volatility20[idx]! * 100 : 0, // as percentage
      drawdown: tools.drawdown[idx] * 100, // as percentage
    };
  });

  return (
    <div className="flex flex-col gap-4">
      
      {/* Control Strip */}
      <div className="bg-white border border-slate-300 p-2 shadow-sm flex flex-wrap gap-2 text-xs font-bold font-mono tracking-widest">
        <button onClick={() => setView('PRICE_MA')} className={`px-4 py-2 border ${view === 'PRICE_MA' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>PRICE & MOVING AVERAGES</button>
        <button onClick={() => setView('RETURNS')} className={`px-4 py-2 border ${view === 'RETURNS' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>DAILY RETURNS</button>
        <button onClick={() => setView('VOLATILITY')} className={`px-4 py-2 border ${view === 'VOLATILITY' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>ROLLING VOLATILITY (20D)</button>
        <button onClick={() => setView('DRAWDOWN')} className={`px-4 py-2 border ${view === 'DRAWDOWN' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>HISTORICAL DRAWDOWN</button>
      </div>

      <div className="bg-white border border-slate-300 p-4">
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'monospace' }} minTickGap={50} />
              
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '0', fontFamily: 'monospace', fontSize: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
              />

              {view === 'PRICE_MA' && (
                <>
                  <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#0f172a" tick={{ fontSize: 11, fontFamily: 'monospace' }} orientation="right" />
                  <Line yAxisId="left" type="monotone" dataKey="close" name="Close" stroke="#0f172a" strokeWidth={1} dot={false} isAnimationActive={false} />
                  <Line yAxisId="left" type="monotone" dataKey="sma20" name="SMA 20" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line yAxisId="left" type="monotone" dataKey="sma50" name="SMA 50" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line yAxisId="left" type="monotone" dataKey="sma200" name="SMA 200" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                </>
              )}

              {view === 'RETURNS' && (
                <>
                  <YAxis domain={['auto', 'auto']} stroke="#0f172a" tick={{ fontSize: 11, fontFamily: 'monospace' }} tickFormatter={v => `${v.toFixed(1)}%`} orientation="right" />
                  <Bar dataKey="returns" name="Daily Return" fill="#64748b" isAnimationActive={false} />
                </>
              )}

              {view === 'VOLATILITY' && (
                <>
                  <YAxis domain={[0, 'auto']} stroke="#0f172a" tick={{ fontSize: 11, fontFamily: 'monospace' }} tickFormatter={v => `${v.toFixed(1)}%`} orientation="right" />
                  <Line type="monotone" dataKey="volatility" name="Ann. Volatility (20D)" stroke="#8b5cf6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </>
              )}

              {view === 'DRAWDOWN' && (
                <>
                  <YAxis domain={['auto', 0]} stroke="#0f172a" tick={{ fontSize: 11, fontFamily: 'monospace' }} tickFormatter={v => `${v.toFixed(1)}%`} orientation="right" />
                  <Line type="stepAfter" dataKey="drawdown" name="Drawdown" stroke="#dc2626" strokeWidth={1.5} dot={false} isAnimationActive={false} fill="#fef2f2" />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
};
