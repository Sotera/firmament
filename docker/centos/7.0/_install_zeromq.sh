#!/bin/bash
sudo yum install -y git
git clone https://github.com/zeromq/libzmq
cd libzmq
mkdir cmake-build
cd cmake-build
cmake .. 
make -j 4
sudo make install
sudo ldconfig
sudo sh -c 'echo "/usr/local/lib" > /etc/ld.so.conf.d/usrlocal.conf'
sudo ldconfig -v|grep zmq
