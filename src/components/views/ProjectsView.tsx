import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WorkItem } from '../../types/mplads';
import { Search, Filter, ArrowRight, ShieldAlert, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const { openProjectDetail } = useAuth();
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadWorks();
  }, [search, stateFilter, riskFilter, statusFilter, categoryFilter, page]);

  const loadWorks = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        limit: String(pageSize),
        offset: String((page - 1) * pageSize),
      };
      if (search) params.search = search;
      if (stateFilter !== 'ALL') params.state = stateFilter;
      if (riskFilter !== 'ALL') params.risk_level = riskFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.work_type = categoryFilter;

      const data = await api.getWorks(params);
      setWorks(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load works', err);
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
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              National Asset Directory
            </span>
            <span className="text-xs text-slate-400 font-mono">
              52,480 Central Works Synchronized
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Projects Directory
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Search and inspect public works by constituency, administrative sanction, executing
            agency, and real-time physical milestone status.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search works, ID, district, vendor..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs w-64 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">State:</span>
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-md px-2 py-1 bg-slate-50 font-semibold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All States</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Bihar">Bihar</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Risk Level:</span>
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-md px-2 py-1 bg-slate-50 font-semibold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical (≥ 90)</option>
            <option value="HIGH">High (75 - 89)</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-md px-2 py-1 bg-slate-50 font-semibold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DELAYED">Delayed</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Sector:</span>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-md px-2 py-1 bg-slate-50 font-semibold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Sectors</option>
            <option value="Community Hall">Community Halls</option>
            <option value="Drinking Water">Drinking Water & RO</option>
            <option value="Rural Roads">Rural Roads</option>
            <option value="School Infrastructure">School Infrastructure</option>
          </select>
        </div>

        <span className="ml-auto text-xs text-slate-500 font-mono">
          Found {total} matching projects
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Work ID & Title</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Sanction / Spent</th>
                <th className="py-2.5 px-3 text-center">Financial %</th>
                <th className="py-2.5 px-3 text-center">Physical %</th>
                <th className="py-2.5 px-3 text-center">Reality Gap</th>
                <th className="py-2.5 px-3 text-center">Risk Score</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading works directory...
                  </td>
                </tr>
              ) : works.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No works match the selected criteria.
                  </td>
                </tr>
              ) : (
                works.map((w) => {
                  const isInspectFirst = w.risk_score >= 90;
                  return (
                    <tr
                      key={w.work_id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        w.work_id === 'MPL-1024' ? 'bg-rose-50/30' : ''
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
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div className="font-semibold text-slate-900">₹{w.expenditure}L</div>
                        <div className="text-slate-500">Sanct: ₹{w.sanctioned_cost}L</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-blue-700">
                        {w.financial_progress}%
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-amber-700">
                        {w.physical_progress}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            w.progress_gap > 30
                              ? 'bg-rose-100 text-rose-800'
                              : 'text-slate-600'
                          }`}
                        >
                          +{w.progress_gap}pp
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            isInspectFirst
                              ? 'bg-rose-600 text-white'
                              : w.risk_score >= 75
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {w.risk_score}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => openProjectDetail(w.work_id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs inline-flex items-center gap-1"
                        >
                          <span>Twin</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} works
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * pageSize >= total}
              className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
