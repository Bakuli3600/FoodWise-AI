'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Download,
  RotateCcw,
  Layers,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { api } from '@/lib/api';

export default function DetectionPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'samples' | 'webcam'>('samples');
  const [sampleImages, setSampleImages] = useState<any[]>([]);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [cafeterias, setCafeterias] = useState<any[]>([]);
  const [selectedCafId, setSelectedCafId] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(12);

  // Inference state
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'annotated' | 'clustering' | 'original'>('annotated');

  // Webcam state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    api.getSamples().then((samples) => {
      setSampleImages(samples);
      if (samples.length > 0) {
        setSelectedSample(samples[0].filename);
      }
    }).catch(() => {});

    api.getCafeterias().then((cafs) => {
      setCafeterias(cafs);
      if (cafs.length > 0) setSelectedCafId(cafs[0].id);
    }).catch(() => {});
  }, []);

  // Handle webcam stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access webcam. Please verify camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      setFilePreview(URL.createObjectURL(f));
      setError(null);
    }
  };

  const handleRunInference = async () => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (selectedCafId) formData.append('cafeteria_id', String(selectedCafId));
    if (notes) formData.append('notes', notes);
    formData.append('conf_threshold', String(confidenceThreshold / 100));

    try {
      if (activeTab === 'upload') {
        if (!selectedFile) throw new Error('Please select an image file to upload.');
        formData.append('file', selectedFile);
      } else if (activeTab === 'samples') {
        if (!selectedSample) throw new Error('Please select a benchmark plate image.');
        formData.append('sample_filename', selectedSample);
      } else if (activeTab === 'webcam') {
        if (!videoRef.current) throw new Error('Webcam is not initialized.');
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to create canvas context.');
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        formData.append('webcam_base64', dataUrl);
        stopCamera();
      }

      const res = await api.predict(formData);
      setResult(res);
      setViewMode('annotated');
    } catch (err: any) {
      setError(err.message || 'Plate segmentation inference failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary tracking-tight">
              Plate Waste Detection & Instance Segmentation
            </h2>
            <span className="fw-badge fw-badge-success text-[10px]">
              YOLOv11-seg Active
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Extracts food polygons, excludes utensils, subtracts garbage, and calculates the Food Waste Area Index
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-danger text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Selection Card */}
      {!result && (
        <div className="fw-card bg-surface space-y-5">
          {/* Tabs */}
          <div className="flex items-center border-b border-border pb-3 gap-2">
            <button
              onClick={() => { setActiveTab('samples'); stopCamera(); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'samples'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Benchmark Samples</span>
            </button>
            <button
              onClick={() => { setActiveTab('upload'); stopCamera(); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'upload'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
            </button>
            <button
              onClick={() => { setActiveTab('webcam'); startCamera(); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'webcam'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Webcam</span>
            </button>
          </div>

          {/* Tab 1: Benchmark Samples */}
          {activeTab === 'samples' && (
            <div className="space-y-3">
              <div className="text-xs text-text-secondary">
                Select one of the official benchmark canteen plate test photographs from Ferreira et al. (PROJ3 v6):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sampleImages.map((s) => (
                  <div
                    key={s.filename}
                    onClick={() => setSelectedSample(s.filename)}
                    className={`p-2 rounded-xl border cursor-pointer transition-all ${
                      selectedSample === s.filename
                        ? 'border-primary ring-2 ring-primary/20 bg-primary-light/30'
                        : 'border-border bg-background hover:border-accent'
                    }`}
                  >
                    <div className="aspect-[4/3] rounded-lg bg-border overflow-hidden relative">
                      <img
                        src={s.image_url}
                        alt={s.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-text-primary truncate">
                      {s.filename}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Upload Image */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 text-center transition-colors">
                <input
                  type="file"
                  id="plate-file-input"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="plate-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-text-primary">
                    Click to upload plate image or drag and drop
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Supports high-resolution JPEG, PNG, WebP (max 15MB)
                  </div>
                </label>
              </div>

              {filePreview && (
                <div className="p-3 bg-background rounded-xl border border-border flex items-center gap-3">
                  <img src={filePreview} alt="Preview" className="w-16 h-12 rounded object-cover" />
                  <div className="text-xs text-text-primary font-medium">
                    {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(1)} KB)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Webcam */}
          {activeTab === 'webcam' && (
            <div className="space-y-3">
              <div className="aspect-video max-w-lg mx-auto bg-charcoal rounded-xl overflow-hidden relative flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!cameraActive && (
                  <button
                    onClick={startCamera}
                    className="absolute px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold shadow-md"
                  >
                    Activate Webcam
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Controls: Cafeteria & Confidence Sensitivity */}
          <div className="pt-3 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-text-secondary">
                  Dining Facility:
                </label>
                <select
                  value={selectedCafId}
                  onChange={(e) => setSelectedCafId(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-text-primary focus:outline-none"
                >
                  {cafeterias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Confidence Threshold Sensitivity Slider */}
              <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg border border-border">
                <label className="text-xs font-medium text-text-secondary whitespace-nowrap">
                  Confidence Threshold:
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-24 accent-primary cursor-pointer h-1.5 bg-border rounded-lg"
                  title="Confidence Sensitivity (5% to 50%)"
                />
                <span className="text-xs font-bold text-primary w-8">
                  {confidenceThreshold}%
                </span>
                <span className="text-[10px] text-text-muted hidden sm:inline">
                  (Recommended: 10–15%)
                </span>
              </div>
            </div>

            <button
              onClick={handleRunInference}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              <Scan className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Executing YOLOv11 Segmentation...' : 'Analyze Plate Waste'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Detection Results Interface */}
      {result && (
        <div className="space-y-6">
          {/* Actions & Rescan Bar */}
          <div className="flex items-center justify-between bg-surface p-3.5 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-primary">
                Inference Complete:
              </span>
              <span className="text-xs text-text-secondary">
                Detected {result.edible_items_count} edible food item(s) on plate.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={result.annotated_image_url}
                download={result.image_filename}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background hover:bg-border text-text-primary text-xs font-medium border border-border transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Annotated</span>
              </a>

              <button
                onClick={() => setResult(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Scan Another Plate</span>
              </button>
            </div>
          </div>

          {/* Visual Display & Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Viewer */}
            <div className="lg:col-span-2 fw-card bg-surface space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-text-primary">
                  Segmentation Visualization
                </div>
                {/* View Mode Buttons */}
                <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border">
                  <button
                    onClick={() => setViewMode('annotated')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      viewMode === 'annotated'
                        ? 'bg-surface text-primary shadow-xs font-semibold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Overlay
                  </button>
                  <button
                    onClick={() => setViewMode('clustering')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      viewMode === 'clustering'
                        ? 'bg-surface text-primary shadow-xs font-semibold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Masks Only
                  </button>
                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      viewMode === 'original'
                        ? 'bg-surface text-primary shadow-xs font-semibold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Original
                  </button>
                </div>
              </div>

              {/* Image Container */}
              <div className="aspect-[4/3] rounded-xl bg-charcoal overflow-hidden relative flex items-center justify-center">
                <img
                  src={
                    viewMode === 'annotated'
                      ? result.annotated_image_url
                      : viewMode === 'clustering'
                      ? result.clustering_image_url
                      : result.original_image_url
                  }
                  alt="Detection View"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-[11px] text-text-secondary flex items-center justify-between">
                <span>Model: {result.model_version}</span>
                <span>Dimensions: {result.image_dimensions ? `${result.image_dimensions[0]}x${result.image_dimensions[1]} px` : '640x640'}</span>
              </div>
            </div>

            {/* Waste Area Index Metric Gauge */}
            <div className="fw-card bg-surface flex flex-col justify-between space-y-4">
              <div>
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Food Waste Area Index
                </div>
                <div className="mt-2 text-4xl font-extrabold text-primary">
                  {result.waste_percentage}%
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  Estimated plate leftover surface coverage
                </div>

                <div className="mt-3 w-full h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.waste_percentage > 30 ? 'bg-danger' : result.waste_percentage > 18 ? 'bg-warning' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, result.waste_percentage)}%` }}
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 pt-3 border-t border-border text-xs">
                <div className="font-semibold text-text-primary text-[11px] uppercase tracking-wider mb-2">
                  Formula Breakdown
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Edible Food Area:</span>
                  <span className="font-mono font-medium text-text-primary">
                    {result.waste_analysis.food_area.toLocaleString()} px
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Plate Area:</span>
                  <span className="font-mono font-medium text-text-primary">
                    {result.waste_analysis.plate_area.toLocaleString()} px
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Garbage / Bone Subtraction:</span>
                  <span className="font-mono font-medium text-text-primary">
                    -{result.waste_analysis.garbage_area.toLocaleString()} px
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary font-semibold pt-1 border-t border-border">
                  <span>Usable Plate Area:</span>
                  <span className="font-mono text-primary">
                    {result.waste_analysis.usable_plate_area.toLocaleString()} px
                  </span>
                </div>
              </div>

              {/* Scientific Disclaimer Alert */}
              <div className="p-3 rounded-lg bg-background border border-border text-[11px] text-text-secondary space-y-1">
                <div className="font-semibold text-text-primary flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-accent" />
                  <span>Scientific Notice (2D Surface Area)</span>
                </div>
                <p className="leading-relaxed">
                  Metric represents visible 2D plate area coverage (Ferreira et al., Applied Sciences 2025). It does not quantify 3D volume or physical food weight in grams.
                </p>
              </div>
            </div>
          </div>

          {/* Detected Objects Table */}
          <div className="fw-card bg-surface space-y-3">
            <h3 className="text-sm font-bold text-text-primary">
              Individual Object Segmentations
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-background text-text-muted uppercase text-[10px] font-semibold border-y border-border">
                  <tr>
                    <th className="py-2.5 px-3">Item / Class</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Semantic Type</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3 text-right">Pixel Area</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.detected_objects.map((obj: any, idx: number) => (
                    <tr key={idx} className="hover:bg-background/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-text-primary capitalize">
                        {obj.class_name}
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary">
                        {obj.category}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`fw-badge ${
                            obj.is_edible
                              ? 'fw-badge-success'
                              : obj.class_name === 'plate'
                              ? 'fw-badge-neutral'
                              : 'fw-badge-warning'
                          }`}
                        >
                          {obj.semantic_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {(obj.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-text-secondary">
                        {obj.pixel_area.toLocaleString()} px
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
