var drops = [];
var dropsCount = 300;
var gravity = 0.1;
var wind = 0;

function setup() {
    createCanvas(500, 500);

    for(i = 0; i < dropsCount; i++){
        drops[i] = new Drop();
    }
}

function draw() {
    background(230, 230, 250);
    if(mouseX < 0){
        positionX = 0;
    }else if(mouseX > width){
        positionX = width;
    }else{
        positionX = mouseX;
    }
    wind = map(positionX, 0, width, -2, 2);   

    for(i = 0; i < dropsCount; i++){
        drops[i].fall();
        drops[i].show();
    }
}

function Drop(){
    this.x = random(-100, width + 100);
    this.y = random(-100, -600);
    this.xSpeed = wind;
    this.ySpeed = random(4,10);
    
    this.fall = function(){
        this.x += this.xSpeed;
        this.xSpeed = wind;
        this.y += this.ySpeed;
        this.ySpeed += gravity;

        if(this.y > height){
            this.x = random(0,width);
            this.y = random(-100, -200);
            this.ySpeed = random(4,10);
        }
    }

    this.show = function(){
        stroke(138, 43, 226);
        line(this.x, this.y, this.x + this.xSpeed, this.y + 10);
    }
}