# Run build.sh 
chmod +x build.sh
./build.sh


# Permission executable
chmod 644 ./master/conf/mysql.cnf
chmod 644 ./slave/conf/mysql.cnf

# docker fresh
docker compose down -v
docker volume prune -f



