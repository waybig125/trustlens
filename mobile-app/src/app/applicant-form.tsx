import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Lock,
  ChevronRight,
  User,
  Landmark,
  Briefcase,
  ArrowRight,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { AnimatedTrustPlant } from '../components/AnimatedTrustPlant';

export default function ApplicantFormScreen() {
  const router = useRouter();
  const { colors, submitApplicantForm } = useApp();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Step 1: Identity
  const [name, setName] = useState('');
  const [idNum, setIdNum] = useState('');
  const [address, setAddress] = useState('');

  // Step 2: Income
  const [employment, setEmployment] = useState('');
  const [income, setIncome] = useState('');

  // Step 3: Business Purpose
  const [behavior, setBehavior] = useState('');
  const [intent, setIntent] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const step1Complete = name.trim().length > 0 && idNum.trim().length > 0;
  const step2Complete = employment.trim().length > 0 && income.trim().length > 0;
  const step3Complete = behavior.trim().length > 0 && intent.trim().length > 0;

  const currentProgressPercent =
    activeStep === 1 ? 33 : activeStep === 2 ? 66 : 100;

  const handleNextOrSubmit = () => {
    if (activeStep === 1) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      setActiveStep(3);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        submitApplicantForm({
          'Full Name': name || 'Amina Bibi',
          'CNIC / ID': idNum || '35202-1234567-1',
          Employment: employment || 'Teacher',
          Income: income || 'PKR 60,000/month',
          Behavior: behavior || 'PKR 40,000/month',
          Intent: intent || 'Savings & Local Transfers',
          Address: address || 'House #12, Block B, Lahore',
        });
        setIsSubmitting(false);
        router.replace('/applicant-status');
      }, 1500);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Top Header Row */}
      <View style={styles.topHeader}>
        <Text style={[styles.screenTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
          KYC Verification
        </Text>
        <Text style={[styles.stepCounterText, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
          Step {activeStep} of 3 ({currentProgressPercent}%)
        </Text>
      </View>

      {/* Progress Bar Track */}
      <View style={[styles.progressTrack, { backgroundColor: colors.stepTrack }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.primary, width: `${currentProgressPercent}%` },
          ]}
        />
      </View>

      {/* Animated Trust Plant Hero */}
      <View style={styles.heroCircleWrapper}>
        <View
          style={[
            styles.heroCircle,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <AnimatedTrustPlant
            stage={activeStep === 1 ? 1 : activeStep === 2 ? 2 : 3}
            size={120}
          />
        </View>
      </View>

      {/* Hero Headline & Subtitle */}
      <View style={styles.textGroup}>
        <Text style={[styles.headline, { color: colors.text, fontFamily: colors.headlineFont }]}>
          Grow Your Account
        </Text>
        <Text style={[styles.subtitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
          Provide a few details to unlock full trading capabilities and increased transaction limits.
        </Text>
      </View>

      {/* STEP 1 CARD */}
      <TouchableOpacity
        style={[
          styles.stepCard,
          {
            backgroundColor: colors.surface,
            borderColor: activeStep === 1 ? colors.primary : colors.border,
          },
        ]}
        onPress={() => setActiveStep(1)}
        activeOpacity={0.85}>
        <View style={styles.stepCardLeft}>
          <View style={[styles.stepIconBox, { backgroundColor: colors.iconBadgeBg }]}>
            <User size={22} color={colors.primaryDark} />
          </View>
          <View style={styles.stepTitleGroup}>
            <Text style={[styles.stepTag, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              STEP 1
            </Text>
            <Text style={[styles.stepTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
              Identity Details
            </Text>
            {activeStep !== 1 && (
              <Text style={[styles.stepSub, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                {step1Complete ? 'Verified Profile' : 'Verify your government ID'}
              </Text>
            )}
          </View>
        </View>
        <ChevronRight size={20} color={colors.neutral} />
      </TouchableOpacity>

      {activeStep === 1 && (
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              Full Name
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
              placeholder="e.g. Amina Bibi"
              placeholderTextColor={colors.neutral}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              CNIC / ID Number
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
              placeholder="e.g. 35202-1234567-1"
              placeholderTextColor={colors.neutral}
              value={idNum}
              onChangeText={setIdNum}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              Address & City Verification
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
              placeholder="e.g. House #12, Block B, Lahore"
              placeholderTextColor={colors.neutral}
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>
      )}

      {/* STEP 2 CARD */}
      <TouchableOpacity
        style={[
          styles.stepCard,
          {
            backgroundColor: colors.surface,
            borderColor: activeStep === 2 ? colors.primary : colors.border,
            opacity: activeStep < 2 && !step1Complete ? 0.6 : 1,
          },
        ]}
        onPress={() => setActiveStep(2)}
        activeOpacity={0.85}>
        <View style={styles.stepCardLeft}>
          <View style={[styles.stepIconBox, { backgroundColor: colors.iconBadgeBg }]}>
            <Landmark size={22} color={colors.primaryDark} />
          </View>
          <View style={styles.stepTitleGroup}>
            <Text style={[styles.stepTag, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              STEP 2
            </Text>
            <Text style={[styles.stepTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
              Income Source
            </Text>
            {activeStep !== 2 && (
              <Text style={[styles.stepSub, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                {step2Complete ? 'Income Verified' : 'Help us tailor your limits'}
              </Text>
            )}
          </View>
        </View>
        {activeStep < 2 ? (
          <Lock size={18} color={colors.neutral} />
        ) : (
          <ChevronRight size={20} color={colors.neutral} />
        )}
      </TouchableOpacity>

      {activeStep === 2 && (
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              Employment Type
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
              placeholder="e.g. Teacher / Freelancer / Shopkeeper"
              placeholderTextColor={colors.neutral}
              value={employment}
              onChangeText={setEmployment}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              Declared Monthly Income
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
              placeholder="e.g. PKR 60,000/month"
              placeholderTextColor={colors.neutral}
              value={income}
              onChangeText={setIncome}
            />
          </View>
        </View>
      )}

      {/* STEP 3 CARD */}
      <TouchableOpacity
        style={[
          styles.stepCard,
          {
            backgroundColor: colors.surface,
            borderColor: activeStep === 3 ? colors.primary : colors.border,
            opacity: activeStep < 3 && !step2Complete ? 0.6 : 1,
          },
        ]}
        onPress={() => setActiveStep(3)}
        activeOpacity={0.85}>
        <View style={styles.stepCardLeft}>
          <View style={[styles.stepIconBox, { backgroundColor: colors.iconBadgeBg }]}>
            <Briefcase size={22} color={colors.primaryDark} />
          </View>
          <View style={styles.stepTitleGroup}>
            <Text style={[styles.stepTag, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              STEP 3
            </Text>
            <Text style={[styles.stepTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
              Business Purpose
            </Text>
            {activeStep !== 3 && (
              <Text style={[styles.stepSub, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                {step3Complete ? 'Purpose Defined' : 'Define how you plan to use this account'}
              </Text>
            )}
          </View>
        </View>
        {activeStep < 3 ? (
          <Lock size={18} color={colors.neutral} />
        ) : (
          <ChevronRight size={20} color={colors.neutral} />
        )}
      </TouchableOpacity>

      {activeStep === 3 && (
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              Expected Transaction Behavior
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
              placeholder="e.g. PKR 40,000/month"
              placeholderTextColor={colors.neutral}
              value={behavior}
              onChangeText={setBehavior}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              Account Purpose
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
              placeholder="e.g. Savings & Local Transfers"
              placeholderTextColor={colors.neutral}
              value={intent}
              onChangeText={setIntent}
            />
          </View>
        </View>
      )}

      {/* Footer Legal Terms Notice */}
      <Text style={[styles.legalNotice, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
        By continuing, you agree to our{' '}
        <Text style={{ color: colors.warningOrange, fontFamily: colors.bodyFontBold }}>Terms</Text>{' '}
        and{' '}
        <Text style={{ color: colors.warningOrange, fontFamily: colors.bodyFontBold }}>
          Privacy Policy
        </Text>
      </Text>

      {/* Main Action Button */}
      <TouchableOpacity
        style={[styles.nourishButton, { backgroundColor: colors.primary }]}
        onPress={handleNextOrSubmit}
        disabled={isSubmitting}
        activeOpacity={0.85}>
        {isSubmitting ? (
          <ActivityIndicator color="#121212" />
        ) : (
          <>
            <Text style={[styles.nourishButtonText, { fontFamily: colors.bodyFontBold }]}>
              {activeStep === 3 ? 'Nourish & Submit Application' : 'Nourish & Continue'}
            </Text>
            <ArrowRight size={18} color="#121212" />
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.laterButton}
        onPress={() => router.replace('/')}
        activeOpacity={0.7}>
        <Text style={[styles.laterText, { color: colors.text, fontFamily: colors.bodyFontBold }]}>
          I'll do this later
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 20,
  },
  stepCounterText: {
    fontSize: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    marginBottom: 28,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  heroCircleWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headline: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  stepCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  stepIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitleGroup: {
    flex: 1,
  },
  stepTag: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 16,
  },
  stepSub: {
    fontSize: 12,
    marginTop: 2,
  },
  formContainer: {
    paddingHorizontal: 8,
    marginBottom: 16,
    gap: 12,
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  legalNotice: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  nourishButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  nourishButtonText: {
    color: '#121212',
    fontSize: 16,
  },
  laterButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  laterText: {
    fontSize: 14,
  },
});
