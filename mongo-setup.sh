#!/bin/bash

set -e

if ! docker --version &> /dev/null; then
    echo "[ERROR]: Docker not found."
    exit 1
fi

echo "[INFO]: Removing old mongodb container if exists."
docker ps --quiet --all --filter "name=mongodb" | grep -q . && docker rm -f mongodb &> /dev/null

echo "[INFO]: Pulling mongo:latest image."
docker pull mongo:latest
echo "[INFO]: Creating new mongodb container on port 27017."
docker create --name mongodb -p 27017:27017 mongo:latest

echo "[INFO]: Successfully created mongodb container."
docker ps --all --filter "name=mongodb"
