import { supabase } from './supabase';
import { Feedback, FeedbackWithDetails } from '@/src/types/database';

/**
 * Create a new feedback entry
 */
export async function createFeedback(
  tableId: string,
  serviceRequestId: string | null,
  rating: number,
  comment?: string
) {
  const { data, error } = await supabase
    .from('feedback')
    .insert([
      {
        table_id: tableId,
        service_request_id: serviceRequestId,
        rating,
        comment: comment || null,
      },
    ])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Get feedback for a restaurant
 */
export async function getFeedbackByRestaurant(restaurantId: string, limit = 50) {
  const { data, error } = await supabase
    .from('feedback_dashboard')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as FeedbackWithDetails[];
}

/**
 * Get feedback statistics for a restaurant
 */
export async function getFeedbackStats(restaurantId: string) {
  const { data, error } = await supabase
    .from('feedback_dashboard')
    .select('rating')
    .eq('restaurant_id', restaurantId);

  if (error || !data) {
    return {
      total: 0,
      average: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const ratings = data.map((f: any) => f.rating);
  const total = ratings.length;
  const average = total > 0
    ? ratings.reduce((sum: number, r: number) => sum + r, 0) / total
    : 0;

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach((r: number) => {
    distribution[r as keyof typeof distribution]++;
  });

  return {
    total,
    average: Math.round(average * 10) / 10,
    distribution,
  };
}
