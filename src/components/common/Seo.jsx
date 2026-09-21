import { Helmet } from 'react-helmet-async';

export function Seo({
  title,
  description,
  canonical,
  image,
  type = 'website',
  jsonLd,
  noIndex,
}) {
  const absolute = (path) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  };

  return (
    <Helmet>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {canonical ? <link rel="canonical" href={absolute(canonical)} /> : null}
      {noIndex ? <meta name="robots" content="noindex" /> : null}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      {canonical ? <meta property="og:url" content={absolute(canonical)} /> : null}
      {image ? (
        <>
          <meta property="og:image" content={absolute(image)} />
          <meta name="twitter:image" content={absolute(image)} />
        </>
      ) : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description ? <meta name="twitter:description" content={description} /> : null}

      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
}

export default Seo;