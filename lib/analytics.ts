import { supabase } from './supabase';

export interface AnalyticsMetrics {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  averageResponseTime: number; // in minutes
  requestByType: {
    waiter: number;
    water: number;
    bill: number;
  };
  hourlyVolume: {
    hour: number;
    count: number;
  }[];
  dailyVolume: {
    date: string;
    count: number;
  }[];
  peakHours: {
    hour: number;
    count: number;
  }[];
}

export async function getAnalyticsMetrics(
  restaurantSlug: string,
  days: number = 7
): Promise<AnalyticsMetrics | null> {
  // Get restaurant ID first
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('slug', restaurantSlug)
    .single();

  if (!restaurant) return null;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Get all requests for the time period
  const { data: requests, error } = await supabase
    .from('service_requests')
    .select(`
      id,
      type,
      status,
      created_at,
      updated_at,
      tables!inner(
        restaurant_id
      )
    `)
    .eq('tables.restaurant_id', restaurant.id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error || !requests) return null;

  // Calculate metrics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const completedRequests = requests.filter(r => r.status === 'done').length;

  // Calculate average response time (for completed requests)
  const completedWithTimes = requests.filter(r => r.status === 'done' && r.updated_at);
  const averageResponseTime =
    completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, r) => {
          const created = new Date(r.created_at).getTime();
          const updated = new Date(r.updated_at!).getTime();
          return sum + (updated - created) / 60000; // Convert to minutes
        }, 0) / completedWithTimes.length
      : 0;

  // Requests by type
  const requestByType = {
    waiter: requests.filter(r => r.type === 'waiter').length,
    water: requests.filter(r => r.type === 'water').length,
    bill: requests.filter(r => r.type === 'bill').length,
  };

  // Hourly volume (last 24 hours)
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const hourlyVolume = Array.from({ length: 24 }, (_, i) => {
    const hourStart = new Date(twentyFourHoursAgo);
    hourStart.setHours(twentyFourHoursAgo.getHours() + i, 0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourStart.getHours() + 1);

    return {
      hour: hourStart.getHours(),
      count: requests.filter(r => {
        const createdAt = new Date(r.created_at);
        return createdAt >= hourStart && createdAt < hourEnd;
      }).length,
    };
  });

  // Daily volume
  const dailyVolume = Array.from({ length: days }, (_, i) => {
    const dateStart = new Date(startDate);
    dateStart.setDate(dateStart.getDate() + i);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStart);
    dateEnd.setHours(23, 59, 59, 999);

    return {
      date: dateStart.toISOString().split('T')[0],
      count: requests.filter(r => {
        const createdAt = new Date(r.created_at);
        return createdAt >= dateStart && createdAt <= dateEnd;
      }).length,
    };
  });

  // Find peak hours (across all days)
  const hourlyAggregated: Record<number, number> = {};
  requests.forEach(r => {
    const hour = new Date(r.created_at).getHours();
    hourlyAggregated[hour] = (hourlyAggregated[hour] || 0) + 1;
  });

  const peakHours = Object.entries(hourlyAggregated)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRequests,
    pendingRequests,
    completedRequests,
    averageResponseTime: Math.round(averageResponseTime * 10) / 10,
    requestByType,
    hourlyVolume,
    dailyVolume,
    peakHours,
  };
}

export function getHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
