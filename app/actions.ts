'use server';

import { supabase } from '@/lib/supabase';
import { ServiceRequestType, ServiceRequestStatus, ThemeConfig } from '@/src/types/database';
import { revalidatePath } from 'next/cache';

export interface CreateServiceRequestResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Server action to create a service request
 */
export async function createServiceRequest(
  tableId: string,
  type: ServiceRequestType
): Promise<CreateServiceRequestResult> {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .insert([
        {
          table_id: tableId,
          type: type,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating service request:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate the current path to refresh any server components
    revalidatePath('/table/[slug]/[tableId]', 'page');

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Server action to update service request status
 */
export async function updateServiceRequestStatus(
  requestId: string,
  status: ServiceRequestStatus
): Promise<CreateServiceRequestResult> {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .update({ status: status })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating service request:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate the dashboard path
    revalidatePath('/dashboard/[slug]', 'page');

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Server action to update restaurant theme
 */
export async function updateRestaurantTheme(
  restaurantId: string,
  themeConfig: ThemeConfig
): Promise<CreateServiceRequestResult> {
  try {
    console.log('Updating theme for restaurant:', restaurantId);
    console.log('Theme config:', themeConfig);

    const { data, error } = await supabase
      .from('restaurants')
      .update({ theme_config: themeConfig })
      .eq('id', restaurantId)
      .select();

    console.log('Update result - error:', error);
    console.log('Update result - data:', data);

    if (error) {
      console.error('Error updating restaurant theme:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data || data.length === 0) {
      console.error('No rows returned from update');
      return {
        success: false,
        error: 'No restaurant found with that ID. Please check your database.',
      };
    }

    console.log('Theme updated successfully:', data[0]);

    // Revalidate all paths for this restaurant
    revalidatePath('/[restaurant]', 'page');
    revalidatePath('/table/[slug]/[tableId]', 'page');
    revalidatePath('/dashboard/[slug]', 'page');
    revalidatePath('/admin/[slug]/settings', 'page');

    return {
      success: true,
      data: data[0],
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: `An unexpected error occurred: ${error}`,
    };
  }
}

/**
 * Server action to submit customer feedback
 */
export async function submitFeedback(
  tableId: string,
  serviceRequestId: string | null,
  rating: number,
  comment?: string
): Promise<CreateServiceRequestResult> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          table_id: tableId,
          service_request_id: serviceRequestId,
          rating: rating,
          comment: comment || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error submitting feedback:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
