#!/bin/bash
update-alternatives --config editor
echo 'set -o vi' >> ~/.bashrc
echo "alias d='/usr/bin/docker'" >> ~/.bashrc
echo "alias f='~/firmament/js/firmament.js'" >> ~/.bashrc
echo 'set nu' >> ~/.vimrc
git config --global user.email "john.reeme@soteradefense.com"
git config --global user.name "John Reeme"
