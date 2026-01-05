/**
 * Database Types for ServiceQR
 * Generated from Supabase schema
 */

// =====================================================
// THEME CONFIGURATION
// =====================================================

export type ButtonStyle = 'rounded' | 'square' | 'pill';
export type BorderStyle = 'square' | 'rounded' | 'pill';
export type FontPairing = 'modern' | 'elegant' | 'playful';

export interface ThemeConfig {
  // Colors
  primary_color?: string;
  secondary_color?: string;
  primary_hover?: string;
  primary_light?: string;
  background_color?: string;
  foreground_color?: string;

  // Advanced Design
  bg_image_url?: string;
  overlay_opacity?: number; // 0-90
  glass_blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border_radius?: BorderStyle;

  // Legacy
  font_family?: string;
  button_style?: ButtonStyle;

  // Typography
  font_pairing?: FontPairing;
}

export interface GlassEffect {
  background: string;
  backdropBlur: string;
  border: string;
  shadow: string;
}

// =====================================================
// RESTAURANT TYPES
// =====================================================

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  theme_config: ThemeConfig;
  created_at: string;
  updated_at: string;
}

export interface RestaurantWithDefaults extends Omit<Restaurant, 'theme_config'> {
  theme_config: ThemeConfig & Required<ThemeConfig>;
}

// =====================================================
// TABLE TYPES
// =====================================================

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  qr_code_id: string;
  created_at: string;
}

// =====================================================
// SERVICE REQUEST TYPES
// =====================================================

export type ServiceRequestType = 'waiter' | 'water' | 'bill';
export type ServiceRequestStatus = 'pending' | 'done';

export interface ServiceRequest {
  id: string;
  table_id: string;
  type: ServiceRequestType;
  status: ServiceRequestStatus;
  created_at: string;
  updated_at: string;
}

// =====================================================
// FEEDBACK TYPES
// =====================================================

export interface Feedback {
  id: string;
  table_id: string;
  service_request_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface FeedbackWithDetails extends Feedback {
  table_number: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_slug: string;
  service_type: ServiceRequestType | null;
}

// =====================================================
// HELPER TYPES
// =====================================================

export interface RestaurantSearchParams {
  slug: string;
}
