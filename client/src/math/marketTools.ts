import { MarketDataPoint } from '../types';

export interface MarketToolsResult {
  sma20: (number | null)[];
  sma50: (number | null)[];
  sma200: (number | null)[];
  returns: (number | null)[];
  volatility20: (number | null)[];
  drawdown: number[];
}

export function calculateMarketTools(data: MarketDataPoint[]): MarketToolsResult {
  const n = data.length;
  const closes = data.map(d => d.Close);

  const sma20 = new Array(n).fill(null);
  const sma50 = new Array(n).fill(null);
  const sma200 = new Array(n).fill(null);
  const returns = new Array(n).fill(null);
  const volatility20 = new Array(n).fill(null);
  const drawdown = new Array(n).fill(0);

  let runningPeak = closes[0];

  for (let i = 0; i < n; i++) {
    // Returns
    if (i > 0) {
      returns[i] = (closes[i] - closes[i - 1]) / closes[i - 1];
    }

    // SMA
    if (i >= 19) {
      let sum = 0;
      for (let j = i - 19; j <= i; j++) sum += closes[j];
      sma20[i] = sum / 20;
    }
    if (i >= 49) {
      let sum = 0;
      for (let j = i - 49; j <= i; j++) sum += closes[j];
      sma50[i] = sum / 50;
    }
    if (i >= 199) {
      let sum = 0;
      for (let j = i - 199; j <= i; j++) sum += closes[j];
      sma200[i] = sum / 200;
    }

    // Volatility (20-day rolling stdev of returns)
    if (i >= 20) {
      let sumRet = 0;
      for (let j = i - 19; j <= i; j++) sumRet += returns[j]!;
      const meanRet = sumRet / 20;
      let sumSq = 0;
      for (let j = i - 19; j <= i; j++) sumSq += Math.pow(returns[j]! - meanRet, 2);
      // Annualized volatility
      volatility20[i] = Math.sqrt(sumSq / 19) * Math.sqrt(252);
    }

    // Drawdown
    if (closes[i] > runningPeak) {
      runningPeak = closes[i];
    }
    drawdown[i] = (closes[i] - runningPeak) / runningPeak;
  }

  return { sma20, sma50, sma200, returns, volatility20, drawdown };
}
