"""
Data validation, cleaning, local caching, and health reporting for NIFTY 50 dataset.
"""
from dataclasses import dataclass
import os
from pathlib import Path
from typing import Dict, Any, Tuple
import pandas as pd
from src.data.provider import DataProvider

try:
    from src.data.yfinance_provider import YFinanceProvider
except (ImportError, Exception):
    YFinanceProvider = None


@dataclass
class DatasetReport:
    """
    Data validation and summary metrics container.
    """
    earliest_date: str
    latest_date: str
    total_observations: int
    missing_values_count: int
    duplicate_rows_count: int
    available_columns: list
    first_5_rows: pd.DataFrame
    last_5_rows: pd.DataFrame
    passed_validation: bool
    validation_message: str


class DataPipeline:
    """
    Manages data retrieval, raw caching, validation, cleaning, processed storage, and health diagnostics.
    """

    def __init__(self, data_dir: str = "data", provider: DataProvider = None):
        self.data_dir = Path(data_dir)
        self.raw_dir = self.data_dir / "raw"
        self.processed_dir = self.data_dir / "processed"
        self.raw_file = self.raw_dir / "nifty50_raw.csv"
        self.processed_file = self.processed_dir / "nifty50_processed.csv"
        
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        
        if provider:
            self.provider = provider
        elif YFinanceProvider is not None:
            try:
                self.provider = YFinanceProvider()
            except Exception:
                self.provider = None
        else:
            self.provider = None

    def fetch_and_process(self, force_refresh: bool = False, period_years: int = 10) -> Tuple[pd.DataFrame, DatasetReport]:
        """
        Retrieves, validates, cleans, and caches NIFTY 50 daily historical data.
        """
        if not force_refresh and self.processed_file.exists():
            df_processed = pd.read_csv(self.processed_file)
            df_processed['Date'] = pd.to_datetime(df_processed['Date'])
            df_processed = df_processed.sort_values('Date').reset_index(drop=True)
            report = self.generate_report(df_processed)
            return df_processed, report

        # If live provider is unavailable, fallback gracefully to cached dataset
        if self.provider is None:
            if self.processed_file.exists():
                df_processed = pd.read_csv(self.processed_file)
                df_processed['Date'] = pd.to_datetime(df_processed['Date'])
                df_processed = df_processed.sort_values('Date').reset_index(drop=True)
                report = self.generate_report(df_processed)
                report.validation_message = "Serving cached NIFTY 50 dataset (live market API feed is unavailable in this runtime)."
                return df_processed, report
            raise RuntimeError("Market data provider is unavailable and no local cached data was found.")

        # Fetch fresh data from provider
        df_raw = self.provider.fetch_historical_data(ticker="^NSEI", period_years=period_years)
        
        # Save raw data
        df_raw.to_csv(self.raw_file, index=False)

        # Clean & validate
        df_cleaned, report = self.clean_and_validate(df_raw)

        # Save processed dataset
        df_cleaned.to_csv(self.processed_file, index=False)

        return df_cleaned, report

    def clean_and_validate(self, df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, DatasetReport]:
        """
        Cleans data strictly according to rules:
        - Ensure Date parsing
        - Count missing & duplicate rows before cleaning
        - Remove duplicate dates (keep first)
        - Filter out NaN or non-positive closing prices without interpolating fake prices
        - Sort chronologically
        """
        df = df_raw.copy()
        
        # Pre-cleaning statistics
        initial_count = len(df)
        df['Date'] = pd.to_datetime(df['Date'])
        duplicate_count = df.duplicated(subset=['Date']).sum()
        missing_values_count = df['Close'].isna().sum()

        # 1. Remove duplicate dates
        df = df.drop_duplicates(subset=['Date'], keep='first')

        # 2. Remove rows with missing or invalid Close prices (Strictly NO fake interpolation)
        df = df.dropna(subset=['Close'])
        df = df[df['Close'] > 0]

        # 3. Sort chronologically
        df = df.sort_values('Date').reset_index(drop=True)

        # 4. Generate validation report
        report = self.generate_report(df, duplicate_count, missing_values_count)

        return df, report

    def generate_report(self, df: pd.DataFrame, duplicate_count: int = 0, missing_values_count: int = 0) -> DatasetReport:
        """
        Generates structured data health diagnostics.
        """
        if df.empty:
            return DatasetReport(
                earliest_date="N/A",
                latest_date="N/A",
                total_observations=0,
                missing_values_count=missing_values_count,
                duplicate_rows_count=duplicate_count,
                available_columns=list(df.columns),
                first_5_rows=pd.DataFrame(),
                last_5_rows=pd.DataFrame(),
                passed_validation=False,
                validation_message="Dataset is empty after cleaning."
            )

        earliest = df['Date'].min().strftime('%Y-%m-%d')
        latest = df['Date'].max().strftime('%Y-%m-%d')
        total_obs = len(df)
        
        # Verify approximately 10 years (e.g. > 1800 trading observations)
        passed = total_obs >= 1500
        msg = "Data validation passed successfully." if passed else f"Warning: Observation count ({total_obs}) is less than expected for 10 years."

        return DatasetReport(
            earliest_date=earliest,
            latest_date=latest,
            total_observations=total_obs,
            missing_values_count=missing_values_count,
            duplicate_rows_count=duplicate_count,
            available_columns=list(df.columns),
            first_5_rows=df.head(5).copy(),
            last_5_rows=df.tail(5).copy(),
            passed_validation=passed,
            validation_message=msg
        )
