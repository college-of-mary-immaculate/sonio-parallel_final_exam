
---

## USERS MODULE – Developer Guide

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

**Expected Features:**

* Create, read, update, delete users (with rules)
* Login and password verification
* Role validation
* Optional WebSocket for admin real-time monitoring

**Integration:**

* Frontend login, profile, and role-based pages
* Voting and election modules for role-based access
* Admin dashboards for monitoring users

**Developer Notes:**

* Keep module self-contained
* Enforce role rules strictly
* Maintain historical integrity (votes/results)
* Ready for future real-time features

---
