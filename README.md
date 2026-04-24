# Gandomak Shop / گندمک شاپ

Online storefront for گندمک شاپ — Persian saffron, natural spices, herbal infusions, nuts, and curated gift packs. Ships across Iran.

Live site: https://gandomakshop.ir

## Tech stack

- React 18 + TypeScript
- Vite 5 (SWC)
- Tailwind CSS v3 + shadcn/ui (Radix primitives)
- React Router v6
- TanStack Query v5
- Vazirmatn (Persian web font), RTL layout

## Local development

Requires Node.js 18+ and npm.

```bash
npm install
npm run dev          # starts the Vite dev server on http://localhost:8080
```

## Available scripts

| Script              | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Start the dev server with HMR                   |
| `npm run build`     | Production build → `dist/client/`               |
| `npm run build:dev` | Development-mode build (source-map friendly)    |
| `npm run preview`   | Preview the production build locally            |
| `npm run lint`      | Run ESLint over the project                     |
| `npm test`          | Run the Vitest test suite once                  |
| `npm run test:watch`| Run Vitest in watch mode                        |

## Project layout

```
public/          Static assets served as-is (favicon, logo, sitemap, robots)
src/
  assets/       Imported images (categories, hero, trust seals, logos)
  components/   UI components (Header, ProductGrid, etc.)
  pages/        Route components
  lib/          Shared utilities
index.html      App shell (RTL, Persian SEO meta, font preload)
vite.config.ts  Build config — outputs to dist/client/, manual vendor chunks
```

## Deployment

Production build outputs to `dist/client/` to match the VPS layout
(`/var/www/gandomakshop/dist/client`). See `DEPLOY.md` for full deploy notes.

```bash
npm run build
# upload dist/client/ to the web root, or rsync as documented in DEPLOY.md
```

## License

Proprietary — © Gandomak Shop. All rights reserved.
