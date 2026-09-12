"""
Abstract base class for financial data providers.
"""
from abc import ABC, abstractmethod
import pandas as pd


class DataProvider(ABC):
    """
    Abstract interface for stock market data providers.
    Ensures mathematical modules do not depend on third-party API implementations.
    """

    @abstractmethod
    def fetch_historical_data(self, ticker: str, period_years: int = 10) -> pd.DataFrame:
        """
        Fetch daily historical market data for a given ticker and duration in years.
        
        Returns:
            pd.DataFrame: Raw market data containing Date, Open, High, Low, Close, Volume.
        """
        pass
