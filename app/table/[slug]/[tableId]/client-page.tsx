'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { createServiceRequest } from '@/app/actions';
import { Restaurant, Table, ServiceRequestType } from '@/src/types/database';
import { ServiceCard } from '@/components/ServiceCard';
import { GlassCard } from '@/components/ui/GlassCard';

interface GuestTablePageProps {
  table: Table;
  restaurant: Restaurant;
}

interface ButtonState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

type RequestStates = {
  waiter: ButtonState;
  water: ButtonState;
  bill: ButtonState;
};

export default function GuestTablePage({ table, restaurant }: GuestTablePageProps) {
  const [requestStates, setRequestStates] = useState<RequestStates>({
    waiter: { isLoading: false, isSuccess: false, error: null },
    water: { isLoading: false, isSuccess: false, error: null },
    bill: { isLoading: false, isSuccess: false, error: null },
  });

  const handleServiceRequest = async (type: ServiceRequestType) => {
    setRequestStates((prev) => ({
      ...prev,
      [type]: { isLoading: true, isSuccess: false, error: null },
    }));

    const result = await createServiceRequest(table.id, type);

    if (result.success) {
      setRequestStates((prev) => ({
        ...prev,
        [type]: { isLoading: false, isSuccess: true, error: null },
      }));

      setTimeout(() => {
        setRequestStates((prev) => ({
          ...prev,
          [type]: { ...prev[type], isSuccess: false },
        }));
      }, 3000);
    } else {
      setRequestStates((prev) => ({
        ...prev,
        [type]: { isLoading: false, isSuccess: false, error: result.error || 'Failed to create request' },
      }));

      setTimeout(() => {
        setRequestStates((prev) => ({
          ...prev,
          [type]: { ...prev[type], error: null },
        }));
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-background/50" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {restaurant.name}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-white/80">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Table {table.table_number}</span>
                </div>
              </div>
              {restaurant.logo_url && (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="w-16 h-16 rounded-2xl object-cover bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg"
                />
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Welcome Message */}
            <GlassCard theme={restaurant.theme_config} className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_var(--primary)]">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Welcome!
              </h2>
              <p className="text-lg text-white/80 max-w-md mx-auto">
                Tap a service below to request assistance from our staff
              </p>
            </GlassCard>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ServiceCard
                type="waiter"
                isLoading={requestStates.waiter.isLoading}
                isSuccess={requestStates.waiter.isSuccess}
                onClick={() => handleServiceRequest('waiter')}
                theme={restaurant.theme_config}
              />
              <ServiceCard
                type="water"
                isLoading={requestStates.water.isLoading}
                isSuccess={requestStates.water.isSuccess}
                onClick={() => handleServiceRequest('water')}
                theme={restaurant.theme_config}
              />
              <ServiceCard
                type="bill"
                isLoading={requestStates.bill.isLoading}
                isSuccess={requestStates.bill.isSuccess}
                onClick={() => handleServiceRequest('bill')}
                theme={restaurant.theme_config}
              />
            </div>

            {/* Info Card */}
            <GlassCard theme={restaurant.theme_config} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2">How it works</h3>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Tap a button to send a request to the staff</li>
                    <li>• Your request appears instantly on the staff dashboard</li>
                    <li>• Staff will come to your table as soon as possible</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-white/50">
            Powered by ServiceQR • Premium Restaurant Service
          </div>
        </footer>
      </div>
    </div>
  );
}
