# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Run development server with Turbopack at http://localhost:3000
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run Next.js linting

### Package Management
- `npm install` - Install dependencies

## Architecture Overview

This is a photo session landing page built as a Next.js 15.4.4 application using the App Router architecture.

### Tech Stack
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **React**: Version 19.1.0
- **Animation**: Framer Motion v12.23.12 for modal animations and transitions

### Project Structure
- `/app` - App Router directory
  - `layout.tsx` - Root layout with Geist font configuration and Japanese metadata
  - `page.tsx` - Main landing page (client component with scroll animations, image gallery, modals)
  - `globals.css` - Global styles
- `/components` - Reusable React components
  - `CancellationModal.tsx` - Animated modal for urgent booking notifications using Framer Motion
- `/public/images` - Photo gallery images organized in subdirectories (`827/`, `yon/`)

### Key Architecture Patterns

**Client-Side Interactions**: The main page (`app/page.tsx`) is a client component that handles:
- Loading animation (3-second spinner with company branding)
- Scroll-based animations using Intersection Observer API
- Multiple modals (calendar booking, image lightbox, cancellation notice)
- Image slideshow carousel in the About section

**Animation System**:
- Scroll animations: Uses custom CSS classes (`.scroll-animation`) with Intersection Observer
- Modal animations: Framer Motion's `AnimatePresence` for enter/exit transitions
- Loading states: Tailwind animations (`animate-spin`, `animate-pulse`, `animate-fade-in`)

**Modal Management**: Three modal types managed via React state:
1. Calendar booking (Google Calendar iframe)
2. Image gallery lightbox
3. Urgent cancellation notice (auto-shows after loading)

### Configuration
- **TypeScript**: Strict mode, `@/*` path alias maps to project root
- **PostCSS**: Configured for Tailwind CSS v4 via `@tailwindcss/postcss` plugin
- **Font System**: Uses Geist Sans and Geist Mono from Google Fonts
- **Image Optimization**: Next.js Image component for all photos

### Content Notes
- Primary language: Japanese (site metadata and content)
- Target audience: Female participants for photo sessions
- Event-specific: Limited 8-person photo session by NonTurn.LLC
