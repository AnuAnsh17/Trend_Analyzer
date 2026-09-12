import { LinearRegressionResult, QuadraticRegressionResult } from '../types';

/**
 * Computes Ordinary Least Squares (OLS) Linear Regression:
 * y_hat = a + b * x
 * Slope: b = sum((x - mean_x) * (y - mean_y)) / sum((x - mean_x)^2)
 * Intercept: a = mean_y - b * mean_x
 */
export function calculateLinearRegression(yValues: number[]): LinearRegressionResult {
  const n = yValues.length;
  if (n < 2) {
    return {
      slope: 0,
      intercept: 0,
      annualizedSlope: 0,
      rSquared: 0,
      rmse: 0,
      mae: 0,
      fitted: [],
      residuals: [],
      equation: 'y = 0',
    };
  }

  const meanX = (n - 1) / 2;
  const meanY = yValues.reduce((a, b) => a + b, 0) / n;

  let sumProd = 0;
  let sumSqX = 0;

  for (let i = 0; i < n; i++) {
    const dx = i - meanX;
    const dy = yValues[i] - meanY;
    sumProd += dx * dy;
    sumSqX += dx * dx;
  }

  const slope = sumSqX !== 0 ? sumProd / sumSqX : 0;
  const intercept = meanY - slope * meanX;
  const annualizedSlope = slope * 252; // 252 trading days per year

  const fitted: number[] = new Array(n);
  const residuals: number[] = new Array(n);
  let ssTot = 0;
  let ssRes = 0;
  let sumAbsRes = 0;

  for (let i = 0; i < n; i++) {
    const fit = intercept + slope * i;
    const res = yValues[i] - fit;
    fitted[i] = fit;
    residuals[i] = res;

    ssRes += res * res;
    sumAbsRes += Math.abs(res);
    const dy = yValues[i] - meanY;
    ssTot += dy * dy;
  }

  const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  const rmse = Math.sqrt(ssRes / n);
  const mae = sumAbsRes / n;

  const sign = slope >= 0 ? '+' : '-';
  const equation = `y = ${intercept.toFixed(2)} ${sign} ${Math.abs(slope).toFixed(4)}x`;

  return {
    slope,
    intercept,
    annualizedSlope,
    rSquared,
    rmse,
    mae,
    fitted,
    residuals,
    equation,
  };
}

/**
 * Solves 3x3 linear system using Gaussian Elimination with partial pivoting:
 * M * params = V
 */
function solve3x3(M: number[][], V: number[]): [number, number, number] {
  const A = M.map(row => [...row]);
  const B = [...V];

  // Forward elimination
  for (let i = 0; i < 3; i++) {
    // Pivot selection
    let maxRow = i;
    for (let k = i + 1; k < 3; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }
    // Swap rows
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [B[i], B[maxRow]] = [B[maxRow], B[i]];

    for (let k = i + 1; k < 3; k++) {
      const factor = A[k][i] / A[i][i];
      for (let j = i; j < 3; j++) {
        A[k][j] -= factor * A[i][j];
      }
      B[k] -= factor * B[i];
    }
  }

  // Back substitution
  const result = [0, 0, 0];
  for (let i = 2; i >= 0; i--) {
    let sum = B[i];
    for (let j = i + 1; j < 3; j++) {
      sum -= A[i][j] * result[j];
    }
    result[i] = sum / A[i][i];
  }

  return [result[0], result[1], result[2]];
}

/**
 * Computes Second-Degree Polynomial Regression (Quadratic OLS):
 * y_hat = a + b * x + c * x^2
 * Solves normal equations (X^T * X) * beta = X^T * Y
 */
export function calculateQuadraticRegression(yValues: number[]): QuadraticRegressionResult {
  const n = yValues.length;
  if (n < 3) {
    return {
      a: 0,
      b: 0,
      c: 0,
      rSquared: 0,
      rmse: 0,
      mae: 0,
      fitted: [],
      residuals: [],
      equation: 'y = 0',
      curvatureDirection: 'linear',
    };
  }

  // Matrix X^T * X components:
  // [ n       sum(x)    sum(x^2) ]
  // [ sum(x)  sum(x^2)  sum(x^3) ]
  // [ sum(x^2) sum(x^3) sum(x^4) ]
  let sumX = 0;
  let sumX2 = 0;
  let sumX3 = 0;
  let sumX4 = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2Y = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const x2 = x * x;
    const x3 = x2 * x;
    const x4 = x3 * x;
    const y = yValues[i];

    sumX += x;
    sumX2 += x2;
    sumX3 += x3;
    sumX4 += x4;
    sumY += y;
    sumXY += x * y;
    sumX2Y += x2 * y;
  }

  const M = [
    [n, sumX, sumX2],
    [sumX, sumX2, sumX3],
    [sumX2, sumX3, sumX4],
  ];
  const V = [sumY, sumXY, sumX2Y];

  const [a, b, c] = solve3x3(M, V);

  const meanY = sumY / n;
  const fitted: number[] = new Array(n);
  const residuals: number[] = new Array(n);
  let ssTot = 0;
  let ssRes = 0;
  let sumAbsRes = 0;

  for (let i = 0; i < n; i++) {
    const fit = a + b * i + c * i * i;
    const res = yValues[i] - fit;
    fitted[i] = fit;
    residuals[i] = res;

    ssRes += res * res;
    sumAbsRes += Math.abs(res);
    const dy = yValues[i] - meanY;
    ssTot += dy * dy;
  }

  const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  const rmse = Math.sqrt(ssRes / n);
  const mae = sumAbsRes / n;

  const signB = b >= 0 ? '+' : '-';
  const signC = c >= 0 ? '+' : '-';
  const equation = `y = ${a.toFixed(2)} ${signB} ${Math.abs(b).toFixed(4)}x ${signC} ${Math.abs(c).toFixed(6)}x²`;

  let curvatureDirection: 'concave_up' | 'concave_down' | 'linear' = 'linear';
  if (c > 1e-7) curvatureDirection = 'concave_up';
  else if (c < -1e-7) curvatureDirection = 'concave_down';

  return {
    a,
    b,
    c,
    rSquared,
    rmse,
    mae,
    fitted,
    residuals,
    equation,
    curvatureDirection,
  };
}
