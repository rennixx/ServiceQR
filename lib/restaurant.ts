import { supabase } from './supabase';
import { Restaurant, ThemeConfig } from '@/src/types/database';
import { getThemeWithDefaults as getThemeWithDefaultsNew, generateCSSVariables as generateCSSVariablesNew, generateBackgroundStyles } from './theme-engine';

/**
 * Default theme to use when no restaurant is found or theme is incomplete
 * @deprecated Use the one from theme-engine.ts instead
 */
export const DEFAULT_THEME: Required<ThemeConfig> = {
  primary_color: '#475569',
  secondary_color: '#64748b',
  primary_hover: '#334155',
  primary_light: '#94a3b8',
  background_color: '#f8fafc',
  foreground_color: '#0f172a',
  font_family: 'system-ui',
  button_style: 'rounded',
  bg_image_url: '',
  overlay_opacity: 0,
  glass_blur: 'lg',
  border_radius: 'rounded',
  font_pairing: 'modern',
};

/**
 * Fetch a restaurant by its slug
 */
export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// Re-export from theme-engine
export { getThemeWithDefaultsNew as getThemeWithDefaults };
export { generateCSSVariablesNew as generateCSSVariables };
export { generateBackgroundStyles };
