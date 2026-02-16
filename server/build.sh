#!/bin/bash

echo "===================================="
echo "Stopping containers..."
echo "===================================="
docker compose down -v

echo "===================================="
echo "Fixing MySQL config permissions..."
echo "===================================="
chmod 644 ./db/master/conf/mysql.cnf
chmod 644 ./db/slave1/conf/mysql.cnf
chmod 644 ./db/slave2/conf/mysql.cnf

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
until docker exec mysql_master mysql -uroot -p111 -e "SELECT 1;" >/dev/null 2>&1; do
    echo "Waiting for mysql_master..."
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
echo "Configuring slaves..."
echo "===================================="
# Get master's current log position
MASTER_STATUS=$(docker exec mysql_master mysql -uroot -p111 -e "SHOW MASTER STATUS\G")
MASTER_FILE=$(echo "$MASTER_STATUS" | grep File | awk '{print $2}')
MASTER_POS=$(echo "$MASTER_STATUS" | grep Position | awk '{print $2}')

for SLAVE in mysql_slave1 mysql_slave2; do
    docker exec $SLAVE mysql -uroot -p111 -e "
        CHANGE MASTER TO
            MASTER_HOST='mysql_master',
            MASTER_USER='repl_user',
            MASTER_PASSWORD='repl_pass',
            MASTER_LOG_FILE='$MASTER_FILE',
            MASTER_LOG_POS=$MASTER_POS,
            GET_MASTER_PUBLIC_KEY=1;
        START SLAVE;
    "
done

echo "===================================="
echo "Verifying replication..."
echo "===================================="
for SLAVE in mysql_slave1 mysql_slave2; do
    docker exec $SLAVE mysql -uroot -p111 -e "SHOW SLAVE STATUS\G" | grep -E 'Slave_IO_Running|Slave_SQL_Running'
done

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
