# FLEXI – Full-Stack Freelancing Platform

FLEXI connects **freelancers** (who want work) with **clients** (who want to hire). Freelancers build profiles and apply to projects with a proposal and price. Clients post projects, review proposals and hire.

Built with the **MERN** stack: MongoDB, Express.js, React, Node.js. All data lives in MongoDB. Nothing is stored in hard-coded arrays or localStorage (only the login token is kept in the browser).

---

## 1. Features

**Freelancer:** register/login, profile (photo, headline, bio, skills, experience, education, portfolio, hourly rate, availability), browse and filter projects, apply with proposal + price, track application status, in-app hiring notifications, ongoing and completed projects, profile-completion meter.

**Client:** register/login, company profile, post / edit / delete projects, search freelancers (name, skill, experience, rate), view profiles and portfolios, review proposals, accept or reject, hire (project becomes *In progress*), mark *Completed* or *Cancelled*.

**Site:** sticky navbar, dark/light theme switch, live project board in the hero, animated counters from the database, popular categories, services, project cost estimator, process, testimonials, FAQ accordion, contact form (saved in MongoDB), responsive design, loading / empty / error states.

## 2. Folder structure

```
flexi/
├── README.md
├── .gitignore
├── server/                  <- Node.js + Express + MongoDB (API)
│   ├── server.js            Starts the app, connects DB, mounts routes
│   ├── .env.example         Template for your secrets
│   ├── config/db.js         MongoDB connection
│   ├── models/              Mongoose schemas: User, Project, Application, Notification, Contact
│   ├── controllers/         The logic behind each endpoint
│   ├── routes/              Maps URLs to controllers
│   ├── middleware/          auth (JWT + roles), sanitize, error handler
│   └── utils/               helpers, seed.js (demo data)
└── client/                  <- React (Vite) frontend
    ├── index.html, vite.config.js, .env.example
    └── src/
        ├── main.jsx, App.jsx    Entry point and all page routes
        ├── index.css            The whole design system (light + dark)
        ├── components/          Navbar, Footer, cards, forms, estimator ...
        ├── pages/               One file per page
        ├── layouts/             MainLayout (navbar + page + footer)
        ├── context/             AuthContext (login state), ThemeContext
        ├── services/api.js      One function that talks to the backend
        ├── hooks/               useFetch, useDebounce
        └── utils/format.js      Money/date helpers, category list
```

## 3. Prerequisites

- **Node.js 18+** (check: `node -v`)
- **MongoDB Community Server** running locally – https://www.mongodb.com/try/download/community
- **MongoDB Compass** (GUI) – https://www.mongodb.com/try/download/compass

## 4. Setup and run

Open **two terminals**.

**Terminal 1 – backend**
```bash
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env
# open .env and set JWT_SECRET to any long random text
npm run seed                # optional: inserts demo users/projects
npm run dev                 # API on http://localhost:5000
```

**Terminal 2 – frontend**
```bash
cd client
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev                 # website on http://localhost:5173
```
Open http://localhost:5173.

**Demo accounts** (after `npm run seed`, password `Password123`):

| Role | Email |
|---|---|
| Freelancer | `freelancer1@flexi.dev` (…up to `freelancer6`) |
| Client | `client1@flexi.dev`, `client2@flexi.dev` |

## 5. Environment variables

`server/.env`

| Name | Meaning |
|---|---|
| `PORT` | API port (5000) |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/flexi` for local MongoDB |
| `JWT_SECRET` | Secret used to sign login tokens. Keep private. |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | Frontend URL(s) allowed by CORS |

`client/.env` → `VITE_API_URL=http://localhost:5000/api`

## 6. MongoDB and Compass

1. Install and start MongoDB (Windows: it runs as a service; macOS: `brew services start mongodb-community`; Linux: `sudo systemctl start mongod`).
2. Open **MongoDB Compass** → connection string `mongodb://127.0.0.1:27017` → **Connect**.
3. After starting the backend, the database **flexi** appears with collections `users`, `projects`, `applications`, `notifications`, `contacts`.

**Verify that data is really saved:**

| Action on the website | Check in Compass |
|---|---|
| Register a new account | `flexi → users`: new document. `passwordHash` starts with `$2a$` (never plain text) |
| Edit profile | Same user document: `skills`, `hourlyRate`, `bio` updated, `updatedAt` changes |
| Post a project (client) | `flexi → projects`: new document with `clientId`, `status: "open"` |
| Apply to a project (freelancer) | `flexi → applications`: `status: "pending"` |
| Accept the application (client) | application → `accepted`, project → `in-progress` and `hiredFreelancerId` set; a document in `notifications` |
| Send the home-page contact form | `flexi → contacts` |

Click the refresh button in Compass after each action.

## 7. API documentation

Send the token as `Authorization: Bearer <token>`. Errors look like `{ "message": "..." }`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | `{name,email,password,role}` → `{token,user}` |
| POST | `/api/auth/login` | public | `{email,password}` → `{token,user}` |
| GET | `/api/auth/me` | logged in | Current user |
| GET | `/api/freelancers` | public | Query: `q, skill, minRate, maxRate, minExp, availability, sort, page, limit` |
| GET | `/api/freelancers/:id` | public | Profile (email shown only to clients) |
| PUT | `/api/freelancers/profile` | logged in | Update **own** profile (freelancer or client fields) |
| GET | `/api/projects` | public | Query: `q, category, skill, minBudget, maxBudget, sort, status, page, limit` |
| GET | `/api/projects/:id` | public | Project details |
| GET | `/api/projects/mine` | client | Own projects + application counts |
| GET | `/api/projects/hired` | freelancer | Projects I was hired for |
| POST | `/api/projects` | client | Create project |
| PUT | `/api/projects/:id` | owner | Edit (open only) or change status (`completed`/`cancelled`) |
| DELETE | `/api/projects/:id` | owner | Delete |
| GET | `/api/projects/:id/applications` | owner | Proposals for my project |
| POST | `/api/applications` | freelancer | `{projectId,proposal,proposedBudget}` |
| GET | `/api/applications/my` | freelancer | My applications (`status, page, limit`) |
| PATCH | `/api/applications/:id/status` | owner | `{status:"accepted"|"rejected"}` |
| GET | `/api/notifications` | logged in | My notifications + unread count |
| PATCH | `/api/notifications/read-all` | logged in | Mark all read |
| GET | `/api/stats` | public | Counts for the home page |
| POST | `/api/contact` | public | Home-page contact form |

Status codes: 200/201 success, 400 validation, 401 not logged in / bad or expired token, 403 wrong role or not the owner, 404 not found, 409 duplicate (email or application).

## 8. Database schema

- **User**: `name, email (unique), passwordHash, role, profilePicture, headline, bio, skills[], experience, education, portfolio[{title,url}], hourlyRate, availability, company, location, createdAt, updatedAt`
- **Project**: `title, description, category, requiredSkills[], budget, deadline, clientId → User, hiredFreelancerId → User, status (open | in-progress | completed | cancelled), timestamps`
- **Application**: `projectId → Project, freelancerId → User, proposal, proposedBudget, status (pending | accepted | rejected), timestamps`. A **unique index** on `(projectId, freelancerId)` blocks duplicate applications.
- **Notification**: `userId, message, link, read`
- **Contact**: `name, email, projectType, budgetRange, summary`

## 9. Security (what to explain in your viva)

- Passwords are hashed with bcrypt (`bcryptjs`, same algorithm, no native build step) and never returned in responses.
- Login returns a **JWT**. `protect` middleware verifies it; `authorize('client')` enforces roles.
- Ownership checks: only the project owner can edit, delete, view proposals or accept/reject.
- Input validation in controllers + Mongoose schemas; `sanitize` middleware strips `$` operators (NoSQL injection).
- `helmet` security headers, CORS limited to `CLIENT_URL`, secrets only in `.env`.
- Expired/invalid tokens return clear 401 messages; the central error handler never leaks stack traces.

## 10. What the main files do

| File | Purpose |
|---|---|
| `server/server.js` | Creates the Express app, adds middleware, mounts `/api/...` routes, connects MongoDB |
| `server/models/*.js` | Define what each document looks like and the validation rules |
| `server/controllers/*.js` | The real work: validate → query MongoDB → send JSON |
| `server/middleware/auth.js` | Reads the token, finds the user, checks roles |
| `server/utils/seed.js` | Fills the database with demo data |
| `client/src/services/api.js` | Every `fetch` call goes through here and adds the token |
| `client/src/context/AuthContext.jsx` | Keeps the logged-in user; restores it after refresh via `/auth/me` |
| `client/src/components/ProtectedRoute.jsx` | Blocks pages by login and role |
| `client/src/hooks/useFetch.js` | Loads data and gives `{data, loading, error}` |
| `client/src/pages/Home.jsx` | The landing page with all sections |
| `client/src/index.css` | All styling; colours are variables so dark mode is just a second set |

## 11. Testing checklist

1. Register a **client** → profile page opens → save it.
2. Post a project → appears in *My projects* and in Compass.
3. Log out. Register a **freelancer**, complete the profile (watch the completion % grow).
4. Browse projects, filter by category/budget, open one, **apply**. Try applying twice → error.
5. Log in as the client → *Applications* → **Accept**. Project is *In progress*; other proposals are rejected.
6. Log in as the freelancer → bell shows a notification; *My projects* shows the job.
7. Client marks the project **Completed**.
8. Security: as a freelancer open `/post-project` → redirected. In Postman call `POST /api/projects` with a freelancer token → 403.
9. Refresh any page → you stay logged in and data remains.
10. Resize the browser / use dev-tools mobile mode; toggle dark mode.

## 12. Troubleshooting

| Problem | Fix |
|---|---|
| `MongoDB connection failed` | Start the MongoDB service; check `MONGO_URI` |
| `Missing MONGO_URI or JWT_SECRET` | Create `server/.env` from `.env.example` |
| Website says "Cannot reach the server" | Start the backend; check `VITE_API_URL` and the port |
| CORS error in the browser console | Add your frontend URL to `CLIENT_URL` and restart the server |
| `Port 5000 already in use` | Change `PORT` in `server/.env` and `VITE_API_URL` in `client/.env` |
| Changed `.env` but nothing happens | Restart the dev server (env files load at start) |
| "Invalid email or password" for demo user | Run `npm run seed` in `server/` |
| Blank page | Open browser console (F12) and read the first red error |

## 13. Demonstration flow (5–7 minutes)

1. Show the home page: live board, counters (from MongoDB), theme toggle, estimator.
2. Open Compass: show empty/seeded collections.
3. Register as a client → post a project → refresh Compass.
4. Register as a freelancer in a private window → apply.
5. Client accepts → show status changes and the notification in Compass.
6. Show an unauthorized call returning 403 and the `passwordHash` in Compass.
