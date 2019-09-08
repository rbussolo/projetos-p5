width = 500;
height = 500;
maxSize = 4;
maxSpeed = 30;
starCount = 100;
speed = 0;
stars = [];

function setup() {
    createCanvas(500, 500);

    for(i = 0; i < starCount; i++){
        stars[i] = new Star();
    }
}

function draw() {
    if(mouseX < 100){
        positionX = 100;
    }else if(mouseX > width){
        positionX = width;
    }else{
        positionX = mouseX;
    }
    speed = map(positionX, 0, width, 0, maxSpeed)

    background(0);
    translate(width / 2, height/ 2);

    for(i = 0; i < starCount; i++){
        stars[i].update();
        stars[i].show();
    }
}

class Star{
    constructor(){
        this.x = random(-width / 2, width / 2);
        this.y = random(-height / 2, height / 2);
        this.z = random(width);
    }

    update(){
        this.z = this.z - speed;

        if(this.z < 1){
            this.z = width;
            this.x = random(-width / 2, width / 2);
            this.y = random(-height / 2, height / 2);
        }
    }

    show(){
        fill(255);
        noStroke();

        this.sx = map(this.x / this.z, 0, 1, 0, width / 2);
        this.sy = map(this.y / this.z, 0, 1, 0, height / 2);
        this.s = map(this.z, 0, width, maxSize, 0);

        ellipse(this.sx, this.sy, this.s, this.s);
    }
}
