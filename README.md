# firmament
Provides a simplified configuration of interconnected [Docker containers](https://docker.com)
* Provides a straigtforward mechanism to deploy Node Express apps into Docker containers  
* Aliases and simplifies common Docker commands to make deploying, linking, and managing Docer containers easier.
* Composed of Node and Bash scripts utilizing API's from Docker, GIT, and Strongloop.

# How To Get firmament

## Install Node & Firmament with shell script (Easiest)
```
wget https://raw.githubusercontent.com/Sotera/firmament/typescript/_install_node.sh
sudo chmod 700 _install_node.sh
./_install_node
firmament lp ubuntu-14.04
<close your terminal and log back in for changes to take effect.>
```

## Manually install firmament
```Bash
$ wget https://github.com/sotera/firmament/raw/master/install-scripts/prep-ubuntu14.04.sh
$ sudo chmod 700 prep_ubuntu14.04.sh
$ sudo su
$ ./prep_ubuntu14.04.sh
exit
$ git clone https://github.com/Sotera/firmament
$ cd firmament/install-scripts
$ ./prep-client.sh
>> 3 for using vim
$ sudo usermod -aG docker ubuntu
<close your terminal and log back in for changes to take effect.>
```

# Usage
* List available commands ```$ f --help```
* Firmament pulls required modules as needed or you can get all required modules at once. ```$ f init```
* Create a template of lined Docker Containers (from ~/firmament). ```$ f m t```  
* Edit the template to create the containers you wish with links to the repositores that host your apps.
* Build the containers. ```$ f m b```
* Firmament aliases Docker as 'd'
 * ```$ docker ps``` == ```$ f d ps```
 * ```$ f d sh 5``` will shell into Docker Container #5 from the ps results.
