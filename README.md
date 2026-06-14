# Nakama - Anonymous Mental Health Haven

Nakama is a secure, credential-free emotional recovery circle and anonymous shelter designed for peer support, daily mood tracking, and guided mental wellness exercises.

## Features

### 1. Anonymous Forums
Share stories and vulnerabilities without revealing identity. Users can post anonymously, categorized by channels, and interact via comments and nesting replies to offer and receive support. Authors and moderators have permissions to delete posts and comments.

### 2. Mood Tracker and Wellness Dashboard
Log daily emotional states and private journal entries. Generates weekly visual trend charts and breakdowns using Recharts. Users can compile AI-driven coping recommendations based on their journal history.

### 3. Positivity Wall
A shared space for posting gratitude highlights and positive achievements, fostering a community focused on hope and mutual encouragement.

### 4. Habit Path Challenges
Participate in structured multi-day challenges (e.g., meditation, hydration, and sleep hygiene) to build healthy routines. Submitting daily check-ins awards points and unlocks profile badges.

### 5. Peer Support Matchmaker
A modern two-column private chat interface. Users select specific anxiety or stress topics to find compatible companion peers or launch instant auto-matching. Active matched dialogues are accessible instantly from a persistent sidebar, preventing page re-renders.

### 6. Nakama Assistant
An integrated AI companion that offers validation, stress reduction exercises, and journaling prompts. Includes a stateful offline simulation engine as a backup when no API key is supplied.

---

## Tech Stack

### Frontend
- React 19 (Single Page Application)
- Vite (Build Tooling and Dev Server)
- Tailwind CSS v4 (Styling Framework)
- Lucide React (Icon System)
- Recharts (Analytics Data Visualizations)

### Backend
- Node.js (Runtime Environment)
- Express.js (REST API Framework)
- MongoDB / MongoClient (Persistence Layer with Cloud Database Sync)
- Google Gen AI SDK (@google/genai) (Gemini API Integration)

---

## Deployment

### Local Development
To run Nakama locally, execute the following commands in the root directory:
1. Install dependencies for all components:
   ```bash
   npm run install-all
   ```
2. Start the development servers (frontend and backend running concurrently):
   ```bash
   npm run dev
   ```
3. Access the frontend at `http://localhost:5173` and backend at `http://localhost:3000`.

### Production Deployment on Render
To deploy the entire application stack to Render using the included blueprint file:
1. Push this repository to your GitHub account.
2. Go to the Render Dashboard, click "New", and select "Blueprint".
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and create two services: `nakama-backend` (Node Web Service) and `nakama-frontend` (Static Site).
5. In the Render Dashboard, configure the following environment variables:
   - For `nakama-backend`:
     - `MONGODB_URI`: Your MongoDB Atlas connection URI.
     - `GEMINI_API_KEY`: Your Google Gemini API Key.
     - `APP_URL`: The URL of your deployed backend service.
   - For `nakama-frontend`:
     - `VITE_API_URL`: The backend URL followed by `/api` (e.g. `https://nakama-backend.onrender.com/api`).
6. Whitelist Render's outbound IP addresses (or allow access from anywhere `0.0.0.0/0`) in your MongoDB Atlas console.

