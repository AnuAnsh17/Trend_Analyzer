import React, { useState, useEffect, useMemo } from 'react';
import { MarketDataPoint } from './types';
import { calculateDescriptiveStats, calculateCovariance, calculateCorrelation } from './math/statistics';
import { calculateLinearRegression, calculateQuadraticRegression } from './math/regression';
import { filterDataByHorizon, classifyTrend, computeHorizonComparisons } from './math/analysis';
import { Header } from './components/Header';
import { HorizonSelector, Horizon } from './components/HorizonSelector';
import { OverviewTrendTab } from './components/OverviewTrendTab';
import { StatisticsTab } from './components/StatisticsTab';
import { RegressionTab } from './components/RegressionTab';
import { ResidualsTab } from './components/ResidualsTab';
import { HorizonComparisonTab } from './components/HorizonComparisonTab';
import { TechnicalsTab } from './components/TechnicalsTab';
import { AcademicTheoryTab } from './components/AcademicTheoryTab';
import {
  TrendingUp,
  BarChart2,
  GitCommit,
  Activity,
  Layers,
  Sliders,
  GraduationCap,
  Loader2,
  Download
} from 'lucide-react';

export function App() {
  const [data, setData] = useState<MarketDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Horizon State
  const [horizon, setHorizon] = useState<Horizon>('10Y');
  const [customStart, setCustomStart] = useState('2021-01-01');
  const [customEnd, setCustomEnd] = useState('2026-09-11');

  // Navigation Tabs
  type Tab = 'overview' | 'statistics' | 'regression' | 'residuals' | 'comparison' | 'technicals' | 'theory';
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

  // Filtered dataset for selected horizon
  const filteredData = useMemo(() => {
    return filterDataByHorizon(data, horizon, customStart, customEnd);
  }, [data, horizon, customStart, customEnd]);

  // Compute mathematical models dynamically
  const closes = useMemo(() => filteredData.map(d => d.Close), [filteredData]);
  const stats = useMemo(() => calculateDescriptiveStats(closes), [closes]);
  const cov = useMemo(() => calculateCovariance(closes), [closes]);
  const corr = useMemo(() => calculateCorrelation(closes), [closes]);
  const linear = useMemo(() => calculateLinearRegression(closes), [closes]);
  const poly = useMemo(() => calculateQuadraticRegression(closes), [closes]);
  const trend = useMemo(() => classifyTrend(linear, closes), [linear, closes]);
  const comparisons = useMemo(() => computeHorizonComparisons(data), [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading 10-Year NIFTY 50 Historical Dataset...</p>
        <p className="text-xs text-slate-500 mt-1">2,485 daily session observations (Aug 2016 – Sep 2026)</p>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-rose-400 p-6 text-center">
        <p className="text-base font-bold mb-2">Error Loading Dataset</p>
        <p className="text-xs text-slate-400 max-w-md">{error || 'No records returned from data source.'}</p>
      </div>
    );
  }

  const latestClose = data[data.length - 1].Close;
  const prevClose = data.length > 1 ? data[data.length - 2].Close : latestClose;

  // Export summary report
  const handleExportSummary = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      instrument: 'NIFTY 50 (NSE)',
      horizon,
      sessionsAnalyzed: filteredData.length,
      startDate: filteredData[0]?.Date,
      endDate: filteredData[filteredData.length - 1]?.Date,
      descriptiveStats: {
        mean: stats.mean,
        variance: stats.variance,
        stdDev: stats.stdDev,
        median: stats.median,
        min: stats.min,
        max: stats.max,
      },
      bivariateMetrics: {
        covariance: cov.covXY,
        pearsonR: corr.r,
        rSquared: corr.rSquared,
      },
      linearOLS: {
        equation: linear.equation,
        slope: linear.slope,
        annualizedSlope: linear.annualizedSlope,
        rSquared: linear.rSquared,
        rmse: linear.rmse,
        mae: linear.mae,
      },
      quadraticModel: {
        equation: poly.equation,
        rSquared: poly.rSquared,
        rmse: poly.rmse,
        mae: poly.mae,
        curvature: poly.curvatureDirection,
      },
      trendClassification: trend,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nifty50_statistical_report_${horizon.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navTabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Trend & Regression', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'statistics', label: 'Descriptive & Covariance', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'regression', label: 'Linear vs Poly Models', icon: <GitCommit className="w-4 h-4" /> },
    { id: 'residuals', label: 'Residual Diagnostics', icon: <Activity className="w-4 h-4" /> },
    { id: 'comparison', label: 'Multi-Horizon Matrix', icon: <Layers className="w-4 h-4" /> },
    { id: 'technicals', label: 'Technical Context', icon: <Sliders className="w-4 h-4" /> },
    { id: 'theory', label: 'Syllabus & Viva Guide', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        data={data}
        currentClose={latestClose}
        prevClose={prevClose}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Horizon Controller Bar */}
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

        {/* Tab Navigation & Export Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {navTabs.map(t => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 cursor-pointer self-end sm:self-auto transition-colors"
            title="Download full quantitative parameters in JSON format"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Quantitative Report</span>
          </button>
        </div>

        {/* Dynamic Tab Panes */}
        {activeTab === 'overview' && (
          <OverviewTrendTab
            data={filteredData}
            stats={stats}
            linear={linear}
            poly={poly}
            trend={trend}
          />
        )}

        {activeTab === 'statistics' && (
          <StatisticsTab
            stats={stats}
            cov={cov}
            corr={corr}
          />
        )}

        {activeTab === 'regression' && (
          <RegressionTab
            data={filteredData}
            linear={linear}
            poly={poly}
          />
        )}

        {activeTab === 'residuals' && (
          <ResidualsTab
            data={filteredData}
            linear={linear}
            poly={poly}
          />
        )}

        {activeTab === 'comparison' && (
          <HorizonComparisonTab
            allData={data}
            comparisons={comparisons}
          />
        )}

        {activeTab === 'technicals' && (
          <TechnicalsTab
            data={filteredData}
          />
        )}

        {activeTab === 'theory' && (
          <AcademicTheoryTab />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            NIFTY 50 Statistical Trend Analyzer • Statistical Techniques Project
          </span>
          <span>
            Authentic NSE Historical Data • Rigorous OLS Mathematics • Zero Mock Values
          </span>
        </div>
      </footer>

    </div>
  );
}

export default App;
