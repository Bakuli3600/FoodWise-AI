'use client';

import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '@/lib/api';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [loading, setLoading] = useState(true);
  const [isReevaluating, setIsReevaluating] = useState(false);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const data = await api.getRecommendations(filterStatus === 'all' ? undefined : filterStatus);
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, [filterStatus]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await api.updateRecommendationStatus(id, newStatus);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleReevaluate = async () => {
    setIsReevaluating(true);
    try {
      const data = await api.reevaluateRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReevaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-base font-bold text-text-primary tracking-tight">
            Targeted Operational Interventions & Recommendations
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Interventions calculated from real plate leftover frequencies and portion statistics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReevaluate}
            disabled={isReevaluating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReevaluating ? 'animate-spin' : ''}`} />
            <span>Re-evaluate Queue</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border w-fit text-xs">
        {['active', 'accepted', 'completed', 'dismissed', 'all'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
              filterStatus === st
                ? 'bg-primary text-white font-semibold shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {st} ({recommendations.filter((r) => st === 'all' || r.status === st).length})
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="fw-card bg-surface flex flex-col justify-between space-y-4 border-l-4"
            style={{
              borderLeftColor:
                rec.impact_priority === 'High'
                  ? '#C65C50'
                  : rec.impact_priority === 'Medium'
                  ? '#D99A42'
                  : '#78956A'
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    rec.impact_priority === 'High'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {rec.impact_priority} Impact Priority
                </span>
                <span className="text-[11px] font-semibold text-text-muted">
                  {rec.category}
                </span>
              </div>

              <h3 className="text-sm font-bold text-text-primary">
                {rec.title}
              </h3>

              <p className="text-xs text-text-secondary leading-relaxed">
                {rec.description}
              </p>

              {/* Supporting Evidence Metric */}
              <div className="p-2.5 rounded-lg bg-background border border-border text-[11px] text-text-muted italic">
                <b>Empirical Evidence:</b> {rec.supporting_metric}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[10px] text-text-muted">
                Status:{' '}
                <span className="font-semibold text-text-primary uppercase">
                  {rec.status}
                </span>
              </span>

              <div className="flex items-center gap-1.5">
                {rec.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'accepted')}
                      className="px-2.5 py-1 rounded bg-primary-light text-primary hover:bg-primary hover:text-white text-[11px] font-semibold transition-colors"
                    >
                      Accept Plan
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'dismissed')}
                      className="px-2.5 py-1 rounded bg-background text-text-muted hover:text-danger hover:bg-red-50 text-[11px] font-medium transition-colors"
                    >
                      Dismiss
                    </button>
                  </>
                )}

                {rec.status === 'accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(rec.id, 'completed')}
                    className="px-2.5 py-1 rounded bg-primary text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Mark Completed</span>
                  </button>
                )}

                {rec.status === 'completed' && (
                  <span className="fw-badge fw-badge-success text-[10px]">
                    <CheckCircle2 className="w-3 h-3" />
                    Implemented
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && !loading && (
        <div className="fw-card bg-surface py-12 text-center text-xs text-text-muted">
          No operational recommendations found under current filter.
        </div>
      )}
    </div>
  );
}
