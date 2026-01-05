'use client';

import { useState, useMemo } from 'react';
import { Star, MessageSquare, TrendingUp, Filter } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Restaurant } from '@/src/types/database';
import { FeedbackWithDetails } from '@/src/types/database';

interface FeedbackClientProps {
  restaurant: Restaurant;
  initialFeedback: FeedbackWithDetails[];
  initialStats: {
    total: number;
    average: number;
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  };
}

type FilterType = 'all' | '5' | '4' | '3' | '2' | '1';

export default function FeedbackClient({ restaurant, initialFeedback, initialStats }: FeedbackClientProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredFeedback = useMemo(() => {
    if (filter === 'all') return initialFeedback;
    return initialFeedback.filter(f => f.rating === parseInt(filter));
  }, [initialFeedback, filter]);

  const renderStars = (rating: number, size = 'w-5 h-5') => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
        }`}
      />
    ));
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5: return 'Excellent';
      case 4: return 'Good';
      case 3: return 'Average';
      case 2: return 'Fair';
      case 1: return 'Poor';
      default: return '';
    }
  };

  const getServiceTypeLabel = (type: string | null) => {
    if (!type) return 'General';
    switch (type) {
      case 'waiter': return 'Waiter Service';
      case 'water': return 'Water Refill';
      case 'bill': return 'Bill Request';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_var(--primary)]">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Customer Feedback</h1>
              <p className="text-slate-400 mt-1">{restaurant.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6 text-center">
            <div className="text-5xl font-bold text-white mb-2">{initialStats.average}</div>
            <div className="text-slate-400 mb-4">Average Rating</div>
            <div className="flex justify-center gap-1">
              {renderStars(Math.round(initialStats.average))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-5xl font-bold text-white mb-2">{initialStats.total}</div>
            <div className="text-slate-400">Total Reviews</div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="text-sm font-semibold text-white mb-4">Rating Distribution</div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = initialStats.distribution[rating as keyof typeof initialStats.distribution];
                const percentage = initialStats.total > 0 ? (count / initialStats.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-3">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400" />
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <div className="flex gap-2 flex-wrap">
              {(['all', '5', '4', '3', '2', '1'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    filter === f
                      ? 'bg-primary text-white shadow-[0_0_15px_var(--primary)]'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'All Ratings' : `${f} Stars`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback List */}
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-slate-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">No Feedback Yet</h2>
            <p className="text-slate-400 text-lg">
              {filter === 'all'
                ? 'Customer feedback will appear here once submitted'
                : `No ${filter}-star ratings yet`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredFeedback.map(feedback => (
              <GlassCard key={feedback.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex gap-0.5 mb-2">
                      {renderStars(feedback.rating)}
                    </div>
                    <div className="text-xs text-slate-400">{getRatingLabel(feedback.rating)}</div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-white">
                        Table {feedback.table_number}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </span>
                      {feedback.service_type && (
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          {getServiceTypeLabel(feedback.service_type)}
                        </span>
                      )}
                    </div>

                    {feedback.comment && (
                      <p className="text-slate-300 text-sm">{feedback.comment}</p>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Info Card */}
        <GlassCard className="mt-12 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">Customer Feedback</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Customers can rate their service after requests are completed</li>
                <li>• Ratings range from 1 to 5 stars with optional comments</li>
                <li>• Use this feedback to improve service quality</li>
                <li>• Filter by rating to see specific feedback categories</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
