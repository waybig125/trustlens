export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Applicant {
  id: string;
  name: string;
  occupation: string;
  riskLevel: RiskLevel;
  aiConfidence: number;
  aiReasoning: string;
  signals: Record<string, string>;
  status: string;
}

export interface AppState {
  isDarkMode: boolean;
  isOfficerMode: boolean;
  applicants: Applicant[];
  currentApplicantForm: Record<string, string>;
  applicantStatus: string | null;
}
