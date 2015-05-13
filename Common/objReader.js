function loadObjFile(data,objects) {

  // TO DO:   (i) Parse OBJ file and extract vertices and normal vectors
  var fPosition = 0;
  var lPosition;
  var line, p1, p2, k = 0;
  var maxX, minX, maxY, minY, maxZ, minZ;
  var smooth1 = 0;
  var lengthAux = 0;
  var meio = [];

  //We have to clean the vectors to delete the cube informations
  faces = [];
  vertices = [];
  normals  = [];
  objPoints  = []; 
  objNormals = [];
  objNormalsCopy = [];

  while(fPosition < data.length)
  {
      lPosition = data.indexOf("\n", fPosition);
      if (data.substring(fPosition, fPosition+2).localeCompare("v ") == 0)
      {
        //vertices
        var v1, v2, v3;
        p1 = data.indexOf(" ", fPosition+2);
        v1 = parseFloat(data.substring(fPosition + 2, p1));
        p2 = data.indexOf(" ", p1+1);
        v2 = parseFloat(data.substring(p1+1, p2));
        p1 = data.indexOf("\n", p2+1);
        v3 = parseFloat(data.substring(p2+1, p1));
        vertices.push(vec4(v1, v2, v3, 1.0));
        normalsByVertices.push([]);
        if(k == 0)
        {
          maxX = minX = v1;
          maxY = minY = v2;
          maxZ = minZ = v3;
          k = 1;
        }

        if(v1 > maxX)
        {
          maxX = v1;
        }
        else if(v1 < minX)
        {
          minX = v1;
        }
        if(v2 > maxY)
        {
          maxY = v2;
        }
        else if(v2 < minY)
        {
          minY = v2;
        }
        if(v3 > maxZ)
        {
          maxZ = v3;
        }
        else if(v3<minZ)
        {
          minZ = v3;
        }

      }
      else if (data.substring(fPosition, fPosition+2).localeCompare("f ") == 0)
      {
        //faces
        var v1, v2, v3, v4, vn;
        var auxSpace, aux;
        auxSpace = data.indexOf(" ", fPosition+2);
        aux = data.indexOf("//", fPosition+2);
        if (auxSpace < aux || aux == -1)
        {
          // form: f v1 v2 v3
          var p1, p2, s;
          v1 = readFace(fPosition+2, data, 0);
          p1 = data.indexOf(" ", fPosition+2); // espaço entre v1 e v2
          v2 = readFace(p1+1, data, 0);
          p2 = data.indexOf(" ", p1+1);  // espaço entre v2 e v3
          v3 = readFace(p2 +1, data, 0);
          p1 = data.indexOf(" ", p2+1); //espaço entre v3 e v4

          //face com 4 vertices
          if(p1!=-1 && p1 < lPosition)
          {
            lengthAux+=6;
            v4 = readFace(p1+1, data, 0);
            quad(objPoints, objNormals,v1-1, v2-1, v3-1, v4-1);
          }

          //face com 3 vertices
          else
          {
            var s;
            var t1, t2, vn;
            lengthAux += 3;
            t1 = subtract(vertices[v2-1], vertices[v1-1]);
            t2 = subtract(vertices[v3-1], vertices[v2-1]);
            vn = vec4(cross(t1, t2), 0);

            s = vertices[v1-1];
            objPoints.push(vec4(s[0], s[1], s[2], 1)); 
            objNormals.push(vn);

            s = vertices[v2-1];
            objPoints.push(vec4(s[0], s[1], s[2], 1)); 
            objNormals.push(vn); 

            s = vertices[v3-1];
            objPoints.push(vec4(s[0], s[1], s[2], 1)); 
            objNormals.push(vn); 

            faces.push([v1-1, v2-1, v3-1]);
          }
        }
        else
        {
          // form: v1//vn1 v2//vn2 v3//vn3
          smooth1 = 1;
          var p1, p2, p3, n, s;
          var n1, n2, n3, n4;
          var nv1, nv2, nv3, nv4;
          v1 = readFace(fPosition+2, data, 1); 
          p1 = data.indexOf(" ", fPosition+2);  //espaço entre v1 e v2
          p2 = data.indexOf("//", fPosition+2); // // entre v1 e vn1
          s = data.substring(p2+2, p1);
          nv1 = parseInt(s)-1;
          n1  = normals[nv1]; 

          v2 = readFace(p1+1, data, 1);
          p2 = data.indexOf(" ", p1+1); // espaço entre v2 e v3
          p1 = data.indexOf("//", p1+1);// // entre v2 e vn2
          s = data.substring(p1+2, p2);
          nv2 = parseInt(s)-1;
          n2 = normals[nv1];

          v3 = readFace(p2 +1, data, 1);
          p1 = data.indexOf(" ", p2+1); //espaço entre v3 e v4
          p3 = data.indexOf("//", p2+1); // // entre v3 e vn3
          if(p1==-1 || p1>lPosition)
          {
            p1 = lPosition;
          }
          s = data.substring(p3+2, p1);
          nv3 = parseInt(s)-1;
          n3 = normals[nv3];

          //face com 4 vertices
          if(p1!=-1 && p1<lPosition)
          {
            p2 = data.indexOf("\n", p1);
            v4 = readFace(p1+1, data, 1);
            s = data.substring(p1+1, p2);
            nv4 = parseInt(s)-1;
            n4 = normals[nv4];

            lengthAux += 6;

            s = vertices[v1-1];
            objPoints.push(vec4(s[0], s[1], s[2], 1)); 
            objNormals.push(vec4(n1[0], n1[1], n1[2], 0)); 

            s = vertices[v2-1];
            objPoints.push(vec4(s[0], s[1], s[2], 1)); 
            objNormals.push(vec4(n2[0], n2[1], n2[2], 0));  
             
            s = vertices[v3-1];
            objPoints.push(vec4(s[0], s[1], s[2], 1)); 
            objNormals.push(vec4(n3[0], n3[1], n3[2], 0)); 
             
            s = vertices[v1-1];
            objPoints.push(vec4(s[0], s[1], s[2], 1));  
            objNormals.push(vec4(n1[0], n1[1], n1[2], 0)); 
                        
            s = vertices[v3-1];
            objPoints.push(vec4(s[0], s[1], s[2], 1)); 
            objNormals.push(vec4(n3[0], n3[1], n3[2], 0)); 
                      
            s = vertices[v4-1];
            objPoints.push(vec4(s[0], s[1], s[2], 1)); 
            objNormals.push(vec4(n4[0], n4[1], n4[2], 0)); 
            
            faces.push([v1-1, v2-1, v3-1]);
            faces.push([v1-1, v3-1, v4-1]);  
          }

          //face com 3 vertices
          else
          {
            lengthAux+=3;
            s = vertices[v1-1];
            objPoints.push(vec4(s[0], s[1], s[2], 1.0)); 
            objNormals.push(vec4(n1[0], n1[1], n1[2], 0.0));

            s = vertices[v2-1];
            objPoints.push(vec4(s[0], s[1], s[2], 1.0)); 
            objNormals.push(vec4(n2[0], n2[1], n2[2], 0.0)); 

            s = vertices[v3-1];
            objPoints.push(vec4(s[0], s[1], s[2], 1.0)); 
            objNormals.push(vec4(n3[0], n3[1], n3[2], 0.0));  

            faces.push([v1-1, v2-1, v3-1]);
          }
        }
      }
      else if (data.substring(fPosition, fPosition+3).localeCompare("vn ") == 0)
      {
        //normals
        var vn1, vn2, vn3;
        p1 = data.indexOf(" ", fPosition+3);
        vn1 = parseFloat(data.substring(fPosition + 3, p1));
        p2 = data.indexOf(" ", p1+1);
        vn2 = parseFloat(data.substring(p1+1, p2));
        p1 = data.indexOf("\n", p2+1);
        vn3 = parseFloat(data.substring(p2+1, p1));
        normals.push(vec4(vn1, vn2, vn3, 1));
      }
      fPosition = lPosition+1;
  }
  lengthObjects.push(lengthAux);

  // FAZENDO um backup do normalArray
  for(var k = 0; smooth1 == 1 && k<objNormals.length; k++)
  {
    var v = objNormals[k];
    objNormalsCopy.push(vec4(v[0], v[1], v[2], v[3]));
  }

  meio = [(minX + maxX)/2.0, (minY + maxY)/2.0, (minZ + maxZ)/2.0];  
  diam.push(Math.sqrt((maxX - minX)*(maxX - minX) + (maxY - minY)*(maxY - minY) + (maxZ - minZ)*(maxZ - minZ)));

  //centraliza(objPoints, meio);

  var obj = {
    pointsArray: objPoints,
    normalsArray: objNormals,
    center: meio,
    diametro: Math.sqrt((maxX - minX)*(maxX - minX) 
                      + (maxY - minY)*(maxY - minY) 
                      + (maxZ - minZ)*(maxZ - minZ)),
    delta: [maxX-minX, maxY-minY, maxZ-minZ]
  };

  objects.push(obj);

}

function centraliza(obj, center)
{
  for(var i = 0; i<obj.length; i++)
  {
    obj[i][0] = obj[i][0] - center[0];
    obj[i][1] = obj[i][1] - center[1];
    obj[i][2] = obj[i][2] - center[2];
  }
}

function calculaDiametro(obj)
{
  obj.pointsArray
}

function readFace(position, data, vn)
{
  var end, num;
  if (vn == 1)
  {
    end = data.indexOf("//", position);
    num = data.substring(position, end);
  }
  else
  {
    end = data.indexOf(" ", position);
    if(end > data.indexOf("\n", position)||end ==-1)
    {
      end = data.indexOf("\n", position);
    }
    num = data.substring(position, end);
  }
  num = parseInt(num);
  return num;
}