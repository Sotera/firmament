FROM node:4

RUN apt-get update -y
RUN apt-get install software-properties-common -y
RUN apt-get install -y git
RUN apt-get install -y vim
RUN apt-get install -y procps
RUN apt-get install -y curl
RUN apt-get install -y python
RUN apt-get install -y sudo
RUN add-apt-repository -y ppa:webupd8team/java
RUN echo "deb http://ppa.launchpad.net/webupd8team/java/ubuntu trusty main" | tee /etc/apt/sources.list.d/webupd8team-java.list
RUN echo "deb-src http://ppa.launchpad.net/webupd8team/java/ubuntu trusty main" | tee -a /etc/apt/sources.list.d/webupd8team-java.list
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys EEA14886
RUN apt-get update -y; exit 0
RUN echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | sudo /usr/bin/debconf-set-selections
RUN apt-get install -y oracle-java8-installer

RUN useradd -ms /bin/bash strong-pm && echo "strong-pm:strong-pm" | chpasswd && adduser strong-pm sudo
RUN chown -R strong-pm:strong-pm /usr/local
RUN su strong-pm -c "npm install -g strong-pm && npm cache clear"

# Set up some semblance of an environment
WORKDIR /home/strong-pm
ENV HOME=/home/strong-pm

# Define commonly used JAVA_HOME variable
ENV JAVA_HOME /usr/lib/jvm/java-8-oracle

# Run as non-privileged user inside container
USER strong-pm

# Expose strong-pm port
EXPOSE 8701 3000 3001 3002 3003

ENTRYPOINT ["/usr/local/bin/sl-pm", "--base", ".", "--listen", "8701"]
#CMD ["/bin/bash"]




