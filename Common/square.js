
var gl, gl2, gl3;
var points;

var canvas1Posi = 372;
var canvas2Posi = 12;
var canvasAltura = 12;

var verticesCanvas1 = [];
var verticesCanvas2 = [];
var raio = 3;
var raio_sensivel = raio + 2;

var ponto1=-1, ponto2=-1;
var fim = 0;
var fechado = 0;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    var canvas2 = document.getElementById("gl-canvas2");
    var canvas3 = document.getElementById("gl-canvas3");
      


    // CANVAS 1
    canvas.onmousedown = function(event)
    {
        var pontoX1 = event.clientX-canvas1Posi;
        var pontoY1 = event.clientY-canvasAltura;
        var retorno = pontoExistente(pontoX1, pontoY1, verticesCanvas1);
        if(retorno == -1)
        {
            verticesCanvas1.push([pontoX1, pontoY1]);
            if (canvas.getContext) 
            {
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = "#00A308";
                ctx.strokeRect(pontoX1-raio, pontoY1-raio, raio*2, raio*2);
                if(verticesCanvas1.length>1)
                    desenhaReta(canvas, verticesCanvas1.length-2, verticesCanvas1.length-1, verticesCanvas1);
            }
            ponto1 = -1;
        }
        else ponto1 = retorno;
    }
    canvas.onmousemove = function(event){
        if (ponto1 != -1) 
        {
            verticesCanvas1[ponto1][0] = event.clientX-canvas1Posi;
            verticesCanvas1[ponto1][1] = event.clientY-canvasAltura;
            desenhaQuadrados(canvas, verticesCanvas1);
        }
    }
    canvas.onmouseup = function(event){
        ponto1 = -1;
    }



    document.getElementById("ButtonL1").onclick = function(){
        verticesCanvas1 = [];
        ponto1=-1;
        if(canvas.getContext)
        {
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };


    document.getElementById("ButtonL2").onclick = function(){
        verticesCanvas2 = [];
        ponto2=-1;
        fim = 0;
        fechado = 0;
        if(canvas2.getContext)
        {
            var ctx = canvas2.getContext('2d');
            ctx.clearRect(0, 0, canvas2.width, canvas2.height);
        }
    };



    //CANVAS 2
    canvas2.onmousedown = function(event){
        var pontoX2 = event.clientX-canvas2Posi;
        var pontoY2 = event.clientY-canvasAltura;
        var retorno = pontoExistente(pontoX2, pontoY2, verticesCanvas2);
        if(retorno != -1)
        { 
            ponto2 = retorno;
            if(retorno == 0 && fechado == 0)
            {
                fim = 1;
            }
        }
        else if(fechado == 0)
        {
            verticesCanvas2.push([pontoX2, pontoY2]);
            if (canvas2.getContext) {
                var ctx = canvas2.getContext('2d');
                ctx.fillStyle = "#00A308";
                ctx.strokeRect(pontoX2-raio, pontoY2-raio, raio*2, raio*2);
                if(verticesCanvas2.length>1)
                    desenhaReta(canvas2, verticesCanvas2.length-2, verticesCanvas2.length-1, verticesCanvas2);
            }
            ponto2 = -1;
        }
        
    }
    canvas2.onmousemove = function(event){
        if (ponto2 != -1) 
        {
            verticesCanvas2[ponto2][0] = event.clientX-canvas2Posi;
            verticesCanvas2[ponto2][1] = event.clientY-canvasAltura;
            desenhaQuadrados(canvas2, verticesCanvas2);
            if(fechado == 1)
                desenhaReta(canvas2, verticesCanvas2.length-1, 0, verticesCanvas2);
        }
        fim = 0;
    }
    canvas2.onmouseup = function(event){
        if(fim == 1)
        {
            var pontoX2 = event.clientX-canvas2Posi;
            var pontoY2 = event.clientY-canvasAltura;
            if(pontoExistente(pontoX2, pontoY2, verticesCanvas2) == 0)
            {
                fim = 0;
                fechado = 1;
                desenhaReta(canvas2, verticesCanvas2.length-1, 0, verticesCanvas2);
            }

        }
        ponto2 = -1;
        

    }




    canvas3.onmousedown = function(event){
        alert(event.clientX + "  " + event.clientY);
    }


    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "#00A308";

        //ctx.fillRect(25,25,100,100);
        //ctx.clearRect(45,45,60,60);
        //ctx.strokeRect(50,50,50,50);
    }

    render();
};


function render() {

}



function pontoExistente(x, y, vert) {
    for (var i = 0; i < vert.length; i++) 
    {
        if(x>vert[i][0]-raio_sensivel && x<vert[i][0]+raio_sensivel &&
           y>vert[i][1]-raio_sensivel && y<vert[i][1]+raio_sensivel)
        {
            //alert("quad "+i);
            return i;
        }   
    }
    //alert("nada");
    return -1;
}

function desenhaQuadrados(canvas, vert)
{
    if(canvas.getContext)
    {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < vert.length; i++) 
        {
            ctx.fillStyle = "#00A308";
            ctx.strokeRect(vert[i][0]-raio, vert[i][1]-raio, raio*2, raio*2);
            if(i>0)
            {
                desenhaReta(canvas, i-1, i, vert);
            }
        }
    }
}

function desenhaReta(canvas, ini, fim, vert)
{
    if(canvas.getContext)
    {
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(vert[ini][0], vert[ini][1]);
        ctx.lineTo(vert[fim][0], vert[fim][1]);
        ctx.stroke();
    }
}