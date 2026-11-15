'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  CheckCheck
} from 'lucide-react';
import { api } from '@/lib/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    setLoading(true);
    api.getNotifications()
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-base font-bold text-text-primary tracking-tight">
            System Alerts & Operational Notifications
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time triggers on waste threshold spikes, model events, and compliance reports
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background hover:bg-border text-text-primary text-xs font-medium border border-border transition-colors self-start sm:self-auto"
        >
          <CheckCheck className="w-3.5 h-3.5 text-text-muted" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
              n.is_read
                ? 'bg-surface border-border opacity-75'
                : 'bg-surface border-primary/30 ring-1 ring-primary/10 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                  n.type === 'success'
                    ? 'bg-primary-light text-primary'
                    : n.type === 'warning'
                    ? 'bg-amber-50 text-warning'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                {n.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : n.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-text-primary">{n.title}</h3>
                  {!n.is_read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {n.message}
                </p>
                <div className="text-[10px] text-text-muted font-mono pt-0.5">
                  {n.created_at ? new Date(n.created_at).toLocaleString() : 'Recent'}
                </div>
              </div>
            </div>

            {!n.is_read && (
              <button
                onClick={() => handleMarkRead(n.id)}
                className="text-[11px] text-primary hover:underline font-medium whitespace-nowrap flex-shrink-0"
              >
                Mark Read
              </button>
            )}
          </div>
        ))}

        {notifications.length === 0 && !loading && (
          <div className="fw-card bg-surface py-12 text-center text-xs text-text-muted">
            All notifications read. System operating within normal thresholds.
          </div>
        )}
      </div>
    </div>
  );
}
