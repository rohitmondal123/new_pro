import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DuplicateMatch } from '../../types/mplads';
import {
  CopyCheck,
  MapPin,
  GitCompare,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';

export const DuplicateRadarView: React.FC = () => {
  const { openProjectDetail } = useAuth();
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<DuplicateMatch | null>(null);

  useEffect(() => {
    loadDuplicates();
  }, []);

  const loadDuplicates = async () => {
    try {
      setLoading(true);
      const data = await api.getDuplicates();
      setDuplicates(data);
      if (data.length > 0) setSelectedPair(data[0]);
    } catch (err) {
      console.error('Failed to load duplicate matches', err);
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
              Multimodal Radar
            </span>
            <span className="text-xs text-slate-400 font-mono">
              NLP Embeddings + PostGIS Geospatial Buffer Analysis
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Duplicate Proposal & Geographic Overlap Radar
          </h1>
          <p className="text-xs text-slate-500 max-w-3xl">
            Detects potential double-funding, overlapping physical boundaries, and identical asset
            proposals recommended across different financial years or adjacent administrative schemes.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
            {duplicates.length} HIGH-SIMILARITY PAIRS DETECTED
          </span>
        </div>
      </div>

      {/* Selected Pair In-Depth Analysis Card */}
      {selectedPair && (
        <div className="bg-linear-to-b from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-xs">
                {selectedPair.overall_similarity}%
              </span>
              <div>
                <h2 className="text-base font-extrabold text-white">
                  Suspected Duplicate Match: {selectedPair.work_id_1} ⟷ {selectedPair.work_id_2}
                </h2>
                <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                  <span className="text-rose-400 font-bold">
                    Distance: {selectedPair.distance_meters}m apart
                  </span>
                  <span>•</span>
                  <span>{selectedPair.location}</span>
                </div>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              {selectedPair.status}
            </span>
          </div>

          {/* Multimodal 5-Axis Similarity Breakdown */}
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Multimodal 5-Axis Similarity Breakdown:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">Text Description</div>
                <div className="text-lg font-black font-mono text-emerald-400 mt-1">
                  {selectedPair.similarity_breakdown.text_similarity}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">NLP Cosine Sim</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">Geographic Proximity</div>
                <div className="text-lg font-black font-mono text-rose-400 mt-1">
                  {selectedPair.similarity_breakdown.location_similarity}%
                </div>
                <div className="text-[10px] text-rose-300 mt-0.5">45m GIS Radius</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">Cost / Budget Range</div>
                <div className="text-lg font-black font-mono text-amber-400 mt-1">
                  {selectedPair.similarity_breakdown.cost_similarity}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">₹21.0L vs ₹19.5L</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">Work Taxonomy</div>
                <div className="text-lg font-black font-mono text-blue-400 mt-1">
                  {selectedPair.similarity_breakdown.type_similarity}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Identical Hall Scope</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase">Executing Entity</div>
                <div className="text-lg font-black font-mono text-purple-400 mt-1">
                  {selectedPair.similarity_breakdown.agency_similarity}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Same DRDA Cell</div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-rose-400">
                  Target Work: {selectedPair.work_id_1}
                </span>
                <button
                  onClick={() => openProjectDetail(selectedPair.work_id_1)}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Open Digital Twin →
                </button>
              </div>
              <div className="font-bold text-white mb-2">{selectedPair.title_1}</div>
              <div className="text-slate-400 text-[11px] space-y-1">
                <div>Status: In Progress (Financial: 92%, Physical: 41%)</div>
                <div>Sanction: ₹21.00 Lakhs</div>
                <div>Agency: DRDA Bankura / Apex Infra Buildcon</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-amber-400">
                  Comparable Prior Work: {selectedPair.work_id_2}
                </span>
                <span className="text-slate-400">Completed (FY 2022-23)</span>
              </div>
              <div className="font-bold text-white mb-2">{selectedPair.title_2}</div>
              <div className="text-slate-400 text-[11px] space-y-1">
                <div>Status: Marked Completed & Functional</div>
                <div>Sanction: ₹19.50 Lakhs</div>
                <div>Agency: DRDA Bankura / Apex Infra Buildcon</div>
              </div>
            </div>
          </div>

          {/* Resolution Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">
              Recommendation: Conduct physical site survey to verify if {selectedPair.work_id_1} is an
              unwarranted expansion or duplicate sanction of {selectedPair.work_id_2}.
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold">
                Mark Verified Distinct
              </button>
              <button
                onClick={() => openProjectDetail(selectedPair.work_id_1)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>Order Site Survey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Pairs List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-extrabold text-slate-900">
            Active Suspected Overlap Radar Detections
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {duplicates.map((pair) => (
            <div
              key={pair.match_id}
              onClick={() => setSelectedPair(pair)}
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                selectedPair?.match_id === pair.match_id ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-rose-100 text-rose-900">
                    {pair.overall_similarity}% OVERLAP MATCH
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {pair.work_id_1} ⟷ {pair.work_id_2}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {pair.title_1} &amp; {pair.title_2}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{pair.location}</span>
                  <span>•</span>
                  <span className="font-mono text-rose-700 font-semibold">
                    {pair.distance_meters}m distance
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openProjectDetail(pair.work_id_1);
                  }}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-xs"
                >
                  Inspect Work
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
