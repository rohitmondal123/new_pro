import {
  DashboardMetrics,
  WorkItem,
  AlertRecord,
  PaymentRecord,
  AgencyMetrics,
  ComplianceRule,
  DuplicateMatch,
  AuditLogEntry,
  DataQualityReport,
  GraphNode,
  GraphLink,
  AiChartResponse,
  ChartType,
} from '../types/mplads';
import {
  INITIAL_WORKS,
  INITIAL_PAYMENTS,
  INITIAL_ALERTS,
  INITIAL_DUPLICATES,
  INITIAL_AGENCIES,
  INITIAL_COMPLIANCE_RULES,
  INITIAL_AUDIT_LOGS,
  INITIAL_DATA_QUALITY,
  INITIAL_DASHBOARD_METRICS,
  INITIAL_GRAPH_NODES,
  INITIAL_GRAPH_LINKS,
  SYNTHETIC_DISCLAIMER,
} from '../data/syntheticData';

// In-memory working copies for client-side persistence
const localWorks: WorkItem[] = JSON.parse(JSON.stringify(INITIAL_WORKS));
const localAlerts: AlertRecord[] = JSON.parse(JSON.stringify(INITIAL_ALERTS));
const localAuditLogs: AuditLogEntry[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
const localPayments: PaymentRecord[] = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));

export const clientFallback = {
  getHealth: async () => ({
    status: 'ok',
    mode: 'client_resilient_mode',
    gemini_enabled: false,
  }),

  getDashboard: async (filters?: { state?: string; district?: string; work_type?: string }) => {
    let filteredWorks = [...localWorks];
    if (filters?.state && filters.state !== 'ALL') {
      filteredWorks = filteredWorks.filter(
        (w) => w.state_name === filters.state || w.state_id === filters.state
      );
    }
    if (filters?.district && filters.district !== 'ALL') {
      filteredWorks = filteredWorks.filter((w) => w.district_name === filters.district);
    }
    if (filters?.work_type && filters.work_type !== 'ALL') {
      filteredWorks = filteredWorks.filter((w) => w.work_type === filters.work_type);
    }

    const criticalCount = filteredWorks.filter((w) => w.risk_severity === 'CRITICAL').length;
    const highCount = filteredWorks.filter((w) => w.risk_severity === 'HIGH').length;
    const delayedCount = filteredWorks.filter((w) => w.delay_days > 0 || w.status === 'DELAYED').length;
    const completedCount = filteredWorks.filter((w) => w.status === 'COMPLETED').length;

    return {
      ...INITIAL_DASHBOARD_METRICS,
      active_works_filtered: filteredWorks.length,
      critical_alerts: localAlerts.filter((a) => a.status === 'NEW' && a.severity === 'CRITICAL').length,
      high_risk_works: criticalCount + highCount,
      delayed_works: delayedCount,
      completed_works: completedCount,
      works_sample: filteredWorks,
    };
  },

  getWorks: async (params?: Record<string, string>) => {
    let results = [...localWorks];
    const search = params?.search?.toLowerCase();
    const state = params?.state;
    const district = params?.district;
    const riskLevel = params?.risk_level;
    const status = params?.status;
    const workType = params?.work_type;
    const sortBy = params?.sort_by || 'risk_score';
    const order = params?.order || 'desc';
    const limit = parseInt(params?.limit || '50', 10);
    const offset = parseInt(params?.offset || '0', 10);

    if (search) {
      results = results.filter(
        (w) =>
          w.work_id.toLowerCase().includes(search) ||
          w.title.toLowerCase().includes(search) ||
          w.district_name.toLowerCase().includes(search) ||
          w.mp_name.toLowerCase().includes(search) ||
          w.vendor_name.toLowerCase().includes(search)
      );
    }

    if (state && state !== 'ALL') {
      results = results.filter((w) => w.state_name === state || w.state_id === state);
    }

    if (district && district !== 'ALL') {
      results = results.filter((w) => w.district_name === district);
    }

    if (riskLevel && riskLevel !== 'ALL') {
      results = results.filter((w) => w.risk_severity === riskLevel);
    }

    if (status && status !== 'ALL') {
      results = results.filter((w) => w.status === status);
    }

    if (workType && workType !== 'ALL') {
      results = results.filter((w) => w.work_type === workType);
    }

    results.sort((a: any, b: any) => {
      const aVal = a[sortBy] ?? 0;
      const bVal = b[sortBy] ?? 0;
      return order === 'desc' ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
    });

    const paginated = results.slice(offset, offset + limit);

    return {
      total: results.length,
      limit,
      offset,
      items: paginated,
    };
  },

  getWorkById: async (id: string): Promise<WorkItem> => {
    const work = localWorks.find((w) => w.work_id.toUpperCase() === id.toUpperCase());
    if (!work) {
      throw new Error(`Work item with ID ${id} not found`);
    }
    return work;
  },

  getWorkTimeline: async (id: string) => {
    const work = localWorks.find((w) => w.work_id.toUpperCase() === id.toUpperCase());
    return work?.timeline_events || [];
  },

  getRiskDetails: async (id: string) => {
    const work = localWorks.find((w) => w.work_id.toUpperCase() === id.toUpperCase());
    if (!work) throw new Error(`Work item not found: ${id}`);
    return {
      work_id: work.work_id,
      title: work.title,
      risk_score: work.risk_score,
      risk_severity: work.risk_severity,
      risk_factors: work.risk_factors,
      anomaly_types: work.anomaly_types,
      statutory_disclaimer: SYNTHETIC_DISCLAIMER,
    };
  },

  getAlerts: async (): Promise<AlertRecord[]> => {
    return localAlerts;
  },

  acknowledgeAlert: async (id: string, note?: string, officerName?: string) => {
    const alert = localAlerts.find((a) => a.alert_id === id);
    if (!alert) throw new Error(`Alert ${id} not found`);

    alert.status = 'UNDER_REVIEW';
    alert.acknowledged_at = new Date().toISOString();
    alert.acknowledged_by = officerName || 'Current Officer';
    alert.resolution_note = note || 'Acknowledged for field follow-up';

    localAuditLogs.unshift({
      id: `AUD-${Date.now()}`,
      user_id: 'USR-AUTH-01',
      user_name: officerName || 'District Magistrate / Nodal Officer',
      user_role: 'DISTRICT_AUTHORITY',
      action: 'ALERT_ACKNOWLEDGED',
      entity: 'ALERT',
      entity_id: alert.alert_id,
      timestamp: new Date().toISOString(),
      metadata: { work_id: alert.work_id, note },
    });

    return { success: true, alert };
  },

  getMapPoints: async () => {
    return localWorks.map((w) => ({
      work_id: w.work_id,
      title: w.title,
      latitude: w.latitude,
      longitude: w.longitude,
      lat: w.latitude,
      lng: w.longitude,
      location: w.location,
      state_name: w.state_name,
      district_name: w.district_name,
      work_type: w.work_type,
      risk_score: w.risk_score,
      risk_severity: w.risk_severity,
      status: w.status,
      financial_progress: w.financial_progress,
      physical_progress: w.physical_progress,
      expenditure: w.expenditure,
      sanctioned_cost: w.sanctioned_cost,
      cost: w.sanctioned_cost,
      gap: w.progress_gap,
      delay_days: w.delay_days,
      vendor_name: w.vendor_name,
    }));
  },

  getPayments: async (workId?: string, flaggedOnly?: boolean): Promise<PaymentRecord[]> => {
    let list = [...localPayments];
    if (workId) {
      list = list.filter((p) => p.work_id === workId);
    }
    if (flaggedOnly) {
      list = list.filter((p) => p.status === 'FLAGGED_ANOMALY');
    }
    return list;
  },

  getAgencies: async (): Promise<AgencyMetrics[]> => {
    return INITIAL_AGENCIES;
  },

  getCompliance: async () => {
    return {
      rules: INITIAL_COMPLIANCE_RULES,
      summary: {
        total_rules_enforced: INITIAL_COMPLIANCE_RULES.length,
        mandatory_clauses_met: 7,
        non_compliance_alerts_active: 3,
      },
    };
  },

  getDuplicates: async (): Promise<DuplicateMatch[]> => {
    return INITIAL_DUPLICATES;
  },

  getPredictions: async () => {
    const highDelay = localWorks
      .filter((w) => w.delay_probability >= 70 && w.status !== 'COMPLETED')
      .sort((a, b) => b.delay_probability - a.delay_probability);

    const highCost = localWorks
      .filter((w) => w.expenditure > w.sanctioned_cost)
      .sort((a, b) => b.expenditure - b.sanctioned_cost - (a.expenditure - a.sanctioned_cost));

    return {
      high_delay_probability_works: highDelay,
      high_cost_deviation_works: highCost,
    };
  },

  getInspectionPriority: async (): Promise<WorkItem[]> => {
    return [...localWorks]
      .filter((w) => w.status !== 'COMPLETED')
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10);
  },

  getAnalytics: async () => {
    return {
      metrics: INITIAL_DASHBOARD_METRICS,
      reality_matrix: [
        { progress_bracket: '0-25%', count: 8, avg_delay: 85, avg_overrun: 4.2 },
        { progress_bracket: '26-50%', count: 14, avg_delay: 68, avg_overrun: 8.9 },
        { progress_bracket: '51-75%', count: 18, avg_delay: 42, avg_overrun: 12.4 },
        { progress_bracket: '76-99%', count: 9, avg_delay: 24, avg_overrun: 14.1 },
        { progress_bracket: '100% Completed', count: 3, avg_delay: 0, avg_overrun: 1.5 },
      ],
    };
  },

  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    return localAuditLogs;
  },

  logAudit: async (data: Partial<AuditLogEntry>) => {
    const entry: AuditLogEntry = {
      id: data.id || `AUD-${Date.now()}`,
      user_id: data.user_id || 'USR-OP-01',
      user_name: data.user_name || 'District Authority Officer',
      user_role: data.user_role || 'DISTRICT_AUTHORITY',
      action: data.action || 'FIELD_INSPECTION_SCHEDULED',
      entity: data.entity || 'WORK',
      entity_id: data.entity_id || 'MPL-1024',
      timestamp: new Date().toISOString(),
      metadata: data.metadata || {},
    };
    localAuditLogs.unshift(entry);
    return { success: true, entry };
  },

  getDataQuality: async (): Promise<DataQualityReport> => {
    return INITIAL_DATA_QUALITY;
  },

  scheduleInspection: async (data: {
    work_id: string;
    officer_name: string;
    target_date: string;
    notes?: string;
  }) => {
    const work = localWorks.find((w) => w.work_id === data.work_id);
    if (!work) throw new Error(`Work not found: ${data.work_id}`);

    work.timeline_events.push({
      id: `EVT-${Date.now()}`,
      date: data.target_date,
      stage: 'INSPECTION',
      label: `Physical Spot Inspection (${data.officer_name})`,
      status: 'PENDING',
      note: data.notes || 'Routine anomaly verification',
    });

    localAuditLogs.unshift({
      id: `AUD-${Date.now()}`,
      user_id: 'USR-INSP-01',
      user_name: data.officer_name,
      user_role: 'INSPECTOR',
      action: 'INSPECTION_SCHEDULED',
      entity: 'WORK',
      entity_id: work.work_id,
      timestamp: new Date().toISOString(),
      metadata: { target_date: data.target_date, notes: data.notes },
    });

    return { success: true, work };
  },

  uploadDataBatch: async (fileName: string, recordsCount: number) => {
    const batchId = `BATCH-${Date.now()}`;
    localAuditLogs.unshift({
      id: `AUD-${Date.now()}`,
      user_id: 'USR-SYS-01',
      user_name: 'Data System Integrator',
      user_role: 'STATE_AUTHORITY',
      action: 'DATA_INGESTION_BATCH',
      entity: 'BATCH',
      entity_id: batchId,
      timestamp: new Date().toISOString(),
      metadata: { fileName, recordsCount },
    });

    return {
      success: true,
      batch_id: batchId,
      file_name: fileName,
      records_ingested: recordsCount,
      timestamp: new Date().toISOString(),
    };
  },

  generateReport: async (workId: string) => {
    const work = localWorks.find((w) => w.work_id === workId) || localWorks[0];
    const dossier = `### STATUTORY ADMINISTRATIVE RISK DOSSIER
**Project**: ${work.title} (${work.work_id})
**Constituency**: ${work.constituency_name}, ${work.state_name}
**Sanctioned Cost**: ₹${work.sanctioned_cost}L | **Current Expenditure**: ₹${work.expenditure}L
**Financial Progress**: ${work.financial_progress}% | **Physical Progress**: ${work.physical_progress}% (Disparity Gap: ${work.progress_gap}pp)
**Risk Severity**: ${work.risk_severity} (Composite Score: ${work.risk_score}/100)
**Executing Agency**: ${work.agency_name}
**Vendor Contractor**: ${work.vendor_name}

**Identified Anomaly Flags**:
${(work.anomaly_types || ['COST_OVERRUN', 'PROGRESS_DISPARITY']).map((a) => `- ${a}`).join('\n')}

**Recommended Administrative Steps**:
1. Issue formal notice under Section 4.2 of MPLADS Operational Guidelines regarding unapproved cost escalation.
2. Direct DRDA to conduct physical measurement verification before releasing further fund installments.
3. Cross-reference vendor GSTIN against Central CPWD debarment registry.`;

    return {
      success: true,
      report_id: `DOSSIER-${work.work_id}-${Date.now()}`,
      work_id: work.work_id,
      generated_at: new Date().toISOString(),
      dossier,
      work_snapshot: work,
      statutory_disclaimer: SYNTHETIC_DISCLAIMER,
    };
  },

  askAi: async (query: string, _role: string) => {
    const qLower = query.toLowerCase();
    const matched = localWorks
      .filter(
        (w) =>
          w.work_id.toLowerCase().includes(qLower) ||
          w.district_name.toLowerCase().includes(qLower) ||
          w.state_name.toLowerCase().includes(qLower) ||
          w.vendor_name.toLowerCase().includes(qLower) ||
          w.work_type.toLowerCase().includes(qLower) ||
          (qLower.includes('risk') && w.risk_score >= 80) ||
          (qLower.includes('delay') && w.delay_days > 40) ||
          (qLower.includes('bankura') && w.district_name === 'Bankura')
      )
      .slice(0, 4);

    let answer = `Based on current telemetry for **${localWorks.length} central works**:\n\n`;

    if (qLower.includes('1024') || qLower.includes('bankura') || qLower.includes('risk')) {
      answer += `• **Signature Work MPL-1024** (Bankura Community Hall) shows a **critical disparity**: Financial expenditure has reached 92% (₹38.4L against ₹21L sanctioned), while verified physical progress is only 41% (+51pp disparity gap).\n• **Vendor concentration alert**: Vendor *Apex Infra Buildcon Pvt Ltd* currently holds 68.4% of total local project volume.\n• **Recommended Action**: Halt further payment disbursements and dispatch a multi-disciplinary field audit team under District Authority guidelines.`;
    } else if (qLower.includes('delay') || qLower.includes('timeline')) {
      answer += `• **Timeline Anomalies**: Across the database, 14 works have exceeded scheduled completion by >60 days.\n• Highest delay is observed in rural road and piped water schemes.\n• 84% probability of further milestone slippage without formal nodal intervention.`;
    } else {
      answer += `• Telemetry filters confirm active surveillance across ${localWorks.length} works.\n• **High Risk Cohort**: ${
        localWorks.filter((w) => w.risk_severity === 'CRITICAL').length
      } works are marked CRITICAL due to cost overruns or physical progress stagnation.\n• You can query specific Work IDs (e.g., 'MPL-1024'), filter by district (e.g., 'Bankura'), or ask for comparison charts.`;
    }

    return {
      query,
      answer,
      matched_projects: matched.length > 0 ? matched : localWorks.slice(0, 2),
      suggested_followups: [
        'Why is MPL-1024 risk score 94?',
        'Show all delayed works in Bankura',
        'Compare sanctioned cost vs actual expenditure',
      ],
    };
  },

  generateAiChart: async (query: string, _role?: string, chartTypePreference?: string): Promise<AiChartResponse> => {
    const qLower = query.toLowerCase();
    const validChartType: ChartType = (['bar', 'line', 'area', 'pie', 'radar'].includes(chartTypePreference || '')
      ? chartTypePreference
      : 'bar') as ChartType;

    if (qLower.includes('gap') || qLower.includes('progress')) {
      return {
        query,
        title: 'Financial vs Physical Progress Disparity (Percentage Points)',
        description: 'Comparison of financial fund disbursement versus physically certified milestone progress across top monitored works.',
        chartType: validChartType,
        xAxisKey: 'name',
        data: localWorks.slice(0, 6).map((w) => ({
          name: w.work_id,
          title: w.title.slice(0, 18) + '...',
          'Financial %': w.financial_progress,
          'Physical %': w.physical_progress,
          'Disparity Gap': w.progress_gap,
        })),
        series: [
          { key: 'Financial %', label: 'Financial Progress %', color: '#FF671F' },
          { key: 'Physical %', label: 'Physical Progress %', color: '#138808' },
          { key: 'Disparity Gap', label: 'Disparity Gap (pp)', color: '#DC2626' },
        ],
        insights: [
          'MPL-1024 exhibits the most acute disparity (+51 percentage points).',
          'Financial expenditure outpaces verified ground reality across 5 out of 6 priority works.',
        ],
        summaryStats: [
          { label: 'Max Progress Gap', value: '+51.0pp', hint: 'Work MPL-1024' },
          { label: 'Average Gap', value: '+33.4pp', hint: 'Across sample works' },
        ],
        suggestedPrompts: [
          'Show cost overrun for these works',
          'Compare delay days vs progress gap',
        ],
      };
    }

    // Default Cost comparison chart
    return {
      query,
      title: 'Sanctioned Cost vs Actual Expenditure (₹ Lakhs)',
      description: 'Comparative financial utilization across flagged works highlighting cost escalations.',
      chartType: validChartType,
      xAxisKey: 'name',
      data: localWorks.slice(0, 6).map((w) => ({
        name: w.work_id,
        title: w.title.slice(0, 18) + '...',
        Sanctioned: Number(w.sanctioned_cost.toFixed(1)),
        Expenditure: Number(w.expenditure.toFixed(1)),
        Overrun: Number(Math.max(0, w.expenditure - w.sanctioned_cost).toFixed(1)),
      })),
      series: [
        { key: 'Sanctioned', label: 'Sanctioned (₹L)', color: '#0B192C' },
        { key: 'Expenditure', label: 'Expenditure (₹L)', color: '#FF671F' },
        { key: 'Overrun', label: 'Overrun (₹L)', color: '#EF4444' },
      ],
      insights: [
        'Sanctioned limits exceeded by up to 82% on critical projects.',
        'High vendor concentration correlates with unapproved rate variations.',
      ],
      summaryStats: [
        { label: 'Highest Overrun', value: '₹17.4L', hint: 'MPL-1024' },
        { label: 'Total Sample Sanction', value: '₹142.5L', hint: '6 projects' },
      ],
      suggestedPrompts: [
        'Show disparity gap chart',
        'Pie chart of project status',
      ],
    };
  },
};
