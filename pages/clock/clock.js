// Carrega os parâmetros antes de tudo
function setup() {
    createCanvas(500, 500);

    // Utiliza graus em vez de radianos
    angleMode(DEGREES);
}

function draw() {
    // Adiciona um fundo cinza
    background(0);

    var h = hour();
    var m = minute();
    var s = second();
    var clock = h.toString().padStart(2,'0') + ':' + m.toString().padStart(2,'0') + ':' + s.toString().padStart(2,'0')

    noStroke();
    textSize(32);
    fill(0, 102, 153);
    text(clock, 10, 30);

    translate(width / 2, height / 2);
    rotate(-90);
    strokeWeight(8);
    noFill();
    
    var secondAngle = map(s, 0, 60, 0, 360);
    stroke(234, 32, 39);
    arc(0, 0, 450, 450, 0, secondAngle);
    
    push();
    rotate(secondAngle);
    line(0,0,190,0);
    pop();

    var minuteAngle = map(m, 0, 60, 0, 360);
    stroke(0, 148, 50);
    arc(0, 0, 430, 430, 0, minuteAngle);

    push();
    rotate(minuteAngle);
    line(0,0,150,0);
    pop();

    var hourAngle = map(h, 0, 12, 0, 360);
    stroke(6, 82, 221);
    arc(0, 0, 410, 410, 0, hourAngle);

    push();
    rotate(hourAngle);
    line(0,0,110,0);
    pop();

    strokeWeight(16);
    stroke(255);
    point(0, 0);
}
