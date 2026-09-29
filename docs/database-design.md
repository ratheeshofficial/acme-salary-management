# Database Design

## Database

PostgreSQL is used as the relational database.

## Entities

### 1. Users

Stores HR Manager login information.

| Field         | Type      | Description        |
| ------------- | --------- | ------------------ |
| id            | UUID      | Primary key        |
| email         | VARCHAR   | Unique login email |
| password_hash | VARCHAR   | Hashed password    |
| role          | VARCHAR   | User role          |
| created_at    | TIMESTAMP | Created time       |

### 2. Employees

Stores employee information.

| Field         | Type      | Description        |
| ------------- | --------- | ------------------ |
| id            | UUID      | Primary key        |
| employee_code | VARCHAR   | Unique employee ID |
| first_name    | VARCHAR   | First name         |
| last_name     | VARCHAR   | Last name          |
| email         | VARCHAR   | Unique email       |
| country       | VARCHAR   | Employee country   |
| department    | VARCHAR   | Department         |
| designation   | VARCHAR   | Job designation    |
| created_at    | TIMESTAMP | Created time       |
| updated_at    | TIMESTAMP | Updated time       |

### 3. Salaries

Stores salary records and salary history.

| Field          | Type          | Description                         |
| -------------- | ------------- | ----------------------------------- |
| id             | UUID          | Primary key                         |
| employee_id    | UUID          | Foreign key to employees            |
| amount         | NUMERIC(15,2) | Salary amount                       |
| currency       | VARCHAR(3)    | Currency code such as INR, USD, GBP |
| effective_from | DATE          | Date salary becomes effective       |
| created_at     | TIMESTAMP     | Created time                        |

## Relationships

```text
Users

Employees
   │
   │ 1 : Many
   ▼
Salaries
```

One employee can have multiple salary records to maintain salary history.

## Important Design Decisions

- Salary is stored in the employee's **local currency**.
- Original salary values are preserved; salary updates create a new salary record.
- USD can be used as a common reporting currency for cross-country analytics.
- The latest effective salary record is treated as the current salary.
- Employee code and email are unique.
- Indexes will be added for frequently searched fields such as employee code, email, country, department, and salary employee ID.
