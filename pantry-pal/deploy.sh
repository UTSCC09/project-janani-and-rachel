#!/usr/bin/sh
echo "going to frontend directory"
cd frontend
echo "Stopping and removing existing frontend container..."
echo "Building and running new frontend container..."
docker build -t pp-frontend .

echo "going out of frontend and into backend directory"
cd ..
cd backend
echo "Stopping and removing existing backend container..."
echo "Building and running new backend container..."
docker build -t pp-backend .

echo "going out of backend and into pantry-pal directory"
cd ..
docker compose down --remove-orphans
docker rmi $(docker images --filter "dangling=true" -q --no-tru+nc)
docker compose up -d

