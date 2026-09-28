# Nexus Digital Agency Website

A full-featured professional agency website built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

## Features

### Public Website
- Home, About, Services, Portfolio, Pricing, Blog, Testimonials, Careers, Contact, Consultation
- Dynamic routes for services, portfolio, blog, and careers
- Lead generation forms, newsletter, project inquiry
- SEO (sitemap, robots, Open Graph), Framer Motion animations

### Admin Dashboard (`/admin`)
- Dashboard with stats and charts
- Lead management, Portfolio/Blog/Services CRUD
- Team, Testimonials, Careers, Settings

## Quick Start

```bash
npm install
cp .env.example .env
docker compose up -d   # optional: local PostgreSQL
npm run db:push
npm run db:seed
npm run dev
```

**Admin:** `admin@nexusdigital.com` / `admin123`

Open http://localhost:3000

## Deployment

- Frontend: Vercel
- Database: PostgreSQL (Railway, Render, Supabase)
- Set `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_SITE_URL` in production
