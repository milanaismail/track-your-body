let handpose;
let video;
let predictions = [];
let indexX = 100;
let indexY = 100;
let thumbX = 400;
let thumbY = 400;
let diameter = 50;
let flowers = [];
let stems = [];
let allOnStem = false; // Flag to track if all flowers are on stems

function preload() {
    backgroundImage = loadImage('background.jpeg'); // Load the background image
}

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
    for (let i = 0; i < 4; i++) {
        flowers.push({
            x: random(50, width - 50), // Adjusted to ensure flowers stay within the frame
            y: random(50, height - 50), // Adjusted to ensure flowers stay within the frame
            diameter: 50, // Diameter of the flower
            drag: false
        });
    }

    // Initialize stem positions
    for (let i = 0; i < 4; i++) {
        stems.push({
            x: map(i, 0, 3, 100, width - 100),
            y: height - 180,
            color: color(181, 228, 134) 
        });
    }
}

function modelReady() {
    console.log('Model ready!');
}

function draw() {
    if (allOnStem) {
        // Set background to image if all flowers are on stems
        background(backgroundImage);
        predictions = [];
        // Stop filming
        video.stop();
        // Stop handpose network
        handpose.removeAllListeners('predict');
    } else {
        // Set background to video feed otherwise
        image(video, 0, 0, width, height);
    }

    drawStems();
    drawFlowers();
    drawKeypoints();
}

function drawStems() {
    for (let stem of stems) {
        fill(stem.color);
        rect(stem.x - 10, stem.y, 10, height - stem.y);
    }
}

function drawFlowers() {
    let countOnStem = 0; // Counter to track the number of flowers on stems
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

        // Check for collision with stems
        let onStem = false; // Flag to track if the flower is on a stem
        for (let j = 0; j < stems.length; j++) {
            let stem = stems[j];
            if (abs(flower.x - stem.x) < 15 && abs(flower.y - stem.y) < 20) {
                // If the flower is on the corresponding stem, change its color and set the flag
                flower.color = color(255, 162, 197);
                onStem = true;
                // Award a point
                // Add your point system logic here
            }
        }

        // Reset the color if the flower is not on any stem
        if (!onStem) {
            flower.color = color(243, 210, 255); // Reset to original color
        }

        // Check if the flower is on a stem
        if (onStem) {
            countOnStem++;
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

        drawFlower(flower.x, flower.y, flower.color); // Use the updated color
    }

    // Check if all flowers are on stems
    if (countOnStem === flowers.length) {
        allOnStem = true;
    } else {
        allOnStem = false;
    }
}

function drawFlower(x, y, petalColor) {
    fill(petalColor);
    // Petals
    ellipse(x - 20, y - 20, 50, 50);
    ellipse(x + 20, y - 20, 50, 50);
    ellipse(x - 20, y + 20, 50, 50);
    ellipse(x + 20, y + 20, 50, 50);
    // Center
    fill(255, 254, 214); // Yellow center
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
