const { StreamCamera, Codec } = require("pi-camera-connect");
const fs = require("fs");
const cv = require('opencv4nodejs');

const streamCamera = new StreamCamera({
    codec: Codec.H264,
    fps: 10,
    width: 480,
    height: 640
});

const videoStream = streamCamera.createStream();

videoStream.on("start", function(data){
    console.log("Video stream has started");
});

videoStream.on("error", function(error){
    console.log(error);
});

let processing = false;

videoStream.on("data",function(data){
    if(!processing){
        processing = true;
        console.log('procesando imagen'+Date.now());
        const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
        const matFromArray = new cv.Mat(Buffer.from(data), 640, 480, cv.CV_8UC3);
        const grayImg = matFromArray.bgrToGray();
        classifier.detectMultiScaleAsync(grayImg, function(objects, numDetections){
            processing = false;
            console.log(objects, numDetections);
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
    });
    
    writeStream.on("error",function(err){
        console.log(err);
    });

    setImmediate(function(){
        videoStream.unpipe(writeStream);
    });
}, 10000);