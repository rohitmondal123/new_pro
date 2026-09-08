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
  AiChartResponse,
} from '../types/mplads';
import { clientFallback } from './clientDataFallback';

const API_BASE = '/api';

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type');
  if (!response.ok || (contentType && !contentType.includes('application/json'))) {
    const errText = await response.text().catch(() => '');
    throw new Error(`API Error ${response.status}: ${errText.slice(0, 100)}`);
  }

  return response.json();
}

/**
 * Executes an API call with automatic, seamless fallback to the local
 * high-fidelity synthetic database if the backend server is unreachable
 * (e.g. deployed on Vercel static hosting, Netlify, or cold-starting server).
 */
async function tryApi<T>(apiCall: () => Promise<T>, fallbackCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (err) {
    return await fallbackCall();
  }
}

export const api = {
  getHealth: () =>
    tryApi(
      () => fetchJson<{ status: string; gemini_enabled: boolean }>('/health'),
      () => clientFallback.getHealth()
    ),

  getDashboard: (filters?: { state?: string; district?: string; work_type?: string }) => {
    const params = new URLSearchParams();
    if (filters?.state) params.set('state', filters.state);
    if (filters?.district) params.set('district', filters.district);
    if (filters?.work_type) params.set('work_type', filters.work_type);

    return tryApi(
      () =>
        fetchJson<DashboardMetrics & { works_sample: WorkItem[] }>(
          `/dashboard?${params.toString()}`
        ),
      () => clientFallback.getDashboard(filters)
    );
  },

  getWorks: (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    return tryApi(
      () =>
        fetchJson<{ total: number; limit: number; offset: number; items: WorkItem[] }>(
          `/works?${searchParams.toString()}`
        ),
      () => clientFallback.getWorks(params)
    );
  },

  getWorkById: (id: string) =>
    tryApi(
      () => fetchJson<WorkItem>(`/works/${id}`),
      () => clientFallback.getWorkById(id)
    ),

  getWorkTimeline: (id: string) =>
    tryApi(
      () => fetchJson<WorkItem['timeline_events']>(`/works/${id}/timeline`),
      () => clientFallback.getWorkTimeline(id)
    ),

  getRiskDetails: (id: string) =>
    tryApi(
      () => fetchJson<any>(`/risk/${id}`),
      () => clientFallback.getRiskDetails(id)
    ),

  getAlerts: () =>
    tryApi(
      () => fetchJson<AlertRecord[]>('/alerts'),
      () => clientFallback.getAlerts()
    ),

  acknowledgeAlert: (id: string, note?: string, officer_name?: string) =>
    tryApi(
      () =>
        fetchJson<{ success: boolean; alert: AlertRecord }>(`/alerts/${id}/acknowledge`, {
          method: 'POST',
          body: JSON.stringify({ note, officer_name }),
        }),
      () => clientFallback.acknowledgeAlert(id, note, officer_name)
    ),

  getMapPoints: () =>
    tryApi(
      () => fetchJson<any[]>('/map'),
      () => clientFallback.getMapPoints()
    ),

  getPayments: (workId?: string, flaggedOnly?: boolean) => {
    const params = new URLSearchParams();
    if (workId) params.set('work_id', workId);
    if (flaggedOnly) params.set('flagged_only', 'true');

    return tryApi(
      () => fetchJson<PaymentRecord[]>(`/payments?${params.toString()}`),
      () => clientFallback.getPayments(workId, flaggedOnly)
    );
  },

  getAgencies: () =>
    tryApi(
      () => fetchJson<AgencyMetrics[]>('/agencies'),
      () => clientFallback.getAgencies()
    ),

  getCompliance: () =>
    tryApi(
      () => fetchJson<{ rules: ComplianceRule[]; summary: any }>('/compliance'),
      () => clientFallback.getCompliance()
    ),

  getDuplicates: () =>
    tryApi(
      () => fetchJson<DuplicateMatch[]>('/duplicates'),
      () => clientFallback.getDuplicates()
    ),

  getPredictions: () =>
    tryApi(
      () =>
        fetchJson<{
          high_delay_probability_works: WorkItem[];
          high_cost_deviation_works: WorkItem[];
        }>('/predictions'),
      () => clientFallback.getPredictions()
    ),

  getInspectionPriority: () =>
    tryApi(
      () => fetchJson<WorkItem[]>('/inspection-priority'),
      () => clientFallback.getInspectionPriority()
    ),

  getAnalytics: () =>
    tryApi(
      () => fetchJson<{ metrics: DashboardMetrics; reality_matrix: any[] }>('/analytics'),
      () => clientFallback.getAnalytics()
    ),

  getAuditLogs: () =>
    tryApi(
      () => fetchJson<AuditLogEntry[]>('/audit'),
      () => clientFallback.getAuditLogs()
    ),

  logAudit: (data: Partial<AuditLogEntry>) =>
    tryApi(
      () =>
        fetchJson<{ success: boolean; entry: AuditLogEntry }>('/audit', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      () => clientFallback.logAudit(data)
    ),

  getDataQuality: () =>
    tryApi(
      () => fetchJson<DataQualityReport>('/data-quality'),
      () => clientFallback.getDataQuality()
    ),

  scheduleInspection: (data: {
    work_id: string;
    officer_name: string;
    target_date: string;
    notes?: string;
  }) =>
    tryApi(
      () =>
        fetchJson<{ success: boolean; work: WorkItem }>('/inspections/schedule', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      () => clientFallback.scheduleInspection(data)
    ),

  uploadDataBatch: (fileName: string, recordsCount: number) =>
    tryApi(
      () =>
        fetchJson<any>('/upload', {
          method: 'POST',
          body: JSON.stringify({ fileName, recordsCount }),
        }),
      () => clientFallback.uploadDataBatch(fileName, recordsCount)
    ),

  generateReport: (workId: string) =>
    tryApi(
      () =>
        fetchJson<{
          success: boolean;
          report_id: string;
          work_id: string;
          generated_at: string;
          dossier: string;
          work_snapshot: WorkItem;
          statutory_disclaimer: string;
        }>('/generate-report', {
          method: 'POST',
          body: JSON.stringify({ work_id: workId }),
        }),
      () => clientFallback.generateReport(workId)
    ),

  askAi: (query: string, role: string) =>
    tryApi(
      () =>
        fetchJson<{
          query: string;
          answer: string;
          matched_projects: WorkItem[];
          suggested_followups: string[];
        }>('/ai/query', {
          method: 'POST',
          body: JSON.stringify({ query, role }),
        }),
      () => clientFallback.askAi(query, role)
    ),

  generateAiChart: (query: string, role?: string, chartTypePreference?: string) =>
    tryApi(
      () =>
        fetchJson<AiChartResponse>('/ai/chart', {
          method: 'POST',
          body: JSON.stringify({ query, role, chartTypePreference }),
        }),
      () => clientFallback.generateAiChart(query, role, chartTypePreference)
    ),
};
