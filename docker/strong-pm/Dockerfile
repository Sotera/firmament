FROM ubuntu:15.04

RUN apt-get update
RUN apt-get install -y git
RUN apt-get install -y vim
RUN apt-get install -y procps
RUN apt-get install -y curl
RUN apt-get install -y python

RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get install -y nodejs

RUN useradd -ms /bin/bash strong-pm
RUN chown -R strong-pm:strong-pm /usr/local

RUN apt-get install -y build-essential

#RUN su strong-pm -c "npm install -g strong-pm && npm cache clear"
#RUN su strong-pm -c "npm install -g strongloop && npm cache clear"
#RUN su strong-pm -c "npm install -g bower && npm cache clear"
RUN npm install -g strong-pm && npm cache clear
RUN npm install -g strongloop && npm cache clear

# Set up some semblance of an environment
WORKDIR /home/strong-pm
ENV HOME=/home/strong-pm

# Run as non-privileged user inside container
USER strong-pm

# Expose strong-pm port
EXPOSE 8701

ENTRYPOINT ["/usr/bin/sl-pm", "--base", ".", "--listen", "8701"]

