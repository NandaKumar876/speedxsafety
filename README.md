# SpeedxSafety Monorepo

SpeedxSafety is a premium, real-time safety monitoring mobile application designed for teen riders and their parents. This repository is organized as a monorepo containing the frontend mobile application and database schemas.

## Project Structure

This project is built using a clean, modern, and decoupled architecture. For detailed design decisions, please refer to [ARCHITECTURE.md](./ARCHITECTURE.md):
**/frontend** - React Native (Expo) mobile application. Built using a modern **Electric Blue / Violet** dark theme, responsive grids, and standard **Inter** typography.
- **/backend** - Contains the database setup and SQL scripts for migration.

--

## Features

###  Premium UX & Micro-Animations
- **Electric Blue & Violet Palette**: A highly polished and premium dark design replacing default styling.
- **Micro-Animations**: Staggered card fade-ins, loading skeleton views, custom shadows, and spring-based animations.
- **Speedometer Arc**: Interactive speed gauge with tick marks and smooth spring physics.

###  Responsive Design
- Handles phone, tablet, and web aspect ratios using a dynamic layout scaling hook (`useResponsive` / `getResponsiveInfo`).

###  Role-Based Access Controls (RBAC)
- Separated login flows for **Parents**, **Teen Riders**, and **System Administrators** starting from a central landing selector page.

###  Live Vehicle Tracking ("Bike Game" View)
- Real-time full-screen map tracing the rider's path with a rotating, heading-aware vehicle icon.
- Dynamic route polyline styling based on current speed thresholds (green for safe, yellow/red for limit breaches).

###  Admin Panel
- **Overview Dashboard**: Displays aggregated metrics (active trips, average safety scores, alerts, user counts).
- **User Management**: Search, filter, and toggle active/suspended status for any profile.
- **Alert History Control**: Global alerts dashboard to monitor safety infractions.

###  Supabase Integration
- Built-in session persistence and OAuth/Email auth.
- Real-time location tracking and instant alert feeds via Supabase Channels.
- Strict PostgreSQL Row-Level Security (RLS) policies to keep teen data accessible only to their respective parents.

---

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI (for mobile frontend)
- A Supabase project (for database and authentication)

---

## Getting Started

### 1. Database Setup
Import the SQL schema located at [backend/supabase-schema.sql](file:///c:/Users/nanda/Desktop/speedxsafety/backend/supabase-schema.sql) into your Supabase project's SQL editor and execute it. This creates:
- `profiles`, `teens`, `trips`, `alerts`, `geofences`, `badges`, and `teen_locations` tables.
- Triggers to automatically provision user profiles upon signup.
- Realtime publication configurations.
- RLS policies.

### 2. Frontend Environment Setup
Open [frontend/src/services/supabase.ts](file:///c:/Users/nanda/Desktop/speedxsafety/frontend/src/services/supabase.ts) and add your project URL and public anon key:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. Running Frontend Dev Server
From the root of the project:

```bash
npm install
npm run dev
```

Or from the frontend directory directly:

```bash
cd frontend
npm install
npm run dev
```
