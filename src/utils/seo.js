export const breadcrumbSchema = (items, origin) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: `${origin}${it.path}`,
  })),
});

export const productSchema = (product, origin, currency, storeName) => {
  const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const image = product.images?.map((src) => (src.startsWith('http') ? src : `${origin}${src}`));
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    description: product.description?.slice(0, 400) || `${product.name} from ${storeName}`,
    image,
    brand: { '@type': 'Brand', name: storeName },
    offers: {
      '@type': 'Offer',
      url: `${origin}/products/${product.slug}`,
      priceCurrency: currency,
      price,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
};

export const storeSchema = (store, origin) => ({
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: store.storeName,
  description: store.seo?.description,
  url: origin,
  image: origin,
});