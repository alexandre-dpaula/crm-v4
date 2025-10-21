'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border border-slate-300 text-brand focus:ring-2 focus:ring-brand/40',
        className
      )}
      {...props}
    />
  )
);

Checkbox.displayName = 'Checkbox';
