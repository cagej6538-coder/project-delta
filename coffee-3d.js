// Self-contained WebGL geometry. No CDN, frameworks, external models or paid API.
(() => {
  'use strict';
  const host = document.querySelector('.hero-art');
  const journey = document.querySelector('.coffee-journey');
  const stage = document.getElementById('coffee-stage');
  const canvas = document.createElement('canvas');
  canvas.className = 'webgl-coffee';
  canvas.setAttribute('aria-label', '3D coffee cup. Drag horizontally or use the rotate buttons. Scroll to lift the lid.');
  canvas.setAttribute('role', 'img');
  const gl = canvas.getContext('webgl', { alpha:true, antialias:true, powerPreference:'low-power' });
  function fallback() { canvas.remove();host.classList.remove('has-webgl');journey.classList.add('coffee-fallback');stage.textContent='3D unavailable on this device. Showing illustrated coffee.'; }
  if (!gl) { fallback();return; }
  const vertex = `attribute vec3 position; attribute vec3 normal; attribute vec2 uv;
    uniform vec3 rotation; uniform vec3 offset; uniform float aspect; uniform float zoom;
    varying vec3 N; varying vec2 UV; varying vec3 P;
    mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
    mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
    mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
    void main(){mat3 R=rz(rotation.z)*rx(rotation.x)*ry(rotation.y);vec3 p=R*(position+offset);N=R*normal;P=p;UV=uv;float d=7.-p.z;gl_Position=vec4(p.x*zoom/aspect,p.y*zoom,0.9*d-0.2,d);}`;
  const fragment = `precision mediump float; varying vec3 N; varying vec2 UV; varying vec3 P;
    uniform vec3 color;uniform sampler2D label;uniform float textured;
    void main(){vec3 n=normalize(N);float light=max(dot(n,normalize(vec3(-3.,5.,5.))),0.);float rim=pow(1.-abs(dot(n,vec3(0.,0.,1.))),3.);vec3 base=mix(color,texture2D(label,UV).rgb,textured);vec3 lit=base*(0.43+0.60*light)+vec3(0.07)*rim;gl_FragColor=vec4(lit,1.);}`;
  function shader(type, source) {const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  let program;
  try {program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WebGL link failed');}catch(error){console.warn('Coffee 3D fallback:',error);fallback();return;}
  gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  const uniforms=Object.fromEntries(['rotation','offset','aspect','zoom','color','textured','label'].map(name=>[name,gl.getUniformLocation(program,name)]));
  const attributes=Object.fromEntries(['position','normal','uv'].map(name=>[name,gl.getAttribLocation(program,name)]));
  // Revolve a radius/height profile into a triangle mesh, including sloped normals.
  function lathe(profile) {
    const vertices=[]; const segments=96;
    for(let row=0;row<profile.length-1;row++){
      const [r0,y0]=profile[row],[r1,y1]=profile[row+1];const dy=y1-y0,dr=r1-r0;const length=Math.hypot(dy,dr)||1;
      const add=(r,y,a,u)=>{vertices.push(r*Math.sin(a),y,r*Math.cos(a),dy/length*Math.sin(a),-dr/length,dy/length*Math.cos(a),u,(y+1.4)/2.8);};
      for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;add(r0,y0,a,i/segments);add(r1,y1,a,i/segments);add(r1,y1,b,(i+1)/segments);add(r0,y0,a,i/segments);add(r1,y1,b,(i+1)/segments);add(r0,y0,b,(i+1)/segments);}
    }
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);return {buffer,count:vertices.length/8};
  }
  const body=lathe([[0,-1.4],[.62,-1.4],[.66,-1.32],[.86,1.14],[.88,1.2],[.81,1.2],[.60,-1.28],[0,-1.28]]);
  const sleeve=lathe([[.715,-.7],[.775,-.7],[.856,.5],[.80,.5]]);
  const lid=lathe([[0,1.26],[.96,1.26],[.96,1.35],[.90,1.39],[.85,1.39],[.85,1.49],[.73,1.57],[0,1.57]]);
  const coffee=lathe([[0,1.05],[.81,1.05]]);
  const crema=lathe([[.67,1.053],[.75,1.053]]);
  // The wrapping label is an original code-drawn texture, not a remote image.
  const paint=document.createElement('canvas');paint.width=1024;paint.height=512;
  const ctx=paint.getContext('2d');ctx.fillStyle='#c7d4b7';ctx.fillRect(0,0,1024,512);ctx.fillStyle='#263322';ctx.textAlign='center';
  [0,512,1024].forEach(x=>{ctx.font='900 55px Arial';ctx.fillText('tasty crib',x,250);ctx.font='14px monospace';ctx.fillText('A LITTLE DAILY JOY.',x,285);ctx.font='36px Arial';ctx.fillText('✳',x,333);});
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,paint);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(uniforms.label,0);
  host.append(canvas);host.classList.add('has-webgl');
  const controls=document.createElement('div');controls.className='coffee-controls';controls.innerHTML='<button type="button" data-spin="-1" aria-label="Rotate coffee cup left">↶ Rotate</button><button type="button" data-open-cup aria-pressed="false">Open cup</button><button type="button" data-spin="1" aria-label="Rotate coffee cup right">Rotate ↷</button><button type="button" data-pause aria-pressed="false">Pause motion</button><p>REAL 3D · DRAG TO ROTATE · SCROLL TO OPEN</p>';document.querySelector('.hero').append(controls);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let angle=0,progress=0,manualOpen=false,paused=false,drag=false,lastX=0,raf=0,previous=0,visible=true,lost=false;
  function drawMesh(mesh,color,offset,textured=0){gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);for(const [key,size,start] of [['position',3,0],['normal',3,12],['uv',2,24]]){gl.enableVertexAttribArray(attributes[key]);gl.vertexAttribPointer(attributes[key],size,gl.FLOAT,false,32,start);}gl.uniform3fv(uniforms.color,color);gl.uniform3fv(uniforms.offset,offset);gl.uniform1f(uniforms.textured,textured);gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
  function draw(time){raf=0;if(lost)return;const delta=previous?Math.min((time-previous)/1000,.05):0;previous=time;
    if(!paused&&!reduced.matches&&!drag&&visible)angle+=delta*.20;
    const rect=journey.getBoundingClientRect();progress=reduced.matches?0:Math.min(1,Math.max(0,-rect.top/Math.max(1,journey.offsetHeight-innerHeight)));
    const open=manualOpen?1:Math.sin(progress*Math.PI);const ratio=Math.min(devicePixelRatio||1,1.75);const w=Math.max(1,Math.round(host.clientWidth*ratio)),h=Math.max(1,Math.round(host.clientHeight*ratio));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(uniforms.aspect,w/h);gl.uniform1f(uniforms.zoom,Math.min(2.7,2.35*(w/h)));
    gl.uniform3f(uniforms.rotation,.20+open*.09,angle+progress*Math.PI*2,-.12+progress*.24);
    drawMesh(body,[.93,.93,.86],[0,-open*.30,0]);drawMesh(coffee,[.31,.15,.055],[0,-open*.30,0]);drawMesh(crema,[.69,.45,.20],[0,-open*.30,0]);drawMesh(sleeve,[.78,.83,.72],[open*.68,-open*.62,0],1);drawMesh(lid,[.095,.12,.10],[0,open*1.08,0]);
    stage.textContent=reduced.matches?'USE THE BUTTONS TO EXPLORE YOUR COFFEE':open>.6?'EVERY LAYER. A LITTLE DAILY JOY.':progress>.85?'BACK TOGETHER. READY FOR YOUR FIRST SIP.':'SCROLL TO OPEN YOUR COFFEE ↓';
    if(visible&&!document.hidden&&!paused&&!reduced.matches)raf=requestAnimationFrame(draw);
  }
  function requestDraw(){if(!raf&&!lost)raf=requestAnimationFrame(draw);}
  controls.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.dataset.spin){angle+=Number(b.dataset.spin)*Math.PI/4;}if(b.hasAttribute('data-open-cup')){manualOpen=!manualOpen;b.setAttribute('aria-pressed',String(manualOpen));b.textContent=manualOpen?'Close cup':'Open cup';}if(b.hasAttribute('data-pause')){paused=!paused;b.setAttribute('aria-pressed',String(paused));b.textContent=paused?'Resume motion':'Pause motion';}requestDraw();});
  canvas.addEventListener('pointerdown',event=>{drag=true;lastX=event.clientX;canvas.setPointerCapture(event.pointerId);});canvas.addEventListener('pointermove',event=>{if(drag){angle+=(event.clientX-lastX)*.012;lastX=event.clientX;requestDraw();}});['pointerup','pointercancel','lostpointercapture'].forEach(name=>canvas.addEventListener(name,()=>{drag=false;}));
  addEventListener('scroll',requestDraw,{passive:true});addEventListener('resize',requestDraw);reduced.addEventListener('change',requestDraw);document.addEventListener('visibilitychange',()=>{previous=0;requestDraw();});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;previous=0;if(visible)requestDraw();}).observe(host);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(raf);fallback();});
  requestDraw();
})();
