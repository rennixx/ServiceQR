import { getTableBySlugAndNumber } from '@/lib/table';
import { getThemeWithDefaults, generateCSSVariables, generateBackgroundStyles } from '@/lib/restaurant';
import GuestTablePage from '@/app/table/[slug]/[tableId]/client-page';

interface TablePageProps {
  params: Promise<{
    slug: string;
    tableNumber: string;
  }>;
}

export async function generateMetadata({ params }: TablePageProps) {
  const { slug } = await params;
  return {
    title: `Table Service - ${slug}`,
    description: 'Request service at your table',
  };
}

export default async function TablePage({ params }: TablePageProps) {
  const { slug, tableNumber } = await params;

  // Fetch table and restaurant data using table number
  const result = await getTableBySlugAndNumber(slug, tableNumber);

  if (!result?.table || !result?.restaurant) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Table Not Found</h1>
          <p className="text-slate-600">Please scan the QR code again or ask a staff member for assistance.</p>
        </div>
      </div>
    );
  }

  const { table, restaurant } = result;
  const theme = getThemeWithDefaults(restaurant.theme_config || {});
  const cssVariables = generateCSSVariables(theme);
  const backgroundStyles = generateBackgroundStyles(theme);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          ${cssVariables}
        }
        ${backgroundStyles}
      `}} />
      <GuestTablePage
        table={table}
        restaurant={restaurant}
      />
    </>
  );
}
