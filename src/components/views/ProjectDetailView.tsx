import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WorkItem, PaymentRecord } from '../../types/mplads';
import { InvestigationReportModal } from '../InvestigationReportModal';
import { ScheduleInspectionModal } from '../ScheduleInspectionModal';
import {
  ArrowLeft,
  ShieldAlert,
  Building,
  MapPin,
  Calendar,
  IndianRupee,
  Layers,
  FileCheck2,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  GitCompare,
  TrendingUp,
  Download,
  Flame,
  CheckSquare,
  FileText,
  User,
  Activity,
  Award,
} from 'lucide-react';

export const ProjectDetailView: React.FC = () => {
  const { selectedProjectId, setActiveRoute } = useAuth();
  const [work, setWork] = useState<WorkItem | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'PAYMENTS' | 'SHAP'>('OVERVIEW');

  useEffect(() => {
    loadWorkDetails();
  }, [selectedProjectId]);

  const loadWorkDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getWorkById(selectedProjectId);
      setWork(data);
      const payData = await api.getPayments(selectedProjectId);
      setPayments(payData);
    } catch (err) {
      console.error('Failed to load work details', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading Project Digital Twin & Telemetry...
      </div>
    );
  }

  if (!work) {
    return (
      <div className="p-12 text-center text-slate-700">
        <h2 className="text-base font-bold">Project Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Unable to locate work ID: {selectedProjectId}</p>
        <button
          onClick={() => setActiveRoute('projects')}
          className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold"
        >
          Back to Projects Directory
        </button>
      </div>
    );
  }

  const costVariance = Number(
    (((work.expenditure - work.sanctioned_cost) / work.sanctioned_cost) * 100).toFixed(1)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation & Actions Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveRoute('queue')}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Back to Investigation Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {work.work_id}
              </span>
              <span className="text-xs text-slate-400 font-mono">Digital Twin Active</span>
              {work.work_id === 'MPL-1024' && (
                <span className="text-[10px] bg-rose-600 text-white font-mono font-bold px-2 py-0.5 rounded">
                  HACKATHON SIGNATURE DEMO
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {work.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInspectionModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>Schedule Field Inspection</span>
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <FileCheck2 className="w-4 h-4 text-amber-300" />
            <span>Generate AI Investigation Dossier</span>
          </button>
        </div>
      </div>

      {/* Top Profile & Composite Risk Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 cols: Info & Financial Compare */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Location / District:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {work.district_name}, {work.state_name}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Constituency:</span>
              <span className="font-bold text-slate-900">{work.constituency_name}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Category:</span>
              <span className="font-bold text-slate-900">{work.work_type}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Recommending MP:</span>
              <span className="font-bold text-slate-900">{work.mp_name}</span>
            </div>
          </div>

          {/* Financial & Physical Reality Comparison Bar (Core Signature Feature) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <GitCompare className="w-4 h-4 text-blue-700" />
                Financial vs Physical Reality Disparity
              </span>
              <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                CRITICAL DISPARITY GAP: {work.progress_gap} PERCENTAGE POINTS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Financial Progress */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Financial Disbursement</span>
                  <span className="font-mono text-blue-700 font-bold">{work.financial_progress}%</span>
                </div>
                <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${work.financial_progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                  <span>Expended: ₹{work.expenditure}L</span>
                  <span>Sanction: ₹{work.sanctioned_cost}L</span>
                </div>
              </div>

              {/* Physical Progress */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Physical Milestone Verified</span>
                  <span className="font-mono text-amber-700 font-bold">{work.physical_progress}%</span>
                </div>
                <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${work.physical_progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                  <span>Verified On-Ground: {work.physical_progress}%</span>
                  <span>Milestone SLA Delay: {work.delay_days} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 col: Composite Risk Score Card */}
        <div className="p-5 rounded-xl bg-linear-to-b from-rose-50 to-white border border-rose-200 flex flex-col justify-between text-center">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Composite Risk Index
            </div>
            <div className="text-5xl font-black text-rose-600 font-mono mt-2 tracking-tight">
              {work.risk_score}
              <span className="text-lg text-slate-400 font-normal">/100</span>
            </div>
            <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono font-bold text-xs">
              {work.risk_severity} SEVERITY
            </div>
          </div>

          <div className="pt-4 border-t border-rose-100 text-left text-[11px] space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Cost Deviation:</span>
              <span className="font-mono font-bold text-rose-700">
                {costVariance > 0 ? `+${costVariance}%` : `${costVariance}%`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Delay Probability:</span>
              <span className="font-mono font-bold text-amber-700">{work.delay_probability}%</span>
            </div>
            <div className="flex justify-between">
              <span>Predicted Delay:</span>
              <span className="font-mono font-bold text-slate-800">{work.predicted_delay_range}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 font-bold border-b-2 transition-colors ${
            activeTab === 'OVERVIEW'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Explainable AI & Decision Checklist
        </button>
        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`px-4 py-2 font-bold border-b-2 transition-colors ${
            activeTab === 'TIMELINE'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Digital Twin Lifecycle Events ({work.timeline_events.length})
        </button>
        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`px-4 py-2 font-bold border-b-2 transition-colors ${
            activeTab === 'PAYMENTS'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Payment Tranches ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('SHAP')}
          className={`px-4 py-2 font-bold border-b-2 transition-colors ${
            activeTab === 'SHAP'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          SHAP Attribution Breakdown
        </button>
      </div>

      {/* Tab 1: Explainable AI & Officer Decision Checklist */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Why Was This Flagged? (SHAP Explainability) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Why Was This Flagged? (AI Explainability)
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                SHAP v2.4 Attributions
              </span>
            </div>
            <p className="text-xs text-slate-500">
              The machine learning model evaluated 42 signals across financial records, milestone
              checkpoints, geographic proximity, and executing agency velocity.
            </p>

            <div className="space-y-3">
              {work.risk_factors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{factor.name}</span>
                    <span className="font-mono font-bold text-rose-700">
                      +{factor.contribution}% Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {factor.description}
                  </p>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 rounded-full"
                      style={{ width: `${factor.contribution * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What Should the Officer Do? (Decision Support Checklist) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    What Should the Officer Do? (Statutory Checklist)
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  ACTIONABLE
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Prescribed administrative protocol for District Magistrates and Statutory Auditors
                under MoSPI Operational Guidelines.
              </p>

              <div className="mt-4 space-y-2.5">
                {work.recommended_actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">{act}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Mandated under Rule 4.2 of MPLADS Scheme Implementation Guidelines.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setInspectionModalOpen(true)}
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Issue Formal Inspection Order</span>
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="text-xs text-blue-700 font-bold hover:underline flex items-center gap-1"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Export Official Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Digital Twin Lifecycle Events */}
      {activeTab === 'TIMELINE' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-slate-900">
              Project Digital Twin Lifecycle Events
            </h3>
            <p className="text-xs text-slate-500">
              Immutable sequence of administrative sanctions, fund releases, measurement entries,
              and automated telemetry alerts.
            </p>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
            {work.timeline_events.map((ev, idx) => {
              const isWarning = ev.status === 'WARNING';
              const isCompleted = ev.status === 'COMPLETED';
              return (
                <div key={ev.id || idx} className="relative group">
                  <div
                    className={`absolute -left-9 top-1 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                      isWarning
                        ? 'bg-rose-600 text-white border-rose-300'
                        : isCompleted
                        ? 'bg-emerald-600 text-white border-emerald-200'
                        : 'bg-blue-600 text-white border-blue-200'
                    }`}
                  >
                    {isWarning ? '!' : idx + 1}
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span>{ev.label}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                            isWarning ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ev.stage}
                        </span>
                      </span>
                      <span className="font-mono text-slate-500 text-[11px]">{ev.date}</span>
                    </div>

                    <div className="text-[11px] text-slate-700 leading-relaxed mb-1.5">
                      {ev.note}
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Authorized Signatory: {ev.authority}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Payment Tranches */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Disbursement Tranches & PFMS Transactions
              </h3>
              <p className="text-xs text-slate-500">
                Payment records cross-referenced against on-portal Measurement Book verifications.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              Total Released: ₹{work.expenditure} Lakhs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Payment ID</th>
                  <th className="py-2.5 px-3">Tranche</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment Date</th>
                  <th className="py-2.5 px-3">PFMS UTR No.</th>
                  <th className="py-2.5 px-3">Status & Signal</th>
                  <th className="py-2.5 px-3">Measurement Book Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {payments.map((p) => {
                  const isAnomaly = p.status === 'FLAGGED_ANOMALY';
                  return (
                    <tr
                      key={p.payment_id}
                      className={isAnomaly ? 'bg-rose-50/50' : 'hover:bg-slate-50'}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.payment_id}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold">Tranche #{p.tranche}</td>
                      <td className="py-2.5 px-3 font-bold text-blue-700">₹{p.amount} Lakhs</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.payment_date}</td>
                      <td className="py-2.5 px-3 text-slate-500">{p.utr_number}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isAnomaly
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px]">
                        {p.measurement_book_verified ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified by AE
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Pending Physical MB Check
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: SHAP Attribution Breakdown */}
      {activeTab === 'SHAP' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              SHAP Feature Attribution (v2.4 KernelExplainer)
            </h3>
            <p className="text-xs text-slate-500">
              Mathematical decomposition showing baseline risk + marginal feature weights leading
              to the final risk score of {work.risk_score}/100.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-3">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>National Population Baseline Expected Risk E[X]:</span>
              <span className="text-slate-400">22.4 / 100</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Feature [progress_disparity_gap]: +51 percentage points</span>
              <span className="text-rose-400 font-bold">+38.2 SHAP points</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Feature [cost_deviation_pct]: +82.8% over sanction</span>
              <span className="text-rose-400 font-bold">+21.5 SHAP points</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Feature [payment_velocity_delta]: 14 days between T2 & T3</span>
              <span className="text-amber-400 font-bold">+16.4 SHAP points</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Feature [vendor_agency_concentration]: 68.4% share</span>
              <span className="text-amber-400 font-bold">+11.0 SHAP points</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Feature [delay_slippage_sla]: +140 days beyond target</span>
              <span className="text-blue-400 font-bold">+4.5 SHAP points</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-bold text-white">
              <span>Model Output Composite Risk f(x):</span>
              <span className="text-rose-400">{work.risk_score} / 100</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <InvestigationReportModal
        work={work}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      <ScheduleInspectionModal
        work={work}
        isOpen={inspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
        onScheduled={loadWorkDetails}
      />
    </div>
  );
};
