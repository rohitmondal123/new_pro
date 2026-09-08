import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ComplianceRule } from '../../types/mplads';
import { ShieldCheck, AlertTriangle, CheckCircle2, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

export const ComplianceView: React.FC = () => {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompliance();
  }, []);

  const loadCompliance = async () => {
    try {
      setLoading(true);
      const data = await api.getCompliance();
      setRules(data.rules);
      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to load compliance', err);
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Statutory Governance
            </span>
            <span className="text-xs text-slate-400 font-mono">
              MoSPI Scheme Guidelines (2023 Revision) Enforcer
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Compliance Monitoring & Scheme Rules
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Automated programmatic enforcement of statutory mandates including mandatory SC/ST
            allocations, prohibited category restrictions, and Measurement Book verification rules.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-emerald-700 font-mono">90.1%</div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">
            Average Compliance Rate
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          const isWarning = rule.violation_count > 0;
          return (
            <div
              key={rule.id}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 uppercase">
                    {rule.category} • RULE {rule.id}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 mt-1">{rule.name}</h3>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    rule.violation_count > 0
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {rule.violation_count} Violations
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">{rule.description}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Compliance Rate:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {rule.compliance_rate}%
                  </span>
                </div>
                <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      rule.compliance_rate >= 90
                        ? 'bg-emerald-600'
                        : rule.compliance_rate >= 75
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                    style={{ width: `${rule.compliance_rate}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
