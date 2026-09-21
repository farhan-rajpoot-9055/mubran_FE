export const formatPrice = (n, currency = 'PKR') =>
  new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(Number(n || 0));

export const todayISO = (d = new Date()) => d.toISOString().slice(0, 10);

export const dateTime = (input) => {
  const d = new Date(input);
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const slugify = (input) =>
  String(input || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);