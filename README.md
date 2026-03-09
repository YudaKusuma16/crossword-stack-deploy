# 🧩 Crossword Stack

<div align="center">

![Crossword Stack](https://img.shields.io/badge/Crossword-Stack-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-19.2-blue)
![Node](https://img.shields.io/badge/Node-18%2B-green)

**A modern full-stack crossword puzzle application**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Deployment](#-deployment) • [API](#-api-endpoints)

</div>

---

## 📖 About

**Crossword Stack** is a full-stack web application that allows users to create and play custom crossword puzzles. Built with a modern microservices architecture, the application separates the frontend, backend API, and database for scalable deployment across multiple platforms.

### Key Highlights

- 🎨 **Modern UI/UX** - Clean, responsive interface built with React and Tailwind CSS
- 🧩 **Smart Puzzle Generation** - Client-side algorithm that automatically generates crossword layouts
- 📱 **Mobile Friendly** - Fully responsive design that works on all devices
- 🔐 **Secure Authentication** - JWT-based authentication system
- 🏆 **Competitive Leaderboards** - Track scores and compete with other players
- 📄 **PDF Export** - Download puzzles as PDF for offline play

---

## ✨ Features

### 🔐 Authentication

| Feature | Description |
|---------|-------------|
| User Registration | Sign up with email, username, and password |
| Secure Login | Login using email or username with JWT tokens |
| Protected Routes | Authenticated-only pages for creators |
| Session Management | Persistent login with localStorage |

### 🎨 Puzzle Creator

| Feature | Description |
|---------|-------------|
| Word & Clue Input | Add custom words with corresponding clues |
| Auto-Layout Generation | Smart algorithm places words optimally on grid |
| Real-time Preview | See your puzzle as you build it |
| Draft Saving | Save works-in-progress as drafts |
| Puzzle Publishing | Publish puzzles for others to play |
| Puzzle History | View and manage all your created puzzles |

### 🎮 Puzzle Player

| Feature | Description |
|---------|-------------|
| Interactive Grid | Click cells to fill in letters |
| Keyboard Navigation | Use arrow keys and Tab for quick navigation |
| Clue Display | View Across and Down clues side-by-side |
| Progress Tracking | Visual progress bar shows completion status |
| Timer | Track your completion time |
| Hints System | Get help when stuck |
| Validation | Check answers and see correct/incorrect cells |
| PDF Export | Download puzzle with clues for offline play |

### 🏆 Social Features

| Feature | Description |
|---------|-------------|
| Public Puzzle Gallery | Browse published puzzles from all users |
| Puzzle Sharing | Share puzzles via unique URL links |
| Leaderboards | Compete for best completion times |
| Score History | Track your personal best scores per puzzle |

---

## 🛠️ Tech Stack

### Frontend

```
React 19.2.0          ──────────────┐
├── Vite 7.3.1                      │ Build Tool
├── React Router 7.13.1             │ Routing
├── Tailwind CSS 3.4.19             │ Styling
├── Radix UI                        │ Component Primitives
│   ├── Dialog                      │   ├─ Modal dialogs
│   ├── Label                       │   ├─ Form labels
│   ├── Scroll Area                 │   ├─ Custom scrollbars
│   ├── Select                      │   ├─ Dropdown selects
│   ├── Switch                      │   ├─ Toggle switches
│   ├── Tabs                        │   └─ Tab navigation
│   └── Toast                       │   └─ Notifications
├── Lucide React                    │ Icons
├── html2pdf.js                     │ PDF Export
└── date-fns                        │ Date Formatting
```

### Backend

```
Express 4.18.2         ──────────────┐
├── mysql2 3.6.0                     │ MySQL Driver
├── bcryptjs 2.4.3                  │ Password Hashing
├── jsonwebtoken 9.0.2              │ JWT Authentication
├── cors 2.8.5                      │ CORS Handling
└── dotenv 16.3.1                   │ Environment Variables
```

### Database

```
MySQL                 ──────────────┐
└── Tables:                        │
    ├── users                     │ User accounts
    ├── puzzles                   │ Puzzle data
    └── puzzle_scores             │ Score records
```

### Deployment Platforms

| Component | Platform | Purpose |
|-----------|----------|---------|
| Frontend | ![Vercel](https://img.shields.io/badge/Vercel-black?style=flat-square&logo=vercel) | Static hosting, CDN |
| Backend | ![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render) | Node.js server |
| Database | ![Clever Cloud](https://img.shields.io/badge/Clever%20Cloud-CC2866?style=flat-square) | MySQL hosting |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm** or **yarn** or **bun**
- **MySQL** (for local development)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/crossword-stack-deploy.git
cd crossword-stack-deploy
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp ../.env.production.example .env

# Edit .env with your database credentials
# For local development, use:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=crossword_stack
JWT_SECRET=your_secret_key

# Start backend server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:3001/api" > .env

# Start frontend dev server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Database Setup (Optional)

The application auto-creates tables on first run. If you prefer manual setup:

```sql
CREATE DATABASE crossword_stack;

USE crossword_stack;

-- Tables will be created automatically by the app
```

---

## 🌐 Deployment

<div align="center">

### Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │     │    Render       │     │  Clever Cloud   │
│  (Frontend)     │────▶│   (Backend)     │────▶│    (MySQL)      │
│  React + Vite   │     │   Express.js    │     │   Database      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

</div>

For detailed deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Start

1. **Database** - Deploy MySQL on Clever Cloud
2. **Backend** - Deploy Express API to Render
3. **Frontend** - Deploy React app to Vercel
4. **Configure** - Set environment variables and CORS

---

## 🔌 API Endpoints

### Authentication

```http
POST   /api/auth/register    Register new user
POST   /api/auth/login       Login user
POST   /api/auth/logout      Logout user
GET    /api/auth/me          Get current user
```

### Puzzles

```http
GET    /api/puzzles                  List all puzzles
GET    /api/puzzles/user/my          Get user's puzzles
GET    /api/puzzles/:id              Get puzzle by ID
POST   /api/puzzles                  Create new puzzle
PUT    /api/puzzles/:id              Update puzzle
DELETE /api/puzzles/:id              Delete puzzle
```

### Scores

```http
POST   /api/scores                   Submit score
GET    /api/scores/puzzle/:id        Get leaderboard
GET    /api/scores/puzzle/:id/user   Get user scores
```

### Health

```http
GET    /health                       Server health check
```

---

## 📁 Project Structure

```
crossword-stack-deploy/
├── backend/
│   ├── api/
│   │   └── index.js              # Vercel serverless handler
│   ├── server.js                 # Express server (Render)
│   ├── config/
│   │   └── database.js           # MySQL config & init
│   ├── controllers/              # Business logic
│   ├── middleware/               # Auth & error handling
│   ├── models/                   # Data models
│   ├── routes/                   # API routes
│   └── utils/                    # JWT utilities
│
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── auth/            # Auth components
│   │   │   ├── creator/         # Puzzle creator
│   │   │   ├── player/          # Puzzle player
│   │   │   ├── layout/          # Layout components
│   │   │   └── ui/              # UI primitives
│   │   ├── contexts/            # React contexts
│   │   ├── hooks/               # Custom hooks
│   │   ├── pages/               # Route pages
│   │   ├── utils/               # Utilities
│   │   │   ├── api.js           # API layer
│   │   │   ├── crosswordAlgorithm.js  # Puzzle gen
│   │   │   └── pdfUtils.js      # PDF export
│   │   └── App.jsx              # Main app
│   └── vite.config.js
│
├── scripts/
│   └── generate-jwt-secret.js
│
├── render.yaml                   # Render config
├── DEPLOYMENT.md                 # Deployment guide
└── README.md                     # This file
```

---

## 🧠 Crossword Algorithm

The application uses a sophisticated client-side algorithm for puzzle generation:

1. **Word Processing** - Clean, validate, and sort words by length
2. **Grid Placement** - Place first word in center, find intersections
3. **Scoring System** - Score placements based on:
   - Intersection count (optimal: 1)
   - Distance from center
   - Area density
   - Outward extension
4. **Retry Logic** - Multiple attempts with shuffled word order
5. **Grid Trimming** - Remove empty rows/columns
6. **Clue Numbering** - Assign numbers per crossword rules

See `frontend/src/utils/crosswordAlgorithm.js` for full implementation.

---

## 🔒 Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=production
PORT=3001

# Database
DB_HOST=xxxxx.mysql.clever-cloud.com
DB_PORT=3306
DB_USER=xxxxx
DB_PASSWORD=xxxxx
DB_NAME=xxxxx
DB_SSL=true

# Authentication
JWT_SECRET=<generate_random_string>
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (.env)

```bash
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guides
- Review the code documentation

---

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component examples

---

<div align="center">

**Built with ❤️ using React, Express, and MySQL**

</div>
