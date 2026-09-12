import React from 'react';
import { MarketDataPoint, HorizonComparisonItem } from '../types';
import { calculateMarketTools } from '../math/marketTools';
import { filterDataByHorizon } from '../math/analysis';

interface TimeHorizonsTabProps {
  allData: MarketDataPoint[];
  comparisons: HorizonComparisonItem[];
}

export const TimeHorizonsTab: React.FC<TimeHorizonsTabProps> = ({ allData, comparisons }) => {
  
  // Calculate Volatility and Returns for each horizon
  const horizonMetrics = comparisons.map(comp => {
    const subset = filterDataByHorizon(allData, comp.horizon);
    if (subset.length < 2) return { ...comp, volatility: 0, totalReturn: 0, trendIcon: "" };
    
    const tools = calculateMarketTools(subset);
    // Average volatility
    const validVol = tools.volatility20.filter(v => v !== null) as number[];
    const avgVol = validVol.length > 0 ? validVol.reduce((a, b) => a + b, 0) / validVol.length : 0;
    
    const startPrice = subset[0].Close;
    const endPrice = subset[subset.length - 1].Close;
    const totalReturn = ((endPrice - startPrice) / startPrice) * 100;

    let trendIcon = '?';
    if (comp.linearSlopeAnnual > 500) trendIcon = '??';
    else if (comp.linearSlopeAnnual > 0) trendIcon = '?';
    else if (comp.linearSlopeAnnual < -500) trendIcon = '??';
    else if (comp.linearSlopeAnnual < 0) trendIcon = '?';

    return {
      ...comp,
      volatility: avgVol * 100, // percentage
      totalReturn,
      trendIcon
    };
  });

  // Dynamic Multi-Horizon Interpretation
  const generateInterpretation = () => {
    if (horizonMetrics.length < 4) return "Insufficient data for multi-horizon analysis.";
    
    const y1 = horizonMetrics.find(h => h.horizon === '1Y');
    const y10 = horizonMetrics.find(h => h.horizon === '10Y');
    if (!y1 || !y10) return "";

    const lines = [];
    
    if (y1.linearSlopeAnnual > y10.linearSlopeAnnual) {
      lines.push("The recent 1-year trend is stronger (steeper) than the long-term 10-year baseline.");
    } else {
      lines.push("The recent 1-year trend is weaker than the long-term 10-year baseline.");
    }

    const maxVol = Math.max(...horizonMetrics.map(h => h.volatility));
    const maxVolHorizon = horizonMetrics.find(h => h.volatility === maxVol)?.horizon;
    lines.push(`Historical volatility was highest during the ${maxVolHorizon} window.`);

    const consistent = horizonMetrics.every(h => h.linearSlopeAnnual > 0);
    if (consistent) {
      lines.push("The upward trend is structurally consistent across all analyzed time horizons.");
    }

    return lines.join(" ");
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="bg-white border border-slate-300 p-6">
        <h2 className="text-sm font-bold tracking-widest text-slate-800 border-b border-slate-200 pb-2 mb-4">TIME HORIZON COMPARISON MATRIX</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 p-3 text-xs font-bold tracking-widest text-slate-500 w-1/5">METRIC</th>
                {horizonMetrics.map(h => (
                  <th key={h.horizon} className="border border-slate-200 p-3 text-xs font-bold tracking-widest text-slate-900 text-center">{h.horizon}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 p-3 text-xs font-bold text-slate-700 bg-slate-50">TREND</td>
                {horizonMetrics.map(h => (
                  <td key={h.horizon} className="border border-slate-200 p-3 text-center text-lg font-bold">{h.trendIcon}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-200 p-3 text-xs font-bold text-slate-700 bg-slate-50">SLOPE (ANNUALIZED)</td>
                {horizonMetrics.map(h => (
                  <td key={h.horizon} className="border border-slate-200 p-3 text-center font-mono text-sm">{h.linearSlopeAnnual > 0 ? '+' : ''}{h.linearSlopeAnnual.toFixed(0)}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-200 p-3 text-xs font-bold text-slate-700 bg-slate-50">LINEAR R²</td>
                {horizonMetrics.map(h => (
                  <td key={h.horizon} className="border border-slate-200 p-3 text-center font-mono text-sm">{h.linearR2.toFixed(3)}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-200 p-3 text-xs font-bold text-slate-700 bg-slate-50">VOLATILITY (AVG)</td>
                {horizonMetrics.map(h => (
                  <td key={h.horizon} className="border border-slate-200 p-3 text-center font-mono text-sm">{h.volatility.toFixed(1)}%</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-200 p-3 text-xs font-bold text-slate-700 bg-slate-50">TOTAL RETURN</td>
                {horizonMetrics.map(h => (
                  <td key={h.horizon} className="border border-slate-200 p-3 text-center font-mono text-sm">{h.totalReturn > 0 ? '+' : ''}{h.totalReturn.toFixed(1)}%</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-800 text-slate-100 p-6 border border-slate-700">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 border-b border-slate-600 pb-2 mb-4">MULTI-HORIZON INTERPRETATION</h2>
        <p className="font-mono text-sm leading-relaxed">
          &gt; {generateInterpretation()}
        </p>
      </div>

    </div>
  );
};
