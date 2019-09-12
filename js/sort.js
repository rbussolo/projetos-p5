var STAGE_SORTING = 1;
var STAGE_CHECKING = 2;
var STAGE_FINISH = 3;
var STAGE_BACKING_VALUE = 4;

var barLength = 500;
var bars = [];
var bar_aux;
var method;

function setup() {
    createCanvas(500, 500);

    // Realiza a ordenação via BUBBLE SORT
    method = new InsertionSort();
    barLength = method.length;

    initial_position = width / 2 - barLength / 2;

    for(i = 0; i < barLength; i++){
        bars[i] = new Bar(i, height, random(1,300));;
    }
}

function draw() {
    background(51);

    for(i = 0; i < bars.length; i++){
        bars[i].show();
    }

    method.execute();
}

function Bar(x, y, value){
    this.x = x;
    this.y = y;
    this.value = value;
    this.selected = false;

    this.show = function(){
        if(this.selected){
            stroke(255, 0, 0);

            this.selected = false;
        }else{
            stroke(255, 204, 0);
        }
        
        line(initial_position + this.x, this.y, initial_position + this.x, this.y - this.value);
    }
}

function BubbleSort(){
    this.index = 0;
    this.stage = STAGE_SORTING;
    this.length = 100;
    this.hasChanged = false;

    this.execute = function(){
        if(this.stage == STAGE_SORTING){
            bars[this.index].selected       = true;
            bars[this.index + 1].selected   = true;

            if(bars[this.index].value > bars[this.index + 1].value){
                this.hasChanged         = true;
                bar_aux                 = bars[this.index];
                bars[this.index]        = bars[this.index + 1];
                bars[this.index + 1]    = bar_aux;
                bars[this.index].x      = this.index;
                bars[this.index + 1].x  = this.index + 1;
            }

            this.index += 1;

            if(this.index == barLength - 1){
                this.index = 0;

                if(!this.hasChanged){
                    this.stage = STAGE_FINISH;   
                }else{
                    this.hasChanged = false;
                }
            }
        }
    }
}

function InsertionSort(){
    this.index = 0;
    this.lastIndex = 0;
    this.stage = STAGE_SORTING;
    this.length = 100;

    this.execute = function(){
        if(this.stage == STAGE_SORTING){
            bars[this.index].selected       = true;
            bars[this.index + 1].selected   = true;

            if(bars[this.index].value > bars[this.index + 1].value){
                bar_aux                 = bars[this.index + 1];
                bars[this.index + 1]    = bars[this.index];
                bars[this.index + 1].x  = this.index + 1;
                this.lastIndex          = this.index;
                this.stage              = STAGE_BACKING_VALUE;
            }else{
                this.index += 1;

                if(this.index == barLength - 1){
                    this.stage = STAGE_FINISH;
                }
            }
        }else if(this.stage == STAGE_BACKING_VALUE){
            bars[this.index + 1].selected   = true;
            bars[this.lastIndex].selected   = true;
            
            if(this.lastIndex - 1 >= 0 && bars[this.lastIndex - 1].value > bar_aux.value){
                bars[this.lastIndex]            = bars[this.lastIndex - 1];
                bars[this.lastIndex].x          = this.lastIndex;
                this.lastIndex                  -= 1;
                bars[this.lastIndex].selected   = true;
            }else{
                bars[this.lastIndex]    = bar_aux;
                bars[this.lastIndex].x  = this.lastIndex;

                this.stage              = STAGE_SORTING;
                this.index              += 1;

                if(this.index == barLength - 1){
                    this.stage = STAGE_FINISH;
                }
            }
        }
    }
}

