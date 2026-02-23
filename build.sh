#!/bin/bash
set -e

echo "Grant permission for the databases! master, slave1 and slave2!"

chmod +x build.sh
chmod 644 ./server/db/master/conf/replication.cnf
chmod 644 ./server/db/slave1/conf/replication.cnf
chmod 644 ./server/db/slave2/conf/replication.cnf

echo "===================================="
echo "Stopping containers & volumes..."
echo "===================================="
docker compose down -v

echo "===================================="
echo "Building ALL images (backend + client)..."
echo "===================================="

# Fail-fast build with echo if tests fail
if ! docker compose build; then
  echo "❌ Docker build failed — likely due to failing tests!"
  exit 1
fi
echo "✅ Build succeeded, continuing..."

echo "===================================="
echo "Starting MySQL master container..."
echo "===================================="
docker compose up -d mysql_master

echo "===================================="
echo "Waiting for MySQL master to be ready..."
echo "===================================="
until docker exec mysql_master mysql -uroot -p111 -e "SELECT 1;" >/dev/null 2>&1; do
  sleep 3
done

echo "===================================="
echo "Injecting master MySQL config..."
echo "===================================="
docker cp ./server/db/master/conf/replication.cnf mysql_master:/etc/mysql/conf.d/replication.cnf
docker exec mysql_master sh -c "chmod 644 /etc/mysql/conf.d/replication.cnf"
docker restart mysql_master
sleep 5

until docker exec mysql_master mysql -uroot -p111 -e "SELECT 1;" >/dev/null 2>&1; do
  sleep 3
done

echo "===================================="
echo "Creating replication user on master..."
echo "===================================="
docker exec mysql_master mysql -uroot -p111 -e "
  CREATE USER IF NOT EXISTS 'repl_user'@'%' IDENTIFIED BY 'repl_pass';
  GRANT REPLICATION SLAVE ON *.* TO 'repl_user'@'%';
  GRANT ALL PRIVILEGES ON voting_system.* TO 'repl_user'@'%';
  FLUSH PRIVILEGES;
"

echo "===================================="
echo "Starting MySQL slave containers..."
echo "===================================="
docker compose up -d mysql_slave1 mysql_slave2

echo "===================================="
echo "Waiting for slaves..."
echo "===================================="
until docker exec mysql_slave1 mysql -uroot -p111 -e "SELECT 1;" >/dev/null 2>&1; do sleep 3; done
until docker exec mysql_slave2 mysql -uroot -p111 -e "SELECT 1;" >/dev/null 2>&1; do sleep 3; done

echo "===================================="
echo "Injecting slave configs..."
echo "===================================="
docker cp ./server/db/slave1/conf/replication.cnf mysql_slave1:/etc/mysql/conf.d/replication.cnf
docker cp ./server/db/slave2/conf/replication.cnf mysql_slave2:/etc/mysql/conf.d/replication.cnf
docker exec mysql_slave1 sh -c "chmod 644 /etc/mysql/conf.d/replication.cnf"
docker exec mysql_slave2 sh -c "chmod 644 /etc/mysql/conf.d/replication.cnf"

docker restart mysql_slave1 mysql_slave2
sleep 5

until docker exec mysql_slave1 mysql -uroot -p111 -e "SELECT 1;" >/dev/null 2>&1; do sleep 3; done
until docker exec mysql_slave2 mysql -uroot -p111 -e "SELECT 1;" >/dev/null 2>&1; do sleep 3; done

echo "===================================="
echo "Resetting master and getting position..."
echo "===================================="
docker exec mysql_master mysql -uroot -p111 -e "RESET MASTER;"
docker exec mysql_master mysql -uroot -p111 -e "CREATE DATABASE IF NOT EXISTS voting_system;"

MASTER_STATUS=$(docker exec mysql_master mysql -uroot -p111 -e "SHOW MASTER STATUS\G")
MASTER_FILE=$(echo "$MASTER_STATUS" | awk '/File:/ {print $2}')
MASTER_POS=$(echo "$MASTER_STATUS" | awk '/Position:/ {print $2}')

echo "Master File: $MASTER_FILE"
echo "Master Position: $MASTER_POS"

echo "===================================="
echo "Initializing DB tables..."
echo "===================================="
docker compose run --rm backend1 node src/database/init.js

echo "===================================="
echo "Configuring slaves..."
echo "===================================="
for SLAVE in mysql_slave1 mysql_slave2; do
  docker exec $SLAVE mysql -uroot -p111 -e "
    STOP REPLICA;
    RESET REPLICA ALL;
    CHANGE REPLICATION SOURCE TO
      SOURCE_HOST='mysql_master',
      SOURCE_USER='repl_user',
      SOURCE_PASSWORD='repl_pass',
      SOURCE_LOG_FILE='$MASTER_FILE',
      SOURCE_LOG_POS=$MASTER_POS,
      GET_SOURCE_PUBLIC_KEY=1;
    START REPLICA;
  "
done

sleep 3

echo "===================================="
echo "Verifying replication..."
echo "===================================="
for SLAVE in mysql_slave1 mysql_slave2; do
  echo "--- $SLAVE ---"
  docker exec $SLAVE mysql -uroot -p111 -e "SHOW REPLICA STATUS\G" | grep -E "Replica_IO_Running|Replica_SQL_Running|Seconds_Behind"
done

echo "===================================="
echo "Checking replicated data..."
echo "===================================="
for SLAVE in mysql_slave1 mysql_slave2; do
  echo "--- $SLAVE ---"
  docker exec $SLAVE mysql -uroot -p111 voting_system -e "SHOW TABLES;"
done

echo "===================================="
echo "Starting backend + nginx + client..."
echo "===================================="
docker compose up -d backend1 backend2 backend3 nginx client

echo "===================================="
echo "FULL SYSTEM READY ✅"
echo "Backend via nginx: http://localhost:8080"
echo "React client: http://localhost:5173"
echo "===================================="
