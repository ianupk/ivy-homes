import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPriceINR(amount: number): string {
  if (!amount || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh.toFixed(2).replace(/\.00$/, '')} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function normalizeProjectPriceToINR(val: number): number {
  if (!val || isNaN(val) || val <= 0) return 0;
  if (val >= 100000) return val;
  if (val < 10) return Math.round(val * 10000000);
  return Math.round(val * 100000);
}

export function formatProjectPrice(val: number): string {
  if (!val || isNaN(val) || val <= 0) return 'Price on Request';
  if (val >= 100000) return formatPriceINR(val);
  if (val < 10) {
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Cr`;
  }
  const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.?0+$/, '');
  return `₹${formatted} L`;
}

export function formatArea(sqft: number): string {
  if (!sqft || isNaN(sqft)) return '0 sq.ft';
  return `${sqft.toLocaleString('en-IN')} sq.ft`;
}

export function formatDate(isoString?: string): string {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
