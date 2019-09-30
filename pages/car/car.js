let STAGE_MAPPING   = 'MAPPING';
let STAGE_PLAYING   = 'PLAYING';
let MAX_ANGLE_CHANGE = 0.2;
let MAX_VELOCITY    = 2;
let MIN_VELOCITY    = 2;
let QUARTER_PI      = 3.14159265358979323846 / 4;
let lifespan        = 2000;
let count           = 0;
let robotCount      = 150;

var link_bg = 'http://miromannino.com/wp-content/uploads/ur2009-map.png'; // car_game.png
var color_street = [180,180,180,1];
var map_game = [];
var bg;
var stage = STAGE_MAPPING;
var lineMapping = 0;
var car;
var robots = [];
var angle;
var velocity;
var density;
var endGame;
var matingpool = [];
var generations = 1;

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

    background(bg);
    loadPixels();
    density = pixelDensity();
}

function draw() {
    background(bg);
    
    switch (stage) {
        case STAGE_MAPPING:
            gameMapping();
            break;
        
        case STAGE_PLAYING:
            read_keyboard();

            // Anda com a contagem
            count += 1;
            document.getElementById("lifespan").innerText = count;
            if(count == lifespan){
                count = 0;
            }else if(count == 50){
                // Inicia barra da morte!
                endGame = new EndGame();
            }else if(count > 50){
                endGame.update();
                endGame.show();
            }

            car.update();
            car.show();

            // adiciona os robot
            stillAlive = false;
            for(var i = 0; i < robotCount; i++){
                robots[i].update();
                robots[i].show();

                if(!robots[i].crashed && !robots[i].endGame){
                    stillAlive = true;
                }
            }
            
            if(!stillAlive){
                generations += 1;
                document.getElementById("generations").innerText = generations;

                // Já quebrou todos os carros
                count = 0;

                // Pega o robot com melhor aproveitamento
                var maxFit = 0;
                var bestCar;
                for(var i = 0; i < robotCount; i++){
                    if(robots[i].fitness > maxFit){
                        maxFit = robots[i].fitness;
                        bestCar = robots[i];
                    }
                }

                // Reinicia o melhor carro
                bestCar.position   = createVector(width / 2, 100);
                bestCar.velocity   = 0;
                bestCar.angle      = PI;
                bestCar.wheel      = 0;
                bestCar.crashed    = false;
                bestCar.endGame    = false;
                bestCar.fitness    = 0;

                // Normaliza os dados
                for(var i = 1; i < robotCount; i++){
                    robots[i].fitness = robots[i].fitness / maxFit;
                }

                // Cria a listas de robos baseado no fitness, onde quanto maior o fitness melhor
                matingpool = [];
                for(var i = 0; i < robotCount; i++){
                    var n = robots[i].fitness * 100;
                    for(var j = 0; j < n; j++){
                        matingpool.push(robots[i]);
                    }
                }

                // Cria a seleção dos robots, realizandos uma mistura entre eles
                robots[0] = bestCar;
                robots[1] = new Car();
                for(var i = 2; i < robotCount; i++){
                    var parentA = random(matingpool).dna;
                    var parentB = random(matingpool).dna;
                    var child = parentA.crossover(parentB);

                    robots[i] = new Car(child);
                }
            }

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

function EndGame(){
    this.x1 = 380;
    this.y1 = 0;
    this.x2 = 380;
    this.y2 = 140;
    this.stage = 1;

    this.checkEndGame = function(car){
        if((this.x1 <= car.position.x && this.y1 <= car.position.y && this.x2 >= car.position.x && this.y2 >= car.position.y) || (this.x1 >= car.position.x && this.y1 >= car.position.y && this.x2 <= car.position.x && this.y2 <= car.position.y)){
            return true;
        }

        return false;
    }

    this.update = function(){
        switch (this.stage) {
            case 1:
                this.x1 -= 1;
                this.x2 -= 1;
                this.y2 += 0.15;

                if(this.x1 == 0){
                    this.stage = 2;

                    this.x1 = 0;
                    this.x2 = 0;
                    this.y1 = 140;
                    this.y2 = height;
                }
                break;
            
            case 2:
                this.x1 += 1;
                this.x2 += 1;

                if(this.x1 == 270){
                    this.stage = 3;

                    this.x1 = 270;
                    this.x2 = 410;
                    this.y1 = height;
                    this.y2 = height;
                }
                break;
            
            case 3:
                this.y1 -= 1;
                this.y2 -= 1;

                if(this.y1 == 140){
                    this.stage = 4;

                    this.x1 = 410;
                    this.x2 = 410;
                    this.y1 = 140;
                    this.y2 = height;
                }
                break;

            case 4:
                this.x1 += 1;
                this.x2 += 1;

                if(this.x1 == width){
                    this.stage = 5;

                    this.x1 = width;
                    this.x2 = width;
                    this.y1 = 0;
                    this.y2 = 150;
                }
                break;

            case 5:
                this.x1 -= 1;
                this.x2 -= 1;

                if(this.x1 == 380){
                    this.x1 = 380;
                    this.y1 = 0;
                    this.x2 = 380;
                    this.y2 = 140;

                    this.stage = 1;
                }
                break;
            
        }
    }

    this.show = function(){
        stroke(0, 0, 255);
        line(this.x1, this.y1, this.x2, this.y2);
    }
}

function gameMapping(){
    stroke(226, 204, 0);
    line(0, lineMapping - 1, width, lineMapping - 1);
    
    for(var i = 0; i < width; i++){
        // Mappeia esta linha
        let off = (lineMapping * width + i) * density * 4;
        let components = [
            pixels[off],
            pixels[off + 1],
            pixels[off + 2],
            pixels[off + 3]
        ];

        map_game[i][lineMapping] = isStreet(components);
    }

    // Avança para proxima linha
    lineMapping += 1;

    if (lineMapping > height) {
        car = new Car();
        car.robot = false;

        // adiciona os robot
        for(var i = 0; i < robotCount; i++){
            robots[i] = new Car();
        }

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

function Car(genes){
    // Inicia o carro no ponto inicial
    this.position   = createVector(width / 2, 100);
    this.velocity   = 0;
    this.angle      = PI;
    this.wheel      = 0;
    this.crashed    = false;
    this.endGame    = false;
    this.showSensor = false;
    this.robot      = true;
    this.dna        = new DNA(genes);
    this.fitness    = 0;

    // Adiciona os sensores no carro
    this.sensorFront        = distanceToCollision(this.position.x, this.position.y, this.angle);
    this.sensorFrontRight   = distanceToCollision(this.position.x, this.position.y, this.angle - QUARTER_PI);
    this.sensorFrontLeft    = distanceToCollision(this.position.x, this.position.y, this.angle + QUARTER_PI);
    this.sensorBack         = distanceToCollision(this.position.x, this.position.y, this.angle + PI);
    this.sensorRight        = distanceToCollision(this.position.x, this.position.y, this.angle - HALF_PI);
    this.sensorLeft         = distanceToCollision(this.position.x, this.position.y, this.angle + HALF_PI);

    this.direction = function(velocity, angle){
        this.wheel = angle;
        this.velocity = velocity;
    }

    this.update = function(){
        if(this.robot){
            if(!this.crashed && !this.endGame){
                // Adiciona aleatoriamente a acao do carro
                this.angle += this.dna.genes[count].angle;
                this.velocity = this.dna.genes[count].velocity;

                // Movimenta o carro
                this.move();
            }
        }else{
            if(this.velocity != 0){
                this.angle += this.wheel;
    
                this.move();
            }
        }
    }

    this.move = function(){
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
        
        if(!this.crashed && endGame != undefined){
            // Verifica se a linha da morte alcancou este carro
            this.endGame = endGame.checkEndGame(this);
        }

        if(!this.crashed && !this.endGame){
            // Atualiza o posicionamento do carro
            this.position.x     = newPositionX;
            this.position.y     = newPositionY;

            // Atualiza os sensores
            this.sensorFront        = distanceToCollision(this.position.x, this.position.y, this.angle);
            this.sensorFrontRight   = distanceToCollision(this.position.x, this.position.y, this.angle - QUARTER_PI);
            this.sensorFrontLeft    = distanceToCollision(this.position.x, this.position.y, this.angle + QUARTER_PI);
            this.sensorBack         = distanceToCollision(this.position.x, this.position.y, this.angle + PI);
            this.sensorRight        = distanceToCollision(this.position.x, this.position.y, this.angle - HALF_PI);
            this.sensorLeft         = distanceToCollision(this.position.x, this.position.y, this.angle + HALF_PI);
        }else{
            this.fitness = count;
        }
    }

    this.show = function(){
        // Adiciona o carro na pista
        push();
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        rectMode(CENTER);
        noStroke();

        if(this.robot){
            if(this.endGame){
                fill(50,30,50);
            }else if(this.crashed){
                fill(100,30,100);
            }else{
                fill(150,30,150);
            }
        }else{
            fill(255,0,0);
        }
        
        rect(0, 0, 20, 10);
        pop();

        if(this.showSensor){
            // Adiciona as linhas dos sensores
            stroke(0,0,255);
            line(this.position.x, this.position.y, this.sensorFront.x, this.sensorFront.y);
            line(this.position.x, this.position.y, this.sensorFrontLeft.x, this.sensorFrontLeft.y);
            line(this.position.x, this.position.y, this.sensorFrontRight.x, this.sensorFrontRight.y);
            line(this.position.x, this.position.y, this.sensorBack.x, this.sensorBack.y);
            line(this.position.x, this.position.y, this.sensorRight.x, this.sensorRight.y);
            line(this.position.x, this.position.y, this.sensorLeft.x, this.sensorLeft.y);
        }
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

function DNA(genes){
    if(genes){
        this.genes = genes;
    }else{
        this.genes = [];

        // Preenche os genes aleatoriamente
        for(var i = 0; i < lifespan; i++){
            this.genes[i] = { angle: random(-MAX_ANGLE_CHANGE, MAX_ANGLE_CHANGE), velocity: random(MIN_VELOCITY, MAX_VELOCITY) }
        }
    }

    this.crossover = function(partner){
        var newgenes = [];
        var mid = floor(random(this.genes.length));

        for(var i = 0; i < this.genes.length; i++){
            if(i < mid){
                newgenes[i] = this.genes[i];
            }else{
                newgenes[i] = partner.genes[i];
            }
        }

        return newgenes;
    }
}
