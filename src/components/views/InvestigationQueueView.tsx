import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WorkItem } from '../../types/mplads';
import { InvestigationReportModal } from '../InvestigationReportModal';
import { ScheduleInspectionModal } from '../ScheduleInspectionModal';
import {
  AlertOctagon,
  Search,
  Filter,
  ArrowUpDown,
  ShieldAlert,
  ArrowRight,
  FileCheck2,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Building,
} from 'lucide-react';

export const InvestigationQueueView: React.FC = () => {
  const { openProjectDetail } = useAuth();
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'INSPECT_FIRST' | 'REVIEW' | 'GAP' | 'COST'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkForReport, setSelectedWorkForReport] = useState<WorkItem | null>(null);
  const [selectedWorkForInspection, setSelectedWorkForInspection] = useState<WorkItem | null>(null);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await api.getInspectionPriority();
      setWorks(data);
    } catch (err) {
      console.error('Failed to load investigation queue', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorks = works.filter((w) => {
    // Tab filter
    if (activeTab === 'INSPECT_FIRST' && w.risk_score < 90) return false;
    if (activeTab === 'REVIEW' && (w.risk_score < 75 || w.risk_score >= 90)) return false;
    if (activeTab === 'GAP' && w.progress_gap < 30) return false;
    if (activeTab === 'COST' && w.expenditure <= w.sanctioned_cost * 1.25) return false;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        w.work_id.toLowerCase().includes(q) ||
        w.title.toLowerCase().includes(q) ||
        w.district_name.toLowerCase().includes(q) ||
        w.state_name.toLowerCase().includes(q) ||
        w.vendor_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Centerpiece AI Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Composite Risk Index & Multi-Modal Anomaly Ranking
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <span>AI Investigation Queue</span>
            <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">
              {filteredWorks.length} PRIORITIZED
            </span>
          </h1>
          <p className="text-xs text-slate-500 max-w-3xl">
            Automatically surfaces and ranks projects exhibiting severe physical-financial divergence,
            cost overruns, and milestone anomalies. Designed specifically for District Magistrates,
            State Nodal Officers, and Central Auditors to allocate field inspections effectively.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter queue by project ID, district, vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs w-64 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Prioritized ({works.length})
        </button>
        <button
          onClick={() => setActiveTab('INSPECT_FIRST')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'INSPECT_FIRST'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Inspect First (Risk ≥ 90)</span>
        </button>
        <button
          onClick={() => setActiveTab('REVIEW')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'REVIEW'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          High Risk Review (75-89)
        </button>
        <button
          onClick={() => setActiveTab('GAP')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'GAP'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
          }`}
        >
          Severe Reality Gap (&gt; 30%)
        </button>
        <button
          onClick={() => setActiveTab('COST')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'COST'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          Cost Deviations (&gt; +25%)
        </button>
      </div>

      {/* Queue List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Running XGBoost risk inference and ranking queue...
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No projects match this filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-14">Rank</th>
                  <th className="py-3 px-4">Project & Location</th>
                  <th className="py-3 px-3">Sanction vs Spent</th>
                  <th className="py-3 px-4">Financial vs Physical</th>
                  <th className="py-3 px-3">Risk Score & Action</th>
                  <th className="py-3 px-4">Primary Anomaly Signal</th>
                  <th className="py-3 px-4 text-right">Decision Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorks.map((work, index) => {
                  const isInspectFirst = work.risk_score >= 90;
                  const costVariance = Number(
                    (((work.expenditure - work.sanctioned_cost) / work.sanctioned_cost) * 100).toFixed(1)
                  );

                  return (
                    <tr
                      key={work.work_id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        work.work_id === 'MPL-1024' ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-mono font-extrabold text-xs ${
                            isInspectFirst
                              ? 'bg-rose-600 text-white shadow-xs'
                              : work.risk_score >= 75
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </td>

                      {/* Title & Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openProjectDetail(work.work_id)}
                            className="font-bold text-slate-900 hover:text-blue-700 text-xs text-left group"
                          >
                            <span className="font-mono text-blue-700 mr-1.5">{work.work_id}</span>
                            <span>{work.title}</span>
                          </button>
                          {work.work_id === 'MPL-1024' && (
                            <span className="bg-rose-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.2 rounded">
                              DEMO BENCHMARK
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>
                            {work.district_name}, {work.state_name}
                          </span>
                          <span>•</span>
                          <span>{work.work_type}</span>
                          <span>•</span>
                          <span className="text-slate-600 font-medium">MP: {work.mp_name}</span>
                        </div>
                      </td>

                      {/* Sanction vs Spent */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono">
                        <div className="text-slate-900 font-semibold">₹{work.expenditure}L</div>
                        <div className="text-[11px] text-slate-500">Sanct: ₹{work.sanctioned_cost}L</div>
                        <div
                          className={`text-[10px] font-bold ${
                            costVariance > 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {costVariance > 0 ? `+${costVariance}% overrun` : `${costVariance}%`}
                        </div>
                      </td>

                      {/* Financial vs Physical Reality Bar */}
                      <td className="py-3.5 px-4 w-48">
                        <div className="space-y-1.5">
                          <div>
                            <div className="flex justify-between text-[10px] font-mono text-slate-600">
                              <span>Fin: {work.financial_progress}%</span>
                              <span className="text-rose-700 font-bold">
                                Gap: {work.progress_gap}pp
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${work.financial_progress}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] font-mono text-slate-600">
                              <span>Phy: {work.physical_progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${work.physical_progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Risk Score & Recommended Action */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-extrabold text-xs ${
                              isInspectFirst
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : work.risk_score >= 75
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {work.risk_score} / 100
                          </span>
                        </div>
                        <div
                          className={`text-[10px] font-bold font-mono mt-1 ${
                            isInspectFirst
                              ? 'text-rose-700'
                              : work.risk_score >= 75
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {work.risk_score >= 90
                            ? 'INSPECT FIRST'
                            : work.risk_score >= 75
                            ? 'REVIEW'
                            : 'MONITOR'}
                        </div>
                      </td>

                      {/* Primary Anomaly Signal */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-700 leading-snug max-w-xs">
                        {work.risk_factors && work.risk_factors.length > 0 ? (
                          <div>
                            <div className="font-semibold text-slate-900">
                              {work.risk_factors[0].name}
                            </div>
                            <div className="text-slate-500 line-clamp-2">
                              {work.risk_factors[0].description}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-400">Composite multi-factor variance</div>
                        )}
                      </td>

                      {/* Decision Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedWorkForReport(work)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            title="Generate AI Investigation Dossier"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedWorkForInspection(work)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            title="Schedule Physical Inspection"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openProjectDetail(work.work_id)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <InvestigationReportModal
        work={selectedWorkForReport}
        isOpen={!!selectedWorkForReport}
        onClose={() => setSelectedWorkForReport(null)}
      />

      <ScheduleInspectionModal
        work={selectedWorkForInspection}
        isOpen={!!selectedWorkForInspection}
        onClose={() => setSelectedWorkForInspection(null)}
        onScheduled={loadQueue}
      />
    </div>
  );
};
