
---

# VOTING SYSTEM – DEVELOPER BLUEPRINT

## 1️⃣ USERS MODULE

**Purpose:**
Manage users, authentication, and role-based access.

**Responsibilities:**

* Store user info: `user_id`, `email`, `full_name`, `password_hash`, `role`, `created_at`
* Authenticate users (login)
* Assign roles (`admin` or `voter`)
* Allow profile updates (name, email, password, role)

**Business Rules:**

* No blocking or disabling of users
* Role determines access (admin vs voter)
* Passwords must be securely hashed
* Users cannot be deleted if referenced in votes or past elections

**Integration / Notes:**

* Frontend login, profile, role-based pages
* Voting and election modules for access
* Optional WebSocket for admin monitoring

---

## 2️⃣ CANDIDATES MODULE

**Purpose:**
Manage all global candidates and their profiles.

**Responsibilities:**

* Store candidate information globally (`candidate_id`, `full_name`, `details`, etc.)
* Manage candidate profiles
* Link candidates to elections (`Election_Candidates`)
* Support shortcut creation of new candidates via election configuration

**Business Rules:**

* Candidates are reusable across elections
* Cannot delete candidates used in ended elections
* Can delete if unused or only in draft elections
* Updates affect **future elections only**
* Single source of truth – no duplicates, no temporary election-only candidates

**Integration / Notes:**

* Election Config module – to attach candidates
* Admin dashboard – optional real-time updates via WebSocket

---

## 3️⃣ ELECTION CONFIG MODULE

**Purpose:**
Configure elections with positions and candidates, set rules, and enable shortcut candidate creation.

**Responsibilities:**

* Attach global candidates and positions to elections
* Configure election-specific rules
* Provide shortcut workflow for creating candidates globally

**Business Rules:**

* Cannot own candidates or positions – only references global data
* Candidates/positions can only be removed before election starts
* Shortcut creation saves globally and attaches to election
* Maintain historical integrity – no changes to past elections

**Integration / Notes:**

* Candidates and Positions modules
* Admin dashboard – optional real-time updates
* Voting module – ensures voters see correct candidates/positions

---

## 4️⃣ VOTER / REAL-TIME MONITORING MODULE

**Purpose:**
Handle real-time countdowns and vote monitoring.

**Responsibilities:**

* Show election countdown to voters before and during voting
* Display candidates and positions in ballot
* Push live vote updates to admins
* Enable real-time ranking and graphs for admins

**Business Rules:**

* Voters see countdowns accurately synced to server time
* Admins see votes updating in real-time
* Voting rules strictly enforced (one vote per voter per position)

**Integration / Notes:**

* Voting module – for vote submissions and enforcement
* Election Config – for start/end times, candidates
* Users module – for validating voter identity and role
* WebSocket required for:

  * Real-time countdowns (voter view)
  * Live vote counts and rankings (admin dashboard)
* Polling optional for voters if WebSocket unavailable

---

## 5️⃣ DATABASE & INTEGRATION NOTES

* Users, Candidates, Elections, and Positions tables are **global and reusable**
* Junction tables (`Election_Candidates`, `Election_Positions`) link global data to elections
* Votes are immutable; historical election data cannot be modified
* WebSocket channels/events suggested:

  * `vote_update` → admin dashboards
  * `countdown_tick` → voter countdown timers
  * `candidate_update` → optional multi-admin live updates

---

### ✅ Developer Guidelines Summary

* Keep each module **self-contained**
* Enforce **role-based access** strictly
* Preserve **historical integrity** – past votes and elections never change
* Real-time features via WebSocket are **only required where necessary**:

  * Countdown timers (voters)
  * Vote monitoring (admins)
  * Optional candidate/position updates (admins)
* Ensure **single source of truth** for candidates, positions, and users
* Maintain secure password handling and authentication for all users

---