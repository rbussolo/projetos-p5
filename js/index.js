var pages = ['starfall','fractal','snake','rain','space','sort','fat'];
var show = pages.indexOf(location.search.substr(1)) < 0 ? 'allProjects' : location.search.substr(1);
showProject();

function showProject(){
    var elements = document.getElementsByClassName("card");
    
    Array.prototype.forEach.call(elements, function(el) {
        if(el.id == show){
            el.style.display = "block";
        }else{
            el.style.display = "none";
        }
    });    
}

function page(name){
    show = name;
    showProject();
}

function reloadStarfall(){
    // Carrega os valores dos input
    starWidth = document.getElementById("starWidth").value;
    starHeigth = document.getElementById("starHeigth").value;
    starSize = document.getElementById("starSize").value;
    starSpeed = document.getElementById("starSpeed").value;
    starCount = document.getElementById("starCount").value;

    // Recarrega o iframe passando estes parametros
    frameStarfall = document.getElementById("frameStarfall");
    frameStarfall.src = 'pages/starfall/starfall.html?width=' + starWidth + '&heigth=' + starHeigth + '&size=' + starSize + '&speed=' + starSpeed + '&count=' + starCount;

    return true;
}

function reloadFractal(){
    // Carrega os valores dos input
    fractalWidth = document.getElementById("fractalWidth").value;
    fractalHeight = document.getElementById("fractalHeight").value;
    fractalSize = document.getElementById("fractalSize").value;
    fractalLimit = document.getElementById("fractalLimit").value;
    fractalReverse = document.getElementById("fractalReverse").value;

    // Recarrega o iframe passando estes parametros
    frameFractal = document.getElementById("frameFractal");
    frameFractal.src = 'pages/fractal/fractal.html?width=' + fractalWidth + '&heigth=' + fractalHeight + '&size=' + fractalSize + '&limit=' + fractalLimit + '&reverse=' + fractalReverse;

    return true;
}