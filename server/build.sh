#!/bin/bash

echo "===================================="
echo "Stopping containers..."
echo "===================================="
docker compose down -v

echo "===================================="
echo "Fixing MySQL config permissions..."
echo "===================================="
# Make sure CNF files are not world-writable
chmod 644 ./master/conf/mysql.cnf
chmod 644 ./slave/conf/mysql.cnf

echo "===================================="
echo "Building backend images..."
echo "===================================="
docker compose build

echo "===================================="
echo "Starting MySQL containers..."
echo "===================================="
docker compose up -d mysql_master mysql_slave1 mysql_slave2

echo "===================================="
echo "Waiting for MySQL master..."
echo "===================================="
# simple wait loop
until docker exec mysql_master mysql -uroot -p111 -e "SELECT 1;" >/dev/null 2>&1; do
    echo "Waiting for mysql_master..."
    sleep 3
done

echo "===================================="
echo "Creating replication user..."
echo "===================================="
# Your replication user creation script here

echo "===================================="
echo "Configuring slaves..."
echo "===================================="
# Your slave configuration script here

echo "===================================="
echo "Initializing database via init.js..."
echo "===================================="
docker compose run --rm backend1 node src/database/init.js

echo "===================================="
echo "Starting backend servers..."
echo "===================================="
docker compose up -d backend1 backend2 backend3

echo "===================================="
echo "Build & Initialization Complete!"
echo "===================================="
