import { supabase } from './supabase';
import { Restaurant, Table } from '@/src/types/database';

/**
 * Get table by QR code ID with restaurant data
 */
export async function getTableByQRCode(qrCodeId: string): Promise<{
  table: Table | null;
  restaurant: Restaurant | null;
} | null> {
  const { data, error } = await supabase
    .from('tables')
    .select(`
      *,
      restaurant:restaurants(*)
    `)
    .eq('qr_code_id', qrCodeId)
    .single();

  if (error || !data) {
    return { table: null, restaurant: null };
  }

  return {
    table: data,
    restaurant: data.restaurant as Restaurant,
  };
}

/**
 * Get table by restaurant slug and table ID (qr_code_id)
 */
export async function getTableBySlugAndId(
  slug: string,
  tableId: string
): Promise<{
  table: Table | null;
  restaurant: Restaurant | null;
} | null> {
  const { data, error } = await supabase
    .from('tables')
    .select(`
      *,
      restaurant:restaurants(*)
    `)
    .eq('qr_code_id', tableId)
    .eq('restaurant.slug', slug)
    .single();

  if (error || !data) {
    return { table: null, restaurant: null };
  }

  return {
    table: data,
    restaurant: data.restaurant as Restaurant,
  };
}

/**
 * Get table by restaurant slug and table number (for simplified URLs)
 */
export async function getTableBySlugAndNumber(
  slug: string,
  tableNumber: string
): Promise<{
  table: Table | null;
  restaurant: Restaurant | null;
} | null> {
  // First get the restaurant by slug
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (restaurantError || !restaurant) {
    return { table: null, restaurant: null };
  }

  // Decode URL-encoded table number (e.g., "Table%2067" -> "Table 67")
  const decodedTableNumber = decodeURIComponent(tableNumber);

  // Then get the table by restaurant_id and table_number
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('table_number', decodedTableNumber)
    .eq('restaurant_id', restaurant.id)
    .maybeSingle();

  if (error || !data) {
    return { table: null, restaurant: null };
  }

  return {
    table: data,
    restaurant: restaurant,
  };
}

/**
 * Get all tables for a restaurant
 */
export async function getTablesByRestaurantId(restaurantId: string): Promise<Table[]> {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('table_number', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}

/**
 * Create a new table
 */
export async function createTable(restaurantId: string, tableNumber: string, qrCodeId: string) {
  const { data, error } = await supabase
    .from('tables')
    .insert([
      {
        restaurant_id: restaurantId,
        table_number: tableNumber,
        qr_code_id: qrCodeId,
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
 * Update a table
 */
export async function updateTable(tableId: string, tableNumber: string, qrCodeId: string) {
  const { data, error } = await supabase
    .from('tables')
    .update({
      table_number: tableNumber,
      qr_code_id: qrCodeId,
    })
    .eq('id', tableId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Delete a table
 */
export async function deleteTable(tableId: string) {
  const { error } = await supabase
    .from('tables')
    .delete()
    .eq('id', tableId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
