"""
Yahoo Finance data provider implementation for NIFTY 50 (^NSEI).
Gracefully handles environments where yfinance is not available (e.g. Pyodide/WebAssembly).
"""
import datetime
import pandas as pd
from src.data.provider import DataProvider

try:
    import yfinance as yf
except ImportError:
    yf = None


class YFinanceProvider(DataProvider):
    """
    Data provider utilizing yfinance API to fetch NIFTY 50 (^NSEI) historical daily prices.
    """

    def __init__(self, default_symbol: str = "^NSEI"):
        self.default_symbol = default_symbol

    def fetch_historical_data(self, ticker: str = None, period_years: int = 10) -> pd.DataFrame:
        """
        Retrieves ~10 years of daily historical data for the given ticker.
        """
        if yf is None:
            raise RuntimeError("yfinance is not installed or supported in this runtime environment.")

        symbol = ticker if ticker else self.default_symbol
        end_date = datetime.date.today()
        start_date = end_date - datetime.timedelta(days=period_years * 365 + 30)

        try:
            df = yf.download(symbol, start=start_date, end=end_date, interval="1d", auto_adjust=False, progress=False)
            
            if df.empty:
                raise ValueError(f"No data returned from yfinance for symbol '{symbol}'.")

            # Handle MultiIndex columns if yfinance returns them
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)

            df = df.reset_index()

            # Required columns validation
            required_cols = ["Date", "Open", "High", "Low", "Close"]
            for col in required_cols:
                if col not in df.columns:
                    raise KeyError(f"Expected column '{col}' missing from downloaded dataset.")

            # Keep standard columns
            cols_to_keep = [c for c in ["Date", "Open", "High", "Low", "Close", "Volume"] if c in df.columns]
            df = df[cols_to_keep].copy()

            # Ensure Date is datetime type
            df['Date'] = pd.to_datetime(df['Date'])

            return df
        except Exception as e:
            raise RuntimeError(f"Error fetching data from yfinance for '{symbol}': {str(e)}") from e
