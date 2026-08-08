import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Shield, Moon, Sun } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { isDarkMode, toggleTheme, isOfficerMode, toggleRole, colors } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.brandRow}>
        <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
          <Shield size={18} color="#121212" strokeWidth={2.5} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>TrustLens</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.roleBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={toggleRole}
          activeOpacity={0.7}>
          <View style={[styles.roleDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.roleText, { color: colors.primary }]}>
            {isOfficerMode ? 'OFFICER MODE' : 'APPLICANT MODE'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={toggleTheme}
          activeOpacity={0.7}>
          {isDarkMode ? (
            <Moon size={18} color={colors.primary} />
          ) : (
            <Sun size={18} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  themeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
