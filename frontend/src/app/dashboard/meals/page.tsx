'use client';

import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Scale
} from 'lucide-react';
import { api } from '@/lib/api';

export default function MealsPage() {
  const [meals, setMeals] = useState<any[]>([]);
  const [cafeterias, setCafeterias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [cafId, setCafId] = useState<number | undefined>(undefined);
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionName, setSessionName] = useState<string>('Lunch');
  const [menuItemsText, setMenuItemsText] = useState<string>('Rice, Grilled Chicken, Steamed Vegetables');
  const [served, setServed] = useState<number>(320);
  const [returned, setReturned] = useState<number>(305);
  const [weightKg, setWeightKg] = useState<number>(18.5);

  const fetchMeals = () => {
    setLoading(true);
    api.getMeals()
      .then((data) => {
        setMeals(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMeals();
    api.getCafeterias().then((cafs) => {
      setCafeterias(cafs);
      if (cafs.length > 0) setCafId(cafs[0].id);
    }).catch(() => {});
  }, []);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafId) return;
    try {
      const items = menuItemsText.split(',').map((s) => s.trim()).filter(Boolean);
      await api.recordMeal({
        cafeteria_id: cafId,
        meal_date: dateStr,
        meal_session: sessionName,
        menu_items: items,
        plates_served: served,
        plates_returned: returned,
        waste_weight_grams: weightKg * 1000,
      });
      setIsModalOpen(false);
      fetchMeals();
    } catch (err: any) {
      alert(err.message || 'Failed to record meal');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-base font-bold text-text-primary tracking-tight">
            Meal Sessions & Dining Service Logs
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Audit plates served vs returned and physical scale measurements (strictly separate from 2D pixel area index)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Meal Session</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 rounded-xl bg-background border border-border text-xs text-text-secondary flex items-start gap-3">
        <Scale className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <b>Operational Protocol:</b> Physical waste weight measurements logged below originate from dining hall scale bins.
          To maintain strict scientific validity (Ferreira et al., Applied Sciences 2025), weight values are tracked independently
          and are never conflated with the 2D computer vision Food Waste Area Index.
        </p>
      </div>

      {/* Table */}
      <div className="fw-card bg-surface overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background text-text-muted uppercase text-[10px] font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Cafeteria ID</th>
                <th className="py-3 px-4">Plates Served</th>
                <th className="py-3 px-4">Plates Returned</th>
                <th className="py-3 px-4">Scrape Weight</th>
                <th className="py-3 px-4">Menu Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {meals.map((m) => (
                <tr key={m.id} className="hover:bg-background/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-medium text-text-primary">
                    {m.meal_date}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`fw-badge ${
                        m.meal_session === 'Breakfast'
                          ? 'fw-badge-warning'
                          : m.meal_session === 'Lunch'
                          ? 'fw-badge-success'
                          : 'fw-badge-neutral'
                      }`}
                    >
                      {m.meal_session}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-text-muted">
                    CAF-{m.cafeteria_id}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-text-primary">
                    {m.plates_served.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-text-primary">
                    {m.plates_returned.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-text-primary font-semibold">
                    {m.waste_weight_grams ? `${(m.waste_weight_grams / 1000).toFixed(1)} kg` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-4 text-text-secondary truncate max-w-xs">
                    {m.menu_items?.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary">
                Record Meal Session Service
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-text-muted hover:text-text-primary rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecord} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-text-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Session</label>
                  <select
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-text-primary"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Evening Snacks">Evening Snacks</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Facility</label>
                <select
                  value={cafId}
                  onChange={(e) => setCafId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-text-primary"
                >
                  {cafeterias.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Served</label>
                  <input
                    type="number"
                    required
                    value={served}
                    onChange={(e) => setServed(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-text-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Returned</label>
                  <input
                    type="number"
                    required
                    value={returned}
                    onChange={(e) => setReturned(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-text-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Menu Items (comma-separated)</label>
                <input
                  type="text"
                  value={menuItemsText}
                  onChange={(e) => setMenuItemsText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-text-primary"
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
                  Save Meal Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
