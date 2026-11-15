'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { api } from '@/lib/api';

export default function HistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minWaste, setMinWaste] = useState<number | undefined>(undefined);
  const [maxWaste, setMaxWaste] = useState<number | undefined>(undefined);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory({
        search: searchTerm || undefined,
        min_waste: minWaste,
        max_waste: maxWaste,
        limit: 100,
      });
      setRecords(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [searchTerm, minWaste, maxWaste]);

  const handleDelete = async (id: number) => {
    try {
      await api.deleteHistory(id);
      setDeleteConfirmId(null);
      setSelectedRecord(null);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-base font-bold text-text-primary tracking-tight">
            Detection History & Plate Audit Logs
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Archived inference records, food categories, and calculated waste area indices
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="fw-card bg-surface p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative rounded-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by food class (e.g. rice, chicken, vegetables)..."
              className="block w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
            />
          </div>

          {/* Min Waste Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary whitespace-nowrap">Min Waste (%):</span>
            <input
              type="number"
              min={0}
              max={100}
              value={minWaste ?? ''}
              onChange={(e) => setMinWaste(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="0"
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-text-primary"
            />
          </div>

          {/* Max Waste Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary whitespace-nowrap">Max Waste (%):</span>
            <input
              type="number"
              min={0}
              max={100}
              value={maxWaste ?? ''}
              onChange={(e) => setMaxWaste(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="100"
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-text-primary"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="fw-card bg-surface overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background text-text-muted uppercase text-[10px] font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Thumbnail</th>
                <th className="py-3 px-4">Scan ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Detected Classes</th>
                <th className="py-3 px-4">Waste Area (%)</th>
                <th className="py-3 px-4">Usable Area (px)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-background/50 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="w-12 h-9 rounded bg-border overflow-hidden relative">
                      <img
                        src={r.annotated_image_path || r.original_image_path}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium text-text-primary">
                    #{r.id}
                  </td>
                  <td className="py-2.5 px-4 text-text-secondary">
                    {r.timestamp}
                  </td>
                  <td className="py-2.5 px-4 text-text-primary font-medium capitalize">
                    {r.detected_classes.slice(0, 3).join(', ')}
                    {r.detected_classes.length > 3 && ` +${r.detected_classes.length - 3}`}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`font-semibold ${
                        r.waste_percentage > 30 ? 'text-danger' : r.waste_percentage > 18 ? 'text-warning' : 'text-primary'
                      }`}
                    >
                      {r.waste_percentage}%
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-text-secondary">
                    {(r.plate_area - r.garbage_area).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedRecord(r)}
                      className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-primary-light transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(r.id)}
                      className="p-1.5 rounded text-text-secondary hover:text-danger hover:bg-red-50 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-text-muted">
                    No plate scan audit records matching current query parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary">
                Audit Record #{selectedRecord.id} — Detailed Telemetry
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 text-text-muted hover:text-text-primary rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-[4/3] rounded-lg bg-charcoal overflow-hidden">
              <img
                src={selectedRecord.annotated_image_path || selectedRecord.original_image_path}
                alt="Audit Detail"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-background p-3 rounded-lg border border-border">
              <div>
                <span className="text-text-muted">Timestamp:</span>{' '}
                <span className="font-medium text-text-primary">{selectedRecord.timestamp}</span>
              </div>
              <div>
                <span className="text-text-muted">Food Waste Area Index:</span>{' '}
                <span className="font-bold text-primary">{selectedRecord.waste_percentage}%</span>
              </div>
              <div>
                <span className="text-text-muted">Edible Food Pixels:</span>{' '}
                <span className="font-mono text-text-primary">{selectedRecord.food_area.toLocaleString()} px</span>
              </div>
              <div>
                <span className="text-text-muted">Plate Boundary Pixels:</span>{' '}
                <span className="font-mono text-text-primary">{selectedRecord.plate_area.toLocaleString()} px</span>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <div className="font-semibold text-text-primary">Detected Classes:</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedRecord.detected_classes.map((c: string, idx: number) => (
                  <span key={idx} className="fw-badge fw-badge-neutral capitalize">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-lg bg-background hover:bg-border text-text-primary text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-text-primary">
              Confirm Record Deletion
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to permanently delete audit record #{deleteConfirmId}? This will remove its associated segmentation polygons from longitudinal reporting.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-lg bg-background text-text-primary text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 rounded-lg bg-danger text-white text-xs font-semibold"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
