"""
Descriptive Statistics module.
Implements explicit mathematical calculations for single-variable sample distributions.
"""
from dataclasses import dataclass
import numpy as np
import pandas as pd


@dataclass
class DescriptiveStats:
    """
    Data container for single-variable descriptive statistical metrics.
    """
    n: int
    mean: float
    median: float
    min_val: float
    max_val: float
    variance: float  # Sample variance (dof=1)
    std_dev: float   # Sample standard deviation (dof=1)

    def to_dict(self) -> dict:
        return {
            "Observations (N)": self.n,
            "Mean": self.mean,
            "Median": self.median,
            "Minimum": self.min_val,
            "Maximum": self.max_val,
            "Sample Variance": self.variance,
            "Sample Standard Deviation": self.std_dev,
        }


def calculate_descriptive_stats(data: pd.Series | np.ndarray) -> DescriptiveStats:
    """
    Calculates summary descriptive statistics explicitly using sample formulas.

    Formulas:
        Mean: \\bar{x} = \\frac{\\sum_{i=1}^n x_i}{n}
        Sample Variance: s^2 = \\frac{\\sum_{i=1}^n (x_i - \\bar{x})^2}{n - 1}
        Sample Std Dev: s = \\sqrt{s^2}
    """
    arr = np.asarray(data, dtype=float)
    arr = arr[~np.isnan(arr)]
    
    n = len(arr)
    if n < 2:
        raise ValueError("Descriptive statistics require at least 2 non-NaN observations.")

    mean_val = float(np.sum(arr) / n)
    median_val = float(np.median(arr))
    min_val = float(np.min(arr))
    max_val = float(np.max(arr))

    # Explicit Sample Variance (ddof=1)
    diff = arr - mean_val
    variance_val = float(np.sum(diff ** 2) / (n - 1))
    std_dev_val = float(np.sqrt(variance_val))

    return DescriptiveStats(
        n=n,
        mean=mean_val,
        median=median_val,
        min_val=min_val,
        max_val=max_val,
        variance=variance_val,
        std_dev=std_dev_val
    )
