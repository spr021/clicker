# AGENTS.md

## Overview
Next.js 16.2.9 application built with React 19, using Supabase for authentication and backend storage.

## Quick Start

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Key Components

### Authentication
- **Supabase** backend for user management and authentication
- Session management via cookies + Supabase auth API
- Google sign-in integration (via `GoogleSignInButton` component)
- Login/Signup pages in `app/`

### Core Pages
- **`app/game/page.tsx`** – Main game view showing session info and LockpickGame
- **`app/leaderboard/page.tsx`** – Leaderboard display
- **`app/auth/callback/route.ts`** – Auth callback route handler
- **`app/components/GoogleSignInButton.tsx`** – Google sign-in button component

### Data Models
- **Session** – Contains `userId`, `email`, `displayName`, `expiresAt`
- **Forms** – Zod schemas for signup and login forms (`lib/definitions.ts`)
- **Scores** – High score tracking (`app/actions/scores`)

## Configuration

- **Package Manager**: npm
- **Build System**: Next.js (16.2.9)
- **Language**: TypeScript 5
- **Linting**: ESLint with Next.js/Vitality/TS presets
- **Type Checking**: Strict mode enabled

## Running Tests & Linting

```bash
# Lint
npm run lint

# Type check
npm run build
```

## Important Conventions

- All server-side logic lives in `app/` (Next.js App Router)
- Client components use `'use client'` directive
- Forms validated with Zod schemas in `lib/definitions.ts`
- Session state managed through cookies + Supabase
- Game logic isolated in `app/game/`

## Environment

- Requires Supabase instance configured with project ID
- Environment variables loaded from `.env.local` (e.g., SUPABASE_PROJECT_ID)
- Debugging: Run `npm run dev` and inspect browser console

## Troubleshooting

- **Session not persisting**: Ensure Supabase auth token is properly stored in cookies
- **Missing routes**: Check `app/auth/callback/route.ts` for auth flow
- **Type errors**: Run `npm run build` to catch type mismatches early
