# Alpha Library System Architecture: Frontend & Backend Separation

This project is structured with a clear separation between **Frontend (Client UI & State)** and **Backend (Server & APIs)**.

## Project Structure Overview

```text
├── server/                          # BACKEND SERVICES & APIS
│   ├── app.ts                       # Express application configuration, CORS, middleware
│   ├── routes/                      # REST API routing
│   │   └── api.ts                   # /api routes (books, students, staff, circulation, analytics)
│   ├── controllers/                 # Route controllers (Request / Response handlers)
│   │   ├── bookController.ts        # Catalog CRUD logic
│   │   ├── studentController.ts     # Student profile & membership logic
│   │   ├── staffController.ts       # Staff and librarian authorization logic
│   │   ├── borrowController.ts      # Book issuance and return processing
│   │   └── analyticsController.ts   # System metrics, statistics & health check
│   ├── services/                    # Database and persistence business logic
│   │   └── databaseService.ts       # Data stores, circulation validation & state mutations
│   ├── middleware/                  # Backend Express middleware
│   │   ├── logger.ts                # API request and response duration logger
│   │   └── errorHandler.ts          # Centralized error handler
│   └── types.ts                     # Backend data models & schemas
│
├── server.ts                        # FULLSTACK ENTRY POINT
│                                    # Runs Express on port 3000, mounts /api, and serves Vite in dev / dist in prod
│
└── src/                             # FRONTEND CLIENT APPLICATION
    ├── components/                  # React UI components
    │   ├── Auth/                    # Authentication modals and forms
    │   ├── Catalog/                 # Book grid, search filters, and detail dialogs
    │   ├── Dashboards/              # Student, Staff, and Admin dashboard panels
    │   ├── Scanner/                 # Barcode and QR camera scanner
    │   ├── Navbar.tsx               # Navigation and role switcher
    │   ├── Footer.tsx               # Academic footer
    │   └── ToastContainer.tsx       # Interactive notifications
    ├── context/                     # Frontend state management
    │   └── LibraryContext.tsx       # Reactive context provider for active user sessions & UI state
    ├── services/                    # Frontend service adapters
    │   └── apiClient.ts             # Type-safe client for backend /api/* endpoints
    ├── lib/                         # Client integrations
    │   └── firebase.ts              # Firebase client SDK initialization & sync
    ├── data/                        # Frontend UI default catalogs
    │   └── mockData.ts              # Pre-seeded catalog UI data
    ├── utils/                       # Frontend helper utilities
    │   └── exportUtils.ts           # PDF, CSV, and summary report generator
    ├── types.ts                     # Shared TypeScript interfaces
    ├── App.tsx                      # Root React application view
    ├── main.tsx                     # Vite React entry DOM mounter
    └── index.css                    # Tailwind CSS styling
```

## Backend API Endpoints

All backend endpoints are served under `/api`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend server health and uptime |
| `GET` | `/api/books` | List books (supports `?q=` and `?category=`) |
| `GET` | `/api/books/:id` | Get book by ID or ISBN |
| `POST` | `/api/books` | Add new book to library catalog |
| `PUT` | `/api/books/:id` | Update book details |
| `DELETE` | `/api/books/:id` | Remove book from catalog |
| `GET` | `/api/students` | List registered students |
| `GET` | `/api/students/:id` | Retrieve student profile by ID or roll number |
| `POST` | `/api/students` | Register student profile |
| `PUT` | `/api/students/:id` | Update student profile |
| `DELETE` | `/api/students/:id` | Delete student profile |
| `GET` | `/api/staff` | List library staff members |
| `GET` | `/api/staff/:id` | Get staff details by ID or staffId |
| `POST` | `/api/staff` | Authorize and add new staff member |
| `PUT` | `/api/staff/:id` | Update staff profile |
| `DELETE` | `/api/staff/:id` | Delete staff profile |
| `GET` | `/api/borrow-records` | List circulation records |
| `POST` | `/api/borrow-records/issue` | Issue book to a student |
| `POST` | `/api/borrow-records/return/:id` | Process book return |
| `GET` | `/api/analytics` | Overview statistics & circulation rate |
| `GET` | `/api/support` | List support tickets |
| `POST` | `/api/support` | Submit student support ticket |
