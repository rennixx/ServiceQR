import { supabase } from './supabase';
import { ServiceRequest } from '@/src/types/database';

/**
 * Extended service request with table and restaurant info
 */
export interface ServiceRequestWithDetails extends ServiceRequest {
  table_number: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_slug: string;
}

/**
 * Fetch all pending requests for a specific restaurant
 */
export async function getPendingRequestsForRestaurant(
  restaurantSlug: string
): Promise<ServiceRequestWithDetails[]> {
  const { data, error } = await supabase
    .from('service_requests_dashboard')
    .select('*')
    .eq('restaurant_slug', restaurantSlug)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching pending requests:', error);
    return [];
  }

  return data as ServiceRequestWithDetails[];
}

/**
 * Get request type display info
 */
export function getRequestTypeInfo(type: string) {
  switch (type) {
    case 'waiter':
      return {
        icon: '👨‍🍳',
        label: 'Waiter',
        color: 'bg-blue-500',
      };
    case 'water':
      return {
        icon: '💧',
        label: 'Water',
        color: 'bg-cyan-500',
      };
    case 'bill':
      return {
        icon: '💳',
        label: 'Bill',
        color: 'bg-green-500',
      };
    default:
      return {
        icon: '📋',
        label: 'Request',
        color: 'bg-gray-500',
      };
  }
}

/**
 * Format time relative to now
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}
