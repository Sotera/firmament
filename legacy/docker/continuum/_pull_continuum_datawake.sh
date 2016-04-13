#!/bin/bash
docker run -dt --name data-container -h data-container jreeme/cntuum-data-container:0.9
docker run -dt --name mongo -h mongo --volumes-from data-container jreeme/cntuum-mongo:0.9
docker run -dt --name webapp -h webapp --link mongo:mongo -p 8701:8701 -p 3001:3001 jreeme/cntuum-webapp:0.9

