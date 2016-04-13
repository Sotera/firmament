#!/bin/bash
NEW_USER="docker"
useradd -m -d /home/$NEW_USER -N -G adm,cdrom,sudo,dip,plugdev,lpadmin,sambashare,docker -s /bin/bash $NEW_USER
passwd $NEW_USER
