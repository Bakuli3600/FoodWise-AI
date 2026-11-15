'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Users,
  MapPin,
  CheckCircle2,
  Trash2,
  X
} from 'lucide-react';
import { api } from '@/lib/api';

export default function CafeteriasPage() {
  const [cafeterias, setCafeterias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(600);

  const fetchCafeterias = () => {
    setLoading(true);
    api.getCafeterias()
      .then((data) => {
        setCafeterias(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCafeterias();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCafeteria({
        name,
        code,
        campus_location: location,
        daily_capacity: capacity,
      });
      setIsModalOpen(false);
      setName('');
      setCode('');
      setLocation('');
      fetchCafeterias();
    } catch (err: any) {
      alert(err.message || 'Failed to create cafeteria');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this dining facility?')) {
      try {
        await api.deleteCafeteria(id);
        fetchCafeterias();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-base font-bold text-text-primary tracking-tight">
            Dining Facilities & Cafeteria Management
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure institutional dining halls, dining capacity, and audit station bindings
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Dining Facility</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cafeterias.map((caf) => (
          <div key={caf.id} className="fw-card bg-surface space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-background border border-border text-text-muted">
                  {caf.code}
                </span>
                <h3 className="mt-2 text-sm font-bold text-text-primary">
                  {caf.name}
                </h3>
              </div>
              <button
                onClick={() => handleDelete(caf.id)}
                className="p-1 text-text-muted hover:text-danger rounded transition-colors"
                title="Delete Facility"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-text-secondary pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                <span>{caf.campus_location || 'Campus Center'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-text-muted" />
                <span>Capacity: {caf.daily_capacity.toLocaleString()} diners / day</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span className="capitalize font-medium text-text-primary">Status: {caf.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary">
                Register New Dining Facility
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-text-muted hover:text-text-primary rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Cafeteria Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. South Campus Dining Hall"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Facility Code
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CAF-SOUTH"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-text-primary uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Campus Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Science Complex, Level 1"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Daily Diner Capacity
                </label>
                <input
                  type="number"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-background text-text-primary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
