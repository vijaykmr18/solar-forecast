# ☀️ SolarForecast — AI-Powered Solar Output Prediction

A production-ready web application for forecasting solar panel energy output. Built with Next.js, MongoDB, and OpenRouter AI.

## Features

- **Authentication** — Secure JWT-based login/register with httpOnly cookies
- **AI Forecasting** — OpenRouter-powered hourly, daily, and annual solar output predictions
- **Interactive Charts** — Recharts-powered visualizations (hourly curve, daily bars, monthly trend)
- **CO₂ & Savings Analysis** — Automatic carbon offset and financial ROI estimates
- **Forecast History** — All forecasts stored per-user in MongoDB
- **Minimalist UI** — Dark theme with Syne + DM Sans typography

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (Pages Router) |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas |
| Auth | JWT (jose) + bcryptjs |
| AI | OpenRouter (Llama 3.1 8B free) |
| Charts | Recharts |
| Deployment | Vercel Serverless |

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/solar-forecast.git
cd solar-forecast
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGO_URI=Your URL here 
MONGO_DB_NAME=SolarPower
OPENROUTER_API_KEY=sk-or-v1-your-key-here
JWT_SECRET=your-long-random-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **MongoDB DB Name**: The name `Solar*Power` contains `*` which MongoDB doesn't allow in database names. Use `SolarPower` instead.

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Run development server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Deploy to Vercel

### Option A: Vercel CLI (fastest)

```bash
npm install -g vercel
vercel login
vercel

# Set environment variables:
vercel env add MONGO_URI
vercel env add MONGO_DB_NAME
vercel env add OPENROUTER_API_KEY
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production:
vercel --prod
```

### Option B: GitHub + Vercel Dashboard

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit: Solar Forecast App"
git remote add origin https://github.com/YOUR_USERNAME/solar-forecast.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo

3. In Vercel project settings → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | `URL` |
| `MONGO_DB_NAME` | `SolarPower` |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` |
| `JWT_SECRET` | `your-random-64-char-string` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

4. Click **Deploy** ✅

---

## MongoDB Atlas Setup

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. In your cluster, go to **Network Access** → Add IP `0.0.0.0/0` (allow all for Vercel)
3. Collections will be created automatically on first use:
   - `users` — user accounts
   - `forecasts` — saved forecasts

---

## Project Structure

```
solar-forecast/
├── components/
│   ├── charts/
│   │   ├── HourlyChart.js      # Area chart for hourly output
│   │   ├── DailyChart.js       # Bar chart for 30-day forecast
│   │   └── MonthlyChart.js     # Line chart for annual view
│   ├── ForecastCard.js         # Forecast list item card
│   ├── Layout.js               # Page wrapper with navbar
│   ├── Navbar.js               # Top navigation
│   └── StatCard.js             # Dashboard metric card
├── lib/
│   ├── auth.js                 # JWT sign/verify/middleware
│   ├── mongodb.js              # MongoDB connection pool
│   └── openrouter.js           # AI forecast generation
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.js        # POST /api/auth/login
│   │   │   ├── register.js     # POST /api/auth/register
│   │   │   ├── logout.js       # POST /api/auth/logout
│   │   │   └── me.js           # GET /api/auth/me
│   │   └── forecast/
│   │       ├── index.js        # GET/POST /api/forecast
│   │       ├── [id].js         # GET/DELETE /api/forecast/:id
│   │       └── generate.js     # POST /api/forecast/generate (AI)
│   ├── forecast/
│   │   ├── new.js              # /forecast/new - creation form
│   │   └── [id].js             # /forecast/:id - detail view
│   ├── _app.js
│   ├── 404.js
│   ├── dashboard.js            # /dashboard - main view
│   └── index.js                # / - login/register
├── styles/globals.css
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vercel.json
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | No | Logout (clears cookie) |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/forecast` | Yes | List user's forecasts |
| POST | `/api/forecast` | Yes | Save forecast |
| GET | `/api/forecast/:id` | Yes | Get forecast details |
| DELETE | `/api/forecast/:id` | Yes | Delete forecast |
| POST | `/api/forecast/generate` | Yes | AI-generate forecast |

---

## Credits

Built during internship at **Edunet Foundation**.  
ML insights: 35% noise reduction, ~18% RMSE improvement via cross-validation.

---

## License

MIT
# solar-forecast
