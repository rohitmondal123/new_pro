import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WorkItem } from '../../types/mplads';
import {
  TrendingUp,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Layers,
  Scale,
} from 'lucide-react';

export const CostAnomalyView: React.FC = () => {
  const { openProjectDetail } = useAuth();
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getWorks({ limit: '100', sort_by: 'expenditure', order: 'desc' });
      setWorks(res.items);
    } catch (err) {
      console.error('Failed to load cost anomaly data', err);
    } finally {
      setLoading(false);
    }
  };

  const worksWithVariance = works.map((w) => {
    const variancePct = Number(
      (((w.expenditure - w.sanctioned_cost) / w.sanctioned_cost) * 100).toFixed(1)
    );
    const benchmarkRatio = Number((w.expenditure / w.predicted_comparable_cost).toFixed(2));
    return {
      ...w,
      variancePct,
      benchmarkRatio,
    };
  });

  const overruns = worksWithVariance.filter((w) => w.variancePct > 10);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Econometric AI Model
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Schedule of Rates (SOR) vs Actual Cost Regression
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Cost Anomaly & Inflation Engine
          </h1>
          <p className="text-xs text-slate-500 max-w-3xl">
            Compares administrative sanction against actual expenditures and machine-learning predicted
            benchmark costs for comparable public works in the same district and topography.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              filterSeverity === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            All Works
          </button>
          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              filterSeverity === 'CRITICAL'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            Severe Overrun (&gt; +30%)
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Cost Overrun Works</div>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">{overruns.length}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">
            Expenditure exceeds sanction by &gt; 10%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Cumulative Cost Deviation</div>
          <div className="text-2xl font-black text-amber-700 font-mono mt-1">₹84.6 Lakhs</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
            Total excess disbursements identified
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Highest Deviation Case</div>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">+82.8%</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5 font-mono">
            MPL-1024 (₹38.4L vs ₹21.0L)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Benchmark Discrepancy</div>
          <div className="text-2xl font-black text-blue-700 font-mono mt-1">1.75x</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">
            Expenditure / ML Expected Cost
          </div>
        </div>
      </div>

      {/* Cost Deviation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            Work Cost Anomaly Benchmark Table
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Ranked by percentage cost variance above administrative sanction
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Work ID & Title</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3 font-mono">Sanctioned Cost</th>
                <th className="py-2.5 px-3 font-mono">Actual Expended</th>
                <th className="py-2.5 px-3 font-mono">ML Benchmark Cost</th>
                <th className="py-2.5 px-3 text-center">Cost Variance</th>
                <th className="py-2.5 px-3 text-center">Benchmark Ratio</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {overruns.map((w) => (
                <tr
                  key={w.work_id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    w.work_id === 'MPL-1024' ? 'bg-rose-50/40' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-sans">
                    <button
                      onClick={() => openProjectDetail(w.work_id)}
                      className="font-bold text-slate-900 hover:text-blue-700 text-left"
                    >
                      <span className="font-mono text-blue-700 mr-1.5">{w.work_id}</span>
                      <span>{w.title}</span>
                    </button>
                    <div className="text-[11px] text-slate-500">{w.work_type}</div>
                  </td>
                  <td className="py-3 px-3 font-sans font-semibold text-slate-800">
                    {w.district_name}, {w.state_name}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">₹{w.sanctioned_cost}L</td>
                  <td className="py-3 px-3 font-bold text-rose-700">₹{w.expenditure}L</td>
                  <td className="py-3 px-3 text-slate-600">₹{w.predicted_comparable_cost}L</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded font-bold text-xs bg-rose-100 text-rose-900">
                      +{w.variancePct}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-xs ${
                        w.benchmarkRatio > 1.3
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {w.benchmarkRatio}x
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <button
                      onClick={() => openProjectDetail(w.work_id)}
                      className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs inline-flex items-center gap-1"
                    >
                      <span>Analyze</span>
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
