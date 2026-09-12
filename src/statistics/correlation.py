"""
Pearson Correlation Coefficient module.
Calculates linear correlation r and provides academic interpretations.
"""
from dataclasses import dataclass
import numpy as np
import pandas as pd
from src.statistics.descriptive import calculate_descriptive_stats
from src.statistics.covariance import calculate_sample_covariance


@dataclass
class CorrelationResult:
    """
    Data container for Pearson correlation.
    """
    r: float
    r_squared: float
    strength: str
    direction: str
    interpretation: str


def calculate_pearson_correlation(x: np.ndarray | pd.Series, y: np.ndarray | pd.Series) -> CorrelationResult:
    """
    Calculates Pearson correlation coefficient r explicitly from sample covariance and standard deviations.

    Formula:
        r = \\frac{Cov(X, Y)}{s_X s_Y}
    """
    cov_res = calculate_sample_covariance(x, y)
    stats_x = calculate_descriptive_stats(x)
    stats_y = calculate_descriptive_stats(y)

    if stats_x.std_dev == 0 or stats_y.std_dev == 0:
        raise ValueError("Standard deviation of X or Y is zero; correlation is undefined.")

    r_val = float(cov_res.covariance / (stats_x.std_dev * stats_y.std_dev))
    # Clip r_val due to floating point precision limits
    r_val = max(-1.0, min(1.0, r_val))
    r_sq = r_val ** 2

    abs_r = abs(r_val)
    if abs_r >= 0.8:
        strength = "strong"
    elif abs_r >= 0.5:
        strength = "moderate"
    elif abs_r >= 0.2:
        strength = "weak"
    else:
        strength = "very weak / negligible"

    direction = "positive" if r_val > 0 else "negative" if r_val < 0 else "neutral"

    interp = (
        f"r = {r_val:.4f} indicates a {strength} {direction} linear relationship between "
        f"the observation index and closing price over the selected historical period. "
        f"(Note: Correlation measures linear co-association and does not imply financial causation)."
    )

    return CorrelationResult(
        r=r_val,
        r_squared=r_sq,
        strength=strength,
        direction=direction,
        interpretation=interp
    )
