const { StreamCamera, Codec } = require("pi-camera-connect");
const fs = require("fs");
const cv = require('opencv4nodejs');
const request = require('request');

var config = {
    camera: {
        fps: 10,
        width: 480,
        height: 640
    },
    server: {
        address: '192.168.255.10',
        port: 45455
    }
}

//GPIO test.......
const Gpio = require('pigpio').Gpio;

const pirSensor = new Gpio(18, {
    mode: Gpio.INPUT,
    alert: true
});

function postToServer(endpoint, object){
    console.log('http://'+config.server.address+':'+config.server.port+'/api/'+endpoint);
    request.post(
        'http://'+config.server.address+':'+config.server.port+'/api/'+endpoint,
        { json: true, body: object},
        function (error, response, body) {
            console.log();
            if (!error && response.statusCode == 200) {
                console.log('OK')
            }else{
                console.log('ERROR', response.statusCode)
            }
        }
    );
}

const watchPIR = () => {
    let startTick;
    pirSensor.on('alert', (level, tick) => {
        if(level == 1){
            console.log('PIR on')
            postToServer("MovementDetection", {"timestamp":Date.now(), "info":"PIR Sensor Activated."});
        }else{
            console.log('PIR off')
        }
    });
};

watchPIR();
//------------------

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
    /*if(!processing){
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
    }*/
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