"""
Second-Degree Polynomial Regression module.
Implements explicit Ordinary Least Squares (OLS) quadratic polynomial fitting via normal equations.
"""
from dataclasses import dataclass
import numpy as np
import pandas as pd


@dataclass
class PolynomialRegressionResult:
    """
    Data container for quadratic polynomial regression output.
    """
    a: float                    # Intercept (constant)
    b: float                    # Linear coefficient
    c: float                    # Quadratic coefficient
    r_squared: float            # R² goodness of fit
    equation_str: str           # Formatted equation y = a + bx + cx²
    predictions: np.ndarray     # \hat{y} array
    residuals: np.ndarray       # y - \hat{y} array
    sum_squared_residuals: float# SS_res
    total_sum_squares: float    # SS_tot


def fit_quadratic_regression(x: np.ndarray | pd.Series, y: np.ndarray | pd.Series) -> PolynomialRegressionResult:
    """
    Fits a quadratic regression y = a + bx + cx² using explicit OLS Matrix Normal Equations.

    Normal Equations:
        \\mathbf{\\beta} = (X^T X)^{-1} X^T \\mathbf{y}
    where design matrix X = [1, x, x^2].
    """
    x_arr = np.asarray(x, dtype=float)
    y_arr = np.asarray(y, dtype=float)

    if len(x_arr) != len(y_arr):
        raise ValueError("X and Y must have identical lengths.")
    
    n = len(x_arr)
    if n < 3:
        raise ValueError("Quadratic regression requires at least 3 data points.")

    # Construct Design Matrix X = [1, x, x^2]
    X_mat = np.column_stack([np.ones(n), x_arr, x_arr**2])

    # Normal equations solving: (X^T X) \beta = X^T y
    XT_X = X_mat.T @ X_mat
    XT_y = X_mat.T @ y_arr

    try:
        beta = np.linalg.solve(XT_X, XT_y)
    except np.linalg.LinAlgError:
        beta = np.linalg.pinv(XT_X) @ XT_y

    a_val, b_val, c_val = float(beta[0]), float(beta[1]), float(beta[2])

    # Fitted values and residuals
    y_pred = X_mat @ beta
    residuals = y_arr - y_pred

    # R² calculation
    y_mean = float(np.mean(y_arr))
    ss_res = float(np.sum(residuals ** 2))
    ss_tot = float(np.sum((y_arr - y_mean) ** 2))

    r_squared = float(1.0 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0

    b_sign = "+" if b_val >= 0 else "-"
    c_sign = "+" if c_val >= 0 else "-"
    eq_str = f"Price = {a_val:,.2f} {b_sign} {abs(b_val):,.4f} × t {c_sign} {abs(c_val):,.6f} × t²"

    return PolynomialRegressionResult(
        a=a_val,
        b=b_val,
        c=c_val,
        r_squared=r_squared,
        equation_str=eq_str,
        predictions=y_pred,
        residuals=residuals,
        sum_squared_residuals=ss_res,
        total_sum_squares=ss_tot
    )
