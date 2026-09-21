const normaliseNumber = (raw) => String(raw || '').replace(/[^\d]/g, '').replace(/^0+/, '');

export const waLink = (number, message) => {
  const n = normaliseNumber(number);
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
};

export const productMessage = ({ name, sku, price, quantity = 1, url, currency = 'PKR' }) => {
  return [
    'Assalam-o-Alaikum,',
    '',
    'I want to order:',
    '',
    `Product: ${name}`,
    `SKU: ${sku}`,
    `Price: ${currency} ${Number(price || 0).toLocaleString('en-PK')}`,
    `Quantity: ${quantity}`,
    '',
    `Product Link: ${url}`,
    '',
    'Please confirm availability and order details.',
    '',
    'Thank you.',
  ].join('\n');
};

export const cartMessage = ({ items, subtotal, currency = 'PKR' }) => {
  const lines = [
    'Assalam-o-Alaikum,',
    '',
    'I want to order the following items:',
    '',
  ];
  items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.name}`);
    lines.push(`   SKU: ${it.sku}`);
    lines.push(`   Qty: ${it.quantity}  x  ${currency} ${Number(it.price || 0).toLocaleString('en-PK')}`);
    lines.push(`   Link: ${it.url}`);
    lines.push('');
  });
  lines.push(`Estimated Subtotal: ${currency} ${Number(subtotal || 0).toLocaleString('en-PK')}`);
  lines.push('');
  lines.push('Please confirm availability and order details.');
  lines.push('');
  lines.push('Thank you.');
  return lines.join('\n');
};

export const currentProductUrl = (slug) => {
  const base = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${base.replace(/\/$/, '')}/products/${slug}`;
};