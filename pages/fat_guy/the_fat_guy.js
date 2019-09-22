var player;
var foods = [];
var foodCount = 10;

function setup() {
    createCanvas(800, 500);

    player = new Player();
    
    for(var i = 0; i < foodCount; i++){
        foods[i] = new Food();
    }
}

function draw() {
    background(100);

    // Faz o chao
    fill(200,30,200);
    stroke(200,30,200);
    rect(0, height - 10, width, 10);

    for(var i = 0; i < foodCount; i++){
        foods[i].update();
        foods[i].show();
    }

    player.update();
    player.show();
}

function Player(){
    this.size = 25;
    this.x = 50;
    this.y = height - this.size - 10;

    this.eat = function(){

    }

    this.death = function(){

    }

    this.update = function(){
        this.eat();
        this.death();
    }

    this.show = function(){
        fill(255);
        stroke(0);
        strokeWeight(2);
        rect(this.x, this.y, this.size, this.size);
    }
}

function Food(){
    this.size = 25;
    this.x = random(width + 50, width * 2);
    this.y = random(height - 100, height - this.size - 10);
    this.xSpeed = -5;

    this.update = function(){
        this.x += this.xSpeed;

        if(this.x + this.size < 0){
            this.x = random(width + 50, width * 2);
            this.y = random(height - 100, height - this.size - 10);
        }
    }

    this.show = function(){
        fill(0,255,0);
        stroke(0,255,0);
        rect(this.x, this.y, this.size, this.size);
    }
}