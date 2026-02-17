#!/bin/bash
set -e

echo "===================================="
echo "Stopping containers & volumes (except databases)..."
echo "===================================="
# Stop everything except MySQL containers
docker compose stop backend1 backend2 backend3 nginx client
docker compose rm -f backend1 backend2 backend3 nginx client

echo "===================================="
echo "Building backend + client images..."
echo "===================================="
docker compose build backend1 backend2 backend3 client

echo "===================================="
echo "Starting backend + nginx + client..."
echo "===================================="
docker compose up -d backend1 backend2 backend3 nginx client

echo "===================================="
echo "System restarted ✅"
echo "Backend via nginx: http://localhost:8080"
echo "React client: http://localhost:5173"
echo "===================================="
