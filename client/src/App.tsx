import React, { useState, useEffect, useMemo } from 'react';
import { MarketDataPoint } from './types';
import { calculateDescriptiveStats, calculateCovariance, calculateCorrelation } from './math/statistics';
import { calculateLinearRegression, calculateQuadraticRegression } from './math/regression';
import { filterDataByHorizon, classifyTrend, computeHorizonComparisons } from './math/analysis';

import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { HorizonSelector, Horizon } from './components/HorizonSelector';
import { OverviewTrendTab } from './components/OverviewTrendTab';
import { StatisticsTab } from './components/StatisticsTab';
import { HorizonComparisonTab } from './components/HorizonComparisonTab';
import { ResidualsTab } from './components/ResidualsTab';

import {
  TrendingUp,
  BarChart2,
  Activity,
  Layers,
  Loader2,
  Download
} from 'lucide-react';

export function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [data, setData] = useState<MarketDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Horizon State
  const [horizon, setHorizon] = useState<Horizon>('10Y');
  const [customStart, setCustomStart] = useState('2021-01-01');
  const [customEnd, setCustomEnd] = useState('2026-09-11');

  // Navigation Tabs - Simplified
  type Tab = 'overview' | 'statistics' | 'comparison' | 'residuals';
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Fetch Dataset
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/data/nifty50.json');
        if (!res.ok) {
          throw new Error(`Failed to load dataset: HTTP ${res.status}`);
        }
        const json: MarketDataPoint[] = await res.json();
        setData(json);
        if (json.length > 0) {
          setCustomStart(json[0].Date);
          setCustomEnd(json[json.length - 1].Date);
        }
      } catch (err: any) {
        console.error('Error fetching NIFTY 50 data:', err);
        setError(err.message || 'Failed to fetch NIFTY 50 data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return filterDataByHorizon(data, horizon, customStart, customEnd);
  }, [data, horizon, customStart, customEnd]);

  const closes = useMemo(() => filteredData.map(d => d.Close), [filteredData]);
  const stats = useMemo(() => calculateDescriptiveStats(closes), [closes]);
  const cov = useMemo(() => calculateCovariance(closes), [closes]);
  const corr = useMemo(() => calculateCorrelation(closes), [closes]);
  const linear = useMemo(() => calculateLinearRegression(closes), [closes]);
  const poly = useMemo(() => calculateQuadraticRegression(closes), [closes]);
  const trend = useMemo(() => classifyTrend(linear, closes), [linear, closes]);
  const comparisons = useMemo(() => computeHorizonComparisons(data), [data]);

  if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-lg font-medium text-slate-800">Initializing Quantitative Engine...</p>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-rose-600 p-6 text-center">
        <p className="text-xl font-bold mb-2">Error Loading Dataset</p>
        <p className="text-sm text-slate-500 max-w-md">{error || 'No records returned from data source.'}</p>
      </div>
    );
  }

  const latestClose = data[data.length - 1].Close;
  const prevClose = data.length > 1 ? data[data.length - 2].Close : latestClose;

  const handleExportSummary = () => {
    // Basic export
    const report = { generatedAt: new Date().toISOString(), horizon, descriptiveStats: stats, linearOLS: linear, quadraticModel: poly };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nifty50_report_${horizon.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navTabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview & Trend', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'statistics', label: 'Statistical Models', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'comparison', label: 'Multi-Horizon Matrix', icon: <Layers className="w-4 h-4" /> },
    { id: 'residuals', label: 'Residual Diagnostics', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      <Header data={data} currentClose={latestClose} prevClose={prevClose} onBack={() => setHasStarted(false)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
        
        <HorizonSelector
          currentHorizon={horizon}
          onSelect={setHorizon}
          customStart={customStart}
          customEnd={customEnd}
          onStartChange={setCustomStart}
          onEndChange={setCustomEnd}
          minDate={data[0]?.Date ?? '2016-08-01'}
          maxDate={data[data.length - 1]?.Date ?? '2026-09-11'}
          totalFiltered={filteredData.length}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {navTabs.map(t => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200/50'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
          <button
            onClick={handleExportSummary}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            Export Data
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 md:p-8">
          {activeTab === 'overview' && (
            <OverviewTrendTab data={filteredData} linear={linear} poly={poly} trend={trend} />
          )}
          {activeTab === 'statistics' && (
            <StatisticsTab stats={stats} cov={cov} corr={corr} linear={linear} poly={poly} />
          )}
          {activeTab === 'comparison' && (
            <HorizonComparisonTab allData={data} comparisons={comparisons} />
          )}
          {activeTab === 'residuals' && (
            <ResidualsTab data={filteredData} linear={linear} poly={poly} />
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500 mt-auto">
        <p>Group 14 Maths Mini Project • NIFTY 50 Analysis</p>
      </footer>
    </div>
  );
}

export default App;
