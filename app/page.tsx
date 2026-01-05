import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            ServiceQR
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Multi-Tenant Restaurant Service Platform
          </p>
          <p className="text-slate-500 mb-8">
            Access your restaurant by visiting: <br />
            <code className="bg-slate-100 px-3 py-1 rounded text-sm">
              /your-restaurant-slug
            </code>
          </p>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">
              Try These Example Slugs:
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/mario-bistro"
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
              >
                Mario's Bistro
              </Link>
              <Link
                href="/sakura-sushi"
                className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
              >
                Sakura Sushi
              </Link>
              <Link
                href="/the-grill"
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
              >
                The Grill
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-400">
              Each restaurant has its own theme and branding
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
