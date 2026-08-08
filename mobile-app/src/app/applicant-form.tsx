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
import { Sprout, Flower2, CircleDot } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

export default function ApplicantFormScreen() {
  const router = useRouter();
  const { colors, submitApplicantForm } = useApp();

  const [name, setName] = useState('');
  const [idNum, setIdNum] = useState('');
  const [employment, setEmployment] = useState('');
  const [income, setIncome] = useState('');
  const [behavior, setBehavior] = useState('');
  const [intent, setIntent] = useState('');
  const [address, setAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const filledCount = [name, idNum, employment, income, behavior, intent, address].filter(
    (val) => val.trim().length > 0
  ).length;
  const progress = filledCount / 7;

  const handleSubmit = () => {
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
  };

  const renderGardenPlant = () => {
    if (progress === 0) {
      return (
        <View style={styles.plantWrapper}>
          <CircleDot size={52} color={colors.neutral} />
          <Text style={[styles.plantLabel, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
            0% Complete — Seed in soil
          </Text>
        </View>
      );
    } else if (progress < 1) {
      return (
        <View style={styles.plantWrapper}>
          <Sprout size={56} color={colors.leafGreen} />
          <Text style={[styles.plantLabel, { color: colors.leafGreen, fontFamily: colors.bodyFontBold }]}>
            {Math.round(progress * 100)}% Complete — Green sprout with leaves
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.plantWrapper}>
          <Flower2 size={60} color={colors.primary} />
          <Text style={[styles.plantLabel, { color: colors.primary, fontFamily: colors.headlineFont }]}>
            100% Complete — Blooming Golden Flower (#FFD700)
          </Text>
        </View>
      );
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text, fontFamily: colors.headlineFont }]}>Trust Garden</Text>

      {/* Interactive Plant Header Graphic */}
      <View style={[styles.gardenCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {renderGardenPlant()}
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>Full Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
          placeholder="e.g. Amina Bibi"
          placeholderTextColor={colors.neutral}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>CNIC / ID Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
          placeholder="e.g. 35202-1234567-1"
          placeholderTextColor={colors.neutral}
          value={idNum}
          onChangeText={setIdNum}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>Employment Type</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
          placeholder="e.g. Teacher / Freelancer / Shopkeeper"
          placeholderTextColor={colors.neutral}
          value={employment}
          onChangeText={setEmployment}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>Declared Monthly Income</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
          placeholder="e.g. PKR 60,000/month"
          placeholderTextColor={colors.neutral}
          value={income}
          onChangeText={setIncome}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>Expected Transaction Behavior</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
          placeholder="e.g. PKR 40,000/month"
          placeholderTextColor={colors.neutral}
          value={behavior}
          onChangeText={setBehavior}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>Account Purpose</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
          placeholder="e.g. Savings & Local Transfers"
          placeholderTextColor={colors.neutral}
          value={intent}
          onChangeText={setIntent}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>Address & City Verification</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
          placeholder="e.g. House #12, Block B, Lahore"
          placeholderTextColor={colors.neutral}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.85}>
        {isSubmitting ? (
          <ActivityIndicator color="#121212" />
        ) : (
          <Text style={[styles.submitButtonText, { fontFamily: colors.bodyFontBold }]}>
            Nourish & Submit Application
          </Text>
        )}
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
  title: {
    fontSize: 26,
    marginBottom: 20,
  },
  gardenCard: {
    height: 130,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 16,
  },
  plantWrapper: {
    alignItems: 'center',
    gap: 10,
  },
  plantLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#121212',
    fontSize: 16,
  },
});
