

var program;
var canvas;
var gl;

var numVertices  = 36;

var pointsArray  = [];
var normalsArray = [];

//VARIAVEIS ADICIONADAS!
var meio = [];
var diam = Math.sqrt(3);
var normalsArrayCopy  = [];
var normalsByVertices = []; // blaa[vertice] = [[face, normal], [face, normal]]
var faces   = [];           // blaa[face] = [vert, vert, vert]
var normals = [];


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
    colorCube();
    // create vertex and normal buffers
    createBuffers();

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
    document.getElementById("ButtonF").onclick = function(){flat();};
    document.getElementById("ButtonSA").onclick = function(){smooth1();};
    document.getElementById("ButtonSC").onclick = function(){smooth();};

    document.getElementById('files').onchange = function (evt) {
        var obj;
        var files = evt.target.files;
        var file = files[0];           
        var reader = new FileReader();
        
        reader.onload = function() {
             loadObject(this.result);
             

             createBuffers();
             render();
        }
        reader.readAsText(file)
    };

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
    
    render();
}

var render = function() {
            
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    if (flag) theta[axis] += 2.0;
            
    eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
               cradius * Math.sin(ctheta) * Math.sin(cphi), 
               cradius * Math.cos(ctheta));

    modelViewMatrix = lookAt(eye, at, up);
              
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1] ));

    modelViewMatrix = mult(modelViewMatrix,scale(vec3(2/diam,2/diam,2/diam)));
    modelViewMatrix = mult(modelViewMatrix,translate(vec3  (-meio[0],-meio[1],-meio[2])  ));


    projectionMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length );
            
    requestAnimFrame(render);
}

function createBuffers(points, normals) {
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition)
}



function loadObject(data) {
    // TO DO: convert strings into array of vertex and normal vectors

    var result = loadObjFile(data);

    // TO DO: apply transformation to the object so that he is centered at the origin
}





// FUNÇÕES ADICIONADAS!

function flat()
{
    normalsArray = [];
    var i, j;
    var t1, t2, normal1;
    for(i = 0; i<faces.length; i++)
    {
        t1 = subtract(vertices[faces[i][0]], vertices[faces[i][1]]);
        t2 = subtract(vertices[faces[i][0]], vertices[faces[i][2]]);
        normal1 = vec4(cross(t1, t2), 0);
        for(j = 0; j<faces[i].length; j++)
        {
            normalsArray.push(vec4(normal1[0], normal1[1], normal1[2], 0));
        }
    }
    createBuffers();
    render();
}


function smooth()
{
    normalsArray = [];
    calculaNormaisSmooth();
    for(var i = 0; i<faces.length; i++) //i é a face
    {
        for (var j = 0; j<faces[i].length; j++) //j é vertice da face
        { 
            var x = 0, y = 0, z = 0, num;
            for(var k = 0; k<normalsByVertices[faces[i][j]].length; k++)
            {
                x = x + normalsByVertices[faces[i][j]][k][1][0];
                y = y + normalsByVertices[faces[i][j]][k][1][1];
                z = z + normalsByVertices[faces[i][j]][k][1][2];
            }
            num  = normalsByVertices[j].length;
            x = x/num;
            y = y/num;
            z = z/num;
            normalsArray.push(vec4(x, y, z, 0));
        }
    }
    createBuffers();
    render();
}

function smooth1()
{
    if(normalsArrayCopy.length == 0)
    {
        alert("As normais não foram especificadas no arquivo!");
    }
    else{
        normalsArray = [];
        for(var i=0; i<normalsArrayCopy.length; i++)
        {
            var v = normalsArrayCopy[i];
            normalsArray.push(vec4(v[0], v[1], v[2], v[3]));
        }
        createBuffers();
        render();
    }
}

function calculaNormaisSmooth()
{
    for(var i = 0; i<vertices.length; i++)
    {
        normalsByVertices[i] = [];
    }
        normalsArray = [];
    var t1, t2, n;
    for(var i = 0; i<faces.length; i++)
    {
        t1 = subtract(vertices[faces[i][0]], vertices[faces[i][1]]);
        t2 = subtract(vertices[faces[i][0]], vertices[faces[i][2]]);
        n = vec4(cross(t1, t2), 0);
        for(var j = 0; j<faces[i].length; j++)
        {
            normalsByVertices[faces[i][j]].push([i, vec4 (n[0], n[1], n[2], n[3]) ]);   
        }
    }
}