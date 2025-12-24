# Retro Notes (MERN)

A retro-styled note-taking app with user registration/login and per-user notes.

## Features
- Login with email or username + password
- Registration with full name, date of birth, email, username, password
- Username collision check
- Notes are scoped to the logged-in user

## Tech Stack
- Client: React + Vite
- Server: Node + Express + MongoDB (Mongoose)

## Local Setup
### Prerequisites
- Node.js 18+
- A MongoDB database (Atlas or local)

### 1) Install dependencies
```bash
cd server
npm install
```

```bash
cd client
npm install
```

### 2) Configure environment variables
1. Open `/.env.example` and fill in your values.
2. Paste the server values into `server/.env`.
3. Paste the client values into `client/.env`.

Example:
```bash
# server/.env
ATLAS_URI=your-mongodb-connection-string
PORT=5000
```

```bash
# client/.env
VITE_API_URL=http://localhost:5000/api
```

### 3) Run locally
```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

Open the client URL shown in the terminal (usually `http://localhost:5173`).

## Deploying
- Server: set `ATLAS_URI` (and optional `PORT`) in the server environment.
- Client: build with `VITE_API_URL` pointing to your deployed server API.

Example build:
```bash
cd client
npm run build
```

Host the `client/dist` output on your static hosting platform.

## License
See `LICENSE`.
