# Property Inventory Management System — Frontend

> The internal employee/admin interface for the Property Inventory Management System — built with **React 19**, **Vite**, and **Tailwind CSS v4**.

---

## What Is This?

This is the internal-facing React application consumed by staff at a commercial real estate advisory and brokerage firm. It connects to the [FastAPI backend](../property_inventory_system_backend/) and provides a unified interface for managing property portfolios, employees, and the lead pipeline.

A separate customer-facing app is planned for a future phase — this app is for internal operations only.

---

## Pages & Features

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing / entry point |
| `/dashboard` | Dashboard | Overview and key metrics |
| `/dashboard/properties` | Properties | Browse and manage the property inventory |
| `/dashboard/employees` | Employees | View and manage staff records |
| `/dashboard/leads` | Leads | Track and action the CRM lead pipeline |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Tables | TanStack Table v8 |

---

## Project Structure

```
src/
  api/
    client.js        # Axios instance — base URL + headers (JWT interceptors planned)
    properties.js    # Property API calls
    locations.js     # Location lookup API calls
  components/
    Sidebar.jsx      # Navigation sidebar
  layouts/
    DashboardLayout.jsx  # Shared layout wrapper for all dashboard routes
  pages/
    Home.jsx
    Dashboard.jsx
    Properties.jsx
    Employees.jsx
    Leads.jsx
  App.jsx            # Root component — routing config
  main.jsx           # App entry point
index.html
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

> Make sure the FastAPI backend is running at `http://127.0.0.1:8000` before using the app — all API calls route through that base URL.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the local dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## API Integration

All HTTP requests go through a single Axios instance defined in [src/api/client.js](src/api/client.js):

```
Base URL: http://127.0.0.1:8000/api/v1
```

JWT authentication via request/response interceptors is planned for a future phase.

---

## Backend

This frontend is the UI layer for the **Property Inventory Management System API** — a FastAPI + PostgreSQL backend that handles:

- Hierarchical property node tree (Property → Building → Wing → Floor → Unit)
- Role-based employee access control (`SUPER_ADMIN`, `OFFICE_HEAD`, `DATA_SURVEYOR`, etc.)
- Lead management with Zoho CRM integration
- Super admin configuration layer
