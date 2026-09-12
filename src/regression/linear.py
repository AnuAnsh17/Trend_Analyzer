"""
Simple Linear Regression module.
Implements explicit Ordinary Least Squares (OLS) closed-form calculations.
"""
from dataclasses import dataclass
import numpy as np
import pandas as pd


@dataclass
class LinearRegressionResult:
    """
    Data container for linear regression output.
    """
    slope: float               # b coefficient
    intercept: float           # a coefficient
    r_squared: float           # R² goodness of fit
    equation_str: str          # Formatted equation y = a + bx
    predictions: np.ndarray    # \hat{y} array
    residuals: np.ndarray      # y - \hat{y} array
    sum_squared_residuals: float # SS_res
    total_sum_squares: float     # SS_tot


def fit_linear_regression(x: np.ndarray | pd.Series, y: np.ndarray | pd.Series) -> LinearRegressionResult:
    """
    Fits a simple linear regression y = a + bx using explicit least-squares formulas.

    Formulas:
        b = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2}
        a = \\bar{y} - b \\bar{x}
        R^2 = 1 - \\frac{SS_{res}}{SS_{tot}}
    """
    x_arr = np.asarray(x, dtype=float)
    y_arr = np.asarray(y, dtype=float)

    if len(x_arr) != len(y_arr):
        raise ValueError("X and Y must have identical lengths.")
    
    n = len(x_arr)
    if n < 2:
        raise ValueError("Linear regression requires at least 2 data points.")

    x_mean = float(np.mean(x_arr))
    y_mean = float(np.mean(y_arr))

    dx = x_arr - x_mean
    dy = y_arr - y_mean

    ss_xx = float(np.sum(dx ** 2))
    ss_xy = float(np.sum(dx * dy))

    if ss_xx == 0:
        raise ValueError("Variance of X is zero; linear regression slope is undefined.")

    # Slope b and Intercept a
    slope_b = float(ss_xy / ss_xx)
    intercept_a = float(y_mean - slope_b * x_mean)

    # Fitted values and residuals
    y_pred = intercept_a + slope_b * x_arr
    residuals = y_arr - y_pred

    # R² calculation
    ss_res = float(np.sum(residuals ** 2))
    ss_tot = float(np.sum((y_arr - y_mean) ** 2))
    
    r_squared = float(1.0 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0

    sign = "+" if slope_b >= 0 else "-"
    eq_str = f"Price = {intercept_a:,.2f} {sign} {abs(slope_b):,.4f} × t"

    return LinearRegressionResult(
        slope=slope_b,
        intercept=intercept_a,
        r_squared=r_squared,
        equation_str=eq_str,
        predictions=y_pred,
        residuals=residuals,
        sum_squared_residuals=ss_res,
        total_sum_squares=ss_tot
    )
