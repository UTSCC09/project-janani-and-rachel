#!/usr/bin/sh
sudo docker stop pp-backend-container
sudo docker rm pp-backend-container
sudo docker build -t pp-backend .
sudo docker run -d -p 8080:5000 --name pp-backend-container pp-backend