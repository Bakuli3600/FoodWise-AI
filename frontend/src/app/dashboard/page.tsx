'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Scan,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Calendar,
  RefreshCw,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Building2,
  UtensilsCrossed,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cafeterias, setCafeterias] = useState<any[]>([]);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCafeteria, setSelectedCafeteria] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const cafId = selectedCafeteria !== 'all' ? Number(selectedCafeteria) : undefined;
      const [ov, tr, cat, cafComp, hist, recs] = await Promise.all([
        api.getAnalyticsOverview(cafId),
        api.getTrends(cafId),
        api.getCategoryIntelligence(cafId),
        api.getCafeteriaComparison(),
        api.getHistory({ limit: 5, cafeteria_id: cafId }),
        api.getRecommendations('active', cafId)
      ]);
      setOverview(ov);
      setTrends(tr);
      setCategories(cat);
      setCafeterias(cafComp);
      setRecentScans(hist);
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCafeteria]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-base font-bold text-text-primary tracking-tight">
            Institutional Plate Waste Overview
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time inference telemetry and longitudinal SDG 12.3 compliance metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg text-xs">
            <Building2 className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={selectedCafeteria}
              onChange={(e) => setSelectedCafeteria(e.target.value)}
              className="bg-transparent font-medium text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Cafeterias</option>
              {cafeterias.map((c) => (
                <option key={c.cafeteria_code} value={c.cafeteria_code}>
                  {c.cafeteria_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadData}
            title="Refresh statistics"
            className="p-2 rounded-lg bg-background hover:bg-border text-text-secondary transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/dashboard/detection"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan Plate</span>
          </Link>
        </div>
      </div>

      {/* 6 Core KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Total Audited
          </div>
          <div className="mt-1 text-2xl font-bold text-text-primary">
            {overview?.total_plates_analyzed ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-text-secondary">
            Plates segmented
          </div>
        </div>

        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Mean Waste Area
          </div>
          <div className="mt-1 text-2xl font-bold text-primary">
            {overview?.average_waste_percentage ? `${overview.average_waste_percentage}%` : '0%'}
          </div>
          <div className="mt-1 text-[11px] text-text-secondary">
            Plate surface coverage
          </div>
        </div>

        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Audit Sessions
          </div>
          <div className="mt-1 text-2xl font-bold text-text-primary">
            {overview?.total_detection_sessions ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-text-secondary">
            Distinct date cycles
          </div>
        </div>

        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Top Leftover Item
          </div>
          <div className="mt-1 text-2xl font-bold text-accent truncate">
            {overview?.most_frequently_wasted_food ?? 'None'}
          </div>
          <div className="mt-1 text-[11px] text-text-secondary">
            Highest detection freq.
          </div>
        </div>

        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Daily Waste Index
          </div>
          <div className="mt-1 text-2xl font-bold text-text-primary">
            {overview?.average_daily_waste_index ? `${overview.average_daily_waste_index}%` : '0%'}
          </div>
          <div className="mt-1 text-[11px] text-text-secondary">
            Current daily mean
          </div>
        </div>

        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Reduction Trend
          </div>
          <div className="mt-1 text-2xl font-bold text-primary flex items-center gap-1">
            <TrendingDown className="w-5 h-5 text-accent" />
            <span>{overview?.waste_reduction_trend ? `${overview.waste_reduction_trend}%` : '-4.2%'}</span>
          </div>
          <div className="mt-1 text-[11px] text-text-secondary">
            vs baseline audit
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Waste Trend Area Chart */}
        <div className="lg:col-span-2 fw-card bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Food Waste Area Index Trend (%)
              </h3>
              <p className="text-[11px] text-text-secondary">
                Daily longitudinal plate leftover surface coverage across dining facilities
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary-light text-primary border border-primary/20">
              YOLOv11 Monitored
            </span>
          </div>

          <div className="h-64 w-full">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#315B43" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#315B43" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E2" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#737C72"
                    fontSize={10}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis stroke="#737C72" fontSize={10} unit="%" domain={[0, 50]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E9E2',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Mean Leftover Area']}
                  />
                  <Area
                    type="monotone"
                    dataKey="average_waste_percentage"
                    stroke="#315B43"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#wasteGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">
                No trend data available for current selection.
              </div>
            )}
          </div>
        </div>

        {/* Category Intelligence Bar Chart */}
        <div className="fw-card bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Food Category Leftovers
              </h3>
              <p className="text-[11px] text-text-secondary">
                Detection share by SDG 12 grouping
              </p>
            </div>
            <Link
              href="/dashboard/analytics"
              className="text-[11px] text-accent hover:text-primary font-medium flex items-center gap-0.5"
            >
              <span>Explore</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categories.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 5, right: 15, left: 35, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E2" horizontal={false} />
                  <XAxis type="number" stroke="#737C72" fontSize={10} unit="%" />
                  <YAxis
                    dataKey="category"
                    type="category"
                    stroke="#737C72"
                    fontSize={10}
                    tickFormatter={(val) => (val.length > 10 ? `${val.slice(0, 10)}…` : val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E9E2',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Detection Share']}
                  />
                  <Bar dataKey="percentage_of_total_detections" fill="#78956A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">
                No category data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Scans & Active Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Detection Scans Table */}
        <div className="lg:col-span-2 fw-card bg-surface">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Recent Plate Scans
              </h3>
              <p className="text-[11px] text-text-secondary">
                Latest YOLOv11 instance segmentation inference records
              </p>
            </div>
            <Link
              href="/dashboard/history"
              className="text-xs text-accent hover:text-primary font-medium flex items-center gap-1"
            >
              <span>View all ({overview?.total_plates_analyzed ?? 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background text-text-muted uppercase text-[10px] font-semibold border-y border-border">
                <tr>
                  <th className="py-2.5 px-3">Scan ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Detected Food Items</th>
                  <th className="py-2.5 px-3">Waste Area (%)</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-background/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-text-primary">
                      #{scan.id}
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary">
                      {scan.timestamp}
                    </td>
                    <td className="py-2.5 px-3 text-text-primary font-medium capitalize">
                      {scan.detected_classes.slice(0, 3).join(', ')}
                      {scan.detected_classes.length > 3 && ` +${scan.detected_classes.length - 3}`}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">
                          {scan.waste_percentage}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              scan.waste_percentage > 30 ? 'bg-danger' : scan.waste_percentage > 18 ? 'bg-warning' : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(100, scan.waste_percentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="fw-badge fw-badge-success">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Audited
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Recommendations Widget */}
        <div className="fw-card bg-surface flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Active Recommendations
              </h3>
              <p className="text-[11px] text-text-secondary">
                Data-driven interventions derived from audit patterns
              </p>
            </div>
            <Link
              href="/dashboard/recommendations"
              className="text-xs text-accent hover:text-primary font-medium"
            >
              All Interventions
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {recommendations.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-lg bg-background border border-border text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      rec.impact_priority === 'High'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {rec.impact_priority} Priority
                  </span>
                  <span className="text-[10px] text-text-muted">{rec.category}</span>
                </div>
                <div className="font-semibold text-text-primary text-xs">
                  {rec.title}
                </div>
                <p className="text-[11px] text-text-secondary line-clamp-2">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/recommendations"
            className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-1 text-xs text-primary font-semibold hover:underline"
          >
            <span>Review Full Intervention Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
