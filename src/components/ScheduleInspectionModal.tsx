import React, { useState } from 'react';
import { WorkItem } from '../types/mplads';
import { api } from '../services/api';
import { X, Calendar, UserCheck, ShieldCheck, MapPin } from 'lucide-react';

interface ScheduleInspectionModalProps {
  work: WorkItem | null;
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
}

export const ScheduleInspectionModal: React.FC<ScheduleInspectionModalProps> = ({
  work,
  isOpen,
  onClose,
  onScheduled,
}) => {
  const [officerName, setOfficerName] = useState('Er. Tanmoy Roy, EE (Rural Works)');
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(
    'Special joint physical verification ordered. Check foundation columns, MB entries for Tranche 2 & 3, and take geo-tagged photos.'
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !work) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.scheduleInspection({
        work_id: work.work_id,
        officer_name: officerName,
        target_date: targetDate,
        notes: notes,
      });
      onScheduled();
      onClose();
    } catch (err) {
      console.error('Failed to schedule inspection', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="theme-surface w-full max-w-lg rounded-2xl shadow-2xl border theme-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div
          className="text-white px-5 py-3.5 flex items-center justify-between transition-colors"
          style={{
            backgroundColor: 'var(--app-topbar-bg)',
            color: 'var(--app-topbar-text)',
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Schedule Statutory Field Inspection</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg opacity-75 hover:opacity-100 hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 theme-surface-subtle border theme-border rounded-xl theme-text">
            <div className="font-bold">{work.work_id}: {work.title}</div>
            <div className="text-[11px] theme-text-secondary mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {work.location}
            </div>
            <div className="mt-1 text-[11px] font-mono text-rose-600 dark:text-rose-400 font-bold">
              Current Risk Score: {work.risk_score}/100 ({work.risk_severity})
            </div>
          </div>

          <div>
            <label className="block theme-text font-semibold mb-1">
              Designated Inspection Officer / Authority:
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border theme-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none theme-surface-subtle theme-text"
              />
            </div>
          </div>

          <div>
            <label className="block theme-text font-semibold mb-1">
              Mandated Inspection Date:
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border theme-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none theme-surface-subtle theme-text"
              />
            </div>
          </div>

          <div>
            <label className="block theme-text font-semibold mb-1">
              Terms of Reference & Verification Instructions:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 border theme-border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none theme-surface-subtle theme-text"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border theme-border rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer hover:opacity-95 text-white"
              style={{
                backgroundColor: 'var(--app-brand-accent)',
                color: 'var(--app-brand-accent-text)',
              }}
            >
              <span>{submitting ? 'Scheduling...' : 'Confirm & Issue Inspection Notice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
