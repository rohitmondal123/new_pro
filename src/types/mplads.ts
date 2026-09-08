export type UserRole =
  | 'MINISTRY_ADMIN'
  | 'STATE_AUTHORITY'
  | 'DISTRICT_AUTHORITY'
  | 'MP_USER'
  | 'AUDITOR'
  | 'INSPECTOR';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type WorkStatus =
  | 'RECOMMENDED'
  | 'SANCTIONED'
  | 'WORK_ORDER_ISSUED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED'
  | 'STALLED';

export type DigitalTwinStage =
  | 'RECOMMENDATION'
  | 'SANCTION'
  | 'WORK_ORDER'
  | 'FUND_RELEASE'
  | 'PAYMENT'
  | 'PHYSICAL_PROGRESS'
  | 'INSPECTION'
  | 'COMPLETION'
  | 'ASSET_CREATION';

export interface DigitalTwinEvent {
  id: string;
  stage: DigitalTwinStage;
  label: string;
  date: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT' | 'PENDING';
  amount?: number; // In Lakhs
  agency?: string;
  authority?: string;
  supportingRecord?: string;
  riskSignal?: string;
  note?: string;
}

export interface RiskFactor {
  name: string;
  score: number; // 0-100
  contribution_pct: number; // SHAP weight percentage
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface WorkItem {
  work_id: string;
  title: string;
  description: string;
  mp_id: string;
  mp_name: string;
  mp_house: 'Lok Sabha' | 'Rajya Sabha';
  state_id: string;
  state_name: string;
  district_id: string;
  district_name: string;
  constituency_id: string;
  constituency_name: string;
  work_type: string;
  estimated_cost: number; // Lakhs INR
  sanctioned_cost: number;
  expenditure: number;
  predicted_comparable_cost: number;
  financial_progress: number; // 0-100
  physical_progress: number; // 0-100
  progress_gap: number;
  sanction_date: string;
  work_order_date: string;
  expected_completion_date: string;
  actual_completion_date?: string;
  delay_days: number;
  delay_probability: number; // 0-100
  predicted_delay_range: string;
  predicted_completion_date: string;
  agency_id: string;
  agency_name: string;
  vendor_id: string;
  vendor_name: string;
  vendor_concentration_pct: number;
  latitude: number;
  longitude: number;
  location: string;
  status: WorkStatus;
  risk_score: number; // 0-100
  risk_severity: RiskSeverity;
  risk_factors: RiskFactor[];
  recommended_actions: string[];
  timeline_events: DigitalTwinEvent[];
  health_components: {
    financial: number;
    execution: number;
    timeliness: number;
    compliance: number;
    asset: number;
  };
  inspection_priority_rank?: number;
  inspection_status: 'NOT_SCHEDULED' | 'SCHEDULED' | 'COMPLETED' | 'OVERDUE';
  inspection_date?: string;
  compliance_status: 'PASS' | 'WARNING' | 'REVIEW_REQUIRED';
  anomaly_types: string[];
  is_signature_demo?: boolean;
}

export interface PaymentRecord {
  payment_id: string;
  work_id: string;
  work_title: string;
  vendor_id: string;
  vendor_name: string;
  agency_id: string;
  agency_name: string;
  amount: number; // Lakhs
  payment_date: string;
  payment_type: 'ADVANCE' | 'MILESTONE_1' | 'MILESTONE_2' | 'FINAL_SETTLEMENT' | 'RETENTION_RELEASE';
  reference: string;
  status: 'PROCESSED' | 'PENDING_VERIFICATION' | 'FLAGGED_ANOMALY';
  anomaly_signal?: string;
  mb_entry_verified: boolean;
}

export interface AlertRecord {
  alert_id: string;
  work_id: string;
  work_title: string;
  district_name: string;
  state_name: string;
  alert_type:
    | 'PROGRESS_MISMATCH'
    | 'COST_OVERRUN'
    | 'PAYMENT_SPIKE'
    | 'PREDICTED_DELAY'
    | 'DUPLICATE_SUSPICION'
    | 'VENDOR_CONCENTRATION'
    | 'COMPLIANCE_BREACH';
  severity: RiskSeverity;
  risk_score: number;
  reason: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'INSPECTION_ORDERED' | 'RESOLVED';
  created_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolution_note?: string;
}

export interface DuplicateMatch {
  id: string;
  primary_work: WorkItem;
  similar_work: WorkItem;
  overall_similarity: number;
  text_similarity: number;
  location_similarity: number;
  cost_similarity: number;
  work_type_similarity: number;
  agency_similarity: number;
  distance_meters: number;
  review_status: 'FLAGGED' | 'VERIFIED_LEGITIMATE' | 'CONFIRMED_OVERLAP' | 'DISMISSED';
  detected_date: string;
}

export interface AgencyMetrics {
  agency_id: string;
  agency_name: string;
  district_name: string;
  state_name: string;
  total_works: number;
  total_allocated_funds: number; // Lakhs
  completed_works: number;
  delayed_works: number;
  avg_delay_days: number;
  high_risk_works: number;
  vendor_concentration_score: number;
  risk_rating: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface ComplianceRule {
  rule_id: string;
  rule_code: string;
  rule_name: string;
  category: 'SANCTION' | 'INSPECTION' | 'EXPENDITURE' | 'ASSET' | 'TIMELINE';
  description: string;
  severity: RiskSeverity;
  is_active: boolean;
  violation_count: number;
  pass_rate: number;
}

export interface ComplianceResult {
  rule_id: string;
  rule_name: string;
  status: 'PASS' | 'WARNING' | 'REVIEW_REQUIRED';
  detail: string;
  remediation_advice: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  entity: string;
  entity_id: string;
  timestamp: string;
  ip_address?: string;
  metadata?: Record<string, any>;
}

export interface DataQualityReport {
  overall_score: number;
  total_records_audited: number;
  valid_records: number;
  error_count: number;
  warning_count: number;
  checks: Array<{
    category: string;
    description: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    affected_count: number;
    sample_records: string[];
    fix_suggestion: string;
  }>;
}

export interface DashboardMetrics {
  total_works: number;
  total_sanctioned_amount_cr: number;
  total_expenditure_cr: number;
  fund_utilization_pct: number;
  completed_works: number;
  delayed_works: number;
  high_risk_works: number;
  critical_alerts: number;
  pulse_score: {
    overall: number;
    financial_health: number;
    project_execution: number;
    timeliness: number;
    compliance: number;
    asset_creation: number;
  };
  monthly_utilization: Array<{ month: string; sanctioned: number; expenditure: number }>;
  risk_distribution: { low: number; medium: number; high: number; critical: number };
  state_rankings: Array<{
    state_name: string;
    total_works: number;
    utilization_pct: number;
    avg_risk: number;
    critical_count: number;
  }>;
  work_categories: Array<{ category: string; count: number; total_funds_cr: number; risk_rate: number }>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'MP' | 'CONSTITUENCY' | 'DISTRICT' | 'WORK' | 'AGENCY' | 'VENDOR' | 'PAYMENT';
  risk_score?: number;
  amount?: number;
  details?: Record<string, any>;
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
  highlight?: boolean;
}

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'radar';

export interface ChartSeriesConfig {
  key: string;
  label: string;
  color: string;
}

export interface ChartSummaryStat {
  label: string;
  value: string;
  hint?: string;
}

export interface AiChartResponse {
  query: string;
  title: string;
  description: string;
  chartType: ChartType;
  xAxisKey: string;
  data: Array<Record<string, any>>;
  series: ChartSeriesConfig[];
  insights: string[];
  summaryStats?: ChartSummaryStat[];
  suggestedPrompts?: string[];
}
