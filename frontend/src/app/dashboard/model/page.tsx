'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Layers,
  FileText,
  ExternalLink,
  CheckCircle2,
  Cpu,
  Database,
  Code2
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ModelInfoPage() {
  const [info, setInfo] = useState<any | null>(null);

  useEffect(() => {
    api.getModelInfo().then(setInfo).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-base font-bold text-text-primary tracking-tight">
            YOLOv11 Architecture & Scientific Research Specifications
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Technical specifications, evaluation benchmarks, and peer-reviewed research attribution
          </p>
        </div>
      </div>

      {/* Model Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Architecture Type
          </div>
          <div className="mt-1 text-sm font-bold text-text-primary truncate">
            YOLOv11 Instance Seg.
          </div>
          <div className="text-[10px] text-text-secondary">
            C3k2 + SPPF + C2PSA
          </div>
        </div>

        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Segmentation mAP50
          </div>
          <div className="mt-1 text-2xl font-bold text-primary">
            {info?.evaluation_metrics?.mask_map50 ? `${(info.evaluation_metrics.mask_map50 * 100).toFixed(1)}%` : '80.6%'}
          </div>
          <div className="text-[10px] text-text-secondary">
            PROJ3 v6 benchmark
          </div>
        </div>

        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Bounding Box mAP50
          </div>
          <div className="mt-1 text-2xl font-bold text-text-primary">
            {info?.evaluation_metrics?.box_map50 ? `${(info.evaluation_metrics.box_map50 * 100).toFixed(1)}%` : '83.5%'}
          </div>
          <div className="text-[10px] text-text-secondary">
            Object localization
          </div>
        </div>

        <div className="fw-card bg-surface">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Inference Latency
          </div>
          <div className="mt-1 text-2xl font-bold text-accent">
            {info?.evaluation_metrics?.mean_inference_time_ms ?? 32.4} ms
          </div>
          <div className="text-[10px] text-text-secondary">
            640x640 input resolution
          </div>
        </div>
      </div>

      {/* Architectural Deep-Dive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="fw-card bg-surface space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary border-b border-border pb-2.5">
            <Cpu className="w-4 h-4 text-primary" />
            <span>Neural Network Topology</span>
          </div>

          <div className="space-y-2 text-xs text-text-secondary">
            <div>
              <b className="text-text-primary">Backbone:</b> {info?.architecture?.backbone || 'Enhanced CSPDarknet with C3k2 blocks optimizing gradient flow and receptive fields.'}
            </div>
            <div>
              <b className="text-text-primary">Neck:</b> {info?.architecture?.neck || 'Path Aggregation Network (PANet) with SPPF and C2PSA attention modules.'}
            </div>
            <div>
              <b className="text-text-primary">Head:</b> {info?.architecture?.head || 'Decoupled classification, regression, and prototype mask branch for instance segmentation.'}
            </div>
            <div>
              <b className="text-text-primary">Active Checkpoint:</b> <span className="font-mono text-primary font-semibold">models/best.pt</span>
            </div>
          </div>
        </div>

        <div className="fw-card bg-surface space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary border-b border-border pb-2.5">
            <Database className="w-4 h-4 text-accent" />
            <span>Dataset & Training Configuration</span>
          </div>

          <div className="space-y-2 text-xs text-text-secondary">
            <div>
              <b className="text-text-primary">Dataset:</b> Roboflow PROJ3 Food Waste Dataset (Version 6)
            </div>
            <div>
              <b className="text-text-primary">Total Classes:</b> 85 distinct items (rice, chicken, greens, utensils, plates, garbage)
            </div>
            <div>
              <b className="text-text-primary">Splits:</b> 60% Train (708 images), 23% Val (271 images), 17% Test (201 images)
            </div>
            <div>
              <b className="text-text-primary">Loss Formulation:</b> Complete IoU (CIoU), Distribution Focal Loss (DFL), BCE Mask Segmentation Loss
            </div>
          </div>
        </div>
      </div>

      {/* Academic Citation Card */}
      <div className="fw-card bg-surface space-y-3 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">
              Primary Academic Publication
            </h3>
          </div>
          <span className="fw-badge fw-badge-neutral text-[10px]">Peer-Reviewed</span>
        </div>

        <div className="p-3 bg-background rounded-lg border border-border text-xs text-text-secondary space-y-1.5">
          <div className="font-semibold text-text-primary">
            &ldquo;Food Waste Detection in Canteen Plates Using YOLOv11&rdquo;
          </div>
          <div>
            <b>Authors:</b> João Ferreira, Paulino Cerqueira, Jorge Ribeiro
          </div>
          <div>
            <b>Journal:</b> <i>Applied Sciences</i> (MDPI), 2025, 15(13), 7137.
          </div>
          <div>
            <b>DOI:</b>{' '}
            <a
              href="https://doi.org/10.3390/app15137137"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-mono"
            >
              10.3390/app15137137
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <a
            href="https://github.com/joaopferreira19/Food-Waste-Detection-using-YOLOv11"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary font-medium"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Official Research GitHub</span>
            <ExternalLink className="w-3 h-3 text-text-muted" />
          </a>

          <a
            href="https://universe.roboflow.com/project-eyfif/proj3-food-waste-detection"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary font-medium"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Roboflow Universe Benchmark</span>
            <ExternalLink className="w-3 h-3 text-text-muted" />
          </a>
        </div>
      </div>
    </div>
  );
}
