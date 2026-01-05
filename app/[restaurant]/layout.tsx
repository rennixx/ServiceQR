import { getRestaurantBySlug, getThemeWithDefaults, generateCSSVariables } from '@/lib/restaurant';
import type { Metadata } from "next";
import "../globals.css";

interface RestaurantLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    restaurant: string;
  }>;
}

export async function generateMetadata({ params }: RestaurantLayoutProps): Promise<Metadata> {
  const { restaurant } = await params;
  const restaurantData = await getRestaurantBySlug(restaurant);

  if (!restaurantData) {
    return {
      title: "Restaurant Not Found - ServiceQR",
    };
  }

  return {
    title: `${restaurantData.name} - ServiceQR`,
    description: `Order service at ${restaurantData.name} with a scan`,
  };
}

export default async function RestaurantLayout({ children, params }: RestaurantLayoutProps) {
  const { restaurant } = await params;
  const restaurantData = await getRestaurantBySlug(restaurant);

  let cssVariables = '';
  let restaurantName = 'Restaurant Not Found';

  if (restaurantData) {
    restaurantName = restaurantData.name;
    const theme = getThemeWithDefaults(restaurantData.theme_config || {});
    cssVariables = generateCSSVariables(theme);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          ${cssVariables}
        }
      `}} />
      <div className="min-h-screen bg-background text-foreground">
        {restaurantData ? (
          <header className="bg-primary text-white shadow-md">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold">{restaurantName}</h1>
            </div>
          </header>
        ) : (
          <header className="bg-slate-700 text-white shadow-md">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold">Restaurant Not Found</h1>
            </div>
          </header>
        )}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </>
  );
}
