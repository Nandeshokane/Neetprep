# NEETPrep — NEET Previous Year Question Practice

A full-stack web application for practicing NEET previous year questions with smart tracking, bookmarks, and performance analytics.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS v4
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (JSON Web Tokens)

## Features

- 📚 Questions categorized by **Year**, **Subject**, and **Chapter**
- 🧪 **Quiz Mode** with one MCQ at a time and instant feedback
- 💡 **Explanations** with expandable sections and external links
- 📊 **Score Tracking** with accuracy percentage and history
- ⏱️ **Optional Timer** for timed practice sessions
- 🔐 **User Authentication** (JWT-based login/signup)
- 🌙 **Dark Mode** toggle
- 📱 **Mobile Responsive** design
- 🔖 **Bookmark** questions for later review
- 🔁 **Retry** incorrect questions
- 📈 **Dashboard** with stats, bookmarks, and quiz history

## Folder Structure

```
neet-prctise/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── data/            # Seed data & script
│   ├── middleware/       # JWT auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── .env             # Environment variables
│   ├── server.js        # Express entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios API client
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth & Theme context
│   │   ├── pages/       # Page components
│   │   ├── App.jsx      # Root component
│   │   ├── main.jsx     # Entry point
│   │   └── index.css    # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Prerequisites

- **Node.js** (v18 or later)
- **MongoDB** (local instance or MongoDB Atlas)

## Getting Started

### 1. Clone & Setup

```bash
cd "neet prctise"
```

### 2. Start MongoDB

Make sure MongoDB is running locally on `mongodb://localhost:27017`.

On Windows, start the MongoDB service or run:
```bash
mongod
```

### 3. Backend Setup

```bash
cd backend
npm install
```

**Seed the database** with 25 sample NEET questions:
```bash
npm run seed
```

**Start the backend server:**
```bash
npm run dev
```

The API server will start at `http://localhost:5000`.

### 4. Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

### 5. Switch to MongoDB Atlas (Production)

To use MongoDB Atlas instead of a local instance:

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/neet-practice?retryWrites=true&w=majority
   ```
4. Re-run the seed script and restart the server

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | Get questions (with filters) |
| GET | `/api/questions/filters` | Get available filter options |
| GET | `/api/questions/:id` | Get single question |
| POST | `/api/questions/by-ids` | Get questions by IDs |

### User (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/progress` | Save quiz result |
| GET | `/api/user/stats` | Get user stats |
| POST | `/api/user/bookmark/:id` | Toggle bookmark |
| GET | `/api/user/bookmarks` | Get bookmarked question IDs |
| GET | `/api/user/incorrect` | Get incorrect question IDs |
| POST | `/api/user/incorrect/clear` | Clear incorrect questions |

## Sample Data

The app comes with **25 sample NEET questions** across:
- **Physics** (8): Laws of Motion, Gravitation, Thermodynamics, Optics, EMI, Current Electricity, Semiconductors, Wave Optics
- **Chemistry** (7): Chemical Bonding, Periodic Table, Organic Chemistry, Chemical Kinetics, Electrochemistry, Solutions, Thermodynamics, Coordination Compounds
- **Biology** (10): Cell Biology, Genetics, Human Physiology, Ecology, Molecular Biology, Plant Physiology, Reproduction, Evolution, Biotechnology

## License

MIT
