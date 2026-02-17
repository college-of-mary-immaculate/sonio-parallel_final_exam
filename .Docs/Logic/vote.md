
---

## VOTER / REAL-TIME MONITORING MODULE – Developer Guide

**Purpose:**
Handle real-time features for voters and admins, including countdown timers before/during elections and live vote monitoring for admins.

**Responsibilities:**

* Show election countdowns to voters before and during voting
* Display candidates and positions in the ballot
* Push real-time vote updates to admin dashboards
* Enable live ranking and vote graphs for admins
* Ensure voters cannot vote before the election starts or after it ends

**Business Rules:**

* Voters see **countdown timers** before the election starts (with election title)
* Voters see **remaining time** during voting
* Admins see **votes updating in real time**, including ranking changes
* Countdown and vote updates must match **server-side election timing**
* Voting rules are strictly enforced: one vote per voter per position

**Expected Features / Developer Considerations:**

* WebSocket integration for:

  * Real-time countdown to election start and end
  * Live vote counts and rankings for admins
* Fallback: polling can be used for voters if WebSocket is not available
* Ensure vote submissions trigger immediate update to admin dashboards
* Graph or chart updates should reflect current vote counts in real time

**Integration:**

* Voting module – to submit votes and enforce rules
* Election Config module – to get election start/end times and candidates
* Admin dashboard – to display live vote counts and ranking
* Users module – to validate voter identity and role

**Developer Notes:**

* Focus on accurate **server time synchronization** for countdowns
* Ensure **vote integrity** – no data loss or duplication during real-time updates
* Real-time updates only required for admin monitoring; voters can see live countdowns
* Design WebSocket channels or events clearly (e.g., `vote_update`, `countdown_tick`)

---
