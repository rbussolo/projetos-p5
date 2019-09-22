var SPACE = 32;
var STAGE_START = 1;
var STAGE_PLAYING = 2;
var STAGE_GAMEOVER = 3;

var nivel = 1;
var stage;
var player;
var invaders = [];
var initial_height = 50;
var initial_width = 25;
var min_height_per_collumn = [];
var xSpeed;
var ySpeed;

function setup() {
    createCanvas(500, 500);

    // Define o modo como START
    stage = STAGE_START;
}

function draw() {
    background(51);

    if(stage == STAGE_START){
        // Adiciona mensagem para iniciar o jogo
        textAlign(CENTER);
        stroke(255);
        fill(255);
        strokeWeight(0);
        text('Clique para jogar!', width / 2, height / 2);

    }else if(stage == STAGE_PLAYING){
        // Controla os comandos passados pelo teclado
        read_keyboard();

        // Atualiza o jogador
        player.update();
        player.show();

        // Atualiza a altura minima
        min_height_per_collumn = [];
        for(var i = 1; i <= 18; i++){
            min_height_per_collumn[i] = 9999;
        }

        // Atualiza os inimigos
        for(var i = 0; i < invaders.length; i++){
            invaders[i].update();
            invaders[i].show();
        }

        // Exibe o placar no canto da tela
        textAlign(CENTER);
        stroke(255);
        fill(255);
        strokeWeight(0);
        text('Pontos: ' + player.points, 30, 30);

    }else if(stage == STAGE_GAMEOVER){
        // Adiciona mensagem do fim de jogo
        textAlign(CENTER);
        stroke(255);
        fill(255);
        strokeWeight(0);
        text('Pontos: ' + player.points, width / 2, height / 2 - 30);
        text('Deu ruim! Clique para jogar novamente!', width / 2, height / 2);

    }
}

function Player(){
    this.x = width / 2 - 15;
    this.y = height - 30;
    this.width = 30;
    this.height = 20
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.shotCount = 5;
    this.bullets = [];
    this.power = 1;
    this.points = 0;

    this.dir = function(x, y){
        this.xSpeed = x * 5;
        this.ySpeed = y * 5;
    }

    this.shot = function(){
        if(this.shotCount > 0){
            this.shotCount -= 1;

            offset = this.width / this.power;
            for(var i = 0; i < this.power; i++){
                bullet = new Bullet(this.x + offset * i + offset / 2, this.y);
                this.bullets.push(bullet);
            }
        }
    }

    this.kill = function(killed){
        this.points += 50 * killed;
        
        if(this.points > 10000){
            this.power = 7;
        }else if(this.points > 8000){
            this.power = 6;
        }else if(this.points > 6000){
            this.power = 5;
        }else if(this.points > 4000){
            this.power = 4;
        }else if(this.points > 2000){
            this.power = 3;
        }else if(this.points > 1000){
            this.power = 2;
        }

        nivel = this.power;
    }

    this.update = function(){
        this.x += this.xSpeed;
        this.x = constrain(this.x, 0, width - this.width);

        this.y += this.ySpeed;
        this.y = constrain(this.y, 0, height - this.height);
        
        // Atualiza todas as balas que este jogador disparou
        var removeBullet = [];
        for(var i = 0; i < this.bullets.length; i++){
            hitted = this.bullets[i].hit();

            if(hitted){
                this.shotCount += 1;
                removeBullet.push(i);
            }else{
                this.bullets[i].update();
                this.bullets[i].show();
            }
        }

        // Remove todas as balas que acertaram o alvo
        for(var i = removeBullet.length - 1; i >= 0; i--){
            this.bullets.splice(removeBullet[i], 1);
        }
    }

    this.show = function(){
        fill(255);
        stroke(255);
        strokeWeight(1);
        rect(this.x, this.y, this.width , this.height);
    }
}

function Bullet(x, y){
    this.x = x;
    this.y = y;
    this.ySpeed = -10;

    this.hit = function(){
        if(this.y < 0)
            return true;
        
        // Verifica se bateu em algum invasor
        for(var i = 0; i < invaders.length; i++){
            if(invaders[i].hitted(this.x, this.y)){
                return true;
            }
        }

        return false;
    }

    this.update = function(){
        this.y += this.ySpeed;
    }

    this.show = function(){
        stroke(255, 204, 0);
        strokeWeight(2);
        line(this.x, this.y, this.x, this.y + 10);
    }
}

function Invader(x, y, c){
    this.x = x;
    this.y = y;
    this.c = c;
    this.xSpeed = 0;
    this.ySpeed = 0.5;
    this.width = 20;
    this.height = 20;
    this.live = 1;
    this.killed = 0;
    this.r = 200;
    this.g = 0;
    this.b = 200;

    this.hitted = function(x, y){
        if(this.x <= x && this.x + this.width >= x && this.y <= y && this.y + this.height >= y){
            this.live -= 1;

            if(this.live == 0){
                // Ressucita o invasor
                this.killed += 1;
                this.live = this.killed + 1;
                this.y = 50 + this.height + 10 > min_height_per_collumn[this.c] ? min_height_per_collumn[this.c] - (10 + this.height) : 50;
                this.r = 200;
                this.g = 0;
                this.b = 200;
                player.kill(this.killed);
            }else{
                this.r -= 15;
                // this.g -= 15;
                this.b -= 15;
            }

            return true;
        }

        return false;
    }

    this.update = function(){
        this.y += (this.ySpeed * nivel);

        // Verifica se acertou o player
        if(dist(this.x + this.width / 2, this.y + this.height / 2, player.x + player.width / 2, player.y + player.height / 2) <= 33){ // Verifica se bateu no jogador
            stage = STAGE_GAMEOVER;
        }else{
            // Verifica se passou da tela, caso tenha, vamos volar ele la para cima
            if(this.y + this.height > height){
                this.y = 50 + this.height + 10 > min_height_per_collumn[this.c] ? min_height_per_collumn[this.c] - (10 + this.height) : 50;
            }
        }

        if(min_height_per_collumn[this.c] > this.y){
            min_height_per_collumn[this.c] = this.y;
        }
    }

    this.show = function(){
        strokeWeight(1);
        stroke(this.r, this.g, this.b);
        fill(this.r, this.g, this.b);
        rect(this.x, this.y, this.width, this.height);
    }
}

function read_keyboard(){
    // Verifica se a seta esta sendo precionada
    right_arrow = keyIsDown(RIGHT_ARROW);
    left_arrow = keyIsDown(LEFT_ARROW);
    up_arrow = keyIsDown(UP_ARROW);
    down_arrow = keyIsDown(DOWN_ARROW);

    // Controla a movimentação do jogador
    if(right_arrow && left_arrow){
        xSpeed = 0;
    }else if(right_arrow){
        xSpeed = 1;
    }else if(left_arrow){
        xSpeed = -1;
    }else{
        xSpeed = 0;
    }

    if(up_arrow && down_arrow){
        ySpeed = 0;
    }else if(up_arrow){
        ySpeed = -1;
    }else if(down_arrow){
        ySpeed = 1;
    }else{
        ySpeed = 0;
    }

    player.dir(xSpeed, ySpeed);
}

function keyPressed(){
    if(keyCode == SPACE){
        player.shot();
    }
}

function start_game(){
    player = new Player();
    nivel = 1;
    
    sum = 0;
    invaders = [];
    for(var i = 1; i <= 3; i++){
        for(var j = 1; j <= 18; j++){
            invader = new Invader(initial_width * j, initial_height * i, j);
            invaders[sum] = invader;

            sum += 1
        }
    }
}

function mouseClicked() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        if(stage == STAGE_START || stage == STAGE_GAMEOVER){
            stage = STAGE_PLAYING;
            
            // Inicializa o jogo
            start_game();
        }
    }
}
