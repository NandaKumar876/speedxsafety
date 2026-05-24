 SpeedxSafety Monorepo

SpeedxSafety is a robust mobile application designed to ensure the safety of teen drivers. This repository is organized as a monorepo containing both the frontend mobile application and the backend services.

## Project Structure

This project follows a clean, decoupled architecture:

- **/frontend** - Contains the React Native (Expo) mobile application. Features a dynamic UI with a liquid glass aesthetic, role-based dashboards (Parent vs. Teen), and real-time monitoring components.
- **/backend** - Contains the backend services/API to handle authentication, trip data processing, and telemetry storage.

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI (for frontend)

## Getting Started

## Unified Workflow (Recommended)

You can run both the frontend and backend simultaneously from the root of the project using:

```bash
npm install
npm run dev
```

## Running Frontend Only

If you only need to work on the mobile app:

```bash
cd frontend
npm install
npm start
```

# Running Backend Only

If you only need to work on the backend APIs:

```bash
cd backend
npm install
npm run dev
```

# Contributing

1. Create a feature branch (`git checkout -b feature/my-feature`)
2. Commit your changes (`git commit -m 'Add some feature'`)
3. Push to the branch (`git push origin feature/my-feature`)
4. Open a pull request
5. 





   
