'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Scan,
  History,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Building2,
  Utensils,
  Leaf,
  FileText,
  Brain,
  Bell,
  Bot,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { clearAuthToken, getStoredUser } from '@/lib/api';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    section: 'OVERVIEW',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'AI Detection', href: '/dashboard/detection', icon: Scan, badge: 'Live YOLOv11' },
      { title: 'Detection History', href: '/dashboard/history', icon: History },
    ],
  },
  {
    section: 'INTELLIGENCE',
    items: [
      { title: 'Waste Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { title: 'Waste Predictions', href: '/dashboard/predictions', icon: TrendingUp },
      { title: 'Smart Recommendations', href: '/dashboard/recommendations', icon: Lightbulb },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { title: 'Cafeteria Management', href: '/dashboard/cafeterias', icon: Building2 },
      { title: 'Meal Management', href: '/dashboard/meals', icon: Utensils },
    ],
  },
  {
    section: 'SUSTAINABILITY',
    items: [
      { title: 'SDG 12.3 & Impact', href: '/dashboard/sustainability', icon: Leaf },
    ],
  },
  {
    section: 'RESEARCH & REPORTING',
    items: [
      { title: 'Reports & Exports', href: '/dashboard/reports', icon: FileText },
      { title: 'Model Architecture', href: '/dashboard/model', icon: Brain },
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { title: 'AI Assistant', href: '/dashboard/assistant', icon: Bot },
      { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { title: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-border px-5 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-base shadow-sm">
            FW
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-text-primary">
              FOODWISE AI
            </div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">
              SDG 12.3 Intelligence
            </div>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((group) => (
          <div key={group.section}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-text-muted uppercase">
              {group.section}
            </div>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white font-semibold shadow-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-primary-light text-primary'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-border bg-background/50">
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-accent/20 text-accent font-semibold flex items-center justify-center text-xs flex-shrink-0">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-text-primary truncate">
                {user?.full_name || 'Dr. Eleanor Vance'}
              </div>
              <div className="text-[10px] text-text-muted truncate">
                {user?.role || 'Super Admin'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded text-text-muted hover:text-danger hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
