
---

# Voting System

A distributed Voting System designed with horizontal backend scaling and MySQL master–slave replication.

## Overview

This project demonstrates:

* Multiple backend instances
* MySQL replication (1 master, 2 slaves)
* Automated containerized deployment
* Database initialization and seeding
* Scalable architecture ready for load balancing
* Real-time support via websockets

---

## Architecture

### Backend Layer

* 3 backend instances:

  * backend_1
  * backend_2
  * backend_3

Each instance runs the same application and connects to the database layer.

### Database Layer

* mysql_master

  * Handles all write operations (INSERT, UPDATE, DELETE)
* mysql_slave1

  * Read replica
* mysql_slave2

  * Read replica

Read queries can be distributed across slave databases to improve performance and reduce master load.

---

## Architecture Diagram

```
                (Planned: Real-time support)
            ┌──────────────┐
            │ Load Balancer │
            └──────┬───────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
 backend_1    backend_2    backend_3
      │            │            │
      └───────┬────┴────┬───────┘
              │           │
        mysql_master   mysql_slave1
                          mysql_slave2
```

---

## Deployment

The entire system is started using:

```
./build.sh
```

---

## build.sh Process

The script performs the following steps:

1. Stops old containers
2. Cleans up previous environment
3. Builds the backend Docker image
4. Starts:

   * MySQL master
   * MySQL slave 1
   * MySQL slave 2
5. Waits until databases are ready
6. Configures MySQL replication
7. Runs `init.js`

   * Creates tables
   * Seeds initial data
8. Starts three backend instances
9. Starts client instance

All database configuration and replication setup are automated.

---

## Database Strategy

Write Operations
All write queries are routed to mysql_master.

Read Operations
Read queries are handled by mysql_slave1 and mysql_slave2 to distribute load.

This improves scalability and reduces database bottlenecks.

---

## Tech Stack

* Node.js
* Express
* React.js
* MySQL
* Docker
* Bash scripting

---

## Future Improvements

* Real-time voting updates (WebSocket or Socket.IO)
* Health checks for backend instances
* Monitoring and observability

---

## Getting Started

Make the script executable and run it:

```
chmod +x build.sh
./build.sh
```

The system will automatically:

* Configure databases
* Setup replication
* Initialize schema
* Seed data
* Launch backend instances
* Launch client instance

---
