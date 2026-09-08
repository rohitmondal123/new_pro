import React, { useState, useEffect, useRef, useMemo } from 'react';
import IndiaMapData from '@svg-maps/india';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  MapPin,
  ShieldAlert,
  Layers,
  ArrowRight,
  Filter,
  Flame,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Radar,
  AlertTriangle,
  Activity,
  LocateFixed,
  Sun,
  Moon,
  Info,
  X,
  CheckCircle2,
} from 'lucide-react';

interface MapPoint {
  work_id: string;
  title: string;
  latitude: number;
  longitude: number;
  location: string;
  state_name: string;
  district_name: string;
  work_type: string;
  risk_score: number;
  risk_severity: string;
  status: string;
  financial_progress: number;
  physical_progress: number;
  expenditure: number;
  sanctioned_cost: number;
}

interface SvgLocation {
  id: string;
  name: string;
  path: string;
}

// Region preset bounding targets for quick-zoom
interface RegionPreset {
  id: string;
  name: string;
  zoom: number;
  panX: number;
  panY: number;
}

const REGION_PRESETS: RegionPreset[] = [
  { id: 'all', name: 'All India (National View)', zoom: 1, panX: 0, panY: 0 },
  { id: 'east', name: 'Eastern Cluster (WB / Bihar / Odisha)', zoom: 2.2, panX: -260, panY: 60 },
  { id: 'north', name: 'Gangetic & Northern Belt (UP / RJ / DL)', zoom: 2.0, panX: -80, panY: 140 },
  { id: 'west', name: 'Western Zone (Maharashtra / Gujarat)', zoom: 2.1, panX: 40, panY: -20 },
  { id: 'south', name: 'Southern Corridor (TN / Kerala / Karnataka)', zoom: 2.3, panX: 60, panY: -280 },
  { id: 'ne', name: 'North-East Region (Assam & Seven Sisters)', zoom: 2.4, panX: -400, panY: 80 },
];

// Major state anchor labels for authentic cartographic readability
const STATE_LABELS: Record<string, { label: string; x: number; y: number }> = {
  'Jammu and Kashmir': { label: 'JAMMU & KASHMIR', x: 170, y: 65 },
  'Himachal Pradesh': { label: 'HP', x: 191, y: 133 },
  'Punjab': { label: 'PUNJAB', x: 151, y: 155 },
  'Uttarakhand': { label: 'UK', x: 232, y: 175 },
  'Haryana': { label: 'HR', x: 164, y: 195 },
  'Delhi': { label: 'DELHI', x: 192, y: 205 },
  'Rajasthan': { label: 'RAJASTHAN', x: 112, y: 250 },
  'Uttar Pradesh': { label: 'UTTAR PRADESH', x: 235, y: 245 },
  'Bihar': { label: 'BIHAR', x: 356, y: 275 },
  'West Bengal': { label: 'WEST BENGAL', x: 400, y: 330 },
  'Jharkhand': { label: 'JHARKHAND', x: 365, y: 320 },
  'Odisha': { label: 'ODISHA', x: 340, y: 405 },
  'Chhattisgarh': { label: 'CHHATTISGARH', x: 296, y: 388 },
  'Madhya Pradesh': { label: 'MADHYA PRADESH', x: 245, y: 310 },
  'Gujarat': { label: 'GUJARAT', x: 66, y: 355 },
  'Maharashtra': { label: 'MAHARASHTRA', x: 180, y: 435 },
  'Telangana': { label: 'TELANGANA', x: 237, y: 457 },
  'Andhra Pradesh': { label: 'ANDHRA PRADESH', x: 220, y: 540 },
  'Karnataka': { label: 'KARNATAKA', x: 171, y: 520 },
  'Goa': { label: 'GOA', x: 115, y: 512 },
  'Kerala': { label: 'KERALA', x: 160, y: 615 },
  'Tamil Nadu': { label: 'TAMIL NADU', x: 211, y: 610 },
  'Assam': { label: 'ASSAM', x: 516, y: 271 },
  'Arunachal Pradesh': { label: 'ARUNACHAL', x: 550, y: 224 },
};

export const GeospatialMapView: React.FC = () => {
  const { openProjectDetail } = useAuth();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<MapPoint | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterState, setFilterState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Map Theme: 'dark' (Tactical Surveillance) vs 'light' (Survey of India Atlas)
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');

  // Map Navigation & Layer States
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layer Toggles
  const [showOverlapRadar, setShowOverlapRadar] = useState<boolean>(true);
  const [showHeatmapGlow, setShowHeatmapGlow] = useState<boolean>(true);
  const [showStateLabels, setShowStateLabels] = useState<boolean>(true);
  const [showStateRiskTints, setShowStateRiskTints] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Extract official India locations from @svg-maps/india
  const mapData = useMemo(() => {
    const raw = (IndiaMapData as any).default || IndiaMapData;
    return {
      label: raw.label || 'India',
      viewBox: raw.viewBox || '0 0 612 696',
      locations: (raw.locations || []) as SvgLocation[],
    };
  }, []);

  useEffect(() => {
    loadMapPoints();
  }, []);

  const loadMapPoints = async () => {
    try {
      setLoading(true);
      const data = await api.getMapPoints();
      setPoints(data);
      const signature = data.find((p) => p.work_id === 'MPL-1024') || data[0];
      if (signature) setSelectedPoint(signature);
    } catch (err) {
      console.error('Failed to load map points', err);
    } finally {
      setLoading(false);
    }
  };

  // Convert GPS Coordinates (Lat/Lng) to Map Canvas ViewBox Coordinates
  // Calibrated to the exact 0 0 612 696 viewBox of the official India vector map
  const projectGeoToSvg = (lat?: number, lng?: number) => {
    const validLat = typeof lat === 'number' && !isNaN(lat) ? lat : 23.2324;
    const validLng = typeof lng === 'number' && !isNaN(lng) ? lng : 87.0715;

    // Mainland India coordinate bounds:
    // Longitude: 68.3° E (Gujarat Kutch) to 97.4° E (Arunachal border) -> 612 SVG units
    // Latitude: 8.0° N (Kanyakumari) to 37.2° N (Siachen/Kashmir) -> 668 SVG units
    const minLng = 68.3;
    const maxLng = 97.4;
    const minLat = 8.0;
    const maxLat = 37.2;

    const x = ((validLng - minLng) / (maxLng - minLng)) * 612;
    const y = (1 - (validLat - minLat) / (maxLat - minLat)) * 668;

    return { x, y };
  };

  // Calculate statistics per state (count of works, avg risk)
  const stateStats = useMemo(() => {
    const stats: Record<string, { count: number; avgRisk: number; criticalCount: number }> = {};
    points.forEach((p) => {
      const st = p.state_name || 'Other';
      if (!stats[st]) {
        stats[st] = { count: 0, avgRisk: 0, criticalCount: 0 };
      }
      stats[st].count += 1;
      stats[st].avgRisk += p.risk_score;
      if (p.risk_severity === 'CRITICAL') stats[st].criticalCount += 1;
    });

    Object.keys(stats).forEach((st) => {
      stats[st].avgRisk = Math.round(stats[st].avgRisk / stats[st].count);
    });
    return stats;
  }, [points]);

  // Filter points based on Severity, State, and Search Query
  const filteredPoints = points.filter((p) => {
    if (filterSeverity !== 'ALL' && p.risk_severity !== filterSeverity) return false;
    if (filterState !== 'ALL' && p.state_name !== filterState) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchId = p.work_id.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDist = p.district_name.toLowerCase().includes(q);
      const matchState = p.state_name.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchDist && !matchState) return false;
    }
    return true;
  });

  // Unique list of states for filter dropdown
  const uniqueStates = Array.from(new Set(points.map((p) => p.state_name))).filter(Boolean);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prev) => Math.min(4.5, Math.max(0.9, prev * zoomFactor)));
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(4.5, prev + 0.3));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.9, prev - 0.3));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFilterState('ALL');
  };

  const applyRegionPreset = (preset: RegionPreset) => {
    setZoom(preset.zoom);
    setPan({ x: preset.panX, y: preset.panY });
  };

  const handleStateClick = (stateName: string) => {
    if (filterState === stateName) {
      setFilterState('ALL');
    } else {
      setFilterState(stateName);
      // Auto-select first project in this state if available
      const firstInState = points.find((p) => p.state_name === stateName);
      if (firstInState) {
        setSelectedPoint(firstInState);
      }
    }
  };

  // KPIs
  const criticalCount = points.filter((p) => p.risk_severity === 'CRITICAL').length;
  const highCount = points.filter((p) => p.risk_severity === 'HIGH').length;
  const avgDisparity =
    points.length > 0
      ? Math.round(
          points.reduce(
            (acc, p) => acc + Math.max(0, (p.financial_progress || 0) - (p.physical_progress || 0)),
            0
          ) / points.length
        )
      : 0;

  // Theme-specific colors
  const isDark = mapTheme === 'dark';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Surveillance Badge */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1.5">
              <LocateFixed className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              Official Survey of India Cartographic Vector
            </span>
            <span className="text-xs text-slate-400 font-mono">
              WGS84 Geodetic Calibrated
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <span>Geospatial Intelligence Map of India</span>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              36 States &amp; UTs Live
            </span>
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Authentic geographic vector map of India with interactive state-level drilldown,
            AI-driven spatial overlap detection, and physical-vs-financial disparity telemetry.
          </p>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Sanctioned Assets</div>
              <div className="font-mono font-bold text-slate-900">{points.length} Geocoded</div>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
            <div>
              <div className="text-[10px] text-rose-600 uppercase font-semibold">Critical Risk</div>
              <div className="font-mono font-bold text-rose-900">{criticalCount} Flagged</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-600" />
            <div>
              <div className="text-[10px] text-amber-600 uppercase font-semibold">Avg Disparity</div>
              <div className="font-mono font-bold text-amber-900">+{avgDisparity}% Gap</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Controls & Filters Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search & Selectors */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, title, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical (≥ 90)</option>
              <option value="HIGH">High (75 - 89)</option>
              <option value="MEDIUM">Medium (50 - 74)</option>
              <option value="LOW">Low (&lt; 50)</option>
            </select>
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">State:</span>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="ALL">All States ({uniqueStates.length})</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {filterState !== 'ALL' && (
              <button
                onClick={() => setFilterState('ALL')}
                title="Clear State Filter"
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Layer Toggles & Regional Focus */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Theme Toggle (Dark Surveillance vs Light Atlas) */}
          <button
            onClick={() => setMapTheme(isDark ? 'light' : 'dark')}
            className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors border ${
              isDark
                ? 'bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title="Toggle Map Aesthetic Style"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{isDark ? 'Light Atlas' : 'Dark Tactical'}</span>
          </button>

          {/* Overlap Radar Toggle */}
          <button
            onClick={() => setShowOverlapRadar(!showOverlapRadar)}
            className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors border ${
              showOverlapRadar
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Overlap Radar</span>
          </button>

          {/* Risk Heatmap Glow Toggle */}
          <button
            onClick={() => setShowHeatmapGlow(!showHeatmapGlow)}
            className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors border ${
              showHeatmapGlow
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Risk Glow</span>
          </button>

          {/* State Labels Toggle */}
          <button
            onClick={() => setShowStateLabels(!showStateLabels)}
            className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors border ${
              showStateLabels
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>State Labels</span>
          </button>

          {/* Region Quick Jumper */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <select
              onChange={(e) => {
                const found = REGION_PRESETS.find((r) => r.id === e.target.value);
                if (found) applyRegionPreset(found);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">Focus Region...</option>
              {REGION_PRESETS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Map + Side Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Authentic Original India Map Canvas Area */}
        <div
          ref={mapContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className={`lg:col-span-2 p-4 sm:p-6 rounded-2xl border shadow-2xl relative min-h-[640px] flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing select-none transition-colors duration-300 ${
            isDark
              ? 'bg-gradient-to-b from-slate-950 via-[#0b132b] to-slate-950 border-slate-800 text-slate-100'
              : 'bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] border-slate-300 text-slate-900'
          }`}
        >
          {/* Top Floating Map Telemetry HUD */}
          <div className="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-lg text-[11px] font-mono flex items-center gap-2 ${
                isDark
                  ? 'bg-slate-900/90 border-slate-700 text-slate-300'
                  : 'bg-white/95 border-slate-200 text-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ZOOM: {zoom.toFixed(1)}x</span>
              <span className="opacity-40">|</span>
              <span>
                {filteredPoints.length} of {points.length} Works
              </span>
              {filterState !== 'ALL' && (
                <>
                  <span className="opacity-40">|</span>
                  <span className="font-bold text-blue-500">{filterState}</span>
                </>
              )}
            </div>

            {hoveredState && (
              <div
                className={`px-2.5 py-1.5 rounded-xl backdrop-blur-md border shadow-md text-[11px] font-bold flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-blue-950/90 border-blue-800 text-blue-300'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <span>State: {hoveredState}</span>
                {stateStats[hoveredState] && (
                  <span className="font-mono text-[10px] font-normal opacity-80">
                    ({stateStats[hoveredState].count} works • Avg Risk {stateStats[hoveredState].avgRisk})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Zoom Control Buttons on Map */}
          <div
            className={`absolute top-4 right-4 z-30 flex flex-col gap-1.5 backdrop-blur-md p-1.5 rounded-xl border shadow-xl ${
              isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/95 border-slate-200'
            }`}
          >
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset View"
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Authentic Official India SVG Map Canvas */}
          <div className="relative flex-1 w-full h-full min-h-[500px] flex items-center justify-center">
            <svg
              viewBox={mapData.viewBox}
              className="w-full h-full max-h-[600px] overflow-visible transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: 'center center',
              }}
            >
              <defs>
                {/* Radial Glow Filters for Risk Heatmap */}
                <radialGradient id="heatCritical" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={isDark ? '0.7' : '0.5'} />
                  <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatHigh" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={isDark ? '0.6' : '0.4'} />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>

                {/* Drop shadow filter for pins */}
                <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Background Coordinate Graticules */}
              <g
                opacity={isDark ? '0.08' : '0.12'}
                stroke={isDark ? '#38bdf8' : '#64748b'}
                strokeWidth="0.8"
                strokeDasharray="4,4"
              >
                <line x1="50" y1="100" x2="560" y2="100" />
                <line x1="50" y1="200" x2="560" y2="200" />
                <line x1="50" y1="300" x2="560" y2="300" />
                <line x1="50" y1="400" x2="560" y2="400" />
                <line x1="50" y1="500" x2="560" y2="500" />
                <line x1="50" y1="600" x2="560" y2="600" />
                <line x1="120" y1="40" x2="120" y2="670" />
                <line x1="220" y1="40" x2="220" y2="670" />
                <line x1="320" y1="40" x2="320" y2="670" />
                <line x1="420" y1="40" x2="420" y2="670" />
                <line x1="520" y1="40" x2="520" y2="670" />
              </g>

              {/* Authentic Indian States & Union Territories (from @svg-maps/india) */}
              <g id="indian-states" className="transition-all duration-200">
                {mapData.locations.map((loc) => {
                  const stateName = loc.name;
                  const isHovered = hoveredState === stateName;
                  const isFiltered = filterState === stateName;
                  const hasWorks = stateStats[stateName]?.count > 0;
                  const hasCritical = (stateStats[stateName]?.criticalCount || 0) > 0;

                  // Dynamic fill color according to theme and risk state
                  let fillColor = isDark ? '#111e38' : '#e2e8f0';
                  let strokeColor = isDark ? '#23385d' : '#cbd5e1';

                  if (hasWorks) {
                    if (isDark) {
                      fillColor = hasCritical ? '#1e1c3a' : '#142548';
                      strokeColor = hasCritical ? '#f43f5e' : '#38bdf8';
                    } else {
                      fillColor = hasCritical ? '#ffe4e6' : '#dbeafe';
                      strokeColor = hasCritical ? '#f43f5e' : '#60a5fa';
                    }
                  }

                  if (isHovered || isFiltered) {
                    fillColor = isDark ? '#1e3a8a' : '#bfdbfe';
                    strokeColor = '#3b82f6';
                  }

                  return (
                    <path
                      key={loc.id}
                      id={`state-${loc.id}`}
                      d={loc.path}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isHovered || isFiltered ? 2 : 0.8}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="cursor-pointer transition-colors duration-150"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStateClick(stateName);
                      }}
                      onMouseEnter={() => setHoveredState(stateName)}
                      onMouseLeave={() => setHoveredState(null)}
                    >
                      <title>
                        {stateName}
                        {hasWorks ? ` (${stateStats[stateName].count} Works)` : ''}
                      </title>
                    </path>
                  );
                })}
              </g>

              {/* Authentic State Cartographic Labels */}
              {showStateLabels && (
                <g
                  id="state-labels"
                  className="pointer-events-none select-none"
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  letterSpacing="0.05em"
                >
                  {Object.entries(STATE_LABELS).map(([name, meta]) => {
                    const isHovered = hoveredState === name;
                    const isFiltered = filterState === name;
                    const hasWorks = stateStats[name]?.count > 0;

                    let textColor = isDark ? '#64748b' : '#64748b';
                    if (hasWorks) {
                      textColor = isDark ? '#93c5fd' : '#1e40af';
                    }
                    if (isHovered || isFiltered) {
                      textColor = '#3b82f6';
                    }

                    return (
                      <text
                        key={name}
                        x={meta.x}
                        y={meta.y}
                        textAnchor="middle"
                        fill={textColor}
                        opacity={isHovered || isFiltered ? 1 : 0.75}
                        style={{
                          textShadow: isDark
                            ? '0 1px 2px rgba(0,0,0,0.8)'
                            : '0 1px 2px rgba(255,255,255,0.8)',
                        }}
                      >
                        {meta.label}
                      </text>
                    );
                  })}
                </g>
              )}

              {/* Layer 1: Heatmap Density Glow (Underneath points) */}
              {showHeatmapGlow && (
                <g id="heatmap-glow" className="pointer-events-none">
                  {filteredPoints.map((p) => {
                    const { x, y } = projectGeoToSvg(p.latitude, p.longitude);
                    const isCrit = p.risk_severity === 'CRITICAL';
                    const isHigh = p.risk_severity === 'HIGH';
                    if (!isCrit && !isHigh) return null;

                    return (
                      <circle
                        key={`glow-${p.work_id}`}
                        cx={x}
                        cy={y}
                        r={isCrit ? 36 : 24}
                        fill={isCrit ? 'url(#heatCritical)' : 'url(#heatHigh)'}
                      />
                    );
                  })}
                </g>
              )}

              {/* Layer 2: Proximity Overlap Radar Buffer Rings */}
              {showOverlapRadar && (
                <g id="overlap-radar" className="pointer-events-none">
                  {/* Bankura MPL-1024 & MPL-0892 45-meter spatial overlap */}
                  {filteredPoints
                    .filter((p) => p.work_id === 'MPL-1024' || p.work_id === 'MPL-0892')
                    .map((p) => {
                      const { x, y } = projectGeoToSvg(p.latitude, p.longitude);
                      return (
                        <g key={`radar-${p.work_id}`}>
                          <circle
                            cx={x}
                            cy={y}
                            r={26}
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="1.2"
                            strokeDasharray="4,3"
                            opacity="0.8"
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r={48}
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="0.75"
                            strokeDasharray="6,4"
                            opacity="0.4"
                          />
                          {p.work_id === 'MPL-1024' && (
                            <text
                              x={x + 30}
                              y={y - 10}
                              fill="#f43f5e"
                              fontSize="7.5"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              45m Overlap Buffer
                            </text>
                          )}
                        </g>
                      );
                    })}
                </g>
              )}

              {/* Layer 3: Interactive Work Location Pins */}
              <g id="work-pins">
                {filteredPoints.map((p) => {
                  const { x, y } = projectGeoToSvg(p.latitude, p.longitude);
                  const isSelected = selectedPoint?.work_id === p.work_id;
                  const isHovered = hoveredPoint?.work_id === p.work_id;
                  const isCritical = p.risk_severity === 'CRITICAL';
                  const isHigh = p.risk_severity === 'HIGH';

                  // Severity Pin Palette
                  let pinColor = '#10b981'; // emerald
                  if (isCritical) {
                    pinColor = '#e11d48'; // rose
                  } else if (isHigh) {
                    pinColor = '#f59e0b'; // amber
                  } else if (p.risk_severity === 'MEDIUM') {
                    pinColor = '#3b82f6'; // blue
                  }

                  return (
                    <g
                      key={p.work_id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPoint(p);
                      }}
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer group"
                      filter="url(#pinShadow)"
                    >
                      {/* Pulsing beacon ring for critical works */}
                      {isCritical && (
                        <circle
                          cx={x}
                          cy={y}
                          r="12"
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                          opacity="0.7"
                          className="animate-ping"
                        />
                      )}

                      {/* Selection Reticle Rings */}
                      {isSelected && (
                        <g>
                          <circle
                            cx={x}
                            cy={y}
                            r="15"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="2"
                            strokeDasharray="4,2"
                          />
                          <circle cx={x} cy={y} r="20" fill="none" stroke="#38bdf8" strokeWidth="1" />
                        </g>
                      )}

                      {/* Main Pin Outer Marker */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 8.5 : isHovered ? 7.5 : 6}
                        fill={pinColor}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        className="transition-all duration-150"
                      />

                      {/* Inner glyph dot */}
                      <circle cx={x} cy={y} r={isSelected ? 3 : 2} fill="#ffffff" />

                      {/* District Label on Critical/Hover/Selected */}
                      {(isCritical || isSelected || isHovered) && (
                        <g className="pointer-events-none">
                          <rect
                            x={x - 28}
                            y={y + 10}
                            width="56"
                            height="14"
                            rx="3"
                            fill={isDark ? '#090d16' : '#ffffff'}
                            fillOpacity="0.9"
                            stroke={isDark ? '#334155' : '#cbd5e1'}
                            strokeWidth="0.8"
                          />
                          <text
                            x={x}
                            y={y + 20}
                            textAnchor="middle"
                            fill={isDark ? '#f1f5f9' : '#0f172a'}
                            fontSize="7.5"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {p.district_name}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Floating Hover Tooltip HUD for Pin */}
          {hoveredPoint && (
            <div
              className={`absolute pointer-events-none z-40 p-3 rounded-xl shadow-2xl text-xs max-w-xs transition-opacity duration-150 border ${
                isDark
                  ? 'bg-slate-900/95 backdrop-blur-md border-slate-700 text-slate-100'
                  : 'bg-white/95 backdrop-blur-md border-slate-300 text-slate-900'
              }`}
              style={{
                bottom: '56px',
                left: '20px',
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/20 pb-1.5 mb-1.5">
                <span className="font-mono font-bold text-blue-500">{hoveredPoint.work_id}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    hoveredPoint.risk_severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : hoveredPoint.risk_severity === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  RISK {hoveredPoint.risk_score}
                </span>
              </div>
              <div className="font-bold text-xs truncate mb-1">{hoveredPoint.title}</div>
              <div className="text-[11px] opacity-75 flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>
                  {hoveredPoint.district_name}, {hoveredPoint.state_name}
                </span>
              </div>
              <div
                className={`grid grid-cols-2 gap-2 text-[10px] p-2 rounded-lg font-mono ${
                  isDark ? 'bg-slate-950/60' : 'bg-slate-100'
                }`}
              >
                <div>
                  <span className="opacity-60">Finance Disbursed:</span>
                  <div className="text-blue-500 font-bold">{hoveredPoint.financial_progress}%</div>
                </div>
                <div>
                  <span className="opacity-60">Physical Milestone:</span>
                  <div className="text-amber-500 font-bold">{hoveredPoint.physical_progress}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Interactive Legend */}
          <div
            className={`relative z-10 pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-[11px] ${
              isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Critical Risk (≥90)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>High Risk (75-89)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Medium (50-74)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Low (&lt;50)</span>
              </span>
              {showOverlapRadar && (
                <span className="flex items-center gap-1.5 text-rose-400">
                  <Radar className="w-3 h-3" />
                  <span>Overlap Buffer</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] opacity-75">
              <span>Click any state to drill down • Drag to Pan</span>
            </div>
          </div>
        </div>

        {/* Selected Project Dossier & Telemetry Side Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          {selectedPoint ? (
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedPoint.work_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        selectedPoint.status === 'DELAYED'
                          ? 'bg-rose-100 text-rose-800'
                          : selectedPoint.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedPoint.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-1.5 leading-snug">
                    {selectedPoint.title}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {selectedPoint.district_name}, {selectedPoint.state_name}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-xl font-mono font-extrabold text-xs shadow-xs ${
                      selectedPoint.risk_score >= 90
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : selectedPoint.risk_score >= 75
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    RISK {selectedPoint.risk_score}/100
                  </span>
                </div>
              </div>

              {/* Physical vs Financial Progress Gap */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span className="text-slate-600">Financial Disbursed</span>
                    <span className="font-mono text-blue-700">
                      {selectedPoint.financial_progress ?? 0}% (₹{selectedPoint.expenditure ?? 0}L)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${selectedPoint.financial_progress ?? 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span className="text-slate-600">Physical Progress Verified</span>
                    <span className="font-mono text-amber-700">
                      {selectedPoint.physical_progress ?? 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${selectedPoint.physical_progress ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Disparity Alert if gap > 20% */}
                {selectedPoint.financial_progress - selectedPoint.physical_progress > 20 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-[11px]">
                    <span className="font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Disparity Warning:
                    </span>
                    <span className="font-mono font-bold text-amber-950">
                      +{selectedPoint.financial_progress - selectedPoint.physical_progress}% Gap
                    </span>
                  </div>
                )}

                {/* Telemetry Attributes Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">GPS Coordinates:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedPoint.latitude?.toFixed(4) ?? '23.2324'}° N,{' '}
                      {selectedPoint.longitude?.toFixed(4) ?? '87.0715'}° E
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Work Category:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedPoint.work_type || 'Civic Infrastructure'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sanctioned Outlay:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{selectedPoint.sanctioned_cost ?? 0} Lakhs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Expenditure:</span>
                    <span className="font-mono font-bold text-blue-700">
                      ₹{selectedPoint.expenditure ?? 0} Lakhs
                    </span>
                  </div>
                </div>
              </div>

              {/* Signature Overlap Alert Box for Bankura MPL-1024 */}
              {selectedPoint.work_id === 'MPL-1024' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-rose-800">
                    <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                    Proximity &amp; Duplicate Risk Flagged
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Identified <strong>45-meter spatial overlap</strong> with completed community
                    hall <strong>MPL-0892</strong>. 51% fund disparity detected without
                    corresponding milestone certification.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2 my-auto">
              <MapPin className="w-8 h-8 text-slate-300" />
              <span>Select any project pin or state on the map to inspect live telemetry.</span>
            </div>
          )}

          {/* Action Footer */}
          {selectedPoint && (
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => openProjectDetail(selectedPoint.work_id)}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Inspect Full Project Digital Twin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
