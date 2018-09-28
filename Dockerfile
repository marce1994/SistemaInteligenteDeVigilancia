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

RUN apt-get install pigpio

RUN npm i pi-camera-connect pigpio request shelljs

RUN apt-get install -y autoconf libtool g++ libcrypto++-dev libz-dev libsqlite3-dev libssl-dev libcurl4-openssl-dev libreadline-dev libpcre++-dev libsodium-dev libc-ares-dev libfreeimage-dev libavcodec-dev libavutil-dev libavformat-dev libswscale-dev libmediainfo-dev libzen-dev apt-transport-https

RUN wget https://mega.nz/linux/MEGAsync/Raspbian_8.0/arm/megacmd-Raspbian_8.0_armhf.deb

RUN dpkg -i megacmd-Raspbian_8.0_armhf.deb

RUN mkdir security-videos

RUN npm i rotating-file-stream raspivid

COPY appconfigs.json appconfigs.json

COPY app.js app.js

ENTRYPOINT [ "node", "app.js" ]

