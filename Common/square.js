
var points;

var grau1 = 1;
var grau2 = 1;

var curva2 = [];
var curva1 = [];
var canvas1Posi = 372;
var canvas2Posi = 12;
var canvasAltura = 12;

var bspline1 = 0;
var bspline2 = 0;

var verticesCanvas1 = [];
var verticesCanvas2 = [];
var verticesCanvasParaCurva = [];

var raio = 3;
var raio_sensivel = raio + 2;
var precisao_Curva1 = 100;
var precisao_Curva2 = 100;

var ponto1=-1, ponto2=-1;
var fim = 0;
var fechado = 0;

var canvas, canvas2, canvas3;

var tVetor1 = [];
var tVetor2 = [];

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
            if(bspline1 == 1)
            {
                tVetor1 = montaVetorNos(grau1, verticesCanvas1);
                desenhaQuadrados(canvas, verticesCanvas1, grau1, curva1, bspline1, tVetor1, verticesCanvas1, 1);
            }


            ponto1 = -1;
        }
        else ponto1 = retorno;
    }
    canvas.onmousemove = function(event)
    {
        if (ponto1 != -1) 
        {
            verticesCanvas1[ponto1][0] = event.clientX-canvas1Posi;
            verticesCanvas1[ponto1][1] = event.clientY-canvasAltura;
            desenhaQuadrados(canvas, verticesCanvas1, grau1, curva1, bspline1, tVetor1, verticesCanvas1, 1);
        }
    }
    canvas.onmouseup = function(event){
        ponto1 = -1;
    }



    // LIMPAR TELA
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



    // CURVAS B-SPLINES
    document.getElementById("ButtonB2").onclick = function(){
        if(fechado == 1)
        {
            precisao_Curva2 = (parseInt(document.getElementById("div2").value)-1)/3;
            verticesCanvasParaCurva = [];
            bspline2 = 1;
            grau2 = parseInt(document.getElementById("grau2").value);
            for(var i = 0; i<verticesCanvas2.length; i++)
                verticesCanvasParaCurva.push(verticesCanvas2[i]);
            for(var i = 0; i<grau2; i++)
            {
                verticesCanvasParaCurva.push(verticesCanvas2[i]);
            }
            curva2 = [];
            tVetor2 = montaVetorNos3(grau2, verticesCanvasParaCurva);
            
            desenhaQuadrados(canvas2, verticesCanvas2, grau2, curva2, bspline2, tVetor2, verticesCanvasParaCurva, 2);
        }
        else
        {
            alert("Clique no primeiro ponto para fechar a curva :D ");
        }
    };


    document.getElementById("ButtonB1").onclick = function()
    {
        alert(precisao_Curva1);
        bspline1 = 1;
        curva1 = [];
        grau1 = parseInt(document.getElementById("grau1").value);

        tVetor1 = montaVetorNos(grau1, verticesCanvas1);
        precisao_Curva1 = (parseInt(document.getElementById("div1").value)-1)/tVetor1[tVetor1.length-1];

 
        //curva1.push([verticesCanvas1[verticesCanvas1.length-1][0], verticesCanvas1[verticesCanvas1.length-1][2]]);
        desenhaQuadrados(canvas, verticesCanvas1, grau1, curva1, bspline1, tVetor1, verticesCanvas1, 1);
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
            desenhaQuadrados(canvas2, verticesCanvas2, grau2, curva2, bspline2, tVetor2, verticesCanvasParaCurva, 2);

            if(fechado == 1)
            {
                desenhaReta(canvas2, verticesCanvas2.length-1, 0, verticesCanvas2);
            }
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
            return i;
        }   
    }
    return -1;
}

function desenhaCurvas(curva, canvas, vert)
{
    if(canvas.getContext)
    {
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(curva[0][0], curva[0][1]);
 //       for (var i = precisao_Curva*2; i < curva.length - precisao_Curva; i++) 
        for (var i = 0; i < curva.length; i++) 
        {
            ctx.lineTo(curva[i][0], curva[i][1]);
        }   
        ctx.strokeStyle = '#ff0000';
        ctx.stroke();
        ctx.strokeStyle = '#000000';
    }
}

function desenhaQuadrados(canvas, vert, grau, curva, bspline, tVetor, vertAdicionado, tipo)
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
    if(bspline != 0)
    {
        if (tipo == 1)
            desenha1();
        else 
            desenha2();
    }
}

function desenha2()
{
    curva2 = [];
    for(var i = 0; i<=precisao_Curva2; i++)
    {
        calculaSpline(i/precisao_Curva2, verticesCanvasParaCurva, grau2, canvas2, curva2, tVetor2);
    }

    desenhaCurvas(curva2, canvas2, verticesCanvas2);
    if(fechado == 1)
    {
        desenhaReta(canvas2, verticesCanvas2.length-1, 0, verticesCanvas2);
    }
}




function desenha1()
{
    curva1 = [];
    for(var i = 0; i<=tVetor1[tVetor1.length-1]*precisao_Curva1-1; i++)
    {
        calculaSpline(i/precisao_Curva1, verticesCanvas1, grau1, canvas, curva1, tVetor1);
    }
    curva1.push([verticesCanvas1[verticesCanvas1.length-1][0], verticesCanvas1[verticesCanvas1.length-1][1]]);
    desenhaCurvas(curva1, canvas, verticesCanvas1);
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


function calculaSpline(t, vert, d, canvas, curva, tVetor)
{
    var retorno = [0,0];
    for (var i = 0; i < vert.length; i++) {
        var base = calculaBase(t, i, d, tVetor);
        retorno[0] += vert[i][0]*base;
        retorno[1] += vert[i][1]*base;
    }
    curva.push([retorno[0], retorno[1]]);
    alert("  " + retorno);
}

function calculaBase(t, k, d, tVetor)
{

    if(d<=0 && tVetor[k]<=t && t<tVetor[k+1]) 
    {
        return 1;
    }
    else if(d <= 0) 
    {
        return 0;
    }
    
    var parte1;
    if(tVetor[k+d] != tVetor[k])
    {
        parte1 = (t-tVetor[k])*calculaBase(t, k, d-1, tVetor)/(tVetor[k+d]-tVetor[k]);
    }
    else
    { 
        parte1 = 0;
    }
    var parte2;
    if(tVetor[k+d+1] != tVetor[k+1]) 
    {
        parte2 = (tVetor[k+d+1]-t)*calculaBase(t, k+1, d-1, tVetor)/(tVetor[k+d+1]-tVetor[k+1]);
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
    tVetor1 = [];
    var num = 1;
    var tamanho = grau + vert.length + 1;
    tamanho = tamanho -  (2*grau + 2);
    for(var i = 0; i<=grau; i++) 
    {
        tVetor1.push(0);
    }
    for(var i = 0; i<=tamanho; i++)
    {
        tVetor1.push(num);
        num = num+1;
    }
    for(var i = 0; i<=grau; i++) 
    {
        tVetor1.push(num-1);
    }
    return tVetor1;
}



function montaVetorNos2(grau, vert)
{
    tVetor2 = [];
    var tamanho = grau + vert.length-1;

    for(var i = 0; i<tamanho; i++)
    {
        tVetor2.push(i);
    }
    return tVetor2;
}



function montaVetorNos3(grau, vert)
{
    tVetor2 = [];
    var tamanho = grau + vert.length + 1;

    for(var i = 0; i<tamanho; i++)
    {
        tVetor2.push(i);
        console.log(tVetor2[i]/(tamanho-1));

    }
    return tVetor2;
}