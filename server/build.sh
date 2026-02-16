#!/bin/bash
set -e

echo "===================================="
echo "Stopping containers & volumes..."
echo "===================================="
docker compose down -v

echo "===================================="
echo "Building backend images..."
echo "===================================="
docker compose build

echo "===================================="
echo "Starting MySQL containers..."
echo "===================================="
docker compose up -d mysql_master mysql_slave1 mysql_slave2

echo "===================================="
echo "Waiting for MySQL containers..."
echo "===================================="
sleep 15

echo "===================================="
echo "Injecting MySQL configs INSIDE containers..."
echo "===================================="

docker cp ./db/master/conf/replication.cnf mysql_master:/etc/mysql/conf.d/replication.cnf
docker cp ./db/slave1/conf/replication.cnf mysql_slave1:/etc/mysql/conf.d/replication.cnf
docker cp ./db/slave2/conf/replication.cnf mysql_slave2:/etc/mysql/conf.d/replication.cnf

docker exec mysql_master sh -c "chmod 644 /etc/mysql/conf.d/replication.cnf"
docker exec mysql_slave1 sh -c "chmod 644 /etc/mysql/conf.d/replication.cnf"
docker exec mysql_slave2 sh -c "chmod 644 /etc/mysql/conf.d/replication.cnf"

echo "===================================="
echo "Restarting MySQL containers..."
echo "===================================="
docker restart mysql_master mysql_slave1 mysql_slave2

echo "===================================="
echo "Waiting for MySQL master..."
echo "===================================="
until docker exec mysql_master mysql -uroot -p111 -e "SELECT 1;" >/dev/null 2>&1; do
  sleep 3
done

echo "===================================="
echo "Creating replication user..."
echo "===================================="
docker exec mysql_master mysql -uroot -p111 -e "
CREATE USER IF NOT EXISTS 'repl_user'@'%' IDENTIFIED BY 'repl_pass';
GRANT REPLICATION SLAVE ON *.* TO 'repl_user'@'%';
FLUSH PRIVILEGES;
"

echo "===================================="
echo "Getting master log position..."
echo "===================================="
MASTER_STATUS=$(docker exec mysql_master mysql -uroot -p111 -e "SHOW MASTER STATUS\G")
MASTER_FILE=$(echo "$MASTER_STATUS" | awk '/File:/ {print $2}')
MASTER_POS=$(echo "$MASTER_STATUS" | awk '/Position:/ {print $2}')

echo "===================================="
echo "Configuring slaves..."
echo "===================================="
for SLAVE in mysql_slave1 mysql_slave2; do
  docker exec $SLAVE mysql -uroot -p111 -e "
STOP REPLICA;
RESET REPLICA ALL;
CHANGE MASTER TO
  MASTER_HOST='mysql_master',
  MASTER_USER='repl_user',
  MASTER_PASSWORD='repl_pass',
  MASTER_LOG_FILE='$MASTER_FILE',
  MASTER_LOG_POS=$MASTER_POS,
  GET_MASTER_PUBLIC_KEY=1;
START REPLICA;
"
done

echo "===================================="
echo "Verifying replication..."
echo "===================================="
for SLAVE in mysql_slave1 mysql_slave2; do
  echo \"--- $SLAVE ---\"
  docker exec $SLAVE mysql -uroot -p111 -e "SHOW REPLICA STATUS\G" | \
  grep -E "Replica_IO_Running|Replica_SQL_Running"
done

echo "===================================="
echo "Initializing database (MASTER ONLY)..."
echo "===================================="
docker compose run --rm backend1 node src/database/init.js

echo "===================================="
echo "Starting backend servers..."
echo "===================================="
docker compose up -d backend1 backend2 backend3

echo "===================================="
echo "BUILD & REPLICATION COMPLETE ✅"
echo "===================================="
