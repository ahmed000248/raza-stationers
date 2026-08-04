import React from 'react';

export type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone = 'neutral',
  size = 'md'
}) => {
  let styleClasses = 'bg-stone-100 text-stone-700 border-stone-200';

  if (tone === 'success') {
    styleClasses = 'bg-[#f2f7f5] text-[#163832] border-[#a3c5a8]';
  } else if (tone === 'warning') {
    styleClasses = 'bg-amber-50 text-amber-900 border-amber-300';
  } else if (tone === 'error') {
    styleClasses = 'bg-red-50 text-red-800 border-red-200';
  } else if (tone === 'info') {
    styleClasses = 'bg-sky-50 text-sky-800 border-sky-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${styleClasses} ${sizeClasses} whitespace-nowrap`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          tone === 'success'
            ? 'bg-[#163832]'
            : tone === 'warning'
            ? 'bg-amber-500'
            : tone === 'error'
            ? 'bg-red-500'
            : tone === 'info'
            ? 'bg-sky-500'
            : 'bg-stone-400'
        }`}
      />
      {label}
    </span>
  );
};
