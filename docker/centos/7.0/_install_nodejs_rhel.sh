#!/bin/bash
sudo curl --silent --location https://rpm.nodesource.com/setup_4.x | sudo bash -
sudo yum install -y nodejs
sudo yum install -y unzip
sudo yum install -y krb5-devel
node --version
npm --version
