# Voyager

**Current Deployment URL**: (Coming soon...)

Voyager is a route optimization platform built to help users plan efficient store visits based on their current location, real-time traffic, and store opening hours. Voyager ensures maximum store coverage and minimal travel time.

---

## Deployment Notes

Currently, the frontend and backend are under active development. Once deployed, the latest version will automatically reflect on the live site after pushing to the `main` branch.

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- Google Maps API key
- (Optional) Docker, if containerizing

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/brimatt16219/Voyager.git
cd Voyager
```

---

### 2. Frontend Development

Navigate to the frontend directory, install dependencies, and start the React development server:

```bash
cd client
npm install
```

Create a `.env` file in the `client/` directory and add your API key:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

Start the server:

```bash
npm start
```

This will run the frontend at: http://localhost:3000

---

### 3. Backend Development

Navigate to the backend directory and install dependencies:

```bash
cd ../server
npm install
```

Create a `.env` file in the `server/` directory and add your API key:

```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

Start the backend server:

```bash
node index.js
```

The backend will run on: http://localhost:5000

---

## Application Structure

```
Voyager/
├── client/       # React frontend (TypeScript)
├── server/       # Node.js + Express backend
├── .gitignore
└── README.md
```

---

## Tech Stack

### Frontend

- React (TypeScript)
- @react-google-maps/api
- Axios
- React Router DOM (optional)
- Tailwind CSS (optional styling utility)

### Backend

- Node.js
- Express.js
- Google Maps Platform APIs:
  - Places API
  - Distance Matrix API
  - Directions API
- dotenv
- CORS

---

## API Routes (Planned)

```http
GET /api/stores?lat=...&lng=...&chains=[bestbuy,target]
GET /api/optimize-route
```

These endpoints will handle store location retrieval and optimal path calculation.

---

## Authors

### Brian Chang
- GitHub: [@brimatt16219](https://github.com/brimatt16219)
- LinkedIn: [linkedin.com/in/ch4ng](https://www.linkedin.com/in/ch4ng/)
- Email: brimatt062495@gmail.com

### Adam Lim
- GitHub: [@alim04](https://github.com/alim04)
- LinkedIn: [linkedin.com/in/adamdlim](https://www.linkedin.com/in/adamdlim/)
- Email: alim4@ufl.edu

---

## License

This project is licensed under the MIT License.

---

## Deployment (Planned)

Frontend deployment will use Vercel, and backend hosting options may include Render, Railway, or DigitalOcean. Deployment instructions and CI/CD notes will be added after MVP completion.