// Cria algumas constantes
let STAGE_MAPPING       = 'MAPPING';
let STAGE_EVALUATE      = 'VALUE_MAP';
let STAGE_PLAYING       = 'PLAYING';
let STAGE_CHECKING      = 'CHECKING';
let MAX_ANGLE_CHANGE    = 0.15;                          // Angulo maxima para fazer curva
let MAX_VELOCITY        = 2;                            // Velocidade Maxima do carro
let MIN_VELOCITY        = 2;                            // Velocidade Minima do carro
let QUARTER_PI          = 3.14159265358979323846 / 4;   // 1/4 do valor do PI
let MAX_COUNT           = 2000;                         // Quantidade maxima de quadras até reiniciar tudo
let MAX_ROBOT           = 100;                          // Quantidade maxima de robos
let start               = true;                         // Flag para saber se os robos devem estar funcionando ou não

let link_bg             = 'http://miromannino.com/wp-content/uploads/ur2009-map.png'; // car_game.png // Imagem de fundo
let color_street        = [180,180,180,1];              // Corres utilizadas para definir o que é rua e o que não é rua        
let stage               = STAGE_MAPPING;                // Estado que o jogo se encontra
let count               = 0;                            // Quantidade de quadros executados
let map_game            = [];                           // Mapeado a trajetoria da pista     
let map_value           = [];                           // Adicionado valores para determinar onde é mais perto da chegada
let robots              = [];                           // Array dos robos
let matingpool          = [];                           // Carros que podem compor a proxima geração
let lineMapping         = 0;                            // Posição que a linha se encontra no mapeamento    
let bg;                                                 // Imagem de fundo
let car;                                                // Carro do jogador
let density;                                            // Densidade de pixel na imagem
let endGame;                                            // Linha que vem destruindo os carros que ficam parados (Não esta funcionando corretamente)
let breakDna;

let generations         = 1;                            // Controle de gerações

// ---------------------------------- Funções do p5js ------------------------------------ //
function preload() {
    // Carrega a imagem de fundo
    bg = loadImage(link_bg);
}

function setup() {
    createCanvas(759, 389);

    // Inicia os valores do mapa
    initializeMap();

    // Adiciona o plano de fundo para capturar todos os pixel presente nele
    background(bg);

    // Carrega os pixels para conseguir mapear a estrada
    loadPixels();
    density = pixelDensity();
}

function draw() {
    // Adiciona o plano de fundo
    background(bg);
    
    // Define o que vai mostrar de acordo com o estado do jogo
    switch (stage) {
        case STAGE_MAPPING:
            // Mapeia a estrada
            gameMapping();

            break;

        case STAGE_EVALUATE:
            // Adiciona valores no mapa
            evaluateMap();

            break;
        
        case STAGE_PLAYING:
            read_keyboard();
            
            car.update();
            car.show();
            
            if(start){
                // Anda com a contagem
                count += 1;
                document.getElementById("lifespan").innerText = count;
                if(count == MAX_COUNT){
                    count = 0;
                }else if(count == 1){
                    // Inicia barra da morte!
                    endGame = new EndGame();
                }else if(count > 1){
                    endGame.update();
                    endGame.show();
                }

                // adiciona os robot
                stillAlive = false;
                for(var i = 0; i < MAX_ROBOT; i++){
                    robots[i].update();
                    robots[i].show();

                    if(!robots[i].crashed && !robots[i].endGame){
                        stillAlive = true;
                    }
                }

                if(!stillAlive){
                    generations += 1;
                    document.getElementById("generations").innerText = generations;

                    // Define a quebra de dna através do tempo maior dividido por 2
                    breakDna = Math.round(count / 2);

                    // Já quebrou todos os carros
                    count = 0;

                    // Pega o robot com melhor aproveitamento
                    var maxFit = 0;
                    var bestCar;
                    for(var i = 0; i < MAX_ROBOT; i++){
                        if(robots[i].fitness > maxFit){
                            maxFit = robots[i].fitness;
                            bestCar = robots[i];
                        }
                    }

                    // Reinicia o melhor carro
                    bestCar.position    = createVector(width / 2, 100);
                    bestCar.velocity    = 0;
                    bestCar.angle       = PI;
                    bestCar.wheel       = 0;
                    bestCar.crashed     = false;
                    bestCar.endGame     = false;
                    bestCar.fitness     = 0;

                    // Normaliza os dados
                    for(var i = 1; i < MAX_ROBOT; i++){
                        robots[i].fitness = robots[i].fitness / maxFit;
                    }

                    // Cria a listas de robos baseado no fitness, onde quanto maior o fitness melhor
                    matingpool = [];
                    for(var i = 0; i < MAX_ROBOT; i++){
                        var n = robots[i].fitness * 100;
                        for(var j = 0; j < n; j++){
                            matingpool.push(robots[i]);
                        }
                    }

                    // Cria a seleção dos robots, realizandos uma mistura entre eles
                    robots[0] = bestCar;
                    for(var i = 1; i < MAX_ROBOT; i++){
                        var parentA = random(matingpool).dna;
                        var parentB = random(matingpool).dna;
                        
                        if(random() <= 0.01){ // Adiciona mutação apenas em 1 por cento
                            parentB = new DNA();
                        }
                        
                        var child = parentA.crossover(parentB);

                        robots[i] = new Car(child);
                    }
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

function mouseClicked() {
    console.log('MouseX ' + mouseX);
    console.log('MouseY ' + mouseY);

    return false;
}

// ------------------------------------------------------------------------------------------ //

function initializeMap(){
    // Coloca que nada faz parte do map
    for(var i = 0; i < width; i++){
        map_game[i]     = [];
        map_value[i]    = [];

        for(var j = 0; j < height; j++){
            map_game[i][j] = false;
        }
    }
}

function EndGame(){
    this.x1 = 380;
    this.y1 = 0;
    this.x2 = 380;
    this.y2 = 140;
    this.value = 0;
    this.points = [];
    this.showLine = false;

    this.checkEndGame = function(car){
        // Verifica o valor atual do carro, caso seja menor que o valor do fim do jogo ele deve morrer
        if(map_value[Math.trunc(car.position.x)][Math.trunc(car.position.y)] <= this.value){
            return true;
        }

        return false;
    }

    this.update = function(){
        this.value += 1;
        this.points = [];
                
        // Verifica quais os pontos tem o valor atual do fim do jogo
        for(var i = 0; i < width; i++){
            for(var j = 0; j < height; j ++){
                if(map_value[i][j] == this.value){
                    this.points.push(createVector(i,j));
                }
            }
        }
    }

    this.show = function(){
        if(this.showLine){
            stroke(0, 0, 255);
        
            // Printa todos os pontos
            for(var i = 0; i < this.points.length; i++){
                point(this.points[i].x, this.points[i].y);
            }
        }
    }
}

function evaluateMap(){
    no_more_value = true;

    // Percorre todos os registros aumentando um do valor neles
    for(var i = 0; i < width; i++){
        for(var j = 0; j < height; j ++){
            if(map_value[i][j]){
                map_value[i][j] += 1;
            }
        }
    }

    // Percorre todos os registros para verificar se tem um novo valor adicionado
    for(var i = 0; i < width; i++){
        for(var j = 0; j < height; j ++){
            if(!map_value[i][j] && map_game[i][j] && (map_value[i - 1][j] > 1 || map_value[i + 1][j] > 1 || map_value[i][j - 1] > 1 || map_value[i][j + 1] > 1)){
                map_value[i][j] = 1;
                
                // Marca que teve valor alterado
                no_more_value = false;

                // Marca um ponto azul neste pixel
                stroke(0,0,255);
                point(i, j);
            }
        }
    }

    if(no_more_value){
        // Neste caso esta na hora iniciar o projeto de verdade
        car = new Car();
        car.robot = false;

        // adiciona os robot
        for(var i = 0; i < MAX_ROBOT; i++){
            robots[i] = new Car();
        }

        // Muda o estado do jogo para iniciado
        stage = STAGE_PLAYING;
    }
}

function gameMapping(){
    // Cria uma linha, para dar a impressão que algo esta sendo executado
    stroke(226, 204, 0);
    line(0, lineMapping - 1, width, lineMapping - 1);
    
    // Percorre todos os pixel horizontalmente
    for(var i = 0; i < width; i++){
        let off         = (lineMapping * width + i) * density * 4;
        let components  = [pixels[off], pixels[off + 1], pixels[off + 2], pixels[off + 3]];

        // Verifica se este pixel é uma estrada ou não
        map_game[i][lineMapping] = isStreet(components);
    }

    // Avança para proxima linha
    lineMapping += 1;

    if (lineMapping > height) {
        // Define uma barreira na chegada
        for(var i = 65; i < 145; i++){
            map_game[381][i] = false;
            map_game[382][i] = false;

            if(map_game[383][i]){
                map_value[383][i] = 1;
            }
        }

        // Muda para o estado de avaliação do mapa
        stage = STAGE_EVALUATE;
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
    this.count      = 0;

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
            this.count = count;
            this.fitness = map_value[Math.trunc(this.position.x)][Math.trunc(this.position.y)];
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
    // Cria as variaveis do angulo e velocidade
    var angle;
    var velocity;
    
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
    this.breakDna = 50;

    if(genes){
        this.genes = genes;
    }else{
        this.genes = [];

        // Preenche os genes aleatoriamente
        for(var i = 0; i < MAX_COUNT; i++){
            var randomAngle = Math.round(random(-MAX_ANGLE_CHANGE, MAX_ANGLE_CHANGE) * 100) / 100;
            this.genes[i] = { angle: randomAngle, velocity: random(MIN_VELOCITY, MAX_VELOCITY) }
        }
    }

    this.crossover = function(partner){
        var newgenes = [];
        var mid = Math.round(random(breakDna));

        for(var i = 0; i < this.genes.length / breakDna; i++){
            for(var j = 0; j < breakDna; j++){
                var index = i * breakDna + j;

                if(j < mid){
                    newgenes[index] = this.genes[index];
                }else{
                    newgenes[index] = partner.genes[index];
                }
            }
        }
        
        return newgenes;
    }
}
