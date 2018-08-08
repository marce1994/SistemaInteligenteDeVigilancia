const { StreamCamera, Codec } = require("pi-camera-connect");
const fs = require("fs");
const cv = require('opencv4nodejs');

var config = {
    fps: 10,
    width: 480,
    height: 640
}

const Gpio = require('pigpio').Gpio;
 
const led = new Gpio(14, {mode: Gpio.OUTPUT});

led.pwmWrite(0);

const streamCamera = new StreamCamera({
    codec: Codec.H264,
    fps: config.fps,
    width: config.width,
    height: config.height
});

const videoStream = streamCamera.createStream();

videoStream.on("start", function(data){
    console.log("Video stream has started");
});

videoStream.on("error", function(error){
    console.log(error);
});

let processing = false;
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);//haarcascade_frontalcatface.xml

videoStream.on("data",function(data){
    if(!processing){
        processing = true;
        console.log('procesando imagen'+Date.now());
        const matFromArray = new cv.Mat(Buffer.from(data), config.height, config.width, cv.CV_8UC3);
        const grayImg = matFromArray.bgrToGray();
        classifier.detectMultiScaleAsync(grayImg, function(objects, numDetections){
            console.log(objects, numDetections);
            setTimeout(function() {
                processing = false;
            }, 100);
        });
    }
});

videoStream.on("end", function(data){
    console.log("Video stream has ended");
});

streamCamera.startCapture();

setInterval(function(){
    name = (Date.now() / 1000 | 0) + ".h264";
    console.log("Nuevo archivo ("+name+")");
    const writeStream = fs.createWriteStream(name);

    // Pipe the video stream to our video file
    videoStream.pipe(writeStream);
    
    writeStream.on("finish",function(){
        console.log("Archivo grabado");
        writeStream.destroy();
    });
    
    writeStream.on("error",function(err){
        console.log(err);
    });

    setImmediate(function(){
        console.log("ESTO SE EJECUTA CADA 10000ms");
        videoStream.pause();
        videoStream.unpipe(writeStream);
        writeStream.end();
        setImmediate(function(){
            console.log('stream teoricamente cerrado.');
            videoStream.resume();
        });
    });
}, 100000);