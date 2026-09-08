import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLogEntry } from '../../types/mplads';
import { History, Search, ShieldCheck, User, Calendar, FileText } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.id.toLowerCase().includes(q) ||
      l.user_name.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.entity_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Integrity & Accountability
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Immutable Cryptographic Audit Ledger
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Immutable Audit Trail
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Logs all administrative inspections, risk dossier generations, status acknowledgments,
            and data ingestions to maintain complete forensic traceability.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs w-64 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-mono">Log ID</th>
                <th className="py-2.5 px-3">Timestamp (IST)</th>
                <th className="py-2.5 px-3">Authorized Officer</th>
                <th className="py-2.5 px-3">User Role</th>
                <th className="py-2.5 px-3">Action Event</th>
                <th className="py-2.5 px-3">Entity Target</th>
                <th className="py-2.5 px-3">Audit Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-blue-700">{entry.id}</td>
                  <td className="py-2.5 px-3 text-slate-600">{entry.timestamp}</td>
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                    {entry.user_name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {entry.user_role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-800 font-mono text-[11px]">
                      {entry.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-700">{entry.entity_id}</td>
                  <td className="py-2.5 px-3 font-sans text-[11px] text-slate-500 truncate max-w-xs">
                    {JSON.stringify(entry.metadata)}
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
