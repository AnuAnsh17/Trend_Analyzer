import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { MarketDataPoint, LinearRegressionResult, QuadraticRegressionResult, TrendAnalysisResult, DescriptiveStats } from '../types';

interface OverviewTabProps {
  data: MarketDataPoint[];
  linear: LinearRegressionResult;
  poly: QuadraticRegressionResult;
  trend: TrendAnalysisResult;
  stats: DescriptiveStats;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ data, linear, poly, trend, stats }) => {
  const [showActual, setShowActual] = useState(true);
  const [showLinear, setShowLinear] = useState(true);
  const [showPoly, setShowPoly] = useState(false);
  const [projectionDays, setProjectionDays] = useState<0 | 30 | 90 | 180>(30);

  const chartData = useMemo(() => {
    const step = data.length > 2000 ? 2 : 1;
    const baseData = data.filter((_, i) => i % step === 0).map((d, i) => ({
      date: d.Date,
      close: d.Close,
      linear: linear.fitted[i * step],
      poly: poly.fitted[i * step],
      isProjection: false
    }));

    if (projectionDays === 0) return baseData;

    const lastDate = new Date(data[data.length - 1].Date);
    const projData = [];
    const n = data.length;

    for (let i = 1; i <= projectionDays; i++) {
      if (i % step !== 0 && i !== projectionDays) continue;
      
      const futureDate = new Date(lastDate);
      // Rough trading days approx (+ 1.4 days per trading day)
      futureDate.setDate(futureDate.getDate() + Math.round(i * 1.45)); 
      
      const idx = n - 1 + i;
      const projLinear = linear.intercept + linear.slope * idx;
      const projPoly = poly.a + poly.b * idx + poly.c * idx * idx;

      projData.push({
        date: futureDate.toISOString().split('T')[0],
        close: null,
        projLinear: projLinear,
        projPoly: projPoly,
        isProjection: true
      });
    }

    return [...baseData, ...projData];
  }, [data, linear, poly, projectionDays]);

  const latestPrice = data[data.length - 1].Close;
  const n = data.length;
  const projIdx = n - 1 + projectionDays;
  const projLinearVal = linear.intercept + linear.slope * projIdx;
  
  let trendIcon = '?';
  if (trend.classification === 'UPWARD') trendIcon = '?';
  if (trend.classification === 'DOWNWARD') trendIcon = '?';

  const volatility = (stats.stdDev / stats.mean) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-300 p-4">
          <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">LATEST PRICE</div>
          <div className="text-2xl font-mono text-slate-900">?{latestPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="bg-white border border-slate-300 p-4">
          <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">HISTORICAL TREND</div>
          <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className={trend.classification === 'UPWARD' ? 'text-emerald-600' : trend.classification === 'DOWNWARD' ? 'text-rose-600' : 'text-slate-600'}>{trendIcon}</span>
            {trend.classification}
          </div>
        </div>
        <div className="bg-white border border-slate-300 p-4">
          <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">TREND STRENGTH</div>
          <div className="text-xl font-bold text-slate-900">{trend.confidence.toUpperCase()}</div>
        </div>
        <div className="bg-white border border-slate-300 p-4">
          <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">LINEAR R²</div>
          <div className="text-2xl font-mono text-slate-900">{(linear.rSquared).toFixed(3)}</div>
        </div>
        <div className="bg-white border border-slate-300 p-4">
          <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">VOLATILITY (CV)</div>
          <div className="text-2xl font-mono text-slate-900">{volatility.toFixed(1)}%</div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-white border border-slate-300 p-4 flex flex-col">
        <div className="flex flex-wrap items-center justify-between mb-4 border-b border-slate-200 pb-2">
          <h2 className="text-sm font-bold tracking-widest text-slate-800">PRIMARY PRICE & PROJECTION CHART</h2>
          
          <div className="flex items-center gap-6 text-xs font-mono font-bold">
            <div className="flex gap-3">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={showActual} onChange={e => setShowActual(e.target.checked)} />
                Price (Actual)
              </label>
              <label className="flex items-center gap-1 cursor-pointer text-blue-700">
                <input type="checkbox" checked={showLinear} onChange={e => setShowLinear(e.target.checked)} />
                Linear Model
              </label>
              <label className="flex items-center gap-1 cursor-pointer text-amber-700">
                <input type="checkbox" checked={showPoly} onChange={e => setShowPoly(e.target.checked)} />
                Quadratic Model
              </label>
            </div>
            
            <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
              <span className="text-slate-500">PROJECTION:</span>
              {[0, 30, 90, 180].map(d => (
                <button
                  key={d}
                  onClick={() => setProjectionDays(d as any)}
                  className={`px-2 py-0.5 border ${projectionDays === d ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-200'}`}
                >
                  {d === 0 ? 'OFF' : `${d}D`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'monospace' }} minTickGap={50} />
              <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'monospace' }} orientation="right" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '0', fontFamily: 'monospace', fontSize: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
              />
              
              {showActual && <Line type="monotone" dataKey="close" name="Actual Price" stroke="#0f172a" strokeWidth={1.5} dot={false} isAnimationActive={false} />}
              
              {showLinear && <Line type="linear" dataKey="linear" name="Historical Linear Fit" stroke="#1d4ed8" strokeWidth={2} dot={false} isAnimationActive={false} />}
              {showLinear && projectionDays > 0 && <Line type="linear" dataKey="projLinear" name="Projected Linear" stroke="#1d4ed8" strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />}
              
              {showPoly && <Line type="monotone" dataKey="poly" name="Historical Poly Fit" stroke="#b45309" strokeWidth={2} dot={false} isAnimationActive={false} />}
              {showPoly && projectionDays > 0 && <Line type="monotone" dataKey="projPoly" name="Projected Poly" stroke="#b45309" strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />}
              
              {projectionDays > 0 && <ReferenceLine x={data[data.length - 1].Date} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'TODAY', fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {projectionDays > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
            <span className="font-bold mr-2">WARNING:</span>
            Model-based projection represents statistical extrapolation of the historical fit, not a guaranteed prediction or expected market price. Financial prices are affected by external factors that simple regression does not capture.
          </div>
        )}
      </div>

      {/* Forward Projection Mini Table */}
      {projectionDays > 0 && (
        <div className="bg-white border border-slate-300 p-4">
          <h3 className="text-xs font-bold tracking-widest text-slate-800 mb-4 border-b border-slate-200 pb-2">FORWARD PROJECTION (STATISTICAL EXTRAPOLATION)</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 font-bold mb-1">CURRENT</div>
              <div className="text-xl font-mono text-slate-900">?{latestPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
            {[30, 90, 180].map(d => {
              const pIdx = n - 1 + d;
              const pVal = linear.intercept + linear.slope * pIdx;
              const pDiff = pVal - latestPrice;
              const dir = pDiff >= 0 ? '? Positive' : '? Negative';
              return (
                <div key={d} className={`p-4 border ${projectionDays === d ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-[10px] text-slate-500 font-bold mb-1">{d}D MODEL</div>
                  <div className="text-xl font-mono text-slate-900 mb-1">?{pVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                  <div className={`text-xs font-bold ${pDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{dir}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
