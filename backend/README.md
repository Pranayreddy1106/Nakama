# Nakama Backend - API Service

The backend of Nakama is a modular Express.js REST API service that handles authentication, database orchestration, and external AI service integrations.

## Directory Structure

- **`src/config/`**: Database connectors (`db.js`) and AI SDK initializers (`gemini.js`). Maintains a high-resilience local JSON store (`db.json`) that operates concurrently or as a fallback to MongoDB Atlas.
- **`src/controllers/`**: Request handlers processing business logic for features (forums, challenges, chat matching, AI interactions).
- **`src/middleware/`**: Express middleware, including JSON parsing, CORS settings, and JWT verification for route protection (`authMiddleware.js`).
- **`src/routes/`**: Route definitions mapping endpoints to controllers.
- **`src/data/`**: Storage directory containing `db.json` for local data persistence.

---

## API Routes

### Authentication (`/api/auth`)
- `POST /register`: Registers a new anonymous user profile.
- `POST /login`: Log in to an existing profile.
- `GET /profile`: Retrieves user profile points, streaks, and unlocked badges.

### Forum Posts (`/api/posts`)
- `GET /`: Retrieves a paginated list of posts (supports query filters, search, and sorting).
- `GET /:id`: Retrieves details of a specific post.
- `POST /`: Publishes a new forum post.
- `PUT /:id`: Updates an existing post.
- `DELETE /:id`: Deletes a post.
- `POST /:id/support`: Toggles support (likes) for a post.
- `POST /:id/save`: Toggles bookmark status for a post.
- `POST /:id/report`: Reports a post for moderation.
- `POST /analyze-ai`: Analyzes post draft tone and scans for crisis keywords.

### Discussion Comments (`/api/comments`)
- `GET /post/:postId`: Retrieves comments on a specific post.
- `POST /post/:postId`: Adds a comment to a post.
- `DELETE /:id`: Deletes a comment.
- `POST /:commentId/reply`: Submits a nested reply to a comment.

### Mood Logs (`/api/mood`)
- `GET /`: Retrieves chronological mood history logs.
- `POST /`: Submits a daily mood check-in and private journal note.
- `PUT /:id`: Modifies a past mood entry.
- `GET /insights`: Compiles AI weekly wellness guidance based on recent logs.

### Positivity Wall (`/api/gratitude`)
- `GET /`: Retrieves gratitude highlight logs.
- `POST /`: Adds a new gratitude entry.

### Habit Challenges (`/api/challenges`)
- `GET /`: Lists all active habit challenges and user enrollment states.
- `POST /join/:id`: Enrolls user in a specific challenge.
- `POST /checkin/:userChallengeId`: Logs daily progress check-in to build habit streaks.

### Peer Chat & Matchmaker (`/api/chat`)
- `GET /rooms`: Lists all public circles and active private matched dialogue rooms.
- `GET /rooms/:id/messages`: Retrieves message history for a specific room.
- `POST /rooms/:id/messages`: Dispatches a chat message.
- `GET /match/recommendations`: Lists compatible online helper coordinates.
- `POST /match/invite`: Opens a new dialogue room with a recommended companion.
- `POST /rooms/:id/block`: Safely disbands a matched dialogue room.

### Nakama AI Assistant (`/api/ai`)
- `POST /companion`: Sends message prompts to the Nakama Assistant.

### Moderation & Stats (`/api/admin`)
- `GET /reports`: Lists pending moderation report tickets.
- `POST /reports/:id/resolve`: Resolves a report.
- `GET /stats`: Generates public community statistics.

---

## Installation & Running

1. **Install Packages**:
   ```bash
   npm install
   ```
2. **Environment Setup**: Add a `.env` file containing `PORT`, `MONGODB_URI`, and `GEMINI_API_KEY`.
3. **Execution**:
   - Dev Mode (with automatic file-watching):
     ```bash
     npm run dev
     ```
   - Production Start:
     ```bash
     npm start
     ```
