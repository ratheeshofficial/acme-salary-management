# ACME Salary Management System — Architecture

## 1. Overview

The application is a web-based salary management system for an HR Manager to manage salary information for approximately 10,000 employees across multiple countries.

The system follows a modular full-stack architecture:

```text
React + TypeScript
        │
        │ REST API
        ▼
Node.js + Express
        │
        ▼
TypeORM
        │
        ▼
PostgreSQL
```

## 2. Technology Stack

### Frontend

* React + TypeScript
* Chakra UI
* Zustand — client-side state
* TanStack Query — server/API state

### Backend

* Node.js
* Express.js
* TypeScript
* TypeORM
* Swagger / OpenAPI — API documentation and testing

### Database

* PostgreSQL

### Testing

* Unit tests
* API/integration tests for core functionality

---

## 3. Frontend Architecture

The frontend will use a feature-based structure:

```text
src/
├── features/
│   ├── auth/
│   ├── employees/
│   ├── salaries/
│   └── dashboard/
├── components/
├── routes/
├── services/
├── store/
└── types/
```

**TanStack Query** will manage server data such as employees, salaries, and dashboard information.

**Zustand** will manage lightweight client-side state.

**Chakra UI** will provide reusable UI components and consistent styling.

---

## 4. Backend Architecture

The backend follows a simple layered structure:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
TypeORM
  ↓
PostgreSQL
```

* **Routes** — define API endpoints.
* **Controllers** — handle HTTP requests/responses.
* **Services** — contain business logic.
* **TypeORM** — handles database access.

Swagger/OpenAPI will document the REST APIs and provide an interface for manually testing endpoints.

Example API groups:

```text
/api/auth
/api/employees
/api/salaries
/api/dashboard
```

---

## 5. Database

The core entities will be:

```text
User
Employee
Salary
```

Salary will be stored separately from employees so that salary history can be maintained.

Example:

```text
Employee
   │
   └── Salary History
          ├── Previous Salary
          ├── Current Salary
          └── Effective Date
```

Employee salaries will be stored in their original/local currency.

For cross-country organization-level analytics, USD will be used as the common reporting currency.

---

## 6. Performance & Scalability

The system will support 10,000 employees using:

* Server-side pagination
* Database-level filtering and sorting
* Appropriate database indexes
* Backend aggregation for dashboard calculations

The frontend will not load all 10,000 employees at once.

---

## 7. Authentication

A simple HR Manager authentication flow will protect employee, salary, and dashboard APIs.

Since the assessment has only one user persona, a complex role/permission system is intentionally avoided.

---

## 8. Testing

Tests will focus on important business functionality, including:

* Salary calculations
* Salary updates
* Employee search/filtering
* Authentication
* Core API behavior
* Dashboard calculations

Tests will be fast, deterministic, and easy to understand.

---

## 9. Key Design Decisions

* **PostgreSQL:** Suitable for relational employee/salary data and aggregation queries.
* **TypeORM:** Provides structured database access and entity management.
* **TanStack Query:** Handles server state and API caching.
* **Zustand:** Handles lightweight client-side state.
* **Swagger:** Makes API documentation and manual API testing easier.
* **Modular monolith:** Avoids unnecessary microservice complexity while keeping the code maintainable.

The architecture is intentionally simple and focused on the requirements of the assessment.
