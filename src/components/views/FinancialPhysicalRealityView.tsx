import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WorkItem } from '../../types/mplads';
import {
  GitCompare,
  Filter,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Info,
  Flame,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const FinancialPhysicalRealityView: React.FC = () => {
  const { openProjectDetail } = useAuth();
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [gapThreshold, setGapThreshold] = useState<number>(30);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      setLoading(true);
      const res = await api.getWorks({ limit: '100', sort_by: 'progress_gap', order: 'desc' });
      setWorks(res.items);
    } catch (err) {
      console.error('Failed to load reality dataset', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = works.filter((w) => {
    if (w.progress_gap < gapThreshold) return false;
    if (categoryFilter !== 'ALL' && w.work_type !== categoryFilter) return false;
    return true;
  });

  const redZoneWorks = works.filter((w) => w.financial_progress >= 70 && w.physical_progress <= 45);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Core Decision Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Empirical Milestone vs Fund Cross-Verification
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <span>Financial vs Physical Reality Engine</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-3xl">
            Detects severe statistical divergences where PFMS fund disbursements significantly outpace
            on-site Measurement Book (MB) physical milestone completion. Prevents "ghost asset" funding
            and unearned advances.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
            <span className="text-slate-600 font-medium">Min Disparity Gap:</span>
            <select
              value={gapThreshold}
              onChange={(e) => setGapThreshold(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer font-mono"
            >
              <option value="15">&gt; 15% Gap</option>
              <option value="25">&gt; 25% Gap</option>
              <option value="30">&gt; 30% Gap</option>
              <option value="40">&gt; 40% Gap</option>
              <option value="50">&gt; 50% Gap (Critical)</option>
            </select>
          </div>

          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
            <span className="text-slate-600 font-medium">Work Type:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sectors</option>
              <option value="Community Hall">Community Halls</option>
              <option value="Drinking Water">Drinking Water & RO</option>
              <option value="Rural Roads">Rural Roads</option>
              <option value="School Infrastructure">School Infrastructure</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Metric Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Red Zone Critical Works</div>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">
            {redZoneWorks.length}
          </div>
          <div className="text-[10px] text-rose-700 font-medium mt-0.5">
            Disbursement &gt; 70% with Physical &lt; 45%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">National Average Gap</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">8.4 pp</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
            Normal operational lag tolerance: ±10 pp
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Maximum Detected Gap</div>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">51.0 pp</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5 font-mono">
            Case MPL-1024 (Bankura, WB)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Capital at High Risk</div>
          <div className="text-2xl font-black text-amber-700 font-mono mt-1">₹142.8 Cr</div>
          <div className="text-[10px] text-amber-700 font-medium mt-0.5">
            Cumulative funds in &gt; 30% gap works
          </div>
        </div>
      </div>

      {/* Reality 2D Matrix / Visual Quadrants */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Disbursement vs Physical Execution Quadrant Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Hover over or click any point to open its Digital Twin inspection file.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-rose-600 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              Red Zone (&gt; 30% Gap)
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Normal Parity Zone
            </span>
          </div>
        </div>

        {/* Visual 2D Plot */}
        <div className="relative w-full h-72 bg-slate-50 rounded-xl border border-slate-200 p-4 overflow-hidden">
          {/* Parity Diagonal 45 degree line */}
          <div
            className="absolute left-0 bottom-0 w-[141%] h-0.5 bg-slate-300 transform origin-bottom-left rotate-45 border-dashed"
            title="Ideal Parity Line (Financial = Physical)"
          />

          {/* Red Zone Warning Box (Top Left Quadrant) */}
          <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-rose-500/10 border-t border-l border-rose-300 rounded-tl-xl flex items-start justify-end p-2 pointer-events-none">
            <span className="text-[10px] font-bold text-rose-700 font-mono uppercase bg-rose-100 px-2 py-0.5 rounded">
              High Anomaly Quadrant
            </span>
          </div>

          {/* Points */}
          {works.map((w) => {
            const isRed = w.progress_gap >= 30;
            const isBenchmark = w.work_id === 'MPL-1024';
            return (
              <div
                key={w.work_id}
                onClick={() => openProjectDetail(w.work_id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-150 z-10 group ${
                  isBenchmark ? 'z-30' : ''
                }`}
                style={{
                  left: `${Math.min(w.financial_progress, 98)}%`,
                  bottom: `${Math.min(w.physical_progress, 98)}%`,
                }}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[8px] text-white shadow-xs ${
                    isBenchmark
                      ? 'bg-rose-600 ring-4 ring-rose-400/50 w-5 h-5 animate-pulse'
                      : isRed
                      ? 'bg-rose-500'
                      : 'bg-slate-500'
                  }`}
                >
                  {isBenchmark ? '!' : ''}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none font-mono">
                  <div className="font-bold text-rose-300">
                    {w.work_id}: {w.title.slice(0, 24)}...
                  </div>
                  <div className="text-slate-300 text-[10px]">
                    Fin: {w.financial_progress}% | Phy: {w.physical_progress}% | Gap: +{w.progress_gap}pp
                  </div>
                </div>
              </div>
            );
          })}

          {/* Axes labels */}
          <div className="absolute bottom-2 left-4 text-[11px] font-mono text-slate-500">
            0% (Inception)
          </div>
          <div className="absolute bottom-2 right-4 text-[11px] font-mono font-bold text-blue-700">
            Financial Disbursement Progress → 100%
          </div>
          <div className="absolute top-2 left-4 text-[11px] font-mono font-bold text-amber-700">
            ↑ Physical Completion Progress (100%)
          </div>
        </div>
      </div>

      {/* Disparity Ranking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            Severe Progress Disparity Works (&gt; {gapThreshold}% Gap)
          </h3>
          <span className="text-xs font-mono font-bold text-slate-500">
            Showing {filtered.length} matching works
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Work ID & Title</th>
                <th className="py-2.5 px-3">District & State</th>
                <th className="py-2.5 px-3 text-center">Financial Progress</th>
                <th className="py-2.5 px-3 text-center">Physical Progress</th>
                <th className="py-2.5 px-3 text-center">Progress Reality Gap</th>
                <th className="py-2.5 px-3">Sanction vs Spent</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((w) => (
                <tr
                  key={w.work_id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    w.work_id === 'MPL-1024' ? 'bg-rose-50/40' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <button
                      onClick={() => openProjectDetail(w.work_id)}
                      className="font-bold text-slate-900 hover:text-blue-700 text-left"
                    >
                      <span className="font-mono text-blue-700 mr-1.5">{w.work_id}</span>
                      <span>{w.title}</span>
                    </button>
                    <div className="text-[11px] text-slate-500">{w.work_type}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{w.district_name}</div>
                    <div className="text-[11px] text-slate-500">{w.state_name}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-blue-700">
                    {w.financial_progress}%
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">
                    {w.physical_progress}%
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-mono font-extrabold text-xs">
                      +{w.progress_gap} pp
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="font-semibold text-slate-900">₹{w.expenditure}L</div>
                    <div className="text-slate-500">Sanct: ₹{w.sanctioned_cost}L</div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => openProjectDetail(w.work_id)}
                      className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs inline-flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
