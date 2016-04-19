#!/bin/bash
yum install -y git
git clone https://github.com/zeromq/libzmq
cd libzmq
yum install -y cmake
mkdir cmake-build
cd cmake-build
cmake .. 
make -j 4
make install
ldconfig
echo "/usr/local/lib" > /etc/ld.so.conf.d/usrlocal.conf
ldconfig -v
