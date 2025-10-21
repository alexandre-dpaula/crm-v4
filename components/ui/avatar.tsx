'use client';

import { cn } from '@/lib/utils';

type AvatarProps = {
  name: string;
  src?: string | null;
  className?: string;
};

const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];

const getColor = (name: string) => {
  const sum = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
};

export function Avatar({ name, src, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('h-10 w-10 rounded-full object-cover', className)}
      />
    );
  }

  const initial = name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <span
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-white',
        getColor(name),
        className
      )}
    >
      {initial}
    </span>
  );
}
