import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useApp } from '../context/AppContext';
import { Palette } from '../constants/Palette';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, elevated, ...props }) => {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Palette.dark : Palette.light;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? theme.surfaceElevated : theme.surface,
          borderColor: theme.surfaceBorder,
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
});
