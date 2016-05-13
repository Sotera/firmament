#!/bin/bash

sudo sh -c 'echo "[dockerrepo]" >/etc/yum.repos.d/docker.repo'
sudo sh -c 'echo "name=Docker Repository" >>/etc/yum.repos.d/docker.repo'
sudo sh -c 'echo "baseurl=http://yum.dockerproject.org/repo/main/centos/\$releasever/" >>/etc/yum.repos.d/docker.repo'
sudo sh -c 'echo "enabled=1" >>/etc/yum.repos.d/docker.repo'
sudo sh -c 'echo "gpgcheck=1" >>/etc/yum.repos.d/docker.repo'
sudo sh -c 'echo "gpgkey=https://yum.dockerproject.org/gpg" >>/etc/yum.repos.d/docker.repo'

sudo yum -y update
sudo yum -y install docker-engine
sudo chkconfig docker on
sudo systemctl start docker
sudo usermod -aG docker jreeme
docker --version
