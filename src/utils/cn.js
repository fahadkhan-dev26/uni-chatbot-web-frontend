/**
 * Joins class names, skipping falsy values.
 * Usage: cn('px-4', isActive && 'bg-brand-600', className)
 */
export const cn = (...classes) => classes.filter(Boolean).join(' ');
