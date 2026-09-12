import React from 'react';
import { MarketDataPoint, LinearRegressionResult, QuadraticRegressionResult } from '../types';

interface RegressionTabProps {
  data: MarketDataPoint[];
  linear: LinearRegressionResult;
  poly: QuadraticRegressionResult;
}

export const RegressionTab: React.FC<RegressionTabProps> = ({ linear, poly }) => {
  return (
    <div className="flex flex-col gap-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Linear Model */}
        <div className="bg-white border border-slate-300 p-6">
          <h2 className="text-sm font-bold tracking-widest text-blue-800 border-b border-slate-200 pb-2 mb-4">LINEAR REGRESSION (OLS)</h2>
          <div className="font-mono text-lg font-bold text-slate-800 bg-slate-50 p-4 border border-slate-200 mb-6">
            {linear.equation}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">SLOPE (b)</div>
              <div className="text-base font-mono font-bold text-slate-900">{linear.slope.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">INTERCEPT (a)</div>
              <div className="text-base font-mono font-bold text-slate-900">{linear.intercept.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Quadratic Model */}
        <div className="bg-white border border-slate-300 p-6">
          <h2 className="text-sm font-bold tracking-widest text-amber-800 border-b border-slate-200 pb-2 mb-4">QUADRATIC REGRESSION</h2>
          <div className="font-mono text-base font-bold text-slate-800 bg-slate-50 p-4 border border-slate-200 mb-6">
            {poly.equation}
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">CURVATURE (c)</div>
              <div className="text-base font-mono font-bold text-slate-900">{poly.c.toExponential(4)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">LINEAR (b)</div>
              <div className="text-base font-mono font-bold text-slate-900">{poly.b.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">INTERCEPT (a)</div>
              <div className="text-base font-mono font-bold text-slate-900">{poly.a.toFixed(0)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-white border border-slate-300 p-6">
        <h2 className="text-sm font-bold tracking-widest text-slate-800 border-b border-slate-200 pb-2 mb-4">MODEL COMPARISON</h2>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-200 p-2 text-xs font-bold tracking-widest text-slate-500">METRIC</th>
              <th className="border border-slate-200 p-2 text-xs font-bold tracking-widest text-slate-500">LINEAR</th>
              <th className="border border-slate-200 p-2 text-xs font-bold tracking-widest text-slate-500">QUADRATIC</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-200 p-2 text-sm font-bold text-slate-700">R² (Explanatory Power)</td>
              <td className="border border-slate-200 p-2 font-mono text-sm">{(linear.rSquared).toFixed(4)}</td>
              <td className="border border-slate-200 p-2 font-mono text-sm">{(poly.rSquared).toFixed(4)}</td>
            </tr>
            <tr>
              <td className="border border-slate-200 p-2 text-sm font-bold text-slate-700">RMSE (Root Mean Square Error)</td>
              <td className="border border-slate-200 p-2 font-mono text-sm">?{linear.rmse.toFixed(2)}</td>
              <td className="border border-slate-200 p-2 font-mono text-sm">?{poly.rmse.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border border-slate-200 p-2 text-sm font-bold text-slate-700">MAE (Mean Absolute Error)</td>
              <td className="border border-slate-200 p-2 font-mono text-sm">?{linear.mae.toFixed(2)}</td>
              <td className="border border-slate-200 p-2 font-mono text-sm">?{poly.mae.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border border-slate-200 p-2 text-sm font-bold text-slate-700">Historical Fit Interpretation</td>
              <td className="border border-slate-200 p-2 text-sm text-slate-600">
                Assumes constant rate of change. R² indicates {((linear.rSquared)*100).toFixed(1)}% of variance explained.
              </td>
              <td className="border border-slate-200 p-2 text-sm text-slate-600">
                Captures acceleration/deceleration. Improves fit by {((poly.rSquared - linear.rSquared)*100).toFixed(2)}% over linear.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};
