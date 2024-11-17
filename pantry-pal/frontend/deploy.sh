#!/usr/bin/sh
echo "Stopping and removing existing frontend container..."
docker stop pp-frontend-container
docker rm pp-frontend-container
echo "Pruning docker system..."
docker system prune -f
echo "Building and running new frontend container..."
docker build -t pp-frontend .
docker run -d -p 80:3000 --name pp-frontend-container pp-frontend