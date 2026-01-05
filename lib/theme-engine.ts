import { ThemeConfig, BorderStyle, GlassEffect } from '@/src/types/database';

/**
 * Default theme configuration
 */
export const DEFAULT_THEME: Required<ThemeConfig> = {
  // Colors
  primary_color: '#6366f1',
  secondary_color: '#8b5cf6',
  primary_hover: '#4f46e5',
  primary_light: '#a5b4fc',
  background_color: '#0f172a',
  foreground_color: '#f8fafc',

  // Advanced Design
  bg_image_url: '',
  overlay_opacity: 40,
  glass_blur: 'lg',
  border_radius: 'rounded',

  // Legacy
  font_family: 'Inter',
  button_style: 'rounded',

  // Typography
  font_pairing: 'modern',
};

/**
 * Google Font pairings
 */
export const FONT_PAIRINGS = {
  modern: {
    heading: 'Inter',
    body: 'Inter',
    weights: [400, 500, 600, 700],
  },
  elegant: {
    heading: 'Playfair Display',
    body: 'Lato',
    weights: [400, 500, 600, 700],
  },
  playful: {
    heading: 'Poppins',
    body: 'Nunito',
    weights: [400, 500, 600, 700],
  },
};

/**
 * Get theme with defaults applied
 */
export function getThemeWithDefaults(themeConfig?: ThemeConfig): Required<ThemeConfig> {
  return {
    primary_color: themeConfig?.primary_color || DEFAULT_THEME.primary_color,
    secondary_color: themeConfig?.secondary_color || DEFAULT_THEME.secondary_color,
    primary_hover: themeConfig?.primary_hover || DEFAULT_THEME.primary_hover,
    primary_light: themeConfig?.primary_light || DEFAULT_THEME.primary_light,
    background_color: themeConfig?.background_color || DEFAULT_THEME.background_color,
    foreground_color: themeConfig?.foreground_color || DEFAULT_THEME.foreground_color,
    bg_image_url: themeConfig?.bg_image_url || DEFAULT_THEME.bg_image_url,
    overlay_opacity: themeConfig?.overlay_opacity ?? DEFAULT_THEME.overlay_opacity,
    glass_blur: themeConfig?.glass_blur || DEFAULT_THEME.glass_blur,
    border_radius: themeConfig?.border_radius || DEFAULT_THEME.border_radius,
    font_family: themeConfig?.font_family || DEFAULT_THEME.font_family,
    button_style: themeConfig?.button_style || DEFAULT_THEME.button_style,
    font_pairing: themeConfig?.font_pairing || DEFAULT_THEME.font_pairing,
  };
}

/**
 * Generate CSS variables from theme config
 */
export function generateCSSVariables(theme: Required<ThemeConfig>): string {
  const borderRadiusValue = getBorderRadiusValue(theme.border_radius);
  const overlayOpacity = theme.overlay_opacity / 100;

  return `
    --primary: ${theme.primary_color};
    --primary-hover: ${theme.primary_hover};
    --primary-light: ${theme.primary_light};
    --secondary: ${theme.secondary_color};
    --background: ${theme.background_color};
    --foreground: ${theme.foreground_color};
    --radius: ${borderRadiusValue};
    --bg-image: ${theme.bg_image_url ? `url(${theme.bg_image_url})` : 'none'};
    --overlay-opacity: ${overlayOpacity};
  `;
}

/**
 * Get border radius value for CSS
 */
export function getBorderRadiusValue(style: BorderStyle): string {
  switch (style) {
    case 'square':
      return '0px';
    case 'pill':
      return '9999px';
    case 'rounded':
    default:
      return '1rem';
  }
}

/**
 * Get glassmorphism classes
 */
export function getGlassClasses(theme: ThemeConfig): string {
  const blur = theme.glass_blur || 'lg';
  const radius = theme.border_radius || 'rounded';

  const blurClass = blur === 'none' ? '' : `backdrop-blur-${blur}`;
  const radiusClass = radius === 'square' ? 'rounded-none' : radius === 'pill' ? 'rounded-3xl' : 'rounded-2xl';

  return `bg-white/10 ${blurClass} border border-white/20 shadow-xl ${radiusClass}`;
}

/**
 * Get glass effect object for inline styles
 */
export function getGlassEffect(theme: ThemeConfig): GlassEffect {
  const glassBlur = theme.glass_blur || 'lg';
  return {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropBlur: glassBlur === 'none' ? '0px' : `${getBlurPixels(glassBlur)}px`,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  };
}

/**
 * Get blur pixel value
 */
function getBlurPixels(blur: string): number {
  switch (blur) {
    case 'sm':
      return 4;
    case 'md':
      return 8;
    case 'lg':
      return 16;
    case 'xl':
      return 24;
    default:
      return 0;
  }
}

/**
 * Generate background styles
 */
export function generateBackgroundStyles(theme: Required<ThemeConfig>): string {
  const styles: string[] = [];

  if (theme.bg_image_url) {
    styles.push(`
      body {
        background-image: url(${theme.bg_image_url});
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
      }
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, ${theme.overlay_opacity / 100});
        z-index: -1;
      }
    `);
  } else {
    styles.push(`
      body {
        background-color: ${theme.background_color};
      }
    `);
  }

  return styles.join('\n');
}
