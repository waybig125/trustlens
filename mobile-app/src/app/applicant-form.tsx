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
import { Sprout, Flower2, TreeDeciduous } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

export default function ApplicantFormScreen() {
  const router = useRouter();
  const { colors, submitApplicantForm } = useApp();

  const [name, setName] = useState('');
  const [idNum, setIdNum] = useState('');
  const [income, setIncome] = useState('');
  const [intent, setIntent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filledCount = [name, idNum, income, intent].filter((val) => val.trim().length > 0).length;
  const progress = filledCount / 4;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      submitApplicantForm({
        Name: name || 'Amina Bibi',
        ID: idNum || '35202-1234567-1',
        Income: income || 'PKR 60,000/month',
        Intent: intent || 'Savings & Transfers',
      });
      setIsSubmitting(false);
      router.replace('/applicant-status');
    }, 1500);
  };

  const renderGardenIcon = () => {
    if (progress === 0) {
      return <Sprout size={48} color={colors.secondaryText} />;
    } else if (progress < 1) {
      return <Flower2 size={48} color={colors.primary} />;
    } else {
      return <TreeDeciduous size={48} color={colors.leafGreen} />;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Trust Garden</Text>

      <View style={[styles.gardenCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {renderGardenIcon()}
        <Text style={[styles.gardenText, { color: colors.text }]}>
          Seed Status: {Math.round(progress * 100)}%
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.secondaryText }]}>Full Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. Amina Bibi"
          placeholderTextColor={colors.secondaryText}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.secondaryText }]}>CNIC / ID Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. 35202-1234567-1"
          placeholderTextColor={colors.secondaryText}
          value={idNum}
          onChangeText={setIdNum}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.secondaryText }]}>Declared Monthly Income</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. PKR 60,000/month"
          placeholderTextColor={colors.secondaryText}
          value={income}
          onChangeText={setIncome}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.secondaryText }]}>Account Purpose</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. Savings & Local Transfers"
          placeholderTextColor={colors.secondaryText}
          value={intent}
          onChangeText={setIntent}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}>
        {isSubmitting ? (
          <ActivityIndicator color="#121212" />
        ) : (
          <Text style={styles.submitButtonText}>Nourish & Submit Application</Text>
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
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
  },
  gardenCard: {
    height: 120,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 8,
  },
  gardenText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
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
  },
  submitButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
  },
});
