#!/bin/bash
curl --silent --location https://rpm.nodesource.com/setup_4.x | bash -
#curl --silent --location https://rpm.nodesource.com/setup_0.12 | bash -
yum install -y nodejs
yum install -y unzip
yum install -y krb5-devel
node --version
npm --version
