import { getRestaurantBySlug, getThemeWithDefaults, generateCSSVariables } from '@/lib/restaurant';
import { getPendingRequestsForRestaurant } from '@/lib/service-request';
import StaffDashboard from './client-dashboard';

interface DashboardPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: DashboardPageProps) {
  const { slug } = await params;
  return {
    title: `Staff Dashboard - ${slug}`,
    description: 'Real-time service request dashboard',
  };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params;

  // Fetch restaurant data
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Restaurant Not Found</h1>
          <p className="text-slate-600">Unable to load dashboard for this restaurant.</p>
        </div>
      </div>
    );
  }

  // Fetch initial pending requests
  const initialRequests = await getPendingRequestsForRestaurant(slug);

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
      <StaffDashboard
        restaurant={restaurant}
        initialRequests={initialRequests}
      />
    </>
  );
}
