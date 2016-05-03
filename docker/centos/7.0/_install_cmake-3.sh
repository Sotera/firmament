#!/bin/bash
sudo yum install -y wget
wget https://cmake.org/files/v3.5/cmake-3.5.2-Linux-x86_64.tar.gz
tar xvf cmake-3.5.2-Linux-x86_64.tar.gz
cd "cmake-3.5.2-Linux-x86_64/bin"
DIR=$(pwd)
cd -
sudo ln -s "$DIR"/* /usr/local/bin/
which cmake
