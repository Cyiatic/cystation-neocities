/* PD's GHUDPIECE: original vertices, textures and animation 0x40d.
 * Transform order follows lib/mtx.c and modelPositionJointUsingVecRot.
 * The WebGL sampler is an approximation of the N64 RDP's filtering.
 */
(() => {
  'use strict';
  const mul=(a,b)=>{const c=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)c[j*4+i]+=a[k*4+i]*b[j*4+k];return c;};
  function transform(pos,rot,scale=1) {
    const [x,y,z]=rot,cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);
    return new Float32Array([cy*cz*scale,cy*sz*scale,-sy*scale,0,(sx*cz*sy-cx*sz)*scale,(sx*sz*sy+cx*cz)*scale,sx*cy*scale,0,(cx*cz*sy+sx*sz)*scale,(cx*sz*sy-sx*cz)*scale,cx*cy*scale,0,...pos,1]);
  }
  const point=(m,p)=>[0,1,2].map(i=>m[i]*p[0]+m[4+i]*p[1]+m[8+i]*p[2]+m[12+i]);
  const angle=(a,b,f)=>a+((b-a+Math.PI*3)%(Math.PI*2)-Math.PI)*f;
  class PerfectHud {
    constructor() {
      this.canvas=document.createElement('canvas');this.canvas.width=640;this.canvas.height=480;
      this.gl=this.canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
      if(!this.gl)throw new Error('This browser cannot render the Perfect Dark HUD. Reading view remains available.');
      this.x=-205.5;this.y=244.7;this.tx=this.x;this.ty=this.y;this.last=0;this.step=0;
      this.groups=[];this.textures={};
    }
    async init() {
      const gl=this.gl;
      const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
      const program=gl.createProgram();
      gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec3 position;attribute vec2 uv;attribute vec4 colour;attribute float bone;uniform mat4 bones[7];uniform mat4 projection;varying vec2 st;varying vec4 rgba;void main(){mat4 m=bones[0];for(int i=1;i<7;i++){if(abs(bone-float(i))<.1)m=bones[i];}gl_Position=projection*m*vec4(position,1.);st=uv;rgba=colour;}`));
      gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D image;uniform vec2 size;uniform float scroll;varying vec2 st;varying vec4 rgba;void main(){vec4 c=texture2D(image,fract((st+vec2(scroll,0.))/size))*rgba;if(c.a<.01)discard;gl_FragColor=c;}`));
      gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);this.program=program;
      this.uniform=Object.fromEntries(['bones[0]','projection','size','scroll'].map(n=>[n,gl.getUniformLocation(program,n)]));
      this.attributes=['position','uv','colour','bone'].map(n=>gl.getAttribLocation(program,n));
      const groups=new Map();
      for(const [id,transparent,...indices] of PD_HUD.triangles){const key=id+':'+transparent;if(!groups.has(key))groups.set(key,{id,transparent,vertices:[]});for(const i of indices){const v=PD_HUD.vertices[i];groups.get(key).vertices.push(...v.slice(0,5),...v.slice(5,9).map(x=>x/255),v[9]);}}
      for(const group of groups.values()){group.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,group.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(group.vertices),gl.STATIC_DRAW);group.count=group.vertices.length/10;delete group.vertices;this.groups.push(group);}
      await Promise.all(Object.entries(PD_HUD.textures).map(async([id,meta])=>{
        const im=new Image();im.src=`assets/hud/${Number(id).toString(16).padStart(4,'0')}.png`;await im.decode();
        const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        this.textures[id]={texture,...meta};
      }));
      const f=1/Math.tan(Math.PI/6),near=1,far=1000;
      gl.uniformMatrix4fv(this.uniform.projection,false,new Float32Array([f*.75,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]));
      gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    }
    draw(t,still) {
      // Original 1-in-100 per-frame targets; 0.002 per 60 Hz tick smoothing.
      const delta=Math.max(0,Math.min(.1,t-this.last));this.last=t;
      if(!still){this.step+=delta*60;while(this.step>=1){this.step--;if(Math.random()<.01){this.tx=-245.5+Math.random()*80;this.ty=204.7+Math.random()*80;}}
        const a=1-Math.pow(.998,delta*60);this.x+=(this.tx-this.x)*a;this.y+=(this.ty-this.y)*a;}
      const frame=still?44:Math.min(44,t*30),i=Math.floor(frame),j=Math.min(44,i+1),mix=frame-i;
      const focal=240/Math.tan(Math.PI/6),z=-31.7;
      const root=transform([(this.x-320)*(-z)/focal,(240-this.y)*(-z)/focal,z],[0,-Math.PI,0],.12209);
      const matrices=[];
      for(const b of PD_HUD.bones){
        const a=PD_HUD.animation[i][b.part],next=PD_HUD.animation[j][b.part];
        const position=a.translation.map((v,k)=>v+(next.translation[k]-v)*mix+(b.parent>=0?b.position[k]:0));
        const rotation=a.rotation.map((v,k)=>angle(v,next.rotation[k],mix));
        matrices[b.index]=mul(b.parent<0?root:matrices[b.parent],transform(position,rotation));
      }
      // Part 2 is the projector's rotating joint, not a rotation of the page.
      const rotating=PD_HUD.bones.find(b=>b.part===2).index;
      matrices[rotating]=mul(matrices[rotating],transform([0,0,0],[.5+.5*Math.cos(t*Math.PI*2/5),0,0]));
      const projector=point(matrices[PD_HUD.bones.find(b=>b.part===1).index],[0,0,0]);
      const source=[320+projector[0]*focal/-projector[2],240-projector[1]*focal/-projector[2]];
      const gl=this.gl;gl.viewport(0,0,640,480);gl.clearColor(0,0,0,0);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(this.program);gl.uniformMatrix4fv(this.uniform['bones[0]'],false,new Float32Array(matrices.flatMap(m=>Array.from(m))));
      gl.uniform1f(this.uniform.scroll,-t*60*100/32);
      for(const group of this.groups){
        const tex=this.textures[group.id];gl.bindTexture(gl.TEXTURE_2D,tex.texture);gl.uniform2f(this.uniform.size,tex.width,tex.height);
        gl.depthMask(!group.transparent);gl.bindBuffer(gl.ARRAY_BUFFER,group.buffer);
        [3,2,4,1].forEach((n,k)=>{const a=this.attributes[k];gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,n,gl.FLOAT,false,40,[0,12,20,36][k]);});
        gl.drawArrays(gl.TRIANGLES,0,group.count);
      }
      gl.depthMask(true);return source;
    }
  }
  window.PerfectHud=PerfectHud;
})();
