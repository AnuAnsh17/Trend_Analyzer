export interface MarketDataPoint {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

export interface DescriptiveStats {
  n: number;
  mean: number;
  variance: number;
  stdDev: number;
  median: number;
  min: number;
  max: number;
  range: number;
}

export interface CovarianceResult {
  covXY: number;
  interpretation: string;
}

export interface CorrelationResult {
  r: number;
  rSquared: number;
  interpretation: string;
  strength: 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak';
  direction: 'positive' | 'negative' | 'none';
}

export interface LinearRegressionResult {
  slope: number;       // b (Rs/day)
  intercept: number;   // a (Rs)
  annualizedSlope: number; // b * 252
  rSquared: number;
  rmse: number;
  mae: number;
  fitted: number[];
  residuals: number[];
  equation: string;
}

export interface QuadraticRegressionResult {
  a: number; // constant
  b: number; // linear coefficient
  c: number; // quadratic coefficient (curvature)
  rSquared: number;
  rmse: number;
  mae: number;
  fitted: number[];
  residuals: number[];
  equation: string;
  curvatureDirection: 'concave_up' | 'concave_down' | 'linear';
}

export type TrendClassification = 'UPWARD' | 'DOWNWARD' | 'RELATIVELY FLAT';

export interface TrendAnalysisResult {
  classification: TrendClassification;
  summary: string;
  confidence: 'High' | 'Moderate' | 'Low';
  annualReturnEst: number;
  totalChangePct: number;
}

export interface HorizonComparisonItem {
  horizon: '1Y' | '3Y' | '5Y' | '10Y';
  startDate: string;
  endDate: string;
  count: number;
  mean: number;
  stdDev: number;
  covXY: number;
  correlation: number;
  linearSlopeAnnual: number;
  linearR2: number;
  linearRMSE: number;
  polyR2: number;
  polyRMSE: number;
  bestModel: 'Linear' | 'Quadratic';
}
