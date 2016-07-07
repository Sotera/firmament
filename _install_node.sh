#!/usr/bin/env bash
if ! type "curl" >/dev/null;
    then
        echo ""; echo "Curl is required but not installed. To install:"
        echo ""; echo "  Ubuntu/Debian: $ sudo apt-get install -y curl"
        echo "  RedHat/CentOS: $ sudo yum install -y curl"
        echo ""; echo "Then try this script again!"
        exit 1
fi

sudo sh -c "curl https://nodejs.org/dist/v5.9.1/node-v5.9.1-linux-x64.tar.gz | tar -C /usr/local --strip-components 1 -xzv && /usr/local/bin/npm i -g firmament"
firmament
