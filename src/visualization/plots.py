"""
Interactive Plotly visualizations for NIFTY 50 trend analysis, regression models, residuals, and period comparisons.
"""
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from src.analysis.period_analysis import PeriodAnalysisResult


COLOR_PRICE = "#1f77b4"      # Muted Blue
COLOR_LINEAR = "#ff7f0e"     # Safety Orange
COLOR_QUADRATIC = "#2ca02c"  # Emerald Green
COLOR_RESIDUAL = "#d62728"   # Brick Red
COLOR_GRID = "#e5e5e5"


def plot_price_history(df_period: pd.DataFrame, period_name: str) -> go.Figure:
    """
    1. NIFTY 50 Closing Price History Chart.
    """
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=df_period['Date'],
        y=df_period['Close'],
        mode='lines',
        name='NIFTY 50 Close',
        line=dict(color=COLOR_PRICE, width=2)
    ))
    fig.update_layout(
        title=f"NIFTY 50 Historical Closing Price ({period_name})",
        xaxis_title="Date",
        yaxis_title="Closing Price (₹)",
        template="plotly_white",
        hovermode="x unified",
        margin=dict(l=40, r=40, t=50, b=40)
    )
    return fig


def plot_linear_fit(period_res: PeriodAnalysisResult) -> go.Figure:
    """
    2. Closing Price + Linear Regression Fit.
    """
    df = period_res.df_period
    fig = go.Figure()

    # Actual price
    fig.add_trace(go.Scatter(
        x=df['Date'],
        y=df['Close'],
        mode='lines',
        name='Actual Close',
        line=dict(color=COLOR_PRICE, width=1.5)
    ))

    # Linear Fit
    fig.add_trace(go.Scatter(
        x=df['Date'],
        y=period_res.linear_reg.predictions,
        mode='lines',
        name=f"Linear Fit (R²={period_res.linear_reg.r_squared:.4f})",
        line=dict(color=COLOR_LINEAR, width=2.5, dash='dash')
    ))

    fig.update_layout(
        title=f"NIFTY 50 Price & Simple Linear Regression (y = a + bx) — {period_res.period_name}",
        xaxis_title="Date",
        yaxis_title="Closing Price (₹)",
        template="plotly_white",
        hovermode="x unified",
        legend=dict(x=0.01, y=0.99, bgcolor="rgba(255,255,255,0.8)"),
        margin=dict(l=40, r=40, t=50, b=40)
    )
    return fig


def plot_quadratic_fit(period_res: PeriodAnalysisResult) -> go.Figure:
    """
    3. Closing Price + Quadratic Regression Fit.
    """
    df = period_res.df_period
    fig = go.Figure()

    # Actual price
    fig.add_trace(go.Scatter(
        x=df['Date'],
        y=df['Close'],
        mode='lines',
        name='Actual Close',
        line=dict(color=COLOR_PRICE, width=1.5)
    ))

    # Quadratic Fit
    fig.add_trace(go.Scatter(
        x=df['Date'],
        y=period_res.quadratic_reg.predictions,
        mode='lines',
        name=f"Quadratic Fit (R²={period_res.quadratic_reg.r_squared:.4f})",
        line=dict(color=COLOR_QUADRATIC, width=2.5)
    ))

    fig.update_layout(
        title=f"NIFTY 50 Price & Second-Degree Polynomial Fit (y = a + bx + cx²) — {period_res.period_name}",
        xaxis_title="Date",
        yaxis_title="Closing Price (₹)",
        template="plotly_white",
        hovermode="x unified",
        legend=dict(x=0.01, y=0.99, bgcolor="rgba(255,255,255,0.8)"),
        margin=dict(l=40, r=40, t=50, b=40)
    )
    return fig


def plot_model_comparison(period_res: PeriodAnalysisResult) -> go.Figure:
    """
    4. Linear vs Quadratic Model Overlay Comparison Chart.
    """
    df = period_res.df_period
    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=df['Date'],
        y=df['Close'],
        mode='lines',
        name='Actual Close',
        line=dict(color=COLOR_PRICE, width=1.5, opacity=0.7)
    ))

    fig.add_trace(go.Scatter(
        x=df['Date'],
        y=period_res.linear_reg.predictions,
        mode='lines',
        name=f"Linear (R²={period_res.linear_reg.r_squared:.4f})",
        line=dict(color=COLOR_LINEAR, width=2.5, dash='dash')
    ))

    fig.add_trace(go.Scatter(
        x=df['Date'],
        y=period_res.quadratic_reg.predictions,
        mode='lines',
        name=f"Quadratic (R²={period_res.quadratic_reg.r_squared:.4f})",
        line=dict(color=COLOR_QUADRATIC, width=2.5)
    ))

    fig.update_layout(
        title=f"Model Comparison: Linear vs Second-Degree Polynomial — {period_res.period_name}",
        xaxis_title="Date",
        yaxis_title="Closing Price (₹)",
        template="plotly_white",
        hovermode="x unified",
        legend=dict(x=0.01, y=0.99, bgcolor="rgba(255,255,255,0.8)"),
        margin=dict(l=40, r=40, t=50, b=40)
    )
    return fig


def plot_residuals(period_res: PeriodAnalysisResult, model_type: str = "linear") -> go.Figure:
    """
    5 & 6. Residual Plot (Residuals vs Time + Residual Distribution Histogram).
    """
    df = period_res.df_period
    if model_type.lower() == "linear":
        residuals = period_res.linear_reg.residuals
        title_str = f"Linear Regression Residuals ({period_res.period_name})"
        color = COLOR_LINEAR
    else:
        residuals = period_res.quadratic_reg.residuals
        title_str = f"Quadratic Regression Residuals ({period_res.period_name})"
        color = COLOR_QUADRATIC

    fig = make_subplots(
        rows=1, cols=2,
        column_widths=[0.7, 0.3],
        subplot_titles=(title_str, "Residual Distribution")
    )

    # Residuals over time
    fig.add_trace(
        go.Scatter(
            x=df['Date'],
            y=residuals,
            mode='lines',
            name='Residual (y - ŷ)',
            line=dict(color=color, width=1)
        ),
        row=1, col=1
    )

    # Zero reference line
    fig.add_shape(
        type="line",
        x0=df['Date'].min(), y0=0,
        x1=df['Date'].max(), y1=0,
        line=dict(color="black", width=1.5, dash="dot"),
        row=1, col=1
    )

    # Histogram of residuals
    fig.add_trace(
        go.Histogram(
            y=residuals,
            name='Frequency',
            marker=dict(color=color, opacity=0.7),
            orientation='h'
        ),
        row=1, col=2
    )

    fig.update_layout(
        template="plotly_white",
        showlegend=False,
        margin=dict(l=40, r=40, t=50, b=40)
    )
    fig.update_xaxes(title_text="Date", row=1, col=1)
    fig.update_yaxes(title_text="Residual (₹)", row=1, col=1)
    fig.update_xaxes(title_text="Count", row=1, col=2)

    return fig


def plot_period_horizon_comparison(df_comp_all: pd.DataFrame) -> go.Figure:
    """
    7. Period Horizon Comparison (R² and Slope across 1Y, 3Y, 5Y, 10Y).
    """
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=("Goodness of Fit (R²) by Time Horizon", "Linear Slope b (₹/day) by Horizon")
    )

    horizons = df_comp_all['Period Horizon'].tolist()
    lin_r2 = [float(x) for x in df_comp_all['Linear R²']]
    quad_r2 = [float(x) for x in df_comp_all['Quadratic R²']]
    slopes = [float(x) for x in df_comp_all['Linear Slope b (₹/day)']]

    # Bar chart for R²
    fig.add_trace(
        go.Bar(x=horizons, y=lin_r2, name='Linear R²', marker_color=COLOR_LINEAR),
        row=1, col=1
    )
    fig.add_trace(
        go.Bar(x=horizons, y=quad_r2, name='Quadratic R²', marker_color=COLOR_QUADRATIC),
        row=1, col=1
    )

    # Bar chart for Slopes
    fig.add_trace(
        go.Bar(x=horizons, y=slopes, name='Linear Slope b (₹/day)', marker_color=COLOR_PRICE),
        row=1, col=2
    )

    fig.update_layout(
        template="plotly_white",
        barmode='group',
        margin=dict(l=40, r=40, t=50, b=40),
        legend=dict(x=0.01, y=0.99, bgcolor="rgba(255,255,255,0.8)")
    )
    fig.update_yaxes(title_text="R² Coefficient", row=1, col=1, range=[0, 1.05])
    fig.update_yaxes(title_text="Slope b (₹/trading day)", row=1, col=2)

    return fig
