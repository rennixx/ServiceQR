import { ThemeConfig } from '@/src/types/database';
import { getGlassClasses } from '@/lib/theme-engine';

interface GlassCardProps {
  children: React.ReactNode;
  theme?: ThemeConfig;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, theme, className = '', onClick }: GlassCardProps) {
  const glassClasses = theme ? getGlassClasses(theme) : 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl';

  return (
    <div
      className={`${glassClasses} ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface GlassButtonProps {
  children: React.ReactNode;
  theme?: ThemeConfig;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function GlassButton({ children, theme, onClick, disabled, className = '', variant = 'primary' }: GlassButtonProps) {
  const baseClasses = 'font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  const radius = theme?.border_radius || 'rounded';
  const radiusClass = radius === 'square' ? 'rounded-none' : radius === 'pill' ? 'rounded-full' : 'rounded-xl';

  const variantClasses = {
    primary: `bg-primary hover:bg-primary-hover text-white shadow-[0_0_15px_var(--primary)]`,
    secondary: `bg-secondary hover:bg-secondary-hover text-white`,
    ghost: `bg-white/10 hover:bg-white/20 text-white`,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${radiusClass} px-6 py-3 ${className}`}
    >
      {children}
    </button>
  );
}
