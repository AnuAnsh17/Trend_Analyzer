import {
  MarketDataPoint,
  TrendAnalysisResult,
  HorizonComparisonItem,
  LinearRegressionResult,
  QuadraticRegressionResult
} from '../types';
import { calculateDescriptiveStats, calculateCovariance, calculateCorrelation } from './statistics';
import { calculateLinearRegression, calculateQuadraticRegression } from './regression';

/**
 * Filter dataset according to requested horizon or custom date bounds
 */
export function filterDataByHorizon(
  data: MarketDataPoint[],
  horizon: '1Y' | '3Y' | '5Y' | '10Y' | 'Custom',
  customStart?: string,
  customEnd?: string
): MarketDataPoint[] {
  if (!data || data.length === 0) return [];

  const lastDate = new Date(data[data.length - 1].Date);

  if (horizon === 'Custom') {
    if (!customStart || !customEnd) return data;
    const start = new Date(customStart);
    const end = new Date(customEnd);
    return data.filter(d => {
      const dt = new Date(d.Date);
      return dt >= start && dt <= end;
    });
  }

  let years = 10;
  if (horizon === '1Y') years = 1;
  else if (horizon === '3Y') years = 3;
  else if (horizon === '5Y') years = 5;
  else if (horizon === '10Y') years = 10;

  const cutoff = new Date(lastDate);
  cutoff.setFullYear(cutoff.getFullYear() - years);

  const filtered = data.filter(d => new Date(d.Date) >= cutoff);
  return filtered.length > 0 ? filtered : data;
}

/**
 * Classifies trend based on slope, R², and net change.
 */
export function classifyTrend(
  linear: LinearRegressionResult,
  prices: number[]
): TrendAnalysisResult {
  if (prices.length < 2) {
    return {
      classification: 'RELATIVELY FLAT',
      summary: 'Insufficient data to compute trend.',
      confidence: 'Low',
      annualReturnEst: 0,
      totalChangePct: 0,
    };
  }

  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const totalChangePct = ((endPrice - startPrice) / startPrice) * 100;
  const annualReturnEst = (linear.annualizedSlope / linear.intercept) * 100;

  // Decision rule aligned with Python engine
  const slopeThreshold = 0.5; // Rs per day threshold
  let classification: 'UPWARD' | 'DOWNWARD' | 'RELATIVELY FLAT' = 'RELATIVELY FLAT';

  if (linear.slope > slopeThreshold && linear.rSquared > 0.15) {
    classification = 'UPWARD';
  } else if (linear.slope < -slopeThreshold && linear.rSquared > 0.15) {
    classification = 'DOWNWARD';
  } else {
    classification = 'RELATIVELY FLAT';
  }

  let confidence: 'High' | 'Moderate' | 'Low' = 'Low';
  if (linear.rSquared >= 0.75) confidence = 'High';
  else if (linear.rSquared >= 0.45) confidence = 'Moderate';

  const summary = `NIFTY 50 exhibits an ${classification.toLowerCase()} trajectory over this window, averaging ~?${linear.slope.toFixed(2)}/session (~?${linear.annualizedSlope.toFixed(0)}/yr) with an explanatory power of R² = ${(linear.rSquared * 100).toFixed(1)}%.`;

  return {
    classification,
    summary,
    confidence,
    annualReturnEst,
    totalChangePct,
  };
}

/**
 * Computes comparative metrics across all 4 key standard horizons (1Y, 3Y, 5Y, 10Y)
 */
export function computeHorizonComparisons(allData: MarketDataPoint[]): HorizonComparisonItem[] {
  const horizons: ('1Y' | '3Y' | '5Y' | '10Y')[] = ['1Y', '3Y', '5Y', '10Y'];

  return horizons.map(h => {
    const subset = filterDataByHorizon(allData, h);
    const closes = subset.map(d => d.Close);
    const stats = calculateDescriptiveStats(closes);
    const cov = calculateCovariance(closes);
    const corr = calculateCorrelation(closes);
    const lin = calculateLinearRegression(closes);
    const quad = calculateQuadraticRegression(closes);

    const bestModel = quad.rSquared > lin.rSquared + 0.02 ? 'Quadratic' : 'Linear';

    return {
      horizon: h,
      startDate: subset[0]?.Date ?? '',
      endDate: subset[subset.length - 1]?.Date ?? '',
      count: subset.length,
      mean: stats.mean,
      stdDev: stats.stdDev,
      covXY: cov.covXY,
      correlation: corr.r,
      linearSlopeAnnual: lin.annualizedSlope,
      linearR2: lin.rSquared,
      linearRMSE: lin.rmse,
      polyR2: quad.rSquared,
      polyRMSE: quad.rmse,
      bestModel,
    };
  });
}

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], window: number): (number | null)[] {
  const result: (number | null)[] = new Array(data.length);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    if (i >= window) {
      sum -= data[i - window];
    }
    if (i >= window - 1) {
      result[i] = sum / window;
    } else {
      result[i] = null;
    }
  }
  return result;
}

/**
 * Calculates Daily Returns % and Rolling Volatility (20-day annualized)
 */
export function calculateMarketTechnicals(data: MarketDataPoint[]) {
  const n = data.length;
  const returns: number[] = new Array(n).fill(0);
  const sma20 = calculateSMA(data.map(d => d.Close), 20);
  const sma50 = calculateSMA(data.map(d => d.Close), 50);
  const sma200 = calculateSMA(data.map(d => d.Close), 200);

  for (let i = 1; i < n; i++) {
    returns[i] = ((data[i].Close - data[i - 1].Close) / data[i - 1].Close) * 100;
  }

  // 20-day rolling annualized volatility: std(daily_returns) * sqrt(252)
  const vol20: (number | null)[] = new Array(n).fill(null);
  for (let i = 19; i < n; i++) {
    const windowReturns = returns.slice(i - 19, i + 1);
    const mean = windowReturns.reduce((a, b) => a + b, 0) / 20;
    const variance = windowReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 19;
    const dailyStd = Math.sqrt(variance);
    vol20[i] = dailyStd * Math.sqrt(252);
  }

  return { returns, sma20, sma50, sma200, vol20 };
}
