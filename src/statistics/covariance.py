"""
Covariance calculation module.
Calculates sample covariance between observation index X and closing price Y.
"""
from dataclasses import dataclass
import numpy as np
import pandas as pd


@dataclass
class CovarianceResult:
    """
    Data container for covariance calculation results.
    """
    n: int
    mean_x: float
    mean_y: float
    covariance: float
    interpretation: str


def calculate_sample_covariance(x: np.ndarray | pd.Series, y: np.ndarray | pd.Series) -> CovarianceResult:
    """
    Calculates sample covariance between time index X and target price Y.

    Formula:
        Cov(X, Y) = \\frac{\\sum_{i=1}^n (x_i - \\bar{x})(y_i - \\bar{y})}{n - 1}
    """
    x_arr = np.asarray(x, dtype=float)
    y_arr = np.asarray(y, dtype=float)

    if len(x_arr) != len(y_arr):
        raise ValueError("Inputs X and Y must have equal lengths.")
    
    n = len(x_arr)
    if n < 2:
        raise ValueError("Covariance calculation requires at least 2 observations.")

    mean_x = float(np.mean(x_arr))
    mean_y = float(np.mean(y_arr))

    cov_val = float(np.sum((x_arr - mean_x) * (y_arr - mean_y)) / (n - 1))

    if cov_val > 0:
        interp = (
            f"Cov(X,Y) = {cov_val:.4f} > 0 indicates a positive overall co-movement between "
            f"the observation index (time) and closing price over this period."
        )
    elif cov_val < 0:
        interp = (
            f"Cov(X,Y) = {cov_val:.4f} < 0 indicates an inverse co-movement between "
            f"the observation index (time) and closing price over this period."
        )
    else:
        interp = f"Cov(X,Y) = 0 indicates no linear co-movement between observation index and closing price."

    return CovarianceResult(
        n=n,
        mean_x=mean_x,
        mean_y=mean_y,
        covariance=cov_val,
        interpretation=interp
    )
