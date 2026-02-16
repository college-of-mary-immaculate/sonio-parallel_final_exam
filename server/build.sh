#!/bin/bash

echo "Stopping containers..."
docker compose down

echo "Building images..."
docker compose build

echo "Starting MySQL containers..."
docker compose up -d mysql_master mysql_slave1 mysql_slave2

echo "Waiting for MySQL master..."

until docker exec mysql_master sh -c 'export MYSQL_PWD=111; mysql -u root -e ";"'
do
    echo "Waiting for mysql_master..."
    sleep 4
done

echo "Creating replication user..."

docker exec mysql_master sh -c \
'export MYSQL_PWD=111; mysql -u root -e "
CREATE USER IF NOT EXISTS '\''replica'\''@'\''%'\'' IDENTIFIED BY '\''replica123'\'';
GRANT REPLICATION SLAVE ON *.* TO '\''replica'\''@'\''%'\''; 
FLUSH PRIVILEGES;"'

docker_ip() {
    docker inspect --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$@"
}

MASTER_STATUS=$(docker exec mysql_master sh -c \
'export MYSQL_PWD=111; mysql -u root -e "SHOW MASTER STATUS\G"')

CURRENT_LOG=$(echo "$MASTER_STATUS" | grep File | awk '{print $2}')
CURRENT_POS=$(echo "$MASTER_STATUS" | grep Position | awk '{print $2}')

echo "Configuring slaves..."

for SLAVE in mysql_slave1 mysql_slave2
do
docker exec $SLAVE sh -c "
export MYSQL_PWD=111;
mysql -u root -e \"
STOP SLAVE;
CHANGE MASTER TO
MASTER_HOST='$(docker_ip mysql_master)',
MASTER_USER='replica',
MASTER_PASSWORD='replica123',
MASTER_LOG_FILE='$CURRENT_LOG',
MASTER_LOG_POS=$CURRENT_POS;
START SLAVE;
\""
done

echo "Initializing database tables via init.js..."

docker compose run --rm backend1 node src/database/init.js

echo "Starting backend servers..."

docker compose up -d backend1 backend2 backend3

echo "Done."
