import os
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

class TimeSeriesWastePredictor:
    def __init__(self, model_type: str = "rf"):
        self.model_type = model_type
        if model_type == "rf":
            self.model = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
        else:
            self.model = Ridge(alpha=1.0)
        self.feature_cols = ["day_of_week", "is_weekend", "day_of_month", "hour_of_day"]
        self.metrics: Dict[str, Optional[float]] = {"mae": None, "rmse": None, "r2": None}
        self.is_trained = False

    def train_chronological(self, df: pd.DataFrame, train_ratio: float = 0.8) -> Dict[str, Any]:
        """
        Chronological train/validation split to strictly prevent data leakage in temporal series.
        """
        if len(df) < 5:
            return {
                "success": False,
                "message": "Insufficient data points for statistical validation (requires >= 5 records)."
            }

        # Features & Target
        X = df[self.feature_cols].values
        y = df["waste_percentage"].values

        # Chronological split index
        split_idx = max(3, int(len(df) * train_ratio))
        X_train, X_val = X[:split_idx], X[split_idx:]
        y_train, y_val = y[:split_idx], y[split_idx:]

        self.model.fit(X_train, y_train)
        self.is_trained = True

        if len(y_val) > 0:
            preds = self.model.predict(X_val)
            mae = float(mean_absolute_error(y_val, preds))
            rmse = float(np.sqrt(mean_squared_error(y_val, preds)))
            r2 = float(r2_score(y_val, preds)) if len(y_val) > 1 else None
        else:
            # Baseline evaluation on training set if validation set is too small
            preds = self.model.predict(X_train)
            mae = float(mean_absolute_error(y_train, preds))
            rmse = float(np.sqrt(mean_squared_error(y_train, preds)))
            r2 = float(r2_score(y_train, preds)) if len(y_train) > 1 else None

        self.metrics = {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2": round(r2, 3) if r2 is not None else None
        }

        # Save artifact
        artifact_path = ARTIFACTS_DIR / f"waste_predictor_{self.model_type}.joblib"
        joblib.dump({
            "model": self.model,
            "feature_cols": self.feature_cols,
            "metrics": self.metrics,
            "model_type": self.model_type
        }, artifact_path)

        return {
            "success": True,
            "metrics": self.metrics,
            "train_samples": len(X_train),
            "val_samples": len(X_val)
        }
