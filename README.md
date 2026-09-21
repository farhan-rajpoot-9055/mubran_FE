# Ladies Suits E-commerce — Frontend

Storefront + admin panel for the ladies-suits e-commerce site. Built with **Vite, React 18, React Router 6, Swiper, lucide-react and `react-helmet-async`**. Custom design system (no UI framework) with a warm ivory/rosewood palette and Playfair Display + Jost fonts.

Ordering is **WhatsApp-first**: the cart builds a pre-filled WhatsApp message and opens `wa.me`. There is no COD checkout or payment gateway.

This frontend is standalone and talks only to the new Node API (`ecommerce-backend`), not the existing Laravel backend.

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

Build for production: `npm run build` (outputs to `dist/`). Preview: `npm run preview`.

## Environment variables

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API base URL, e.g. `http://localhost:5000` (no trailing slash) |
| `VITE_APP_URL` | Public site URL used for WhatsApp share links (defaults to current origin) |
| `VITE_WHATSAPP_NUMBER` | Fallback WhatsApp number (country code + digits) |

These are baked in at build time, so on Vercel you set them under **Project → Settings → Environment Variables** before each build.

## Pages & routes

| Route | Description |
| --- | --- |
| `/` | Home — hero (from settings), categories, featured/promos |
| `/shop` | All products — search, category, sale/stock filters, sort, pagination |
| `/category/:slug` | Category page |
| `/products/:slug` | Product detail — gallery, WhatsApp order |
| `/cart` | Cart + cart drawer with WhatsApp order button |
| `/about` `/contact` | Info pages (content driven by store settings) |
| `/admin/login` | Admin sign in |
| `/admin` … | Dashboard, Products (+ new/edit), Categories, Inventory, Orders, Customers, Settings |

All `/admin/*` routes (except login) are protected by `ProtectedRoute`.

## Project structure

```
src/
  api/apiClient.js         # fetch wrapper, token handling, resolveImageUrl
  contexts/                # Store, Auth, Toast, Cart
  hooks/                   # useDebounce, useInView
  utils/                   # format, whatsapp message builder, seo helpers
  components/layout/       # Header, Footer, CartDrawer, Layout
  components/common/       # Seo, ProductCard, QuickView, Reveal, etc.
  components/home/         # HeroSlider, FeaturedCategories, PromoBanner, etc.
  pages/                   # public pages
  pages/admin/             # admin panel + shared admin components
  styles/                  # index.css (design tokens), home, shop, product, admin
public/
  robots.txt               # references /sitemap.xml
  sitemap.xml              # replace STORE_DOMAIN with your domain
```

## Deploying to Vercel

1. Push the frontend to a repository and import it in Vercel (or run `vercel` from this directory).
2. Framework preset: Vite. Build command: `npm run build`, output directory: `dist` (already configured in `vercel.json`).
3. Set `VITE_API_URL`, `VITE_APP_URL` and `VITE_WHATSAPP_NUMBER` as Environment Variables.
4. SPA routing is handled by the rewrite rule in `vercel.json` (`/* → /index.html`).

> For dynamic SEO (per-product meta etc.) the site uses client-side `<head>` updates; submit `/sitemap.xml` in Search Console after replacing `STORE_DOMAIN`.

## Notes

- Images stored as relative `/uploads/...` paths are resolved against `VITE_API_URL` by `resolveImageUrl`; absolute URLs are used as-is.
- The admin panel is optimised for desktop; it also works on mobile with a collapsible sidebar.
- No analytics/tracking scripts are included by default.# mubran_FE
