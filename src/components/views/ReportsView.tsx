import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WorkItem } from '../../types/mplads';
import { InvestigationReportModal } from '../InvestigationReportModal';
import { FileCheck2, Printer, Download, Sparkles, ArrowRight, ShieldAlert, Award } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { openProjectDetail } = useAuth();
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      setLoading(true);
      const res = await api.getWorks({ limit: '30', risk_level: 'CRITICAL' });
      setWorks(res.items);
      const benchmark = res.items.find((w) => w.work_id === 'MPL-1024') || res.items[0];
      if (benchmark) setSelectedWork(benchmark);
    } catch (err) {
      console.error('Failed to load works for reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReport = (work: WorkItem) => {
    setSelectedWork(work);
    setReportModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Statutory Decision Support
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Automated Forensic Assessment Synthesis
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            AI Investigation Dossiers & Reports
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Generate formal, non-accusatory technical risk dossiers formatted for District
            Magistrates, Parliamentary Committees, and the Comptroller and Auditor General (CAG).
          </p>
        </div>

        <button
          onClick={() => {
            const w = works.find((item) => item.work_id === 'MPL-1024') || works[0];
            if (w) handleOpenReport(w);
          }}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors"
        >
          <FileCheck2 className="w-4 h-4 text-amber-300" />
          <span>Generate MPL-1024 Signature Dossier</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {works.map((w) => (
          <div
            key={w.work_id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {w.work_id}
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  RISK {w.risk_score}/100
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-2">{w.title}</h3>
              <div className="text-xs text-slate-500 mt-1">
                {w.district_name}, {w.state_name}
              </div>

              <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Reality Gap:</span>
                  <span className="text-rose-700 font-bold">+{w.progress_gap} pp</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cost Variance:</span>
                  <span className="text-slate-900 font-semibold">₹{w.expenditure}L vs ₹{w.sanctioned_cost}L</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => openProjectDetail(w.work_id)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                View Twin
              </button>
              <button
                onClick={() => handleOpenReport(w)}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>View Dossier</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <InvestigationReportModal
        work={selectedWork}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
};
