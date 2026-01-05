'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  Users,
  BarChart3,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Restaurant } from '@/src/types/database';
import { AnalyticsMetrics, getAnalyticsMetrics, getHourLabel, formatDateLabel } from '@/lib/analytics';
import { GlassCard } from '@/components/ui/GlassCard';

interface AnalyticsClientProps {
  restaurant: Restaurant;
  initialMetrics: AnalyticsMetrics | null;
}

const COLORS = {
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  waiter: '#8b5cf6',
  water: '#06b6d4',
  bill: '#f59e0b',
};

export default function AnalyticsClient({ restaurant, initialMetrics }: AnalyticsClientProps) {
  const [daysFilter, setDaysFilter] = useState<7 | 30 | 90>(7);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(initialMetrics);

  const refreshData = async () => {
    setIsLoading(true);
    const newMetrics = await getAnalyticsMetrics(restaurant.slug, daysFilter);
    setMetrics(newMetrics);
    setIsLoading(false);
  };

  // Format data for charts
  const hourlyChartData = useMemo(() => {
    if (!metrics) return [];
    return metrics.hourlyVolume.map(h => ({
      hour: getHourLabel(h.hour),
      requests: h.count,
    }));
  }, [metrics]);

  const dailyChartData = useMemo(() => {
    if (!metrics) return [];
    return metrics.dailyVolume.map(d => ({
      date: formatDateLabel(d.date),
      requests: d.count,
    }));
  }, [metrics]);

  const typeChartData = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: 'Waiter', value: metrics.requestByType.waiter, color: COLORS.waiter },
      { name: 'Water', value: metrics.requestByType.water, color: COLORS.water },
      { name: 'Bill', value: metrics.requestByType.bill, color: COLORS.bill },
    ];
  }, [metrics]);

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const completionRate =
    metrics.totalRequests > 0
      ? Math.round((metrics.completedRequests / metrics.totalRequests) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_var(--primary)]">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
                <p className="text-slate-400 mt-1">{restaurant.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div className="flex bg-slate-800/50 rounded-xl p-1">
                {[7, 30, 90].map(days => (
                  <button
                    key={days}
                    onClick={() => {
                      setDaysFilter(days as 7 | 30 | 90);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all font-medium ${
                      daysFilter === days
                        ? 'bg-primary text-white shadow-[0_0_15px_var(--primary)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {days} days
                  </button>
                ))}
              </div>
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <Activity className={`w-5 h-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Activity}
            label="Total Requests"
            value={metrics.totalRequests}
            color="primary"
          />
          <MetricCard
            icon={Users}
            label="Pending"
            value={metrics.pendingRequests}
            color="secondary"
          />
          <MetricCard
            icon={TrendingUp}
            label="Completion Rate"
            value={`${completionRate}%`}
            color="green"
          />
          <MetricCard
            icon={Clock}
            label="Avg Response Time"
            value={`${metrics.averageResponseTime}m`}
            color="orange"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Volume Chart */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">Request Volume (Last {daysFilter} Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar
                  dataKey="requests"
                  fill="var(--primary)"
                  radius={[8, 8, 0, 0]}
                  style={{ filter: 'drop-shadow(0 0 8px var(--primary))' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Hourly Distribution Chart */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">Hourly Distribution (24h)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="hour"
                  stroke="#94a3b8"
                  fontSize={12}
                  tick={{ fill: '#94a3b8' }}
                  interval={2}
                />
                <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="var(--secondary)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--secondary)', r: 4 }}
                  activeDot={{ r: 6 }}
                  style={{ filter: 'drop-shadow(0 0 8px var(--secondary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Request Type & Peak Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Type Distribution */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">Requests by Type</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {typeChartData.map(type => (
                <div key={type.name} className="text-center">
                  <div
                    className="w-4 h-4 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: type.color, boxShadow: `0 0 10px ${type.color}` }}
                  />
                  <div className="text-2xl font-bold text-white">{type.value}</div>
                  <div className="text-sm text-slate-400">{type.name}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Peak Hours */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">Peak Hours</h3>
            <div className="space-y-4">
              {metrics.peakHours.map((peak, index) => (
                <div
                  key={peak.hour}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                          : 'bg-slate-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {getHourLabel(peak.hour)}
                      </div>
                      <div className="text-sm text-slate-400">
                        {peak.hour === 12 || peak.hour < 6 ? 'Late Night' : peak.hour < 12 ? 'Morning' : peak.hour < 17 ? 'Afternoon' : 'Evening'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{peak.count}</div>
                    <div className="text-sm text-slate-400">requests</div>
                  </div>
                </div>
              ))}
            </div>
            {metrics.peakHours.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No data yet for this time period</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Insights Card */}
        <GlassCard className="mt-8 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-3">Key Insights</h3>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    Peak service time is at <strong>{getHourLabel(metrics.peakHours[0]?.hour || 12)}</strong> with{' '}
                    <strong>{metrics.peakHours[0]?.count || 0} requests</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    Most requested service: <strong>{
                      typeChartData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'
                    }</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    Average response time: <strong>{metrics.averageResponseTime} minutes</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    Completion rate: <strong>{completionRate}%</strong> ({metrics.completedRequests} of {metrics.totalRequests})
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: 'primary' | 'secondary' | 'green' | 'orange';
}

function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
  const colorClasses = {
    primary: 'from-primary to-blue-500 shadow-[0_0_20px_var(--primary)]',
    secondary: 'from-secondary to-purple-500 shadow-[0_0_20px_var(--secondary)]',
    green: 'from-green-500 to-emerald-600 shadow-[0_0_20px_rgba(34,197,94,0.5)]',
    orange: 'from-orange-500 to-amber-600 shadow-[0_0_20px_rgba(249,115,22,0.5)]',
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="text-3xl font-bold text-white">{value}</div>
          <div className="text-sm text-slate-400 mt-1">{label}</div>
        </div>
      </div>
    </GlassCard>
  );
}
