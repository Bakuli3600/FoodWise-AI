'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Sliders,
  Database,
  CheckCircle2,
  Save
} from 'lucide-react';
import { getStoredUser } from '@/lib/api';

export default function SettingsPage() {
  const [user, setUser] = useState<any | null>(null);
  const [wasteThreshold, setWasteThreshold] = useState<number>(25);
  const [confThreshold, setConfThreshold] = useState<number>(0.25);
  const [minPlateArea, setMinPlateArea] = useState<number>(1000);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-base font-bold text-text-primary tracking-tight">
            Platform Settings & Institutional Configuration
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage user profile credentials, alert sensitivity, and computer vision safeguards
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-primary-light border border-primary/20 text-primary text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Configuration preferences updated successfully.</span>
        </div>
      )}

      {/* User Profile Card */}
      <div className="fw-card bg-surface space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-text-primary border-b border-border pb-3">
          <User className="w-4 h-4 text-primary" />
          <span>Institutional User Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-text-muted mb-1">Full Name</label>
            <div className="p-2.5 rounded-lg bg-background border border-border font-medium text-text-primary">
              {user?.full_name || 'Dr. Eleanor Vance'}
            </div>
          </div>

          <div>
            <label className="block text-text-muted mb-1">Email Address</label>
            <div className="p-2.5 rounded-lg bg-background border border-border font-medium text-text-primary">
              {user?.email || 'admin@foodwise.ai'}
            </div>
          </div>

          <div>
            <label className="block text-text-muted mb-1">Assigned Role</label>
            <div className="p-2.5 rounded-lg bg-background border border-border font-medium text-text-primary flex items-center justify-between">
              <span>{user?.role || 'Super Admin'}</span>
              <span className="fw-badge fw-badge-success text-[10px]">Active</span>
            </div>
          </div>

          <div>
            <label className="block text-text-muted mb-1">Institution</label>
            <div className="p-2.5 rounded-lg bg-background border border-border font-medium text-text-primary">
              Institute of Technology & Management Dining Services
            </div>
          </div>
        </div>
      </div>

      {/* Inference & Threshold Preferences */}
      <form onSubmit={handleSave} className="fw-card bg-surface space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-text-primary border-b border-border pb-3">
          <Sliders className="w-4 h-4 text-accent" />
          <span>Computer Vision & Safeguard Parameters</span>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-text-primary mb-1">
              <span>High-Waste Notification Threshold</span>
              <span className="font-mono text-primary">{wasteThreshold}%</span>
            </div>
            <input
              type="range"
              min={15}
              max={50}
              value={wasteThreshold}
              onChange={(e) => setWasteThreshold(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <p className="text-[11px] text-text-muted mt-1">
              Plate scans exceeding this residual area trigger an automated intervention flag.
            </p>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-text-primary mb-1">
              <span>YOLOv11 Confidence Threshold (conf)</span>
              <span className="font-mono text-primary">{confThreshold}</span>
            </div>
            <input
              type="range"
              min={0.10}
              max={0.60}
              step={0.05}
              value={confThreshold}
              onChange={(e) => setConfThreshold(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <p className="text-[11px] text-text-muted mt-1">
              Minimum detection confidence for food and plate instance masks.
            </p>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-text-primary mb-1">
              <span>Minimum Plate Pixel Area</span>
              <span className="font-mono text-primary">{minPlateArea.toLocaleString()} px</span>
            </div>
            <input
              type="number"
              value={minPlateArea}
              onChange={(e) => setMinPlateArea(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-background border border-border text-xs text-text-primary"
            />
            <p className="text-[11px] text-text-muted mt-1">
              Safeguard: images where plate detection falls below this pixel count trigger a &ldquo;Missing Plate&rdquo; warning.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
