import React from 'react';
import { LinearRegressionResult, QuadraticRegressionResult, MarketDataPoint } from '../types';
import { GitCompare, Award, Scale, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

interface RegressionTabProps {
  data: MarketDataPoint[];
  linear: LinearRegressionResult;
  poly: QuadraticRegressionResult;
}

export const RegressionTab: React.FC<RegressionTabProps> = ({ data, linear, poly }) => {
  const r2Diff = poly.rSquared - linear.rSquared;
  const rmseDiff = linear.rmse - poly.rmse;
  const preferredModel = r2Diff > 0.015 ? 'Quadratic (Degree 2)' : 'Linear (Degree 1)';

  return (
    <div className="space-y-6">
      
      {/* Intro / Academic Framework */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-950/60 rounded-lg text-indigo-400 border border-indigo-800/40 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white m-0">
              Module 2: OLS Linear & Second-Degree Polynomial Regression Engine
            </h3>
            <p className="text-xs text-slate-400 m-0 mt-1 leading-relaxed">
              Formulated strictly using analytical calculus and matrix normal equations. Contrasts the parsimony of first-degree linear OLS against the capacity of second-degree quadratic curves to capture acceleration, deceleration, and structural cycles.
            </p>
          </div>
        </div>
      </div>

      {/* Model Cards Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Linear Model Specification */}
        <div className="bg-slate-900/90 border border-indigo-900/50 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Model 1: First-Degree Linear</span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              y^ = a + bx
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-sm text-indigo-300 font-bold mb-4">
            {linear.equation}
          </div>

          {/* Parameter Details */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Intercept (a):</span>
              <span className="font-mono text-white font-semibold">?{linear.intercept.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Slope Coefficient (b):</span>
              <span className="font-mono text-cyan-400 font-semibold">?{linear.slope.toFixed(4)} / trading day</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Annualized Trend Rate (b · 252):</span>
              <span className="font-mono text-cyan-300 font-semibold">~?{linear.annualizedSlope.toFixed(1)} / year</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Coefficient of Determination (R²):</span>
              <span className="font-mono text-emerald-400 font-bold">{(linear.rSquared * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Root Mean Squared Error (RMSE):</span>
              <span className="font-mono text-white font-semibold">?{linear.rmse.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Mean Absolute Error (MAE):</span>
              <span className="font-mono text-white font-semibold">?{linear.mae.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Analytical OLS Derivation:</strong> Normal equations minimize sum of squared residuals: <code>b = ?(x - x¯)(y - ?) / ?(x - x¯)²</code> and <code>a = ? - b·x¯</code>.
          </div>
        </div>

        {/* Quadratic Model Specification */}
        <div className="bg-slate-900/90 border border-amber-900/50 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Model 2: Second-Degree Polynomial</span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              y^ = a + bx + cx²
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-sm text-amber-300 font-bold mb-4">
            {poly.equation}
          </div>

          {/* Parameter Details */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Constant (a):</span>
              <span className="font-mono text-white font-semibold">?{poly.a.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Linear Term (b):</span>
              <span className="font-mono text-amber-400 font-semibold">{poly.b.toFixed(4)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Quadratic Curvature (c):</span>
              <span className="font-mono text-amber-300 font-semibold">{poly.c.toFixed(6)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Coefficient of Determination (R²):</span>
              <span className="font-mono text-emerald-400 font-bold">{(poly.rSquared * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Root Mean Squared Error (RMSE):</span>
              <span className="font-mono text-white font-semibold">?{poly.rmse.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Mean Absolute Error (MAE):</span>
              <span className="font-mono text-white font-semibold">?{poly.mae.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Matrix Normal Formulation:</strong> Solves 3x3 linear system <code>(X?X)ß = X?Y</code> via Gaussian elimination with partial pivoting for exact numerical stability.
          </div>
        </div>

      </div>

      {/* Comparative Evaluation & Decision Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            Quantitative Model Comparison Matrix
          </span>
          <span className="text-xs text-slate-400">
            Preferred specification: <span className="font-bold text-cyan-400">{preferredModel}</span>
          </span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Evaluation Criteria</th>
                <th className="py-2.5 px-3">OLS Linear Model (Degree 1)</th>
                <th className="py-2.5 px-3">Polynomial Model (Degree 2)</th>
                <th className="py-2.5 px-3 text-right">Marginal Difference / Edge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Degrees of Freedom / Parameters</td>
                <td className="py-2.5 px-3 text-slate-200">2 parameters (a, b)</td>
                <td className="py-2.5 px-3 text-slate-200">3 parameters (a, b, c)</td>
                <td className="py-2.5 px-3 text-right font-sans text-slate-400">+1 parameter penalty</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Variance Explained (R²)</td>
                <td className="py-2.5 px-3 text-indigo-300 font-bold">{(linear.rSquared * 100).toFixed(2)}%</td>
                <td className="py-2.5 px-3 text-amber-300 font-bold">{(poly.rSquared * 100).toFixed(2)}%</td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                  {r2Diff >= 0 ? '+' : ''}{(r2Diff * 100).toFixed(2)}%
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Root Mean Squared Error (RMSE)</td>
                <td className="py-2.5 px-3 text-slate-200">?{linear.rmse.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-slate-200">?{poly.rmse.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                  -?{rmseDiff.toFixed(2)} reduction
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Mean Absolute Error (MAE)</td>
                <td className="py-2.5 px-3 text-slate-200">?{linear.mae.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-slate-200">?{poly.mae.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                  -?{(linear.mae - poly.mae).toFixed(2)} reduction
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Curvature Characterization</td>
                <td className="py-2.5 px-3 font-sans text-slate-400">Strictly constant linear slope</td>
                <td className="py-2.5 px-3 font-sans text-amber-300 capitalize font-medium">{poly.curvatureDirection.replace('_', ' ')}</td>
                <td className="py-2.5 px-3 text-right font-sans text-slate-300">Captures multi-year cycle</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Academic Caveat Notice */}
        <div className="mt-4 p-3.5 bg-amber-950/30 border border-amber-900/50 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong>Statistical Rigor & Extrapolation Warning:</strong> While the second-degree polynomial achieves a mathematically higher in-sample R² due to parameter flexibility, higher-order polynomials tend to diverge rapidly when extrapolating beyond session {data.length - 1}. For long-term structural trend characterization, the linear model offers greater parsimony and lower risk of overfitting (Occam’s razor principle).
          </div>
        </div>

      </div>

    </div>
  );
};
