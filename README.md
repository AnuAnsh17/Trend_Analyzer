# NIFTY 50 Statistical Trend Analyzer

A quantitative, modular statistical modeling system and interactive Streamlit application designed for the university module **Statistical Techniques**.

> **Official Project Objective:** Model stock price trends using regression techniques on 10 years of NIFTY 50 (`^NSEI`) historical market data.

---

## ⚠️ Academic & Financial Disclaimer

> **IMPORTANT NOTICE:**  
> This project analyzes historical statistical trends and regression relationships for academic and quantitative research purposes. **It does NOT guarantee future market movements and MUST NOT be interpreted as financial or investment advice.**

---

## 🏛️ Project Context & Architecture

This repository is **V1** of a modular statistical research engine built with clean architectural boundaries. The core mathematical calculations are implemented explicitly from first principles (closed-form Ordinary Least Squares and matrix normal equations) without relying on library black boxes.

```
Maths_mini/
├── app.py                      # Interactive Streamlit Dashboard UI
├── requirements.txt            # Python dependencies
├── README.md                   # Academic project documentation
├── .gitignore                  # Git ignore settings
├── data/
│   ├── raw/                    # Cached raw CSV dataset downloaded from provider
│   └── processed/              # Cleaned, validated, and sorted CSV dataset
├── src/
│   ├── data/
│   │   ├── provider.py         # Abstract DataProvider base interface
│   │   ├── yfinance_provider.py# YFinance implementation for NIFTY 50 (^NSEI)
│   │   └── preprocessing.py    # Validation, missing data handling & dataset health report
│   ├── statistics/
│   │   ├── descriptive.py      # Sample Mean, Median, Variance, Std Dev
│   │   ├── covariance.py       # Covariance Cov(X, Y) between time index and price
│   │   └── correlation.py      # Pearson Correlation Coefficient (r) & interpretation
│   ├── regression/
│   │   ├── linear.py           # OLS Simple Linear Regression y = a + bx
│   │   ├── quadratic.py        # OLS Second-Degree Polynomial y = a + bx + cx²
│   │   └── evaluation.py       # RMSE, MAE, R², Residuals & Model Comparison Table
│   ├── analysis/
│   │   ├── period_analysis.py  # 1Y / 3Y / 5Y / 10Y / Custom window slicing & re-indexing
│   │   └── trend.py            # Mathematical trend classification based on slope
│   └── visualization/
│       └── plots.py            # Publication-grade interactive Plotly visualizer
└── tests/
    ├── test_statistics.py      # Pure deterministic unit tests for stats core
    ├── test_regression.py      # Pure deterministic unit tests for OLS linear & quadratic fits
    └── test_data_processing.py # Unit tests for cleaning, filtering, and period slicing
```

---

## 📊 Dataset & Pipeline

- **Index Symbol:** `^NSEI` (NIFTY 50 Index)
- **Timeframe:** ~10 Years of daily trading observations (2016–2026)
- **Preserved OHLCV Fields:** `Date`, `Open`, `High`, `Low`, `Close`, `Volume`
- **Data Validation & Cleaning Rules:**
  - Chronological sorting by `Date`
  - Removal of duplicate trading dates
  - Filtering missing or non-positive closing prices without silent fake price interpolation
  - Local CSV caching in `data/raw/` and `data/processed/` with manual/on-demand refresh capability

---

## 📐 Mathematical Methodology & Formulas

### 1. Descriptive Statistics
- **Sample Mean ($\bar{y}$):**
  $$\bar{y} = \frac{\sum_{i=1}^n y_i}{n}$$
- **Sample Variance ($s^2$):**
  $$s^2 = \frac{\sum_{i=1}^n (y_i - \bar{y})^2}{n - 1}$$
- **Sample Standard Deviation ($s$):**
  $$s = \sqrt{s^2}$$

### 2. Covariance
- **Sample Covariance $\text{Cov}(X, Y)$:**
  $$\text{Cov}(X, Y) = \frac{\sum_{i=1}^n (x_i - \bar{x})(y_i - \bar{y})}{n - 1}$$
  *Where $X = 0, 1, \dots, n-1$ represents the sequential trading day observation index, and $Y$ represents the closing price.*

### 3. Pearson Correlation Coefficient ($r$)
- **Pearson $r$:**
  $$r = \frac{\text{Cov}(X, Y)}{s_X s_Y}$$
  *Measures the strength and direction of linear co-movement between observation time and index price.*

### 4. Simple Linear Regression ($y = a + bx$)
- **Slope ($b$):**
  $$b = \frac{\sum_{i=1}^n (x_i - \bar{x})(y_i - \bar{y})}{\sum_{i=1}^n (x_i - \bar{x})^2}$$
- **Intercept ($a$):**
  $$a = \bar{y} - b\bar{x}$$
- **Coefficient of Determination ($R^2$):**
  $$R^2 = 1 - \frac{SS_{\text{res}}}{SS_{\text{tot}}} = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$

### 5. Second-Degree Polynomial Regression ($y = a + bx + cx^2$)
- Solved explicitly via **OLS Matrix Normal Equations**:
  $$\boldsymbol{\beta} = \begin{bmatrix} a \\ b \\ c \end{bmatrix} = (X^T X)^{-1} X^T \mathbf{y}$$
  *Where design matrix $X = \begin{bmatrix} 1 & x_i & x_i^2 \end{bmatrix}$.*

---

## 🚀 Installation & Running

### Prerequisites
- Python 3.10+ installed

### Setup Environment
```bash
# Clone repository
git clone <repo-url>
cd Maths_mini

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Run Unit Tests
```bash
pytest tests/
```

### Launch Streamlit Dashboard
```bash
streamlit run app.py
```

---

## 🔍 Model Comparison & Residual Diagnostics

| Model | Equation Form | Strengths & Characteristics |
| :--- | :--- | :--- |
| **Linear Regression** | $y = a + bx$ | Simple, parsimonious baseline modeling constant linear growth per trading day. |
| **Quadratic Regression** | $y = a + bx + cx^2$ | Captures multi-year acceleration/curvature in the index trajectory; yields higher historical $R^2$. |

> **Key Distinction:** A higher in-sample $R^2$ confirms superior *historical curve fitting*, but does **not** imply superior future predictive or forecasting power.

---

## 🎯 Multi-Horizon Period Analysis

The system supports comparative statistical evaluation across:
- **1 Year**
- **3 Years**
- **5 Years**
- **10 Years (Full Dataset)**
- **Custom Date Range**

Each analytical window re-indexes observation index $x = 0, 1, \dots, N-1$ and independently recalculates descriptive statistics, covariance, correlation, linear regression, quadratic regression, and residual distributions.

---

## 🔮 Future Architecture Scope

While V1 strictly focuses on statistical regression modeling, its provider pattern (`DataProvider`) and decoupled mathematical architecture allow seamless future extensions to:
- Individual Indian stock equities & sectoral indices
- Fundamental indicators & financial news sentiment
- Time-series ARIMA / GARCH modeling & ML models
- Backtesting engines & risk analytics
