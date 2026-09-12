import React from 'react';
import { DescriptiveStats, CovarianceResult, CorrelationResult } from '../types';
import { BarChart3, HelpCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface StatisticsTabProps {
  stats: DescriptiveStats;
  cov: CovarianceResult;
  corr: CorrelationResult;
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({ stats, cov, corr }) => {
  return (
    <div className="space-y-6">
      
      {/* Overview Intro */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-950/60 rounded-lg text-cyan-400 border border-cyan-800/40 mt-0.5">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white m-0">
              Module 1: Descriptive & Bivariate Statistical Foundations
            </h3>
            <p className="text-xs text-slate-400 m-0 mt-1 leading-relaxed">
              Provides rigorous univariate parametric metrics (mean, variance, standard deviation with Bessel correction) and bivariate association metrics (time-price covariance and Pearson product-moment correlation).
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Descriptive Table & Correlation Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Descriptive Statistics Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span>Descriptive Statistics (Close Price Series)</span>
            <span className="text-[11px] font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Bessel Corrected (ddof = 1)
            </span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3">Mathematical Notation</th>
                  <th className="py-2.5 px-3 text-right">Computed Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Sample Size</td>
                  <td className="py-2.5 px-3 text-cyan-400">n</td>
                  <td className="py-2.5 px-3 text-right text-white font-bold">{stats.n.toLocaleString()}</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Sample Mean</td>
                  <td className="py-2.5 px-3 text-cyan-400">y¯ = (1/n) ? y?</td>
                  <td className="py-2.5 px-3 text-right text-white font-bold">?{stats.mean.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Sample Variance</td>
                  <td className="py-2.5 px-3 text-cyan-400">s² = [1/(n-1)] ? (y? - y¯)²</td>
                  <td className="py-2.5 px-3 text-right text-white font-bold">{stats.variance.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Sample Standard Deviation</td>
                  <td className="py-2.5 px-3 text-cyan-400">s = v(s²)</td>
                  <td className="py-2.5 px-3 text-right text-white font-bold">?{stats.stdDev.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Median Price</td>
                  <td className="py-2.5 px-3 text-cyan-400">Q2 (50th percentile)</td>
                  <td className="py-2.5 px-3 text-right text-white font-bold">?{stats.median.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Minimum (Infimum)</td>
                  <td className="py-2.5 px-3 text-cyan-400">min(y)</td>
                  <td className="py-2.5 px-3 text-right text-white font-bold">?{stats.min.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Maximum (Supremum)</td>
                  <td className="py-2.5 px-3 text-cyan-400">max(y)</td>
                  <td className="py-2.5 px-3 text-right text-white font-bold">?{stats.max.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Price Range</td>
                  <td className="py-2.5 px-3 text-cyan-400">R = max(y) - min(y)</td>
                  <td className="py-2.5 px-3 text-right text-white font-bold">?{stats.range.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Covariance & Correlation Deep-Dive */}
        <div className="space-y-4">
          
          {/* Covariance Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white m-0">Sample Covariance: Cov(X, Y)</h4>
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Time (X) vs Price (Y)
              </span>
            </div>
            <div className="text-2xl font-mono font-extrabold text-white my-2">
              {cov.covXY.toFixed(2)}
            </div>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Directional Interpretation:
              </div>
              <p className="text-[11px] text-slate-400 m-0 leading-relaxed">
                {cov.interpretation} Because Cov(X, Y) &gt; 0, deviations above the mean chronological position systematically coincide with deviations above the mean price level.
              </p>
              <div className="font-mono text-[10px] text-slate-500 pt-1">
                Formula: Cov(X, Y) = [1 / (n - 1)] ? (x? - x¯)(y? - y¯)
              </div>
            </div>
          </div>

          {/* Pearson Correlation Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white m-0">Pearson Correlation: r</h4>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                [-1.0 = r = +1.0]
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-3xl font-mono font-extrabold text-emerald-400">
                {corr.r.toFixed(4)}
              </span>
              <span className="text-xs text-slate-400">
                (Coefficient of Determination: <span className="font-mono text-white font-bold">r² = {(corr.rSquared * 100).toFixed(2)}%</span>)
              </span>
            </div>

            {/* Visual Correlation Bar Meter */}
            <div className="space-y-1.5 my-3">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-1.0 (Inverse)</span>
                <span>0.0 (No Correlation)</span>
                <span>+1.0 (Perfect)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden relative border border-slate-800">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700"></div>
                <div
                  className={`h-full transition-all duration-300 ${
                    corr.r >= 0 ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' : 'bg-rose-500'
                  }`}
                  style={{
                    width: `${Math.abs(corr.r) * 50}%`,
                    marginLeft: corr.r >= 0 ? '50%' : `${50 - Math.abs(corr.r) * 50}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300">
              <p className="text-[11px] text-slate-300 m-0 leading-relaxed">
                {corr.interpretation}
              </p>
              <div className="font-mono text-[10px] text-slate-500 pt-1.5">
                Formula: r = Cov(X, Y) / (s_x · s_y)
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
