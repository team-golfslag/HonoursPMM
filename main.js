main();


function main() {
  const canvas = document.querySelector("#glcanvas");
  const gl = canvas.getContext("webgl2");

  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);


  const vsSource = `#version 300 es
    in vec2 aVertexPosition;

    void main(void) {
      gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    }
  `;



  const fsSource = `#version 300 es
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;

    out vec4 outColor;

    void main(void) {
      float angle = 0.7 * time;
      vec2 normalizedCoord = gl_FragCoord.xy / resolution.xy * 2.0 - 1.0;
      for(float i = 0.0; i < 0.1 * time; i++) {
        normalizedCoord = abs(normalizedCoord);
        normalizedCoord -= 0.5;
        normalizedCoord *= 1.2;
        normalizedCoord *= mat2(
          cos(angle), -sin(angle),
          sin(angle), cos(angle)
        );
      }
      outColor = vec4(vec3(length(normalizedCoord)), 1.0);
    }
  `;

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    
    },
    uniformLocations: {
      time: gl.getUniformLocation(
        shaderProgram,
        "time"
      ),
      resolution: gl.getUniformLocation(shaderProgram, "resolution"),
    },
  };

  let then = 0;

  var edges = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    1.0, 1.0,
  ];
    
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(edges), gl.STATIC_DRAW);

  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(programInfo.vertexPosition);
  gl.vertexAttribPointer(
    programInfo.vertexPosition,
    2, // size
    gl.FLOAT, // type
    false, // normalize
    0, // stride
    0 // offset
  );
  

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(programInfo.program);
  gl.bindVertexArray(vao);
  gl.uniform2f(
    programInfo.uniformLocations.resolution,
    gl.canvas.width,
    gl.canvas.height
  );
  
  function render(now) {
    now *= 0.001;
    let deltaTime = now - then;
    then = now;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(programInfo.uniformLocations.time, now);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); 
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}




function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);



  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram,
      )}`,
    );
    return null;
  }

  return shaderProgram;
}


function loadShader(gl, type, source) {
  const shader = gl.createShader(type);


  gl.shaderSource(shader, source);


  gl.compileShader(shader);


  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
