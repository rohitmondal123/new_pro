import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DashboardMetrics } from '../../types/mplads';
import { BarChart3, TrendingUp, DollarSign, Layers, PieChart, CheckCircle2 } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Macro Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">
              National Time-Series & Expenditure Velocity
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Analytics & Trend Hub
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Longitudinal trend analytics of central fund disbursements, completion rates, and
            anomaly decay rates across consecutive Lok Sabha tenures.
          </p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trend 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Monthly Fund Disbursement Velocity (₹ Crores)
            </h3>
            <p className="text-xs text-slate-500">
              PFMS central tranche flows vs seasonal milestones.
            </p>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { month: 'Apr', val: 320, pct: 50 },
              { month: 'May', val: 410, pct: 64 },
              { month: 'Jun', val: 380, pct: 59 },
              { month: 'Jul', val: 290, pct: 45 },
              { month: 'Aug', val: 310, pct: 48 },
              { month: 'Sep', val: 490, pct: 76 },
              { month: 'Oct', val: 560, pct: 87 },
              { month: 'Nov', val: 640, pct: 100 },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="font-mono text-[10px] text-slate-500 font-bold">₹{bar.val}</span>
                <div
                  className="w-full bg-blue-600 rounded-t-lg transition-all duration-500 hover:bg-blue-700"
                  style={{ height: `${bar.pct}%` }}
                />
                <span className="font-mono text-[10px] text-slate-600">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Anomaly Resolution & Inspection Rate
            </h3>
            <p className="text-xs text-slate-500">
              Average days to inspect flagged projects by state vigilance cells.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { label: 'Within 7 Days of AI Flag', count: '42% of works', color: 'bg-emerald-600', w: '42%' },
              { label: 'Within 14 Days', count: '31% of works', color: 'bg-blue-600', w: '31%' },
              { label: 'Within 30 Days', count: '18% of works', color: 'bg-amber-500', w: '18%' },
              { label: 'Exceeding 30 Days SLA', count: '9% of works', color: 'bg-rose-600', w: '9%' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>{item.label}</span>
                  <span className="font-mono text-slate-600">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: item.w }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
