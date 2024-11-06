#!/usr/bin/sh
sudo docker stop pp-frontend-container
sudo docker rm pp-frontend-container
sudo docker build -t pp-frontend .
sudo docker run -d -p 80:3000 --name pp-frontend-container pp-frontend