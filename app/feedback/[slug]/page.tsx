import { notFound } from 'next/navigation';
import { getRestaurantBySlug } from '@/lib/restaurant';
import { getFeedbackByRestaurant, getFeedbackStats } from '@/lib/feedback';
import FeedbackClient from './client-feedback';

interface FeedbackPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  // Get feedback data
  const feedback = await getFeedbackByRestaurant(restaurant.id);
  const stats = await getFeedbackStats(restaurant.id);

  return (
    <FeedbackClient
      restaurant={restaurant}
      initialFeedback={feedback}
      initialStats={stats}
    />
  );
}
