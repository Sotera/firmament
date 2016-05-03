#!/bin/bash

sudo sh -c 'echo "[mongodb]" >/etc/yum.repos.d/mongodb.repo'
sudo sh -c 'echo "name=MongoDB Repository" >>/etc/yum.repos.d/mongodb.repo'
sudo sh -c 'echo "baseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64/" >>/etc/yum.repos.d/mongodb.repo'
sudo sh -c 'echo "gpgcheck=0" >>/etc/yum.repos.d/mongodb.repo'
sudo sh -c 'echo "enabled=1" >>/etc/yum.repos.d/mongodb.repo'

sudo yum -y update
sudo yum -y install mongodb-org mongodb-org-server
sudo systemctl start mongod
mongod --version
