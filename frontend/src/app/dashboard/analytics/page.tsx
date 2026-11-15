'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingDown,
  PieChart as PieIcon,
  Download,
  Building2,
  Calendar,
  Sparkles,
  Layers,
  Info,
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
  CartesianGrid,
  Legend
} from 'recharts';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cafeterias, setCafeterias] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAnalyticsOverview(),
      api.getTrends(),
      api.getCategoryIntelligence(),
      api.getCafeteriaComparison(),
      api.getInsights()
    ]).then(([ov, tr, cat, caf, ins]) => {
      setOverview(ov);
      setTrends(tr);
      setCategories(cat);
      setCafeterias(caf);
      setInsights(ins);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-base font-bold text-text-primary tracking-tight">
            Waste Analytics & Category Intelligence
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Statistical aggregation across all 85 PROJ3 food classes and dining service facilities
          </p>
        </div>

        <button
          onClick={() => {
            window.location.href = '/api/reports/download/report_latest.csv';
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-background hover:bg-border text-text-primary text-xs font-semibold border border-border transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-text-muted" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Section A: Longitudinal Waste Trends */}
      <div className="fw-card bg-surface space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Section A: Longitudinal Food Waste Area Index (%)
            </h3>
            <p className="text-[11px] text-text-secondary">
              Daily mean leftover area index derived from YOLOv11 plate segmentation
            </p>
          </div>
          <span className="fw-badge fw-badge-success text-[10px]">
            Mean: {overview?.average_waste_percentage ?? 0}%
          </span>
        </div>

        <div className="h-72 w-full">
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#315B43" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#315B43" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E2" vertical={false} />
                <XAxis dataKey="date" stroke="#737C72" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#737C72" fontSize={10} unit="%" domain={[0, 50]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E9E2', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: any) => [`${val}%`, 'Waste Area Index']}
                />
                <Area type="monotone" dataKey="average_waste_percentage" stroke="#315B43" strokeWidth={2} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-muted">
              Loading trend series...
            </div>
          )}
        </div>
      </div>

      {/* Section B: Food Category Intelligence */}
      <div className="fw-card bg-surface space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Section B: Food Category Distribution & Residual Area
            </h3>
            <p className="text-[11px] text-text-secondary">
              Categorized according to SDG 12 nutritional and waste groupings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E2" vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke="#737C72"
                  fontSize={9}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#737C72" fontSize={10} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E9E2', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="average_waste_percentage" fill="#78956A" name="Mean Waste Index (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background text-text-muted uppercase text-[10px] font-semibold border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Detections</th>
                  <th className="py-2.5 px-3">Mean Area (%)</th>
                  <th className="py-2.5 px-3 text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((c) => (
                  <tr key={c.category} className="hover:bg-background/50 transition-colors">
                    <td className="py-2 px-3 font-medium text-text-primary flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color_hex }} />
                      <span>{c.category}</span>
                    </td>
                    <td className="py-2 px-3 text-text-secondary font-mono">{c.detection_count}</td>
                    <td className="py-2 px-3 font-semibold text-text-primary">{c.average_waste_percentage}%</td>
                    <td className="py-2 px-3 text-right font-mono text-text-secondary">{c.percentage_of_total_detections}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section C: Cafeteria Comparison */}
      <div className="fw-card bg-surface space-y-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary">
            Section C: Dining Facility Comparison
          </h3>
          <p className="text-[11px] text-text-secondary">
            Cross-facility performance, plate throughput, and leftover area indices
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cafeterias.map((caf) => (
            <div key={caf.cafeteria_code} className="p-4 rounded-xl bg-background border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary text-xs">{caf.cafeteria_name}</span>
                <span className="text-[10px] font-mono text-text-muted">{caf.cafeteria_code}</span>
              </div>
              <div className="text-2xl font-extrabold text-primary">
                {caf.average_waste_percentage}%
              </div>
              <div className="text-[11px] text-text-secondary">
                Mean leftover plate area across {caf.total_scans} audits
              </div>
              <div className="pt-2 border-t border-border flex justify-between text-[11px] text-text-muted">
                <span>Plates Served: {caf.plates_served.toLocaleString()}</span>
                <span>Returned: {caf.plates_returned.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section D: Empirical Consumption Insights */}
      <div className="fw-card bg-surface space-y-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary">
            Section D: Empirically Derived Consumption Insights
          </h3>
          <p className="text-[11px] text-text-secondary">
            Insights synthesized strictly from historical database records (differentiated by certainty level)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((ins, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-background border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    ins.type === 'observed'
                      ? 'bg-primary-light text-primary border border-primary/20'
                      : ins.type === 'derived'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}
                >
                  {ins.type} finding
                </span>
                <span className="text-[10px] text-text-muted">{ins.category}</span>
              </div>
              <div className="font-semibold text-xs text-text-primary">{ins.title}</div>
              <p className="text-[11px] text-text-secondary leading-relaxed">{ins.insight_text}</p>
              <div className="text-[10px] text-text-muted italic pt-1 border-t border-border">
                Evidence: {ins.supporting_evidence}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
