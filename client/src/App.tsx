import React, { useState, useEffect, useMemo } from 'react';
import { MarketDataPoint } from './types';
import { calculateDescriptiveStats, calculateCovariance, calculateCorrelation } from './math/statistics';
import { calculateLinearRegression, calculateQuadraticRegression } from './math/regression';
import { filterDataByHorizon, classifyTrend, computeHorizonComparisons } from './math/analysis';
import { calculateMarketTools } from './math/marketTools';

import { OverviewTab } from './components/OverviewTab';
import { TrendAnalysisTab } from './components/TrendAnalysisTab';
import { RegressionTab } from './components/RegressionTab';
import { MarketToolsTab } from './components/MarketToolsTab';
import { TimeHorizonsTab } from './components/TimeHorizonsTab';
import { MethodologyTab } from './components/MethodologyTab';
import { Horizon } from './components/HorizonSelector';

import { Loader2 } from 'lucide-react';

export function App() {
  const [data, setData] = useState<MarketDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [horizon, setHorizon] = useState<Horizon>('3Y');
  const [customStart, setCustomStart] = useState('2021-01-01');
  const [customEnd, setCustomEnd] = useState('2026-09-11');

  type Tab = 'overview' | 'trend' | 'regression' | 'tools' | 'horizons' | 'methodology';
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/data/nifty50.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: MarketDataPoint[] = await res.json();
        setData(json);
        if (json.length > 0) {
          setCustomStart(json[0].Date);
          setCustomEnd(json[json.length - 1].Date);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredData = useMemo(() => filterDataByHorizon(data, horizon, customStart, customEnd), [data, horizon, customStart, customEnd]);
  
  const closes = useMemo(() => filteredData.map(d => d.Close), [filteredData]);
  const stats = useMemo(() => calculateDescriptiveStats(closes), [closes]);
  const cov = useMemo(() => calculateCovariance(closes), [closes]);
  const corr = useMemo(() => calculateCorrelation(closes), [closes]);
  const linear = useMemo(() => calculateLinearRegression(closes), [closes]);
  const poly = useMemo(() => calculateQuadraticRegression(closes), [closes]);
  const trend = useMemo(() => classifyTrend(linear, closes), [linear, closes]);
  const comparisons = useMemo(() => computeHorizonComparisons(data), [data]);
  const marketTools = useMemo(() => calculateMarketTools(filteredData), [filteredData]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50"><Loader2 className="w-8 h-8 text-slate-800 animate-spin" /></div>;
  }
  if (error || data.length === 0) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50 text-red-600 font-mono text-sm">{error || 'No data'}</div>;
  }

  const navTabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'trend', label: 'TREND ANALYSIS' },
    { id: 'regression', label: 'REGRESSION' },
    { id: 'tools', label: 'MARKET TOOLS' },
    { id: 'horizons', label: 'TIME HORIZONS' },
    { id: 'methodology', label: 'METHODOLOGY' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-slate-900 font-sans selection:bg-blue-200">
      
      {/* Terminal Top Bar */}
      <header className="bg-slate-900 text-slate-300 px-4 py-2 flex flex-col md:flex-row justify-between items-center text-xs font-mono border-b border-slate-700">
        <div className="flex items-center gap-4">
          <span className="font-bold text-white tracking-widest">NIFTY 50 STATISTICAL TREND ANALYZER</span>
          <span className="text-slate-500">v2.0 // QUANT RESEARCH TERMINAL</span>
        </div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <span>DATA: 2016 - 2026</span>
          <span className="text-emerald-400">STATUS: ONLINE</span>
        </div>
      </header>

      {/* Main Terminal Area */}
      <div className="max-w-[1440px] mx-auto p-4 flex flex-col gap-4">
        
        {/* Navigation / Control Strip */}
        <div className="bg-white border border-slate-300 p-2 shadow-sm flex flex-wrap gap-2 text-sm font-medium">
          {navTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1 border transition-colors ${activeTab === t.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Global Horizon Selector (Only visible for tabs that use filtered data) */}
        {activeTab !== 'horizons' && activeTab !== 'methodology' && (
          <div className="bg-white border border-slate-300 px-4 py-2 shadow-sm flex flex-wrap gap-4 items-center text-sm">
            <span className="font-bold text-slate-700 text-xs tracking-wider">HORIZON:</span>
            {['1Y', '3Y', '5Y', '10Y', 'Custom'].map(h => (
              <button
                key={h}
                onClick={() => setHorizon(h as Horizon)}
                className={`px-3 py-0.5 rounded text-xs font-mono font-bold ${horizon === h ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {h}
              </button>
            ))}
            {horizon === 'Custom' && (
              <div className="flex items-center gap-2 font-mono text-xs">
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="border border-slate-300 px-1" />
                <span>-</span>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="border border-slate-300 px-1" />
              </div>
            )}
            <div className="ml-auto font-mono text-xs text-slate-500">n = {filteredData.length}</div>
          </div>
        )}

        {/* Content Area */}
        <main className="min-h-[600px]">
          {activeTab === 'overview' && <OverviewTab data={filteredData} linear={linear} poly={poly} trend={trend} stats={stats} />}
          {activeTab === 'trend' && <TrendAnalysisTab data={filteredData} linear={linear} poly={poly} trend={trend} stats={stats} corr={corr} />}
          {activeTab === 'regression' && <RegressionTab data={filteredData} linear={linear} poly={poly} />}
          {activeTab === 'tools' && <MarketToolsTab data={filteredData} tools={marketTools} />}
          {activeTab === 'horizons' && <TimeHorizonsTab allData={data} comparisons={comparisons} />}
          {activeTab === 'methodology' && <MethodologyTab />}
        </main>

      </div>
    </div>
  );
}

export default App;
