'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Droplet, CreditCard, Check, Clock, AlertCircle, List, LayoutGrid, Bell, BarChart3, Volume2, VolumeX, Star } from 'lucide-react';
import Link from 'next/link';
import { updateServiceRequestStatus } from '@/app/actions';
import { Restaurant } from '@/src/types/database';
import { ServiceRequestWithDetails, getRequestTypeInfo, formatRelativeTime } from '@/lib/service-request';
import { GlassCard } from '@/components/ui/GlassCard';
import { playNotificationSound, requestNotificationPermission, showBrowserNotification, canShowNotifications } from '@/lib/sound';

interface StaffDashboardProps {
  restaurant: Restaurant;
  initialRequests: ServiceRequestWithDetails[];
}

export default function StaffDashboard({ restaurant, initialRequests }: StaffDashboardProps) {
  const [requests, setRequests] = useState<ServiceRequestWithDetails[]>(initialRequests);
  const [newRequestIds, setNewRequestIds] = useState<Set<string>>(new Set());
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(canShowNotifications());
  const [initialRequestCount] = useState(initialRequests.length);

  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('service_requests_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'service_requests' }, (payload) => {
        if (payload.new.status === 'done') {
          setRequests((prev) => prev.filter((req) => req.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'service_requests' }, async (payload) => {
        // New request coming in - fetch full details
        const { data: newReq } = await supabase
          .from('service_requests_dashboard')
          .select('*')
          .eq('id', payload.new.id)
          .single();

        if (newReq) {
          // Play sound if enabled
          if (soundEnabled) {
            playNotificationSound({ volume: 0.3 });
          }

          // Show browser notification if enabled
          if (notificationsEnabled) {
            const typeInfo = getRequestTypeInfo(newReq.type);
            showBrowserNotification(
              `New ${typeInfo.label} Request`,
              `Table ${newReq.table_number} - ${formatRelativeTime(newReq.created_at)}`
            );
          }

          // Add to requests and mark as new
          setRequests((prev) => [newReq, ...prev]);
          setNewRequestIds((prev) => new Set(prev).add(newReq.id));

          // Remove NEW badge after 30 seconds
          setTimeout(() => {
            setNewRequestIds((prev) => {
              const next = new Set(prev);
              next.delete(newReq.id);
              return next;
            });
          }, 30000);
        }
      })
      .subscribe((status) => console.log('Realtime subscription status:', status));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, soundEnabled, notificationsEnabled]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then((granted) => {
      setNotificationsEnabled(granted);
    });
  }, []);

  // Track new requests for 30 seconds
  useEffect(() => {
    if (requests.length > initialRequestCount) {
      const newReq = requests[0];
      setNewRequestIds((prev) => new Set(prev).add(newReq.id));

      setTimeout(() => {
        setNewRequestIds((prev) => {
          const next = new Set(prev);
          next.delete(newReq.id);
          return next;
        });
      }, 30000);
    }
  }, [requests.length, initialRequestCount]);

  const handleMarkAsDone = async (requestId: string) => {
    setLoadingStates((prev) => ({ ...prev, [requestId]: true }));
    const result = await updateServiceRequestStatus(requestId, 'done');

    if (result.success) {
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } else {
      alert('Failed to mark request as done');
    }

    setLoadingStates((prev) => ({ ...prev, [requestId]: false }));
  };

  const requestIcons: Record<string, React.ElementType> = {
    waiter: User,
    water: Droplet,
    bill: CreditCard,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_var(--primary)]">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Command Center</h1>
                <p className="text-slate-400 mt-1">{restaurant.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Request Counter */}
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{requests.length}</div>
                <div className="text-xs text-slate-400">Pending</div>
              </div>

              {/* Analytics Link */}
              <Link
                href={`/analytics/${restaurant.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all text-white font-medium"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">Analytics</span>
              </Link>

              {/* Feedback Link */}
              <Link
                href={`/feedback/${restaurant.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all text-white font-medium"
              >
                <Star className="w-5 h-5" />
                <span className="hidden sm:inline">Feedback</span>
              </Link>

              {/* Sound Toggle */}
              <div className="flex bg-slate-800/50 rounded-xl p-1">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg transition-all ${
                    soundEnabled
                      ? 'bg-primary text-white shadow-[0_0_15px_var(--primary)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={soundEnabled ? 'Sound On' : 'Sound Off'}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex bg-slate-800/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white shadow-[0_0_15px_var(--primary)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'compact'
                      ? 'bg-primary text-white shadow-[0_0_15px_var(--primary)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {requests.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">All Caught Up!</h2>
            <p className="text-slate-400 text-lg">No pending service requests</p>
            <p className="text-sm text-slate-500 mt-4">
              New requests will appear here instantly via real-time updates
            </p>
          </div>
        ) : (
          // Requests Grid/List
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-3'}>
            {requests.map((request) => {
              const typeInfo = getRequestTypeInfo(request.type);
              const isNew = newRequestIds.has(request.id);
              const isLoading = loadingStates[request.id];
              const Icon = requestIcons[request.type];
              const ageMinutes = (Date.now() - new Date(request.created_at).getTime()) / 60000;
              const isUrgent = ageMinutes > 5;

              return (
                <RequestCard
                  key={request.id}
                  request={request}
                  typeInfo={typeInfo}
                  isNew={isNew}
                  isUrgent={isUrgent}
                  isLoading={isLoading}
                  Icon={Icon}
                  viewMode={viewMode}
                  onMarkAsDone={() => handleMarkAsDone(request.id)}
                />
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <GlassCard className="mt-12 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">How the Command Center works</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• New requests appear instantly via real-time updates</li>
                <li>• Sound alerts notify you of new requests (toggle in header)</li>
                <li>• Browser notifications when enabled</li>
                <li>• Requests show a "NEW" badge for 30 seconds</li>
                <li>• Urgent requests (5+ minutes) show red background</li>
                <li>• Toggle between Grid and Compact views for your preference</li>
                <li>• Click "Mark as Done" when you've completed a request</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}

interface RequestCardProps {
  request: ServiceRequestWithDetails;
  typeInfo: { icon: string; label: string; color: string };
  isNew: boolean;
  isUrgent: boolean;
  isLoading: boolean;
  Icon: React.ElementType;
  viewMode: 'grid' | 'compact';
  onMarkAsDone: () => void;
}

function RequestCard({ request, typeInfo, isNew, isUrgent, isLoading, Icon, viewMode, onMarkAsDone }: RequestCardProps) {
  if (viewMode === 'compact') {
    return (
      <GlassCard
        className={`p-4 transition-all ${isUrgent ? 'bg-red-500/10 border-red-500/30' : ''} ${isNew ? 'ring-2 ring-green-400' : ''}`}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="relative">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `var(--primary)` }}>
              <Icon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            {/* New Badge */}
            {isNew && (
              <>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{typeInfo.label}</h3>
              {isUrgent && (
                <span className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  Urgent
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">Table {request.table_number}</p>
          </div>

          {/* Time & Action */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatRelativeTime(request.created_at)}
            </div>
            <button
              onClick={onMarkAsDone}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Done
                </>
              )}
            </button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      className={`overflow-hidden transition-all ${isUrgent ? 'bg-red-500/10 border-red-500/30' : ''} ${isNew ? 'ring-4 ring-green-400 ring-opacity-50' : ''}`}
    >
      {/* New Badge */}
      {isNew && (
        <div className="bg-green-500 text-white text-xs font-bold py-1 px-3 text-center flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          NEW
        </div>
      )}

      <div className="p-6">
        {/* Request Type */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_0_15px_var(--primary)]" style={{ backgroundColor: `var(--primary)` }}>
                <Icon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              {/* Ping for new requests */}
              {isNew && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{typeInfo.label}</h3>
              <p className="text-sm text-slate-400">Table {request.table_number}</p>
            </div>
          </div>

          {/* Urgent Badge */}
          {isUrgent && (
            <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {Math.floor((Date.now() - new Date(request.created_at).getTime()) / 60000)} min
            </span>
          )}
        </div>

        {/* Time */}
        <div className="text-sm text-slate-500 mb-4 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatRelativeTime(request.created_at)}
        </div>

        {/* Done Button */}
        <button
          onClick={onMarkAsDone}
          disabled={isLoading}
          className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
            isLoading ? 'bg-slate-600' : 'bg-green-500 hover:bg-green-600 active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Mark as Done
            </>
          )}
        </button>
      </div>
    </GlassCard>
  );
}
