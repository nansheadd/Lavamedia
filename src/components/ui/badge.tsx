import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'info' | 'success' | 'warning';
};

export function Badge({ tone = 'info', className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        tone === 'info' && 'bg-primary-100 text-primary-700',
        tone === 'success' && 'bg-emerald-100 text-emerald-800',
        tone === 'warning' && 'bg-amber-100 text-amber-800',
        className
      )}
      {...props}
    />
  );
}
