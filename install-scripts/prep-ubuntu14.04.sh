#!/bin/bash
update-alternatives --config editor
echo 'set -o vi' >> ~/.bashrc
echo "alias d='/usr/bin/docker'" >> ~/.bashrc
echo "alias f='~/firmament/firmament.js'" >> ~/.bashrc
echo 'set nu' >> ~/.vimrc
apt-get update
apt-get install -y git
git config --global user.email "user@nowhere.com"
git config --global user.name "user nowhere"
apt-get install -y build-essential
wget http://nodejs.org/dist/v0.12.4/node-v0.12.4.tar.gz
tar xvf node-v0.12.4.tar.gz
#wget -qO- https://get.docker.com/ | sh
echo deb http://get.docker.com/ubuntu docker main > /etc/apt/sources.list.d/docker.list
apt-key adv --keyserver pgp.mit.edu --recv-keys 36A1D7869245C8950F966E92D8576A8BA88D21E9
apt-get update
apt-get install -y lxc-docker-1.6.0
usermod -aG docker jreeme
cd node-v0.12.4
./configure
make
make install
cd ..
rm node-v0.12.4.tar.gz
rm -rf node-v0.12.4
npm install -g bower
npm install -g strongloop
