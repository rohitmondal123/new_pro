import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  LineChart as LineIcon,
  AreaChart as AreaIcon,
  Radar as RadarIcon,
  Sparkles,
  Send,
  Download,
  Table as TableIcon,
  Maximize2,
  Minimize2,
  Lightbulb,
  Copy,
  Check,
  Bot,
  User,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AiChartResponse, ChartType } from '../../types/mplads';

// Natural Tones Color Palette
const COLOR_PALETTE = [
  '#283618', // Deep Forest Green
  '#606C38', // Moss Olive
  '#8A9A5B', // Sage Leaf
  '#BC6C25', // Terracotta Rust
  '#DDA15E', // Warm Ochre
  '#BC4749', // Brick Red
  '#43522C', // Dark Earth Olive
  '#D4A373', // Sand Tan
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  timestamp: string;
  query?: string;
  chart?: AiChartResponse;
  text?: string;
  currentTypeOverride?: ChartType;
  showTable?: boolean;
}

const PRESET_PROMPTS = [
  { label: '📊 Financial vs Physical Gap', query: 'Show financial vs physical progress gap chart for top priority works' },
  { label: '💰 Cost Overruns Comparison', query: 'Compare sanctioned cost vs actual expenditure across flagged works' },
  { label: '⚠️ Risk Severity Breakdown', query: 'Plot risk severity distribution pie chart for all monitored projects' },
  { label: '⏱️ Delays by Work Category', query: 'Chart average delay days and breach probability by work type' },
  { label: '🏢 Top Vendor Concentration', query: 'Show top vendor concentration percentages and contract exposure' },
  { label: '🎯 Health Radar (MPL-1024)', query: 'Generate project health radar chart for MPL-1024' },
  { label: '🗺️ State Fund Utilization', query: 'Compare fund utilization percentage across states' },
  { label: '📈 Monthly Expenditure Trajectory', query: 'Show monthly cumulative sanction vs expenditure trend' },
];

export const AiChartBotView: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [preferredType, setPreferredType] = useState<string>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fullscreenChart, setFullscreenChart] = useState<AiChartResponse | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial welcome message with sample chart
  useEffect(() => {
    loadInitialChart();
  }, []);

  const loadInitialChart = async () => {
    setIsLoading(true);
    try {
      const initialChart = await api.generateAiChart(
        'Show financial vs physical progress gap chart for top priority works',
        currentUser.role,
        'bar'
      );

      setMessages([
        {
          id: 'welcome-1',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Namaste, **${currentUser.name}** (${currentUser.badge}). Welcome to the **MPLADS AI Chart Bot** — your conversational visual analytics engine powered by **Gemini Intelligence** and real-time MoSPI programmatic telemetry across **52,480 active works**.

Ask me in plain natural language to chart, plot, or compare any aspect of the MPLADS dataset (Progress gaps, cost overruns, delays, vendor concentration, risk ratings, or state trajectories).`,
          chart: initialChart,
          query: 'Show financial vs physical progress gap chart for top priority works',
        },
      ]);
    } catch (err) {
      console.error('Failed to load initial chart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    setInputQuery('');
    const userMsgId = `usr-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: q,
      },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const chartRes = await api.generateAiChart(
        q,
        currentUser.role,
        preferredType !== 'auto' ? preferredType : undefined
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          query: q,
          chart: chartRes,
        },
      ]);
    } catch (err: any) {
      console.error('Error generating AI chart:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `⚠️ I encountered an error while synthesizing this visual chart. Please try rephrasing your question or choose one of the preset prompts below.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const setChartTypeForMessage = (messageId: string, newType: ChartType) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, currentTypeOverride: newType, showTable: false } : msg
      )
    );
  };

  const toggleTableViewForMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, showTable: !msg.showTable } : msg
      )
    );
  };

  const copyDataAsJson = (chart: AiChartResponse, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(chart.data, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportDataAsCsv = (chart: AiChartResponse) => {
    if (!chart.data || chart.data.length === 0) return;
    const headers = Object.keys(chart.data[0]);
    const csvRows = [
      headers.join(','),
      ...chart.data.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chart.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render dynamic Recharts component based on chartType
  const renderChart = (chart: AiChartResponse, activeType: ChartType, height = 340) => {
    const data = chart.data || [];
    const series = chart.series || [];
    const xAxisKey = chart.xAxisKey || 'name';

    if (activeType === 'pie') {
      const dataKey = series[0]?.key || Object.keys(data[0] || {}).find((k) => k !== xAxisKey && typeof data[0][k] === 'number') || 'count';
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={105}
              innerRadius={50}
              paddingAngle={3}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLOR_PALETTE[index % COLOR_PALETTE.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A2612',
                borderColor: '#2D3F1E',
                color: '#FEFAE0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', color: '#606C38', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (activeType === 'radar') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius={110}>
            <PolarGrid stroke="#CCD5AE" />
            <PolarAngleAxis
              dataKey={xAxisKey}
              tick={{ fill: '#283618', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#8A9A5B" tick={{ fontSize: 10 }} />
            {series.map((s, idx) => (
              <Radar
                key={s.key}
                name={s.label}
                dataKey={s.key}
                stroke={s.color || COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                fill={s.color || COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                fillOpacity={0.4}
              />
            ))}
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A2612',
                borderColor: '#2D3F1E',
                color: '#FEFAE0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#283618', paddingTop: '8px' }} />
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    if (activeType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 15, right: 25, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DA" />
            <XAxis
              dataKey={xAxisKey}
              stroke="#606C38"
              fontSize={11}
              angle={-20}
              textAnchor="end"
              interval={0}
            />
            <YAxis stroke="#606C38" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A2612',
                borderColor: '#2D3F1E',
                color: '#FEFAE0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#283618', paddingTop: '10px' }} />
            {series.map((s, idx) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color || COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: s.color || COLOR_PALETTE[idx % COLOR_PALETTE.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (activeType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 15, right: 25, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DA" />
            <XAxis
              dataKey={xAxisKey}
              stroke="#606C38"
              fontSize={11}
              angle={-20}
              textAnchor="end"
              interval={0}
            />
            <YAxis stroke="#606C38" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A2612',
                borderColor: '#2D3F1E',
                color: '#FEFAE0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#283618', paddingTop: '10px' }} />
            {series.map((s, idx) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color || COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                fill={s.color || COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                fillOpacity={0.35}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Default: Bar Chart
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 15, right: 25, left: 0, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DA" />
          <XAxis
            dataKey={xAxisKey}
            stroke="#606C38"
            fontSize={11}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis stroke="#606C38" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A2612',
              borderColor: '#2D3F1E',
              color: '#FEFAE0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#283618', paddingTop: '10px' }} />
          {series.map((s, idx) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color || COLOR_PALETTE[idx % COLOR_PALETTE.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Header */}
      <div className="theme-surface p-5 rounded-2xl border theme-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--app-pill-bg)',
                color: 'var(--app-pill-text)',
                borderColor: 'var(--app-pill-border)',
              }}
            >
              Visual Analytics Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Recharts • Grounded Engine
            </span>
          </div>
          <h1 className="text-xl font-bold theme-text mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            AI Chart Bot
          </h1>
          <p className="text-xs theme-text-secondary mt-0.5 max-w-2xl">
            Conversational data visualizer that automatically parses natural language questions, extracts real-time telemetry from 52,480 works, and generates interactive charts with multi-type toggles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-xs px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1.5 border"
            style={{
              backgroundColor: 'var(--app-pill-bg)',
              color: 'var(--app-pill-text)',
              borderColor: 'var(--app-pill-border)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Gemini + Recharts Active
          </span>
          <button
            onClick={() => {
              setMessages([]);
              loadInitialChart();
            }}
            title="Reset Chat & Visualizer"
            className="p-2 text-slate-500 hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border theme-border transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Quick Prompt Chips Bar */}
      <div className="theme-surface-subtle p-3 rounded-xl border theme-border shadow-2xs">
        <div className="flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-wider font-mono opacity-80">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Instant Visual Analytics Gallery (Click to Chart):
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full theme-surface hover:bg-slate-100 dark:hover:bg-slate-800 theme-text border theme-border font-medium transition-all shadow-2xs hover:border-blue-500 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{p.label}</span>
              <ArrowRight className="w-3 h-3 text-blue-500 opacity-70" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="theme-surface rounded-2xl border theme-border shadow-xs flex flex-col min-h-[550px] max-h-[720px]">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            const chart = msg.chart;
            const currentChartType = msg.currentTypeOverride || chart?.chartType || 'bar';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs ${
                    isBot
                      ? 'bg-[#0B192C] text-amber-400 border border-slate-700'
                      : 'bg-[#0B192C] text-white border border-slate-700'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4 text-[#FF9933]" /> : <User className="w-4 h-4 text-[#FF9933]" />}
                </div>

                {/* Content Box */}
                <div
                  className={`max-w-4xl rounded-2xl p-4 sm:p-5 shadow-sm ${
                    isBot
                      ? 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 w-full rounded-tl-xs'
                      : 'bg-[#0B192C] text-white font-semibold rounded-tr-xs border border-slate-700 shadow-md'
                  }`}
                >
                  {/* Message Text (if any) */}
                  {msg.text && (
                    <div className={`whitespace-pre-line text-sm font-sans mb-3 leading-relaxed ${isBot ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-white font-semibold'}`}>
                      {msg.text}
                    </div>
                  )}

                  {/* Chart Card (if generated) */}
                  {chart && (
                    <div className="space-y-4">
                      {/* Chart Header Toolbar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E3DA] pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-[#283618] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#BC6C25]" />
                            {chart.title}
                          </h3>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {chart.description}
                          </p>
                        </div>

                        {/* Chart Controls & Type Switchers */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Type toggles */}
                          <div className="flex items-center bg-[#F4F6EE] p-0.5 rounded-lg border border-[#CCD5AE]">
                            <button
                              onClick={() => setChartTypeForMessage(msg.id, 'bar')}
                              title="Bar Chart"
                              className={`p-1.5 rounded text-xs transition-colors ${
                                currentChartType === 'bar' && !msg.showTable
                                  ? 'bg-[#283618] text-[#FEFAE0]'
                                  : 'text-[#606C38] hover:bg-white'
                              }`}
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setChartTypeForMessage(msg.id, 'line')}
                              title="Line Chart"
                              className={`p-1.5 rounded text-xs transition-colors ${
                                currentChartType === 'line' && !msg.showTable
                                  ? 'bg-[#283618] text-[#FEFAE0]'
                                  : 'text-[#606C38] hover:bg-white'
                              }`}
                            >
                              <LineIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setChartTypeForMessage(msg.id, 'area')}
                              title="Area Chart"
                              className={`p-1.5 rounded text-xs transition-colors ${
                                currentChartType === 'area' && !msg.showTable
                                  ? 'bg-[#283618] text-[#FEFAE0]'
                                  : 'text-[#606C38] hover:bg-white'
                              }`}
                            >
                              <AreaIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setChartTypeForMessage(msg.id, 'pie')}
                              title="Pie Chart"
                              className={`p-1.5 rounded text-xs transition-colors ${
                                currentChartType === 'pie' && !msg.showTable
                                  ? 'bg-[#283618] text-[#FEFAE0]'
                                  : 'text-[#606C38] hover:bg-white'
                              }`}
                            >
                              <PieIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setChartTypeForMessage(msg.id, 'radar')}
                              title="Radar Chart"
                              className={`p-1.5 rounded text-xs transition-colors ${
                                currentChartType === 'radar' && !msg.showTable
                                  ? 'bg-[#283618] text-[#FEFAE0]'
                                  : 'text-[#606C38] hover:bg-white'
                              }`}
                            >
                              <RadarIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Data Table Toggle */}
                          <button
                            onClick={() => toggleTableViewForMessage(msg.id)}
                            title={msg.showTable ? 'Switch to Graphical Chart' : 'View Data Table'}
                            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                              msg.showTable
                                ? 'bg-[#283618] text-[#FEFAE0] border-[#283618]'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-[#F4F6EE]'
                            }`}
                          >
                            <TableIcon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px] font-medium">
                              {msg.showTable ? 'Chart' : 'Table'}
                            </span>
                          </button>

                          {/* Export CSV */}
                          <button
                            onClick={() => exportDataAsCsv(chart)}
                            title="Export CSV"
                            className="p-1.5 bg-white hover:bg-[#F4F6EE] text-slate-700 border border-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy JSON */}
                          <button
                            onClick={() => copyDataAsJson(chart, msg.id)}
                            title="Copy Data JSON"
                            className="p-1.5 bg-white hover:bg-[#F4F6EE] text-slate-700 border border-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Fullscreen Expand */}
                          <button
                            onClick={() => setFullscreenChart(chart)}
                            title="Expand Fullscreen"
                            className="p-1.5 bg-white hover:bg-[#F4F6EE] text-slate-700 border border-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Summary KPI Badges (if present) */}
                      {chart.summaryStats && chart.summaryStats.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {chart.summaryStats.map((stat, sIdx) => (
                            <div
                              key={sIdx}
                              className="bg-white p-2.5 rounded-xl border border-[#E8E3DA] shadow-2xs"
                            >
                              <div className="text-[10px] uppercase font-mono font-bold text-slate-500">
                                {stat.label}
                              </div>
                              <div className="text-base font-bold text-[#283618] mt-0.5">
                                {stat.value}
                              </div>
                              {stat.hint && (
                                <div className="text-[10px] text-[#606C38] mt-0.5 truncate">
                                  {stat.hint}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Visual Chart / Table Body */}
                      <div className="bg-white p-3 rounded-xl border border-[#E8E3DA] shadow-inner">
                        {msg.showTable ? (
                          <div className="overflow-x-auto max-h-72">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="border-b border-[#E8E3DA] bg-[#F4F6EE] text-[#283618] font-bold">
                                  {Object.keys(chart.data[0] || {}).map((key) => (
                                    <th key={key} className="p-2 capitalize">
                                      {key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {chart.data.map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className="border-b border-slate-100 hover:bg-[#FAFBF7]"
                                  >
                                    {Object.keys(row).map((k) => (
                                      <td key={k} className="p-2 font-mono text-[11px]">
                                        {typeof row[k] === 'number'
                                          ? row[k].toLocaleString()
                                          : String(row[k])}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          renderChart(chart, currentChartType, 320)
                        )}
                      </div>

                      {/* AI Executive Insights & Findings */}
                      {chart.insights && chart.insights.length > 0 && (
                        <div className="bg-[#F4F6EE] p-3.5 rounded-xl border border-[#CCD5AE]">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#283618] mb-1.5 font-mono">
                            <Lightbulb className="w-3.5 h-3.5 text-[#BC6C25]" />
                            AI Visual Analytics Commentary:
                          </div>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {chart.insights.map((insight, inIdx) => (
                              <li key={inIdx} className="flex items-start gap-1.5">
                                <span className="text-[#606C38] font-bold mt-0.5">•</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Drill-down Suggested Prompts */}
                      {chart.suggestedPrompts && chart.suggestedPrompts.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                            Drill-Down Questions:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {chart.suggestedPrompts.map((sp, pIdx) => (
                              <button
                                key={pIdx}
                                onClick={() => handleSend(sp)}
                                className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-[#F4F6EE] text-[#283618] border border-[#CCD5AE] font-medium transition-colors text-left cursor-pointer"
                              >
                                {sp} →
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-[9px] text-slate-400 mt-2 font-mono text-right">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-500 max-w-md">
              <div
                className="w-8 h-8 rounded-xl text-white flex items-center justify-center animate-pulse"
                style={{
                  backgroundColor: 'var(--app-brand-accent)',
                  color: 'var(--app-brand-accent-text)',
                }}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="p-3.5 theme-surface rounded-xl border theme-border flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span className="font-medium theme-text">
                  AI synthesizing telemetry & plotting chart...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Query Input Bar */}
        <div className="p-4 border-t theme-border theme-surface-subtle rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            {/* Preferred Chart Type Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-bold text-slate-500 font-mono hidden md:inline">
                Format:
              </span>
              <select
                value={preferredType}
                onChange={(e) => setPreferredType(e.target.value)}
                className="theme-surface border theme-border rounded-xl px-2.5 py-2.5 text-xs theme-text font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="auto">Auto (AI Choice)</option>
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="radar">Radar Chart</option>
              </select>
            </div>

            {/* Natural Language Prompt Input */}
            <input
              type="text"
              placeholder="Ask for any chart (e.g. 'Compare delay days vs progress gap for Bankura', 'Pie chart of project status')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 theme-input border-2 border-slate-300 dark:border-slate-600 focus:border-[#FF671F] rounded-xl px-4 py-3 text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#FF671F]/30 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              style={{
                color: 'var(--app-text-primary, #0B192C)',
                backgroundColor: 'var(--app-surface-subtle, #F5F7FA)',
                caretColor: '#FF671F',
              }}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-5 py-3 disabled:opacity-50 font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 bg-[#FF671F] hover:bg-[#e85a15] text-white active:scale-95"
            >
              <span>Generate Chart</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono px-1">
            <span>Supports Natural Language • Instant Multi-Format Rendering</span>
            <span>Dataset: 52,480 Active MPLADS Works</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Chart Modal */}
      {fullscreenChart && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-2xl p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#283618] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#606C38]" />
                  {fullscreenChart.title}
                </h3>
                <p className="text-xs text-slate-500">{fullscreenChart.description}</p>
              </div>
              <button
                onClick={() => setFullscreenChart(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-[420px]">
              {renderChart(fullscreenChart, fullscreenChart.chartType, 420)}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">
                Exported from Team Drishti AI Chart Studio
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportDataAsCsv(fullscreenChart)}
                  className="px-3 py-1.5 bg-[#F4F6EE] hover:bg-[#E9EDC9] text-[#283618] border border-[#CCD5AE] rounded-lg text-xs font-medium cursor-pointer"
                >
                  Download CSV Data
                </button>
                <button
                  onClick={() => setFullscreenChart(null)}
                  className="px-3 py-1.5 bg-[#283618] text-[#FEFAE0] rounded-lg text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
