# stop and remove containers
docker compose down
docker compose down -v (remove volume)

# build / rebuild images
docker compose build
docker compose build --no-cache

# start containers
docker compose up
docker compose up -d


# stop running containers
docker compose stop

# reset all
docker compose down -v --rmi all --remove-orphans

# remove unused resources
docker container prune

- unused images
docker image prune -a

- unused networks
docker network prune

- unused volumes
docker volume prune 

# Rebuild + restart
docker compose down -v
docker compose build --no-cache
docker compose up -d
