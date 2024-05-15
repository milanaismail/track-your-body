let handpose;
let video;
let predictions = [];
let indexX = 100;
let indexY = 100;
let thumbX = 400;
let thumbY = 400;
let diameter = 50;
let flowers = [];

function setup() {
    createCanvas(640, 480);
    noStroke();

    video = createCapture(VIDEO);
    video.size(width, height);

    handpose = ml5.handpose(video, modelReady);

    handpose.on('predict', results => {
        predictions = results;
    });

    video.hide();

    // Initialize flower positions
    for (let i = 0; i < 5; i++) {
        flowers.push({
            x: random(50, width - 50), // Adjusted to ensure flowers stay within the frame
            y: random(50, height - 50), // Adjusted to ensure flowers stay within the frame
            diameter: 50, // Diameter of the flower
            drag: false
        });
    }
}

function modelReady() {
    console.log('Model ready!');
}

function draw() {
    image(video, 0, 0, width, height);

    drawFlowers();
    drawKeypoints();
}

function drawFlowers() {
    for (let i = 0; i < flowers.length; i++) {
        let flower = flowers[i];
        let distance = dist(flower.x, flower.y, indexX, indexY);
        let hand = dist(thumbX, thumbY, indexX, indexY);

        if (hand < diameter || distance > 50) {
            flower.drag = false;
        } else if (distance < 50) {
            flower.drag = true;
        }

        if (flower.drag) {
            flower.x = indexX;
            flower.y = indexY;
        }

        // Check for collision with other flowers
        for (let j = 0; j < flowers.length; j++) {
            if (i !== j) {
                let otherFlower = flowers[j];
                let combinedRadius = flower.diameter / 2 + otherFlower.diameter / 2;
                let d = dist(flower.x, flower.y, otherFlower.x, otherFlower.y);
                if (d < combinedRadius) {
                    // If flowers are colliding, move them apart
                    let angle = atan2(flower.y - otherFlower.y, flower.x - otherFlower.x);
                    flower.x = otherFlower.x + cos(angle) * combinedRadius;
                    flower.y = otherFlower.y + sin(angle) * combinedRadius;
                }
            }
        }

        drawFlower(flower.x, flower.y);
    }
}

function drawFlower(x, y) {
    fill(255, 0, 0); // Red petals
    // Petals
    ellipse(x - 20, y - 20, 40, 40);
    ellipse(x + 20, y - 20, 40, 40);
    ellipse(x - 20, y + 20, 40, 40);
    ellipse(x + 20, y + 20, 40, 40);
    // Center
    fill(255, 255, 0); // Yellow center
    ellipse(x, y, 30, 30);
}

function drawKeypoints() {
    for (let i = 0; i < predictions.length; i++) {
        let prediction = predictions[i];
        let keypointF = prediction.landmarks[8];
        let keypointT = prediction.landmarks[4];
        thumbX = keypointT[0];
        thumbY = keypointT[1];
        fill(0, 255, 0);
        ellipse(keypointF[0], keypointF[1], 10, 10);

        fill(0, 0, 255);
        ellipse(thumbX, thumbY, 10, 10); // Draw thumb point

        indexX = keypointF[0];
        indexY = keypointF[1];
        ellipse(indexX, indexY, 10, 10);
    }
}
