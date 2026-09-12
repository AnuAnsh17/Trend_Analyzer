"""
Unit tests for data pipeline, cleaning, and period filtering.
Does not require live external yfinance API calls.
"""
import pytest
import pandas as pd
import numpy as np
from src.data.preprocessing import DataPipeline, DatasetReport
from src.analysis.period_analysis import analyze_period


def test_clean_and_validate():
    # Synthetic raw dataframe with duplicates, NaNs, non-chronological dates
    raw_data = {
        'Date': ['2023-01-05', '2023-01-01', '2023-01-01', '2023-01-03', '2023-01-04'],
        'Open': [100, 90, 90, 95, np.nan],
        'High': [105, 95, 95, 98, 102],
        'Low': [98, 88, 88, 92, 97],
        'Close': [102, 92, 92, np.nan, -10],  # NaN and negative close to be filtered out
        'Volume': [1000, 500, 500, 800, 900]
    }
    df_raw = pd.DataFrame(raw_data)
    
    pipeline = DataPipeline(data_dir="data_test_temp")
    df_cleaned, report = pipeline.clean_and_validate(df_raw)

    # Date '2023-01-01' duplicated -> 1 kept
    # Date '2023-01-03' Close is NaN -> dropped
    # Date '2023-01-04' Close is -10 -> dropped
    # Remaining valid dates: 2023-01-01 (Close 92) and 2023-01-05 (Close 102)
    assert len(df_cleaned) == 2
    assert list(df_cleaned['Close']) == [92.0, 102.0]
    assert report.duplicate_rows_count == 1
    assert report.missing_values_count == 1
    assert df_cleaned['Date'].iloc[0] < df_cleaned['Date'].iloc[1]


def test_period_analysis_slicing():
    # Build 10-year synthetic daily dataset
    dates = pd.date_range(start="2014-01-01", end="2024-01-01", freq="D")
    n = len(dates)
    prices = 5000 + 5.0 * np.arange(n) + np.sin(np.linspace(0, 10, n)) * 100

    df_master = pd.DataFrame({
        'Date': dates,
        'Open': prices,
        'High': prices + 10,
        'Low': prices - 10,
        'Close': prices,
        'Volume': 10000
    })

    res_1y = analyze_period(df_master, period_name="1 Year")
    res_10y = analyze_period(df_master, period_name="10 Years")

    assert res_1y.descriptive_stats.n < res_10y.descriptive_stats.n
    assert res_1y.df_period['x_index'].iloc[0] == 0
    assert res_1y.df_period['x_index'].iloc[-1] == len(res_1y.df_period) - 1
