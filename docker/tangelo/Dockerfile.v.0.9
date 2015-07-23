FROM ubuntu:15.04

RUN apt-get -y update \
    && apt-get -y upgrade

RUN apt-get install -y python-software-properties \
    && apt-get install -y software-properties-common \
    && apt-get -y install python-pip \
    && apt-get -y install python-dev

RUN apt-get -y install git \
    && apt-get -y install make \
    && apt-get -y install cmake

RUN apt-get install -y wget

# install the MITIE library
RUN apt-get install -y libjpeg-dev
RUN apt-get install -y build-essential
RUN apt-get install -y libopenblas-dev liblapack-dev
RUN mkdir /usr/lib/mitie \
    && cd /usr/lib/mitie \
    && git clone https://github.com/mitll/MITIE.git

RUN cd /usr/lib/mitie/MITIE \
    && make MITIE-models

RUN ln -s /usr/lib/x86_64-linux-gnu/libgfortran.so.3 /usr/lib/x86_64-linux-gnu/libgfortran.so

RUN cd /usr/lib/mitie/MITIE/tools/ner_stream \
    && mkdir build \
    && cd build \
    && cmake ..

RUN cd /usr/lib/mitie/MITIE/tools/ner_stream/build \
    && cmake --build . --config Release

RUN cd /usr/lib/mitie/MITIE/mitielib \
    && make

ENV MITIE_HOME /usr/lib/mitie/MITIE

# misc python libs

RUN pip install happybase
RUN pip install httplib2
RUN pip install tldextract

# install mysql client

RUN wget http://dev.mysql.com/get/Downloads/Connector-Python/mysql-connector-python-1.2.3.tar.gz \
    && tar xf mysql-connector-python-1.2.3.tar.gz \
    && cd mysql-connector-python-1.2.3/ \
    && python setup.py install

# install pyodbc
RUN apt-get -y install aptitude \
    && aptitude -y install g++ \
    && apt-get -y install unixodbc-dev \
    && pip install --allow-external pyodbc --allow-unverified pyodbc pyodbc

# install beautiful soup
RUN apt-get install -y python-bs4

# install tangelo
RUN pip install tangelo

# Install elastic search for the domain dive feature
RUN pip install elasticsearch

# copy over the web apps and conf
COPY datawake /usr/local/share/tangelo/web/datawake
COPY forensic /usr/local/share/tangelo/web/forensic
ENV PYTHONPATH /usr/local/share/tangelo/web:$PYTHONPATH

# setup tangelo conf and entry point for container
# set the default container command to run tangelo

RUN adduser --no-create-home --disabled-password --disabled-login --gecos "" tangelo
COPY tangelo.conf /etc/tangelo.conf
EXPOSE 80
CMD ["tangelo","-c","/etc/tangelo.conf"]

# install igraph
#JReeme sez: "Don't add this aptitude repo. It doesn't exist anymore and will break the
#container build. Just "apt-get install python-igraph" and everything will be fine.(01-JUL-2015)
#RUN add-apt-repository -y ppa:igraph/ppa
#RUN apt-get update
RUN apt-get install -y python-igraph

