var raspivid = require('raspivid');
const fs = require("fs");
var shell = require('shelljs');
const cv = require('opencv4nodejs');
const request = require('request');
var RotatingFileStream = require('rotating-file-stream');

var config = JSON.parse(fs.readFileSync('appconfigs.json', 'utf8'));

shell.exec(config.mega.megaLogin,function(code, stdout, stderr) {
    console.log('Exit code:', stdout);
});
setTimeout(() => {
    shell.exec(config.mega.megaSync,function(code, stdout, stderr) {
        console.log('Program output:', stdout);
    });
}, 10000);

/*setInterval(function(){
    shell.exec(config.commands.getIp, function(code, stdout, stderr) {
        console.log('Program output:', stdout);
    });
}, 1000)*/

setInterval(function(){
    shell.exec("mega-sync",function(code, stdout, stderr) {
        console.log('Program output:', stdout);
    });
    /*shell.exec('cat /temperature/temp',function(code, stdout, stderr) {
        console.log('Program output:', stdout);
    });*/
    /*shell.exec("cat /root/.megaCmd/megacmdserver.log", function(code, stdout, stderr) {
        console.log('Program output:', stdout);
    });*/
}, 5000);

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
                console.log('ERROR', response)
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

var videoStream = raspivid({ timeout: 0, bitrate: 1000000 });

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

function generator(time, index) {
    return (Date.now() / 1000 | 0) + ".h264";
}


var writeStream = new RotatingFileStream(generator,  {
    interval: '1m',
    path: '/security-videos'
});

writeStream.on('error', function(err) {
    console.log(err);
    // here are reported blocking errors
    // once this event is emitted, the stream will be closed as well
});
 
writeStream.on('open', function(filename) {
    console.log(filename);
    // no rotated file is open (emitted after each rotation as well)
    // filename: useful if immutable option is true
});
 
writeStream.on('removed', function(filename, number) {
    // rotation job removed the specified old rotated file
    // number == true, the file was removed to not exceed maxFiles
    // number == false, the file was removed to not exceed maxSize
});
 
writeStream.on('rotation', function() {
    // rotation job started
});
 
writeStream.on('rotated', function(filename) {
    console.log(filename);
    // rotation job completed with success producing given filename
});
 
writeStream.on('warning', function(err) {
    console.log(err);
    // here are reported non blocking errors
});

videoStream.pipe(writeStream);

/*
var started = false;

setInterval(function(){
    name = (Date.now() / 1000 | 0) + ".h264";
    console.log("Nuevo archivo ("+name+")");
    const writeStream = fs.createWriteStream("/security-videos/" + name);

    // Pipe the video stream to our video file
    videoStream.pipe(writeStream);
    
    if(!started){
        streamCamera.startCapture();
        started = true;
    }

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
}, 100000);*/