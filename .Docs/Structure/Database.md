# 🗳️ Voting System – Database Table Schemas 

## 1️⃣ USERS & AUTHENTICATION

### Users

Stores both voters and admins (role-based).

| Field         | Description            |
| ------------- | ---------------------- |
| user_id (PK)  | Unique user identifier |
| email         | Unique email           |
| full_name     | Voter/Admin full name  |
| password_hash | Encrypted password     |
| role          | voter / admin          |
| created_at    | Account creation time  |

**Explanation:**
Single table with role-based access. No blocking or disabling logic.

---

### OTP_Verifications

Handles signup verification.

| Field       | Description          |
| ----------- | -------------------- |
| otp_id (PK) | OTP record ID        |
| email       | Email being verified |
| otp_code    | Generated OTP        |
| expires_at  | Expiration time      |
| is_used     | Prevent reuse        |

**Explanation:**
Ensures secure account creation using OTP.

---

## 2️⃣ ELECTION MANAGEMENT

### Elections

Main election container.

| Field            | Description            |
| ---------------- | ---------------------- |
| election_id (PK) | Election ID            |
| title            | Election name          |
| status           | draft / active / ended |
| start_date       | Election start         |
| end_date         | Election end           |
| created_by (FK)  | Admin user_id          |
| created_at       | Creation time          |

**Explanation:**
Controls election lifecycle and voting availability.

---

## 3️⃣ GLOBAL MASTER DATA (SOURCE OF TRUTH)

### Positions

Global list of positions.

| Field            | Description          |
| ---------------- | -------------------- |
| position_id (PK) | Position ID          |
| name             | Position name        |
| description      | Optional description |

**Explanation:**
Reusable positions across all elections.

---

### Candidates

Global candidate list.

| Field              | Description         |
| ------------------ | ------------------- |
| candidate_id (PK)  | Candidate ID        |
| full_name          | Candidate name      |
| description        | Short introduction  |
| background         | Background          |
| education          | Education           |
| years_experience   | Years of experience |
| primary_advocacy   | Primary advocacy    |
| secondary_advocacy | Secondary advocacy  |
| created_at         | Creation time       |

**Explanation:**
Candidates are global and reusable. Can be created directly from election configuration.

---

## 4️⃣ ELECTION CONFIGURATION TABLES

### Election_Positions

Positions included in an election with rules.

| Field                     | Description             |
| ------------------------- | ----------------------- |
| election_position_id (PK) | Unique ID               |
| election_id (FK)          | Election                |
| position_id (FK)          | Position                |
| candidate_count           | Max candidates          |
| winners_count             | Number of winners       |
| votes_per_voter           | Allowed votes per voter |

**Explanation:**
Defines election-specific rules per position.

---

### Election_Candidates

Candidates participating in an election.

| Field                      | Description               |
| -------------------------- | ------------------------- |
| election_candidate_id (PK) | Unique ID                 |
| election_id (FK)           | Election                  |
| candidate_id (FK)          | Candidate                 |
| position_id (FK)           | Position in this election |

**Explanation:**
Links global candidates to a specific election and position.

---

## 5️⃣ VOTING DATA (CORE SYSTEM)

### Votes

Stores individual votes.

| Field             | Description    |
| ----------------- | -------------- |
| vote_id (PK)      | Vote ID        |
| election_id (FK)  | Election       |
| position_id (FK)  | Position       |
| candidate_id (FK) | Candidate      |
| voter_id (FK)     | User who voted |
| created_at        | Vote timestamp |

**Explanation:**
Stores all votes. Validation is enforced by backend rules.

---

### Voter_Submissions

Locks voting per voter per election.

| Field              | Description           |
| ------------------ | --------------------- |
| submission_id (PK) | Submission ID         |
| election_id (FK)   | Election              |
| voter_id (FK)      | Voter                 |
| submitted_at       | Final submission time |

**Explanation:**
Once a submission exists, voting is locked for that voter.

---

## 6️⃣ RESULTS & HISTORY

### Election_Results

Final stored results.

| Field             | Description       |
| ----------------- | ----------------- |
| result_id (PK)    | Result ID         |
| election_id (FK)  | Election          |
| position_id (FK)  | Position          |
| candidate_id (FK) | Candidate         |
| total_votes       | Final vote count  |
| rank              | Rank per position |
| is_winner         | True / False      |

**Explanation:**
Immutable historical results for fast viewing and auditing.
