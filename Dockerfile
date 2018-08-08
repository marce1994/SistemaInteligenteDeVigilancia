FROM resin/raspberrypi3-buildpack-deps:jessie

ENV NODE_VERSION 10.0.0

RUN curl -SLO "http://resin-packages.s3.amazonaws.com/node/v$NODE_VERSION/node-v$NODE_VERSION-linux-armv7hf.tar.gz" \
	&& tar -xzf "node-v$NODE_VERSION-linux-armv7hf.tar.gz" -C /usr/local --strip-components=1 \
	&& rm "node-v$NODE_VERSION-linux-armv7hf.tar.gz" \
	&& npm config set unsafe-perm true -g --unsafe-perm \
	&& rm -rf /tmp/*

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y build-essential \
    cmake \
    pkg-config \
    python3-dev \
    python3-numpy \
    python3-pip \
    libopenblas-dev

RUN apt-get install libraspberrypi-dev raspberrypi-kernel-headers -y
RUN usermod -a -G video root

#RUN npm i face-recognition
RUN npm i raspberry-pi-camera-native --unsafe-perm
RUN npm i jpeg-js node-raspistill
RUN npm i opencv4nodejs

RUN npm i locks

RUN npm i pi-camera-connect

COPY app.js app.js

ENTRYPOINT [ "node", "app.js" ]

