let STAGE_MAPPING = 'MAPPING';
let STAGE_PLAYING = 'PLAYING';
let MAX_ANGLE_CHANGE = 0.1;
let MAX_VELOCITY = 2;

var link_bg = 'http://miromannino.com/wp-content/uploads/ur2009-map.png'; // car_game.png
var color_street = [180,180,180,1];
var map_game = [];
var bg;
var stage = STAGE_MAPPING;
var lineMapping = 0;
var car;
var angle;
var velocity;

function preload() {
    // Carrega a imagem de fundo
    bg = loadImage(link_bg);
}

function setup() {
    createCanvas(759, 389);

    // Coloca que nada faz parte do map
    for(var i = 0; i < width; i++){
        map_game[i] = [];

        for(var j = 0; j < height; j++){
            map_game[i][j] = false;
        }
    }
}

function draw() {
    image(bg, 0, 0);
    
    switch (stage) {
        case STAGE_MAPPING:
            gameMapping();
            break;

        case STAGE_PLAYING:
            read_keyboard();

            car.update();
            car.show();
            break;

        default:
            for(var i = 0; i < map_game.length; i++){
                for(var j = 0; j < map_game[i].length; j++){
                    if(map_game[i][j]){
                        point(i, j);
                    }
                }   
            }
            break;
    }
}

function gameMapping(){
    stroke(226, 204, 0);
    line(0, lineMapping - 1, width, lineMapping - 1);

    // Mappeia esta linha
    for(var i = 0; i < width; i++){
        let p = get(i, lineMapping);
        map_game[i][lineMapping] = isStreet(p);
    }

    // Avança para proxima linha
    lineMapping += 1;

    if (lineMapping > height) {
        car = new Car();

        stage = STAGE_PLAYING;
    }
}

function isStreet(a){
    if(a[0] > color_street[0] && a[1] > color_street[1] && a[2] > color_street[2]){
        return true;
    }

    if(a[0] == a[1] && a[0] == a[2]){
        return true;
    }

    if(a[0] >= a[1] || a[2] >= a[1]){
        return true;
    }

    return false;
}

function arrayIsEqual(a, b){
    if(a.length != b.length){
        return false;
    }

    for(var i = 0; i < a.length; i++){
        if(a[i] != b[i]){
            return false;
        }
    }
    
    return true;
}

function Car(){
    this.position = createVector(width / 2, 100);
    this.velocity = 0;
    this.angle = PI;
    this.wheel = 0;
    this.crashed = false;
    this.sensorFront = distanceToCollision(this.position.x, this.position.y, this.angle);
    this.sensorBack = distanceToCollision(this.position.x, this.position.y, this.angle + PI);
    this.sensorRight = distanceToCollision(this.position.x, this.position.y, this.angle - HALF_PI);
    this.sensorLeft = distanceToCollision(this.position.x, this.position.y, this.angle + HALF_PI);

    this.direction = function(velocity, angle){
        this.wheel = angle;
        this.velocity = velocity;
    }

    this.update = function(){
        if(this.velocity != 0){
            this.angle += this.wheel;

            if(this.angle > TWO_PI){
                this.angle = this.angle - TWO_PI;
            }else if(this.angle < 0){
                this.angle += TWO_PI;
            }

            newPositionX = this.position.x;
            newPositionY = this.position.y;

            if(this.angle == 0){
                newPositionX += this.velocity;
            }else if(this.angle == HALF_PI){
                newPositionY -= this.velocity;
            }else if(this.angle == PI){
                newPositionX -= this.velocity;
            }else if(this.angle == PI + HALF_PI){
                newPositionY += this.velocity;
            }else if(this.angle == TWO_PI){
                newPositionX += this.velocity;
            }else{
                newPositionX += cos(this.angle) * this.velocity;
                newPositionY += sin(this.angle) * this.velocity;
            }

            // Verifica se a nova posição não ira bater em nada
            this.crashed = checkCollision(newPositionX, newPositionY);

            if(!this.crashed){
                // Atualiza o posicionamento do carro
                this.position.x     = newPositionX;
                this.position.y     = newPositionY;

                // Atualiza os sensores
                this.sensorFront    = distanceToCollision(this.position.x, this.position.y, this.angle);
                this.sensorBack     = distanceToCollision(this.position.x, this.position.y, this.angle + PI);
                this.sensorRight    = distanceToCollision(this.position.x, this.position.y, this.angle - HALF_PI);
                this.sensorLeft     = distanceToCollision(this.position.x, this.position.y, this.angle + HALF_PI);
            }
        }
    }

    this.show = function(){
        push();
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        rectMode(CENTER);
        noStroke();
        fill(255,0,0);
        rect(0, 0, 20, 10);
        pop();

        // Adiciona as linhas dos sensores
        stroke(0,0,255);
        line(this.position.x, this.position.y, this.sensorFront.x, this.sensorFront.y);
        line(this.position.x, this.position.y, this.sensorBack.x, this.sensorBack.y);
        line(this.position.x, this.position.y, this.sensorRight.x, this.sensorRight.y);
        line(this.position.x, this.position.y, this.sensorLeft.x, this.sensorLeft.y);
    }
}

function read_keyboard(){
    // Verifica se a seta esta sendo precionada
    right_arrow = keyIsDown(RIGHT_ARROW);
    left_arrow  = keyIsDown(LEFT_ARROW);
    up_arrow    = keyIsDown(UP_ARROW);
    down_arrow  = keyIsDown(DOWN_ARROW);

    // Controla a movimentação do jogador
    if(right_arrow && left_arrow){
        angle = 0;
    }else if(right_arrow){
        angle = MAX_ANGLE_CHANGE;
    }else if(left_arrow){
        angle = -MAX_ANGLE_CHANGE;
    }else{
        angle = 0;
    }

    if(up_arrow && down_arrow){
        velocity = 0;
    }else if(up_arrow){
        velocity = MAX_VELOCITY;
    }else if(down_arrow){
        velocity = - MAX_VELOCITY / 2;
    }else{
        velocity = 0;
    }

    car.direction(velocity, angle);
}

function checkCollision(x,y){
    return !map_game[Math.trunc(x)][Math.trunc(y)];
}

function distanceToCollision(x, y, angle){
    newX = x;
    newY = y;

    if(angle > TWO_PI){
        angle = angle - TWO_PI;
    }else if(angle < 0){
        angle += TWO_PI;
    }

    while(true){
        if(angle == 0){
            newX += MAX_VELOCITY;
        }else if(angle == HALF_PI){
            newY -= MAX_VELOCITY;
        }else if(angle == PI){
            newX -= MAX_VELOCITY;
        }else if(angle == PI + HALF_PI){
            newY += MAX_VELOCITY;
        }else if(angle == TWO_PI){
            newX += MAX_VELOCITY;
        }else{
            newX += cos(angle) * MAX_VELOCITY;
            newY += sin(angle) * MAX_VELOCITY;
        }

        if(checkCollision(newX, newY)){
            return createVector(newX, newY, int(dist(x, y, newX, newY)));
        };
    }
}
