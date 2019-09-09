var scl = 25;
var speed = 5;
var snake;
var food;

function setup() {
    createCanvas(500, 500);
    frameRate(speed);

    snake = new Snake(0,0);
    food = pickLocation();
}

function draw() {
    background(51);

    snake.update();
    snake.show();
    
    if(snake.eat(food)){
        // Cria a comida em outro lugar
        food = pickLocation();

        // A cobra agora cresce
        snake.lenght += 1;
    }

    fill(255, 0, 100);
    rect(food.x, food.y, scl, scl);
}

function pickLocation(){
    cols = floor((width - scl) / scl);
    rows = floor((height - scl) / scl);

    return createVector(floor(random(cols)) * scl, floor(random(rows)) * scl);
}

function keyPressed(){
    if(keyCode == UP_ARROW){
        snake.dir(0,-1);
    }else if(keyCode == DOWN_ARROW){
        snake.dir(0,1);
    }else if(keyCode == RIGHT_ARROW){
        snake.dir(1,0);
    }else if(keyCode == LEFT_ARROW){
        snake.dir(-1,0);
    }
}

function Snake(x, y){
    this.x = x;
    this.y = y;
    this.speedX = 1;
    this.speedY = 0;
    this.total = 2;
    this.tail = [createVector(0,0),createVector(0,0)];

    this.gameOver = function(){
        this.x = x;
        this.y = y;
        this.speedX = 1;
        this.speedY = 0;
        this.total = 2;
        this.tail = [createVector(0,0),createVector(0,0)];
    }

    this.death = function(){
        // Checa se a cobra esta saindo do cenário
        constrainX = constrain(this.x, 0, width - scl);
        constrainY = constrain(this.y, 0, height - scl);

        if(constrainX != this.x || constrainY != this.y){
            this.gameOver();
        }

        // Checa se a cobra bateu em alguma de sua calda
        for(i = 0; i < this.total; i++){
            distance = dist(this.x, this.y, this.tail[i].x, this.tail[i].y);

            if(distance < 1){
                this.gameOver();
            }
        }
    }

    this.eat = function(pos){
        distance = dist(this.x, this.y, pos.x, pos.y);
        
        if(distance < 1){
            this.total += 1;
            this.tail.push(pos);

            return true;
        }
        
        return false;
    }

    this.dir = function(x, y){
        this.speedX = x;
        this.speedY = y;
    }

    this.show = function(){
        fill(255);
        rect(this.x, this.y, scl, scl);

        for(i = 0; i < this.total; i++){
            rect(this.tail[i].x, this.tail[i].y, scl, scl);
        }
    }

    this.update = function(){
        for(i = this.total - 1; i > 0; i--){
            this.tail[i] = this.tail[i - 1];
        }

        if(this.total > 0){
            this.tail[0] = createVector(this.x, this.y);
        }

        this.x += this.speedX * scl;
        this.y += this.speedY * scl;

        this.death();
    }
}