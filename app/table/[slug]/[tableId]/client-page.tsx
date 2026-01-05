'use client';

import { useState } from 'react';
import { Sparkles, Star } from 'lucide-react';
import { createServiceRequest } from '@/app/actions';
import { Restaurant, Table, ServiceRequestType } from '@/src/types/database';
import { ServiceCard } from '@/components/ServiceCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { createFeedback } from '@/lib/feedback';

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
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

  const handleSubmitFeedback = async (ratingValue: number, commentValue?: string) => {
    const result = await createFeedback(table.id, null, ratingValue, commentValue);
    if (result.success) {
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSubmitted(false);
        setRating(0);
        setComment('');
      }, 2000);
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

            {/* Rating Card */}
            <GlassCard theme={restaurant.theme_config} className="p-6 text-center">
              {!showFeedback ? (
                <>
                  <h3 className="font-semibold text-white mb-4">
                    {feedbackSubmitted ? 'Thank you for your feedback!' : 'Rate your experience'}
                  </h3>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          setRating(star);
                          setShowFeedback(true);
                        }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={feedbackSubmitted}
                        className="transition-transform hover:scale-110 disabled:opacity-50"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-white/60">
                    {feedbackSubmitted ? 'We appreciate your rating!' : 'Tap a star to leave a detailed review'}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-white mb-4">How was your experience?</h3>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={feedbackSubmitted}
                        className="transition-transform hover:scale-110 disabled:opacity-50"
                      >
                        <Star
                          className={`w-10 h-10 ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us more about your experience... (optional)"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-4"
                    rows={3}
                    disabled={feedbackSubmitted}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSubmitFeedback(rating, comment)}
                      disabled={rating === 0 || feedbackSubmitted}
                      className="flex-1 px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                    >
                      {feedbackSubmitted ? 'Thank you!' : 'Submit Review'}
                    </button>
                    {!feedbackSubmitted && (
                      <button
                        onClick={() => {
                          setShowFeedback(false);
                          setRating(0);
                          setComment('');
                        }}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </>
              )}
            </GlassCard>

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
