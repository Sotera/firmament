#!/bin/bash
update-alternatives --config editor
echo 'set -o vi' >> ~/.bashrc
echo "alias d='/usr/bin/docker'" >> ~/.bashrc
echo "alias f='~/firmament/firmament.js'" >> ~/.bashrc
echo 'set nu' >> ~/.vimrc
git config --global user.email "user@nowhere.com"
git config --global user.name "user nowhere"
#Continuous integration so bower won't ask for statistics
export CI=true
