import React from 'react';
import { MarketDataPoint, LinearRegressionResult, QuadraticRegressionResult, TrendAnalysisResult, DescriptiveStats, CorrelationResult } from '../types';

interface TrendAnalysisTabProps {
  data: MarketDataPoint[];
  linear: LinearRegressionResult;
  poly: QuadraticRegressionResult;
  trend: TrendAnalysisResult;
  stats: DescriptiveStats;
  corr: CorrelationResult;
}

export const TrendAnalysisTab: React.FC<TrendAnalysisTabProps> = ({ data, linear, poly, trend, stats, corr }) => {
  
  // Dynamic Interpretation Generation
  const generateInterpretation = () => {
    const lines = [];
    
    // Direction
    lines.push(`Historical trend direction is strongly ${trend.classification.toLowerCase()}.`);
    
    // R2 Explanatory power
    const r2Pct = (linear.rSquared * 100).toFixed(1);
    if (linear.rSquared > 0.7) lines.push(`The linear model exhibits high explanatory power, capturing ${r2Pct}% of the historical variation.`);
    else if (linear.rSquared > 0.4) lines.push(`The linear model exhibits moderate explanatory power, capturing ${r2Pct}% of the historical variation.`);
    else lines.push(`The linear model exhibits low explanatory power, capturing only ${r2Pct}% of the historical variation, suggesting high volatility or non-linear behavior.`);
    
    // Linear vs Poly comparison
    if (poly.rSquared - linear.rSquared > 0.05) {
      lines.push(`The quadratic model provides a notably stronger historical fit (R² = ${(poly.rSquared*100).toFixed(1)}%) than the linear model, indicating significant curvature.`);
    } else {
      lines.push(`The quadratic model does not provide a significantly better fit than the linear model, suggesting the trend is predominantly linear.`);
    }

    return lines;
  };

  const interpretations = generateInterpretation();

  return (
    <div className="flex flex-col gap-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Quantitative Metrics */}
        <div className="bg-white border border-slate-300 p-6 flex flex-col gap-6">
          <h2 className="text-sm font-bold tracking-widest text-slate-800 border-b border-slate-200 pb-2">TREND QUANTIFICATION</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">DIRECTION</div>
              <div className="text-lg font-mono font-bold text-slate-900">{trend.classification}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">SLOPE (?/DAY)</div>
              <div className="text-lg font-mono font-bold text-slate-900">{linear.slope > 0 ? '+' : ''}{linear.slope.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">PEARSON (r)</div>
              <div className="text-lg font-mono font-bold text-slate-900">{corr.r.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">LINEAR R²</div>
              <div className="text-lg font-mono font-bold text-slate-900">{(linear.rSquared).toFixed(4)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">ANNUALIZED RETURN (EST)</div>
              <div className="text-lg font-mono font-bold text-slate-900">{trend.annualReturnEst.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-widest">HISTORICAL CONSISTENCY</div>
              <div className="text-lg font-mono font-bold text-slate-900">{trend.confidence.toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* Dynamic Interpretation Engine */}
        <div className="bg-white border border-slate-300 p-6 flex flex-col">
          <h2 className="text-sm font-bold tracking-widest text-slate-800 border-b border-slate-200 pb-2 mb-4">INTERPRETATION ENGINE</h2>
          
          <div className="flex-1 bg-slate-50 p-4 border border-slate-200 font-mono text-sm leading-relaxed text-slate-700">
            {interpretations.map((line, idx) => (
              <p key={idx} className="mb-4 last:mb-0">
                <span className="text-blue-500 mr-2">&gt;</span>{line}
              </p>
            ))}
          </div>
        </div>

      </div>

      {/* Statistical Evidence Summary */}
      <div className="bg-white border border-slate-300 p-6">
        <h2 className="text-sm font-bold tracking-widest text-slate-800 border-b border-slate-200 pb-2 mb-4">SUPPORTING STATISTICAL EVIDENCE</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold mb-1">MEAN</div>
            <div className="font-mono text-sm font-bold text-slate-900">{stats.mean.toFixed(0)}</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold mb-1">MEDIAN</div>
            <div className="font-mono text-sm font-bold text-slate-900">{stats.median.toFixed(0)}</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold mb-1">STD DEV</div>
            <div className="font-mono text-sm font-bold text-slate-900">{stats.stdDev.toFixed(0)}</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold mb-1">VARIANCE</div>
            <div className="font-mono text-sm font-bold text-slate-900">{stats.variance.toExponential(2)}</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold mb-1">COVARIANCE</div>
            <div className="font-mono text-sm font-bold text-slate-900">{(corr.r * stats.stdDev * (data.length/Math.sqrt(12))).toExponential(2)}</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold mb-1">CORRELATION</div>
            <div className="font-mono text-sm font-bold text-slate-900">{corr.r.toFixed(4)}</div>
          </div>
        </div>
      </div>

    </div>
  );
};
