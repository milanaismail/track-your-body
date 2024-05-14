let handpose;
let video;
let predictions = [];
let distance;
let hand;
let drag = false;
let indexX = 100;
let indexY = 100;
let thumbX = 400;
let thumbY = 400;
let circleX = 300;
let circleY = 40;
let radius = 50;
let diameter = radius*2;

function setup(){
    createCanvas(640, 480);
    noStroke();

    video = createCapture(VIDEO);
    video.size(width, height);

    handpose = ml5.handpose(video, modelReady);

    handpose.on('predict', results => {
        predictions = results;
    });

    video.hide();

}

function modelReady(){
    console.log('Model ready!');
}

function draw(){
    image(video, 0, 0, width, height);

    distance = dist(circleX, circleY, indexX, indexY);
    hand = dist(thumbX, thumbY, indexX, indexY);

    if(hand < diameter || distance > 50 ){
        drag = false;
    } else if(distance < 50){
        drag = true;
    }

    if(drag){
        circleX = indexX;
        circleY = indexY;
    }

    fill(255, 0, 0);
    circle(circleX, circleY, diameter);

    drawKeypoints();
}

function drawKeypoints(){
    for(let i = 0; i < predictions.length; i++){
        let prediction = predictions[i];
        let keypointF = prediction.landmarks[8];
        let keypointT = prediction.landmarks[4];
        thumbX = keypointT[0];
        thumbY = keypointT[1];
       fill(0, 255, 0);
         ellipse(keypointF[0], keypointF[1], 10, 10);

         indexX = keypointF[0];
            indexY = keypointF[1];
            ellipse(indexX, indexY, 10, 10);
    }
}