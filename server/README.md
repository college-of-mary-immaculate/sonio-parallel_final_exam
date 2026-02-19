
---

# Backend Design

* Dependency Injection via `container.js`
* Single Responsibility Principle (SRP) applied per module
* Module-based architecture: `auth`, `users`, `vote`, `election`, `candidate`, `position`

---

# API Endpoints

Base URL:

```
http://localhost:8080/ 
```

---

## Auth

| Method | Endpoint      | Access | Description |
| ------ | ------------- | ------ | ----------- |
| POST   | `/api/auth/login` | Public | Login user  |

---

## Users

| Method | Endpoint          | Access                | Description       |
| ------ | ----------------- | --------------------- | ----------------- |
| POST   | `/api/users/register` | Public                | Register new user |
| GET    | `/api/users/profile`  | Authenticated         | Get own profile   |
| GET    | `/api/users`          | Admin                 | Get all users     |
| PUT    | `/api/users/:id`      | Authenticated / Admin | Update user       |
| DELETE | `/api/users/:id`      | Admin                 | Delete user       |

---

## Votes

| Method | Endpoint        | Access        | Description |
| ------ | --------------- | ------------- | ----------- |
| POST   | `/api/votes/submit` | Authenticated | Submit vote |

---

## Elections

| Method | Endpoint                                                               | Access | Description                    |
| ------ | ---------------------------------------------------------------------- | ------ | ------------------------------ |
| GET    | `/api/elections/:electionId/config`                                        | Admin  | Get election configuration     |
| POST   | `/api/elections/:electionId/candidates`                                    | Admin  | Add candidate to election      |
| DELETE | `/api/elections/:electionId/positions/:positionId/candidates/:candidateId` | Admin  | Remove candidate from position |

---

## Candidates

| Method | Endpoint                   | Access | Description         |
| ------ | -------------------------- | ------ | ------------------- |
| GET    | `/api/candidates`              | Admin  | Get all candidates  |
| GET    | `/api/candidates/:candidateId` | Admin  | Get candidate by ID |
| POST   | `/api/candidates`              | Admin  | Create candidate    |
| PUT    | `/api/candidates/:candidateId` | Admin  | Update candidate    |
| DELETE | `/api/candidates/:candidateId` | Admin  | Delete candidate    |

---

## Positions

| Method | Endpoint                 | Access | Description         |
| ------ | ------------------------ | ------ | ------------------- |
| GET    | `/api/positions`             | Admin  | Get all positions   |
| GET    | `/api/positions/:positionId` | Admin  | Get position by ID  |
| POST   | `/api/positions`             | Admin  | Create new position |
| PUT    | `/api/positions/:positionId` | Admin  | Update position     |
| DELETE | `/api/positions/:positionId` | Admin  | Delete position     |

---

## System

| Method | Endpoint  | Access | Description       |
| ------ | --------- | ------ | ----------------- |
| GET    | `/health` | Public | Health check      |
| GET    | `/check`  | Public | Instance hostname |

---


