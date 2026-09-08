import React, { useState, useEffect } from 'react';
import { WorkItem } from '../types/mplads';
import { api } from '../services/api';
import {
  X,
  Printer,
  Download,
  ShieldAlert,
  CheckSquare,
  FileText,
  Building,
  Calendar,
  IndianRupee,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';

interface InvestigationReportModalProps {
  work: WorkItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvestigationReportModal: React.FC<InvestigationReportModalProps> = ({
  work,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<{
    report_id: string;
    generated_at: string;
    dossier: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && work) {
      loadReport();
    }
  }, [isOpen, work]);

  const loadReport = async () => {
    if (!work) return;
    try {
      setLoading(true);
      const res = await api.generateReport(work.work_id);
      setReportData({
        report_id: res.report_id,
        generated_at: res.generated_at,
        dossier: res.dossier,
      });
    } catch (err) {
      console.error('Failed to generate report', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !work) return null;

  const costVariance = Number(
    (((work.expenditure - work.sanctioned_cost) / work.sanctioned_cost) * 100).toFixed(1)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border theme-border overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div
          className="text-white px-6 py-3.5 flex items-center justify-between print:hidden transition-colors"
          style={{
            backgroundColor: 'var(--app-topbar-bg)',
            color: 'var(--app-topbar-text)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight flex items-center gap-2 text-white">
                <span>AI Investigation & Risk Assessment Dossier</span>
                <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-mono">
                  CONFIDENTIAL
                </span>
              </h2>
              <p className="text-[11px] opacity-75">
                Official Statutory Early Warning Assessment Report • Decision Support
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer hover:opacity-95 shadow-xs"
              style={{
                backgroundColor: 'var(--app-brand-accent)',
                color: 'var(--app-brand-accent-text)',
              }}
              title="Print Dossier"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-4 text-slate-900 font-sans bg-white">
          {/* Official Letterhead */}
          <div className="border-b-2 border-[#283618] pb-5 text-center relative">
            <div className="text-[11px] font-bold tracking-widest text-[#6B705C] uppercase">
              भारत सरकार | Government of India
            </div>
            <div className="text-xs font-bold text-[#283618] tracking-wider font-serif">
              MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION (MoSPI)
            </div>
            <div className="text-base font-extrabold text-[#283618] tracking-tight mt-1 font-serif">
              MPLADS SENTINEL - PREDICTIVE RISK INTELLIGENCE PLATFORM
            </div>
            <div className="text-[11px] text-[#6B705C] font-mono mt-0.5">
              Ref: {reportData?.report_id || `REP-${work.work_id}-2024`} • Generated on:{' '}
              {reportData?.generated_at
                ? new Date(reportData.generated_at).toLocaleString()
                : new Date().toLocaleString()}
            </div>

            <div className="absolute right-0 top-0 hidden sm:block text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-[#FCF1EE] text-[#BC4749] font-mono font-bold text-xs border border-[#F2B9AD]">
                RISK: {work.risk_score}/100 • {work.risk_severity}
              </span>
            </div>
          </div>

          {/* Project Identification Table */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-700" />
              <span>1. Project Identification & Administrative Profile</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-slate-500 text-[11px]">Work ID:</div>
                <div className="font-mono font-bold text-blue-800">{work.work_id}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">Category:</div>
                <div className="font-semibold text-slate-900">{work.work_type}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">State / District:</div>
                <div className="font-semibold text-slate-900">
                  {work.district_name}, {work.state_name}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">Constituency:</div>
                <div className="font-semibold text-slate-900">{work.constituency_name}</div>
              </div>
              <div className="col-span-2">
                <div className="text-slate-500 text-[11px]">Project Title:</div>
                <div className="font-bold text-slate-900">{work.title}</div>
              </div>
              <div className="col-span-2">
                <div className="text-slate-500 text-[11px]">Recommending Member of Parliament:</div>
                <div className="font-semibold text-slate-900">
                  {work.mp_name} ({work.mp_house})
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">Executing Agency:</div>
                <div className="font-semibold text-slate-800">{work.agency_name}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">Contractor / Vendor:</div>
                <div className="font-semibold text-slate-800">{work.vendor_name}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">Sanction Date:</div>
                <div className="font-mono text-slate-800">{work.sanction_date}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">Target SLA Date:</div>
                <div className="font-mono text-slate-800">{work.expected_completion_date}</div>
              </div>
            </div>
          </div>

          {/* Financial vs Physical Reality Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-blue-700" />
                <span>2. Financial Disbursement Summary</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Original Estimated Cost:</span>
                  <span className="font-mono font-semibold">₹{work.estimated_cost} Lakhs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Administrative Sanction:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{work.sanctioned_cost} Lakhs
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Actual Expenditure Recorded:</span>
                  <span className="font-mono font-bold text-rose-700">
                    ₹{work.expenditure} Lakhs
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Cost Deviation Variance:</span>
                  <span
                    className={`font-mono font-bold ${
                      costVariance > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {costVariance > 0 ? `+${costVariance}%` : `${costVariance}%`}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Predicted Benchmark Comparable Cost:</span>
                  <span className="font-mono text-slate-700">
                    ₹{work.predicted_comparable_cost} Lakhs
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-700" />
                <span>3. Physical vs Financial Reality</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Financial Disbursement Progress</span>
                    <span className="font-mono text-blue-700">{work.financial_progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${work.financial_progress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Ground Physical Progress (Verified)</span>
                    <span className="font-mono text-amber-700">{work.physical_progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${work.physical_progress}%` }}
                    />
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center justify-between">
                  <span>Reality Gap Disparity:</span>
                  <span className="font-mono font-bold text-rose-700">
                    {work.progress_gap} percentage points
                  </span>
                </div>

                <div className="text-[11px] text-slate-500">
                  Delay Status: <strong className="text-slate-800">{work.delay_days} days</strong>{' '}
                  beyond scheduled delivery SLA. Model predicts additional{' '}
                  <strong className="text-slate-800">{work.predicted_delay_range}</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Dossier Narrative */}
          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/40">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700" />
              <span>4. AI Synthesis & Root Cause Explainability (SHAP Attributions)</span>
            </div>
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Synthesizing multi-modal risk signals...
              </div>
            ) : (
              <div className="text-xs text-slate-800 space-y-3 leading-relaxed whitespace-pre-line font-sans">
                {reportData?.dossier}
              </div>
            )}
          </div>

          {/* Statutory Verification Action Plan */}
          <div className="border border-slate-300 rounded-xl p-4 bg-white">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-700" />
              <span>5. Recommended Administrative Action Plan (Officer Decision Support)</span>
            </div>
            <div className="space-y-2 text-xs">
              {work.recommended_actions.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 font-medium">{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-off & Statutory Disclaimer */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 text-xs text-slate-600">
            <div>
              <div className="font-semibold text-slate-800">Generated by:</div>
              <div>MPLADS Sentinel AI Core Engine (v2.4)</div>
              <div>Integrated Government Data Intelligence Unit</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-800">Authorized Human Verifier:</div>
              <div className="mt-8 border-b border-slate-400 w-48 ml-auto" />
              <div className="text-[11px] text-slate-500 mt-1">
                Designated District Magistrate / Auditor Sign & Stamp
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 text-center font-mono pt-3">
            LEGAL NOTICE: This assessment is an automated algorithmic decision-support indicator
            generated under the MPLADS Sentinel framework. It does not constitute a judicial finding.
            All findings require verification through on-site inspection and physical Measurement Book audit.
          </div>
        </div>
      </div>
    </div>
  );
};
