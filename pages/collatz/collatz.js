var step = 0;
var n = 500;
var len = 10;
var angle = 0.52359877559; // PI / 6
var angleRotate;

// Carrega os parâmetros antes de tudo
function setup() {
    createCanvas(800, 800);

    // Adiciona um fundo cinza
    background(0);

    for(var i = 2; i < 1000; i++){
        n = i;
        sequence = [];
        do{
            sequence.push(n);
            n = collatz(n);
        }while(n != 1);
        sequence.push(1);

        // Volta a tela para a posição inicial
        resetMatrix();

        // Altera a tela para o ultimo ponto encontrado
        translate(width/2, height/2);
        rotate(HALF_PI);

        for(var j = sequence.length - 1; j >= 0; j--){
            // Rotaciona de acordo com o número (caso seja impar para um lado e caso seja par para outro)
            angleRotate = sequence[j] % 2 == 1 ? angle : - angle;
            
            rotate(angleRotate);
            strokeWeight(2);
            stroke(255, 50);
            line(0,0,-len,0);
            translate(-len,0);
            //rotate(-HALF_PI);
            //rotate(-angleRotate);
        }
    }
}

function draw() {
    
}

function collatz(n){
    if(n % 2 == 1){
        // Caso o número seja IMPAR a formula utilizada é f(x) = n * 3 + 1
        return (n * 3 + 1) / 2;
    }else{
        // Caso o número seja PAR a formula utilizada é f(x) = n / 2
        return n / 2;
    }
}
