import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Shield, Sun, Moon, LogOut, ShieldCheck, UserCheck, ArrowLeft } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const router = useRouter();
  const segments = useSegments();
  const { isDarkMode, toggleTheme, user, logout, isOfficerMode, toggleRole } = useApp();

  const isLoginScreen = (segments[0] as string) === 'login';
  const showBackButton = segments.length > 0 && !isLoginScreen;

  if (isLoginScreen) return null;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDarkMode ? '#12110E' : '#F7F5F0',
          borderBottomColor: isDarkMode ? 'rgba(255, 215, 0, 0.15)' : '#E5E1D8',
        },
      ]}
      accessibilityRole="header"
    >
      <View style={styles.leftGroup}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={20} color={isDarkMode ? '#FFD700' : '#121212'} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logoRow}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
          accessibilityLabel="TrustLens Home"
          accessibilityRole="button"
        >
          <View style={styles.logoIcon}>
            <Shield size={22} color="#FFD700" strokeWidth={2.5} />
          </View>
          <Text style={[styles.brandText, { color: isDarkMode ? '#F7F5F0' : '#121212' }]}>
            Trust<Text style={{ color: '#FFD700' }}>Lens</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {user && (
        <View style={styles.rightGroup}>
          <TouchableOpacity
            style={[
              styles.roleBadge,
              {
                backgroundColor: isOfficerMode ? 'rgba(255, 215, 0, 0.15)' : 'rgba(78, 158, 106, 0.15)',
                borderColor: isOfficerMode ? '#FFD700' : '#4E9E6A',
              },
            ]}
            onPress={toggleRole}
            activeOpacity={0.75}
            accessibilityLabel={`Switch mode. Current mode: ${isOfficerMode ? 'Officer' : 'Applicant'}`}
            accessibilityRole="button"
          >
            {isOfficerMode ? (
              <ShieldCheck size={14} color="#FFD700" />
            ) : (
              <UserCheck size={14} color="#4E9E6A" />
            )}
            <Text
              style={[
                styles.roleText,
                { color: isOfficerMode ? '#FFD700' : (isDarkMode ? '#81C784' : '#1B6B35') },
              ]}
              numberOfLines={1}
            >
              {isOfficerMode ? 'Officer' : 'Applicant'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessibilityLabel={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isDarkMode ? (
              <Sun size={20} color="#FFD700" />
            ) : (
              <Moon size={20} color="#121212" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={logout}
            activeOpacity={0.7}
            accessibilityLabel="Log out"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <LogOut size={18} color={isDarkMode ? '#8A8478' : '#767676'} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1A17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 18,
    fontFamily: 'Sora_700Bold',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  roleText: {
    fontSize: 11,
    fontFamily: 'HankenGrotesk_700Bold',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
