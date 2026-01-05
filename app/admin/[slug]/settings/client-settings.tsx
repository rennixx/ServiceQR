'use client';

import { useState, useMemo } from 'react';
import { Palette, Image, Sliders, Type, Monitor, Sparkles, RotateCcw, UtensilsCrossed, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { updateRestaurantTheme } from '@/app/actions';
import { Restaurant, ThemeConfig, BorderStyle, FontPairing } from '@/src/types/database';
import { getThemeWithDefaults, generateCSSVariables, FONT_PAIRINGS } from '@/lib/theme-engine';
import { GlassCard, GlassButton } from '@/components/ui/GlassCard';

interface AdminSettingsProps {
  restaurant: Restaurant;
}

export default function AdminSettings({ restaurant }: AdminSettingsProps) {
  const currentTheme = getThemeWithDefaults(restaurant.theme_config || {});
  const [theme, setTheme] = useState<ThemeConfig>(currentTheme);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<'saved' | 'error' | null>(null);
  const [activeTab, setActiveTab] = useState<'colors' | 'design' | 'typography'>('colors');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    const result = await updateRestaurantTheme(restaurant.id, theme);

    if (result.success) {
      setSaveMessage('saved');
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveMessage('error');
      setTimeout(() => setSaveMessage(null), 3000);
    }

    setIsSaving(false);
  };

  const handleReset = () => {
    setTheme(currentTheme);
  };

  const presets = [
    {
      name: 'Indigo Dreams',
      primary_color: '#6366f1',
      secondary_color: '#8b5cf6',
      bg_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920',
      font_pairing: 'modern' as FontPairing,
    },
    {
      name: 'Sunset Vibes',
      primary_color: '#f97316',
      secondary_color: '#ec4899',
      bg_image_url: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=1920',
      font_pairing: 'playful' as FontPairing,
    },
    {
      name: 'Ocean Breeze',
      primary_color: '#0ea5e9',
      secondary_color: '#06b6d4',
      bg_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920',
      font_pairing: 'elegant' as FontPairing,
    },
    {
      name: 'Forest Calm',
      primary_color: '#22c55e',
      secondary_color: '#14b8a6',
      bg_image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920',
      font_pairing: 'modern' as FontPairing,
    },
    {
      name: 'Royal Purple',
      primary_color: '#a855f7',
      secondary_color: '#6366f1',
      bg_image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920',
      font_pairing: 'elegant' as FontPairing,
    },
  ];

  const tabs = [
    { id: 'colors' as const, icon: Palette, label: 'Colors' },
    { id: 'design' as const, icon: Sliders, label: 'Design' },
    { id: 'typography' as const, icon: Type, label: 'Typography' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_var(--primary)]">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Brand Settings</h1>
                <p className="text-slate-400 mt-1">{restaurant.name}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/dashboard/${restaurant.slug}`}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href={`/admin/${restaurant.slug}/tables`}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <UtensilsCrossed className="w-4 h-4" />
                Tables
              </Link>
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white font-semibold rounded-xl shadow-[0_0_20px_var(--primary)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Tabs */}
            <GlassCard className="p-2">
              <div className="flex gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary text-white shadow-[0_0_15px_var(--primary)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            {/* Tab Content */}
            <GlassCard className="p-6">
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  {/* Presets */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Quick Presets
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {presets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => setTheme(preset)}
                          className="h-16 rounded-xl shadow-lg transition-transform hover:scale-105"
                          style={{
                            backgroundColor: preset.primary_color,
                            backgroundImage: preset.bg_image_url ? `url(${preset.bg_image_url})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Color Pickers */}
                  <div className="space-y-4">
                    <ColorPicker
                      label="Primary Color"
                      value={theme.primary_color}
                      onChange={(value) => setTheme({ ...theme, primary_color: value })}
                    />
                    <ColorPicker
                      label="Secondary Color"
                      value={theme.secondary_color}
                      onChange={(value) => setTheme({ ...theme, secondary_color: value })}
                    />
                    <ColorPicker
                      label="Primary Hover"
                      value={theme.primary_hover}
                      onChange={(value) => setTheme({ ...theme, primary_hover: value })}
                    />
                    <ColorPicker
                      label="Primary Light"
                      value={theme.primary_light}
                      onChange={(value) => setTheme({ ...theme, primary_light: value })}
                    />
                    <ColorPicker
                      label="Background Color"
                      value={theme.background_color}
                      onChange={(value) => setTheme({ ...theme, background_color: value })}
                    />
                    <ColorPicker
                      label="Foreground Color"
                      value={theme.foreground_color}
                      onChange={(value) => setTheme({ ...theme, foreground_color: value })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'design' && (
                <div className="space-y-6">
                  {/* Background Image */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Background Image URL
                      </div>
                    </label>
                    <input
                      type="text"
                      value={theme.bg_image_url || ''}
                      onChange={(e) => setTheme({ ...theme, bg_image_url: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Leave empty for solid background color
                    </p>
                  </div>

                  {/* Overlay Opacity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <div className="flex items-center justify-between">
                        <span>Overlay Opacity</span>
                        <span className="text-primary">{theme.overlay_opacity || 40}%</span>
                      </div>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={theme.overlay_opacity || 40}
                      onChange={(e) => setTheme({ ...theme, overlay_opacity: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Transparent</span>
                      <span>Dark</span>
                    </div>
                  </div>

                  {/* Glass Blur */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Glass Blur Effect
                    </label>
                    <select
                      value={theme.glass_blur || 'lg'}
                      onChange={(e) => setTheme({ ...theme, glass_blur: e.target.value as any })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="none">None</option>
                      <option value="sm">Subtle</option>
                      <option value="md">Medium</option>
                      <option value="lg">Strong</option>
                      <option value="xl">Extra Strong</option>
                    </select>
                  </div>

                  {/* Border Radius */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Corner Style
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'square' as BorderStyle, label: 'Square', class: 'rounded-none' },
                        { value: 'rounded' as BorderStyle, label: 'Rounded', class: 'rounded-xl' },
                        { value: 'pill' as BorderStyle, label: 'Pill', class: 'rounded-full' },
                      ].map((style) => (
                        <button
                          key={style.value}
                          onClick={() => setTheme({ ...theme, border_radius: style.value })}
                          className={`px-4 py-3 bg-slate-800/50 border-2 rounded-xl transition-all ${
                            theme.border_radius === style.value
                              ? 'border-primary text-white shadow-[0_0_15px_var(--primary)]'
                              : 'border-slate-700 text-slate-400 hover:border-slate-600'
                          } ${style.class}`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'typography' && (
                <div className="space-y-6">
                  {/* Font Pairing */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Font Pairing
                      </div>
                    </label>
                    <div className="space-y-3">
                      {Object.entries(FONT_PAIRINGS).map(([key, fonts]) => (
                        <button
                          key={key}
                          onClick={() => setTheme({ ...theme, font_pairing: key as FontPairing })}
                          className={`w-full p-4 bg-slate-800/50 border-2 rounded-xl transition-all text-left ${
                            theme.font_pairing === key
                              ? 'border-primary text-white shadow-[0_0_15px_var(--primary)]'
                              : 'border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <div className="font-bold text-lg mb-1" style={{ fontFamily: fonts.heading }}>
                            {fonts.heading}
                          </div>
                          <div className="text-sm" style={{ fontFamily: fonts.body }}>
                            Body: {fonts.body}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Save Message */}
            {saveMessage === 'saved' && (
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm font-medium flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                Changes saved successfully!
              </div>
            )}
            {saveMessage === 'error' && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm font-medium flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  ✕
                </div>
                Failed to save changes. Please try again.
              </div>
            )}
          </div>

          {/* Live Preview Panel */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <GlassCard className="overflow-hidden">
              <div className="bg-slate-800/50 px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-slate-300">Live Preview</h3>
              </div>

              {/* Mobile Phone Mockup */}
              <div className="p-8 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <MobilePreview theme={theme} restaurantName={restaurant.name} />
              </div>

              <div className="px-4 py-3 bg-slate-800/50 border-t border-white/10">
                <p className="text-xs text-slate-400 text-center">
                  Preview updates in real-time as you adjust settings
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ColorPickerProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div className="flex gap-3">
        <input
          type="color"
          value={value || '#6366f1'}
          onChange={(e) => onChange(e.target.value)}
          className="w-14 h-12 rounded-lg cursor-pointer border-2 border-slate-700 bg-slate-800"
        />
        <input
          type="text"
          value={value || '#6366f1'}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

interface MobilePreviewProps {
  theme: ThemeConfig;
  restaurantName: string;
}

function MobilePreview({ theme, restaurantName }: MobilePreviewProps) {
  const previewTheme = getThemeWithDefaults(theme);
  const radiusClass = theme.border_radius === 'pill' ? 'rounded-full' : theme.border_radius === 'square' ? 'rounded-none' : 'rounded-2xl';

  return (
    <div
      className="relative w-72 h-[580px] overflow-hidden bg-slate-900 rounded-3xl shadow-2xl border-4 border-slate-700"
    >
      {/* Phone Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20" />

      {/* Screen Content */}
      <div className="h-full relative">
        {/* Background */}
        {previewTheme.bg_image_url ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${previewTheme.bg_image_url})` }}
            />
            <div
              className="absolute inset-0"
              style={{ backgroundColor: `rgba(0,0,0,${(previewTheme.overlay_opacity || 40) / 100})` }}
            />
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: previewTheme.background_color }} />
        )}

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col p-4">
          {/* Header */}
          <div
            className={`${radiusClass} bg-white/10 backdrop-blur-lg border border-white/20 p-4 mb-4`}
          >
            <h3 className="text-lg font-bold text-white">{restaurantName}</h3>
            <p className="text-sm text-white/70">Table 5</p>
          </div>

          {/* Welcome */}
          <div
            className={`${radiusClass} bg-white/10 backdrop-blur-lg border border-white/20 p-4 mb-4 text-center`}
          >
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
              style={{ backgroundColor: previewTheme.primary_color }}
            >
              <span className="text-2xl">✨</span>
            </div>
            <h4 className="text-white font-bold">Welcome!</h4>
            <p className="text-xs text-white/70 mt-1">Tap a service below</p>
          </div>

          {/* Service Cards */}
          <div className="space-y-3 flex-1">
            {[
              { icon: '👨‍🍳', label: 'Waiter' },
              { icon: '💧', label: 'Water' },
              { icon: '💳', label: 'Bill' },
            ].map((service) => (
              <button
                key={service.label}
                className={`${radiusClass} w-full p-4 bg-white/10 backdrop-blur-lg border border-white/20 transition-all hover:scale-[1.02] active:scale-95`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: previewTheme.primary_color }}
                  >
                    <span className="text-lg">{service.icon}</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{service.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
