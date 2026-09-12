"""
NIFTY 50 Statistical Trend Analyzer — Professional Quantitative Research Dashboard.
Provides interactive statistical modeling, regression analysis, residual diagnostics, multi-horizon comparisons,
market data exploration, and syllabus objective demonstration.
"""
import datetime
from typing import Optional
import numpy as np
import pandas as pd
import streamlit as st

from src.data.preprocessing import DataPipeline
from src.analysis.period_analysis import analyze_period, compare_all_periods
from src.analysis.trend import classify_trend
from src.visualization.plots import (
    plot_price_history,
    plot_interactive_trend_lines,
    plot_linear_fit,
    plot_quadratic_fit,
    plot_model_comparison,
    plot_residuals,
    plot_period_horizon_comparison,
    plot_ohlc_candlestick,
    plot_price_and_volume,
    plot_moving_averages,
    plot_daily_returns,
    plot_rolling_volatility
)

# ---------------------------------------------------------
# Page Setup & Professional Research Styling
# ---------------------------------------------------------
st.set_page_config(
    page_title="NIFTY 50 Statistical Trend Analyzer",
    page_icon="📐",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for academic, minimal, publication-quality aesthetic
st.markdown("""
<style>
    /* Global Typography & Layout */
    .block-container {
        padding-top: 1.5rem;
        padding-bottom: 2.5rem;
        max-width: 1400px;
    }
    h1, h2, h3, h4 {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        color: #0f172a;
        letter-spacing: -0.015em;
    }
    
    /* Header Container */
    .dash-header {
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
    }
    .dash-title {
        font-size: 2rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 0.2rem;
        line-height: 1.2;
    }
    .dash-subtitle {
        font-size: 1.05rem;
        color: #475569;
        margin-bottom: 0.8rem;
    }
    .meta-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        font-size: 0.85rem;
        color: #64748b;
        background-color: #f8fafc;
        padding: 0.5rem 0.85rem;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
    }
    .meta-item strong {
        color: #334155;
    }

    /* KPI Summary Cards */
    .kpi-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.75rem;
        margin-bottom: 1rem;
    }
    .kpi-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 0.75rem 1rem;
        text-align: left;
    }
    .kpi-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 0.25rem;
    }
    .kpi-value {
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
    }

    /* Trend Classification Badges */
    .trend-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.4rem 0.85rem;
        border-radius: 6px;
        font-size: 0.95rem;
        font-weight: 600;
        letter-spacing: 0.02em;
    }
    .trend-up {
        background-color: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
    }
    .trend-down {
        background-color: #fef2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
    }
    .trend-flat {
        background-color: #f8fafc;
        color: #334155;
        border: 1px solid #cbd5e1;
    }

    /* Mathematical Equation Box */
    .math-card {
        background-color: #f8fafc;
        border-left: 4px solid #1e3a8a;
        padding: 0.9rem 1.2rem;
        border-radius: 0 6px 6px 0;
        border-top: 1px solid #e2e8f0;
        border-right: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 1rem;
    }
    .math-eq {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 1.05rem;
        font-weight: 700;
        color: #1e3a8a;
        margin-bottom: 0.3rem;
    }
    .math-caption {
        font-size: 0.85rem;
        color: #475569;
    }

    /* Table styling */
    .dataframe {
        font-size: 0.9rem !important;
    }
</style>
""", unsafe_allow_dict=True)


# ---------------------------------------------------------
# Cached Data Loader
# ---------------------------------------------------------
@st.cache_data(ttl=3600, show_spinner=False)
def get_pipeline_data(force_refresh: bool = False):
    pipeline = DataPipeline()
    return pipeline.fetch_and_process(force_refresh=force_refresh)


@st.cache_data(ttl=3600, show_spinner=False)
def get_cached_period_analysis(period_name: str, start_str: Optional[str] = None, end_str: Optional[str] = None):
    df_master, _ = get_pipeline_data(force_refresh=False)
    start_d = datetime.date.fromisoformat(start_str) if start_str else None
    end_d = datetime.date.fromisoformat(end_str) if end_str else None
    return analyze_period(df_master, period_name=period_name, start_date=start_d, end_date=end_d)


@st.cache_data(ttl=3600, show_spinner=False)
def get_cached_horizon_comparison():
    df_master, _ = get_pipeline_data(force_refresh=False)
    return compare_all_periods(df_master)


# ---------------------------------------------------------
# Main Application
# ---------------------------------------------------------
def main():
    # Load dataset
    try:
        df_master, report = get_pipeline_data(force_refresh=False)
    except Exception as e:
        st.error(f"Error loading master dataset: {str(e)}")
        st.info("Check internet connectivity or click 'Refresh Market Data' below.")
        return

    # ---------------------------------------------------------
    # Header & Meta Bar
    # ---------------------------------------------------------
    st.markdown("""
    <div class="dash-header">
        <div class="dash-title">NIFTY 50 Statistical Trend Analyzer</div>
        <div class="dash-subtitle">Statistical modelling of historical NIFTY 50 market trends using regression techniques</div>
    </div>
    """, unsafe_allow_dict=True)

    c_meta1, c_meta2, c_meta3, c_meta4, c_meta5 = st.columns(5)
    with c_meta1:
        st.caption("DATA SOURCE")
        st.markdown("**Yahoo Finance / `yfinance`**")
    with c_meta2:
        st.caption("INSTRUMENT")
        st.markdown("**NIFTY 50 (`^NSEI`)**")
    with c_meta3:
        st.caption("DATA SPAN")
        st.markdown(f"**{report.earliest_date} to {report.latest_date}**")
    with c_meta4:
        st.caption("OBSERVATIONS")
        st.markdown(f"**{report.total_observations:,} trading days**")
    with c_meta5:
        st.caption("DATA STATUS")
        st.markdown(f"**{report.validation_message}**")

    st.markdown("<div style='height: 12px;'></div>", unsafe_allow_dict=True)

    # ---------------------------------------------------------
    # Sidebar Controls & Global Horizon Filter
    # ---------------------------------------------------------
    with st.sidebar:
        st.subheader("⚙️ Global Horizon Controls")
        
        period_choice = st.radio(
            "Analysis Period Horizon:",
            options=["1 Year", "3 Years", "5 Years", "10 Years", "Custom Period"],
            index=3,
            help="Filters historical dataset and recalculates all statistical models dynamically."
        )

        start_date_val, end_date_val = None, None
        if period_choice == "Custom Period":
            st.markdown("---")
            st.caption("Select Custom Date Range:")
            min_d = df_master['Date'].min().date()
            max_d = df_master['Date'].max().date()
            col_d1, col_d2 = st.columns(2)
            with col_d1:
                start_date_val = st.date_input("Start", value=min_d, min_value=min_d, max_value=max_d)
            with col_d2:
                end_date_val = st.date_input("End", value=max_d, min_value=min_d, max_value=max_d)

        st.markdown("---")
        st.subheader("🔄 Data Management")
        if st.button("Refresh Market Data", use_container_width=True):
            with st.spinner("Fetching latest NIFTY 50 data..."):
                st.cache_data.clear()
                df_master, report = get_pipeline_data(force_refresh=True)
                st.success("Cached dataset updated successfully!")

        st.markdown("---")
        st.subheader("📖 Academic Context")
        st.markdown("""
        **Module:** *Statistical Techniques*  
        **Objective:** *Model stock price trends using regression.*
        
        **Methodological Principles:**
        - Strict in-sample statistical modeling.
        - Closed-form least-squares & matrix normal equations.
        - Academic distinction between goodness of historical fit and future forecasting.
        """)
        st.caption("⚠️ Historical trend analysis only. Not financial advice.")

    # ---------------------------------------------------------
    # Compute Analysis for Selected Period
    # ---------------------------------------------------------
    s_str = start_date_val.isoformat() if start_date_val else None
    e_str = end_date_val.isoformat() if end_date_val else None
    p_name = "Custom" if period_choice == "Custom Period" else period_choice

    try:
        analysis_res = get_cached_period_analysis(p_name, s_str, e_str)
    except Exception as err:
        st.error(f"Error calculating statistical models for {period_choice}: {str(err)}")
        return

    desc = analysis_res.descriptive_stats
    lin = analysis_res.linear_reg
    quad = analysis_res.quadratic_reg
    trend = classify_trend(lin.slope, desc.mean, desc.n)
    latest_close = float(analysis_res.df_period['Close'].iloc[-1])

    # ---------------------------------------------------------
    # Primary Navigation Tabs
    # ---------------------------------------------------------
    tabs = st.tabs([
        "📈 Overview",
        "📊 Statistical Analysis",
        "📐 Regression Analysis",
        "⚖️ Model Comparison",
        "🔍 Residual Analysis",
        "🌐 Time Horizon Comparison",
        "🕯️ Market Data & Technical View",
        "🎓 Syllabus Objectives"
    ])

    # =========================================================
    # TAB 1: DASHBOARD OVERVIEW
    # =========================================================
    with tabs[0]:
        st.markdown("#### Historical Period Performance & Primary Model Fit")

        # Compact Metric Row
        k1, k2, k3, k4, k5, k6 = st.columns(6)
        with k1:
            st.metric("Latest Close", f"₹{latest_close:,.2f}")
        with k2:
            st.metric("Mean Price (x̄)", f"₹{desc.mean:,.2f}")
        with k3:
            st.metric("Sample Std Dev (s)", f"₹{desc.std_dev:,.2f}")
        with k4:
            st.metric("Period Minimum", f"₹{desc.min_val:,.2f}")
        with k5:
            st.metric("Period Maximum", f"₹{desc.max_val:,.2f}")
        with k6:
            st.metric("Observations (N)", f"{desc.n:,}")

        # Trend Status Banner
        trend_class = "trend-up" if "Upward" in trend.trend_label else "trend-down" if "Downward" in trend.trend_label else "trend-flat"
        st.markdown(f"""
        <div style="margin: 0.8rem 0 1.2rem 0; padding: 0.75rem 1rem; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.8rem;">
            <div>
                <span style="font-size: 0.85rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Historical Trend Classification:</span>
                <span class="trend-badge {trend_class}" style="margin-left: 0.5rem;">{trend.trend_label.upper()}</span>
            </div>
            <div style="font-size: 0.85rem; color: #475569;">
                Linear Slope: <strong>₹{lin.slope:.4f} / trading day</strong> | Normalized Rate: <strong>{trend.normalized_slope_pct:.4f}% / day</strong> (~{trend.annualized_growth:,.0f} ₹/year)
            </div>
        </div>
        """, unsafe_allow_dict=True)

        # Primary Interactive Price & Trend Chart with Toggles
        col_ctrl1, col_ctrl2, col_ctrl3 = st.columns([1, 1, 3])
        with col_ctrl1:
            show_act = st.checkbox("Show Actual Price", value=True)
            show_lin = st.checkbox("Show Linear Regression (y = a + bx)", value=True)
        with col_ctrl2:
            show_quad = st.checkbox("Show Quadratic Regression (y = a + bx + cx²)", value=False)

        # Render Primary Chart
        fig_overview = plot_interactive_trend_lines(
            period_res=analysis_res,
            show_price=show_act,
            show_linear=show_lin,
            show_quadratic=show_quad
        )
        st.plotly_chart(fig_overview, use_container_width=True)

        # Dynamic Fitted Equation Summary Cards
        eq_col1, eq_col2 = st.columns(2)
        with eq_col1:
            st.markdown(f"""
            <div class="math-card">
                <div style="font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Linear Regression Model</div>
                <div class="math-eq">{lin.equation_str}</div>
                <div class="math-caption">Coefficient of Determination <strong>R² = {lin.r_squared:.4f}</strong> (explains {lin.r_squared*100:.2f}% of price variance) | RMSE = <strong>₹{analysis_res.linear_metrics.rmse:,.2f}</strong></div>
            </div>
            """, unsafe_allow_dict=True)
        with eq_col2:
            st.markdown(f"""
            <div class="math-card" style="border-left-color: #059669;">
                <div style="font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Second-Degree Polynomial Model</div>
                <div class="math-eq" style="color: #059669;">{quad.equation_str}</div>
                <div class="math-caption">Coefficient of Determination <strong>R² = {quad.r_squared:.4f}</strong> (explains {quad.r_squared*100:.2f}% of price variance) | RMSE = <strong>₹{analysis_res.quadratic_metrics.rmse:,.2f}</strong></div>
            </div>
            """, unsafe_allow_dict=True)

    # =========================================================
    # TAB 2: STATISTICAL ANALYSIS
    # =========================================================
    with tabs[1]:
        st.markdown("### Formal Statistical Analysis (Syllabus Core)")
        st.caption("Implementation of descriptive metrics, sample covariance, and Pearson correlation coefficient.")

        sec_col1, sec_col2 = st.columns(2)

        # SECTION A: DESCRIPTIVE STATISTICS
        with sec_col1:
            st.markdown("#### Section A — Descriptive Statistics")
            st.markdown("Calculates fundamental sample parameters describing central tendency and dispersion.")

            st.latex(r"\bar{x} = \frac{\sum_{i=1}^n x_i}{n}, \quad s^2 = \frac{\sum_{i=1}^n (x_i - \bar{x})^2}{n - 1}, \quad s = \sqrt{s^2}")

            df_stats_table = pd.DataFrame([
                {"Statistical Metric": "Observations (N)", "Value": f"{desc.n:,}", "Academic Interpretation": "Total valid daily trading sessions"},
                {"Statistical Metric": "Sample Mean (x̄)", "Value": f"₹{desc.mean:,.2f}", "Academic Interpretation": "Expected central value across the period"},
                {"Statistical Metric": "Sample Median", "Value": f"₹{desc.median:,.2f}", "Academic Interpretation": "50th percentile (unaffected by extreme outliers)"},
                {"Statistical Metric": "Minimum Price", "Value": f"₹{desc.min_val:,.2f}", "Academic Interpretation": "Lowest observed closing value"},
                {"Statistical Metric": "Maximum Price", "Value": f"₹{desc.max_val:,.2f}", "Academic Interpretation": "Highest observed closing value"},
                {"Statistical Metric": "Sample Variance (s²)", "Value": f"{desc.variance:,.2f}", "Academic Interpretation": "Average squared deviation from the sample mean"},
                {"Statistical Metric": "Sample Std Dev (s)", "Value": f"₹{desc.std_dev:,.2f}", "Academic Interpretation": "Measures price dispersion in actual currency units (₹)"},
            ])
            st.table(df_stats_table)

        # SECTION B & C: COVARIANCE & CORRELATION
        with sec_col2:
            st.markdown("#### Section B — Covariance")
            st.markdown("Measures joint variability between time index $X$ ($x_i = 0, 1, \dots, n-1$) and closing price $Y$.")
            
            st.latex(r"\text{Cov}(X, Y) = \frac{\sum_{i=1}^n (x_i - \bar{x})(y_i - \bar{y})}{n - 1}")
            
            cov = analysis_res.covariance_res
            st.write(f"**Sample Covariance $\\text{Cov}(X, Y)$:** `{cov.covariance:,.4f}`")
            st.info(cov.interpretation)

            st.markdown("---")
            st.markdown("#### Section C — Pearson Correlation Coefficient")
            st.markdown("Standardized bivariate linear correlation bounded between $-1.0$ and $+1.0$.")

            st.latex(r"r = \frac{\text{Cov}(X, Y)}{s_X s_Y} = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}}")

            corr = analysis_res.correlation_res
            st.write(f"**Pearson Correlation ($r$):** `{corr.r:.4f}`")
            st.write(f"**Coefficient of Determination ($r^2$):** `{corr.r_squared:.4f}`")
            
            # Visual indicator scale
            r_pct = int(((corr.r + 1.0) / 2.0) * 100)
            st.progress(r_pct, text=f"Linear Correlation Scale: r = {corr.r:.4f} ({corr.strength.title()} {corr.direction.title()})")
            
            st.success(corr.interpretation)
            st.caption("⚠️ **Methodological Reminder:** Pearson correlation measures linear association over time and does NOT imply causal market dynamics.")

    # =========================================================
    # TAB 3: REGRESSION ANALYSIS
    # =========================================================
    with tabs[2]:
        st.markdown("### Regression Modeling Engine")
        st.caption("Closed-form Ordinary Least Squares (OLS) simple linear fit and matrix polynomial regression.")

        reg_tab1, reg_tab2 = st.tabs(["Linear Regression (y = a + bx)", "Second-Degree Curve Fit (y = a + bx + cx²)"])

        # SUBTAB 1: LINEAR REGRESSION
        with reg_tab1:
            st.latex(r"y = a + bx, \quad b = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2}, \quad a = \bar{y} - b\bar{x}")
            st.markdown(f'<div class="math-card"><div class="math-eq">{lin.equation_str}</div></div>', unsafe_allow_dict=True)

            lc1, lc2, lc3, lc4 = st.columns(4)
            with lc1:
                st.metric("Slope (b)", f"₹{lin.slope:.4f} / day")
            with lc2:
                st.metric("Intercept (a)", f"₹{lin.intercept:,.2f}")
            with lc3:
                st.metric("Goodness of Fit (R²)", f"{lin.r_squared:.4f}")
            with lc4:
                st.metric("RMSE", f"₹{analysis_res.linear_metrics.rmse:,.2f}")

            st.plotly_chart(plot_linear_fit(analysis_res), use_container_width=True)

        # SUBTAB 2: QUADRATIC REGRESSION
        with reg_tab2:
            st.latex(r"y = a + bx + cx^2, \quad \boldsymbol{\beta} = (X^T X)^{-1} X^T \mathbf{y}, \quad \text{where } X = [1, x, x^2]")
            st.markdown(f'<div class="math-card" style="border-left-color: #059669;"><div class="math-eq" style="color: #059669;">{quad.equation_str}</div></div>', unsafe_allow_dict=True)

            qc1, qc2, qc3, qc4, qc5 = st.columns(5)
            with qc1:
                st.metric("Constant (a)", f"₹{quad.a:,.2f}")
            with qc2:
                st.metric("Linear Coeff (b)", f"{quad.b:.4f}")
            with qc3:
                st.metric("Quadratic Coeff (c)", f"{quad.c:.6f}")
            with qc4:
                st.metric("Goodness of Fit (R²)", f"{quad.r_squared:.4f}")
            with qc5:
                st.metric("RMSE", f"₹{analysis_res.quadratic_metrics.rmse:,.2f}")

            st.plotly_chart(plot_quadratic_fit(analysis_res), use_container_width=True)

    # =========================================================
    # TAB 4: MODEL COMPARISON
    # =========================================================
    with tabs[3]:
        st.markdown("### Comparative Model Evaluation: Linear vs. Quadratic")
        st.markdown("""
        > **Academic Principle:**  
        > *Quadratic regression provides a better historical fit according to R², but higher historical fit does not necessarily imply superior future forecasting performance.*
        """)

        # Clean Comparison Table
        lin_m = analysis_res.linear_metrics
        quad_m = analysis_res.quadratic_metrics

        df_model_comp = pd.DataFrame([
            {
                "Evaluation Metric": "Goodness of Fit (R²)",
                "Linear Regression (y = a + bx)": f"{lin_m.r_squared:.4f}",
                "Quadratic Regression (y = a + bx + cx²)": f"{quad_m.r_squared:.4f}",
                "Difference / Impact": f"{quad_m.r_squared - lin_m.r_squared:+.4f} (Higher historical variance explained)"
            },
            {
                "Evaluation Metric": "Root Mean Squared Error (RMSE)",
                "Linear Regression (y = a + bx)": f"₹{lin_m.rmse:,.2f}",
                "Quadratic Regression (y = a + bx + cx²)": f"₹{quad_m.rmse:,.2f}",
                "Difference / Impact": f"₹{lin_m.rmse - quad_m.rmse:,.2f} lower error in quadratic fit"
            },
            {
                "Evaluation Metric": "Mean Absolute Error (MAE)",
                "Linear Regression (y = a + bx)": f"₹{lin_m.mae:,.2f}",
                "Quadratic Regression (y = a + bx + cx²)": f"₹{quad_m.mae:,.2f}",
                "Difference / Impact": f"₹{lin_m.mae - quad_m.mae:,.2f} average reduction in error magnitude"
            },
            {
                "Evaluation Metric": "Mean Residual (ē)",
                "Linear Regression (y = a + bx)": f"₹{lin_m.mean_residual:,.2f}",
                "Quadratic Regression (y = a + bx + cx²)": f"₹{quad_m.mean_residual:,.2f}",
                "Difference / Impact": "Both strictly centered around 0 due to OLS properties"
            },
            {
                "Evaluation Metric": "Residual Standard Deviation (s_e)",
                "Linear Regression (y = a + bx)": f"₹{lin_m.std_residual:,.2f}",
                "Quadratic Regression (y = a + bx + cx²)": f"₹{quad_m.std_residual:,.2f}",
                "Difference / Impact": "Spread of unexplained market noise"
            }
        ])
        st.table(df_model_comp)

        st.plotly_chart(plot_model_comparison(analysis_res), use_container_width=True)

    # =========================================================
    # TAB 5: RESIDUAL ANALYSIS
    # =========================================================
    with tabs[4]:
        st.markdown("### Regression Residual Diagnostics: $e_i = y_i - \hat{y}_i$")
        st.caption("Residual analysis evaluates homoscedasticity, temporal clustering of shocks, and structural regime breaks.")

        r_model_choice = st.radio("Select Model for Residual Diagnostics:", ["Linear Regression", "Quadratic Regression"], horizontal=True)

        if r_model_choice == "Linear Regression":
            m_metrics = analysis_res.linear_metrics
            st.plotly_chart(plot_residuals(analysis_res, model_type="linear"), use_container_width=True)
        else:
            m_metrics = analysis_res.quadratic_metrics
            st.plotly_chart(plot_residuals(analysis_res, model_type="quadratic"), use_container_width=True)

        res_c1, res_c2, res_c3, res_c4 = st.columns(4)
        with res_c1:
            st.metric("Mean Residual", f"₹{m_metrics.mean_residual:,.2f}")
        with res_c2:
            st.metric("Residual Std Dev (s_e)", f"₹{m_metrics.std_residual:,.2f}")
        with res_c3:
            st.metric("Max Positive Shock (Underpredicted)", f"₹{m_metrics.max_positive_residual:,.2f}")
        with res_c4:
            st.metric("Max Negative Shock (Overpredicted)", f"₹{m_metrics.max_negative_residual:,.2f}")

    # =========================================================
    # TAB 6: TIME HORIZON COMPARISON
    # =========================================================
    with tabs[5]:
        st.markdown("### Multi-Horizon Period Comparison (1Y vs 3Y vs 5Y vs 10Y)")
        st.markdown("""
        > **Primary Statistical Takeaway:**  
        > *Statistical conclusions depend fundamentally on the historical observation window. The slope, volatility, correlation, and R² shift significantly across shorter vs longer horizons.*
        """)

        try:
            df_horizons = get_cached_horizon_comparison()
            st.dataframe(df_horizons, use_container_width=True, hide_index=True)
            st.plotly_chart(plot_period_horizon_comparison(df_horizons), use_container_width=True)
        except Exception as e_hor:
            st.error(f"Error computing horizon comparison: {str(e_hor)}")

    # =========================================================
    # TAB 7: MARKET DATA & TECHNICAL VIEW
    # =========================================================
    with tabs[6]:
        st.markdown("### Market Data & Supplementary Analytical Tools")
        st.caption("Lightweight analytical tools leveraging existing OHLCV fields. Labeled strictly as supplementary context, not trading signals.")

        tool_choice = st.selectbox(
            "Select Analytical Market View:",
            options=[
                "Daily OHLC Candlestick View",
                "Combined Price + Daily Volume View",
                "Moving Average Trend Context (20, 50, 200 SMA)",
                "Daily Returns Distribution (R_t)",
                "Rolling 20-Day Annualized Volatility"
            ]
        )

        df_curr = analysis_res.df_period

        if tool_choice == "Daily OHLC Candlestick View":
            st.plotly_chart(plot_ohlc_candlestick(df_curr, analysis_res.period_name), use_container_width=True)

        elif tool_choice == "Combined Price + Daily Volume View":
            st.plotly_chart(plot_price_and_volume(df_curr, analysis_res.period_name), use_container_width=True)
            st.caption("ℹ️ Note: Index trading volume reflects aggregated exchange volume for NIFTY component baskets where recorded.")

        elif tool_choice == "Moving Average Trend Context (20, 50, 200 SMA)":
            ma_sub1, ma_sub2, ma_sub3 = st.columns(3)
            with ma_sub1:
                use_20 = st.checkbox("20-Day SMA", value=True)
            with ma_sub2:
                use_50 = st.checkbox("50-Day SMA", value=True)
            with ma_sub3:
                use_200 = st.checkbox("200-Day SMA", value=True)

            selected_mas = [ma for ma, inc in [(20, use_20), (50, use_50), (200, use_200)] if inc]
            st.plotly_chart(plot_moving_averages(df_curr, analysis_res.period_name, selected_mas), use_container_width=True)

        elif tool_choice == "Daily Returns Distribution (R_t)":
            st.latex(r"R_t = \frac{P_t - P_{t-1}}{P_{t-1}} \times 100\%")
            st.plotly_chart(plot_daily_returns(df_curr, analysis_res.period_name), use_container_width=True)

        elif tool_choice == "Rolling 20-Day Annualized Volatility":
            st.latex(r"\sigma_{\text{annualized}} = s_{\text{daily, 20-day}} \times \sqrt{252} \times 100\%")
            st.plotly_chart(plot_rolling_volatility(df_curr, analysis_res.period_name, window=20), use_container_width=True)

    # =========================================================
    # TAB 8: SYLLABUS OBJECTIVES PANEL
    # =========================================================
    with tabs[7]:
        st.markdown("### Mathematical Techniques Demonstrated (Module Viva Reference)")
        st.markdown("Structured mapping of project components to the *Statistical Techniques* university syllabus.")

        syllabus_items = [
            {
                "name": "1. Descriptive Statistics (Sample Mean x̄ & Median)",
                "formula": r"\bar{x} = \frac{\sum x_i}{n}",
                "measures": "Measures the central tendency and expected trading level across the selected historical period.",
                "used": "Implemented in `src/statistics/descriptive.py` and displayed on Overview & Statistics tabs."
            },
            {
                "name": "2. Sample Variance (s²)",
                "formula": r"s^2 = \frac{\sum (x_i - \bar{x})^2}{n - 1}",
                "measures": "Quantifies average squared dispersion from the sample mean using degrees of freedom n-1 (ddof=1).",
                "used": "Implemented explicitly from first principles in `src/statistics/descriptive.py`."
            },
            {
                "name": "3. Sample Standard Deviation (s)",
                "formula": r"s = \sqrt{s^2}",
                "measures": "Measures price dispersion in native currency units (₹) to benchmark historical index volatility.",
                "used": "Used across all period analyses and summary KPI metrics."
            },
            {
                "name": "4. Covariance Cov(X, Y)",
                "formula": r"\text{Cov}(X, Y) = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{n - 1}",
                "measures": "Measures directional joint co-movement between sequential trading days (time index X) and closing price (Y).",
                "used": "Implemented in `src/statistics/covariance.py`."
            },
            {
                "name": "5. Pearson Correlation Coefficient (r)",
                "formula": r"r = \frac{\text{Cov}(X, Y)}{s_X s_Y}",
                "measures": "Measures the strength and direction of linear association between time and stock index level (-1 <= r <= +1).",
                "used": "Implemented in `src/statistics/correlation.py` with verbal interpretation logic."
            },
            {
                "name": "6. Ordinary Least Squares (OLS) Linear Regression",
                "formula": r"y = a + bx, \quad b = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2}, \quad a = \bar{y} - b\bar{x}",
                "measures": "Estimates the average linear rate of price change (slope b in ₹/trading day) and baseline level (intercept a).",
                "used": "Implemented from closed-form least-squares equations in `src/regression/linear.py`."
            },
            {
                "name": "7. Second-Degree Curve Fitting (Polynomial Regression)",
                "formula": r"y = a + bx + cx^2, \quad \boldsymbol{\beta} = (X^T X)^{-1} X^T \mathbf{y}",
                "measures": "Models non-linear acceleration or deceleration in long-term index trajectory via matrix normal equations.",
                "used": "Implemented in `src/regression/quadratic.py`."
            },
            {
                "name": "8. Coefficient of Determination (R²) & RMSE Evaluation",
                "formula": r"R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}, \quad \text{RMSE} = \sqrt{\frac{1}{n} \sum (y_i - \hat{y}_i)^2}",
                "measures": "Evaluates the proportion of historical variance explained by the model and mean squared error.",
                "used": "Implemented in `src/regression/evaluation.py` for model comparison."
            },
            {
                "name": "9. Residual Diagnostics",
                "formula": r"e_i = y_i - \hat{y}_i",
                "measures": "Identifies model mis-specifications, structural market shocks (e.g. 2020 crash), and deviation distribution.",
                "used": "Implemented in `src/regression/evaluation.py` and visual diagnostic subplots."
            }
        ]

        for item in syllabus_items:
            with st.expander(f"✓ {item['name']}", expanded=False):
                st.latex(item["formula"])
                st.markdown(f"**What it measures:** {item['measures']}")
                st.markdown(f"**Where it is used:** {item['used']}")


if __name__ == "__main__":
    main()

# Export top-level serverless variables to prevent Vercel auto-detection errors
def handler(request=None, *args, **kwargs):
    return {"statusCode": 200, "body": "NIFTY 50 Statistical Trend Analyzer"}

app = application = handler
