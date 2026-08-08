import React, { createContext, useContext, useState, useCallback } from 'react';
import { api, errMessage, CaseActionBody } from '../api/client';
import {
  Applicant,
  Application,
  Case,
  DashboardStats,
  OnboardingPayload,
  toApplicant,
} from '../types';
import { Palette } from '../constants/Palette';

export interface UserSession {
  email: string;
  role: 'applicant' | 'admin';
  name: string;
}

export const HARDCODED_USERS = {
  applicant: {
    email: 'applicant@trustlens.com',
    password: 'password123',
    role: 'applicant' as const,
    name: 'Amina Bibi',
  },
  admin: {
    email: 'admin@trustlens.com',
    password: 'admin123',
    role: 'admin' as const,
    name: 'Compliance Admin Officer',
  },
};

type ActionResult = { success: boolean; error?: string };

interface AppContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  user: UserSession | null;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  isOfficerMode: boolean;
  toggleRole: () => void;

  // Server-backed state
  applicants: Applicant[];
  loading: boolean;
  error: string | null;
  lastApplicationId: string | null;
  setLastApplicationId: (id: string | null) => void;

  loadApplications: () => Promise<void>;
  loadDashboard: () => Promise<DashboardStats | null>;
  loadQueue: () => Promise<Case[]>;
  submitApplicant: (payload: OnboardingPayload) => Promise<{ applicationId?: string; error?: string }>;
  getApplicationDetail: (id: string) => Promise<Application | null>;
  officerAction: (caseId: string, action: CaseActionBody['action'], note?: string) => Promise<ActionResult>;
  routeToEdd: (applicationId: string) => Promise<ActionResult>;
  submitClarification: (applicationId: string, message: string) => Promise<ActionResult>;

  colors: {
    background: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    bodyText: string;
    neutral: string;
    primary: string;
    primaryDark: string;
    primarySurface: string;
    secondary: string;
    border: string;
    errorRed: string;
    // Semantic risk colors
    riskLow: string;
    riskLowSurface: string;
    riskMedium: string;
    riskMediumSurface: string;
    riskHigh: string;
    riskHighSurface: string;
    // Legacy aliases (kept for backward compat)
    leafGreen: string;
    softCoral: string;
    warningOrange: string;
    headlineFont: string;
    bodyFont: string;
    bodyFontBold: string;
    stepTrack: string;
    iconBadgeBg: string;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isOfficerMode, setIsOfficerMode] = useState(false);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastApplicationId, setLastApplicationId] = useState<string | null>(null);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const toggleRole = () => setIsOfficerMode((prev) => !prev);

  const login = (email: string, pass: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (
      trimmedEmail === HARDCODED_USERS.applicant.email &&
      pass === HARDCODED_USERS.applicant.password
    ) {
      setUser({
        email: HARDCODED_USERS.applicant.email,
        role: 'applicant',
        name: HARDCODED_USERS.applicant.name,
      });
      setIsOfficerMode(false);
      return { success: true };
    } else if (
      trimmedEmail === HARDCODED_USERS.admin.email &&
      pass === HARDCODED_USERS.admin.password
    ) {
      setUser({
        email: HARDCODED_USERS.admin.email,
        role: 'admin',
        name: HARDCODED_USERS.admin.name,
      });
      setIsOfficerMode(true);
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
  };

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listApplications();
      setApplicants(res.applications.map(toApplicant));
    } catch (e) {
      const msg = errMessage(e);
      setError(msg);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      return await api.getDashboard();
    } catch (e) {
      setError(errMessage(e));
      return null;
    }
  }, []);

  const loadQueue = useCallback(async () => {
    try {
      const res = await api.getEddQueue();
      return res.queue;
    } catch (e) {
      setError(errMessage(e));
      return [];
    }
  }, []);

  const submitApplicant = useCallback(
    async (payload: OnboardingPayload): Promise<{ applicationId?: string; error?: string }> => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.submitOnboarding(payload);
        setLastApplicationId(res.application_id);
        return { applicationId: res.application_id };
      } catch (e) {
        const msg = errMessage(e);
        setError(msg);
        return { error: msg };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getApplicationDetail = useCallback(async (id: string): Promise<Application | null> => {
    try {
      return await api.getApplication(id);
    } catch (e) {
      setError(errMessage(e));
      return null;
    }
  }, []);

  const officerAction = useCallback(
    async (caseId: string, action: CaseActionBody['action'], note?: string): Promise<ActionResult> => {
      try {
        await api.caseAction(caseId, {
          action,
          note,
          officer: user?.name ?? 'officer',
        });
        return { success: true };
      } catch (e) {
        const msg = errMessage(e);
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [user],
  );

  const routeToEdd = useCallback(async (applicationId: string): Promise<ActionResult> => {
    try {
      await api.routeToEdd(applicationId);
      return { success: true };
    } catch (e) {
      const msg = errMessage(e);
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const submitClarification = useCallback(
    async (applicationId: string, message: string): Promise<ActionResult> => {
      try {
        await api.submitClarification(applicationId, message);
        return { success: true };
      } catch (e) {
        const msg = errMessage(e);
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [],
  );

  const palette = isDarkMode ? Palette.dark : Palette.light;

  const colors = {
    background: palette.background,
    surface: palette.surface,
    surfaceElevated: palette.surfaceElevated,
    text: palette.text,
    bodyText: palette.bodyText,
    neutral: palette.neutral,
    primary: palette.primary,
    primaryDark: palette.primaryDark,
    primarySurface: palette.primarySurface,
    secondary: palette.secondary,
    border: palette.surfaceBorder,
    errorRed: palette.errorRed,
    // Semantic risk
    riskLow: palette.riskLow,
    riskLowSurface: palette.riskLowSurface,
    riskMedium: palette.riskMedium,
    riskMediumSurface: palette.riskMediumSurface,
    riskHigh: palette.riskHigh,
    riskHighSurface: palette.riskHighSurface,
    // Legacy aliases
    leafGreen: palette.riskLow,
    softCoral: palette.riskHigh,
    warningOrange: palette.secondary,
    headlineFont: palette.headlineFont,
    bodyFont: palette.bodyFont,
    bodyFontBold: palette.bodyFontBold,
    stepTrack: palette.stepTrack,
    iconBadgeBg: palette.iconBadgeBg,
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        user,
        login,
        logout,
        isOfficerMode,
        toggleRole,
        applicants,
        loading,
        error,
        lastApplicationId,
        setLastApplicationId,
        loadApplications,
        loadDashboard,
        loadQueue,
        submitApplicant,
        getApplicationDetail,
        officerAction,
        routeToEdd,
        submitClarification,
        colors,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};