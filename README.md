# Event Management Platform

A full-featured event management web app built with React, demonstrating modern patterns including routing with loaders/actions, TanStack Query, Redux Toolkit, and advanced hooks.

## Features

- **Events Discovery** — Browse, search, filter, and sort events with optimistic favorites
- **Event Details** — Loader-based data fetching with deferred reviews & recommendations
- **Booking Flow** — 3-step wizard with `useReducer`, form validation, and optimistic UI
- **My Bookings** — View, filter (upcoming/past/cancelled), and cancel with rollback
- **Create Event** — Multi-step form with Redux Toolkit and localStorage draft saving
- **Profile** — User preferences with theme toggle
- **Theme** — Light/dark mode persisted to localStorage

## Tech Stack

- React 19 + Vite
- React Router v7 (loaders, actions, defer, errorElement)
- TanStack Query (server state & mutations)
- Redux Toolkit (event creation wizard)
- Context API (theme & auth)
- JSON Server (REST API mock)

## Prerequisites

- Node.js 18+
- npm

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd event-management2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the app** (runs JSON Server on port 3001 and Vite on port 5173)
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start JSON Server + Vite dev server |
| `npm run server` | Start JSON Server only (port 3001) |
| `npm run dev:client` | Start Vite only |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## API Endpoints (JSON Server)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List all events |
| GET | `/events/:id` | Get event by ID |
| POST | `/events` | Create new event |
| GET | `/bookings?userId=user1` | Get user bookings |
| POST | `/bookings` | Create booking |
| PATCH | `/bookings/:id` | Update booking (cancel) |
| GET | `/users/:id` | Get user profile |
| PATCH | `/users/:id` | Update user preferences |

## Routes

| Path | Page |
|------|------|
| `/` | Events listing |
| `/events/:id` | Event details |
| `/book/:eventId` | Booking flow |
| `/my-bookings` | User bookings |
| `/create-event` | Create event wizard |
| `/profile` | User preferences |

## State Management

| State Type | Tool | Usage |
|------------|------|-------|
| Server state | TanStack Query | Events, bookings, user data |
| Complex form | Redux Toolkit | Event creation wizard |
| Global UI | Context | Theme, auth |
| Local UI | useState/useReducer | Filters, booking steps |

## Project Structure

```
src/
├── api/           # API client
├── components/    # Shared UI components
├── contexts/      # Theme & Auth providers
├── lib/           # Query client config
├── pages/         # Route pages
├── routes/        # Router, loaders, actions
├── store/         # Redux slices
└── main.jsx       # App entry point
db.json            # JSON Server data
```

## Simulated User

The app uses a mock authenticated user:
- **ID:** user1
- **Name:** John Doe
- **Email:** john@example.com
