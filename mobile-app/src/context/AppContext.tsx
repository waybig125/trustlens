import React, { createContext, useContext, useState } from 'react';
import { Applicant, RiskLevel } from '../types';
import { Palette } from '../constants/Palette';

export const mockApplicants: Applicant[] = [
  {
    id: '1',
    name: 'Amina Bibi',
    occupation: 'Teacher',
    riskLevel: RiskLevel.LOW,
    aiConfidence: 96,
    aiReasoning:
      'LOW RISK CONFIDENCE (96%): Consistent income matching stated transaction volume. Address verified via secondary utility source. No unusual cross-border activity.',
    signals: {
      Income: 'PKR 60,000/month',
      'Expected Volume': 'PKR 40,000/month',
      Address: 'Matching',
      Intent: 'Savings & Local Transfers',
    },
    status: 'Auto-Approved',
  },
  {
    id: '2',
    name: 'Kamran',
    occupation: 'Shopkeeper',
    riskLevel: RiskLevel.HIGH,
    aiConfidence: 89,
    aiReasoning:
      'HIGH RISK CONFIDENCE (89%): Declared income of PKR 40,000/month does not match expected international transaction volume of PKR 2,500,000/month. Address verification shows cross-district variance. Action required: Enhanced Due Diligence.',
    signals: {
      Income: 'PKR 40,000/month',
      'Expected Volume': 'PKR 2,500,000/month',
      Address: 'Cross-District Variance',
      Intent: 'International Trading',
    },
    status: 'Pending Review',
  },
  {
    id: '3',
    name: 'Zaid Khan',
    occupation: 'Freelancer',
    riskLevel: RiskLevel.MEDIUM,
    aiConfidence: 72,
    aiReasoning:
      'MEDIUM RISK CONFIDENCE (72%): New identity file. Income source is variable. Pending secondary KYC verification.',
    signals: {
      Income: 'Variable',
      'Expected Volume': 'PKR 150,000/month',
      Address: 'Pending',
      Intent: 'Freelance Receipts',
    },
    status: 'Pending Review',
  },
];

interface AppContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isOfficerMode: boolean;
  toggleRole: () => void;
  applicants: Applicant[];
  currentApplicantForm: Record<string, string>;
  applicantStatus: string | null;
  submitApplicantForm: (form: Record<string, string>) => void;
  updateApplicantStatus: (id: string, newStatus: string, newRiskLevel?: RiskLevel) => void;
  colors: {
    background: string;
    surface: string;
    text: string;
    bodyText: string;
    neutral: string;
    primary: string;
    secondary: string;
    border: string;
    errorRed: string;
    leafGreen: string;
    softCoral: string;
    warningOrange: string;
    headlineFont: string;
    bodyFont: string;
    bodyFontBold: string;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOfficerMode, setIsOfficerMode] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [currentApplicantForm, setCurrentApplicantForm] = useState<Record<string, string>>({});
  const [applicantStatus, setApplicantStatus] = useState<string | null>(null);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const toggleRole = () => setIsOfficerMode((prev) => !prev);

  const submitApplicantForm = (form: Record<string, string>) => {
    setCurrentApplicantForm(form);
    setApplicantStatus('Application Under AI Review');
  };

  const updateApplicantStatus = (id: string, newStatus: string, newRiskLevel?: RiskLevel) => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          return {
            ...app,
            status: newStatus,
            riskLevel: newRiskLevel ?? app.riskLevel,
          };
        }
        return app;
      })
    );
  };

  const palette = isDarkMode ? Palette.dark : Palette.light;

  const colors = {
    background: palette.background,
    surface: palette.surface,
    text: isDarkMode ? palette.text! : palette.secondary!,
    bodyText: isDarkMode ? palette.bodyText! : palette.neutral!,
    neutral: palette.neutral,
    primary: palette.primary,
    secondary: palette.secondary,
    border: palette.surfaceBorder,
    errorRed: palette.errorRed,
    leafGreen: palette.leafGreen,
    softCoral: palette.softCoral!,
    warningOrange: isDarkMode ? palette.secondary! : palette.accentOrange!,
    headlineFont: palette.headlineFont,
    bodyFont: palette.bodyFont,
    bodyFontBold: palette.bodyFontBold,
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        isOfficerMode,
        toggleRole,
        applicants,
        currentApplicantForm,
        applicantStatus,
        submitApplicantForm,
        updateApplicantStatus,
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
