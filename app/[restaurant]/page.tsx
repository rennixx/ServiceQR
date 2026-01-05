import Link from "next/link";

interface RestaurantPageProps {
  params: Promise<{
    restaurant: string;
  }>;
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { restaurant } = await params;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-primary mb-6">Welcome!</h2>
        <p className="text-lg text-slate-600 mb-8">
          Scan the QR code to call for service, request water, or ask for the bill.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-primary hover:bg-primary-hover text-white font-semibold py-6 px-8 rounded-lg shadow-md transition-colors duration-200">
            <div className="text-2xl mb-2">👨‍🍳</div>
            <div>Call Waiter</div>
          </button>

          <button className="bg-primary hover:bg-primary-hover text-white font-semibold py-6 px-8 rounded-lg shadow-md transition-colors duration-200">
            <div className="text-2xl mb-2">💧</div>
            <div>Request Water</div>
          </button>

          <button className="bg-primary hover:bg-primary-hover text-white font-semibold py-6 px-8 rounded-lg shadow-md transition-colors duration-200">
            <div className="text-2xl mb-2">💳</div>
            <div>Request Bill</div>
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Restaurant slug: <code className="bg-slate-100 px-2 py-1 rounded">{restaurant}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
