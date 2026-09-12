"""
Interactive Plotly visualizations for NIFTY 50 trend analysis, regression models, residuals, market data, and period comparisons.
Designed with academic rigor, minimal aesthetics, and clean typography.
"""
from typing import List
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from src.analysis.period_analysis import PeriodAnalysisResult


# Academic & Quantitative Palette (Muted, professional, accessible)
COLOR_PRICE = "#1e3a8a"      # Deep Navy Blue
COLOR_LINEAR = "#ea580c"     # Muted Terracotta / Orange
COLOR_QUADRATIC = "#059669"  # Deep Forest Emerald
COLOR_RESIDUAL = "#dc2626"   # Crimson
COLOR_GRID = "#f1f5f9"
COLOR_BAR = "#94a3b8"        # Slate
COLOR_SMA20 = "#d97706"      # Amber
COLOR_SMA50 = "#7c3aed"      # Purple
COLOR_SMA200 = "#0284c7"     # Sky Blue


def plot_price_history(df_period: pd.DataFrame, period_name: str) -> go.Figure:
    """
    NIFTY 50 Closing Price History Chart.
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
        margin=dict(l=45, r=30, t=50, b=40),
        yaxis=dict(tickprefix="₹", tickformat=",.0f")
    )
    return fig


def plot_interactive_trend_lines(
    period_res: PeriodAnalysisResult,
    show_price: bool = True,
    show_linear: bool = True,
    show_quadratic: bool = False
) -> go.Figure:
    """
    Primary Overview Chart with customizable toggles for Actual Price, Linear Fit, and Quadratic Fit.
    """
    df = period_res.df_period
    fig = go.Figure()

    if show_price:
        fig.add_trace(go.Scatter(
            x=df['Date'],
            y=df['Close'],
            mode='lines',
            name='Actual Close Price',
            line=dict(color=COLOR_PRICE, width=2.0)
        ))

    if show_linear:
        fig.add_trace(go.Scatter(
            x=df['Date'],
            y=period_res.linear_reg.predictions,
            mode='lines',
            name=f"Linear Fit (R² = {period_res.linear_reg.r_squared:.4f})",
            line=dict(color=COLOR_LINEAR, width=2.2, dash='dash')
        ))

    if show_quadratic:
        fig.add_trace(go.Scatter(
            x=df['Date'],
            y=period_res.quadratic_reg.predictions,
            mode='lines',
            name=f"Quadratic Curve (R² = {period_res.quadratic_reg.r_squared:.4f})",
            line=dict(color=COLOR_QUADRATIC, width=2.2)
        ))

    fig.update_layout(
        title=f"NIFTY 50 Trend & Regression Analysis ({period_res.period_name})",
        xaxis_title="Date",
        yaxis_title="Price (₹)",
        template="plotly_white",
        hovermode="x unified",
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="left",
            x=0.01,
            bgcolor="rgba(255, 255, 255, 0.9)",
            bordercolor="#e2e8f0",
            borderwidth=1
        ),
        margin=dict(l=45, r=30, t=60, b=40),
        yaxis=dict(tickprefix="₹", tickformat=",.0f")
    )
    return fig


def plot_linear_fit(period_res: PeriodAnalysisResult) -> go.Figure:
    """
    Closing Price + Linear Regression Fit.
    """
    return plot_interactive_trend_lines(period_res, show_price=True, show_linear=True, show_quadratic=False)


def plot_quadratic_fit(period_res: PeriodAnalysisResult) -> go.Figure:
    """
    Closing Price + Quadratic Regression Fit.
    """
    return plot_interactive_trend_lines(period_res, show_price=True, show_linear=False, show_quadratic=True)


def plot_model_comparison(period_res: PeriodAnalysisResult) -> go.Figure:
    """
    Linear vs Quadratic Model Overlay Comparison Chart.
    """
    return plot_interactive_trend_lines(period_res, show_price=True, show_linear=True, show_quadratic=True)


def plot_residuals(period_res: PeriodAnalysisResult, model_type: str = "linear") -> go.Figure:
    """
    Residual Plot: Residuals vs Time and Residual Distribution Histogram.
    """
    df = period_res.df_period
    if model_type.lower() == "linear":
        residuals = period_res.linear_reg.residuals
        title_str = f"Linear Regression Residuals (e = y - ŷ) — {period_res.period_name}"
        color = COLOR_LINEAR
    else:
        residuals = period_res.quadratic_reg.residuals
        title_str = f"Quadratic Regression Residuals (e = y - ŷ) — {period_res.period_name}"
        color = COLOR_QUADRATIC

    fig = make_subplots(
        rows=1, cols=2,
        column_widths=[0.72, 0.28],
        subplot_titles=(title_str, "Residual Frequency Distribution"),
        horizontal_spacing=0.08
    )

    # Residuals over time
    fig.add_trace(
        go.Scatter(
            x=df['Date'],
            y=residuals,
            mode='lines',
            name='Residual (₹)',
            line=dict(color=color, width=1.2)
        ),
        row=1, col=1
    )

    # Zero baseline
    fig.add_shape(
        type="line",
        x0=df['Date'].min(), y0=0,
        x1=df['Date'].max(), y1=0,
        line=dict(color="#334155", width=1.5, dash="dot"),
        row=1, col=1
    )

    # Histogram
    fig.add_trace(
        go.Histogram(
            y=residuals,
            name='Count',
            marker=dict(color=color, opacity=0.75),
            orientation='h',
            nbinsy=35
        ),
        row=1, col=2
    )

    fig.update_layout(
        template="plotly_white",
        showlegend=False,
        margin=dict(l=45, r=30, t=50, b=40)
    )
    fig.update_xaxes(title_text="Date", row=1, col=1)
    fig.update_yaxes(title_text="Residual (₹)", row=1, col=1, tickprefix="₹", tickformat=",.0f")
    fig.update_xaxes(title_text="Frequency", row=1, col=2)

    return fig


def plot_period_horizon_comparison(df_comp_all: pd.DataFrame) -> go.Figure:
    """
    Visual comparison across 1Y, 3Y, 5Y, and 10Y horizons.
    """
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=(
            "Linear Slope b (₹/trading day)",
            "Price Volatility (Sample Std Dev s)",
            "Goodness of Fit (R² comparison)",
            "Sample Mean Closing Price (x̄)"
        ),
        vertical_spacing=0.18,
        horizontal_spacing=0.12
    )

    horizons = df_comp_all['Period Horizon'].tolist()
    slopes = [float(x) for x in df_comp_all['Linear Slope b (₹/day)']]
    std_devs = [float(x.replace(",", "")) for x in df_comp_all['Std Dev (₹)']]
    lin_r2 = [float(x) for x in df_comp_all['Linear R²']]
    quad_r2 = [float(x) for x in df_comp_all['Quadratic R²']]
    means = [float(x.replace(",", "")) for x in df_comp_all['Mean Price (₹)']]

    # 1. Slope b
    fig.add_trace(
        go.Bar(x=horizons, y=slopes, name='Slope b (₹/day)', marker_color=COLOR_PRICE),
        row=1, col=1
    )

    # 2. Std Dev s
    fig.add_trace(
        go.Bar(x=horizons, y=std_devs, name='Std Dev (₹)', marker_color=COLOR_BAR),
        row=1, col=2
    )

    # 3. R² comparison
    fig.add_trace(
        go.Bar(x=horizons, y=lin_r2, name='Linear R²', marker_color=COLOR_LINEAR),
        row=2, col=1
    )
    fig.add_trace(
        go.Bar(x=horizons, y=quad_r2, name='Quadratic R²', marker_color=COLOR_QUADRATIC),
        row=2, col=1
    )

    # 4. Mean Price
    fig.add_trace(
        go.Bar(x=horizons, y=means, name='Mean Price (₹)', marker_color="#3b82f6"),
        row=2, col=2
    )

    fig.update_layout(
        template="plotly_white",
        barmode='group',
        margin=dict(l=45, r=30, t=50, b=40),
        showlegend=True,
        legend=dict(orientation="h", yanchor="bottom", y=1.03, xanchor="center", x=0.5)
    )
    fig.update_yaxes(title_text="₹ / day", row=1, col=1)
    fig.update_yaxes(title_text="₹", row=1, col=2, tickprefix="₹", tickformat=",.0f")
    fig.update_yaxes(title_text="R²", row=2, col=1, range=[0, 1.05])
    fig.update_yaxes(title_text="₹", row=2, col=2, tickprefix="₹", tickformat=",.0f")

    return fig


def plot_ohlc_candlestick(df_period: pd.DataFrame, period_name: str) -> go.Figure:
    """
    OHLC Candlestick chart for Market Data view.
    """
    fig = go.Figure()
    fig.add_trace(go.Candlestick(
        x=df_period['Date'],
        open=df_period['Open'],
        high=df_period['High'],
        low=df_period['Low'],
        close=df_period['Close'],
        name='NIFTY 50 OHLC',
        increasing_line_color='#10b981',  # emerald
        decreasing_line_color='#ef4444'   # red
    ))
    fig.update_layout(
        title=f"NIFTY 50 Daily OHLC Candlestick ({period_name})",
        xaxis_title="Date",
        yaxis_title="Index Price (₹)",
        template="plotly_white",
        xaxis_rangeslider_visible=False,
        margin=dict(l=45, r=30, t=50, b=40),
        yaxis=dict(tickprefix="₹", tickformat=",.0f")
    )
    return fig


def plot_price_and_volume(df_period: pd.DataFrame, period_name: str) -> go.Figure:
    """
    Combined Price and Daily Trading Volume chart.
    """
    fig = make_subplots(
        rows=2, cols=1,
        shared_xaxes=True,
        vertical_spacing=0.06,
        row_heights=[0.75, 0.25],
        subplot_titles=(f"NIFTY 50 Closing Price ({period_name})", "Daily Index Volume")
    )

    # Top: Price
    fig.add_trace(
        go.Scatter(
            x=df_period['Date'],
            y=df_period['Close'],
            mode='lines',
            name='Closing Price',
            line=dict(color=COLOR_PRICE, width=2)
        ),
        row=1, col=1
    )

    # Bottom: Volume
    has_volume = 'Volume' in df_period.columns and (df_period['Volume'] > 0).any()
    if has_volume:
        fig.add_trace(
            go.Bar(
                x=df_period['Date'],
                y=df_period['Volume'],
                name='Volume',
                marker_color=COLOR_BAR,
                opacity=0.8
            ),
            row=2, col=1
        )
        fig.update_yaxes(title_text="Volume", row=2, col=1)
    else:
        fig.add_annotation(
            text="Volume data not available for this index feed",
            xref="x2", yref="y2", showarrow=False,
            row=2, col=1
        )

    fig.update_layout(
        template="plotly_white",
        showlegend=False,
        hovermode="x unified",
        margin=dict(l=45, r=30, t=50, b=40)
    )
    fig.update_yaxes(title_text="Price (₹)", row=1, col=1, tickprefix="₹", tickformat=",.0f")
    fig.update_xaxes(title_text="Date", row=2, col=1)

    return fig


def plot_moving_averages(df_period: pd.DataFrame, period_name: str, ma_choices: List[int]) -> go.Figure:
    """
    Closing Price with toggled Simple Moving Averages (20, 50, 200 days).
    """
    df = df_period.copy().sort_values('Date').reset_index(drop=True)
    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=df['Date'],
        y=df['Close'],
        mode='lines',
        name='Actual Close',
        opacity=0.85,
        line=dict(color=COLOR_PRICE, width=1.5)
    ))

    colors = {20: COLOR_SMA20, 50: COLOR_SMA50, 200: COLOR_SMA200}

    for ma in ma_choices:
        df[f'SMA_{ma}'] = df['Close'].rolling(window=ma).mean()
        fig.add_trace(go.Scatter(
            x=df['Date'],
            y=df[f'SMA_{ma}'],
            mode='lines',
            name=f"{ma}-Day SMA",
            line=dict(color=colors.get(ma, "#64748b"), width=2)
        ))

    fig.update_layout(
        title=f"NIFTY 50 Moving Average Context ({period_name})",
        xaxis_title="Date",
        yaxis_title="Price (₹)",
        template="plotly_white",
        hovermode="x unified",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="left", x=0.01),
        margin=dict(l=45, r=30, t=50, b=40),
        yaxis=dict(tickprefix="₹", tickformat=",.0f")
    )
    return fig


def plot_daily_returns(df_period: pd.DataFrame, period_name: str) -> go.Figure:
    """
    Daily Percentage Returns: R_t = (P_t - P_{t-1}) / P_{t-1} * 100
    """
    df = df_period.copy().sort_values('Date').reset_index(drop=True)
    df['Daily_Return_Pct'] = df['Close'].pct_change() * 100.0

    colors = np.where(df['Daily_Return_Pct'] >= 0, '#10b981', '#ef4444')

    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=df['Date'],
        y=df['Daily_Return_Pct'],
        name='Daily Return (%)',
        marker_color=colors
    ))

    fig.update_layout(
        title=f"NIFTY 50 Daily Percentage Returns ({period_name})",
        xaxis_title="Date",
        yaxis_title="Daily Return (%)",
        template="plotly_white",
        hovermode="x unified",
        margin=dict(l=45, r=30, t=50, b=40)
    )
    fig.add_hline(y=0, line_dash="solid", line_color="#334155", line_width=1)
    return fig


def plot_rolling_volatility(df_period: pd.DataFrame, period_name: str, window: int = 20) -> go.Figure:
    """
    20-day Rolling Annualized Volatility: sigma_20 * sqrt(252) * 100%
    """
    df = df_period.copy().sort_values('Date').reset_index(drop=True)
    df['Daily_Return'] = df['Close'].pct_change()
    df['Rolling_Vol_Annualized'] = df['Daily_Return'].rolling(window=window).std() * np.sqrt(252) * 100.0

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=df['Date'],
        y=df['Rolling_Vol_Annualized'],
        mode='lines',
        name=f'{window}-Day Annualized Volatility',
        line=dict(color='#8b5cf6', width=2)
    ))

    mean_vol = df['Rolling_Vol_Annualized'].mean()
    if not np.isnan(mean_vol):
        fig.add_hline(
            y=mean_vol,
            line_dash="dash",
            line_color="#64748b",
            annotation_text=f"Mean: {mean_vol:.2f}%",
            annotation_position="top left"
        )

    fig.update_layout(
        title=f"NIFTY 50 {window}-Day Rolling Annualized Volatility ({period_name})",
        xaxis_title="Date",
        yaxis_title="Annualized Volatility (%)",
        template="plotly_white",
        hovermode="x unified",
        margin=dict(l=45, r=30, t=50, b=40)
    )
    return fig
