'use client';

import React from 'react';
import Link from 'next/link';
import {
  Scan,
  TrendingUp,
  Leaf,
  ShieldCheck,
  ArrowRight,
  Database,
  BarChart3,
  Brain,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
              FW
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-text-primary">
                FOODWISE AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider text-accent px-1.5 py-0.5 rounded bg-primary-light">
                SDG 12.3 Platform
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-text-secondary">
            <a href="#methodology" className="hover:text-text-primary transition-colors">
              Methodology
            </a>
            <a href="#architecture" className="hover:text-text-primary transition-colors">
              YOLOv11 Architecture
            </a>
            <a href="#sustainability" className="hover:text-text-primary transition-colors">
              SDG Impact
            </a>
            <a href="#research" className="hover:text-text-primary transition-colors">
              Research
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light border border-primary/20 text-primary text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            MDPI Applied Sciences 2025 Research Implementation
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-[1.12]">
            Turn Food Waste Into Actionable Intelligence.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl">
            An AI-powered food waste intelligence platform that detects leftovers from cafeteria plate photographs,
            analyzes consumption patterns, predicts waste trends, and helps institutions make smarter sustainability decisions.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard/detection"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all"
            >
              <Scan className="w-4 h-4" />
              <span>Launch Live Plate Detection</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface hover:bg-background border border-border text-text-primary text-sm font-medium transition-colors"
            >
              <span>View Institutional Analytics</span>
            </Link>
          </div>
        </div>

        {/* Hero Visual Metric Card */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="fw-card border-border bg-surface">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Computer Vision Model
            </div>
            <div className="mt-2 text-2xl font-bold text-text-primary">
              YOLOv11-seg
            </div>
            <div className="mt-1 text-xs text-text-secondary">
              Instance segmentation across 85 distinct food and plate classes from the Roboflow PROJ3 v6 benchmark.
            </div>
          </div>
          <div className="fw-card border-border bg-surface">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Scientific Formula
            </div>
            <div className="mt-2 text-2xl font-bold text-primary">
              Waste Area Index
            </div>
            <div className="mt-1 text-xs text-text-secondary font-mono bg-background p-1.5 rounded text-[11px]">
              FoodArea / (PlateArea - GarbageArea) × 100
            </div>
          </div>
          <div className="fw-card border-border bg-surface">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Primary Sustainable Goal
            </div>
            <div className="mt-2 text-2xl font-bold text-accent">
              UN SDG 12.3
            </div>
            <div className="mt-1 text-xs text-text-secondary">
              Targeting 50% post-consumer food waste reduction at cafeteria, hotel, and institutional scale by 2030.
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-16 bg-surface border-y border-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              The Post-Consumer Food Waste Crisis
            </h2>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              Global food loss exceeds 1.3 billion tonnes annually. In institutional environments such as universities,
              corporate dining halls, and hospitals, up to 35% of served meals end up discarded as plate leftovers without
              structured quantification or actionable insight.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-background border border-border">
              <div className="text-3xl font-bold text-primary">35%</div>
              <div className="mt-1 text-xs font-semibold text-text-primary">Average Plate Waste</div>
              <p className="mt-1 text-[11px] text-text-secondary">Observed in university canteens prior to portion optimization interventions.</p>
            </div>
            <div className="p-5 rounded-xl bg-background border border-border">
              <div className="text-3xl font-bold text-accent">85 Classes</div>
              <div className="mt-1 text-xs font-semibold text-text-primary">Granular Detection</div>
              <p className="mt-1 text-[11px] text-text-secondary">Identifies rice, meat, greens, utensils, plates, and non-edibles with zero overlap error.</p>
            </div>
            <div className="p-5 rounded-xl bg-background border border-border">
              <div className="text-3xl font-bold text-warning">SDG 12.3</div>
              <div className="mt-1 text-xs font-semibold text-text-primary">Direct Alignment</div>
              <p className="mt-1 text-[11px] text-text-secondary">Continuous auditing delivers verifiable metrics for institutional sustainability compliance.</p>
            </div>
            <div className="p-5 rounded-xl bg-background border border-border">
              <div className="text-3xl font-bold text-text-primary">32ms</div>
              <div className="mt-1 text-xs font-semibold text-text-primary">Inference Latency</div>
              <p className="mt-1 text-[11px] text-text-secondary">Instantaneous edge execution at meal return belts and tray scraping stations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How FOODWISE AI Works */}
      <section id="methodology" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold tracking-wider text-primary uppercase">
            Four-Stage Intelligence Pipeline
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
            How FOODWISE AI Operates
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="fw-card bg-surface">
            <div className="w-8 h-8 rounded-lg bg-primary-light text-primary font-bold flex items-center justify-center text-sm mb-4">
              1
            </div>
            <h3 className="text-sm font-bold text-text-primary">Image Capture</h3>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed">
              Diners return trays to scraping stations where overhead cameras, webcams, or mobile audits capture high-resolution plate photographs.
            </p>
          </div>
          <div className="fw-card bg-surface">
            <div className="w-8 h-8 rounded-lg bg-primary-light text-primary font-bold flex items-center justify-center text-sm mb-4">
              2
            </div>
            <h3 className="text-sm font-bold text-text-primary">YOLOv11 Segmentation</h3>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed">
              Instance segmentation isolates individual food ingredients, plate boundaries, utensils, and non-edible napkins with pixel-level precision.
            </p>
          </div>
          <div className="fw-card bg-surface">
            <div className="w-8 h-8 rounded-lg bg-primary-light text-primary font-bold flex items-center justify-center text-sm mb-4">
              3
            </div>
            <h3 className="text-sm font-bold text-text-primary">Area Index Calculation</h3>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed">
              Boolean pixel-wise mask unions compute the exact Food Waste Area Index with automatic utensil exclusion and garbage subtraction safeguards.
            </p>
          </div>
          <div className="fw-card bg-surface">
            <div className="w-8 h-8 rounded-lg bg-primary-light text-primary font-bold flex items-center justify-center text-sm mb-4">
              4
            </div>
            <h3 className="text-sm font-bold text-text-primary">Predictive Interventions</h3>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed">
              Machine learning models forecast waste volumes across 7-to-30 day horizons, driving portion adjustments and kitchen prep optimizations.
            </p>
          </div>
        </div>
      </section>

      {/* Research & Attribution Section */}
      <section id="research" className="py-16 bg-surface border-t border-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Scientific Reference & Attribution
            </div>
            <h3 className="mt-2 text-xl font-bold text-text-primary">
              Food Waste Detection in Canteen Plates Using YOLOv11
            </h3>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed">
              Authored by <b>João Ferreira, Paulino Cerqueira, and Jorge Ribeiro</b>. Published in{' '}
              <i>Applied Sciences (MDPI)</i>, 2025, Vol. 15, Issue 13, 7137. DOI: 10.3390/app15137137.
              The underlying dataset comprises 1,180 annotated canteen plate photographs across 85 food categories.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://doi.org/10.3390/app15137137"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-background hover:bg-border text-text-primary text-xs font-medium border border-border transition-colors"
            >
              <span>View MDPI Paper</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              href="/dashboard/model"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors"
            >
              <span>Model Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-surface py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary text-white font-bold flex items-center justify-center text-[10px]">
              FW
            </div>
            <span className="font-semibold text-text-primary">FOODWISE AI</span>
            <span>— Institutional Food Waste Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-text-primary transition-colors">
              Platform Sign In
            </Link>
            <Link href="/dashboard" className="hover:text-text-primary transition-colors">
              Live Dashboard
            </Link>
            <Link href="/dashboard/model" className="hover:text-text-primary transition-colors">
              Research Specs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
