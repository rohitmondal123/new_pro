import React, { useEffect, useState } from 'react';
import { AlertRecord } from '../types/mplads';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertUpdated?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onAlertUpdated,
}) => {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const { openProjectDetail, currentUser } = useAuth();

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId, 'Acknowledged by officer via telemetry tray', currentUser.name);
      loadAlerts();
      if (onAlertUpdated) onAlertUpdated();
    } catch (err) {
      console.error('Failed to acknowledge alert', err);
    }
  };

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.severity === filter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md theme-surface h-full shadow-2xl flex flex-col border-l theme-border animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div
          className="p-4 text-white flex items-center justify-between transition-colors"
          style={{
            backgroundColor: 'var(--app-topbar-bg)',
            color: 'var(--app-topbar-text)',
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">Active Risk Signals & Alerts</h2>
              <p className="text-[11px] opacity-75">
                Live automated anomalies detected by AI Monitoring Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg opacity-75 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 p-2.5 theme-surface-subtle border-b theme-border text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filter === 'ALL'
                ? 'theme-surface theme-text shadow-xs font-bold border theme-border'
                : 'text-slate-500 hover:theme-text'
            }`}
          >
            All Signals ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filter === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            Critical ({alerts.filter((a) => a.severity === 'CRITICAL').length})
          </button>
          <button
            onClick={() => setFilter('HIGH')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filter === 'HIGH'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            High ({alerts.filter((a) => a.severity === 'HIGH').length})
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 theme-bg">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading risk signals...</div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No active alerts in this category.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.severity === 'CRITICAL';
              return (
                <div
                  key={alert.alert_id}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    isCritical
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-950 dark:text-rose-200'
                      : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                          isCritical
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {alert.severity} • RISK {alert.risk_score}
                      </span>
                      <span className="text-[10px] opacity-75 font-medium">
                        {alert.district_name}, {alert.state_name}
                      </span>
                    </div>
                    <span className="text-[10px] opacity-60 font-mono">
                      {alert.created_at.slice(11, 16)}
                    </span>
                  </div>

                  <h3 className="font-bold theme-text text-xs mb-1">
                    {alert.work_id}: {alert.work_title}
                  </h3>
                  <p className="text-[11px] opacity-80 leading-relaxed mb-3">
                    {alert.reason}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t theme-border">
                    <button
                      onClick={() => {
                        openProjectDetail(alert.work_id);
                        onClose();
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Digital Twin</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    {alert.status === 'NEW' ? (
                      <button
                        onClick={() => handleAcknowledge(alert.alert_id)}
                        className="text-[11px] px-2.5 py-1 rounded-md theme-surface border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 font-medium theme-text transition-colors cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Under Review
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 theme-surface-subtle border-t theme-border text-center text-[11px] text-slate-500">
          Statutory Notice: All signals are AI-derived risk indicators for administrative inspection.
        </div>
      </div>
    </div>
  );
};
