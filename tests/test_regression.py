"""
Unit tests for Linear and Second-Degree Polynomial Regression models.
Uses synthetic deterministic datasets with known parameters.
"""
import pytest
import numpy as np
from src.regression.linear import fit_linear_regression
from src.regression.quadratic import fit_quadratic_regression
from src.regression.evaluation import evaluate_model, compare_models


def test_linear_regression_exact_fit():
    # y = 3x + 10
    x = np.array([0, 1, 2, 3, 4, 5], dtype=float)
    y = 3.0 * x + 10.0

    res = fit_linear_regression(x, y)

    assert res.slope == pytest.approx(3.0, abs=1e-6)
    assert res.intercept == pytest.approx(10.0, abs=1e-6)
    assert res.r_squared == pytest.approx(1.0, abs=1e-6)
    assert np.allclose(res.residuals, 0.0, atol=1e-6)


def test_linear_regression_noisy():
    # Known dataset
    x = np.array([1, 2, 3, 4, 5], dtype=float)
    y = np.array([2, 3, 5, 4, 6], dtype=float)
    
    # x_mean = 3, y_mean = 4
    # ss_xx = 10, ss_xy = 9
    # b = 9/10 = 0.9, a = 4 - 0.9*3 = 1.3
    res = fit_linear_regression(x, y)

    assert res.slope == pytest.approx(0.9, abs=1e-6)
    assert res.intercept == pytest.approx(1.3, abs=1e-6)
    assert 0 < res.r_squared < 1.0


def test_quadratic_regression_exact_fit():
    # y = 2x² - 5x + 7
    x = np.array([0, 1, 2, 3, 4, 5], dtype=float)
    y = 2.0 * (x ** 2) - 5.0 * x + 7.0

    res = fit_quadratic_regression(x, y)

    assert res.a == pytest.approx(7.0, abs=1e-5)
    assert res.b == pytest.approx(-5.0, abs=1e-5)
    assert res.c == pytest.approx(2.0, abs=1e-5)
    assert res.r_squared == pytest.approx(1.0, abs=1e-6)
    assert np.allclose(res.residuals, 0.0, atol=1e-5)


def test_model_comparison():
    x = np.array([0, 1, 2, 3, 4, 5], dtype=float)
    y = 2.0 * (x ** 2) - 5.0 * x + 7.0

    lin_res = fit_linear_regression(x, y)
    quad_res = fit_quadratic_regression(x, y)

    df_comp, summary = compare_models(lin_res, quad_res, y)

    assert len(df_comp) == 2
    # Quadratic R² must be higher than Linear R² for non-linear data
    assert quad_res.r_squared > lin_res.r_squared
