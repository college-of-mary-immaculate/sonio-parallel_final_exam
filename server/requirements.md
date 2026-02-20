# Run build.sh 
chmod +x build.sh
./build.sh


# Permission executable
chmod 644 ./master/conf/mysql.cnf
chmod 644 ./slave/conf/mysql.cnf

# docker fresh
docker compose down -v
docker volume prune -f

# Open mysql in docker
docker exec -it mysql_master mysql -uroot -p
docker exec -it mysql_slave1 mysql -uroot -p
docker exec -it mysql_slave2 mysql -uroot -p

# Install
npm install cors
npm install jsonwebtoken

# Live sync for docker
npm install -g nodemon

# websocket
npm install socket.io

# Install redis adapter
npm install @socket.io/redis-adapter ioredis

-------------------------------------------------------
System Design – Voting System Backend
Overview

This backend follows clean architecture principles with strict separation of concerns and Single Responsibility Principle (SRP). It is designed to be scalable, testable, and production-ready.

The system includes:

Dependency Injection (DI)

Feature-based module structure

WebSocket support using Socket.IO

Redis adapter for horizontal scaling

MySQL master-slave replication

Dockerized infrastructure

Clean bootstrap initialization



