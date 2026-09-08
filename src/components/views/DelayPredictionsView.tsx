import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WorkItem } from '../../types/mplads';
import { ClockAlert, Calendar, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export const DelayPredictionsView: React.FC = () => {
  const { openProjectDetail } = useAuth();
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getPredictions();
      setWorks(data.high_delay_probability_works);
    } catch (err) {
      console.error('Failed to load predictions', err);
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
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Predictive ML Model
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Survival Analysis & GradientBoost Delay Forecaster
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Predictive Delay & Milestone Slippage Engine
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Forecasts probability of project completion delays before deadlines lapse by analyzing
            inter-milestone velocity, seasonal monsoon buffers, and contractor execution history.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
            {works.length} HIGH-DELAY-RISK WORKS FLAGGED
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Work ID & Title</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Scheduled SLA Date</th>
                <th className="py-2.5 px-3 text-center">Current Delay</th>
                <th className="py-2.5 px-3 text-center">Delay Probability</th>
                <th className="py-2.5 px-3 text-center">Predicted Extra Delay</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {works.map((w) => (
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
                    <div className="text-[11px] text-slate-500 font-sans">{w.work_type}</div>
                  </td>
                  <td className="py-3 px-3 font-sans font-semibold text-slate-800">
                    {w.district_name}, {w.state_name}
                  </td>
                  <td className="py-3 px-3 text-slate-700">{w.expected_completion_date}</td>
                  <td className="py-3 px-3 text-center text-amber-700 font-bold">
                    {w.delay_days > 0 ? `${w.delay_days} days` : 'On Schedule'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded font-bold text-xs bg-rose-100 text-rose-900">
                      {w.delay_probability}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900 font-sans">
                    {w.predicted_delay_range}
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
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
