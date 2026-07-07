# Taskly - Smart Task Management Application

A full-stack, responsive Task Management Application featuring user authentication, analytics dashboards, priority categorization, status transitions, search, and dynamic sorting.

Built using the **MERN Stack** (MongoDB, Express.js, React.js, and Node.js) with standard custom CSS variables to support sleek Light and Dark visual modes.

---

## Features

- **JWT-Based Authentication**: Registration, Login, Profile checks, and Route guards to protect task records.
- **Task CRUD**: Create, Read, Update, and Delete operations for tasks.
- **Advanced Querying**: Real-time client-side and server-side text searches, state-based filters (All, Pending, In Progress, Completed), and priority filters (Low, Medium, High).
- **Responsive Dashboard UI**: Interactive widgets showing stats (Total Tasks, Pending, Completed, Completion Rate %) with custom glassmorphism components.
- **Aesthetic Light & Dark Modes**: Seamless style transitions saved locally for user convenience.
- **Custom Toast System**: Direct visual feedback for successes and errors.
- **Postman API Integration**: Includes a preconfigured API collection JSON with pre-request token generation scripts.

---

## Project Structure

```text
assignment/
├── backend/
│   ├── config/db.js          # MongoDB Mongoose connector
│   ├── controllers/          # Controllers (auth, tasks)
│   ├── middleware/           # Auth JWT validations
│   ├── models/               # Schemas (User, Task)
│   ├── routes/               # API endpoints
│   ├── .env.example          # Template environment config
│   ├── package.json          # Node dependencies
│   └── server.js             # Main server execution entry
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components (TaskCard)
│   │   ├── context/          # State providers (Auth, Theme, Toast)
│   │   ├── pages/            # View pages (Login, Register, Dashboard)
│   │   ├── App.jsx           # Main routing structure
│   │   ├── index.css         # Theme design tokens & animations
│   │   └── main.jsx          # React app entry point
│   ├── index.html            # HTML layout
│   └── package.json          # React packages & Vite build instructions
└── Task_Management_API.postman_collection.json # Ready-to-import Postman APIs
```

---

## Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) installed (v18 or higher recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) remote database URI.

### 1. Backend Setup
1. Open a terminal and navigate to the `backend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Adjust the variables inside `.env` if necessary:
   - `PORT`: Server port (default: 5000)
   - `MONGODB_URI`: Local MongoDB port or remote Atlas connection string
   - `JWT_SECRET`: Random string key for security signing
5. Start the backend server:
   - For production:
     ```bash
     npm start
     ```
   - For hot-reload development (requires `nodemon` installed globally or locally):
     ```bash
     npm run dev
     ```

### 2. Frontend Setup
1. Open a terminal and navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite local dev server:
   ```bash
   npm run dev
   ```
4. Open the displayed local server address in your browser (typically `http://localhost:5173`).

---

## API Documentation & Endpoint Reference

### Authentication Endpoints
- **Register User** (`POST /api/auth/register`)
  - Request: `{ "name": "Jane", "email": "jane@example.com", "password": "password123" }`
  - Response: Auth token & basic profile details.
- **Login User** (`POST /api/auth/login`)
  - Request: `{ "email": "jane@example.com", "password": "password123" }`
  - Response: Auth token & basic profile details.
- **Get User Profile** (`GET /api/auth/me`)
  - Header: `Authorization: Bearer <JWT_Token>`
  - Response: Details of the current logged-in user.

### Task Endpoints (All require `Authorization: Bearer <JWT_Token>`)
- **Get All Tasks** (`GET /api/tasks`)
  - Query Parameters (Optional):
    - `search`: Filter by keyword matches in title/description.
    - `status`: Filter by `Pending`, `In Progress`, or `Completed`.
    - `priority`: Filter by `Low`, `Medium`, or `High`.
    - `sortBy`: Sort field and order (`dueDate:asc`, `dueDate:desc`, `createdAt:desc`, `title:asc`).
- **Get Single Task** (`GET /api/tasks/:id`)
- **Create Task** (`POST /api/tasks`)
  - Request: `{ "title": "...", "description": "...", "status": "Pending", "priority": "Medium", "dueDate": "YYYY-MM-DD" }`
- **Update Task** (`PUT /api/tasks/:id`)
  - Request: `{ "title": "Updated title", "status": "In Progress" }`
- **Delete Task** (`DELETE /api/tasks/:id`)

---

## Testing with Postman

1. Open Postman.
2. Click **Import** and select the file: `Task_Management_API.postman_collection.json` located at the root of the project.
3. Once imported, registration and login actions will automatically save the generated token to your global variable settings (`{{token}}`).
4. You can immediately run any Task operation, and the authorization header will pull the authenticated token automatically!
