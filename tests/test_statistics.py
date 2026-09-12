"""
Unit tests for statistical calculations (mean, variance, std dev, covariance, correlation).
Uses small deterministic datasets with known exact analytical solutions.
"""
import pytest
import numpy as np
import pandas as pd
from src.statistics.descriptive import calculate_descriptive_stats
from src.statistics.covariance import calculate_sample_covariance
from src.statistics.correlation import calculate_pearson_correlation


def test_descriptive_stats():
    # Dataset: [2, 4, 4, 4, 5, 5, 7, 9]
    # Sum = 40, N = 8, Mean = 5.0
    # Median = 4.5, Min = 2, Max = 9
    # Sample Variance (ddof=1) = ( (9+1+1+1+0+0+4+16) ) / 7 = 32 / 7 = 4.57142857...
    # Sample Std Dev = sqrt(32/7) = 2.1380899...
    data = [2, 4, 4, 4, 5, 5, 7, 9]
    stats = calculate_descriptive_stats(data)

    assert stats.n == 8
    assert stats.mean == pytest.approx(5.0, abs=1e-6)
    assert stats.median == pytest.approx(4.5, abs=1e-6)
    assert stats.min_val == 2.0
    assert stats.max_val == 9.0
    assert stats.variance == pytest.approx(32.0 / 7.0, abs=1e-6)
    assert stats.std_dev == pytest.approx(np.sqrt(32.0 / 7.0), abs=1e-6)


def test_sample_covariance():
    # X = [1, 2, 3, 4, 5], mean(X) = 3
    # Y = [2, 4, 5, 4, 5], mean(Y) = 4
    # (X-3) = [-2, -1, 0, 1, 2]
    # (Y-4) = [-2,  0, 1, 0, 1]
    # Product = [4, 0, 0, 0, 2], Sum = 6
    # Cov(X,Y) = 6 / (5-1) = 1.5
    x = [1, 2, 3, 4, 5]
    y = [2, 4, 5, 4, 5]
    cov_res = calculate_sample_covariance(x, y)

    assert cov_res.n == 5
    assert cov_res.mean_x == 3.0
    assert cov_res.mean_y == 4.0
    assert cov_res.covariance == pytest.approx(1.5, abs=1e-6)


def test_pearson_correlation():
    # Perfect positive linear relationship Y = 2X + 3
    x = np.array([1, 2, 3, 4, 5])
    y = 2 * x + 3
    corr_res = calculate_pearson_correlation(x, y)

    assert corr_res.r == pytest.approx(1.0, abs=1e-6)
    assert corr_res.r_squared == pytest.approx(1.0, abs=1e-6)
    assert corr_res.strength == "strong"
    assert corr_res.direction == "positive"


def test_perfect_negative_correlation():
    x = np.array([1, 2, 3, 4, 5])
    y = -3 * x + 10
    corr_res = calculate_pearson_correlation(x, y)

    assert corr_res.r == pytest.approx(-1.0, abs=1e-6)
    assert corr_res.r_squared == pytest.approx(1.0, abs=1e-6)
    assert corr_res.direction == "negative"
