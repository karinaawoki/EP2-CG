

var program;
var canvas;
var gl;

var numVertices  = 36;

//var pointsArray  = [];
//var normalsArray = [];

var numObject = 0;
var transformacao = "n";
// n = nada
// t = transl
// r = rot
// s = escala

var direcao = "n";
// n = nada
// x 
// y 
// z 
var backupObj = [];

//VARIAVEIS ADICIONADAS!
var objects = [];
var diam = [];
var lengthObjects = [];
var meio = [];
var selected = -1;
//var normalsArrayCopy  = [];
var normalsByVertices = []; // blaa[vertice] = [[face, normal], [face, normal]]
var faces   = [];           // blaa[face] = [vert, vert, vert]
var normals = [];


//evento do  mouse
var pointerPos = vec2(0.0,0.0);
var mouseClicado = 0;



var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

var lightPosition = vec4( 10.0, 10.0, 10.0, 0.0 );
var lightAmbient  = vec4(  0.2,  0.2,  0.2, 1.0 );
var lightDiffuse  = vec4(  1.0,  1.0,  1.0, 1.0 );
var lightSpecular = vec4(  1.0,  1.0,  1.0, 1.0 );

var materialAmbient   = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse   = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular  = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

// transformation and projection matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

//var ctm;
var ambientColor, diffuseColor, specularColor;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis  = 1;
var theta = [0, 0, 0];

var thetaLoc;

// camera definitions
var eye = vec3(1.0, 0.0, 0.0);
var at  = vec3(0.0, 0.0, 0.0);
var up  = vec3(0.0, 1.0, 0.0);

var cradius = 1.0;
var ctheta  = 0.0;
var cphi    = 0.0;

// our universe
var xleft   = -1.0;
var xright  =  1.0;
var ybottom = -1.0;
var ytop    =  1.0;
var znear   = -100.0;
var zfar    =  100.0;

var flag = true;

// generate a quadrilateral with triangles
function quad(a, b, c, d) 
{
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = vec4(cross(t1, t2), 0);

    pointsArray.push(vertices[a]); 
    normalsArray.push(normal); 

    pointsArray.push(vertices[b]); 
    normalsArray.push(normal); 
     
    pointsArray.push(vertices[c]); 
    normalsArray.push(normal);   
     
    pointsArray.push(vertices[a]);  
    normalsArray.push(normal); 
     
    pointsArray.push(vertices[c]); 
    normalsArray.push(normal); 
     
    pointsArray.push(vertices[d]); 
    normalsArray.push(normal);  

    //adicionando as faces
    faces.push([a, b, c]);
    faces.push([a, c, d]);  
}

// define faces of a cube
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
    meio = [0, 0, 0];
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // create viewport and clear color
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    
    // enable depth testing for hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    //  load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // draw simple cube for starters
    //AQUI colorCube();
    // create vertex and normal buffers
    //createBuffers();

    thetaLoc = gl.getUniformLocation(program, "theta"); 

    // create light components
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    // create model view and projection matrices
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    
    document.getElementById("ButtonS").onclick = function(){seleciona();};

    
    canvas.onmousedown = function(event){
        pointerPos = [event.clientX, event.clientY];
        mouseClicado = 1;
        if(direcao!="n" && transformacao != "n")
        {
            for(var i = 0; i<objects[numObject].pointsArray.length; i++)
            {
                var aux = objects[numObject].pointsArray[i];
                backupObj.push([aux[0], aux[1], aux[2], aux[3]]);
            }
        }
    };

    canvas.onmousemove = function(event){
        if(mouseClicado == 1 && direcao!="n")
        {
            var deslocamento = [];
            deslocamento = [event.clientX - pointerPos[0], event.clientY - pointerPos[1]];

            if(transformacao=="s")
            {
                var tamanho = 1 - deslocamento[1]/220.0;
                if(tamanho > 0)
                {
                    escala(direcao, tamanho);
                }
            }
            else if(transformacao == "t")
            {
                var desloc = deslocamento[1]/220.0;
                translacao(direcao, desloc);
            }
            else if(transformacao == "r")
            {
                var angulo = deslocamento[1]/70.0;
                rotacao(direcao, angulo);
            }
        }
          
    };


    canvas.onmouseup   = function(event){
        var shiftPressed=0;
        shiftPressed = event.shiftKey;
        aPressed = event.aKey;
        if(shiftPressed)
        {
            alert("SHIFT PRINTADO");
        }
        else
        {
            switch (event.which) {
                case 1:
                    direcao = "n";
                    
                    //alert('Left Mouse button pressed.');
                    break;
                case 3:
                    //alert('Right Mouse button pressed.');
                    break;
                }
        }
        mouseClicado = 0;
        backupObj = [];
    };


    window.addEventListener('keydown', function(event) {
      switch (event.keyCode) {
        case 46: // DEl
            if(numObject>=0)
            {
                remove();
            }
        break;

        case 88: // X
            if (transformacao == "n" && numObject>=0)
            {
                remove();
            }
            else if (transformacao!="n")
            {
                direcao = "x";
            }
        break;

        case 89: // Y
            if(transformacao!="n")
            {
                direcao = "y";
            }
        break;

        case 90: // Z
            if(transformacao!="n")
            {
                direcao = "z";
            }
        break;

        case 27: // ESC
          alert("esc");
        break;

        
        
        case 84: // T
            if(numObject>=0)
            {
                transformacao = "t";
            }
        break;

        case 82: // R
            if(numObject>=0)
            {
                transformacao = "r";
            }
        break;

        case 83: // S
            if(numObject>=0)
            {
                transformacao = "s";
            }
        break;
      }
    }, false);

    document.getElementById('files').onchange = function (evt) {
        var obj;
        var files = evt.target.files;
        var file = files[0];           
        var reader = new FileReader();
        
        reader.onload = function() {
            loadObject(this.result);
            render();
            
        }

        reader.readAsText(file)
    };


    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);

}



function seleciona()
{
    numObject = (numObject + 1)%objects.length;
    selected = numObject;
    transformacao = "n";

}

function remove()
{
    objects.splice(numObject, 1);
}

function rotacao(eixo, aumento)
{
    if (eixo == "x")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            var Mrot = [[1.0, 0.0, 0.0, 0.0], 
                    [0.0, Math.cos(aumento), Math.sin(aumento), 0.0], 
                    [0.0, -1*Math.sin(aumento), Math.cos(aumento), 0.0], 
                    [0.0, 0.0, 0.0, 1.0]];
            rotacaoMaisTRanslacao(Mrot, i);
        }
    }
    else if (eixo == "y")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            var Mrot = [[Math.cos(aumento), 0.0, -1*Math.sin(aumento), 0.0], 
                    [0.0, 1.0, 0.0, 0.0], 
                    [Math.sin(aumento), 0.0, Math.cos(aumento), 0.0], 
                    [0.0, 0.0, 0.0, 1.0]];
            rotacaoMaisTRanslacao(Mrot, i);
        }
    }
    else if(eixo == "z")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            var Mrot = [[Math.cos(aumento), Math.sin(aumento), 0.0, 0.0], 
                    [-1.0*Math.sin(aumento), Math.cos(aumento), 0.0, 0.0], 
                    [0.0, 0.0, 1.0, 0.0], 
                    [0.0, 0.0, 0.0, 1.0]];
            rotacaoMaisTRanslacao(Mrot, i);
        }
    }  
}


function translacao(eixo, aumento)
{
 if (eixo == "x")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            objects[numObject].pointsArray[i][0] = backupObj[i][0]+aumento;
        }
    }
    else if (eixo == "y")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            objects[numObject].pointsArray[i][1] = backupObj[i][1]+aumento;
        }
    }
    else if(eixo == "z")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            objects[numObject].pointsArray[i][2] = backupObj[i][2]+aumento;
        }
    }   
}

function escala(eixo, aumento)
{
    if (eixo == "x")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            objects[numObject].pointsArray[i][0] = backupObj[i][0]*aumento;
        }
    }
    else if (eixo == "y")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            objects[numObject].pointsArray[i][1] = backupObj[i][1]*aumento;
        }
    }
    else if(eixo == "z")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            objects[numObject].pointsArray[i][2] = backupObj[i][2]*aumento;
        }
    }
}

function render(obj) {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var wrapper = document.getElementById("gl-wrapper"); 
    var ratio = wrapper.clientHeight/wrapper.clientWidth; 

            
    if (flag) theta[axis] += 2.0;
            
    eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
               cradius * Math.sin(ctheta) * Math.sin(cphi), 
               cradius * Math.cos(ctheta));

    modelViewMatrix = lookAt(eye, at, up);
    modelViewMatrix = mult(modelViewMatrix,scale(vec3(ratio,1,1)));

    projectionMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    for(var i = 0; i < objects.length; i++){
        if(selected != i){
            createBuffers(objects[i]);
            gl.drawArrays( gl.TRIANGLES, 0, (objects[i].pointsArray).length );

            createBuffersLines(objects[i]);
            gl.drawArrays (gl.LINES, 0, 5);
        }else{
            materialDiffuse   = vec4( 1.0, 0.1, 0.0, 1.0 );
            materialSpecular  = vec4( 1.0, 0.1, 0.0, 1.0 );
            diffuseProduct = mult(lightDiffuse, materialDiffuse);
            specularProduct = mult(lightSpecular, materialSpecular);
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );

            createBuffers(objects[i]);
            gl.drawArrays( gl.TRIANGLES, 0, (objects[i].pointsArray).length );

            materialDiffuse   = vec4( 1.0, 0.8, 0.0, 1.0 );
            materialSpecular  = vec4( 1.0, 0.8, 0.0, 1.0 );
            diffuseProduct = mult(lightDiffuse, materialDiffuse);
            specularProduct = mult(lightSpecular, materialSpecular);
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
        }
                
    }

    requestAnimFrame(render);
}

function createBuffersLines(obj) {
    var aux = [[vec4(obj.center[0], obj.center[1], obj.center[2], 1.0)], 
               [vec4(obj.center[0] + 2*obj.diametro, obj.center[1], obj.center[2], 1.0)],
               
               [vec4(obj.center[0], obj.center[1], obj.center[2], 1.0)], 
               [vec4(obj.center[0], obj.center[1] + 2*obj.diametro, obj.center[2], 1.0)],
               
               [vec4(obj.center[0], obj.center[1], obj.center[2], 1.0)], 
               [vec4(obj.center[0], obj.center[1], obj.center[2] + 2*obj.diametro, 1.0)]];

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(aux), gl.STATIC_DRAW );

    //var vNormal = gl.getAttribLocation( program, "vNormal" );
    //gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    //gl.enableVertexAttribArray( vNormal );
}

function createBuffers(obj) {
    var aux = obj;

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(aux.normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(aux.pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition)
}



function loadObject(data) {
    // TO DO: convert strings into array of vertex and normal vectors


    var result = loadObjFile(data,objects);
    var k = 0;
    /*
    for(var i = 0; i<lengthObjects.length; i++)
    {
        for(var j = 0; j<lengthObjects[i]; j++)
        {
            console.log("antes   " + pointsArray[j+k]);
            pointsArray[j+k] = multVectorMatrix(pointsArray[j+k],scale(
            vec3(2/diam[i],2/diam[i],2/diam[i])));
            console.log("depois   " + pointsArray[j+k]);
        }
        k+=lengthObjects[i];
    }
    */

    // TO DO: apply transformation to the object so that he is centered at the origin
}





// FUNÇÕES ADICIONADAS!






function rotacaoMaisTRanslacao(Mrot ,ponto)
{
    backupObj[ponto][0] -= objects[numObject].center[0];
    backupObj[ponto][1] -= objects[numObject].center[1];
    backupObj[ponto][2] -= objects[numObject].center[2];

    //alert("centro" + objects[numObject].center);

    objects[numObject].pointsArray[ponto] = multVectorMatrix(backupObj[ponto], Mrot);
    
    backupObj[ponto][0] += objects[numObject].center[0];
    backupObj[ponto][1] += objects[numObject].center[1];
    backupObj[ponto][2] += objects[numObject].center[2];

    objects[numObject].pointsArray[ponto][0] += objects[numObject].center[0];
    objects[numObject].pointsArray[ponto][1] += objects[numObject].center[1];
    objects[numObject].pointsArray[ponto][2] += objects[numObject].center[2];
}



function multVectorMatrix(v, m)
{
    var vec = [];
    var sum ;
    for(var i = 0; i<m.length; i++)
    {
        sum = 0;
        for(var j = 0; j<v.length; j++)
        {
            sum += v[j]*m[i][j];
        }
        vec.push(sum);
    }
    return vec;
}