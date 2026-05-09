# AI Digital Identity Protector

A comprehensive, secure web application with authentication, real-time security monitoring, and admin controls. Built with React, Node.js/Express, MongoDB, and JWT authentication.

![Node.js](https://img.shields.io/badge/Node.js-22-green) ![React](https://img.shields.io/badge/React-19-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-8-brightgreen) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Features

### Authentication System
- User registration with strong password validation
- Login / Logout with JWT tokens
- Password hashing with bcrypt (12 salt rounds)
- "Remember Me" option (extends token to 30 days)
- Account lockout after repeated failed attempts

### User Dashboard
- Personal profile with edit functionality
- Activity log showing login history with device info
- Only authenticated users can access protected routes
- Users can only view and modify their own data

### Unauthorized Access Detection
- Every unauthenticated access attempt is logged with:
  - IP address
  - User agent / device info (browser, OS, device type)
  - Target route and timestamp
- Automatic redirect to login with alert message
- Brute force detection triggers critical security alerts

### Admin Panel
- Overview dashboard with key metrics
- View all registered users
- View login logs (filterable by action type)
- View security alerts (severity-coded)
- Block/unblock users
- Mark alerts as read (individual or bulk)

### Alert System
- Real-time security alerts for:
  - Failed login attempts (escalating severity)
  - Unauthorized access attempts
  - Account lockouts
  - Brute force detection (critical severity)
  - User block/unblock events
- Severity levels: low, medium, high, critical

### Security Features
- **JWT authentication** with configurable expiration
- **bcrypt password hashing** (12 rounds)
- **Rate limiting** on login, registration, and API routes
- **Helmet.js** security headers
- **Input validation** with express-validator
- **Account lockout** after 5 failed attempts (30 min)
- **CORS** protection
- **Request body size limiting** (10kb)
- **Protected routes** preventing direct URL access

### UI / UX
- Dark mode toggle (respects system preference)
- Fully responsive design
- Modern SaaS-style dashboard UI
- Clean typography with Inter font

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite 6, React Router 7   |
| Backend    | Node.js 22, Express 4              |
| Database   | MongoDB (Mongoose 8)               |
| Auth       | JWT (jsonwebtoken), bcryptjs        |
| Icons      | Lucide React                        |
| Security   | Helmet, express-rate-limit, express-validator |
| Dev DB     | mongodb-memory-server (zero setup)  |

---

## Folder Structure

```
AI-Digital-Identity-Protector/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection (with in-memory fallback)
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & unauthorized access logging
│   │   ├── rateLimiter.js     # Rate limiting for login, register, API
│   │   └── validation.js      # Input validation rules
│   ├── models/
│   │   ├── User.js            # User schema with password hashing & lockout
│   │   ├── LoginLog.js        # Login activity log
│   │   └── SecurityAlert.js   # Security alert records
│   ├── routes/
│   │   ├── auth.js            # Register, login, logout endpoints
│   │   ├── user.js            # Profile & activity endpoints
│   │   └── admin.js           # Admin CRUD & stats endpoints
│   ├── utils/
│   │   ├── deviceParser.js    # User-agent parsing for device info
│   │   └── seedAdmin.js       # Database seeding script
│   ├── server.js              # Express app entry point
│   ├── package.json
│   ├── .env.example           # Environment variable template
│   └── .env                   # Local env (gitignored)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertBanner.jsx    # Reusable alert notifications
│   │   │   ├── Navbar.jsx         # Navigation with dark mode toggle
│   │   │   └── ProtectedRoute.jsx # Route guard component
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Authentication state management
│   │   │   └── ThemeContext.jsx   # Dark mode state management
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page with feature showcase
│   │   │   ├── Login.jsx         # Login form with remember me
│   │   │   ├── Register.jsx      # Registration with validation
│   │   │   ├── Dashboard.jsx     # User profile & activity
│   │   │   └── AdminPanel.jsx    # Admin dashboard & management
│   │   ├── services/
│   │   │   └── api.js            # Axios instance & API functions
│   │   ├── App.jsx               # Router & layout
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Complete CSS with dark mode
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Prerequisites
- **Node.js** 18+ (recommended: 22)
- **npm** 8+
- MongoDB is **optional** — the app uses an in-memory database by default for local development

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/misbahhussain434-ctrl/AI-Digital-Identity-Protector.git
cd AI-Digital-Identity-Protector

# 2. Install backend dependencies
cd backend
cp .env.example .env    # Uses default dev settings
npm install

# 3. Start the backend server
npm run dev
# Server starts on http://localhost:5000
# In-memory MongoDB starts automatically
# Default admin account is created on first run

# 4. In a new terminal — install and start the frontend
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:5173
```

### Using a Real MongoDB Instance

To connect to a real MongoDB database, set the `MONGODB_URI` in `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/identity-protector
```

### Seed Additional Test Data

```bash
cd backend
npm run seed
```

---

## Sample Test Accounts

| Role  | Email                         | Password       |
|-------|-------------------------------|----------------|
| Admin | admin@identityprotector.com   | Admin@123456   |
| User  | testuser@example.com          | Test@123456    |

> The admin account is created automatically on server start. The test user is created by the seed script.

---

## API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint    | Description          | Rate Limited |
|--------|-------------|----------------------|:------------:|
| POST   | `/register` | Create new account   | 5/hour       |
| POST   | `/login`    | Authenticate user    | 10/15min     |
| POST   | `/logout`   | Log out user         | No           |

### User Routes (`/api/user`) — requires authentication
| Method | Endpoint    | Description              |
|--------|-------------|--------------------------|
| GET    | `/profile`  | Get current user profile |
| PUT    | `/profile`  | Update user name         |
| GET    | `/activity` | Get login activity log   |

### Admin Routes (`/api/admin`) — requires admin role
| Method | Endpoint                | Description               |
|--------|-------------------------|---------------------------|
| GET    | `/users`                | List all users            |
| GET    | `/login-logs`           | View login logs           |
| GET    | `/alerts`               | View security alerts      |
| GET    | `/stats`                | Get dashboard statistics  |
| PATCH  | `/users/:id/block`      | Block a user              |
| PATCH  | `/users/:id/unblock`    | Unblock a user            |
| PATCH  | `/alerts/:id/read`      | Mark alert as read        |
| PATCH  | `/alerts/read-all`      | Mark all alerts as read   |

### Health Check
| Method | Endpoint       | Description         |
|--------|----------------|---------------------|
| GET    | `/api/health`  | Server status check |

---

## How Security Works

### Authentication Flow
1. User submits credentials → server validates with bcrypt
2. On success → JWT token generated and returned
3. Token stored in localStorage, sent as `Bearer` token in headers
4. Protected routes check token via middleware before allowing access

### Unauthorized Access Detection
1. Request hits protected route without valid token
2. Middleware logs the attempt (IP, device, route, timestamp)
3. Security alert created in database
4. Client receives 401 with "Unauthorized access detected" message
5. Frontend redirects to login with warning banner

### Brute Force Protection
1. Each failed login increments the user's `failedLoginAttempts` counter
2. After 5 failures → account locked for 30 minutes
3. Critical security alert generated for admin review
4. Rate limiter also blocks excessive requests from same IP

### Admin Monitoring
1. Admin dashboard shows real-time stats (users, logins, alerts)
2. Login logs track every auth event with full device fingerprint
3. Security alerts are severity-coded (low → critical)
4. Admins can block/unblock suspicious users

---

## Environment Variables

| Variable                       | Default                        | Description                        |
|--------------------------------|--------------------------------|------------------------------------|
| `PORT`                         | `5000`                         | Backend server port                |
| `NODE_ENV`                     | `development`                  | Environment mode                   |
| `MONGODB_URI`                  | *(empty = in-memory)*          | MongoDB connection string          |
| `JWT_SECRET`                   | *(set in .env)*                | JWT signing secret                 |
| `JWT_EXPIRES_IN`               | `7d`                           | Default token expiration           |
| `ADMIN_EMAIL`                  | `admin@identityprotector.com`  | Default admin email                |
| `ADMIN_PASSWORD`               | `Admin@123456`                 | Default admin password             |
| `MAX_LOGIN_ATTEMPTS`           | `5`                            | Rate limit for login               |
| `LOGIN_WINDOW_MINUTES`         | `15`                           | Rate limit window                  |
| `FAILED_LOGIN_ALERT_THRESHOLD` | `5`                            | Failed attempts before lockout     |

---

## License

MIT
