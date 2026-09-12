"""
NIFTY 50 Statistical Trend Analyzer — Streamlit Dashboard Application.
Provides interactive statistical modeling, regression analysis, residual diagnostic plots, and period comparisons.
"""
import datetime
import streamlit as st
import pandas as pd

from src.data.preprocessing import DataPipeline
from src.analysis.period_analysis import analyze_period, compare_all_periods
from src.analysis.trend import classify_trend
from src.visualization.plots import (
    plot_price_history,
    plot_linear_fit,
    plot_quadratic_fit,
    plot_model_comparison,
    plot_residuals,
    plot_period_horizon_comparison
)

# Page configuration
st.set_page_config(
    page_title="NIFTY 50 Statistical Trend Analyzer",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for academic, clean, minimal styling
st.markdown("""
<style>
    .main-header {
        font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
        color: #1a252f;
        font-weight: 700;
        margin-bottom: 0px;
    }
    .sub-header {
        font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
        color: #5d6d7e;
        font-size: 1.1rem;
        margin-bottom: 20px;
    }
    .metric-card {
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        padding: 12px 16px;
        text-align: center;
    }
    .metric-title {
        color: #7f8c8d;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    .metric-value {
        color: #2c3e50;
        font-size: 1.4rem;
        font-weight: 700;
    }
    .equation-box {
        background-color: #f1f4f8;
        border-left: 4px solid #2980b9;
        padding: 14px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 1.1rem;
        font-weight: bold;
        color: #1b4f72;
        border-radius: 4px;
        margin-bottom: 15px;
    }
</style>
""", unsafe_allow_dict=True)


@st.cache_data(ttl=3600)
def load_data(force_refresh: bool = False):
    pipeline = DataPipeline()
    return pipeline.fetch_and_process(force_refresh=force_refresh)


def main():
    st.markdown('<h1 class="main-header">NIFTY 50 Statistical Trend Analyzer</h1>', unsafe_allow_dict=True)
    st.markdown('<div class="sub-header">Statistical modelling of historical NIFTY 50 price trends using linear and quadratic regression</div>', unsafe_allow_dict=True)

    # Load master dataset
    try:
        df_master, report = load_data(force_refresh=False)
    except Exception as e:
        st.error(f"Failed to load NIFTY 50 dataset: {str(e)}")
        st.info("Please check your internet connection or click 'Refresh Dataset' below.")
        return

    # Data health bar & refresh in sidebar
    with st.sidebar:
        st.header("⚙️ Data Controls")
        if st.button("🔄 Refresh Market Data", use_container_width=True):
            st.cache_data.clear()
            df_master, report = load_data(force_refresh=True)
            st.success("Dataset refreshed successfully!")

        st.markdown("---")
        st.subheader("📊 Dataset Health & Scope")
        st.write(f"**Symbol:** `^NSEI` (NIFTY 50)")
        st.write(f"**Date Range:** {report.earliest_date} to {report.latest_date}")
        st.write(f"**Total Observations:** {report.total_observations:,}")
        st.write(f"**Missing Values:** {report.missing_values_count}")
        st.write(f"**Duplicates Removed:** {report.duplicate_rows_count}")
        st.write(f"**Status:** {report.validation_message}")

        st.markdown("---")
        st.markdown("""
        **Academic Project Context:**
        Module: *Statistical Techniques*  
        Objective: *Model stock price trends using regression.*
        
        *Note: This tool analyzes historical statistical relationships and does NOT provide financial advice or automated trading signals.*
        """)

    # Top Horizon Selector
    st.subheader("🗓️ Select Analysis Period Horizon")
    col_p1, col_p2 = st.columns([3, 2])
    
    with col_p1:
        period_choice = st.radio(
            "Observation Window",
            options=["1 Year", "3 Years", "5 Years", "10 Years", "Custom Period"],
            horizontal=True,
            index=3
        )

    start_dt, end_dt = None, None
    if period_choice == "Custom Period":
        with col_p2:
            c1, c2 = st.columns(2)
            min_date = df_master['Date'].min().date()
            max_date = df_master['Date'].max().date()
            with c1:
                start_dt = st.date_input("Start Date", value=min_date, min_value=min_date, max_value=max_date)
            with c2:
                end_dt = st.date_input("End Date", value=max_date, min_value=min_date, max_value=max_date)

    # Perform analysis for selected period
    try:
        analysis_res = analyze_period(
            df_master=df_master,
            period_name="Custom" if period_choice == "Custom Period" else period_choice,
            start_date=start_dt,
            end_date=end_dt
        )
    except Exception as err:
        st.error(f"Error executing statistical analysis: {str(err)}")
        return

    # Data Summary Banner
    st.info(
        f"📍 **Analyzed Scope:** {analysis_res.period_name} | "
        f"**Active Dates:** {analysis_res.start_date} to {analysis_res.end_date} | "
        f"**Observations (N):** {analysis_res.descriptive_stats.n:,} trading days"
    )

    # Overview KPI Cards
    latest_close = float(analysis_res.df_period['Close'].iloc[-1])
    desc = analysis_res.descriptive_stats

    k1, k2, k3, k4, k5 = st.columns(5)
    with k1:
        st.metric("Latest Close", f"₹{latest_close:,.2f}")
    with k2:
        st.metric("Mean Price (x̄)", f"₹{desc.mean:,.2f}")
    with k3:
        st.metric("Std Dev (s)", f"₹{desc.std_dev:,.2f}")
    with k4:
        st.metric("Min Price", f"₹{desc.min_val:,.2f}")
    with k5:
        st.metric("Max Price", f"₹{desc.max_val:,.2f}")

    # Tabs for Main Analysis
    tab_overview, tab_linear, tab_quad, tab_comp, tab_residuals, tab_horizons = st.tabs([
        "📊 Descriptive & Correlation",
        "📈 Linear Regression",
        "📉 Second-Degree Curve Fit",
        "⚖️ Model Comparison",
        "🔍 Residual Analysis",
        "🌐 Horizon Period Comparison"
    ])

    # ---------------- TAB 1: DESCRIPTIVE & CORRELATION ----------------
    with tab_overview:
        c_desc, c_corr = st.columns(2)

        with c_desc:
            st.markdown("### Descriptive Statistics")
            df_desc = pd.DataFrame([
                {"Metric": "Number of Observations (N)", "Value": f"{desc.n:,}"},
                {"Metric": "Sample Mean (x̄)", "Value": f"₹{desc.mean:,.2f}"},
                {"Metric": "Sample Median", "Value": f"₹{desc.median:,.2f}"},
                {"Metric": "Minimum Price", "Value": f"₹{desc.min_val:,.2f}"},
                {"Metric": "Maximum Price", "Value": f"₹{desc.max_val:,.2f}"},
                {"Metric": "Sample Variance (s²)", "Value": f"{desc.variance:,.2f}"},
                {"Metric": "Sample Standard Deviation (s)", "Value": f"₹{desc.std_dev:,.2f}"},
            ])
            st.table(df_desc)

        with c_corr:
            st.markdown("### Covariance & Pearson Correlation")
            cov = analysis_res.covariance_res
            corr = analysis_res.correlation_res

            st.write(f"**Covariance Cov(X, Y):** `{cov.covariance:,.4f}`")
            st.caption(cov.interpretation)

            st.write(f"**Pearson Correlation (r):** `{corr.r:.4f}`")
            st.write(f"**Coefficient of Determination (r²):** `{corr.r_squared:.4f}`")
            st.write(f"**Relationship Strength:** `{corr.strength.title()} {corr.direction}`")
            st.info(corr.interpretation)

        st.plotly_chart(plot_price_history(analysis_res.df_period, analysis_res.period_name), use_container_width=True)

    # ---------------- TAB 2: LINEAR REGRESSION ----------------
    with tab_linear:
        st.markdown("### Simple Linear Regression Model: y = a + bx")
        st.markdown("Fits a constant rate of price change per trading day using Ordinary Least Squares (OLS).")

        lin = analysis_res.linear_reg
        trend = classify_trend(lin.slope, desc.mean, desc.n)

        st.markdown(f'<div class="equation-box">Regression Equation: {lin.equation_str}</div>', unsafe_allow_dict=True)

        m1, m2, m3, m4 = st.columns(4)
        with m1:
            st.metric("Slope (b)", f"₹{lin.slope:.4f} / day")
        with m2:
            st.metric("Intercept (a)", f"₹{lin.intercept:,.2f}")
        with m3:
            st.metric("Goodness of Fit (R²)", f"{lin.r_squared:.4f}")
        with m4:
            st.metric("RMSE", f"₹{analysis_res.linear_metrics.rmse:,.2f}")

        st.success(f"**Trend Classification:** {trend.trend_label} — {trend.explanation}")

        st.plotly_chart(plot_linear_fit(analysis_res), use_container_width=True)

    # ---------------- TAB 3: SECOND-DEGREE CURVE FIT ----------------
    with tab_quad:
        st.markdown("### Second-Degree Polynomial Regression: y = a + bx + cx²")
        st.markdown("Models historical acceleration or deceleration in long-term index trajectory.")

        quad = analysis_res.quadratic_reg
        st.markdown(f'<div class="equation-box">Quadratic Equation: {quad.equation_str}</div>', unsafe_allow_dict=True)

        q1, q2, q3, q4, q5 = st.columns(5)
        with q1:
            st.metric("Intercept (a)", f"₹{quad.a:,.2f}")
        with q2:
            st.metric("Linear Coeff (b)", f"{quad.b:.4f}")
        with q3:
            st.metric("Quadratic Coeff (c)", f"{quad.c:.6f}")
        with q4:
            st.metric("Goodness of Fit (R²)", f"{quad.r_squared:.4f}")
        with q5:
            st.metric("RMSE", f"₹{analysis_res.quadratic_metrics.rmse:,.2f}")

        st.plotly_chart(plot_quadratic_fit(analysis_res), use_container_width=True)

    # ---------------- TAB 4: MODEL COMPARISON ----------------
    with tab_comp:
        st.markdown("### Linear vs Quadratic Model Evaluation")
        st.write(analysis_res.comparison_summary)

        st.table(analysis_res.comparison_df)

        st.plotly_chart(plot_model_comparison(analysis_res), use_container_width=True)

    # ---------------- TAB 5: RESIDUAL ANALYSIS ----------------
    with tab_residuals:
        st.markdown("### Residual Diagnostics (Actual Price - Predicted Price)")
        st.caption("Assesses systematic deviations and variance of model residuals.")

        res_choice = st.radio("Select Model Residuals", options=["Linear Regression", "Quadratic Regression"], horizontal=True)

        if res_choice == "Linear Regression":
            m_metrics = analysis_res.linear_metrics
            st.plotly_chart(plot_residuals(analysis_res, model_type="linear"), use_container_width=True)
        else:
            m_metrics = analysis_res.quadratic_metrics
            st.plotly_chart(plot_residuals(analysis_res, model_type="quadratic"), use_container_width=True)

        r_c1, r_c2, r_c3, r_c4 = st.columns(4)
        with r_c1:
            st.metric("Mean Residual", f"₹{m_metrics.mean_residual:,.2f}")
        with r_c2:
            st.metric("Std Dev Residual", f"₹{m_metrics.std_residual:,.2f}")
        with r_c3:
            st.metric("Max Positive Residual", f"₹{m_metrics.max_positive_residual:,.2f}")
        with r_c4:
            st.metric("Max Negative Residual", f"₹{m_metrics.max_negative_residual:,.2f}")

    # ---------------- TAB 6: HORIZON PERIOD COMPARISON ----------------
    with tab_horizons:
        st.markdown("### Multi-Horizon Period Comparison (1Y vs 3Y vs 5Y vs 10Y)")
        st.markdown("Demonstrates how statistical metrics, slopes, and $R^2$ shift dramatically across observation windows.")

        try:
            df_horizons = compare_all_periods(df_master)
            st.dataframe(df_horizons, use_container_width=True, hide_index=True)
            st.plotly_chart(plot_period_horizon_comparison(df_horizons), use_container_width=True)
        except Exception as e_hor:
            st.error(f"Error calculating period horizon comparisons: {str(e_hor)}")


if __name__ == "__main__":
    main()
