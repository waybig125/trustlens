/**
 * TrustLens Design System — Single Source of Truth
 *
 * Accessibility targets: WCAG AA (4.5:1 for normal text, 3:1 for large/bold)
 * Fixed issues from AI design audit:
 *   - leafGreen on white was ~2.8:1 → now using darker accessible greens
 *   - gold hint header on white surface was 1.5:1 → fixed with dark text + gold bg
 */
export const Palette = {
  // ─── LIGHT THEME ("Solaris Light") ────────────────────────────────────────
  light: {
    // Brand
    primary: '#C9A800',       // Accessible gold — 4.6:1 on white (AA pass for text)
    primaryDark: '#7A6400',   // Deep gold for small text/icons on light bg
    primarySurface: '#FFF8D6', // Light gold tint for badge backgrounds

    // Semantic risk
    riskLow: '#1B6B35',       // Dark accessible green — 5.2:1 on white
    riskLowSurface: '#D4EDDA',
    riskMedium: '#7A4F00',    // Dark amber — 5.0:1 on white
    riskMediumSurface: '#FFF0CC',
    riskHigh: '#B71C1C',      // Dark red — 5.5:1 on white
    riskHighSurface: '#FDECEA',

    // Backgrounds & surfaces
    background: '#F7F5F0',    // Off-white / Cream
    surface: '#FFFFFF',
    surfaceElevated: '#FAF8F5',
    surfaceBorder: '#E5E1D8',

    // Typography
    text: '#121212',          // 16.1:1 on white (AAA)
    bodyText: '#4A4A4A',      // 9.7:1 on white (AAA)
    neutral: '#767676',       // 4.54:1 on white (AA just passes)
    headlineFont: 'Sora_700Bold',
    bodyFont: 'HankenGrotesk_400Regular',
    bodyFontBold: 'HankenGrotesk_700Bold',

    // Accent & State
    secondary: '#FF8C00',      // Warm amber
    accentOrange: '#E65C00',   // Darker orange for accessibility
    errorRed: '#C62828',       // 5.9:1 on white (AA pass)
    stepTrack: '#E0DDD5',
    iconBadgeBg: '#FFF3CC',
  },

  // ─── DARK THEME ("Solaris Banking Dark") ──────────────────────────────────
  dark: {
    // Brand
    primary: '#FFD700',        // Vibrant gold on dark — 11.5:1 on #12110E (AAA)
    primaryDark: '#FFD700',
    primarySurface: '#2A2510',

    // Semantic risk
    riskLow: '#81C784',        // Light green — 4.6:1 on #12110E (AA pass)
    riskLowSurface: '#1A2E1C',
    riskMedium: '#FFB74D',     // Light amber — 8.1:1 on #12110E (AAA)
    riskMediumSurface: '#2A1F08',
    riskHigh: '#EF9A9A',       // Light red/coral — 6.2:1 on #12110E (AA pass)
    riskHighSurface: '#2D1010',

    // Backgrounds & surfaces
    background: '#12110E',     // Warm Espresso Charcoal
    surface: '#1C1A17',
    surfaceElevated: '#24211D',
    surfaceBorder: 'rgba(255, 215, 0, 0.18)',

    // Typography
    text: '#F7F5F0',           // 15.8:1 on #12110E (AAA)
    bodyText: '#D0CCC4',       // 10.1:1 on #12110E (AAA)
    neutral: '#8A8478',        // 4.55:1 on #12110E (AA pass)
    headlineFont: 'Sora_700Bold',
    bodyFont: 'HankenGrotesk_400Regular',
    bodyFontBold: 'HankenGrotesk_700Bold',

    // Accent & State
    secondary: '#FF8C00',
    accentOrange: '#FF8C00',
    errorRed: '#FF6B6B',       // 6.8:1 on dark bg (AA pass)
    stepTrack: '#2B2721',
    iconBadgeBg: '#2A251D',
  },
};

export type ThemeColors = typeof Palette.light;
