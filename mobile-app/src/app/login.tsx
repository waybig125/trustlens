import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Lock, Mail, UserCheck, ShieldCheck } from 'lucide-react-native';
import { HARDCODED_USERS, useApp } from '../context/AppContext';
import { api, HealthResponse } from '../api/client';
import { GlassCard } from '../components/GlassCard';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, login } = useApp();

  const [selectedRole, setSelectedRole] = useState<'applicant' | 'admin'>('applicant');
  const [email, setEmail] = useState(HARDCODED_USERS.applicant.email);
  const [password, setPassword] = useState(HARDCODED_USERS.applicant.password);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState(false);

  useEffect(() => {
    api.health()
      .then(setHealth)
      .catch(() => setHealthError(true));
  }, []);

  const handleRoleTabChange = (role: 'applicant' | 'admin') => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'applicant') {
      setEmail(HARDCODED_USERS.applicant.email);
      setPassword(HARDCODED_USERS.applicant.password);
    } else {
      setEmail(HARDCODED_USERS.admin.email);
      setPassword(HARDCODED_USERS.admin.password);
    }
  };

  const handleLoginSubmit = () => {
    const res = login(email, password);
    if (res.success) {
      if (selectedRole === 'admin') {
        router.replace('/officer-dashboard');
      } else {
        router.replace('/');
      }
    } else {
      setErrorMessage(res.error || 'Authentication failed');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.headerArea}>
        <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
          <Shield size={42} color="#121212" strokeWidth={2.2} />
        </View>
        <Text style={[styles.title, { color: colors.text, fontFamily: colors.headlineFont }]}>
          TrustLens Auth
        </Text>
        <Text style={[styles.subtitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
          Sign in to access your digital onboarding or compliance intelligence dashboard.
        </Text>
      </View>

      {/* Role Selection Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedRole === 'applicant' && { backgroundColor: colors.primary },
          ]}
          onPress={() => handleRoleTabChange('applicant')}
          activeOpacity={0.8}>
          <UserCheck size={18} color={selectedRole === 'applicant' ? '#121212' : colors.text} />
          <Text
            style={[
              styles.tabText,
              {
                color: selectedRole === 'applicant' ? '#121212' : colors.text,
                fontFamily: selectedRole === 'applicant' ? colors.bodyFontBold : colors.bodyFont,
              },
            ]}>
            Applicant
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedRole === 'admin' && { backgroundColor: colors.primary },
          ]}
          onPress={() => handleRoleTabChange('admin')}
          activeOpacity={0.8}>
          <ShieldCheck size={18} color={selectedRole === 'admin' ? '#121212' : colors.text} />
          <Text
            style={[
              styles.tabText,
              {
                color: selectedRole === 'admin' ? '#121212' : colors.text,
                fontFamily: selectedRole === 'admin' ? colors.bodyFontBold : colors.bodyFont,
              },
            ]}>
            Compliance Admin
          </Text>
        </TouchableOpacity>
      </View>

      {/* Login Card */}
      <GlassCard style={styles.card}>
        <Text style={[styles.formHeader, { color: colors.text, fontFamily: colors.headlineFont }]}>
          {selectedRole === 'admin' ? 'Admin Officer Portal' : 'Applicant Portal'}
        </Text>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
            Email Address
          </Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Mail size={18} color={colors.neutral} />
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: colors.bodyFont }]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
            Password
          </Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Lock size={18} color={colors.neutral} />
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: colors.bodyFont }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {errorMessage && (
          <Text style={[styles.errorText, { color: colors.errorRed, fontFamily: colors.bodyFontBold }]}>
            {errorMessage}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={handleLoginSubmit}
          activeOpacity={0.85}>
          <Text style={[styles.loginButtonText, { fontFamily: colors.bodyFontBold }]}>
            Sign In as {selectedRole === 'admin' ? 'Compliance Admin' : 'Applicant'}
          </Text>
        </TouchableOpacity>
      </GlassCard>

      {/* Hardcoded Credentials Hint Card */}
      <View style={[styles.hintCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.hintHeader, { color: colors.primary, fontFamily: colors.bodyFontBold }]}>
          Demo Hardcoded Credentials:
        </Text>
        <Text style={[styles.hintText, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
          • Applicant: applicant@trustlens.com / password123
        </Text>
        <Text style={[styles.hintText, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
          • Admin: admin@trustlens.com / admin123
        </Text>
      </View>

      {/* API Connection Status */}
      <View style={[styles.apiStatus, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.apiDot, { backgroundColor: health && !healthError ? colors.riskLow : colors.errorRed }]} />
        <Text style={[styles.apiText, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
          {health && !healthError
            ? `API connected · ${health.engine} engine${health.demo_mode ? ' · demo mode' : ''}`
            : healthError
            ? 'API unreachable'
            : 'Checking API…'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    justifyContent: 'center',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabText: {
    fontSize: 13,
  },
  card: {
    marginBottom: 20,
  },
  formHeader: {
    fontSize: 18,
    marginBottom: 18,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
  },
  inputBox: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 14,
  },
  loginButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#121212',
    fontSize: 15,
  },
  hintCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  hintHeader: {
    fontSize: 12,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 12,
  },
  apiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  apiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  apiText: {
    fontSize: 12,
  },
});
