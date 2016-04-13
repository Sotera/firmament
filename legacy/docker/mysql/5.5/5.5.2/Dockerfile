FROM jreeme/mysql:5.5.1

RUN apt-get -y update
RUN apt-get -y install git

RUN git clone https://github.com/sotera/Datawake
RUN cp /Datawake/dev-env/build_populated_db.sql .
RUN rm -rf /Datawake
