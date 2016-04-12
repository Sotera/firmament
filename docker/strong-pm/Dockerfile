FROM ubuntu:15.10

RUN apt-get update
RUN apt-get install -y git
RUN apt-get install -y vim
RUN apt-get install -y procps
RUN apt-get install -y curl
RUN apt-get install -y sudo

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 5.10.1

RUN curl -SLO "https://nodejs.org/dist/v5.10.1/node-v5.10.1-linux-x64.tar.gz"
RUN tar xvf "node-v5.10.1-linux-x64.tar.gz" -C /usr/local --strip-components=1
RUN useradd -ms /bin/bash strong-pm
RUN chown -R strong-pm:strong-pm /usr/local

RUN apt-get install -y build-essential
RUN npm install -g strong-pm && npm cache clear
RUN npm install -g strongloop && npm cache clear

# Set up some semblance of an environment
WORKDIR /home/strong-pm
ENV HOME=/home/strong-pm

# Run as non-privileged user inside container
USER strong-pm

# Expose strong-pm port
EXPOSE 8701 3001 3002 3003

ENTRYPOINT ["/usr/local/bin/sl-pm", "--base", ".", "--listen", "8701", "--json-file-db"]
#ENTRYPOINT ["/usr/local/bin/sl-pm", "--base", ".", "--listen", "8701"]
#ENTRYPOINT ["/bin/bash"]

