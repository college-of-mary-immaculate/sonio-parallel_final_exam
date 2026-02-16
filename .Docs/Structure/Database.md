🗳️ Voting System – Database Table Schemas
1️⃣ USERS & AUTHENTICATION
Users

Stores both voters and admins (role-based).

Field	Description
user_id (PK)	Unique user identifier
email	Unique email
first name
middle name
last name
password_hash	Encrypted password
role	voter / admin
status	active / blocked
created_at	Account creation time

✅ Why:

Role-based access control

One table is cleaner than separate admin/voter tables

OTP_Verifications

Handles signup verification.

Field	Description
otp_id (PK)	OTP record ID
email	Email being verified
otp_code	Generated OTP
expires_at	Expiration time
is_used	Prevent reuse

✅ Why:

Secure signup

Prevents fake accounts

2️⃣ ELECTION MANAGEMENT
Elections

Main election container.

Field	Description
election_id (PK)	Election ID
title	Election name
status	draft / active / ended
start_date	Election start
end_date	Election end
created_by (FK)	Admin user_id
created_at	Creation time

✅ Why:

Controls election lifecycle

Enables countdown and access control

3️⃣ GLOBAL MASTER DATA (SOURCE OF TRUTH)
Positions

Global list of positions.

Field	Description
position_id (PK)	Position ID
name	Position name
description	Optional description
Candidates

Global candidate list.

Field	Description
candidate_id (PK)	Candidate ID
full_name	Candidate name
description	Short intro
background	Background
education	Education
years_experience	Years of experience
primary_advocacy	Main advocacy
secondary_advocacy	Secondary advocacy
4️⃣ ELECTION CONFIGURATION TABLES

These tables link global data to a specific election.

Election_Positions

Positions included in an election + rules.

Field	Description
election_position_id (PK)	Unique ID
election_id (FK)	Election
position_id (FK)	Position
candidate_count	Max candidates
winners_count	Number of winners
votes_per_voter	Allowed votes per voter

✅ Why:

Rules vary per election

Keeps elections flexible

Election_Candidates

Candidates participating in an election.

Field	Description
election_candidate_id (PK)	Unique ID
election_id (FK)	Election
candidate_id (FK)	Candidate
position_id (FK)	Position in this election

✅ Why:

Same candidate can join different elections

Position assignment is per election

5️⃣ VOTING DATA (CORE OF THE SYSTEM)
Votes

Stores individual votes.

Field	Description
vote_id (PK)	Vote ID
election_id (FK)	Election
position_id (FK)	Position
candidate_id (FK)	Candidate
voter_id (FK)	User who voted
created_at	Vote timestamp

✅ Rules enforced by backend:

One vote per candidate per voter

Max votes per position respected

Voting allowed only when election is active

Voter_Submissions

Locks voting per voter per election.

Field	Description
submission_id (PK)	Submission ID
election_id (FK)	Election
voter_id (FK)	Voter
submitted_at	Final submission time

✅ Why:

Prevents double voting

Once exists → voting locked

6️⃣ RESULTS & HISTORY
Election_Results

Final stored results.

Field	Description
result_id (PK)	Result ID
election_id (FK)	Election
position_id (FK)	Position
candidate_id (FK)	Candidate
total_votes	Final vote count
rank	Rank in position
is_winner	True / False

✅ Why:

Fast result viewing

Historical records

-----------------------

