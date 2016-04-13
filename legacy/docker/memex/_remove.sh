#!/bin/bash
docker rm data-container
docker rm mysql
docker rm mongo
docker rm loopback
docker rm webapp
docker rm tangelo

#docker rmi jreeme/data-container:7.0
#docker rmi jreeme/mysql:7.0
#docker rmi jreeme/mongo:7.0
#docker rmi jreeme/loopback:7.0
#docker rmi jreeme/webapp:7.0
#docker rmi jreeme/tangelo:7.0
