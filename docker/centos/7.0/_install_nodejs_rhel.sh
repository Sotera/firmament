#!/bin/bash
#sudo curl --silent --location https://rpm.nodesource.com/setup_4.x | sudo bash -
#sudo yum install -y nodejs
sudo yum install -y wget
sudo yum install -y unzip
sudo yum install -y krb5-devel
pushd /var/local
sudo wget https://nodejs.org/dist/v6.1.0/node-v6.1.0.tar.gz
sudo tar xvf node-v6.1.0.tar.gz
cd node-v6.1.0
sudo ./configure
sudo make
sudo make install
node --version
npm --version
