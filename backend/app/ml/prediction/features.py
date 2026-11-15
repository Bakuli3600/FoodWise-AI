import json
from datetime import datetime
from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np

def extract_features_from_logs(logs: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Transforms raw inference log records into a chronologically ordered time-series dataset.
    Features:
        - day_of_week (0=Mon, 6=Sun)
        - is_weekend (binary)
        - day_of_month
        - hour_of_day
        - rolling_waste_3d
        - rolling_waste_7d
        - total_food_px
    """
    if not logs:
        return pd.DataFrame()

    records = []
    for log in logs:
        ts_str = log["timestamp"]
        try:
            dt = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            try:
                dt = datetime.strptime(ts_str, "%Y-%m-%d")
            except ValueError:
                continue

        records.append({
            "timestamp": dt,
            "date": dt.date(),
            "waste_percentage": float(log["waste_percentage"]),
            "food_area": int(log.get("food_area", 0)),
            "plate_area": int(log.get("plate_area", 0)),
            "day_of_week": dt.weekday(),
            "is_weekend": 1 if dt.weekday() >= 5 else 0,
            "day_of_month": dt.day,
            "hour_of_day": dt.hour
        })

    df = pd.DataFrame(records)
    if df.empty:
        return df

    # Chronological sort
    df = df.sort_values("timestamp").reset_index(drop=True)
    return df
