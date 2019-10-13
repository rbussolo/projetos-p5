// Cria algumas constantes
let STAGE_MAPPING       = 'MAPPING';
let STAGE_EVALUATE      = 'VALUE_MAP';
let STAGE_PLAYING       = 'PLAYING';
let STAGE_CHECKING      = 'CHECKING';
let MAX_SENSORS         = 7;
let MAX_ANGLE_CHANGE    = 0.15;                         // Angulo maxima para fazer curva
let MAX_VELOCITY        = 2;                            // Velocidade Maxima do carro
let MIN_VELOCITY        = 0.5;                            // Velocidade Minima do carro
let QUARTER_PI          = 3.14159265358979323846 / 4;   // 1/4 do valor do PI
let MAX_COUNT           = 2000;                         // Quantidade maxima de quadras até reiniciar tudo
let MAX_ROBOT           = 100;                          // Quantidade maxima de robos
let start               = true;                         // Flag para saber se os robos devem estar funcionando ou não
let seq                 = 1;                            // Id sequencial para identificar cada carro
let link_bg             = 'http://miromannino.com/wp-content/uploads/ur2009-map.png'; // car_game.png // Imagem de fundo
let color_street        = [180,180,180,1];              // Corres utilizadas para definir o que é rua e o que não é rua        
let stage               = STAGE_MAPPING;                // Estado que o jogo se encontra
let count               = 0;                            // Quantidade de quadros executados
let map_game            = [];                           // Mapeado a trajetoria da pista     
let map_value           = [];                           // Adicionado valores para determinar onde é mais perto da chegada
let lineMapping         = 0;                            // Posição que a linha se encontra no mapeamento
let bg;                                                 // Imagem de fundo
let car;                                                // Carro do jogador
let density;                                            // Densidade de pixel na imagem
let endLine;                                            // Linha que vem destruindo os carros que ficam parados (Não esta funcionando corretamente)
let population;
let sensor_angle;
let using_net_neural    = true;
let sinValue            = [0, 0.43388373911, 0.78183148246, 0.97492791218, 0.97492791218, 0.78183148246, 0.43388373911, 0, 1];

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

    // Define a distancia de cada sensor
    sensor_angle = PI / MAX_SENSORS;
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
            // Realiza a leitura do teclado (usado para movimentar o carrinho controlado)
            read_keyboard();
            
            // Atualiza o carro
            car.update();
            car.show();
            
            if(start){
                // Controla as ações dos carros robos
                count += 1;
                
                // Atualiza a linha que mata os carros que estão andando ao contrario ou parado
                endLine.update();
                endLine.show();

                // Atualiza todos os robos
                population.update();
                population.show();

                // Atualiza campos que estão em tela para acompanhar o desenvolvimento
                document.getElementById("generations").innerText = population.generations;
                document.getElementById("lifespan").innerText = count;
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

// Inicia o mapa com todos valores falsos
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

// Adiciona valor no mapa
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

        // Inicializa a população dos carros
        population = new Population();

        // Já cria a linha de final de jogo
        endLine = new EndLine();

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

// Linha do fim da rodada (matar os carros que não terminarem o processo)
function EndLine(){
    this.x1 = 380;
    this.y1 = 0;
    this.x2 = 380;
    this.y2 = 140;
    this.value = 0;
    this.points = [];
    this.showLine = true;

    this.checkEndLine = function(car){
        // Verifica o valor atual do carro, caso seja menor que o valor do fim do jogo ele deve morrer
        if(map_value[Math.trunc(car.position.x)][Math.trunc(car.position.y)] <= this.value){
            return true;
        }

        return false;
    }

    this.update = function(){
        if(count == 1){
            this.x1 = 380;
            this.y1 = 0;
            this.x2 = 380;
            this.y2 = 140;
            this.value = 0;
        }else if(count > 1){
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

// Cria a população para controlar os robos
function Population(){
    this.robots = [];
    this.matingpool = [];
    this.alive = 0;
    this.generations = 1;

    // Inicializa os carros
    for(var i = 0; i < MAX_ROBOT; i++){
        this.robots[i] = new Car();
    }

    this.update = function(){
        // Por padrão define todos os robos como não funcionando
        this.alive = 0;

        // Atualiza todos os robos
        for(var i = 0; i < MAX_ROBOT; i++){
            this.robots[i].update();
    
            if(!this.robots[i].crashed && !this.robots[i].endLine){
                this.alive += 1;
            }
        }

        // Verifica se será reinicado a geração ou se ainda tem carro funcionando
        if(this.alive == 0){
            // Já quebrou todos os carros
            count = 0;

            // Avalia a performance dos carros 
            this.evaluate();
            
            if(using_net_neural){
                // Vamos variar o "peso" com o grau de aprendizado
                this.balanceNetwork();
            }else{
                // Evolue para proxima geração
                this.evolve();
            }
        }
    }

    this.balanceNetwork = function(){
        // Cria a listas de robos baseado no fitness, onde quanto maior o fitness melhor
        this.matingpool = [];
        for(var i = 0; i < MAX_ROBOT; i++){
            var n = this.robots[i].fitness * 100;
            for(var j = 0; j < n; j++){
                this.matingpool.push(this.robots[i]);
            }
        }

        // Cria a seleção dos robots, realizandos uma mistura entre eles
        for(var i = 0; i < MAX_ROBOT; i++){
            var robo = random(this.matingpool);
            var bias = robo.neural.bias + random(robo.neural.levelLearning);

            if(random() <= 0.01){ // Adiciona mutação apenas em 1 por cento
                bias = random(1,200);
            }

            this.robots[i] = new Car(bias);
        }
    }

    this.evolve = function(){
        // Cria a listas de robos baseado no fitness, onde quanto maior o fitness melhor
        this.matingpool = [];
        for(var i = 0; i < MAX_ROBOT; i++){
            var n = this.robots[i].fitness * 100;
            for(var j = 0; j < n; j++){
                this.matingpool.push(this.robots[i]);
            }
        }

        // Cria a seleção dos robots, realizandos uma mistura entre eles
        for(var i = 0; i < MAX_ROBOT; i++){
            var parentA = random(this.matingpool);
            var parentB;
            
            if(random() <= 0.01){ // Adiciona mutação apenas em 1 por cento
                parentB = new Car();
            }else{
                do{
                    parentB = random(this.matingpool);
                }while(parentA.id == parentB.id);
            }
            
            var child = parentA.dna.crossover(parentB.dna);

            this.robots[i] = new Car(child);
        }
    }

    this.evaluate = function(){
        // Esta avançando a geração
        this.generations += 1;

        // Pega o melhor valor
        var maxFit = 0;
        for(var i = 0; i < MAX_ROBOT; i++){
            if(this.robots[i].fitness > maxFit){
                maxFit = this.robots[i].fitness;
            }
        }

        // Normaliza os dados
        for(var i = 0; i < MAX_ROBOT; i++){
            this.robots[i].fitness = this.robots[i].fitness / maxFit;
        }
    }

    this.show = function(){
        // Exibe o carro
        for(var i = 0; i < MAX_ROBOT; i++){
            this.robots[i].show();
        }
    }
}

function Car(ia){
    var genes;
    var bias;

    if(using_net_neural){
        bias = ia;
    }else{
        genes = ia;
    }

    // Inicia o carro no ponto inicial
    this.id         = seq;
    this.position   = createVector(width / 2, 100);
    this.velocity   = 0;
    this.angle      = PI;
    this.wheel      = 0;
    this.crashed    = false;
    this.endLine    = false;
    this.showSensor = false;
    this.robot      = true;
    this.dna        = new DNA(genes);
    this.neural     = new Neural(bias);
    this.fitness    = 0;
    this.count      = 0;
    this.sensors    = [];

    // Avanca o sequencial
    seq += 1;

    this.updateSensor = function(){
        for(var i = 0; i <= MAX_SENSORS; i++){
            var angle = this.angle - HALF_PI + (i * sensor_angle);
            this.sensors[i] = distanceToCollision(this.position.x, this.position.y, angle);
        }

        // Adiciona mais um sensor na frente
        this.sensors[MAX_SENSORS + 1] = distanceToCollision(this.position.x, this.position.y, this.angle);
    }

    // Atualiza os sensores
    this.updateSensor();

    this.direction = function(velocity, angle){
        this.wheel = angle;
        this.velocity = velocity;
    }

    this.update = function(){
        if(this.robot){
            if(!this.crashed && !this.endLine){
                if(using_net_neural){
                    // Passa os valores atualizados para rede neural para saber o que deve ser feito
                    this.neural.activate(this.angle, this.sensors);
                    
                    // Faz com que o carro mova de acordo com o que a rede neural determinou
                    this.angle += this.neural.angle;
                    this.velocity = this.neural.velocity;
                }else{
                    // Adiciona aleatoriamente a acao do carro
                    this.angle += this.dna.genes[count].angle;
                    this.velocity = this.dna.genes[count].velocity;   
                }
                
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
        
        if(!this.crashed && endLine != undefined){
            // Verifica se a linha da morte alcancou este carro
            this.endLine = endLine.checkEndLine(this);
        }

        if(!this.crashed && !this.endLine){
            // Atualiza o posicionamento do carro
            this.position.x     = newPositionX;
            this.position.y     = newPositionY;

            // Atualiza os sensores
            this.updateSensor();
        }else{
            this.count = count;
            this.fitness = map_value[Math.trunc(this.position.x)][Math.trunc(this.position.y)] * 2;
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
            if(this.endLine){
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

            // Atualiza os sensores
            for(var i = 0; i < this.sensors.length; i++){
                line(this.position.x, this.position.y, this.sensors[i].x, this.sensors[i].y);
            }
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
            var distance = int(dist(x, y, newX, newY));

            return new Sensor(newX, newY, angle, distance);
        };
    }
}

function Sensor(x, y, angle, distance){
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.distance = distance;
}

function DNA(genes){
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
        var breakDna = Math.round(random(100,1000));
        var mid = Math.round(random(breakDna));
        var length = Math.trunc(this.genes.length / breakDna);

        for(var i = 0; i < length; i++){
            for(var j = 0; j < breakDna; j++){
                var index = i * breakDna + j;

                if(j < mid){
                    newgenes[index] = this.genes[index];
                }else{
                    newgenes[index] = partner.genes[index];
                }
            }
        }

        // Garantir que tenha o mesmo tanto de genes (o antigo com o novo)
        for(var i = newgenes.length; i < MAX_COUNT; i++){
            newgenes[i] = this.genes[i];
        }
        
        return newgenes;
    }
}

function Neural(bias){
    if(bias){
        this.bias       = bias;
    }else{
        this.bias       = random(1,200);
    }

    this.inputLayer     = [];
    this.hiddenLayer    = [];
    this.outputLayer    = [];
    this.velocity       = 0;
    this.angle          = 0;
    this.levelLearning  = 0.5;

    this.activate = function(angle, sensors){
        var angleChange = 0;
        
        // Define quanto o angulo tera que mudar para que ele fique em 90 graus
        if(angle > PI){
            angleChange = HALF_PI - (angle - PI); 
        }else{
            angleChange = HALF_PI - angle;
        }
        
        for(var i = 0; i < sensors.length; i++){
            this.inputLayer[i] = []; // Zera os valores da camada de entrada
            var distance = sensors[i].distance;
            var angleSensor = sensors[i].angle + angleChange;
            
            // Define se o sensor esta na direita ou na esquerda
            if(i >= 0 && i <= 3){
                this.inputLayer[i]['position'] = 'right';
            }else if(i >= 4 && i <= 7){
                this.inputLayer[i]['position'] = 'left';
            }else{
                this.inputLayer[i]['position'] = 'center';
            }

            // Leva o angulo do sensor como se o angulo do carro fosse sempre 90 graus
            if(angleSensor > TWO_PI){
                angleSensor = angleSensor - TWO_PI;
            }else if(angle < 0){
                angleSensor = TWO_PI + angleSensor
            }
            
            // Estava dando problema para calcular o seno com a função do p5js, entao foi calculado previamente os valores
            var sinCalculed = sinValue[i];

            // Executa a função (DISTANCIA * (SEN(ANGLE) + 0.25) + bias)
            this.inputLayer[i]['value'] = distance * (sinCalculed + 0.25) + this.bias;
        }
        
        // Cruza as camadas
        for(var i = 0; i < this.inputLayer.length; i++){
            this.hiddenLayer[i] = [];
            this.hiddenLayer[i]['value'] = 0;
            this.hiddenLayer[i]['position'] = this.inputLayer[i]['position'];
            
            for(var j = 0; j < this.inputLayer.length; j++){
                if(this.hiddenLayer[i]['position'] == 'center'){
                    if(this.hiddenLayer[i]['position'] == this.inputLayer[j]['position']){
                        this.hiddenLayer[i]['value'] += this.inputLayer[j]['value'];
                    }
                }else{
                    if(this.inputLayer[j]['position'] != 'center'){
                        if(this.hiddenLayer[i]['position'] == this.inputLayer[j]['position']){
                            this.hiddenLayer[i]['value'] += this.inputLayer[j]['value'];
                        }else{
                            this.hiddenLayer[i]['value'] -= this.inputLayer[j]['value'];
                        }
                    }
                }
            }
        }

        this.outputLayer = [];
        for(var i = 0; i < this.hiddenLayer.length; i++){
            var position = this.hiddenLayer[i]['position'];
            
            if(!this.outputLayer[position]){
                // Adiciona esta posicao na camada
                this.outputLayer[position] = 0;

                for(var j = 0; j < this.hiddenLayer.length; j++){
                    if(this.hiddenLayer[j]['position'] == position){
                        this.outputLayer[position] += this.hiddenLayer[j]['value'];
                    }
                }
            }
        }

        // Define a saida
        if(this.outputLayer['center'] > this.outputLayer['left'] && this.outputLayer['center'] > this.outputLayer['right']){
            this.angle = 0;
            this.velocity = MAX_VELOCITY;
        }else if(this.outputLayer['left'] > this.outputLayer['right']){
            this.angle = MAX_ANGLE_CHANGE;
            this.velocity = MAX_VELOCITY;
        }else{
            this.angle = -MAX_ANGLE_CHANGE;
            this.velocity = MAX_VELOCITY;
        }        
    }
}
