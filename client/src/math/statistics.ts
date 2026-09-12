import { DescriptiveStats, CovarianceResult, CorrelationResult } from '../types';

/**
 * Calculates sample descriptive statistics for a series.
 * Uses Bessel-corrected sample variance: s^2 = (1 / (n - 1)) * sum((y_i - mean)^2)
 */
export function calculateDescriptiveStats(values: number[]): DescriptiveStats {
  const n = values.length;
  if (n === 0) {
    return { n: 0, mean: 0, variance: 0, stdDev: 0, median: 0, min: 0, max: 0, range: 0 };
  }
  if (n === 1) {
    return { n: 1, mean: values[0], variance: 0, stdDev: 0, median: values[0], min: values[0], max: values[0], range: 0 };
  }

  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  // Sample variance with Bessel correction (ddof=1)
  const sumSqDiff = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const variance = sumSqDiff / (n - 1);
  const stdDev = Math.sqrt(variance);

  // Median & Extrema
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;

  return { n, mean, variance, stdDev, median, min, max, range };
}

/**
 * Calculates sample covariance between time index X (0..n-1) and values Y.
 * Formula: Cov(X, Y) = (1 / (n - 1)) * sum((x_i - mean_x) * (y_i - mean_y))
 */
export function calculateCovariance(yValues: number[]): CovarianceResult {
  const n = yValues.length;
  if (n < 2) return { covXY: 0, interpretation: 'Insufficient data points (n < 2)' };

  const meanX = (n - 1) / 2; // Exact mean for 0..n-1
  const meanY = yValues.reduce((a, b) => a + b, 0) / n;

  let sumProd = 0;
  for (let i = 0; i < n; i++) {
    sumProd += (i - meanX) * (yValues[i] - meanY);
  }

  const covXY = sumProd / (n - 1);

  let interpretation = '';
  if (covXY > 0) {
    interpretation = 'Positive: Price exhibits a general tendency to increase as time progresses.';
  } else if (covXY < 0) {
    interpretation = 'Negative: Price exhibits a general tendency to decrease as time progresses.';
  } else {
    interpretation = 'Zero: No linear co-movement detected between time and price.';
  }

  return { covXY, interpretation };
}

/**
 * Calculates Pearson correlation coefficient r between time index X and values Y.
 * Formula: r = Cov(X, Y) / (s_x * s_y)
 */
export function calculateCorrelation(yValues: number[]): CorrelationResult {
  const n = yValues.length;
  if (n < 2) {
    return {
      r: 0,
      rSquared: 0,
      interpretation: 'Insufficient data points',
      strength: 'very_weak',
      direction: 'none',
    };
  }

  const meanX = (n - 1) / 2;
  const meanY = yValues.reduce((a, b) => a + b, 0) / n;

  let sumSqX = 0;
  let sumSqY = 0;
  let sumProd = 0;

  for (let i = 0; i < n; i++) {
    const dx = i - meanX;
    const dy = yValues[i] - meanY;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
    sumProd += dx * dy;
  }

  if (sumSqX === 0 || sumSqY === 0) {
    return {
      r: 0,
      rSquared: 0,
      interpretation: 'Zero variance in one or both series',
      strength: 'very_weak',
      direction: 'none',
    };
  }

  const r = sumProd / Math.sqrt(sumSqX * sumSqY);
  const rSquared = r * r;
  const absR = Math.abs(r);

  let strength: 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak' = 'very_weak';
  if (absR >= 0.8) strength = 'very_strong';
  else if (absR >= 0.6) strength = 'strong';
  else if (absR >= 0.4) strength = 'moderate';
  else if (absR >= 0.2) strength = 'weak';

  let direction: 'positive' | 'negative' | 'none' = 'none';
  if (r > 0.001) direction = 'positive';
  else if (r < -0.001) direction = 'negative';

  const interpretation = `${direction === 'positive' ? 'Strong positive' : direction === 'negative' ? 'Negative' : 'Neutral'} correlation (r = ${r.toFixed(4)}), indicating that ${
    (rSquared * 100).toFixed(1)
  }% of price variation is linearly explained by time progression.`;

  return { r, rSquared, interpretation, strength, direction };
}
