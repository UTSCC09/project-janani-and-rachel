#!/usr/bin/sh
echo "Stopping and removing existing frontend container..."
docker stop pp-frontend-container
docker rm pp-frontend-container
echo "Pruning docker system..."
docker system prune -f
echo "Building and running new frontend container..."
docker build -t pp-frontend .

echo "Stopping and removing existing backend container..."
docker stop pp-backend-container
docker rm pp-backend-container
echo "Pruning docker system..."
docker system prune -f
echo "Building and running new backend container..."
docker build -t pp-backend .

docker compose down --remove-orphans
docker rmi $(docker images --filter "dangling=true" -q --no-tru+nc)
docker compose up -d
