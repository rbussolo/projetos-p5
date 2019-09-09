// Carrega os parâmetros antes de tudo
var queryDict = {}
location.search.substr(1).split("&").forEach(function(item) {
    queryDict[item.split("=")[0]] = item.split("=")[1];
});

a               = 0;
width           = queryDict['width'] == undefined   ? 500   : Number(queryDict['width']);
heigth          = queryDict['height'] == undefined  ? 500   : Number(queryDict['height']);
size            = queryDict['size'] == undefined    ? 200   : Number(queryDict['size']);
clickCount      = 0;
clickLimit      = queryDict['limit'] == undefined   ? 3     : Number(queryDict['limit']);
reverseFractal  = queryDict['reverse'] == '1'       ? true  : false;
sponge          = [];

function setup() {
    createCanvas(500, 500, WEBGL);

    b = new Box(0,0,0,size);
    sponge.push(b);
}

function draw() {
    background(51);
    stroke(255);
    noFill();
    lights();

    rotateX(a);
    rotateY(a * 0.1);
    rotateZ(a * 0.5);

    for(i = 0; i < sponge.length; i++){
        sponge[i].show();
    }

    a += 0.01;
}

function mousePressed(){
    clickCount += 1;
    newBoxes = [];
    
    if(clickCount < clickLimit){
        for(i = 0; i < sponge.length; i++){
            newBoxes = newBoxes.concat(generateBoxes(sponge[i]));
        }
    }else{
        clickCount = 0;
        b = new Box(0,0,0,size);
        newBoxes.push(b);
    }

    sponge = newBoxes;
}

function generateBoxes(box){
    newBoxes = [];
    newSize = box.s / 3;
    
    for(x = -1; x < 2; x++){
        for(y = -1; y < 2; y++){
            for(z = -1; z < 2; z++){
                sum = Math.abs(x) + Math.abs(y) + Math.abs(z);
                
                if((reverseFractal && sum <= 1) || (!reverseFractal && sum > 1)){
                    newBox = new Box(box.x + x * newSize, box.y + y * newSize, box.z + z * newSize, newSize);
                    newBoxes.push(newBox);
                }
            }
        }
    }

    return newBoxes;
}

class Box{
    constructor(x, y, z, s){
        this.x = x;
        this.y = y;
        this.z = z;
        this.s = s;
    }

    show(){
        push();
        translate(this.x, this.y, this.z);
        noStroke();
        fill(255);
        box(this.s);
        pop();
    }
}