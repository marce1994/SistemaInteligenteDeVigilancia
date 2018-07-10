const { StreamCamera, Codec } = require("pi-camera-connect");
const fs = require("fs");
const cv = require('opencv4nodejs');

var locks = require('locks');
var mutex = locks.createMutex();

const streamCamera = new StreamCamera({
    codec: Codec.H264,
    fps: 10,
    width: 1920,
    height: 1080
});

const videoStream = streamCamera.createStream();

videoStream.on("start", function(data){
    console.log("Video stream has started");
});

videoStream.on("error", function(error){
    console.log(error);
});

videoStream.on("data",function(data){
    console.log(mutex.isLocked);
    try{
        if(!mutex.isLocked){
            mutex.lock(async function(){
                const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
                const matFromArray = new cv.Mat(Buffer.from(data), 1920, 1080, cv.CV_8UC3);
                const grayImg = matFromArray.bgrToGray();
                console.log("procesando imagen");
                const { objects, numDetections } = await classifier.detectMultiScaleAsync(grayImg);
                mutex.unlock();
            });
        }
    }catch(err){
        console.log(err);
        if(mutex.isLocked){
            mutex.unlock();
        }
    }
});

videoStream.on("end", function(data){
    console.log("Video stream has ended");
});

const runApp = async () => {
    await streamCamera.startCapture();

    while(true){
        try{
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

            // Wait for 5 seconds
            await new Promise(resolve => setTimeout(() => resolve(), 100000));

            writeStream.close();
        }catch(err){
            console.log(err);
        }
    }
};

runApp();
