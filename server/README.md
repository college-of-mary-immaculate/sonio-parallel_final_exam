
---

## **Auth Module**

| Method | Endpoint          | Auth / Role | Description |
| ------ | ----------------- | ----------- | ----------- |
| POST   | `/api/auth/login` | Public      | Login user  |

---

## **User Module**

| Method | Endpoint              | Auth / Role           | Description                                    |
| ------ | --------------------- | --------------------- | ---------------------------------------------- |
| POST   | `/api/users/register` | Public                | Register new user                              |
| GET    | `/api/users/profile`  | Authenticated         | Get own profile                                |
| GET    | `/api/users/`         | Admin                 | List all users                                 |
| PUT    | `/api/users/:id`      | Authenticated / Admin | Update own or any user profile                 |
| DELETE | `/api/users/:id`      | Admin                 | Delete user (blocked if user has vote history) |

---

## **Vote Module**

| Method | Endpoint            | Auth / Role   | Description   |
| ------ | ------------------- | ------------- | ------------- |
| POST   | `/api/votes/submit` | Authenticated | Submit a vote |

---

## **Election Module**

| Method | Endpoint                                                                   | Auth / Role | Description                             |
| ------ | -------------------------------------------------------------------------- | ----------- | --------------------------------------- |
| GET    | `/api/elections/`                                                          | Admin       | List all elections                      |
| POST   | `/api/elections/`                                                          | Admin       | Create new election                     |
| GET    | `/api/elections/:electionId`                                               | Admin       | Get election by ID                      |
| PUT    | `/api/elections/:electionId`                                               | Admin       | Update election                         |
| DELETE | `/api/elections/:electionId`                                               | Admin       | Delete election                         |
| GET    | `/api/elections/:electionId/config`                                        | Admin       | Get election config                     |
| POST   | `/api/elections/:electionId/candidates`                                    | Admin       | Add candidate to election               |
| DELETE | `/api/elections/:electionId/positions/:positionId/candidates/:candidateId` | Admin       | Remove candidate from election position |

---

## **Candidate Module**

| Method | Endpoint                       | Auth / Role | Description          |
| ------ | ------------------------------ | ----------- | -------------------- |
| GET    | `/api/candidates/`             | Admin       | List all candidates  |
| GET    | `/api/candidates/:candidateId` | Admin       | Get candidate by ID  |
| POST   | `/api/candidates/`             | Admin       | Create new candidate |
| PUT    | `/api/candidates/:candidateId` | Admin       | Update candidate     |
| DELETE | `/api/candidates/:candidateId` | Admin       | Delete candidate     |

---

## **Position Module**

| Method | Endpoint                     | Auth / Role | Description         |
| ------ | ---------------------------- | ----------- | ------------------- |
| GET    | `/api/positions/`            | Admin       | List all positions  |
| GET    | `/api/positions/:positionId` | Admin       | Get position by ID  |
| POST   | `/api/positions/`            | Admin       | Create new position |
| PUT    | `/api/positions/:positionId` | Admin       | Update position     |
| DELETE | `/api/positions/:positionId` | Admin       | Delete position     |

---

## **Election-Position Module**

| Method | Endpoint                                                    | Auth / Role | Description                             |
| ------ | ----------------------------------------------------------- | ----------- | --------------------------------------- |
| GET    | `/api/election-positions/elections/:electionId`             | Admin       | List all positions for a given election |
| POST   | `/api/election-positions/:positionId/elections/:electionId` | Admin       | Add a position to an election           |
| DELETE | `/api/election-positions/:positionId/elections/:electionId` | Admin       | Remove a position from an election      |

---

