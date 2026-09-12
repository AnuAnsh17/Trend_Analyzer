import React from 'react';
import { DescriptiveStats, CovarianceResult, CorrelationResult, LinearRegressionResult, QuadraticRegressionResult } from '../types';

interface StatisticsTabProps {
  stats: DescriptiveStats;
  cov: CovarianceResult;
  corr: CorrelationResult;
  linear: LinearRegressionResult;
  poly: QuadraticRegressionResult;
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({ stats, cov, corr, linear, poly }) => {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Descriptive Stats */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">Descriptive Statistics</h3>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-600">Sample Size (n)</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{stats.n.toLocaleString()}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-600">Mean (y¯)</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">?{stats.mean.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-600">Std Deviation (s)</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">?{stats.stdDev.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-600">Variance (s²) <span className="text-[10px] text-indigo-500 ml-1 bg-indigo-50 px-1 rounded">Bessel</span></td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{stats.variance.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-600">Median (Q2)</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">?{stats.median.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4 pb-2 border-b border-slate-200">Bivariate Association</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Covariance (X,Y)</div>
              <div className="text-xl font-mono font-bold text-slate-800">{cov.covXY.toFixed(2)}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pearson (r)</div>
              <div className="text-xl font-mono font-bold text-indigo-600">{corr.r.toFixed(4)}</div>
            </div>
          </div>
        </div>

        {/* Regression Models */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">Regression Models</h3>
          
          <div className="space-y-6">
            <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-widest mb-3 relative z-10">OLS Linear (Degree 1)</h4>
              <div className="font-mono text-lg font-bold text-slate-800 bg-white/80 p-3 rounded-xl border border-indigo-50 mb-4 relative z-10">
                {linear.equation}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm relative z-10">
                <div className="text-slate-500">R²: <span className="font-bold font-mono text-slate-900">{(linear.rSquared * 100).toFixed(2)}%</span></div>
                <div className="text-slate-500">RMSE: <span className="font-bold font-mono text-slate-900">?{linear.rmse.toFixed(1)}</span></div>
              </div>
            </div>

            <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <h4 className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-3 relative z-10">Polynomial (Degree 2)</h4>
              <div className="font-mono text-base font-bold text-slate-800 bg-white/80 p-3 rounded-xl border border-amber-50 mb-4 relative z-10">
                {poly.equation}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm relative z-10">
                <div className="text-slate-500">R²: <span className="font-bold font-mono text-slate-900">{(poly.rSquared * 100).toFixed(2)}%</span></div>
                <div className="text-slate-500">RMSE: <span className="font-bold font-mono text-slate-900">?{poly.rmse.toFixed(1)}</span></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
