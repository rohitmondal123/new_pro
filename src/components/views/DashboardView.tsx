import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardMetrics, WorkItem, AlertRecord } from '../../types/mplads';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Building2,
  Layers,
  ArrowRight,
  FileCheck2,
  Activity,
  BarChart2,
  ChevronRight,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { openProjectDetail, setActiveRoute, currentUser } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [recentAlerts, setRecentAlerts] = useState<AlertRecord[]>([]);

  useEffect(() => {
    loadData();
  }, [selectedState, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard({
        state: selectedState,
        work_type: selectedCategory,
      });
      setMetrics(data);
      const alerts = await api.getAlerts();
      setRecentAlerts(alerts.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const pulse = metrics?.pulse_score || {
    overall: 82,
    financial_health: 88,
    project_execution: 76,
    timeliness: 71,
    compliance: 91,
    asset_creation: 84,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-xl theme-surface border theme-border shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Works</div>
          <div className="text-xl font-extrabold theme-text mt-1 font-mono">52,480</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Active Central Works</div>
        </div>

        <div className="p-3.5 rounded-xl theme-surface border theme-border shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Sanctioned</div>
          <div className="text-xl font-extrabold theme-text mt-1 font-mono">₹6,420 Cr</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">Approved Budget</div>
        </div>

        <div className="p-3.5 rounded-xl theme-surface border theme-border shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Expenditure</div>
          <div className="text-xl font-extrabold text-[#FF671F] mt-1 font-mono">₹4,820 Cr</div>
          <div className="text-[10px] text-[#FF671F] font-medium mt-0.5">Disbursed via PFMS</div>
        </div>

        <div className="p-3.5 rounded-xl theme-surface border theme-border shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Fund Utilization</div>
          <div className="text-xl font-extrabold theme-text mt-1 font-mono">75.1%</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Target: 70%+</div>
        </div>

        <div className="p-3.5 rounded-xl theme-surface border theme-border shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Completed</div>
          <div className="text-xl font-extrabold text-[#138808] mt-1 font-mono">38,920</div>
          <div className="text-[10px] text-[#138808] font-medium mt-0.5">Assets Created</div>
        </div>

        <div className="p-3.5 rounded-xl theme-surface border theme-border shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Delayed Works</div>
          <div className="text-xl font-extrabold text-amber-600 mt-1 font-mono">4,210</div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Past Target SLA</div>
        </div>

        <div className="p-3.5 rounded-xl theme-surface border theme-border shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">High Risk</div>
          <div className="text-xl font-extrabold text-orange-600 mt-1 font-mono">710</div>
          <div className="text-[10px] text-orange-600 font-medium mt-0.5">Score &gt;= 60</div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 shadow-xs">
          <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase">Critical Alerts</div>
          <div className="text-xl font-extrabold text-rose-700 dark:text-rose-400 mt-1 font-mono">186</div>
          <div className="text-[10px] text-rose-700 dark:text-rose-300 font-medium mt-0.5">Immediate Review</div>
        </div>
      </div>

      {/* Row 2: MPLADS Pulse Score & Investigation Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MPLADS Pulse Score (Signature Feature #10) */}
        <div className="theme-surface p-5 rounded-2xl border theme-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <div
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--app-brand-accent)' }}
              >
                National Health Gauge
              </div>
              <h3 className="text-base font-extrabold theme-text">MPLADS Pulse Score</h3>
            </div>
            <span className="text-xs bg-emerald-50 text-[#138808] font-bold px-2 py-0.5 rounded-full font-mono border border-emerald-200">
              HEALTHY • 82%
            </span>
          </div>

          <div className="my-6 flex items-center justify-center gap-6">
            {/* Radial circular indicator */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-700 transition-all duration-1000 ease-out"
                  strokeDasharray={`${pulse.overall}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-3xl font-black text-slate-900 font-mono">{pulse.overall}</div>
                <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                  PULSE / 100
                </div>
              </div>
            </div>

            {/* Sub-component bars */}
            <div className="flex-1 space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-0.5">
                  <span>Financial Health</span>
                  <span className="font-mono text-blue-700">{pulse.financial_health}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${pulse.financial_health}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-0.5">
                  <span>Project Execution</span>
                  <span className="font-mono text-emerald-700">{pulse.project_execution}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${pulse.project_execution}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-0.5">
                  <span>Timeliness</span>
                  <span className="font-mono text-amber-700">{pulse.timeliness}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${pulse.timeliness}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-0.5">
                  <span>Compliance</span>
                  <span className="font-mono text-indigo-700">{pulse.compliance}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${pulse.compliance}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-0.5">
                  <span>Asset Creation</span>
                  <span className="font-mono text-teal-700">{pulse.asset_creation}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${pulse.asset_creation}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Filter: {selectedState}</span>
            <button
              onClick={() => setActiveRoute('analytics')}
              className="text-blue-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Component Breakdown</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* AI Investigation Queue Summary Card (Signature Feature #21) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  Centerpiece Engine
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  AI Investigation Queue
                </h3>
              </div>
              <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded font-mono">
                37 REQUIRE ATTENTION
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Projects ranked by composite risk score, progress disparity, and delay probability for
              statutory officer review.
            </p>

            <div className="mt-3 space-y-2">
              <div
                onClick={() => openProjectDetail('MPL-1024')}
                className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-100/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-rose-950 font-mono">#1 MPL-1024 (Bankura)</span>
                  <span className="text-rose-700 font-mono">RISK 94 • INSPECT FIRST</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                  Financial/Physical 51% Mismatch • Cost +82.8%
                </div>
              </div>

              <div
                onClick={() => openProjectDetail('MPL-3321')}
                className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-950 font-mono">#2 MPL-3321 (Varanasi)</span>
                  <span className="text-amber-700 font-mono">RISK 91 • INSPECT FIRST</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                  Cost Anomaly +56% • 98% Disbursed vs 52% Work
                </div>
              </div>

              <div
                onClick={() => openProjectDetail('MPL-5512')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 font-mono">#3 MPL-5512 (Nagpur)</span>
                  <span className="text-blue-700 font-mono">RISK 87 • REVIEW</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                  Rural Link Road • 98 Days Delay Slippage
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveRoute('queue')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>VIEW FULL INVESTIGATION QUEUE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: State Risk Rankings & Work Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State Risk Ranking Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Comparative Analytics
              </div>
              <h3 className="text-base font-extrabold text-slate-900">State Risk & Utilization Ranking</h3>
            </div>
            <button
              onClick={() => setActiveRoute('map')}
              className="text-xs text-blue-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Open India Risk Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">State Name</th>
                  <th className="py-2.5 px-3">Total Works</th>
                  <th className="py-2.5 px-3">Fund Utilization</th>
                  <th className="py-2.5 px-3">Average Risk Score</th>
                  <th className="py-2.5 px-3">Critical Alerts</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics?.state_rankings.map((st, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{st.state_name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{st.total_works.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                      {st.utilization_pct}%
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          st.avg_risk >= 45
                            ? 'bg-rose-100 text-rose-800'
                            : st.avg_risk >= 35
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {st.avg_risk}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-rose-600 font-bold">{st.critical_count}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedState(st.state_name);
                          setActiveRoute('projects');
                        }}
                        className="text-blue-700 hover:text-blue-900 font-semibold"
                      >
                        Filter Works
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Work Category Risk Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Sector Analysis</div>
            <h3 className="text-base font-extrabold text-slate-900 mb-3">Work Category Risk Exposure</h3>

            <div className="space-y-3 text-xs">
              {metrics?.work_categories.map((cat, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center mb-1 font-semibold text-slate-800">
                    <span className="truncate">{cat.category}</span>
                    <span className="font-mono text-slate-500 text-[11px]">₹{cat.total_funds_cr} Cr</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>{cat.count.toLocaleString()} projects</span>
                    <span className="font-mono text-rose-700 font-bold">{cat.risk_rate}% Flagged</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 rounded-full"
                      style={{ width: `${cat.risk_rate * 3}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Highest risk in civil works</span>
            <button
              onClick={() => setActiveRoute('cost-anomaly')}
              className="text-blue-700 font-bold hover:underline"
            >
              Analyze Cost Deviations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
