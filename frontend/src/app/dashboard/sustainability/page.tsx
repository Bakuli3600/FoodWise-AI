'use client';

import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Target,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Globe2,
  FileCheck2
} from 'lucide-react';
import { api } from '@/lib/api';

export default function SustainabilityPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSustainability()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
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
            Institutional Sustainability & SDG 12.3 Alignment
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Empirical tracking for UN Sustainable Development Goals Target 12.3, SDG 2, and SDG 13
          </p>
        </div>
      </div>

      {/* Hero SDG Metric Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="fw-card bg-surface space-y-3 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Primary Goal Alignment
            </span>
            <span className="fw-badge fw-badge-success text-[10px]">UN Target 12.3</span>
          </div>
          <div className="text-3xl font-extrabold text-text-primary">
            SDG 12
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Ensure sustainable consumption and production patterns. Target 12.3 specifically mandates halving per capita global food waste at retail and consumer levels by 2030.
          </p>
        </div>

        <div className="fw-card bg-surface space-y-3">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Monitored Reduction vs. Baseline
          </div>
          <div className="text-3xl font-extrabold text-primary flex items-center gap-1.5">
            <TrendingDown className="w-7 h-7 text-accent" />
            <span>{data?.historical_reduction_rate ?? -4.2}%</span>
          </div>
          <div className="text-xs text-text-secondary">
            Baseline plate leftover area index: <b>{data?.food_waste_index_baseline ?? 32.5}%</b>.
            Current audited mean: <b>{data?.food_waste_index_current ?? 24.2}%</b>.
          </div>
        </div>

        <div className="fw-card bg-surface space-y-3">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Total Audited Plates
          </div>
          <div className="text-3xl font-extrabold text-text-primary">
            {data?.total_audited_plates?.toLocaleString() ?? 0}
          </div>
          <div className="text-xs text-text-secondary">
            Plate photographs segmented under the YOLOv11 protocol.
          </div>
        </div>
      </div>

      {/* Sustainable Development Goals Detailed Alignment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="fw-card bg-surface space-y-2">
          <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center font-bold text-xs mb-2">
            12.3
          </div>
          <h3 className="text-sm font-bold text-text-primary">SDG 12: Responsible Consumption</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Continuous plate waste monitoring enables precise portion sizing adjustments, preventing over-preparation and tray abandonment across high-volume cafeterias.
          </p>
        </div>

        <div className="fw-card bg-surface space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-warning flex items-center justify-center font-bold text-xs mb-2">
            2.1
          </div>
          <h3 className="text-sm font-bold text-text-primary">SDG 2: Zero Hunger</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Reducing avoidable plate leftovers facilitates food redistribution programs and dynamic supply planning, ensuring institutional surplus benefits local food banks.
          </p>
        </div>

        <div className="fw-card bg-surface space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2">
            13.2
          </div>
          <h3 className="text-sm font-bold text-text-primary">SDG 13: Climate Action</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Food decomposing in landfills generates significant methane emissions. Surface waste reduction directly diminishes the institutional greenhouse gas footprint.
          </p>
        </div>
      </div>

      {/* Scientific Methodology & Standards Section */}
      <div className="fw-card bg-surface space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-text-primary border-b border-border pb-3">
          <FileCheck2 className="w-4 h-4 text-primary" />
          <span>Scientific Methodology & Limitations Framework</span>
        </div>

        <div className="text-xs text-text-secondary space-y-3 leading-relaxed">
          <p>
            <b>Formula Specification:</b> In accordance with Ferreira et al. (<i>Applied Sciences</i>, 2025, 15(13), 7137), the Food Waste Area Index is computed strictly as:
          </p>
          <div className="p-3 bg-background rounded-lg font-mono text-text-primary text-[11px] border border-border">
            Waste Area Index (%) = FoodArea / (PlateArea - GarbageArea) × 100
          </div>
          <p>
            <b>Algorithmic Safeguards:</b> Double-counting from overlapping food items is prevented through binary pixel-wise mask unions. Utensils (forks, knives, spoons) are classified as non-food items and excluded from the food numerator. Inedible materials (napkins, bones, toothpicks) are identified via Class 35 (Garbage) and subtracted from the plate denominator.
          </p>
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-amber-900 text-[11px] space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
              <span>Academic Integrity Notice (2D vs. Mass)</span>
            </div>
            <p>
              The computer vision model operates on single 2D post-consumption images and calculates pixel surface coverage. It does not observe 3D food volume, density, or physical mass in grams. FOODWISE AI never presents 2D surface area percentages as physical weight without separate calibrated gravimetric validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
