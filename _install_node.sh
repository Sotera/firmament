#!/usr/bin/env bash
if ! type "curl" >/dev/null;
    then
        echo ""; echo "Curl is required but not installed. To install:"
        echo ""; echo "  Ubuntu/Debian: $ sudo apt-get install -y curl"
        echo "  RedHat/CentOS: $ sudo yum install -y curl"
        echo ""; echo "Then try this script again!"
        exit 1
fi

sudo sh -c "curl https://nodejs.org/dist/v5.9.1/node-v5.9.1-linux-x64.tar.xz | tar -C /usr/local --strip-components 1 -xJ"
#sudo sh -c "curl https://nodejs.org/dist/v5.9.1/node-v5.9.1-linux-x64.tar.xz | tar -xJ --directory /var/local"
#sudo sh -c "curl https://nodejs.org/dist/v6.1.0/node-v6.1.0-linux-x64.tar.xz | tar -xJ --directory /var/local"
#sudo ln -s /var/local/node-v6.1.0-linux-x64/bin/* /usr/local/bin/
#sudo ln -s /var/local/node-v5.9.1-linux-x64/bin/node /usr/local/bin/
#sudo ln -s /var/local/node-v5.9.1-linux-x64/bin/npm /usr/local/bin/
sudo npm i -g firmament
