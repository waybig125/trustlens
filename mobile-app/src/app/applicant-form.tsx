import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Lock,
  ChevronRight,
  User,
  Landmark,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { parseAmount, OnboardingPayload } from '../types';
import { AnimatedTrustPlant } from '../components/AnimatedTrustPlant';
import { FadeInView } from '../components/AnimatedContainers';

// ── Field definitions ────────────────────────────────────────────
interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  keyboardType: 'default' | 'number-pad' | 'email-address';
  required: boolean;
  step: 1 | 2 | 3;
}

const FIELDS: FieldDef[] = [
  { key: 'name', label: 'Full Name', placeholder: 'e.g. Amina Bibi', keyboardType: 'default', required: true, step: 1 },
  { key: 'idNum', label: 'CNIC / ID Number', placeholder: 'e.g. 35202-1234567-1', keyboardType: 'number-pad', required: true, step: 1 },
  { key: 'city', label: 'City', placeholder: 'e.g. Lahore', keyboardType: 'default', required: false, step: 1 },
  { key: 'address', label: 'Address', placeholder: 'e.g. House #12, Block B', keyboardType: 'default', required: false, step: 1 },
  { key: 'employment', label: 'Employment Type', placeholder: 'e.g. Teacher / Freelancer', keyboardType: 'default', required: true, step: 2 },
  { key: 'businessType', label: 'Business Type (if self-employed)', placeholder: 'e.g. Electronics shop', keyboardType: 'default', required: false, step: 2 },
  { key: 'income', label: 'Declared Monthly Income', placeholder: 'e.g. 60000', keyboardType: 'number-pad', required: true, step: 2 },
  { key: 'behavior', label: 'Expected Monthly Transactions', placeholder: 'e.g. 40000', keyboardType: 'number-pad', required: true, step: 3 },
  { key: 'intent', label: 'Account Purpose', placeholder: 'e.g. Savings & Local Transfers', keyboardType: 'default', required: true, step: 3 },
];

const TOTAL_FIELDS = FIELDS.length;
const REQUIRED_FIELDS = FIELDS.filter((f) => f.required);

export default function ApplicantFormScreen() {
  const router = useRouter();
  const { colors, isDarkMode, submitApplicant } = useApp();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Field values keyed by field key
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    // Clear error when user types
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // ── Completion tracking ─────────────────────────────────────────
  const filledCount = useMemo(
    () => FIELDS.filter((f) => (values[f.key] || '').trim().length > 0).length,
    [values],
  );
  const growth = filledCount / TOTAL_FIELDS;
  const progressPercent = Math.round(growth * 100);

  const stepFields = (step: number) => FIELDS.filter((f) => f.step === step);

  const isStepComplete = (step: number) =>
    stepFields(step)
      .filter((f) => f.required)
      .every((f) => (values[f.key] || '').trim().length > 0);

  const step1Complete = isStepComplete(1);
  const step2Complete = isStepComplete(2);
  const allRequiredComplete = REQUIRED_FIELDS.every(
    (f) => (values[f.key] || '').trim().length > 0,
  );

  // ── Validation ──────────────────────────────────────────────────
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    stepFields(step)
      .filter((f) => f.required)
      .forEach((f) => {
        if (!(values[f.key] || '').trim()) {
          newErrors[f.key] = `${f.label} is required`;
        }
      });
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // ── Step navigation with gating ─────────────────────────────────
  const tryGoToStep = (target: 1 | 2 | 3) => {
    if (target === activeStep) return;
    // Can always go back
    if (target < activeStep) {
      setActiveStep(target);
      return;
    }
    // Going forward requires current step validation
    if (target === 2 && !validateStep(1)) return;
    if (target === 3) {
      if (!validateStep(1)) { setActiveStep(1); return; }
      if (!validateStep(2)) { setActiveStep(2); return; }
    }
    setActiveStep(target);
  };

  const handleNextOrSubmit = () => {
    if (activeStep === 1) {
      if (validateStep(1)) setActiveStep(2);
    } else if (activeStep === 2) {
      if (validateStep(2)) setActiveStep(3);
    } else {
      if (!validateStep(3)) return;
      if (!allRequiredComplete) {
        Alert.alert('Incomplete', 'Please fill all required fields before submitting.');
        return;
      }
      setIsSubmitting(true);
      // Build the backend payload from the typed values.
      const payload: OnboardingPayload = {
        name: (values.name || '').trim(),
        cnic: (values.idNum || '').trim(),
        city: (values.city || '').trim() || undefined,
        address: (values.address || '').trim() || undefined,
        employment_type: (values.employment || '').trim(),
        business_type: (values.businessType || '').trim() || undefined,
        monthly_income: parseAmount(values.income),
        account_purpose: (values.intent || '').trim(),
        expected_monthly_transactions: parseAmount(values.behavior),
      };
      submitApplicant(payload).then((res) => {
        setIsSubmitting(false);
        if (res.error) {
          Alert.alert('Submission failed', res.error);
          return;
        }
        router.replace({
          pathname: '/applicant-status',
          params: res.applicationId ? { app_id: res.applicationId } : {},
        });
      });
    }
  };

  // ── Render helpers ──────────────────────────────────────────────
  const renderField = (field: FieldDef) => {
    const val = values[field.key] || '';
    const err = errors[field.key];
    return (
      <View key={field.key} style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
          {field.label}
          {field.required && <Text style={{ color: colors.errorRed }}> *</Text>}
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.surfaceElevated,
              color: colors.text,
              borderColor: err ? colors.errorRed : colors.border,
              fontFamily: colors.bodyFont,
            },
          ]}
          placeholder={field.placeholder}
          placeholderTextColor={colors.neutral}
          value={val}
          onChangeText={(t) => setValue(field.key, t)}
          keyboardType={field.keyboardType}
          accessibilityLabel={field.label}
          autoCapitalize={(field.keyboardType === 'number-pad' || field.keyboardType === 'email-address') ? 'none' : 'words'}
        />
        {err && (
          <Text style={[styles.errorText, { color: colors.errorRed, fontFamily: colors.bodyFont }]}>
            {err}
          </Text>
        )}
      </View>
    );
  };

  const stepIcon = (step: number) => {
    if (step === 1) return <User size={22} color={colors.primaryDark} />;
    if (step === 2) return <Landmark size={22} color={colors.primaryDark} />;
    return <Briefcase size={22} color={colors.primaryDark} />;
  };

  const stepTitle = (step: number) => {
    if (step === 1) return 'Identity Details';
    if (step === 2) return 'Income Source';
    return 'Business Purpose';
  };

  const stepSubtitle = (step: number) => {
    const complete = isStepComplete(step);
    if (step === 1) return complete ? 'Identity verified ✓' : 'Verify your government ID';
    if (step === 2) return complete ? 'Income verified ✓' : 'Help us tailor your limits';
    return complete ? 'Purpose defined ✓' : 'How you\'ll use this account';
  };

  const isStepLocked = (step: number) => {
    if (step === 1) return false;
    if (step === 2) return !step1Complete;
    return !step1Complete || !step2Complete;
  };

  const renderStepCard = (step: 1 | 2 | 3) => {
    const locked = isStepLocked(step);
    const isActive = activeStep === step;
    const complete = isStepComplete(step);

    return (
      <TouchableOpacity
        style={[
          styles.stepCard,
          {
            backgroundColor: colors.surface,
            borderColor: isActive ? colors.primary : colors.border,
            opacity: locked ? 0.5 : 1,
          },
        ]}
        onPress={() => {
          if (locked) {
            Alert.alert('Complete Previous Step', 'Please complete the current step first.');
            return;
          }
          tryGoToStep(step);
        }}
        activeOpacity={0.85}
        accessibilityLabel={`Step ${step}: ${stepTitle(step)}, ${locked ? 'locked' : complete ? 'complete' : 'incomplete'}`}
        accessibilityRole="button"
      >
        <View style={styles.stepCardLeft}>
          <View style={[styles.stepIconBox, { backgroundColor: colors.iconBadgeBg }]}>
            {stepIcon(step)}
          </View>
          <View style={styles.stepTitleGroup}>
            <Text style={[styles.stepTag, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              STEP {step}
            </Text>
            <Text style={[styles.stepTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
              {stepTitle(step)}
            </Text>
            {!isActive && (
              <Text style={[styles.stepSub, { color: complete ? colors.riskLow : colors.bodyText, fontFamily: colors.bodyFont }]}>
                {stepSubtitle(step)}
              </Text>
            )}
          </View>
        </View>
        {locked ? (
          <Lock size={18} color={colors.neutral} />
        ) : complete ? (
          <CheckCircle2 size={20} color={colors.riskLow} />
        ) : (
          <ChevronRight size={20} color={colors.neutral} />
        )}
      </TouchableOpacity>
    );
  };

  const renderStepFields = (step: 1 | 2 | 3) => {
    if (activeStep !== step) return null;
    return (
      <View style={styles.formContainer}>
        {stepFields(step).map(renderField)}
      </View>
    );
  };

  const canSubmit = activeStep === 3 && allRequiredComplete && !isSubmitting;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Header */}
        <FadeInView delay={50} fromY={-10} style={styles.topHeader}>
          <Text
            style={[styles.screenTitle, { color: colors.text, fontFamily: colors.headlineFont }]}
            accessibilityRole="header"
          >
            KYC Verification
          </Text>
          <Text style={[styles.stepCounterText, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
            {filledCount} of {TOTAL_FIELDS} fields ({progressPercent}%)
          </Text>
        </FadeInView>

        {/* Progress Bar — animated by growth */}
        <View style={[styles.progressTrack, { backgroundColor: colors.stepTrack }]}>
          <View
            style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progressPercent}%` }]}
          />
        </View>

        {/* Trust Plant — continuous growth */}
        <FadeInView delay={150} scale={0.85} style={styles.heroCircleWrapper}>
          <View
            style={[
              styles.heroCircle,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <AnimatedTrustPlant
              growth={growth}
              size={120}
              dark={isDarkMode}
              focused={true}
            />
          </View>
        </FadeInView>

        {/* Headline */}
        <FadeInView delay={250} fromY={15} style={styles.textGroup}>
          <Text style={[styles.headline, { color: colors.text, fontFamily: colors.headlineFont }]}>
            Grow Your Account
          </Text>
          <Text style={[styles.subtitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
            Each field you complete grows your Trust Plant. Fill all required fields to submit.
          </Text>
        </FadeInView>

        {/* Step 1 */}
        <FadeInView delay={300}>
          {renderStepCard(1)}
        </FadeInView>
        {renderStepFields(1)}

        {/* Step 2 */}
        <FadeInView delay={350}>
          {renderStepCard(2)}
        </FadeInView>
        {renderStepFields(2)}

        {/* Step 3 */}
        <FadeInView delay={400}>
          {renderStepCard(3)}
        </FadeInView>
        {renderStepFields(3)}

        {/* Legal */}
        <Text style={[styles.legalNotice, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
          By continuing, you agree to our{' '}
          <Text style={{ color: colors.warningOrange, fontFamily: colors.bodyFontBold }}>Terms</Text>{' '}
          and{' '}
          <Text style={{ color: colors.warningOrange, fontFamily: colors.bodyFontBold }}>Privacy Policy</Text>
        </Text>

        {/* Action Button */}
        <FadeInView delay={450}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: activeStep === 3 && !canSubmit ? colors.neutral : colors.primary,
              },
            ]}
            onPress={handleNextOrSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
            accessibilityLabel={
              activeStep === 3
                ? canSubmit ? 'Submit KYC application' : 'Fill all required fields to submit'
                : `Continue to step ${activeStep + 1}`
            }
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#121212" />
            ) : (
              <>
                <Text style={[styles.actionButtonText, { fontFamily: colors.bodyFontBold }]}>
                  {activeStep === 3 ? 'Submit Application' : 'Continue'}
                </Text>
                <ArrowRight size={18} color="#121212" />
              </>
            )}
          </TouchableOpacity>
        </FadeInView>

        <TouchableOpacity
          style={styles.laterButton}
          onPress={() => router.replace('/')}
          activeOpacity={0.7}
          accessibilityLabel="Skip and go back to home"
          accessibilityRole="button"
        >
          <Text style={[styles.laterText, { color: colors.text, fontFamily: colors.bodyFontBold }]}>
            {'I\u2019ll do this later'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  screenTitle: { fontSize: 20 },
  stepCounterText: { fontSize: 12 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  heroCircleWrapper: { alignItems: 'center', marginBottom: 16 },
  heroCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: { alignItems: 'center', marginBottom: 24 },
  headline: { fontSize: 28, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  stepCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  stepIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitleGroup: { flex: 1 },
  stepTag: { fontSize: 10, letterSpacing: 0.5, marginBottom: 2 },
  stepTitle: { fontSize: 16 },
  stepSub: { fontSize: 12, marginTop: 2 },
  formContainer: { paddingHorizontal: 8, marginBottom: 12, gap: 12, overflow: 'hidden' },
  inputGroup: { marginBottom: 4 },
  inputLabel: { fontSize: 12, marginBottom: 6 },
  textInput: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  errorText: { fontSize: 11, marginTop: 4 },
  legalNotice: { fontSize: 12, textAlign: 'center', marginTop: 16, marginBottom: 16 },
  actionButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  actionButtonText: { color: '#121212', fontSize: 16 },
  laterButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  laterText: { fontSize: 14 },
});
