var SPACE = 32;
var STAGE_START = 1;
var STAGE_PLAYING = 2;
var STAGE_GAMEOVER = 3;

var stage;
var player;
var invaders = [];
var initial_height = 50;
var initial_width = 25;

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

        // Atualiza os inimigos
        removeInvaders = [];
        for(var i = 0; i < invaders.length; i++){
            if(invaders[i].live > 0){
                invaders[i].update();
                invaders[i].show();
            }else{
                removeInvaders.push(i);
            }
        }

        // Remove os invasores
        for(var i = removeInvaders.length - 1; i >= 0; i--){
            invaders.splice(removeInvaders[i],1);
        }

    }else if(stage == STAGE_GAMEOVER){
        // Adiciona mensagem do fim de jogo
        textAlign(CENTER);
        stroke(255);
        fill(255);
        strokeWeight(0);
        text('Deu ruim! Clique para jogar novamente!', width / 2, height / 2);

    }
}

function Player(){
    this.x = width / 2 - 15;
    this.y = height - 30;
    this.width = 30;
    this.height = 20
    this.xSpeed = 0;
    this.shotCount = 3;
    this.bullets = [];

    this.dir = function(x){
        this.xSpeed = x * 10;
    }

    this.shot = function(){
        if(this.shotCount > 0){
            this.shotCount -= 1;

            bullet = new Bullet(this.x + this.width / 2, this.y);
            this.bullets.push(bullet);
        }
    }

    this.update = function(){
        this.x += this.xSpeed;
        this.x = constrain(this.x, 0, width - this.width);
        
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

function Invader(x, y){
    this.x = x;
    this.y = y;
    this.xSpeed = 0;
    this.ySpeed = 1;
    this.width = 20;
    this.height = 20;
    this.live = 3;
    this.r = 200;
    this.g = 0;
    this.b = 200;

    this.hitted = function(x, y){
        if(this.x <= x && this.x + this.width >= x && this.y <= y && this.y + this.height >= y){
            this.live -= 1;
            this.r -= 25;
            this.g += 25;
            this.b -= 25;

            return true;
        }

        return false;
    }

    this.update = function(){
        this.y += this.ySpeed;

        // Verifica se passou da tela
        if(this.y + this.height > height){
            stage = STAGE_GAMEOVER;
        }else if(dist(this.x + this.width / 2, this.y + this.height / 2, player.x + player.width / 2, player.y + player.height / 2) <= 33){ // Verifica se bateu no jogador
            stage = STAGE_GAMEOVER;
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

    // Controla a movimentação do jogador
    if(right_arrow && left_arrow){
        player.dir(0);
    }else if(right_arrow){
        player.dir(1);
    }else if(left_arrow){
        player.dir(-1);
    }else{
        player.dir(0);
    }
}

function keyPressed(){
    if(keyCode == SPACE){
        player.shot();
    }
}

function start_game(){
    player = new Player();
    
    sum = 0;
    invaders = [];
    for(var i = 1; i <= 3; i++){
        for(var j = 1; j <= 18; j++){
            invader = new Invader(initial_width * j, initial_height * i);
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
