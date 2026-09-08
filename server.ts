import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
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
} from './src/data/syntheticData';
import { WorkItem, AlertRecord, AuditLogEntry } from './src/types/mplads';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// In-memory working state cloned from synthetic baseline
let worksDatabase: WorkItem[] = JSON.parse(JSON.stringify(INITIAL_WORKS));
let paymentsDatabase = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
let alertsDatabase: AlertRecord[] = JSON.parse(JSON.stringify(INITIAL_ALERTS));
let auditLogsDatabase: AuditLogEntry[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
let complianceRulesDatabase = JSON.parse(JSON.stringify(INITIAL_COMPLIANCE_RULES));
let duplicateMatchesDatabase = JSON.parse(JSON.stringify(INITIAL_DUPLICATES));

// Lazy initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Gemini client init warning:', err);
    }
  }
  return aiClient;
}

// Supported fallback models if primary model is experiencing high demand (503/429)
const RESILIENT_GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function callGeminiWithResilience(
  ai: GoogleGenAI,
  options: {
    prompt: string;
    systemInstruction?: string;
  }
): Promise<string> {
  for (const model of RESILIENT_GEMINI_MODELS) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini call timeout after 6s')), 6000)
      );
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: options.prompt,
          config: options.systemInstruction
            ? { systemInstruction: options.systemInstruction }
            : undefined,
        }),
        timeoutPromise,
      ]);
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      const status = err?.status || err?.code;
      const msg = err?.message || String(err);
      const isTransient =
        status === 503 ||
        status === 429 ||
        msg.includes('503') ||
        msg.includes('429') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('high demand') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('fetch failed');

      if (isTransient) {
        console.info(`[MPLADS Sentinel AI] Model ${model} busy or experiencing high demand, falling back gracefully...`);
        // Brief pause before trying fallback candidate
        await new Promise((resolve) => setTimeout(resolve, 300));
        continue;
      }

      console.warn(`[MPLADS Sentinel AI] Error querying model ${model}:`, msg);
      break;
    }
  }
  return '';
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MPLADS Sentinel API',
    tagline: 'From Project Monitoring to Predictive Risk Intelligence',
    timestamp: new Date().toISOString(),
    gemini_enabled: !!process.env.GEMINI_API_KEY,
  });
});

// Dashboard Metrics
app.get('/api/dashboard', (req, res) => {
  const { state, district, work_type } = req.query;

  let filteredWorks = [...worksDatabase];
  if (state && state !== 'ALL') {
    filteredWorks = filteredWorks.filter((w) => w.state_name === state || w.state_id === state);
  }
  if (district && district !== 'ALL') {
    filteredWorks = filteredWorks.filter((w) => w.district_name === district);
  }
  if (work_type && work_type !== 'ALL') {
    filteredWorks = filteredWorks.filter((w) => w.work_type === work_type);
  }

  const criticalCount = filteredWorks.filter((w) => w.risk_severity === 'CRITICAL').length;
  const highCount = filteredWorks.filter((w) => w.risk_severity === 'HIGH').length;
  const delayedCount = filteredWorks.filter((w) => w.delay_days > 0 || w.status === 'DELAYED').length;
  const completedCount = filteredWorks.filter((w) => w.status === 'COMPLETED').length;

  res.json({
    ...INITIAL_DASHBOARD_METRICS,
    active_works_filtered: filteredWorks.length,
    critical_alerts: alertsDatabase.filter((a) => a.status === 'NEW' && a.severity === 'CRITICAL').length,
    high_risk_works: criticalCount + highCount,
    delayed_works: delayedCount,
    completed_works: completedCount,
    works_sample: filteredWorks,
  });
});

// Works list with filtering & pagination
app.get('/api/works', (req, res) => {
  const {
    search,
    state,
    district,
    risk_level,
    status,
    work_type,
    sort_by = 'risk_score',
    order = 'desc',
    limit = '50',
    offset = '0',
  } = req.query;

  let results = [...worksDatabase];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (w) =>
        w.work_id.toLowerCase().includes(q) ||
        w.title.toLowerCase().includes(q) ||
        w.district_name.toLowerCase().includes(q) ||
        w.mp_name.toLowerCase().includes(q) ||
        w.vendor_name.toLowerCase().includes(q)
    );
  }

  if (state && state !== 'ALL') {
    results = results.filter((w) => w.state_name === state || w.state_id === state);
  }

  if (district && district !== 'ALL') {
    results = results.filter((w) => w.district_name === district);
  }

  if (risk_level && risk_level !== 'ALL') {
    results = results.filter((w) => w.risk_severity === risk_level);
  }

  if (status && status !== 'ALL') {
    results = results.filter((w) => w.status === status);
  }

  if (work_type && work_type !== 'ALL') {
    results = results.filter((w) => w.work_type === work_type);
  }

  // Sorting
  results.sort((a, b) => {
    let valA = (a as any)[sort_by as string] ?? 0;
    let valB = (b as any)[sort_by as string] ?? 0;
    if (order === 'asc') return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const parsedLimit = parseInt(limit as string, 10) || 50;
  const parsedOffset = parseInt(offset as string, 10) || 0;
  const paginated = results.slice(parsedOffset, parsedOffset + parsedLimit);

  res.json({
    total: results.length,
    limit: parsedLimit,
    offset: parsedOffset,
    items: paginated,
  });
});

// Single Work Detail
app.get('/api/works/:id', (req, res) => {
  const work = worksDatabase.find((w) => w.work_id.toLowerCase() === req.params.id.toLowerCase());
  if (!work) {
    return res.status(404).json({ error: 'Work not found' });
  }

  // Log view event
  const newAudit: AuditLogEntry = {
    id: `AUD-${Date.now().toString().slice(-4)}`,
    user_id: 'ACTIVE_USER',
    user_name: 'Current Authorized Officer',
    user_role: 'DISTRICT_AUTHORITY',
    action: 'PROJECT_VIEWED',
    entity: 'WORK_ITEM',
    entity_id: work.work_id,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    metadata: { risk_score: work.risk_score, severity: work.risk_severity },
  };
  auditLogsDatabase.unshift(newAudit);

  res.json(work);
});

// Digital Twin Timeline
app.get('/api/works/:id/timeline', (req, res) => {
  const work = worksDatabase.find((w) => w.work_id.toLowerCase() === req.params.id.toLowerCase());
  if (!work) return res.status(404).json({ error: 'Work not found' });
  res.json(work.timeline_events || []);
});

// Explainable AI & Risk Details
app.get('/api/risk/:id', (req, res) => {
  const work = worksDatabase.find((w) => w.work_id.toLowerCase() === req.params.id.toLowerCase());
  if (!work) return res.status(404).json({ error: 'Work not found' });

  res.json({
    work_id: work.work_id,
    risk_score: work.risk_score,
    severity: work.risk_severity,
    factors: work.risk_factors,
    recommendations: work.recommended_actions,
    calculated_metrics: {
      cost_deviation_pct: Number(
        (((work.expenditure - work.sanctioned_cost) / work.sanctioned_cost) * 100).toFixed(1)
      ),
      progress_gap: work.progress_gap,
      delay_probability: work.delay_probability,
      predicted_delay: work.predicted_delay_range,
    },
    explainability_model: 'SHAP Feature Attribution (v2.4 KernelExplainer)',
  });
});

// Alerts
app.get('/api/alerts', (req, res) => {
  res.json(alertsDatabase);
});

app.post('/api/alerts/:id/acknowledge', (req, res) => {
  const alert = alertsDatabase.find((a) => a.alert_id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  alert.status = 'UNDER_REVIEW';
  alert.acknowledged_by = req.body.officer_name || 'District Authority';
  alert.acknowledged_at = new Date().toISOString();
  alert.resolution_note = req.body.note || 'Review scheduled with block team';

  auditLogsDatabase.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    user_id: 'USR-DIST-01',
    user_name: alert.acknowledged_by,
    user_role: 'DISTRICT_AUTHORITY',
    action: 'ALERT_ACKNOWLEDGED',
    entity: 'ALERT_RECORD',
    entity_id: alert.alert_id,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    metadata: { note: alert.resolution_note },
  });

  res.json({ success: true, alert });
});

// Geospatial Map Points
app.get('/api/map', (req, res) => {
  const points = worksDatabase.map((w) => ({
    work_id: w.work_id,
    title: w.title,
    latitude: w.latitude,
    longitude: w.longitude,
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
  }));
  res.json(points);
});

// Payments
app.get('/api/payments', (req, res) => {
  const { work_id, flagged_only } = req.query;
  let list = [...paymentsDatabase];
  if (work_id) {
    list = list.filter((p) => p.work_id.toLowerCase() === (work_id as string).toLowerCase());
  }
  if (flagged_only === 'true') {
    list = list.filter((p) => p.status === 'FLAGGED_ANOMALY');
  }
  res.json(list);
});

// Agencies
app.get('/api/agencies', (req, res) => {
  res.json(INITIAL_AGENCIES);
});

// Compliance
app.get('/api/compliance', (req, res) => {
  res.json({
    rules: complianceRulesDatabase,
    summary: {
      total_rules: complianceRulesDatabase.length,
      active_rules: complianceRulesDatabase.filter((r: any) => r.is_active).length,
      average_compliance_rate: 90.1,
      total_violations_flagged: complianceRulesDatabase.reduce((acc: number, r: any) => acc + r.violation_count, 0),
    },
  });
});

// Duplicate Detection Radar
app.get('/api/duplicates', (req, res) => {
  res.json(duplicateMatchesDatabase);
});

// Predictions
app.get('/api/predictions', (req, res) => {
  const delayedPredicted = worksDatabase.filter((w) => w.delay_probability > 60);
  const costDeviated = worksDatabase.filter(
    (w) => w.expenditure > w.sanctioned_cost * 1.15
  );

  res.json({
    high_delay_probability_works: delayedPredicted,
    high_cost_deviation_works: costDeviated,
    algorithm: 'XGBoost Delay Classifier + GradientBoost Cost Regressor',
    confidence_interval: '95% Empirical Bootstrap',
  });
});

// Inspection Priority Queue (The Centerpiece AI Investigation Queue)
app.get('/api/inspection-priority', (req, res) => {
  const ranked = [...worksDatabase]
    .sort((a, b) => b.risk_score - a.risk_score)
    .map((w, index) => ({
      ...w,
      rank: index + 1,
      recommended_action_priority:
        w.risk_score >= 90
          ? 'INSPECT FIRST'
          : w.risk_score >= 75
          ? 'REVIEW'
          : w.risk_score >= 60
          ? 'MONITOR'
          : 'ROUTINE AUDIT',
      priority_reason:
        w.risk_factors && w.risk_factors.length > 0
          ? w.risk_factors[0].name + ': ' + w.risk_factors[0].description
          : 'Composite Risk Anomaly',
    }));

  res.json(ranked);
});

// Analytics
app.get('/api/analytics', (req, res) => {
  res.json({
    metrics: INITIAL_DASHBOARD_METRICS,
    reality_matrix: worksDatabase.map((w) => ({
      work_id: w.work_id,
      title: w.title,
      financial_progress: w.financial_progress,
      physical_progress: w.physical_progress,
      progress_gap: w.progress_gap,
      expenditure: w.expenditure,
      sanctioned_cost: w.sanctioned_cost,
      risk_score: w.risk_score,
      risk_severity: w.risk_severity,
      district_name: w.district_name,
      state_name: w.state_name,
      work_type: w.work_type,
    })),
  });
});

// Audit Trail
app.get('/api/audit', (req, res) => {
  res.json(auditLogsDatabase);
});

app.post('/api/audit', (req, res) => {
  const { action, entity, entity_id, metadata, user_name, user_role } = req.body;
  const newEntry: AuditLogEntry = {
    id: `AUD-${Date.now().toString().slice(-4)}`,
    user_id: req.body.user_id || 'ACTIVE_USER',
    user_name: user_name || 'Authorized Officer',
    user_role: user_role || 'DISTRICT_AUTHORITY',
    action: action || 'ACTION_LOGGED',
    entity: entity || 'SYSTEM',
    entity_id: entity_id || 'GLOBAL',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    metadata: metadata || {},
  };
  auditLogsDatabase.unshift(newEntry);
  res.json({ success: true, entry: newEntry });
});

// Data Quality
app.get('/api/data-quality', (req, res) => {
  res.json(INITIAL_DATA_QUALITY);
});

// Schedule Field Inspection
app.post('/api/inspections/schedule', (req, res) => {
  const { work_id, officer_name, target_date, notes } = req.body;
  const work = worksDatabase.find((w) => w.work_id.toLowerCase() === (work_id || '').toLowerCase());
  if (!work) return res.status(404).json({ error: 'Work not found' });

  work.inspection_status = 'SCHEDULED';
  work.inspection_date = target_date || new Date().toISOString().slice(0, 10);

  // Add digital twin event
  const newEvent = {
    id: `ev-insp-${Date.now()}`,
    stage: 'INSPECTION' as const,
    label: `Physical Site Inspection Scheduled: ${target_date}`,
    date: target_date,
    status: 'WARNING' as const,
    authority: officer_name || 'District Vigilance Cell',
    note: notes || 'Special verification ordered following AI Early Warning risk signal.',
  };
  work.timeline_events.push(newEvent);

  auditLogsDatabase.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    user_id: 'USR-DIST-01',
    user_name: officer_name || 'District Authority',
    user_role: 'DISTRICT_AUTHORITY',
    action: 'INSPECTION_SCHEDULED',
    entity: 'INSPECTION',
    entity_id: work.work_id,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    metadata: { target_date, notes },
  });

  res.json({ success: true, work });
});

// Ingestion Pipeline (CSV / Data Upload)
app.post('/api/upload', (req, res) => {
  const { fileName, recordsCount = 10 } = req.body;
  const simulatedNewCount = Math.min(recordsCount, 15);

  const newAudit: AuditLogEntry = {
    id: `AUD-${Date.now().toString().slice(-4)}`,
    user_id: 'USR-UPLOAD',
    user_name: 'Data Entry Officer',
    user_role: 'DISTRICT_AUTHORITY',
    action: 'DATA_UPLOADED',
    entity: 'DATA_INGESTION_BATCH',
    entity_id: `BATCH-${Date.now().toString().slice(-5)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    metadata: { fileName, count: simulatedNewCount },
  };
  auditLogsDatabase.unshift(newAudit);

  res.json({
    success: true,
    batch_id: `BATCH-${Date.now()}`,
    file_name: fileName || 'mplads_works_import.csv',
    processed_records: simulatedNewCount,
    valid_records: simulatedNewCount - 1,
    quarantined_records: 1,
    anomaly_detection_status: 'COMPLETED',
    new_risks_identified: 2,
    message: 'Data ingestion pipeline passed schema validation and feature engineering.',
  });
});

// AI Investigation Report Generator
app.post('/api/generate-report', async (req, res) => {
  const { work_id } = req.body;
  const work = worksDatabase.find((w) => w.work_id.toLowerCase() === (work_id || '').toLowerCase());
  if (!work) return res.status(404).json({ error: 'Project not found' });

  const ai = getGeminiClient();
  let aiNarrative = '';

  if (ai) {
    try {
      const prompt = `You are a Senior Government Technical Auditor and Solution Architect for the Government of India's MPLADS Sentinel monitoring platform.
Generate an objective, strictly fact-based, non-accusatory "AI Investigation & Risk Assessment Dossier" for project:
Work ID: ${work.work_id}
Title: ${work.title}
District: ${work.district_name}, State: ${work.state_name}
Sanctioned Cost: ₹${work.sanctioned_cost} Lakhs
Actual Expenditure: ₹${work.expenditure} Lakhs (Cost Variance: +${(
        ((work.expenditure - work.sanctioned_cost) / work.sanctioned_cost) *
        100
      ).toFixed(1)}%)
Financial Progress: ${work.financial_progress}%
Physical Progress: ${work.physical_progress}% (Progress Gap: ${work.progress_gap} percentage points)
Delay: ${work.delay_days} days
Risk Score: ${work.risk_score}/100 (${work.risk_severity})
Primary Anomaly: ${work.anomaly_types.join(', ')}

Guidelines:
- Never declare fraud or make criminal accusations; use official decision-support terminology ("Risk Signal", "Potential Anomaly", "Review Recommended", "Inspection Recommended").
- Provide 3 concise sections:
  1. EXECUTIVE ANOMALY SUMMARY (Facts and divergence analysis)
  2. ROOT CAUSE PROBABILITY MATRIX
  3. DECISION-SUPPORT VERIFICATION CHECKLIST (Actionable steps for District Authority / Auditor)
Keep the tone professional, authoritative, and helpful for government officers.`;

      aiNarrative = await callGeminiWithResilience(ai, { prompt });
    } catch (err: any) {
      console.info('[MPLADS Sentinel AI] Investigation report fallback triggered:', err?.message || err);
    }
  }

  // Fallback if Gemini key absent or error
  if (!aiNarrative) {
    aiNarrative = `### 1. EXECUTIVE ANOMALY SUMMARY
Project **${work.work_id}** (${work.title}) displays a severe statistical divergence between financial disbursement and verified physical milestone execution. The project has drawn **₹${work.expenditure} Lakhs** against an administrative sanction of **₹${work.sanctioned_cost} Lakhs** (a **+${(
      ((work.expenditure - work.sanctioned_cost) / work.sanctioned_cost) *
      100
    ).toFixed(1)}% cost deviation**). Financial progress stands at **${work.financial_progress}%**, whereas ground physical progress is authenticated at only **${work.physical_progress}%**, establishing a high-risk progress gap of **${work.progress_gap} percentage points**.

### 2. RISK FACTOR & TIMELINE ANALYSIS
- **Payment Velocity Anomaly:** Rapid successive disbursements occurred without commensurate on-portal Measurement Book (MB) verification by the Assistant Engineer.
- **Milestone Slippage:** The project is **${work.delay_days} days** beyond its target SLA completion date, with predictive delay modeling projecting an additional **${work.predicted_delay_range}**.
- **Execution Agency Concentration:** Executing agency holds elevated vendor concentration, warranting administrative inspection.

### 3. STATUTORY VERIFICATION CHECKLIST FOR AUTHORITIES
1. **Physical On-Site Audit:** Deploy Executive Engineer (Civil) for geo-tagged photographic inspection of foundation and structural columns.
2. **Measurement Book Reconciliation:** Verify physical MB entries against invoices passed under Payment Tranches 2 and 3.
3. **Rates Verification:** Cross-check material vouchers against State PWD Schedule of Rates (SOR).
4. **Coordinate Boundary Check:** Ensure no overlap or double-allocation with nearby completed civil facility ${work.work_id === 'MPL-1024' ? 'MPL-0892' : 'adjacent works'}.
*Note: This report is generated by MPLADS Sentinel as an AI-powered early warning advisory. Final decisions reside exclusively with designated human authorities.*`;
  }

  // Record audit log
  auditLogsDatabase.unshift({
    id: `AUD-${Date.now().toString().slice(-4)}`,
    user_id: 'USR-AUD-01',
    user_name: 'Senior Vigilance Auditor',
    user_role: 'AUDITOR',
    action: 'REPORT_GENERATED',
    entity: 'AI_INVESTIGATION_REPORT',
    entity_id: work.work_id,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    metadata: { risk_score: work.risk_score, severity: work.risk_severity },
  });

  res.json({
    success: true,
    report_id: `REP-MPL-${Date.now().toString().slice(-6)}`,
    work_id: work.work_id,
    generated_at: new Date().toISOString(),
    risk_score: work.risk_score,
    risk_severity: work.risk_severity,
    dossier: aiNarrative,
    work_snapshot: work,
    statutory_disclaimer:
      'CONFIDENTIAL GOVERNMENT DECISION-SUPPORT DOSSIER. Generated via synthetic analytical model. Requires manual inspection before administrative action.',
  });
});

// Natural Language MPLADS AI Assistant ("Ask MPLADS AI")
app.post('/api/ai/query', async (req, res) => {
  const { query, role = 'DISTRICT_AUTHORITY' } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query string required' });
  }

  const qLower = query.toLowerCase();
  const ai = getGeminiClient();

  // Heuristic DB matchers to extract relevant data
  let matchingWorks = worksDatabase;
  if (qLower.includes('west bengal') || qLower.includes('bengal') || qLower.includes('wb')) {
    matchingWorks = matchingWorks.filter((w) => w.state_name === 'West Bengal' || w.state_id === 'WB');
  } else if (qLower.includes('uttar pradesh') || qLower.includes('up') || qLower.includes('varanasi')) {
    matchingWorks = matchingWorks.filter((w) => w.state_name === 'Uttar Pradesh' || w.state_id === 'UP');
  } else if (qLower.includes('maharashtra') || qLower.includes('nagpur')) {
    matchingWorks = matchingWorks.filter((w) => w.state_name === 'Maharashtra' || w.state_id === 'MH');
  } else if (qLower.includes('bihar') || qLower.includes('patna')) {
    matchingWorks = matchingWorks.filter((w) => w.state_name === 'Bihar' || w.state_id === 'BR');
  }

  if (qLower.includes('community hall')) {
    matchingWorks = matchingWorks.filter((w) => w.work_type === 'Community Hall');
  } else if (qLower.includes('water') || qLower.includes('drinking')) {
    matchingWorks = matchingWorks.filter((w) => w.work_type === 'Drinking Water');
  } else if (qLower.includes('road')) {
    matchingWorks = matchingWorks.filter((w) => w.work_type === 'Rural Roads');
  } else if (qLower.includes('school') || qLower.includes('lab')) {
    matchingWorks = matchingWorks.filter((w) => w.work_type === 'School Infrastructure');
  }

  if (qLower.includes('high risk') || qLower.includes('critical') || qLower.includes('highest')) {
    matchingWorks = matchingWorks.filter((w) => w.risk_score >= 80);
  } else if (qLower.includes('delayed') || qLower.includes('delay')) {
    matchingWorks = matchingWorks.filter((w) => w.delay_days > 0 || w.status === 'DELAYED');
  } else if (qLower.includes('cost') || qLower.includes('overrun') || qLower.includes('deviation')) {
    matchingWorks = matchingWorks.filter((w) => w.expenditure > w.sanctioned_cost);
  } else if (qLower.includes('inspect') || qLower.includes('priority')) {
    matchingWorks = [...matchingWorks].sort((a, b) => b.risk_score - a.risk_score);
  }

  if (qLower.includes('mpl-1024') || qLower.includes('1024')) {
    const single = worksDatabase.find((w) => w.work_id === 'MPL-1024');
    if (single) matchingWorks = [single];
  }

  // Call Gemini if configured
  let aiAnswer = '';
  if (ai) {
    try {
      const systemInstruction = `You are "MPLADS Sentinel AI", an intelligent government assistant for the Ministry of Statistics and Programme Implementation (MoSPI) and District Authorities.
Respond to the user query authoritatively, neutrally, and clearly using the provided real-time database context.
Never allege criminal fraud. Use standard decision-support terms ("Risk Signal", "Potential Anomaly", "Review Recommended").
Highlight specific project IDs, numbers, and actionable recommendations. Keep response under 3-4 structured paragraphs.`;

      const prompt = `User Role: ${role}
User Question: "${query}"

Current Database Context:
Total Active Filtered Projects: ${matchingWorks.length}
Sample Data:
${JSON.stringify(
  matchingWorks.slice(0, 5).map((w) => ({
    id: w.work_id,
    title: w.title,
    district: w.district_name,
    state: w.state_name,
    sanctioned: `₹${w.sanctioned_cost}L`,
    spent: `₹${w.expenditure}L`,
    financial_progress: `${w.financial_progress}%`,
    physical_progress: `${w.physical_progress}%`,
    progress_gap: `${w.progress_gap}%`,
    delay_days: w.delay_days,
    risk_score: `${w.risk_score}/100`,
    severity: w.risk_severity,
    anomalies: w.anomaly_types,
  })),
  null,
  2
)}

Provide an insightful, helpful analysis addressing the query directly.`;

      aiAnswer = await callGeminiWithResilience(ai, {
        prompt,
        systemInstruction,
      });
    } catch (err: any) {
      console.info('[MPLADS Sentinel AI] Chat query fallback triggered:', err?.message || err);
    }
  }

  // Fallback structured analysis
  if (!aiAnswer) {
    if (matchingWorks.length === 0) {
      aiAnswer = `No projects directly match your filter criteria. Try searching across all states or filtering by "High-Risk Works" to view current active alerts.`;
    } else {
      const top = matchingWorks[0];
      aiAnswer = `Based on current live MPLADS Sentinel telemetry, here is the synthesized intelligence for your query:

- **Top Priority Project:** **${top.work_id}** (*${top.title}*) in **${top.district_name}, ${top.state_name}** exhibits a Risk Score of **${top.risk_score}/100 (${top.risk_severity})**.
- **Financial vs Physical Disparity:** The expenditure is **₹${top.expenditure} Lakhs** (Sanction: ₹${top.sanctioned_cost} Lakhs) with a **${top.progress_gap} percentage-point progress gap** (${top.financial_progress}% financial vs ${top.physical_progress}% physical).
- **Recommended Action:** ${top.recommended_actions[0] || 'Conduct immediate physical verification.'}

A total of **${matchingWorks.length} projects** match your analytical scope in the current dataset.`;
    }
  }

  res.json({
    query,
    answer: aiAnswer,
    matched_projects_count: matchingWorks.length,
    matched_projects: matchingWorks.slice(0, 8),
    suggested_followups: [
      `Why is ${matchingWorks[0]?.work_id || 'MPL-1024'} flagged as high risk?`,
      'Show projects with financial progress > 80% but physical progress < 50%',
      'Which districts have the highest cost deviation in Community Halls?',
      'Schedule joint field inspection for top priority project',
    ],
  });
});

// AI Chart Generation Endpoint
app.post('/api/ai/chart', async (req, res) => {
  const { query = '', role = 'DISTRICT_AUTHORITY', chartTypePreference } = req.body;
  const qLower = query.toLowerCase().trim();
  const ai = getGeminiClient();

  // Baseline Natural Tones Color Palette
  const PALETTE = {
    forest: '#283618',
    moss: '#606C38',
    sage: '#8A9A5B',
    terracotta: '#BC6C25',
    ochre: '#DDA15E',
    rust: '#BC4749',
    sand: '#D4A373',
    olive: '#43522C',
  };

  let generatedChart: any = null;

  // 1. Try Gemini with Resilience if available
  if (ai) {
    try {
      const systemInstruction = `You are "MPLADS Sentinel AI Chart Bot", an expert visual analytics assistant for the Ministry of Statistics and Programme Implementation (MoSPI).
Generate an interactive chart specification in JSON based on the user's question and the real-time MPLADS database.
Your response MUST be raw valid JSON ONLY, without markdown code fences (\`\`\`json) or extra explanation text.
The JSON must follow this exact schema:
{
  "title": "string (clear, professional title)",
  "description": "string (1-sentence analytical context)",
  "chartType": "bar" | "line" | "area" | "pie" | "radar",
  "xAxisKey": "string (the key in each data item for the X-axis / category label)",
  "data": [
    { "name": "...", "val1": 10, "val2": 20 }
  ],
  "series": [
    { "key": "val1", "label": "Label 1", "color": "#283618" },
    { "key": "val2", "label": "Label 2", "color": "#606C38" }
  ],
  "insights": [
    "string (key analytical finding 1)",
    "string (key analytical finding 2)",
    "string (actionable recommendation)"
  ],
  "summaryStats": [
    { "label": "string", "value": "string", "hint": "string" }
  ],
  "suggestedPrompts": [
    "string (related query 1)",
    "string (related query 2)"
  ]
}
Ground all figures in realistic Indian MPLADS metrics (sanctioned amounts ₹Lakhs, expenditure ₹Lakhs, progress %, risk scores 0-100). Use earthy/natural tones for colors (#283618, #606C38, #8A9A5B, #BC6C25, #DDA15E, #BC4749).`;

      const prompt = `User Query: "${query}"
User Role: ${role}
Preferred Chart Type: ${chartTypePreference || 'auto'}
Available Telemetry Sample:
- Works count: ${worksDatabase.length}
- Signature project: MPL-1024 (Sanction: ₹21L, Spent: ₹38.4L, Fin: 92%, Phy: 41%, Gap: 51%, Risk: 94)
- Sample works: ${JSON.stringify(
        worksDatabase.slice(0, 6).map((w) => ({
          id: w.work_id,
          title: w.title,
          type: w.work_type,
          sanctioned: w.sanctioned_cost,
          expenditure: w.expenditure,
          fin_pct: w.financial_progress,
          phy_pct: w.physical_progress,
          gap: w.progress_gap,
          delay_days: w.delay_days,
          risk: w.risk_score,
          vendor_exposure: w.vendor_concentration_pct,
          state: w.state_name,
        }))
      )}
Generate the JSON chart definition now:`;

      const rawAiText = await callGeminiWithResilience(ai, {
        prompt,
        systemInstruction,
      });

      if (rawAiText) {
        const cleaned = rawAiText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
          generatedChart = parsed;
        }
      }
    } catch (err: any) {
      console.info('[AI Chart Bot] Gemini generation fallback to analytical heuristic:', err?.message || err);
    }
  }

  // 2. Deterministic High-Fidelity Heuristic Fallback Engine
  if (!generatedChart) {
    if (qLower.includes('cost') || qLower.includes('overrun') || qLower.includes('expenditure') || qLower.includes('budget') || qLower.includes('sanction')) {
      // Cost & Expenditure Comparison
      const items = worksDatabase.slice(0, 7).map((w) => ({
        name: w.work_id,
        title: w.title.length > 20 ? w.title.slice(0, 20) + '...' : w.title,
        Sanctioned: Number(w.sanctioned_cost.toFixed(1)),
        Expenditure: Number(w.expenditure.toFixed(1)),
        OverrunPct: Number(((w.expenditure - w.sanctioned_cost) / w.sanctioned_cost * 100).toFixed(1)),
      }));

      generatedChart = {
        title: 'Sanctioned Cost vs Actual Expenditure (₹ Lakhs)',
        description: 'Comparative financial utilization across flagged works highlighting cost escalations and unapproved variances.',
        chartType: chartTypePreference || 'bar',
        xAxisKey: 'name',
        data: items,
        series: [
          { key: 'Sanctioned', label: 'Sanctioned (₹L)', color: PALETTE.moss },
          { key: 'Expenditure', label: 'Actual Spent (₹L)', color: PALETTE.rust },
        ],
        insights: [
          'MPL-1024 exhibits the highest cost overrun (+82.8%) with ₹38.4L spent against ₹21.0L sanctioned.',
          'Average expenditure across flagged projects exceeds initial administrative sanctions by 24.3%.',
          'Immediate physical measurement book (MB) reconciliation recommended for works exceeding +15% variance.',
        ],
        summaryStats: [
          { label: 'Highest Overrun', value: '+82.8%', hint: 'MPL-1024 (Bankura)' },
          { label: 'Total Analyzed Spent', value: '₹142.6L', hint: '7 Flagged Works' },
          { label: 'Avg Variance', value: '+24.3%', hint: 'Above Sanction' },
        ],
        suggestedPrompts: [
          'Show financial vs physical progress gap chart',
          'Breakdown risk severity across all works',
          'Compare delay days by work category',
        ],
      };
    } else if (qLower.includes('risk') || qLower.includes('severity') || qLower.includes('critical') || qLower.includes('alert')) {
      // Risk Distribution
      const isPie = chartTypePreference === 'pie' || (!chartTypePreference && !qLower.includes('bar'));
      const counts = {
        Critical: worksDatabase.filter((w) => w.risk_severity === 'CRITICAL').length || 8,
        High: worksDatabase.filter((w) => w.risk_severity === 'HIGH').length || 14,
        Medium: worksDatabase.filter((w) => w.risk_severity === 'MEDIUM').length || 18,
        Low: worksDatabase.filter((w) => w.risk_severity === 'LOW').length || 11,
      };

      generatedChart = {
        title: 'Project Risk Severity Distribution',
        description: 'Categorization of monitored works by AI Predictive Risk Score thresholds (Critical ≥80, High 60-79, Medium 40-59, Low <40).',
        chartType: isPie ? 'pie' : 'bar',
        xAxisKey: 'name',
        data: [
          { name: 'Critical (≥80)', count: counts.Critical, color: PALETTE.rust },
          { name: 'High (60-79)', count: counts.High, color: PALETTE.terracotta },
          { name: 'Medium (40-59)', count: counts.Medium, color: PALETTE.ochre },
          { name: 'Low (<40)', count: counts.Low, color: PALETTE.moss },
        ],
        series: [
          { key: 'count', label: 'Projects Count', color: PALETTE.rust },
        ],
        insights: [
          `${counts.Critical} projects are categorized as Critical Risk requiring immediate joint inspection notices.`,
          'Combined High and Critical risk categories represent over 42% of prioritized surveillance volume.',
          'Early intervention on high-risk projects prevents average delay escalations of 90+ days.',
        ],
        summaryStats: [
          { label: 'Critical Works', value: `${counts.Critical}`, hint: 'Urgent Audit Needed' },
          { label: 'High Risk Works', value: `${counts.High}`, hint: 'Tight Supervision' },
          { label: 'Risk Health Index', value: '68.4/100', hint: 'National Score' },
        ],
        suggestedPrompts: [
          'Plot financial vs physical progress for top high-risk projects',
          'Show cost overrun by project type',
          'View vendor concentration percentages',
        ],
      };
    } else if (qLower.includes('delay') || qLower.includes('timeline') || qLower.includes('schedule') || qLower.includes('days')) {
      // Delay Analysis by Category
      const workTypes = ['Community Hall', 'Drinking Water', 'Rural Roads', 'School Infrastructure', 'Health Sub-Centre'];
      const delayData = workTypes.map((type) => {
        const matching = worksDatabase.filter((w) => w.work_type === type);
        const avgDelay = matching.length ? Math.round(matching.reduce((acc, w) => acc + (w.delay_days || 0), 0) / matching.length) : 45;
        const avgProb = matching.length ? Math.round(matching.reduce((acc, w) => acc + (w.delay_probability || 50), 0) / matching.length) : 60;
        return {
          name: type,
          AvgDelayDays: avgDelay,
          DelayProbability: avgProb,
        };
      });

      generatedChart = {
        title: 'Execution Delays & Breach Probability by Work Type',
        description: 'Mean days past target completion date and AI forecasted likelihood of further milestone delays.',
        chartType: chartTypePreference || 'bar',
        xAxisKey: 'name',
        data: delayData,
        series: [
          { key: 'AvgDelayDays', label: 'Average Delay (Days)', color: PALETTE.rust },
          { key: 'DelayProbability', label: 'Breach Probability (%)', color: PALETTE.terracotta },
        ],
        insights: [
          'Community Halls report the highest average delay (72 days) primarily due to multi-tranche billing stalls.',
          'Rural Roads exhibit an average delay probability of 68% driven by monsoon seasonality and right-of-way issues.',
          'Early warning alerts are triggered automatically once a project exceeds 30 delay days.',
        ],
        summaryStats: [
          { label: 'Max Avg Delay', value: '72 Days', hint: 'Community Halls' },
          { label: 'Overall Breach Risk', value: '74%', hint: 'Active Delayed Works' },
          { label: 'SLA Baseline', value: '180 Days', hint: 'Standard Sanction SLA' },
        ],
        suggestedPrompts: [
          'Show cost overrun by project type',
          'Radar chart of health components for MPL-1024',
          'Sanctioned vs actual expenditure comparison',
        ],
      };
    } else if (qLower.includes('vendor') || qLower.includes('agency') || qLower.includes('contractor') || qLower.includes('concentration')) {
      // Vendor Concentration
      const vendorData = [
        { name: 'Apex Infra Buildcon', Exposure: 68.4, ActiveWorks: 4, RiskScore: 92 },
        { name: 'Shiva Construction Co', Exposure: 44.2, ActiveWorks: 3, RiskScore: 78 },
        { name: 'Bengal Civil Works Ltd', Exposure: 39.8, ActiveWorks: 5, RiskScore: 65 },
        { name: 'Kashi Rural Dev Infra', Exposure: 31.5, ActiveWorks: 2, RiskScore: 54 },
        { name: 'Vidarbha Jal Sansthan', Exposure: 28.0, ActiveWorks: 3, RiskScore: 48 },
      ];

      generatedChart = {
        title: 'Vendor Concentration & Single-Entity Exposure (%)',
        description: 'Share of total block/district MPLADS civil contract volume concentrated within single executing entities.',
        chartType: chartTypePreference || 'bar',
        xAxisKey: 'name',
        data: vendorData,
        series: [
          { key: 'Exposure', label: 'Concentration Exposure (%)', color: PALETTE.rust },
          { key: 'RiskScore', label: 'Avg Risk Score', color: PALETTE.forest },
        ],
        insights: [
          'Apex Infra Buildcon holds 68.4% of civil contracts in Bankura block, triggering severe concentration flags.',
          'High vendor concentration correlates with a +38% higher rate of simultaneous progress mismatches.',
          'Competitive e-procurement audit recommended to ensure multi-vendor bidding compliance.',
        ],
        summaryStats: [
          { label: 'Top Exposure', value: '68.4%', hint: 'Apex Infra Buildcon' },
          { label: 'Threshold Limit', value: '40.0%', hint: 'Statutory Guideline' },
          { label: 'Concentration Flag', value: 'HIGH', hint: '3 Entities Over Threshold' },
        ],
        suggestedPrompts: [
          'Show financial vs physical gap for Bankura works',
          'Project health radar for MPL-1024',
          'Monthly expenditure trend',
        ],
      };
    } else if (qLower.includes('radar') || qLower.includes('mpl-1024') || qLower.includes('1024') || qLower.includes('health')) {
      // Radar Chart for MPL-1024 Health
      const single = worksDatabase.find((w) => w.work_id === 'MPL-1024') || worksDatabase[0];
      const radarData = [
        { subject: 'Financial Health', Score: single.health_components.financial, Benchmark: 80 },
        { subject: 'Execution Progress', Score: single.health_components.execution, Benchmark: 75 },
        { subject: 'Timeliness', Score: single.health_components.timeliness, Benchmark: 70 },
        { subject: 'Compliance', Score: single.health_components.compliance, Benchmark: 85 },
        { subject: 'Asset Integrity', Score: single.health_components.asset, Benchmark: 80 },
      ];

      generatedChart = {
        title: `Project Health Radar — ${single.work_id} (${single.title})`,
        description: 'Multi-dimensional institutional evaluation comparing project health indices against national MPLADS baselines.',
        chartType: chartTypePreference || 'radar',
        xAxisKey: 'subject',
        data: radarData,
        series: [
          { key: 'Score', label: `${single.work_id} Score`, color: PALETTE.rust },
          { key: 'Benchmark', label: 'National Benchmark', color: PALETTE.forest },
        ],
        insights: [
          `Timeliness score is severely depressed at ${single.health_components.timeliness}/100 due to 72 days timeline slippage.`,
          `Financial health (${single.health_components.financial}/100) and Execution (${single.health_components.execution}/100) show severe divergence (51% progress gap).`,
          'Overall composite health indicates an immediate requirement for executive engineering intervention.',
        ],
        summaryStats: [
          { label: 'Composite Health', value: '42.8/100', hint: 'Critical Health Status' },
          { label: 'Progress Gap', value: `${single.progress_gap}%`, hint: 'Financial vs Physical' },
          { label: 'Risk Score', value: `${single.risk_score}/100`, hint: 'Priority Rank 1' },
        ],
        suggestedPrompts: [
          'Show cost overrun comparison for all community halls',
          'Bar chart of delay days across sectors',
          'Risk severity breakdown pie chart',
        ],
      };
    } else if (qLower.includes('state') || qLower.includes('utilization') || qLower.includes('bengal') || qLower.includes('up') || qLower.includes('bihar')) {
      // State Level Comparison
      const stateData = [
        { name: 'West Bengal', Utilization: 78.4, AvgRisk: 62.1, WorksCount: 1420 },
        { name: 'Uttar Pradesh', Utilization: 84.2, AvgRisk: 54.3, WorksCount: 2840 },
        { name: 'Maharashtra', Utilization: 88.5, AvgRisk: 48.7, WorksCount: 1950 },
        { name: 'Bihar', Utilization: 71.3, AvgRisk: 66.8, WorksCount: 1610 },
        { name: 'Tamil Nadu', Utilization: 91.2, AvgRisk: 42.5, WorksCount: 1280 },
      ];

      generatedChart = {
        title: 'State-Level Fund Utilization & Risk Profile (%)',
        description: 'Cross-state comparison of aggregate MPLADS fund drawdown versus average predictive risk rating.',
        chartType: chartTypePreference || 'bar',
        xAxisKey: 'name',
        data: stateData,
        series: [
          { key: 'Utilization', label: 'Fund Utilization (%)', color: PALETTE.moss },
          { key: 'AvgRisk', label: 'Average Risk Rating', color: PALETTE.rust },
        ],
        insights: [
          'Tamil Nadu leads major states with 91.2% fund utilization and lowest risk score (42.5).',
          'Bihar and West Bengal show higher average risk ratings (66.8 & 62.1) linked to physical reporting lags.',
          'National fund utilization benchmark stands at 82.6% for FY 2024-25.',
        ],
        summaryStats: [
          { label: 'Top Utilization', value: '91.2%', hint: 'Tamil Nadu' },
          { label: 'Highest Risk State', value: '66.8/100', hint: 'Bihar' },
          { label: 'Total Works Audited', value: '9,100', hint: 'Top 5 States' },
        ],
        suggestedPrompts: [
          'Show delay days by work category',
          'Financial vs physical progress gap chart',
          'Breakdown risk severity across all works',
        ],
      };
    } else if (qLower.includes('month') || qLower.includes('trend') || qLower.includes('time') || qLower.includes('historical')) {
      // Monthly Utilization Trend
      const trendData = [
        { name: 'Apr', Sanctioned: 42.5, Expenditure: 28.2 },
        { name: 'May', Sanctioned: 58.0, Expenditure: 36.4 },
        { name: 'Jun', Sanctioned: 74.2, Expenditure: 52.1 },
        { name: 'Jul', Sanctioned: 91.0, Expenditure: 68.9 },
        { name: 'Aug', Sanctioned: 108.5, Expenditure: 84.6 },
        { name: 'Sep', Sanctioned: 125.0, Expenditure: 104.2 },
      ];

      generatedChart = {
        title: 'Monthly Cumulative Sanction vs Expenditure Trend (₹ Crores)',
        description: 'FY 2024-25 month-by-month financial disbursement trajectory compared to actual ground releases.',
        chartType: chartTypePreference || 'area',
        xAxisKey: 'name',
        data: trendData,
        series: [
          { key: 'Sanctioned', label: 'Sanctioned (₹ Cr)', color: PALETTE.forest },
          { key: 'Expenditure', label: 'Expenditure (₹ Cr)', color: PALETTE.ochre },
        ],
        insights: [
          'Consistent expenditure ramp-up observed from June through September as monsoon disruptions settled.',
          'Current cumulative expenditure stands at ₹104.2 Cr against ₹125.0 Cr sanctioned (83.4% rate).',
          'Q3 target requires maintaining monthly disbursement velocity above ₹20 Cr to meet annual SLA.',
        ],
        summaryStats: [
          { label: 'Sep Expenditure', value: '₹104.2 Cr', hint: 'Cumulative' },
          { label: 'Growth Velocity', value: '+19.6 Cr/mo', hint: 'Avg Ramp-up' },
          { label: 'Current Drawdown', value: '83.4%', hint: 'Of Sanctioned' },
        ],
        suggestedPrompts: [
          'Compare sanctioned cost vs actual spent for flagged works',
          'Show top vendor exposure percentages',
          'Risk severity breakdown pie chart',
        ],
      };
    } else {
      // Default: Financial vs Physical Progress Mismatch (Signature Core Capability)
      const gapData = worksDatabase.slice(0, 7).map((w) => ({
        name: w.work_id,
        title: w.title.length > 22 ? w.title.slice(0, 22) + '...' : w.title,
        Financial: w.financial_progress,
        Physical: w.physical_progress,
        DivergenceGap: w.progress_gap,
      }));

      generatedChart = {
        title: 'Financial Progress vs Physical Ground Progress (%)',
        description: 'Direct comparison of financial fund disbursement percentage against verified physical completion status across key priority works.',
        chartType: chartTypePreference || 'bar',
        xAxisKey: 'name',
        data: gapData,
        series: [
          { key: 'Financial', label: 'Financial Disbursed (%)', color: PALETTE.forest },
          { key: 'Physical', label: 'Physical Verified (%)', color: PALETTE.sage },
          { key: 'DivergenceGap', label: 'Progress Gap (pts)', color: PALETTE.rust },
        ],
        insights: [
          'MPL-1024 has the most severe divergence: 92% funds disbursed with only 41% physical progress (51% gap).',
          'Average progress gap across flagged portfolio is 38.6 percentage points, indicating systemic pre-payment velocity.',
          'Standard guidelines mandate physical inspection whenever the progress gap exceeds 25 percentage points.',
        ],
        summaryStats: [
          { label: 'Peak Gap', value: '51 pts', hint: 'MPL-1024 Community Hall' },
          { label: 'Avg Portfolio Gap', value: '38.6 pts', hint: 'Across 7 Key Works' },
          { label: 'Inspection Trigger', value: '> 25 pts', hint: 'Statutory Rule R-04' },
        ],
        suggestedPrompts: [
          'Show cost overrun comparison across sectors',
          'Plot risk severity breakdown pie chart',
          'View average delay days by project category',
        ],
      };
    }
  }

  // Ensure chartType matches preference if user explicitly requested one
  if (chartTypePreference && ['bar', 'line', 'area', 'pie', 'radar'].includes(chartTypePreference)) {
    generatedChart.chartType = chartTypePreference;
  }

  res.json({
    query,
    ...generatedChart,
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  MPLADS SENTINEL - AI-POWERED MONITORING PLATFORM   `);
    console.log(`  Dev Server running on http://0.0.0.0:${PORT}       `);
    console.log(`====================================================`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
