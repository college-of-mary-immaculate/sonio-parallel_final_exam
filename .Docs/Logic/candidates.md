
---

## CANDIDATES MODULE – Developer Guide

**Purpose:**
Manage all global candidates and their profiles. Ensure candidates can be reused across elections while preserving historical election data.

**Responsibilities:**

* Store candidate information globally (`candidate_id`, `full_name`, `details`, etc.)
* Manage candidate profiles
* Link candidates to elections via a junction table (`Election_Candidates`)
* Support creation of new candidates via election configuration (shortcut workflow)

**Business Rules:**

* Candidates are reusable across multiple elections
* Cannot delete a candidate used in **ended elections**
* Can delete a candidate if unused or only in **draft elections**
* Updates affect **future elections only**, not historical results
* Maintain **single source of truth** – no duplicates, no temporary election-only candidates

**Expected Features / Developer Considerations:**

* Create, read, update, delete candidates (with rules above)
* Attach or detach candidates to/from elections
* Shortcut creation via election configuration
* Optional WebSocket for admin dashboards to show live candidate changes in multi-admin scenarios

**Integration:**

* Election Configuration module – for attaching candidates to elections
* Admin dashboard – optional real-time monitoring of candidate list
* Voting module – candidates must appear correctly in ballots

**Developer Notes:**

* Keep candidate data global and consistent
* Preserve historical integrity – do not modify past election results
* Ready for optional real-time updates for admins

---
