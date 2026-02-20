
---

## 📸 Architecture Diagrams and System Interface Documentation

### System Architecture Diagram

![System Architecture Diagram](./Docs/assets/chart.png)

This diagram illustrates the overall system flow and distributed architecture of the voting system. A single client communicates with the platform through a centralized load balancer, which routes requests to multiple backend servers. Real-time communication is coordinated using Redis, while persistent data storage is handled through a MySQL master–slave replication setup consisting of one master database and two read replicas.

---

## 🐳 Containerized Deployment Overview

![Docker Deployment Overview](./Docs/assets/docker.png)

This figure presents the Dockerized environment of the system. All major components are deployed as independent containers, including the client application, backend services, load balancer, Redis service, and MySQL databases. This approach ensures service isolation, scalability, and consistent deployment across environments.

---

## 🛠️ Administrative Module Interfaces

### Candidate Management Interface

![Candidate Management](./Docs/assets/admin/candidatemanagement.png)

The candidate management module allows administrators to perform full lifecycle operations on candidates, including creation, modification, removal, and display of candidate records.

---

### Election Management Interface

![Election Management](./Docs/assets/admin/electionmanagement.png)

This interface enables administrators to manage elections by adding new elections, updating existing records, removing elections, and viewing all configured elections.

---

### Position Management Interface

![Position Management](./Docs/assets/admin/positionmanagement.png)

The position management module supports the creation, editing, deletion, and visualization of election positions, which serve as the basis for candidate assignment during elections.

---

### Real-Time Vote Tracking Interface

![Live Tracking View 1](./Docs/assets/admin/livetracking.png)
![Live Tracking View 2](./Docs/assets/admin/livetracking2.png)
![Live Tracking View 3](./Docs/assets/admin/livetracking3.png)

These views demonstrate the system’s real-time vote monitoring capability. Vote rankings and counts are updated dynamically using WebSocket communication coordinated through Redis, allowing administrators to observe election progress without requiring manual refresh.

---

## 🧑‍💻 Voter Module Interfaces

### Election Selection Interface

![Election Selection](./Docs/assets/voter/electionuser.png)

This interface allows voters to view available elections categorized by status, including pending and active elections. Users may select an active election and proceed to the voting process.

---

### Voting Interface

![Voting Interface 1](./Docs/assets/voter/vote.png)
![Voting Interface 2](./Docs/assets/voter/vote2.png)

The voting interface enables users to cast votes per position. The system enforces voting constraints, performs input validation, and ensures that vote submissions comply with predefined rules before final submission.

---

## 📌 Documentation Summary

The figures presented above collectively demonstrate the system’s distributed architecture, real-time communication capabilities, administrative management features, and voter interaction flow. They provide visual support for the design decisions implemented in the system, including containerized deployment, load balancing, WebSocket-based real-time updates, and database replication.

---
