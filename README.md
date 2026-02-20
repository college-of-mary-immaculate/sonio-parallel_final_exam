
---

## 📸 Architecture Diagrams and System Interface Documentation

### System Architecture Diagram

![System Architecture Diagram](./Docs/assets/chart.png)

This diagram illustrates the overall flow and distributed architecture of the voting system. Client requests are routed through a centralized load balancer to multiple backend servers. Real-time communication is coordinated using Redis, while persistent data storage is managed through a MySQL master–slave replication strategy consisting of one master database and two read replicas.

---

## 🐳 Containerized Deployment Overview

![Docker Deployment Overview](./Docs/assets/docker.png)

This figure presents the containerized deployment of the system. Each core component—including the client application, backend services, load balancer, Redis service, and MySQL databases—is deployed in its own Docker container. This design promotes isolation, scalability, and consistent deployment across environments.

---

## 🛠️ Administrative Module Interfaces

### Candidate Management Interface

![Candidate Management Interface](./Docs/assets/admin/candidatemanagement.png)

This interface allows administrators to manage candidate records through create, update, delete, and view operations.

---

### Election Management Interface

![Election Management Interface](./Docs/assets/admin/electionmanagement.png)

Administrators can configure and maintain elections by adding new entries, modifying existing elections, removing obsolete records, and viewing all available elections.

---

### Position Management Interface

![Position Management Interface](./Docs/assets/admin/positionmanagement.png)

This module supports the management of election positions, which define the structure of the voting process and candidate assignments.

---

### Real-Time Vote Tracking

![Real-Time Vote Tracking View 1](./Docs/assets/admin/livetracking.png)
![Real-Time Vote Tracking View 2](./Docs/assets/admin/livetracking2.png)
![Real-Time Vote Tracking View 3](./Docs/assets/admin/livetracking3.png)

These views demonstrate the system’s real-time monitoring capability. Vote counts and rankings are updated dynamically using WebSocket communication coordinated through Redis, enabling immediate visibility of election results without manual page refresh.

---

## 🧑‍💻 Voter Module Interfaces

### Election Selection Interface

![Election Selection Interface](./Docs/assets/voter/electionuser.png)

Voters can view elections based on their current status, including pending and active elections, and select an election to proceed to the voting phase.

---

### Voting Interface

![Voting Interface View 1](./Docs/assets/voter/vote.png)
![Voting Interface View 2](./Docs/assets/voter/vote2.png)

This interface enables voters to cast votes per position. The system enforces voting constraints, performs input validation, and ensures that all submissions comply with predefined voting rules before acceptance.

---

## 📌 Documentation Summary

The figures presented above collectively illustrate the system’s distributed architecture, containerized deployment model, administrative management capabilities, real-time vote tracking, and voter interaction workflow. These visuals support the architectural and implementation decisions described throughout this documentation.

---

