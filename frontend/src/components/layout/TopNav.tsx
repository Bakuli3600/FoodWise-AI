'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Bell, Scan, Building2, CheckCircle2 } from 'lucide-react';
import { api, getStoredUser } from '@/lib/api';

export default function TopNav({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname();
  const user = getStoredUser();
  const [cafeterias, setCafeterias] = useState<any[]>([]);
  const [selectedCaf, setSelectedCaf] = useState<string>('all');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    api.getCafeterias()
      .then(setCafeterias)
      .catch(() => {});
    api.getNotifications()
      .then(setNotifications)
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Title generator
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Institutional Overview';
    if (pathname.includes('/detection')) return 'Plate Waste Detection (YOLOv11)';
    if (pathname.includes('/history')) return 'Detection History & Audit Logs';
    if (pathname.includes('/analytics')) return 'Waste Analytics & Intelligence';
    if (pathname.includes('/predictions')) return 'Time-Series Trend Forecasting';
    if (pathname.includes('/recommendations')) return 'Operational Recommendations';
    if (pathname.includes('/cafeterias')) return 'Dining Facilities & Capacity';
    if (pathname.includes('/meals')) return 'Meal Sessions & Plate Balance';
    if (pathname.includes('/sustainability')) return 'UN SDG 12.3 & Sustainability';
    if (pathname.includes('/reports')) return 'Audit Reports & Compliance Exports';
    if (pathname.includes('/model')) return 'YOLOv11 Research Architecture';
    if (pathname.includes('/assistant')) return 'Institutional AI Assistant';
    if (pathname.includes('/notifications')) return 'System Notifications & Alerts';
    if (pathname.includes('/settings')) return 'Platform Configuration & Profile';
    return 'FOODWISE AI';
  };

  return (
    <header className="h-16 bg-surface border-b border-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-background transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm lg:text-base font-semibold text-text-primary tracking-tight">
            {getPageTitle()}
          </h1>
          <div className="hidden sm:block text-[11px] text-text-muted">
            Ferreira et al. (MDPI 2025) Instance Segmentation Framework
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Cafeteria Filter */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-text-secondary">
          <Building2 className="w-3.5 h-3.5 text-text-muted" />
          <select
            value={selectedCaf}
            onChange={(e) => setSelectedCaf(e.target.value)}
            className="bg-transparent text-xs text-text-primary font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Dining Facilities</option>
            {cafeterias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Action Button: New Scan */}
        <Link
          href="/dashboard/detection"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Scan className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Plate Scan</span>
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-lg text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger animate-pulse" />
          )}
        </Link>

        {/* Role Badge */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-light text-primary text-[11px] font-semibold border border-primary/20">
          <CheckCircle2 className="w-3 h-3" />
          <span>{user?.role || 'Super Admin'}</span>
        </div>
      </div>
    </header>
  );
}
