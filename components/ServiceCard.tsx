'use client';

import { User, Droplet, CreditCard, Loader2, Check } from 'lucide-react';
import { ServiceRequestType } from '@/src/types/database';

interface ServiceCardProps {
  type: ServiceRequestType;
  isLoading: boolean;
  isSuccess: boolean;
  onClick: () => void;
  theme?: {
    primary_color?: string;
  };
}

const SERVICE_CONFIG = {
  waiter: {
    icon: User,
    label: 'Call Waiter',
    description: 'Request assistance from staff',
  },
  water: {
    icon: Droplet,
    label: 'Request Water',
    description: 'Ask for water refills',
  },
  bill: {
    icon: CreditCard,
    label: 'Request Bill',
    description: 'Get the check',
  },
};

export function ServiceCard({ type, isLoading, isSuccess, onClick, theme }: ServiceCardProps) {
  const config = SERVICE_CONFIG[type];
  const Icon = config.icon;
  const primaryColor = theme?.primary_color || '#6366f1';

  return (
    <button
      onClick={onClick}
      disabled={isLoading || isSuccess}
      className={`
        group relative
        w-full
        bg-white/10
        backdrop-blur-lg
        border border-white/20
        rounded-2xl
        p-6
        shadow-xl
        transition-all duration-300
        hover:scale-[1.02]
        active:scale-95
        disabled:opacity-80
        disabled:cursor-not-allowed
        ${isLoading ? 'animate-pulse' : ''}
      `}
      style={{
        boxShadow: isSuccess
          ? '0 0 30px rgba(34, 197, 94, 0.3)'
          : `0 0 20px ${primaryColor}40`,
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${primaryColor}40 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-4">
        {isLoading ? (
          <Loader2 className="w-16 h-16 animate-spin text-white" />
        ) : isSuccess ? (
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
        ) : (
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ backgroundColor: primaryColor }}
          >
            <Icon className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
        )}

        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-1">
            {isLoading ? 'Sending...' : isSuccess ? 'Request Sent!' : config.label}
          </h3>
          {!isLoading && !isSuccess && (
            <p className="text-sm text-white/70">{config.description}</p>
          )}
          {isSuccess && (
            <p className="text-sm text-white/70">Staff will be with you shortly</p>
          )}
        </div>
      </div>
    </button>
  );
}
