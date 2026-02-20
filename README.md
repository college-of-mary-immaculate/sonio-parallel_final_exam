
---

## 📸 Architecture Diagrams and System Interface Documentation

### System Architecture Diagram

<img src="./.Docs/assets/chart.png" alt="System Architecture Diagram" width="600"/>

This diagram illustrates the overall flow and distributed architecture of the voting system. Client requests are routed through a centralized load balancer to multiple backend servers. Real-time communication is coordinated using Redis, while persistent data storage is managed through a MySQL master–slave replication strategy consisting of one master database and two read replicas.

**Key Details:**

* 3 backend servers (each runs its own WebSocket server)
* Redis synchronizes events across backends for **real-time updates**
* MySQL master handles all writes, slaves handle reads for scalability

---

## 🐳 Containerized Deployment Overview

<img src="./.Docs/assets/docker.png" alt="Docker Deployment Overview" width="600"/>

Each component—including the client, backend servers, load balancer, Redis, and MySQL databases—is deployed in its own Docker container.

**Key Details:**

* Stateless backend design allows horizontal scaling
* Nginx load balancer handles both **HTTP API requests** and **WebSocket connections**
* Deployment uses Docker Compose for automated startup and initialization

---

## 🛠️ Administrative Module Interfaces

### Candidate Management Interface

<img src="./.Docs/assets/admin/candidatemanagement.png" alt="Candidate Management Interface" width="500"/>

Administrators can **add, edit, remove, and display candidates**.

**Key Details:**

* Operations update the database through the backend APIs
* Changes are immediately reflected in **real-time vote tracking**

---

### Election Management Interface

<img src="./.Docs/assets/admin/electionmanagement.png" alt="Election Management Interface" width="500"/>

Administrators can **add, edit, remove, and display elections**.

**Key Details:**

* Works with associated positions and candidates
* Live updates are sent to connected clients via Redis/WebSocket

---

### Position Management Interface

<img src="./.Docs/assets/admin/positionmanagement.png" alt="Position Management Interface" width="500"/>

Allows **management of election positions**, which organize the voting process.

**Key Details:**

* Positions are linked to elections and candidates
* Updates propagate to all active voter sessions in real time

---

### Real-Time Vote Tracking

<img src="./.Docs/assets/admin/livetracking.png" alt="Live Tracking View 1" width="500"/>  
<img src="./.Docs/assets/admin/livetracking2.png" alt="Live Tracking View 2" width="500"/>  
<img src="./.Docs/assets/admin/livetracking3.png" alt="Live Tracking View 3" width="500"/>

Displays live vote rankings and counts.

**Key Details:**

* Uses WebSockets coordinated with Redis for real-time updates
* No page refresh required
* Works seamlessly across multiple backend instances

---

## 🧑‍💻 Voter Module Interfaces

### Election Selection Interface

<img src="./.Docs/assets/voter/electionuser.png" alt="Election Selection Interface" width="500"/>

Voters can view elections and select which to participate in.

**Key Details:**

* Shows pending and active elections
* Selecting an election opens the voting page
* Real-time updates ensure accurate election status

---

### Voting Interface

<img src="./.Docs/assets/voter/vote.png" alt="Voting Interface View 1" width="500"/>  
<img src="./.Docs/assets/voter/vote2.png" alt="Voting Interface View 2" width="500"/>

Allows voters to cast votes per position.

**Key Details:**

* Enforces **vote limits and input validation**
* Updates are sent immediately to the live tracking interface
* Submissions are processed via backend APIs and recorded in MySQL

---

## 📌 Documentation Summary

The figures above illustrate the voting system’s:

* **Distributed architecture** with multiple backend instances
* **Containerized deployment** for isolation and scalability
* **Administrative modules** for managing elections, candidates, and positions
* **Real-time vote tracking** via WebSockets + Redis
* **Voter interaction flow** with constraints and validation

This setup demonstrates **scalable, real-time, and test-gated distributed system design**, while remaining simplified for demonstration and educational purposes.

---