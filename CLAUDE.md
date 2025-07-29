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

This is a Next.js 15.4.4 application using the App Router architecture with the following key components:

### Tech Stack
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **React**: Version 19.1.0

### Project Structure
- `/app` - App Router directory containing pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global styles
- `/public` - Static assets (images, SVGs)

### Key Configuration
- **TypeScript**: Configured with strict mode, module resolution set to bundler
- **Path Aliases**: `@/*` maps to project root for clean imports
- **Font System**: Uses Geist Sans and Geist Mono from Google Fonts

### Development Notes
- The project uses Turbopack for faster development builds
- No test framework is currently configured
- No additional linting rules beyond Next.js defaults