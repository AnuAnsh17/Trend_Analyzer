"""
Trend classification module.
Provides mathematical interpretation of trend directions based on regression slope and normalized rate of change.
"""
from dataclasses import dataclass
import numpy as np


@dataclass
class TrendClassification:
    """
    Data container for historical trend classification.
    """
    trend_label: str             # "Upward Historical Trend", "Downward Historical Trend", "Flat Historical Trend"
    daily_slope: float           # Absolute slope (₹/trading day)
    annualized_growth: float     # Estimated annual rate based on 252 trading days (₹/year)
    normalized_slope_pct: float  # Slope as % of mean price per trading day
    explanation: str             # Academic interpretation


def classify_trend(slope: float, mean_price: float, n_obs: int) -> TrendClassification:
    """
    Classifies historical price trend based on regression slope b.

    Threshold Logic:
        Normalized daily slope = (slope / mean_price) * 100
        - Flat threshold: |Normalized daily slope| < 0.005% per trading day (~1.25% per year)
        - Upward: Normalized daily slope >= 0.005%
        - Downward: Normalized daily slope <= -0.005%
    """
    if mean_price <= 0:
        raise ValueError("Mean price must be strictly positive.")

    daily_pct = (slope / mean_price) * 100.0
    annual_growth = slope * 252.0  # Standard ~252 trading days per year
    annual_pct = (annual_growth / mean_price) * 100.0

    # Flat threshold: 0.005% daily normalized change
    flat_threshold_pct = 0.005

    if abs(daily_pct) < flat_threshold_pct:
        trend_label = "Flat / Sideways Historical Trend"
        explanation = (
            f"The estimated regression slope of ₹{slope:.4f}/day corresponds to a negligible normalized rate of change "
            f"({daily_pct:.4f}% of mean price per trading day, or ~{annual_pct:.2f}% annualized). "
            f"This mathematically indicates a flat or sideways historical trend over the analyzed period."
        )
    elif slope > 0:
        trend_label = "Upward Historical Trend"
        explanation = (
            f"The positive regression slope of +₹{slope:.4f}/day indicates a sustained historical upward trend "
            f"(averaging +{daily_pct:.4f}% of mean price per trading day, or ~+{annual_pct:.2f}% annualized over ~252 trading days)."
        )
    else:
        trend_label = "Downward Historical Trend"
        explanation = (
            f"The negative regression slope of -₹{abs(slope):.4f}/day indicates a historical downward trajectory "
            f"(averaging -{abs(daily_pct):.4f}% of mean price per trading day, or ~-{abs(annual_pct):.2f}% annualized)."
        )

    return TrendClassification(
        trend_label=trend_label,
        daily_slope=slope,
        annualized_growth=annual_growth,
        normalized_slope_pct=daily_pct,
        explanation=explanation
    )
