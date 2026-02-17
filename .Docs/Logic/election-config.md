
---

## ELECTION CONFIG MODULE – Developer Guide

**Purpose:**
Configure elections by linking global candidates and positions, setting election-specific rules, and enabling shortcut candidate creation.

**Responsibilities:**

* Attach global candidates to an election
* Attach global positions to an election
* Configure election-specific rules and settings
* Provide a shortcut workflow to create new candidates directly in the election

**Business Rules:**

* Election config **cannot own candidates or positions** – only references global data
* Candidates and positions can only be removed **before the election starts**
* Shortcut candidate creation saves the candidate **globally** and immediately attaches it to the election
* Maintain historical integrity – changes do not affect past elections

**Expected Features / Developer Considerations:**

* Add or remove positions from an election (if election not started)
* Add or remove candidates from an election (if election not started)
* Create new candidates and link them globally and to the election
* Ensure all changes respect single source of truth (no duplicates)
* Optional WebSocket to show real-time updates to multiple admins configuring the same election

**Integration:**

* Candidates module – for adding existing or new candidates
* Positions module – for attaching global positions
* Admin dashboard – optional real-time view of current election configuration
* Voting module – ensures voters see the correct candidates and positions

**Developer Notes:**

* Keep configuration modular and reusable
* Preserve historical data for ended elections
* Allow real-time admin collaboration if multiple admins are configuring the same election

---

