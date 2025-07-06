# Voyager

**Current Deployment URL**: (Coming soon...)

Voyager is a route optimization platform built to help users plan efficient store visits based on their current location, real-time traffic, and store opening hours. Voyager ensures maximum store coverage and minimal travel time using advanced route optimization algorithms.

---

## 🚀 Features

### ✅ Implemented Features
- **Real-time Location Detection**: Automatically detects user's current location using browser geolocation
- **Store Search**: Find nearby stores by brand name (e.g., "Target", "Best Buy") within a specified radius
- **Route Optimization**: Uses 2-opt algorithm to find the most efficient route between stores
- **Interactive Map**: Google Maps integration with custom markers and turn-by-turn directions
- **Route Flow Chart**: Visual representation of the optimized route with step-by-step directions
- **Real-time Traffic**: Considers current traffic conditions for accurate travel times
- **Responsive Design**: Modern UI built with Tailwind CSS that works on desktop and mobile

### 🎯 Key Capabilities
- Search for multiple store chains simultaneously
- Customizable search radius (in miles)
- Optimized route calculation with arrival time estimates
- Interactive route visualization with clickable stops
- Detailed turn-by-turn navigation instructions

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **React Router DOM** for navigation
- **@react-google-maps/api** for Google Maps integration
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Advanced Google Maps Markers** for enhanced map experience

### Backend
- **Node.js** with Express.js
- **Google Maps Platform APIs**:
  - Places API (Nearby Search)
  - Distance Matrix API
  - Directions API
- **CORS** for cross-origin requests
- **dotenv** for environment management

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- Google Maps API key with the following APIs enabled:
  - Places API
  - Distance Matrix API
  - Directions API
  - Maps JavaScript API

---

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/brimatt16219/Voyager.git
cd Voyager
```

### 2. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd client
npm install
```

Create a `.env` file in the `client/` directory:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_GOOGLE_MAPS_MAP_ID=your_map_id_here
```

Start the development server:

```bash
npm run dev
```

The frontend will run at: http://localhost:5173

### 3. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd ../server
npm install
```

Create a `.env` file in the `server/` directory:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
PORT=5000
```

Start the backend server:

```bash
node index.js
```

The backend will run at: http://localhost:5000

---

## 🏗️ Application Structure

```
Voyager/
├── client/                 # React frontend (TypeScript)
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Map.tsx     # Google Maps integration
│   │   │   ├── FlowChart.tsx # Route visualization
│   │   │   └── RouteMap.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── Home.tsx    # Landing page
│   │   │   └── App.tsx     # Main application
│   │   └── main.tsx        # App entry point
│   └── package.json
├── server/                 # Node.js + Express backend
│   ├── index.js           # Main server file
│   └── package.json
└── README.md
```

---

## 🔌 API Endpoints

### GET `/api/stores`
Fetches nearby stores based on location and brand names.

**Parameters:**
- `lat` (number): Latitude of search center
- `lng` (number): Longitude of search center
- `chains` (string): Comma-separated store brand names
- `radius` (number): Search radius in meters

**Response:**
```json
[
  {
    "name": "Target",
    "lat": 28.5383,
    "lng": -81.3792,
    "place_id": "ChIJ...",
    "address": "123 Main St, Orlando, FL"
  }
]
```

### POST `/api/optimize-route`
Optimizes the route between stores using 2-opt algorithm.

**Request Body:**
```json
{
  "start": {
    "lat": 28.5383,
    "lng": -81.3792
  },
  "stores": [
    {
      "name": "Target",
      "lat": 28.5383,
      "lng": -81.3792,
      "place_id": "ChIJ...",
      "address": "123 Main St"
    }
  ]
}
```

**Response:**
```json
{
  "order": [
    {
      "place_id": "ChIJ...",
      "arrival_time": "2024-01-15T10:30:00.000Z",
      "coords": {
        "lat": 28.5383,
        "lng": -81.3792
      }
    }
  ]
}
```

---

## 🎯 How It Works

1. **Location Detection**: The app automatically detects the user's current location
2. **Store Search**: Users enter store brand names and search radius
3. **Store Discovery**: Backend queries Google Places API to find nearby stores
4. **Route Optimization**: 2-opt algorithm calculates the most efficient route
5. **Traffic Integration**: Real-time traffic data is incorporated for accurate timing
6. **Visualization**: Interactive map and flow chart display the optimized route
7. **Navigation**: Turn-by-turn directions are provided for each leg of the journey

---

## 🔧 Development

### Available Scripts

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

**Backend:**
```bash
node index.js    # Start server
```

### Environment Variables

**Frontend (.env):**
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `VITE_GOOGLE_MAPS_MAP_ID`: Google Maps Map ID (optional)

**Backend (.env):**
- `GOOGLE_MAPS_API_KEY`: Google Maps API key
- `PORT`: Server port (default: 5000)

---

## 👥 Authors

### Brian Chang
- GitHub: [@brimatt16219](https://github.com/brimatt16219)
- LinkedIn: [linkedin.com/in/ch4ng](https://www.linkedin.com/in/ch4ng/)
- Email: brimatt062495@gmail.com

### Adam Lim
- GitHub: [@alim08](https://github.com/alim08)
- LinkedIn: [linkedin.com/in/adamdlim](https://www.linkedin.com/in/adamdlim/)
- Email: alim4@ufl.edu

---

## 📄 License

This project is licensed under the MIT License.

---

## 🚀 Deployment (Planned)

- **Frontend**: Vercel deployment
- **Backend**: Render, Railway, or DigitalOcean
- **CI/CD**: Automatic deployment on push to main branch

Deployment instructions and production configuration will be added after MVP completion.