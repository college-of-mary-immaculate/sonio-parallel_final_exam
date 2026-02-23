# Permission executable (if not done yet)
chmod 644 ./server/db/master/conf/replication.cnf
chmod 644 ./server/db/slave1/conf/replication.cnf
chmod 644 ./server/db/slave2/conf/replication.cnf

# Run build.sh 
chmod +x build.sh
./build.sh

# Install
npm install cors
npm install jsonwebtoken

# Live sync for docker
npm install -g nodemon

# websocket
npm install socket.io

# Install redis adapter
npm install @socket.io/redis-adapter ioredis

# Install needed for V SSR (Vite server side rendering)
npm install react react-dom express vite
# OR 
npm install react react-dom express vite @vitejs/plugin-react

# docker fresh
docker compose down -v
docker volume prune -f

# Open mysql in docker
docker exec -it mysql_master mysql -uroot -p
docker exec -it mysql_slave1 mysql -uroot -p
docker exec -it mysql_slave2 mysql -uroot -p




