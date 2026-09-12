"""
Model Evaluation and Comparison module.
Calculates RMSE, MAE, R², residual statistics, and model comparison metrics.
"""
from dataclasses import dataclass
from typing import Tuple
import numpy as np
import pandas as pd
from src.regression.linear import LinearRegressionResult
from src.regression.quadratic import PolynomialRegressionResult


@dataclass
class ModelMetrics:
    """
    Error metrics and goodness-of-fit evaluation container.
    """
    model_name: str
    r_squared: float
    rmse: float
    mae: float
    mean_residual: float
    std_residual: float
    max_positive_residual: float
    max_negative_residual: float
    interpretation: str


def evaluate_model(model_name: str, y_true: np.ndarray, y_pred: np.ndarray, r_squared: float) -> ModelMetrics:
    """
    Evaluates regression model goodness-of-fit and residual behavior.
    """
    y_true_arr = np.asarray(y_true, dtype=float)
    y_pred_arr = np.asarray(y_pred, dtype=float)
    residuals = y_true_arr - y_pred_arr

    n = len(y_true_arr)
    rmse = float(np.sqrt(np.mean(residuals ** 2)))
    mae = float(np.mean(np.abs(residuals)))
    mean_res = float(np.mean(residuals))
    std_res = float(np.std(residuals, ddof=1)) if n > 1 else 0.0
    max_pos = float(np.max(residuals))
    max_neg = float(np.min(residuals))

    interp = (
        f"{model_name} achieves an R² of {r_squared:.4f} (explaining {r_squared * 100:.2f}% of historical price variance) "
        f"with a Root Mean Squared Error (RMSE) of ₹{rmse:,.2f}."
    )

    return ModelMetrics(
        model_name=model_name,
        r_squared=r_squared,
        rmse=rmse,
        mae=mae,
        mean_residual=mean_res,
        std_residual=std_res,
        max_positive_residual=max_pos,
        max_negative_residual=max_neg,
        interpretation=interp
    )


def compare_models(
    linear_res: LinearRegressionResult,
    quad_res: PolynomialRegressionResult,
    y_true: np.ndarray
) -> Tuple[pd.DataFrame, str]:
    """
    Builds model comparison summary table and academic commentary.
    """
    lin_eval = evaluate_model("Linear Regression", y_true, linear_res.predictions, linear_res.r_squared)
    quad_eval = evaluate_model("Quadratic Regression", y_true, quad_res.predictions, quad_res.r_squared)

    df_comp = pd.DataFrame([
        {
            "Model": lin_eval.model_name,
            "R²": f"{lin_eval.r_squared:.4f}",
            "RMSE (₹)": f"{lin_eval.rmse:,.2f}",
            "MAE (₹)": f"{lin_eval.mae:,.2f}",
            "Mean Residual (₹)": f"{lin_eval.mean_residual:,.2f}",
            "Std Residual (₹)": f"{lin_eval.std_residual:,.2f}",
            "Equation": linear_res.equation_str
        },
        {
            "Model": quad_eval.model_name,
            "R²": f"{quad_eval.r_squared:.4f}",
            "RMSE (₹)": f"{quad_eval.rmse:,.2f}",
            "MAE (₹)": f"{quad_eval.mae:,.2f}",
            "Mean Residual (₹)": f"{quad_eval.mean_residual:,.2f}",
            "Std Residual (₹)": f"{quad_eval.std_residual:,.2f}",
            "Equation": quad_res.equation_str
        }
    ])

    r2_diff = quad_eval.r_squared - lin_eval.r_squared
    
    if r2_diff > 0.02:
        comp_summary = (
            f"Quadratic Regression improves historical fit over Linear Regression (R² increased by {r2_diff:.4f} "
            f"from {lin_eval.r_squared:.4f} to {quad_eval.r_squared:.4f}, reducing RMSE by ₹{lin_eval.rmse - quad_eval.rmse:,.2f}). "
            f"This confirms curvature in the historical long-term market trajectory. "
            f"CRITICAL ACADEMIC NOTE: A higher historical R² reflects superior in-sample curve fitting, NOT guaranteed future forecasting capability."
        )
    else:
        comp_summary = (
            f"Quadratic Regression yields a marginal R² gain of {r2_diff:.4f} over Linear Regression. "
            f"Linear model remains a simpler, more parsimonious baseline for this historical period. "
            f"CRITICAL ACADEMIC NOTE: A higher historical R² reflects superior in-sample curve fitting, NOT guaranteed future forecasting capability."
        )

    return df_comp, comp_summary
