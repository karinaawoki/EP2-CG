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
var backupCenter = [];
var backupDelta = [];

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
var pointerPosZ = vec2(0.0,0.0);
var mouseClicado = 0;

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

// camera definitions
var eye = vec3(1.0, 0.0, 0.0);
var at  = vec3(0.0, 0.0, 0.0);
var up  = vec3(0.0, 1.0, 0.0);

var cradius = 2.0;
var ctheta  = 0.0;
var cphi    = 0.0;

// our universe
var xleft   = -1.0;
var xright  =  1.0;
var ybottom = -1.0;
var ytop    =  1.0;
var znear   = -100.0;
var zfar    =  100.0;

var near = -1;
var far = 1;

var flag = true;

// generate a quadrilateral with triangles
function quad(objPoints, objNormals, a, b, c, d) 
{
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = vec4(cross(t1, t2), 0);

    objPoints.push(vertices[a]); 
    objNormals.push(normal); 

    objPoints.push(vertices[b]); 
    objNormals.push(normal); 
     
    objPoints.push(vertices[c]); 
    objNormals.push(normal);   
     
    objPoints.push(vertices[a]);  
    objNormals.push(normal); 
     
    objPoints.push(vertices[c]); 
    objNormals.push(normal); 
     
    objPoints.push(vertices[d]); 
    objNormals.push(normal);  

    //adicionando as faces
    faces.push([a, b, c]);
    faces.push([a, c, d]);  
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
    eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
               cradius * Math.sin(ctheta) * Math.sin(cphi), 
               cradius * Math.cos(ctheta));

    var radius = 1;
    //if(znear - zfar > 0) radius = znear-zfar;
    //else radius = zfar - znear;

    // create light components
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    // create model view and projection matrices
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    
    document.getElementById("ButtonS").onclick = function(){seleciona();};

    canvas.oncontextmenu = function(event){ return false;};
    
    canvas.onmousedown = function(event){
        pointerPos = [event.clientX, event.clientY];
        mouseClicado = 1;

        if(event.button == 2){ 
            console.log("oe");
            var vp_right = canvas.width;
            var vp_top = canvas.height;
            //var can_x;
            //var can_y;

            var X = (event.clientX * (2/vp_right)) - 1;
            // O ponto (0, 0) no canvas e o conto superior esquerdo.
            var Y = 1 - (event.clientY * (2/vp_top));

            pointerPosZ = [X,Y];
        }
        if(direcao!="n" && transformacao != "n")
        {
            for(var i = 0; i<objects[numObject].pointsArray.length; i++)
            {
                var aux = objects[numObject].pointsArray[i];
                backupObj.push([aux[0], aux[1], aux[2], aux[3]]);
            }

            if(transformacao=="t" && direcao!="n")
            {
                backupCenter = [objects[numObject].center[0], 
                                objects[numObject].center[1], 
                                objects[numObject].center[2]];
            }
            else if(transformacao == "s" && direcao!="n")
            {
                backupDelta = [objects[numObject].delta[0],
                               objects[numObject].delta[1],
                               objects[numObject].delta[2]];
            }
        }
    };

    canvas.onmousemove = function(event){

        if(mouseClicado == 1 && direcao!="n")
        {
            var desl = [];
            desl = [event.clientX - pointerPos[0], event.clientY - pointerPos[1]];
            

            if(transformacao=="s" )
            {
                var tamanho = 1 - desl[1]/220.0;
                if(tamanho > 0)
                {
                    escala(direcao, tamanho);
                }
            }
            else if(transformacao == "t")
            {
                var desloc = -1* desl[1]/220.0;
                translacao(direcao, desloc);
            }
            else if(transformacao == "r")
            {   
                var angulo = -1*desl[1]/70.0;
                rotacao(direcao, angulo);
            }
        }
          
    };


    canvas.onmouseup   = function(event){
        var shiftPressed=0;
        shiftPressed = event.shiftKey;
        aPressed = event.aKey;

        console.log(event.button);

        switch (event.button) {
            case 0:
                direcao = "n";

                        ///ROTAÇÃO////
                if (numObject<0)
                {

                    //var X = event.clientX;
                    //var Y = event.clientY;  

                    var vp_right = canvas.width;
                    var vp_top = canvas.height;
                    //var can_x;
                    //var can_y;

                    var X = (event.clientX * (2/vp_right)) - 1;
                    // O ponto (0, 0) no canvas e o conto superior esquerdo.
                    var Y = 1 - (event.clientY * (2/vp_top));

                    var z1 = 0;
                    if(pointerPos[0]*pointerPos[0] + pointerPos[1]*pointerPos[1] <= (radius*radius)/2) z1 = Math.sqrt(radius*radius - (pointerPos[0]*pointerPos[0] + pointerPos[1]*pointerPos[1]));
                    else z1 = ((radius*radius/2))/Math.sqrt(pointerPos[0]*pointerPos[0] + pointerPos[1]*pointerPos[1]);

                    var z2 = 0;
                    if(X*X + Y*Y <= (radius*radius)/2) z2 = Math.sqrt(radius*radius - (X*X + Y*Y));
                    else z2 = ((radius*radius/2))/Math.sqrt(X*X + Y*Y);

                    var v1 = normalize(vec3(pointerPos[0],pointerPos[1],z1));
                    console.log("v1 " + v1);
                    var v2 = normalize(vec3(X,Y,z2));
                    console.log("v2 " + v2);


                    if(v1[0] == v2[0] && v1[1] == v2[1] && v1[2] == v2[2]) var N = vec3(1.0,0.0,0.0);
                    else{
                        var N = normalize(cross(v1,v2));
                        console.log("N " + N);                
                    }


                    var theta = 50* Math.acos(dot(v1,v2));
                    console.log("theta " + theta);

                    var Q = new Quaternion(Math.cos(radians(theta/2)),scale2(Math.sin(radians(theta/2)),N));
                    Q = normalize(Q);
                    console.log("Q "+Q.s + Q.v );


                    var eye2 = new Quaternion(0,eye);
                    var at2 = new Quaternion(0,at);
                    var up2 = new Quaternion(0,up);


                    eye2 = Q.mult(eye2.mult(Q.conjugate()));
                    up2 = Q.mult(up2.mult(Q.conjugate()));

                    eye = eye2.v;
                    up = up2.v;
                    /////////////
                }                    
                //alert('Left Mouse button pressed.');
                break;
            case 2:
                // Zoom in and zoom out.
                var vp_right = canvas.width;
                var vp_top = canvas.height;
                //var can_x;
                //var can_y;

                var X = (event.clientX * (2/vp_right)) - 1;
                // O ponto (0, 0) no canvas e o conto superior esquerdo.
                var Y = 1 - (event.clientY * (2/vp_top));

                var dx = pointerPosZ[0] - X;
                var dy = pointerPosZ[1] - Y;
                var dist = Math.sqrt(dx*dx + dy*dy);

                var new_near = near, new_far = far;

                if ((X >= pointerPosZ[0] && Y >= pointerPosZ[1]) ||
                    (X <= pointerPosZ[0] && Y >= pointerPosZ[1])) {
                    // zoomCoords[2] = zoomCoords[2] + dist;
                    new_far  += dist/2;
                    new_near -= dist/2;
                }
                else {
                    // zoomCoords[2] = zoomCoords[2] - dist;
                    new_far  -= dist/2;
                    new_near += dist/2;
                }

                if (new_far - new_near < 1){console.log("po"); break; }
                if (new_far - new_near > 32){console.log("vei"); break;}

                far = new_far;
                near = new_near;
                console.log("near: " + near + " far: " + far);
                cradius = far-near;

                // create eye
                eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
                           cradius * Math.sin(ctheta) * Math.sin(cphi),
                           cradius * Math.cos(ctheta));
                break;
            }
    
        mouseClicado = 0;
        backupObj = [];
        backupDelta = [];
        backupCenter = [];
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
          // Retirar seleção de objetos
          direcao = "n";
          transformacao = "n";
          selected = -1;
          numObject = -1;
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
    numObject = -1;
    selected = -1;
}

function rotacao(eixo,aumento)
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
            if (numObject!=selected){ alert("ERROOOO!!");  }
            objects[numObject].pointsArray[i][0] = backupObj[i][0]+aumento;
        }
        objects[numObject].center[0] = backupCenter[0]+aumento;

    }
    else if (eixo == "y")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            objects[numObject].pointsArray[i][1] = backupObj[i][1]+aumento;
        }
        objects[numObject].center[1] = backupCenter[1]+aumento;
    }
    else if(eixo == "z")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            objects[numObject].pointsArray[i][2] = backupObj[i][2]+aumento;
        }
        objects[numObject].center[2] = backupCenter[2]+aumento;
    }   
}

function escala(eixo, aumento)
{
    if (eixo == "x")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            var aux = objects[numObject].center[0];
            objects[numObject].pointsArray[i][0] = (backupObj[i][0]-aux)*aumento+aux;
        }

        objects[numObject].delta[0] = backupDelta[0] * aumento;
        objects[numObject].diametro = Math.sqrt(objects[numObject].delta[0]*objects[numObject].delta[0]
                                              + objects[numObject].delta[1]*objects[numObject].delta[1]
                                              + objects[numObject].delta[2]*objects[numObject].delta[2]);
    }
    else if (eixo == "y")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            var aux = objects[numObject].center[1];
            objects[numObject].pointsArray[i][1] = (backupObj[i][1]-aux)*aumento+aux;
            
        }
        objects[numObject].delta[1] = backupDelta[1] * aumento;
        objects[numObject].diametro = Math.sqrt(objects[numObject].delta[0]*objects[numObject].delta[0]
                                              + objects[numObject].delta[1]*objects[numObject].delta[1]
                                              + objects[numObject].delta[2]*objects[numObject].delta[2]);
    }
    else if(eixo == "z")
    {
        for(var i = 0; i<objects[numObject].pointsArray.length; i++)
        {
            var aux = objects[numObject].center[2];
            objects[numObject].pointsArray[i][2] = (backupObj[i][2]-aux)*aumento + aux;
            
        }
        objects[numObject].delta[2] = backupDelta[2] * aumento;
        objects[numObject].diametro = Math.sqrt(objects[numObject].delta[0]*objects[numObject].delta[0]
                                              + objects[numObject].delta[1]*objects[numObject].delta[1]
                                              + objects[numObject].delta[2]*objects[numObject].delta[2]);
    }
}

function render(obj) {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var wrapper = document.getElementById("gl-wrapper"); 
    var ratio = wrapper.clientHeight/wrapper.clientWidth; 

            
    //if (flag) theta[axis] += 2.0;
            
    /*eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
               cradius * Math.sin(ctheta) * Math.sin(cphi), 
               cradius * Math.cos(ctheta));*/

    console.log("EYE >>" + eye);

    modelViewMatrix = lookAt(eye, at, up);
    
    modelViewMatrix = mult(modelViewMatrix,scale(vec3(ratio,ratio,ratio)));
    //modelViewMatrix = mult(modelViewMatrix, translate());
    //projectionMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);
    projectionMatrix = perspective(45,1/ratio,near,far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    for(var i = 0; i < objects.length; i++){
        if(selected != i){
            createBuffers(objects[i]);
            gl.drawArrays( gl.TRIANGLES, 0, (objects[i].pointsArray).length );

            
        }else{
            materialDiffuse   = vec4( 1.0, 0.4, 0.0, 1.0 );
            materialSpecular  = vec4( 1.0, 0.4, 0.0, 1.0 );
            diffuseProduct = mult(lightDiffuse, materialDiffuse);
            specularProduct = mult(lightSpecular, materialSpecular);
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );

            createBuffers(objects[i]);
            gl.drawArrays( gl.TRIANGLES, 0, (objects[i].pointsArray).length );

            ////////////Desenha Linhas //////////////
            createBuffersLines(objects[i]);
            gl.lineWidth(3);
            var lightAmbientLine = vec4( 1.0, 1.0, 1.0, 1.0 );
            var materialAmbientLine   = vec4( 1.0, 0.0, 0.0, 1.0 );
            var ambientProductLine = mult(lightAmbientLine, materialAmbientLine);
            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProductLine));
            gl.drawArrays( gl.LINE_STRIP, 0, 2);

            lightAmbientLine = vec4( 1.0, 1.0, 1.0, 1.0 );
            materialAmbientLine   = vec4( 0.0, 1.0, 0.0, 1.0 );
            ambientProductLine = mult(lightAmbientLine, materialAmbientLine);
            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProductLine));
            gl.drawArrays( gl.LINE_STRIP, 2, 2);

            lightAmbientLine = vec4( 1.0, 1.0, 1.0, 1.0 );
            materialAmbientLine   = vec4( 0.0, 0.0, 1.0, 1.0 );
            ambientProductLine = mult(lightAmbientLine, materialAmbientLine);
            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProductLine));
            gl.drawArrays( gl.LINE_STRIP, 4, 2);
            ////////////Desenha Linhas //////////////
            

            lightAmbient  = vec4(  0.2,  0.2,  0.2, 1.0 );
            materialAmbient   = vec4( 1.0, 0.0, 1.0, 1.0 );
            ambientProduct = mult(lightAmbient, materialAmbient);
            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
            
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
   var aux = [
       vec4(obj.center[0], obj.center[1], obj.center[2], 1.0), 
       vec4(obj.center[0] + obj.diametro*0.6, obj.center[1], obj.center[2], 1.0),   
       vec4(obj.center[0], obj.center[1], obj.center[2], 1.0), 
       vec4(obj.center[0], obj.center[1] + obj.diametro*0.6, obj.center[2], 1.0),
       vec4(obj.center[0], obj.center[1], obj.center[2], 1.0), 
       vec4(obj.center[0], obj.center[1], obj.center[2] + obj.diametro*0.6, 1.0)
   ];

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(aux), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
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