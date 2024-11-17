#!/usr/bin/sh
echo "Stopping and removing existing frontend container..."
echo "Building and running new frontend container..."
docker build -t pp-frontend -f ./frontend/Dockerfile .

echo "Stopping and removing existing backend container..."
echo "Building and running new backend container..."
docker build -t pp-backend -f ./backend/Dockerfile .

docker compose down --remove-orphans
docker rmi $(docker images --filter "dangling=true" -q --no-tru+nc)
docker compose up -d
