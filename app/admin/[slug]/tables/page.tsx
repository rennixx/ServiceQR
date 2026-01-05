import { notFound } from 'next/navigation';
import { getRestaurantBySlug } from '@/lib/restaurant';
import { getTablesByRestaurantId } from '@/lib/table';
import TablesClient from './client-tables';

interface TablesPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TablesPage({ params }: TablesPageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  // Get tables for this restaurant
  const tables = await getTablesByRestaurantId(restaurant.id);

  return (
    <TablesClient
      restaurant={restaurant}
      initialTables={tables || []}
    />
  );
}
