# Nakama Frontend - React Client

The frontend of Nakama is a single-page application built with React 19, Vite, and Tailwind CSS v4, providing a responsive interface for anonymous support.

## Directory Structure

- **`src/app/`**: Core application routing (`router.jsx`) which conditionally renders pages based on hash routing states.
- **`src/components/`**: Feature-specific UI modules:
  - `auth/`: Handles anonymous credentials generation and login flow (`AuthPages.jsx`).
  - `challenges/`: Manages habit challenge displays and progress check-in tracking (`Challenges.jsx`).
  - `chat/`: Houses peer matching columns (`ChatRooms.jsx`) and the Nakama Assistant interface (`AICompanion.jsx`).
  - `common/`: Standard layouts, modals, and base visual grids (Navbar, Footer, Modal, LandingPage).
  - `gratitude/`: Positivity highlights boards (`GratitudeWall.jsx`).
  - `mood/`: Mood journals and charts rendered using Recharts (`MoodDashboard.jsx`).
  - `posts/`: Forums layout, draft analysis controls, and thread details (`ForumFeed.jsx`).
  - `profile/`: Badge lists and account summary parameters (`UserProfile.jsx`).
- **`src/pages/`**: Page-level containers that render feature components.
- **`src/services/`**: Fetch-based API service clients mapped under a single namespace (`index.js`).
- **`src/index.css`**: Design system configuration containing Tailwind theme overrides, dark mode colors, custom typography, and transitions.

---

## Technical Features

### 1. Hash Routing Control
Synchronizes the client-side routes with the browser hash (e.g., `#feed`, `#mood`), enabling responsive navigation without full-page reloads.

### 2. Analytical Data Visualizations
Implements responsive Line and Pie charts using Recharts. Integrates `minWidth: 0` constraints to prevent container width calculation failures inside flex or grid elements.

### 3. Persistent Columns
Maintains chat list sidebar visibility during peer matching operations to enable switching between matched rooms without interrupting page states.

---

## Installation & Running

1. **Install Packages**:
   ```bash
   npm install
   ```
2. **Execution**:
   - Launch Dev Server:
     ```bash
     npm run dev
     ```
   - Compile Production Bundle:
     ```bash
     npm run build
     ```
     Generates optimized static assets in the `dist` directory.
