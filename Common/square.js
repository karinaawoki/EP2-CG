
var points;

var grau = 2;

var curva2 = [];
var curva1 = [];
var canvas1Posi = 372;
var canvas2Posi = 12;
var canvasAltura = 12;

var verticesCanvas1 = [];
var verticesCanvas2 = [];

var raio = 3;
var raio_sensivel = raio + 2;
var precisao_Curva = 20;

var ponto1=-1, ponto2=-1;
var fim = 0;
var fechado = 0;

var canvas, canvas2, canvas3;

var oi = [];
var tVetor = [];

window.onload = function init()
{
    canvas  = document.getElementById( "gl-canvas" );
    canvas2 = document.getElementById("gl-canvas2");
    canvas3 = document.getElementById("gl-canvas3");
      


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
                    desenhaReta(canvas, verticesCanvas1.length-2, 
                        verticesCanvas1.length-1, verticesCanvas1);
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

    document.getElementById("ButtonB2").onclick = function(){
        if(fechado == 1)
        {
            curva2 = [];
            for(var i = precisao_Curva*0; i<(verticesCanvas2.length-1)*precisao_Curva; i++)
            {
                calculaSpline(i/precisao_Curva, verticesCanvas2, grau, canvas2);
                
            }
            desenhaCurvas(curva2, canvas2);
        }
        else
        {
            alert("Clique no primeiro ponto para fechar a curva :D ");
        }
    };


    document.getElementById("ButtonB1").onclick = function(){
        curva1 = [];
        tVetor = montaVetorNos(grau, verticesCanvas1);


        //grau = 1*document.getElementById("grau1").value;
        //grau = 2;
        for(var i = precisao_Curva*0; i<=tVetor[tVetor.length-1]*precisao_Curva; i++)
        {
            calculaSpline(i/precisao_Curva, verticesCanvas1, grau, canvas, curva1);
        }

        desenhaCurvas(curva1, canvas);
    };


    //CANVAS 2
    canvas2.onmousedown = function(event)
    {
        var pontoX2 = event.clientX-canvas2Posi;
        var pontoY2 = event.clientY-canvasAltura;
        var retorno = pontoExistente(pontoX2, pontoY2, verticesCanvas2);
        if(retorno != -1)
        { 
            ponto2 = retorno;
            if(retorno == 0 && fechado == 0) fim = 1;
        }
        else if(fechado == 0)
        {
            verticesCanvas2.push([pontoX2, pontoY2]);
            if (canvas2.getContext) {
                var ctx = canvas2.getContext('2d');
                ctx.fillStyle = "#00Ahhh, valeu Jakson! A308";
                ctx.strokeRect(pontoX2-raio, pontoY2-raio, raio*2, raio*2);
                if(verticesCanvas2.length>1)
                    desenhaReta(canvas2, verticesCanvas2.length-2, 
                        verticesCanvas2.length-1, verticesCanvas2);
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
            //console.log("quad "+i);
            return i;
        }   
    }
    //console.log("nada");
    return -1;
}

function desenhaCurvas(curva, canvas)
{
    if(canvas.getContext)
    {
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(curva[0][0], curva[0][1]);
        for (var i = 0; i < curva.length-1; i++) 
        {
            ctx.lineTo(curva[i][0], curva[i][1]);
        }   
        ctx.strokeStyle = '#ff0000';
        ctx.stroke();
        ctx.strokeStyle = '#000000';
    }
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


function calculaSpline(t, vert, d, canvas, curva)
{
    var retorno = [0,0];
    for (var i = 0; i < vert.length; i++) {
        var base = calculaBase(t, i, d);
        retorno[0] += vert[i][0]*base;
        retorno[1] += vert[i][1]*base;
        console.log("** " + retorno);
        console.log("*** " + vert[i] + " t " + t);
    }
    curva.push([retorno[0], retorno[1]]);
    //if(canvas.getContext)
    //{
    //    var ctx = canvas.getContext('2d');
    //    ctx.fillStyle = "#220000";
    //    ctx.strokeRect(retorno[0]-1, retorno[1]-1, 2, 2);
    //}
}

function calculaBase(t, k, d)
{

    if(d<=0 && tVetor[k]<=t && t<tVetor[k+1]) 
    {
       // alert("reto 1");
        return 1;
    }
    else if(d <= 0) 
    {
       // alert("reto 0");
        return 0;
    }
    
    var parte1;
    console.log("k:"+k+" d:"+d+" v[k+d]:"+tVetor[k+d] + " t[k]"+tVetor[k]);
    if(tVetor[k+d] != tVetor[k])
    {
        //alert("parte1 não é zero");
        parte1 = (t-tVetor[k])*calculaBase(t, k, d-1)/(tVetor[k+d]-tVetor[k]);
        if(parte1!=0) console.log("parte1 não é zero: " +parte1);
        else console.log("///////////////////////////////////////// 1");
    }
    else
    { 
        parte1 = 0;
    }
    var parte2;
    if(tVetor[k+d+1] != tVetor[k+1]) 
    {
        //alert("parte2 não é zero");
        parte2 = (tVetor[k+d+1]-t)*calculaBase(t, k+1, d-1)/(tVetor[k+d+1]-tVetor[k+1]);
        if(parte2!=0) console.log("parte2 não é zero: " +parte2);
        else console.log("///////////////////////////////////////// 2");
    }
    else 
    {
        parte2 = 0;
    }
    //Bk,d
    var res = parte1 + parte2;
    return  res
}

function montaVetorNos(grau, vert)
{
    tVetor = [];
    var num = 1;
    var tamanho = grau + vert.length + 1;
    var zero = 0;
    tamanho = tamanho -  (2*grau + 2);
    for(var i = 0; i<=grau; i++) 
    {
        tVetor.push(zero);
    }
    for(var i = 0; i<=tamanho; i++)
    {

        tVetor.push(num);
        num = num+1;
    }
    for(var i = 0; i<=grau; i++) 
    {
        tVetor.push(num-1);
    }


    console.log(tVetor);
    console.log(tVetor.length);
    return tVetor;
}

