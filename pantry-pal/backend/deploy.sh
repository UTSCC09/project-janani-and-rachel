#!/usr/bin/sh
echo "Stopping and removing existing backend container..."
docker stop pp-backend-container
docker rm pp-backend-container
echo "Pruning docker system..."
docker system prune -f
echo "Building and running new backend container..."
docker build -t pp-backend .
docker run -d -p 8080:5000 --name pp-backend-container pp-backend