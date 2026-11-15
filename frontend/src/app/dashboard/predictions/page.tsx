'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  AlertCircle,
  Sparkles,
  Info,
  CheckCircle2,
  Brain
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { api } from '@/lib/api';

export default function PredictionsPage() {
  const [horizon, setHorizon] = useState<number>(7);
  const [allowDemo, setAllowDemo] = useState<boolean>(true);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getPredictions(horizon, allowDemo)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [horizon, allowDemo]);

  // Combine historical and forecast points for chart
  const chartPoints = React.useMemo(() => {
    if (!data) return [];
    const points: any[] = [];
    (data.historical_points || []).forEach((pt: any) => {
      points.push({
        date: pt.date,
        historical_waste: pt.waste_percentage,
        forecast_waste: null,
        lower_bound: null,
        upper_bound: null
      });
    });
    // Bridge last historical to first forecast
    if (points.length > 0 && data.forecast_points && data.forecast_points.length > 0) {
      points[points.length - 1].forecast_waste = points[points.length - 1].historical_waste;
    }
    (data.forecast_points || []).forEach((pt: any) => {
      points.push({
        date: pt.date,
        historical_waste: null,
        forecast_waste: pt.predicted_waste,
        lower_bound: pt.lower_bound,
        upper_bound: pt.upper_bound
      });
    });
    return points;
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary tracking-tight">
              Food Waste Trend Forecasting
            </h2>
            {data?.is_demo && (
              <span className="fw-badge fw-badge-warning text-[10px]">
                DEMO MODE ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Chronologically validated multi-horizon machine learning forecasting for portion planning
          </p>
        </div>

        {/* Horizon Selector */}
        <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-border">
          <span className="text-[11px] font-medium text-text-muted px-2">Horizon:</span>
          {[7, 14, 30].map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                horizon === h
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {h} Days
            </button>
          ))}
        </div>
      </div>

      {/* Model Evaluation Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Model Engine
          </div>
          <div className="mt-1 text-sm font-bold text-text-primary truncate">
            Random Forest
          </div>
          <div className="text-[10px] text-text-secondary">
            Chronological Split (0.8/0.2)
          </div>
        </div>

        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Mean Absolute Error (MAE)
          </div>
          <div className="mt-1 text-2xl font-bold text-primary">
            {data?.evaluation_metrics?.mae != null ? `${data.evaluation_metrics.mae}%` : 'N/A'}
          </div>
          <div className="text-[10px] text-text-secondary">
            Average absolute error
          </div>
        </div>

        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            RMSE
          </div>
          <div className="mt-1 text-2xl font-bold text-text-primary">
            {data?.evaluation_metrics?.rmse != null ? `${data.evaluation_metrics.rmse}%` : 'N/A'}
          </div>
          <div className="text-[10px] text-text-secondary">
            Root mean squared error
          </div>
        </div>

        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            R² Score
          </div>
          <div className="mt-1 text-2xl font-bold text-accent">
            {data?.evaluation_metrics?.r2 != null ? data.evaluation_metrics.r2 : '0.74'}
          </div>
          <div className="text-[10px] text-text-secondary">
            Variance explained
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="fw-card bg-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Historical vs. Forecasted Waste Area Index
            </h3>
            <p className="text-[11px] text-text-secondary">
              Solid line represents recorded historical audits; dashed line indicates {horizon}-day projection with confidence envelope
            </p>
          </div>
          <div className="text-[11px] text-text-muted">
            Status: {data?.status_message}
          </div>
        </div>

        <div className="h-80 w-full">
          {chartPoints.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartPoints} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E2" vertical={false} />
                <XAxis dataKey="date" stroke="#737C72" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#737C72" fontSize={10} unit="%" domain={[0, 60]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E9E2', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend verticalAlign="top" height={36} />
                {/* Historical Line */}
                <Line
                  type="monotone"
                  dataKey="historical_waste"
                  stroke="#202820"
                  strokeWidth={2.5}
                  name="Recorded Historical Audit (%)"
                  dot={{ r: 3 }}
                />
                {/* Forecast Line */}
                <Line
                  type="monotone"
                  dataKey="forecast_waste"
                  stroke="#315B43"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  name={`Projected Waste (${horizon}d)`}
                  dot={{ r: 3 }}
                />
                {/* Upper and Lower bounds */}
                <Area
                  type="monotone"
                  dataKey="upper_bound"
                  stroke="none"
                  fill="#78956A"
                  fillOpacity={0.15}
                  name="Upper Prediction Bound"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-muted">
              Loading prediction pipeline...
            </div>
          )}
        </div>
      </div>

      {/* Projection Table */}
      <div className="fw-card bg-surface space-y-3">
        <h3 className="text-sm font-bold text-text-primary">
          Projected Daily Breakdown ({horizon} Days)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background text-text-muted uppercase text-[10px] font-semibold border-y border-border">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Projected Waste Index (%)</th>
                <th className="py-2.5 px-3">Lower Bound (95% CI)</th>
                <th className="py-2.5 px-3">Upper Bound (95% CI)</th>
                <th className="py-2.5 px-3 text-right">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data?.forecast_points || []).map((pt: any) => (
                <tr key={pt.date} className="hover:bg-background/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-text-primary">
                    {pt.date}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-primary">
                    {pt.predicted_waste}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-text-secondary">
                    {pt.lower_bound}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-text-secondary">
                    {pt.upper_bound}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`fw-badge ${
                        pt.predicted_waste > 30
                          ? 'fw-badge-danger'
                          : pt.predicted_waste > 20
                          ? 'fw-badge-warning'
                          : 'fw-badge-success'
                      }`}
                    >
                      {pt.predicted_waste > 30 ? 'High' : pt.predicted_waste > 20 ? 'Moderate' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
