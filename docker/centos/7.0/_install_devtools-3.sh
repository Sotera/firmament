#!/bin/bash
sudo yum install -y centos-release-scl
sudo yum install -y devtoolset-3
sudo ln -s /opt/rh/devtoolset-3/root/usr/bin/* /usr/local/bin/
