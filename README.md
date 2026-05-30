# Voyager

**Live App**: https://voyager-rose-seven.vercel.app/

Voyager is a multi-stop retail route optimizer. Sign in with Google, search for nearby store chains, and get an optimized driving route with real-time traffic, turn-by-turn directions, and automatic voyage history saved to your account.

---

## Features

- **Google OAuth** — Sign in with Google, voyages auto-saved to your account
- **Smart Store Search** — Google Places-powered chain search with chip selection (up to 20 stores)
- **Route Optimization** — Nearest Neighbor seeding + 2-Opt local search for near-optimal TSP solutions
- **Real-time Traffic** — Distance Matrix API factors in live traffic for accurate arrival times
- **Turn-by-turn Directions** — Expandable per-stop directions in the route flowchart
- **Voyage History** — Profile page with lifetime stats (total voyages, distance, drive time)
- **Mobile Responsive** — Bottom tab navigation on mobile (Search / Map / Route)
- **PWA** — Installable on mobile via browser prompt

---

## Tech Stack

### Frontend
- **React 19** + TypeScript + Vite
- **Firebase SDK** — Google Auth + Firestore
- **React Router v6** + **TanStack Query**
- **Zustand** for client state
- **@react-google-maps/api** — Maps, Directions, Places Autocomplete
- **vite-plugin-pwa** — Service worker + web manifest

### Backend
- **Node.js** + Express
- **Firebase Admin SDK** — ID token verification, Firestore reads/writes
- **Google Maps Platform** — Places API, Distance Matrix API, Directions API

### Infrastructure
- **Vercel** — Frontend hosting (auto-deploy from `main`)
- **Railway** — Backend hosting (auto-deploy from `main`)
- **GitHub Actions** — CI/CD: lint → build → deploy on push to `main`, GitHub Release on `v*` tags

---

## Getting Started

### Prerequisites
- Node.js v18+
- Google Maps API key with these APIs enabled:
  - Maps JavaScript API
  - Places API
  - Distance Matrix API
  - Directions API
- Firebase project with Google Auth and Firestore enabled

### 1. Clone

```bash
git clone https://github.com/brimatt16219/Voyager.git
cd Voyager
```

### 2. Frontend setup

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=your_key
VITE_GOOGLE_MAPS_MAP_ID=your_map_id
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=
```

> Leave `VITE_API_URL` empty for local dev — Vite proxies `/api` to `localhost:5000` automatically.

```bash
npm run dev
```

### 3. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
GOOGLE_MAPS_API_KEY=your_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PORT=5000
```

```bash
node index.js
```

---

## Project Structure

```
Voyager/
├── client/                        # React frontend
│   ├── public/icons/              # PWA icons
│   ├── src/
│   │   ├── api/voyager.ts         # API calls (stores, optimize, save, profile)
│   │   ├── components/
│   │   │   ├── ChainPicker.tsx    # Google Places chain search + chips
│   │   │   ├── FlowChart.tsx      # Route timeline with turn-by-turn
│   │   │   ├── Map.tsx            # Google Maps + Directions renderer
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useGeolocation.ts
│   │   │   ├── useIsMobile.ts
│   │   │   ├── useRouteOptimizer.ts
│   │   │   └── useStoreSearch.ts
│   │   ├── pages/
│   │   │   ├── Home.tsx           # Landing + sign-in page
│   │   │   ├── AppPage.tsx        # Main app (desktop + mobile layouts)
│   │   │   └── ProfilePage.tsx    # Voyage history + lifetime stats
│   │   └── store/useVoyagerStore.ts
│   └── vite.config.ts
├── server/
│   ├── middleware/auth.js         # Firebase token verification
│   ├── index.js                   # Express server + all API routes
│   └── railway.toml
├── .github/workflows/deploy.yml   # CI/CD pipeline
└── vercel.json
```

---

## API Endpoints

### `GET /api/stores`
Find nearby stores by chain name.

| Param | Type | Description |
|-------|------|-------------|
| `lat` | number | Latitude |
| `lng` | number | Longitude |
| `chains` | string | Comma-separated chain names |
| `radius` | number | Radius in meters (max ~32,000) |

### `POST /api/optimize-route`
Optimize a route through up to 20 stores using Nearest Neighbor + 2-Opt.

```json
{
  "start": { "lat": 26.35, "lng": -80.14 },
  "stores": [{ "name": "Target", "lat": 26.36, "lng": -80.15, "place_id": "..." }]
}
```

### `POST /api/voyages` *(auth required)*
Save a completed voyage to Firestore and atomically update user lifetime stats.

### `GET /api/profile/:userId`
Return a user's profile doc and last 20 voyages.

### `GET /api/health`
Health check — returns `{ "status": "ok" }`.

---

## How the Route Optimizer Works

1. Fetch real driving distances between all locations via Distance Matrix API (single API call)
2. Build a complete distance matrix (N+1 × N+1, start location + all stores)
3. **Nearest Neighbor** greedy seed — start from user position, always go to the closest unvisited store
4. **2-Opt local search** — iteratively check all segment reversals; accept any that reduce total distance; repeat until no improvement
5. Build the final route with the Google Directions API using the optimized waypoint order

This produces near-optimal routes for up to 20 stops in ~50ms.

---

## Firestore Data Model

```
users/{uid}
  uid, email, displayName, photoURL, createdAt
  totalVoyages, totalDistanceMeters, totalDurationSeconds

voyages/{voyageId}
  userId, createdAt, startLocation: {lat, lng}
  stores: Store[], routeOrder: RouteStop[]
  stats: { total_distance_meters, total_duration_seconds, optimization_time_ms }
```

---

## Deployment

| Service | Target | Trigger |
|---------|--------|---------|
| Vercel | Frontend | Push to `main` |
| Railway | Backend | Push to `main` |
| GitHub Release | Changelog | Push `v*` tag |

GitHub Actions secrets required: `VERCEL_TOKEN`, `RAILWAY_TOKEN`, and all `VITE_*` env vars.

---

## Authors

### Brian Chang
- GitHub: [@brimatt16219](https://github.com/brimatt16219)
- LinkedIn: [linkedin.com/in/ch4ng](https://www.linkedin.com/in/ch4ng/)
- Email: brimatt062495@gmail.com

### Adam Lim
- GitHub: [@alim08](https://github.com/alim08)
- LinkedIn: [linkedin.com/in/adamdlim](https://www.linkedin.com/in/adamdlim/)
- Email: alim4@ufl.edu

---

## License

MIT
