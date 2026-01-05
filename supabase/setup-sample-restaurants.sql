-- =====================================================
-- ServiceQR - Sample Restaurants Setup
-- Run this in your Supabase SQL Editor to add sample restaurants
-- =====================================================

-- Insert Mario's Bistro (Italian restaurant with warm orange theme)
INSERT INTO restaurants (name, slug, logo_url, theme_config)
VALUES (
  'Mario''s Bistro',
  'mario-bistro',
  'https://example.com/mario-logo.png',
  '{
    "primary_color": "#f97316",
    "secondary_color": "#ea580c",
    "primary_hover": "#c2410c",
    "primary_light": "#fdba74",
    "background_color": "#fff7ed",
    "foreground_color": "#1c1917",
    "font_family": "Georgia, serif",
    "button_style": "rounded"
  }'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Insert Sakura Sushi (Japanese restaurant with pink theme)
INSERT INTO restaurants (name, slug, logo_url, theme_config)
VALUES (
  'Sakura Sushi',
  'sakura-sushi',
  'https://example.com/sakura-logo.png',
  '{
    "primary_color": "#ec4899",
    "secondary_color": "#db2777",
    "primary_hover": "#be185d",
    "primary_light": "#f9a8d4",
    "background_color": "#fdf2f8",
    "foreground_color": "#1c1917",
    "font_family": "system-ui",
    "button_style": "pill"
  }'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Insert The Grill (Steakhouse with amber/brown theme)
INSERT INTO restaurants (name, slug, logo_url, theme_config)
VALUES (
  'The Grill',
  'the-grill',
  'https://example.com/grill-logo.png',
  '{
    "primary_color": "#d97706",
    "secondary_color": "#b45309",
    "primary_hover": "#92400e",
    "primary_light": "#fcd34d",
    "background_color": "#fffbeb",
    "foreground_color": "#1c1917",
    "font_family": "ui-sans-serif, system-ui",
    "button_style": "square"
  }'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Insert Ocean Breeze (Seafood restaurant with blue theme)
INSERT INTO restaurants (name, slug, logo_url, theme_config)
VALUES (
  'Ocean Breeze',
  'ocean-breeze',
  'https://example.com/ocean-logo.png',
  '{
    "primary_color": "#0ea5e9",
    "secondary_color": "#0284c7",
    "primary_hover": "#0369a1",
    "primary_light": "#7dd3fc",
    "background_color": "#f0f9ff",
    "foreground_color": "#0c4a6e",
    "font_family": "ui-sans-serif, system-ui",
    "button_style": "rounded"
  }'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Verify the insert
SELECT name, slug, theme_config FROM restaurants;
