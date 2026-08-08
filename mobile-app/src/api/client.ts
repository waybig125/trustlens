import { Platform } from 'react-native';
import type {
  Application,
  ApplicationSummary,
  Case,
  DashboardStats,
  OnboardingPayload,
  OnboardingResponse,
} from '../types';

declare const process: { env: { EXPO_PUBLIC_API_URL?: string } };

const DEFAULT_BASE = 'https://trustlens-backend-5hot.onrender.com';

export const BASE_URL: string = (
  process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE
).replace(/\/+$/, '');

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function errMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Unexpected error';
}

export interface HealthResponse {
  service: string;
  status: string;
  store: string;
  engine: string;
  demo_mode: boolean;
  auto_edd_levels: string[];
}

export type OfficerActionType =
  | 'approve'
  | 'request_clarification'
  | 'escalate'
  | 'reject';

export interface CaseActionBody {
  action: OfficerActionType;
  note?: string;
  officer?: string;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeout = 15000, ...init } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      let msg = `Request failed (HTTP ${res.status})`;
      try {
        const body = await res.json();
        if (body && typeof body.detail === 'string') msg = body.detail;
      } catch {
        // non-JSON error body
      }
      throw new ApiError(res.status, msg);
    }
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ApiError(0, 'Request timed out — is the backend reachable?');
    }
    throw new ApiError(0, e instanceof Error ? e.message : 'Network error');
  } finally {
    clearTimeout(timer);
  }
}

function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body == null ? undefined : JSON.stringify(body),
  });
}

/** Client wrapper for every TrustLens backend route. */
export const api = {
  // GET /                    — service health + engine info
  health: () => get<HealthResponse>('/'),

  // POST /api/onboarding     — submit profile → risk assessment (+ EDD case if flagged)
  submitOnboarding: (payload: OnboardingPayload) =>
    post<OnboardingResponse>('/api/onboarding', payload),

  // GET /api/applications    — officer list / garden grid (summary rows)
  listApplications: () =>
    get<{ count: number; applications: ApplicationSummary[] }>('/api/applications'),

  // GET /api/applications/{id} — full detail + reasoning trail + case
  getApplication: (id: string) =>
    get<Application>(`/api/applications/${encodeURIComponent(id)}`),

  // POST /api/applications/{id}/route-edd — officer pulls a case into EDD
  routeToEdd: (id: string) =>
    post<{ case_id: string; status: string; plant_state?: string }>(
      `/api/applications/${encodeURIComponent(id)}/route-edd`,
    ),

  // POST /api/applications/{id}/clarify — applicant sends clarification
  submitClarification: (id: string, message: string) =>
    post<{ case_id: string; status: string }>(
      `/api/applications/${encodeURIComponent(id)}/clarify`,
      { message },
    ),

  // GET /api/edd/queue — pending EDD cases
  getEddQueue: () =>
    get<{ count: number; queue: Case[] }>('/api/edd/queue'),

  // POST /api/cases/{id}/action — approve / request_clarification / escalate / reject
  caseAction: (caseId: string, body: CaseActionBody) =>
    post<{ case_id: string; case_status: string; application_status: string; plant_state: string }>(
      `/api/cases/${encodeURIComponent(caseId)}/action`,
      body,
    ),

  // GET /api/dashboard — volume, risk distribution, EDD queue, before/after
  getDashboard: () => get<DashboardStats>('/api/dashboard'),

  // POST /api/reset — reseed demo data (not exposed in the UI)
  reset: () => post<{ status: string; applications: number }>('/api/reset'),
};

export type {
  Application,
  ApplicationSummary,
  Case,
  DashboardStats,
  OnboardingPayload,
  OnboardingResponse,
};