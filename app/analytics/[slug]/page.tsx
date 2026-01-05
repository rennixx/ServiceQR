import { notFound } from 'next/navigation';
import { getRestaurantBySlug } from '@/lib/restaurant';
import { getAnalyticsMetrics } from '@/lib/analytics';
import AnalyticsClient from './client-analytics';

interface AnalyticsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  // Get analytics data
  const metrics = await getAnalyticsMetrics(slug, 7);

  return (
    <AnalyticsClient
      restaurant={restaurant}
      initialMetrics={metrics}
    />
  );
}
