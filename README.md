
---

# Voting System (Distributed, Scalable & Real-Time)

A distributed **Voting System** built with **containerized backends, MySQL master–slave replication, Redis-coordinated WebSockets, and a React frontend**, designed for **horizontal scaling, real-time updates, and automated deployment**.

---

# Overview

This project demonstrates:

* **Multiple backend instances** for horizontal scaling
* **Multiple WebSocket servers (one per backend)**
* **Redis-based pub/sub** to synchronize WebSocket events across instances
* **MySQL replication** (1 master, 2 read replicas)
* **Automated containerized deployment** using Docker & Docker Compose
* **Database initialization and seeding**
* **Load balancing** via Nginx (HTTP + WebSocket)
* **React frontend client**
* **Automated test gating** during build using **Jest**

The system supports **read/write separation**, **real-time communication**, and **scalable backend architecture**.

---

# Architecture

## Layers

### 1. Client Layer

* React frontend running in a Docker container
* Communicates with the system via:

  * REST APIs (HTTP)
  * WebSockets for real-time updates
* All traffic passes through Nginx

---

### 2. Load Balancer Layer

* Nginx container
* Single entry point for the system
* Responsibilities:

  * Distributes HTTP API requests across backend instances
  * Proxies WebSocket connections using HTTP upgrade headers
* Ensures clients can connect to any backend transparently

---

### 3. Backend & WebSocket Layer

* Three Node.js / Express backend instances:

  * `backend1`
  * `backend2`
  * `backend3`
* Each backend:

  * Is **stateless**
  * Exposes REST APIs
  * Runs its **own WebSocket server**
* Because there are three backends, there are also **three WebSocket servers**

---

### 4. Redis (WebSocket Coordination Layer)

* Redis is used as a **shared pub/sub message bus**
* All backend WebSocket servers connect to Redis
* When one backend emits a WebSocket event:

  * The event is published to Redis
  * Redis broadcasts it to the other backends
  * Each backend forwards the event to its connected clients

This makes the system behave like **one logical WebSocket system**, even though multiple WebSocket servers exist.

---

### 5. Database Layer

* **mysql_master** – handles all write operations
* **mysql_slave1** – read replica
* **mysql_slave2** – read replica

**Replication Strategy:**

* Master handles all writes
* Slaves handle read queries
* Asynchronous replication for read scalability

---

# Architecture Diagram

```
             React Client
          (HTTP + WebSocket)
                   │
                   ▼
              ┌──────────┐
              │   NGINX   │  <- Load Balancer
              └─────┬─────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
 backend1        backend2         backend3
   WS               WS               WS
    │               │               │
    └───────────────┬───────────────┘
                    │
                  Redis
                    │
               mysql_master
                    │
          mysql_slave1  mysql_slave2
```

---

# Database Strategy

### Writes

* All **INSERT / UPDATE / DELETE** operations go to **mysql_master**

### Reads

* Read queries are distributed across **mysql_slave1** and **mysql_slave2**
* Reduces load on the master and improves scalability

### Consistency

* Read replicas may lag slightly behind the master
* The system uses **eventual consistency**
* WebSocket events are emitted after successful writes to keep clients updated in near real-time

---

# Real-Time Communication Strategy

* Each backend runs a **WebSocket server**
* Redis ensures all WebSocket servers are aware of events from other instances
* Clients receive real-time updates regardless of which backend they are connected to
* No sticky sessions are required because Redis synchronizes events across nodes

---

# Deployment & Test-Aware Build

This project uses **Jest tests in the backend** and a **build script that acts like a simple CI/CD pipeline**.

* Backend Dockerfile runs:

```dockerfile
# Run Jest tests
RUN npm test
```

* If any test **fails**, the Docker build **stops immediately**
* The `build.sh` script uses `set -e` so any failed command halts deployment
* This guarantees **only tested code is deployed**

---

### Deployment Flow

1. Stops existing containers and cleans volumes
2. Builds backend and client images
3. Runs Jest tests during backend build
4. If tests fail → deployment stops
5. Starts MySQL master
6. Waits for readiness and configures replication
7. Starts MySQL slave replicas
8. Initializes database schema and seed data
9. Starts Redis
10. Starts backend instances, Nginx, and React client

---

# Tech Stack

* **Backend:** Node.js, Express, WebSockets / Socket.IO, Redis adapter, Jest
* **Frontend:** React.js (Vite)
* **Database:** MySQL 8 (master–slave replication)
* **Messaging:** Redis (pub/sub for WebSockets)
* **Infrastructure:** Docker, Docker Compose, Nginx
* **Automation:** Bash scripting with test-gated builds

---

# Services

| Service            | URL                                            |
| ------------------ | ---------------------------------------------- |
| React Client       | [http://localhost:5173](http://localhost:5173) |
| API (via Nginx)    | [http://localhost:8080](http://localhost:8080) |
| WebSocket Endpoint | ws://localhost:8080                            |
| Redis              | Internal (Docker only)                         |

---

# Future Improvements

* Backend auto-scaling
* MySQL master failover
* Monitoring and logging
* WebSocket metrics and connection tracking
* CI/CD with GitHub Actions or GitLab CI

---

# Notes

* Demonstrates **distributed systems, real-time communication, and horizontal scaling**
* Suitable for **learning, prototyping, and portfolio projects**
* **Not production-ready**

  * No auto-scaling
  * No DB failover
  * Limited security hardening
* **Build is test-gated** — broken backends never deploy

---
