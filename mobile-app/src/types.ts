export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export type BackendLevel = 'low' | 'medium' | 'high';
export type Verdict = 'consistent' | 'attention' | 'inconsistent';

export interface Signal {
  label: string;
  value: string;
  verdict: Verdict;
  note: string;
}

export interface RiskResult {
  level: BackendLevel;
  confidence: number;
  signals: Signal[];
  conclusion: string;
  engine: string;
}

export interface Profile {
  name: string;
  cnic?: string | null;
  dob?: string | null;
  address?: string | null;
  city?: string | null;
  employment_type?: string | null;
  business_type?: string | null;
  monthly_income: number;
  account_purpose?: string | null;
  expected_monthly_transactions: number;
}

export interface HistoryEntry {
  status: string;
  at: string;
  by: string;
  note: string;
}

export interface Case {
  case_id: string;
  application_id: string;
  applicant_name: string;
  risk_level: string;
  status: string;
  reason: string;
  created_at: string;
  history: HistoryEntry[];
}

export interface Application {
  id: string;
  profile: Profile;
  risk: RiskResult;
  status: string;
  case_id: string | null;
  created_at: string;
  history: HistoryEntry[];
  plant_state: string;
  case?: Case | null;
}

export interface ApplicationSummary {
  id: string;
  name: string;
  city: string;
  level: BackendLevel;
  confidence: number;
  status: string;
  case_id: string | null;
  plant_state: string;
  created_at: string;
}

export interface DashboardStats {
  total_applications: number;
  risk_distribution: Record<string, number>;
  status_counts: Record<string, number>;
  edd_queue_open: number;
  edd_resolved: number;
  before_after_review: { pending_before_review: number; resolved_after_review: number };
  transitions: { application_id: string; name: string; status: string; at: string; by: string }[];
}

export interface OnboardingPayload {
  name: string;
  cnic?: string;
  dob?: string;
  address?: string;
  city?: string;
  employment_type?: string;
  business_type?: string;
  monthly_income: number;
  account_purpose?: string;
  expected_monthly_transactions: number;
}

export interface OnboardingResponse {
  application_id: string;
  risk: RiskResult;
  status: string;
  plant_state: string;
  case_id: string | null;
}

// ── Frontend view model for the officer list ────────────────────────────
export interface Applicant {
  id: string;
  name: string;
  city?: string;
  riskLevel: RiskLevel;
  aiConfidence: number;
  status: string;
  statusLabel: string;
  caseId: string | null;
  plantState: string;
  createdAt: string;
}

// ── Mappers ─────────────────────────────────────────────────────────────
export function toRiskLevel(level: string | null | undefined): RiskLevel {
  const l = (level || '').toLowerCase();
  if (l === 'high') return RiskLevel.HIGH;
  if (l === 'medium') return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

export function riskLabel(level: string | null | undefined): string {
  const r = toRiskLevel(level);
  if (r === RiskLevel.HIGH) return 'HIGH RISK';
  if (r === RiskLevel.MEDIUM) return 'MEDIUM RISK';
  return 'LOW RISK';
}

export function toApplicant(summary: ApplicationSummary): Applicant {
  return {
    id: summary.id,
    name: summary.name,
    city: summary.city,
    riskLevel: toRiskLevel(summary.level),
    aiConfidence: summary.confidence,
    status: summary.status,
    statusLabel: humanStatus(summary.status),
    caseId: summary.case_id,
    plantState: summary.plant_state,
    createdAt: summary.created_at,
  };
}

export function humanStatus(status: string | null | undefined): string {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'Approved';
    case 'needs_attention':
      return 'Needs Attention';
    case 'in_edd':
      return 'Under EDD Review';
    case 'clarification_requested':
      return 'Clarification Requested';
    case 'escalated':
      return 'Escalated';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'pending_review':
      return 'Pending Review';
    case 'under_review':
      return 'Under Review';
    default:
      return status || 'New';
  }
}

// Map a backend plant_state to the plant animation's growth (0→1).
export function plantGrowth(state: string | null | undefined): number {
  switch ((state || '').toLowerCase()) {
    case 'bloomed':
      return 1.0;
    case 'healthy':
      return 0.9;
    case 'needs_attention':
      return 0.55;
    case 'review_requested':
      return 0.45;
    case 'under_review':
      return 0.4;
    case 'declined':
      return 0.2;
    default:
      return 0.5;
  }
}

// Parse human-typed amounts like "60,000", "PKR 60,000/month", "60k", "1.5M" → number.
export function parseAmount(raw: string | number | undefined): number {
  if (typeof raw === 'number') return raw;
  const s = (raw || '').trim();
  if (!s) return 0;
  const lower = s.toLowerCase();
  if (lower.endsWith('k')) {
    const num = Number.parseFloat(lower.replace(/[^0-9.]/g, ''));
    return Number.isNaN(num) ? 0 : num * 1000;
  }
  if (lower.endsWith('m')) {
    const num = Number.parseFloat(lower.replace(/[^0-9.]/g, ''));
    return Number.isNaN(num) ? 0 : num * 1000000;
  }
  const cleaned = s.replace(/[^0-9.]/g, '');
  const num = Number.parseFloat(cleaned);
  if (Number.isNaN(num)) return 0;
  return num;
}