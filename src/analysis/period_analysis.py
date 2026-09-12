"""
Analysis period slicing and horizon comparison module.
Filter master dataset into analytical windows, re-indexes time X = 0..N-1, and recalculates all statistical metrics.
"""
from dataclasses import dataclass
import datetime
from typing import Dict, Tuple, Optional
import numpy as np
import pandas as pd

from src.statistics.descriptive import calculate_descriptive_stats, DescriptiveStats
from src.statistics.covariance import calculate_sample_covariance, CovarianceResult
from src.statistics.correlation import calculate_pearson_correlation, CorrelationResult
from src.regression.linear import fit_linear_regression, LinearRegressionResult
from src.regression.quadratic import fit_quadratic_regression, PolynomialRegressionResult
from src.regression.evaluation import evaluate_model, compare_models, ModelMetrics


@dataclass
class PeriodAnalysisResult:
    """
    Complete statistical analysis output for a given historical observation period.
    """
    period_name: str
    start_date: str
    end_date: str
    df_period: pd.DataFrame            # Filtered dataframe with 'x_index' column
    descriptive_stats: DescriptiveStats
    covariance_res: CovarianceResult
    correlation_res: CorrelationResult
    linear_reg: LinearRegressionResult
    quadratic_reg: PolynomialRegressionResult
    linear_metrics: ModelMetrics
    quadratic_metrics: ModelMetrics
    comparison_df: pd.DataFrame
    comparison_summary: str


def analyze_period(
    df_master: pd.DataFrame,
    period_name: str = "10 Years",
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None
) -> PeriodAnalysisResult:
    """
    Slices master dataset for specified period, re-indexes time x = 0..N-1, and recalculates all statistical models.
    """
    df = df_master.copy()
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values('Date').reset_index(drop=True)

    max_date = df['Date'].max()

    if period_name == "1 Year":
        cutoff = max_date - pd.DateOffset(years=1)
        df_period = df[df['Date'] >= cutoff].copy()
    elif period_name == "3 Years":
        cutoff = max_date - pd.DateOffset(years=3)
        df_period = df[df['Date'] >= cutoff].copy()
    elif period_name == "5 Years":
        cutoff = max_date - pd.DateOffset(years=5)
        df_period = df[df['Date'] >= cutoff].copy()
    elif period_name == "10 Years":
        cutoff = max_date - pd.DateOffset(years=10)
        df_period = df[df['Date'] >= cutoff].copy()
    elif period_name == "Custom" and start_date and end_date:
        s_dt = pd.to_datetime(start_date)
        e_dt = pd.to_datetime(end_date)
        df_period = df[(df['Date'] >= s_dt) & (df['Date'] <= e_dt)].copy()
    else:
        # Default full dataset
        df_period = df.copy()

    df_period = df_period.sort_values('Date').reset_index(drop=True)

    if len(df_period) < 5:
        raise ValueError(f"Insufficient data in selected period '{period_name}' (minimum 5 trading days required).")

    # 2. Re-index observations for regression x = 0..N-1
    df_period['x_index'] = np.arange(len(df_period), dtype=float)
    x = df_period['x_index'].values
    y = df_period['Close'].values

    actual_start = df_period['Date'].min().strftime('%Y-%m-%d')
    actual_end = df_period['Date'].max().strftime('%Y-%m-%d')

    # 3. Recalculate all statistical measures
    desc_stats = calculate_descriptive_stats(y)
    cov_res = calculate_sample_covariance(x, y)
    corr_res = calculate_pearson_correlation(x, y)

    # 4. Recalculate regression models & residuals
    lin_reg = fit_linear_regression(x, y)
    quad_reg = fit_quadratic_regression(x, y)

    # 5. Model Evaluation
    lin_metrics = evaluate_model("Linear Regression", y, lin_reg.predictions, lin_reg.r_squared)
    quad_metrics = evaluate_model("Quadratic Regression", y, quad_reg.predictions, quad_reg.r_squared)

    comp_df, comp_summary = compare_models(lin_reg, quad_reg, y)

    return PeriodAnalysisResult(
        period_name=period_name,
        start_date=actual_start,
        end_date=actual_end,
        df_period=df_period,
        descriptive_stats=desc_stats,
        covariance_res=cov_res,
        correlation_res=corr_res,
        linear_reg=lin_reg,
        quadratic_reg=quad_reg,
        linear_metrics=lin_metrics,
        quadratic_metrics=quad_metrics,
        comparison_df=comp_df,
        comparison_summary=comp_summary
    )


def compare_all_periods(df_master: pd.DataFrame) -> pd.DataFrame:
    """
    Runs analysis across standard time horizons (1Y, 3Y, 5Y, 10Y) to demonstrate how statistical conclusions change with window length.
    """
    periods = ["1 Year", "3 Years", "5 Years", "10 Years"]
    records = []

    for p in periods:
        res = analyze_period(df_master, period_name=p)
        records.append({
            "Period Horizon": p,
            "Date Range": f"{res.start_date} to {res.end_date}",
            "Observations (N)": res.descriptive_stats.n,
            "Mean Price (₹)": f"{res.descriptive_stats.mean:,.2f}",
            "Std Dev (₹)": f"{res.descriptive_stats.std_dev:,.2f}",
            "Variance": f"{res.descriptive_stats.variance:,.2f}",
            "Covariance Cov(X,Y)": f"{res.covariance_res.covariance:,.2f}",
            "Pearson r": f"{res.correlation_res.r:.4f}",
            "Linear Slope b (₹/day)": f"{res.linear_reg.slope:.4f}",
            "Linear R²": f"{res.linear_reg.r_squared:.4f}",
            "Quadratic R²": f"{res.quadratic_reg.r_squared:.4f}"
        })

    return pd.DataFrame(records)
