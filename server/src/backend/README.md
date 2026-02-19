
---

# Backend Design

* Dependency Injection via `container.js`
* Single Responsibility Principle (SRP) applied per module
* Module-based architecture: `auth`, `users`, `vote`, `election`, `candidate`, `position`

---

# API Endpoints

Base URL:

```
http://localhost:8080/api 
```

---

## Auth

| Method | Endpoint      | Access | Description |
| ------ | ------------- | ------ | ----------- |
| POST   | `/auth/login` | Public | Login user  |

---

## Users

| Method | Endpoint          | Access                | Description       |
| ------ | ----------------- | --------------------- | ----------------- |
| POST   | `/users/register` | Public                | Register new user |
| GET    | `/users/profile`  | Authenticated         | Get own profile   |
| GET    | `/users`          | Admin                 | Get all users     |
| PUT    | `/users/:id`      | Authenticated / Admin | Update user       |
| DELETE | `/users/:id`      | Admin                 | Delete user       |

---

## Votes

| Method | Endpoint        | Access        | Description |
| ------ | --------------- | ------------- | ----------- |
| POST   | `/votes/submit` | Authenticated | Submit vote |

---

## Elections

| Method | Endpoint                                                               | Access | Description                    |
| ------ | ---------------------------------------------------------------------- | ------ | ------------------------------ |
| GET    | `/elections/:electionId/config`                                        | Admin  | Get election configuration     |
| POST   | `/elections/:electionId/candidates`                                    | Admin  | Add candidate to election      |
| DELETE | `/elections/:electionId/positions/:positionId/candidates/:candidateId` | Admin  | Remove candidate from position |

---

## Candidates

| Method | Endpoint                   | Access | Description         |
| ------ | -------------------------- | ------ | ------------------- |
| GET    | `/candidates`              | Admin  | Get all candidates  |
| GET    | `/candidates/:candidateId` | Admin  | Get candidate by ID |
| POST   | `/candidates`              | Admin  | Create candidate    |
| PUT    | `/candidates/:candidateId` | Admin  | Update candidate    |
| DELETE | `/candidates/:candidateId` | Admin  | Delete candidate    |

---

## Positions

| Method | Endpoint                 | Access | Description         |
| ------ | ------------------------ | ------ | ------------------- |
| GET    | `/positions`             | Admin  | Get all positions   |
| GET    | `/positions/:positionId` | Admin  | Get position by ID  |
| POST   | `/positions`             | Admin  | Create new position |
| PUT    | `/positions/:positionId` | Admin  | Update position     |
| DELETE | `/positions/:positionId` | Admin  | Delete position     |

---

## System

| Method | Endpoint  | Access | Description       |
| ------ | --------- | ------ | ----------------- |
| GET    | `/health` | Public | Health check      |
| GET    | `/check`  | Public | Instance hostname |

---


