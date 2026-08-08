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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
});
