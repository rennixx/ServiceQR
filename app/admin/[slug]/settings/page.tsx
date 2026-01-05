import { getRestaurantBySlug, getThemeWithDefaults, generateCSSVariables } from '@/lib/restaurant';
import AdminSettings from './client-settings';

interface AdminSettingsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: AdminSettingsPageProps) {
  const { slug } = await params;
  return {
    title: `Admin Settings - ${slug}`,
    description: 'Customize your restaurant branding',
  };
}

export default async function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const { slug } = await params;

  // Fetch restaurant data
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Restaurant Not Found</h1>
          <p className="text-slate-600">Unable to load settings for this restaurant.</p>
        </div>
      </div>
    );
  }

  // Apply theme
  const theme = getThemeWithDefaults(restaurant.theme_config || {});
  const cssVariables = generateCSSVariables(theme);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          ${cssVariables}
        }
      `}} />
      <AdminSettings restaurant={restaurant} />
    </>
  );
}
