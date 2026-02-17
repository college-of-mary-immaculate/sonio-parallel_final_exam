
---

# Voting System (Distributed & Scalable)

A distributed Voting System built with **containerized backends, MySQL master–slave replication, and a React frontend**, designed for **horizontal scaling and automated deployment**.

---

# Overview

This project demonstrates:

* **Multiple backend instances** for load distribution
* **MySQL replication** (1 master, 2 read replicas)
* **Automated containerized deployment** using Docker & Docker Compose
* **Database initialization and seeding**
* **Load balancing** via Nginx
* **React frontend client**

The system is designed for **read/write separation** and **scalable backend architecture**.

---

# Architecture

## Layers

### 1. Client Layer

* React frontend running in a Docker container
* Communicates with backend via Nginx

### 2. Load Balancer

* Nginx container
* Distributes API requests across backend instances
* Single entry point for all client requests

### 3. Backend Layer

* Three Node.js/Express backend instances: backend1, backend2, backend3
* **Stateless architecture** allows any instance to handle any request
* Connects to the MySQL database layer

### 4. Database Layer

* **mysql_master** – handles all write operations
* **mysql_slave1** – read replica
* **mysql_slave2** – read replica

**Replication Strategy:**

* Master handles writes
* Slaves handle read queries
* Simple asynchronous replication for read scaling

---

# Architecture Diagram

```
             React Client
                   │
                   ▼
              ┌──────────┐
              │   NGINX   │  <- Load Balancer
              └─────┬─────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
 backend1        backend2         backend3
    │               │               │
    └───────────────┴───────────────┘
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
* Reduces master load and improves performance

### Consistency

* Slaves may lag behind master slightly (`Seconds_Behind_Master`)
* Read replicas provide **eventual consistency**, suitable for read-heavy queries like vote counts

---

# Deployment

### 1. Make the script executable

```bash
chmod +x build.sh
```

### 2. Start the system

```bash
./build.sh
```

### 3. Reset the client and server side only. 

```bash
./reset.sh
```

**What the script does:**

1. Stops old containers and cleans volumes
2. Builds **backend** and **client** Docker images
3. Starts **MySQL master**
4. Waits for readiness and injects replication config
5. Creates replication user
6. Starts **MySQL slaves**
7. Configures replication automatically
8. Initializes database schema and seeds data
9. Starts **backend instances**, **nginx**, and **React client**

---

# Tech Stack

* **Backend:** Node.js, Express
* **Frontend:** React.js (Vite)
* **Database:** MySQL 8 (master–slave replication)
* **Infrastructure:** Docker, Docker Compose, Nginx
* **Automation:** Bash scripting

---

# Services

| Service         | URL                                            |
| --------------- | ---------------------------------------------- |
| React Client    | [http://localhost:5173](http://localhost:5173) |
| API (via nginx) | [http://localhost:8080](http://localhost:8080) |

---

# Future Improvements

* Real-time voting updates via WebSocket / Socket.IO
* Health checks and auto-restart for backend instances
* Automated failover for MySQL master
* Monitoring and logging
* CI/CD pipeline for automated deployment

---

# Notes

* This project demonstrates **scalable and distributed architecture concepts**.
* It is suitable for **learning and prototyping**, or as a **portfolio project**.
* It is **not a production-grade system**, as it lacks auto-scaling, full failover, monitoring, and advanced security features.

---


