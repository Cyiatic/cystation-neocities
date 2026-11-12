/* Native 640x480 PD menu coordinates; see DESIGN.md and extraction.json. */
(() => {
  'use strict';
  const canvas = document.querySelector('#menu-canvas');
  const ctx = canvas.getContext('2d', {alpha:false});
  const controls = document.querySelector('#menu-controls');
  const reading = document.querySelector('#reading');
  const consoleView = document.querySelector('.console');
  const notice = document.querySelector('#announcement');
  const repo = 'https://github.com/Cyiatic/PD6480iperf';
  const download = (v,zip=false) => `${repo}/releases/download/${v===88?'v88-no-graph':'v87-camspy'}/PD6480iperf-${v===88?'v88-no-graph':'v87-camspy'}-${zip?'patch-and-Dark-save.zip':'candidate.xdelta'}`;
  const local = {get(k, fallback) {try {return localStorage.getItem('pd6480i-'+k) ?? fallback;} catch {return fallback;}}, set(k,v) {try {localStorage.setItem('pd6480i-'+k,v);} catch { /* Private storage may be unavailable. */ }}};
  let muted = local.get('muted','false') === 'true';
  // Start like the console on every visit. Options can mute this visit without
  // letting a previous web mute preference silently disable the next launch.
  let musicMuted = false;
  // The requested console presentation starts animated. Only an explicit
  // choice in the current Motion control disables it, not the legacy flag.
  let still = local.get('motion','on') === 'off';
  let page = 'menu', selected = 0, motionTime = 0, lastFrame = 0, entered = 0;
  let hud, projector=[320,240], swipeDirection=0, slideFrom=0, outgoing=null, textRedraw=null;
  let ready = false, frame = 0, focusFromPointer = false;
  const images = {}, tints = new Map();
  const audio = new PerfectAudio({music:document.querySelector('#menu-music'), announce:message=>{notice.textContent=message;}});
  audio.setSfxEnabled(!muted);
  audio.setMusicEnabled(!musicMuted);
  const scene = new Image();
  scene.src = 'assets/carrington.png';
  const blur = document.createElement('canvas'); blur.width=40; blur.height=30;
  const blurCtx = blur.getContext('2d', {willReadFrequently:true});
  const pages = {
    menu: {title:'PD6480iPerf', big:true, width:196, items:[
      ['Download Patch','editions'], ['Mission Briefing','briefing'],
      ['Installation','install'], ['Controller Setup','controls'],
      ['Test Reports','status'], ['Credits','credits']
    ]},
    editions: {title:'Choose Edition', width:256, lines:['Perfect Dark - USA v1.1','640 x 480 interlaced / Expansion Pak'], items:[
      ['v88 - No graph','v88'], ['v87 - FPS graph','v87'], ['Cancel','menu']
    ]},
    v88: {title:'v88 - No Graph', width:278, lines:[
      'Stock L and D-pad controls restored.', 'No FPS graph. CamSpy and menu fixes.',
      'Apply directly to a clean USA v1.1 ROM.', 'Prerelease candidate.'
    ], items:[['Download .xdelta',download(88)],['Patch + Dark save',download(88,true)],['Installation','install'],['Back','editions']]},
    v87: {title:'v87 - FPS Graph', width:278, lines:[
      'Press L to toggle the FPS graph.', 'Stock L and D-pad bindings are disabled.',
      'CamSpy fix confirmed on Analogue 3D.', 'Prerelease candidate.'
    ], items:[['Download .xdelta',download(87)],['Patch + Dark save',download(87,true)],['Installation','install'],['Back','editions']]},
    briefing: {title:'Mission Briefing', width:294, lines:[
      'Perfect Dark. 640 x 480 interlaced.', '',
      'The newer performance base, with fixes for',
      'menu navigation, full-screen pause blur',
      'and the CamSpy camera.', '',
      'Two editions: stock controls without a graph,',
      'or the L-button FPS graph build.', '',
      'Original Nintendo 64 requires Expansion Pak.'
    ],items:[['Choose Edition','editions'],['Back','menu']]},
    install: {title:'Installation', width:310, lines:[
      '1. Use a clean Perfect Dark USA v1.1 .z64.',
      '2. Check the source ROM MD5:',
      '   e03b088b6ac9e0080440efed07c1e40f',
      '3. Apply ONE edition with an xdelta patcher.',
      '4. Use Expansion Pak on original N64.', '',
      'Keep your original ROM and save backup.',
      'Do not apply one edition over the other.',
      'Hi-Res is fixed at 480i and cannot be changed.'
    ],items:[['About the Dark save','save'],['Full Instructions',`${repo}/blob/mods/performance/docs/INSTALL.md`],['Back','menu']]},
    save: {title:'Agent: Dark', width:282, lines:[
      'Optional 2,048-byte stock EEPROM.', '',
      '100% unlocks. Stock settings and controls.',
      'Cheats unlocked, not activated.',
      'Does not force controller style 1.2.', '',
      'Back up your existing save first.',
      'Available in each patch + save ZIP.'
    ],items:[['Choose Edition','editions'],['Back','install']]},
    controls: {title:'Controller Setup', width:282, lines:[
      'v88 - No graph',
      'Stock L and D-pad bindings restored.',
      'Style 1.2: D-pad move / stick look / L aim.', '',
      'v87 - FPS graph',
      'L toggles the graph.',
      'Stock L and D-pad bindings are disabled.', '',
      'Choose the edition that fits your controls.'
    ],items:[['Choose Edition','editions'],['Back','menu']]},
    status: {title:'Test Reports', width:296, lines:[
      'v87: CamSpy confirmed on Analogue 3D.', '',
      'v88: software control tests completed.',
      'Original-N64 intro boot checked.',
      'Analogue 3D confirmation is pending.', '',
      'Both remain prerelease candidates.',
      'No guaranteed frame rate or exhaustive',
      'hardware compatibility claim.'
    ],items:[['Read v88 Evidence',`${repo}/blob/mods/performance/docs/V88_NO_GRAPH.md`],['Back','menu']]},
    credits: {title:'Credits', width:290, lines:[
      'Perfect Dark - Rare',
      'PD6480iPerf - Cyiatic', '',
      'Built on Perfect Dark decompilation and',
      'the performance work credited in the repo.', '',
      'Menu fonts and dry SFX: verified v88 ROM.',
      'Music: Institute Menu - Grant Kirkhope.',
      'A web adaptation of the original menu.'
    ],items:[['Project & Credits',repo],['Perfect Dark Decomp','https://github.com/n64decomp/perfect_dark'],['Page Fidelity','fidelity'],['Back','menu']]},
    fidelity: {title:'About This Page', width:304, lines:[
      'Original bitmap fonts, kerning and dry SFX.',
      'Native compact 480i menu coordinates.',
      'Palette and focus behavior from game code.', '',
      'Web labels replace game options.',
      'Original animated HUD geometry and textures.',
      'Original deployment and joint animation.',
      'Fixed Carrington Institute capture backdrop.', '',
      'Console frame-for-frame match: unverified.'
    ],items:[['Reading View','reading'],['Back','credits']]},
    options: {title:'Options', width:220, items:[
      ['SFX','@sound'], ['Music','@music'], ['Motion','@motion'], ['Reading View','reading'], ['Perfect Menu','menu'], ['Return to CyStation','/patches#pd6480iperf']
    ]}
  };
  const valid = hash => Object.hasOwn(pages,hash) || hash==='reading';
  function play(name) {audio.play(name);}
  function toggleSound() {muted=!muted;local.set('muted',String(muted));audio.setSfxEnabled(!muted);if(!muted)play('select');refreshLabels();draw();}
  function toggleMusic() {musicMuted=!musicMuted;audio.setMusicEnabled(!musicMuted);play(musicMuted?'toggleoff':'select');refreshLabels();draw();}
  function toggleMotion() {still=!still;local.set('motion',still?'off':'on');refreshLabels();play(still?'toggleoff':'select');schedule();}
  // Retry blocked autoplay inside a trusted gesture; do not reset the track.
  document.addEventListener('pointerdown',()=>audio.unlock(),{capture:true});
  document.addEventListener('keydown',()=>audio.unlock(),{capture:true});
  function layout(which=page) {
    const p=pages[which], lineHeight=13;
    const body=(p.lines?.length||0)*lineHeight;
    const row=p.big?28:18;
    const h=p.big?180:12+(body?body+12:6)+p.items.length*row+5;
    return {x:Math.round((640-p.width)/2),y:Math.round((480-h)/2),w:p.width,h,rowsY:p.big?13:12+(body?body+12:6),row};
  }
  function animatedLayout() {
    const b=layout(),age=motionTime-entered;
    if(!still){b.x+=slideFrom*Math.pow(.7,age*60);b.h=Math.max(12,b.h*(1-Math.pow(.8,age*60)));}
    return b;
  }
  function positionControls() {
    if(page==='reading')return;
    const b=animatedLayout();
    controls.querySelectorAll('[data-row]').forEach(el=>{el.style.left=b.x/6.4+'%';});
    controls.querySelectorAll('.sibling').forEach((el,i)=>{el.style.left=(i?b.x+b.w:b.x-25)/6.4+'%';el.style.top=(b.y+b.h/2-40)/4.8+'%';});
  }
  function label(item) {
    if(item[1]==='@sound') return `SFX: ${muted?'Off':'On'}`;
    if(item[1]==='@music') return `Music: ${musicMuted?'Off':'On'}`;
    if(item[1]==='@motion') return `Motion: ${still?'Off':'On'}`;
    return item[0];
  }
  function refreshLabels() {
    if(page==='reading')return;
    controls.querySelectorAll('[data-row]').forEach(el=>describeControl(el,pages[page].items[Number(el.dataset.row)]));
  }
  function describeControl(el,item) {
    el.textContent=label(item);el.setAttribute('aria-label',label(item));
    const enabled={'@sound':!muted,'@music':!musicMuted,'@motion':!still};
    if(Object.hasOwn(enabled,item[1]))el.setAttribute('aria-pressed',String(enabled[item[1]]));
  }
  function setSelection(index, sound=true) {
    if(index===selected)return;
    selected=index;
    if(sound)play('focus');
    controls.querySelectorAll('[data-row]').forEach(el=>el.setAttribute('aria-current',String(Number(el.dataset.row)===index)));
    draw();
  }
  function activate(target,{back=false,cancel=false}={}) {
    if(target==='@sound')return toggleSound();
    if(target==='@music')return toggleMusic();
    if(target==='@motion')return toggleMotion();
    // SelectableTick plays SELECT, then PushDialog plays OPENDIALOG.
    // PopDialog's MENUSOUND_0B has no mapping; Escape is silent in source.
    if(!cancel)play('select');
    if(!back && target!=='reading')play('open');
    location.hash=target;
  }
  function buildControls(restoreFocus) {
    controls.replaceChildren();
    const p=pages[page], b=layout();
    function place(el,x,y,w,h) {Object.assign(el.style,{left:x/6.4+'%',top:y/4.8+'%',width:w/6.4+'%',height:h/4.8+'%'});controls.append(el);}
    p.items.forEach((item,i)=>{
      const external=item[1].startsWith('https:');
      const link=external||item[1].startsWith('/');
      const el=document.createElement(link?'a':'button');
      el.dataset.row=String(i);describeControl(el,item);el.setAttribute('aria-current',String(i===selected));
      if(link) {el.href=item[1];if(external){el.target='_blank';el.rel='noopener';}}
      else el.type='button';
      el.addEventListener('pointerenter',()=>setSelection(i,true));
      el.addEventListener('pointerdown',()=>{focusFromPointer=true;});
      el.addEventListener('focus',()=>{setSelection(i,!focusFromPointer);focusFromPointer=false;});
      el.addEventListener('click',()=>link?play('select'):activate(item[1],{back:item[0]==='Back'||item[0]==='Cancel'||item[1]==='menu'}));
      place(el,b.x,b.y+b.rowsY+i*b.row,b.w,b.row);
    });
    for(const side of [-1,1]) {
      const el=document.createElement('button');el.type='button';el.className='sibling';
      el.setAttribute('aria-label',page==='options'?'Perfect Menu':'Options');
      el.textContent=page==='options'?'Perfect Menu':'Options';
      el.addEventListener('click',()=>{swipeDirection=side;play('swipe');location.hash=page==='options'?'menu':'options';});
      place(el,side<0?b.x-25:b.x+b.w,b.y+b.h/2-40,25,80);
    }
    if(restoreFocus)controls.querySelector('[data-row]')?.focus({preventScroll:true});
  }
  function route(initial=false) {
    let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch{hash='menu';}
    const next=valid(hash)?hash:'menu';
    const hadFocus=controls.contains(document.activeElement)||document.activeElement?.classList.contains('return');
    if(page!=='reading'&&next!=='reading'&&swipeDirection)outgoing={page,selected,b:layout(),direction:swipeDirection};else outgoing=null;
    page=next;selected=0;entered=motionTime;
    slideFrom=swipeDirection*(640+layout(next==='reading'?'menu':next).w)/2;swipeDirection=0;
    reading.hidden=page!=='reading';consoleView.hidden=page==='reading';
    audio.setActive(page!=='reading'&&!document.hidden);
    if(page==='reading') {
      cancelAnimationFrame(frame);frame=0;
      document.title='PD6480iPerf · Reading view';
      if(!initial){reading.querySelector('a').focus({preventScroll:true});window.scrollTo(0,0);}
      return;
    }
    document.title=page==='menu'?'PD6480iPerf · Perfect Menu':`${pages[page].title} · PD6480iPerf`;
    notice.textContent=pages[page].title;
    document.querySelector('#menu-description').textContent=(pages[page].lines||[]).join(' ');
    buildControls(!initial&&hadFocus);
    schedule();
  }
  addEventListener('hashchange',()=>route());
  controls.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    const count=pages[page].items.length;
    if(event.key==='ArrowDown'||event.key==='ArrowUp') {
      event.preventDefault();setSelection((selected+(event.key==='ArrowDown'?1:-1)+count)%count);
      controls.querySelector(`[data-row="${selected}"]`).focus({preventScroll:true});
    } else if(event.key==='ArrowLeft'||event.key==='ArrowRight') {
      event.preventDefault();swipeDirection=event.key==='ArrowRight'?1:-1;play('swipe');location.hash=page==='options'?'menu':'options';
    } else if(event.key==='Escape' && page!=='menu') {
      event.preventDefault();activate(['v88','v87'].includes(page)?'editions':'menu',{back:true,cancel:true});
    }
  });
  // Enter the menu with arrow keys even before a particular row has focus.
  document.addEventListener('keydown',event=>{
    if(page==='reading'||controls.contains(event.target)||event.target.matches('button,a'))return;
    if(['ArrowDown','ArrowUp','Enter'].includes(event.key)) {
      event.preventDefault();controls.querySelector(`[data-row="${selected}"]`)?.focus({preventScroll:true});
    }
  });
  function fontTint(size,colour) {
    const key=size+colour;
    if(tints.has(key))return tints.get(key);
    const image=images[size], c=document.createElement('canvas');c.width=image.width;c.height=image.height;
    const g=c.getContext('2d');g.drawImage(image,0,0);g.globalCompositeOperation='source-in';g.fillStyle=colour;g.fillRect(0,0,c.width,c.height);
    tints.set(key,c);return c;
  }
  function textWidth(text,size='sm') {
    const f=PD_FONTS[size];let x=0,prev='H';
    for(const char of text) {if(char===' '){x+=5;prev='H';continue;}const glyph=f.chars[char]||f.chars['?'];x+=glyph.w+1-f.kerning[f.chars[prev].k*13+glyph.k];prev=f.chars[char]?char:'?';}
    return x;
  }
  function text(text,x,y,size='sm',colour='#00ffff',alpha=1) {
    const f=PD_FONTS[size],atlas=fontTint(size,colour);let prev='H';
    for(const char of text) {
      if(char===' '){x+=5;prev='H';continue;}
      const glyph=f.chars[char]||f.chars['?'];
      x+=1-f.kerning[f.chars[prev].k*13+glyph.k];
      let brightness=1,flash=0;
      if(textRedraw){
        const distance=Math.hypot(x-textRedraw.x,y-textRedraw.y),d=textRedraw.timer-distance;
        if(textRedraw.initial){brightness=Math.max(0,Math.min(1,d/66));}
        else {brightness=d<0?.43:1;flash=d>=0?Math.max(0,Math.min(.75,(73-d)/50)):0;}
      }
      ctx.globalAlpha=alpha*brightness;
      ctx.drawImage(atlas,glyph.x,glyph.y,glyph.w,glyph.h,Math.round(x),Math.round(y+glyph.baseline),glyph.w,glyph.h);
      if(flash){ctx.globalAlpha=alpha*flash;ctx.drawImage(fontTint(size,'#ffffff'),glyph.x,glyph.y,glyph.w,glyph.h,Math.round(x),Math.round(y+glyph.baseline),glyph.w,glyph.h);}
      x+=glyph.w;prev=f.chars[char]?char:'?';
    }
    ctx.globalAlpha=1;
  }
  function triangle(points,fill) {ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
  function beams(b,t) {
    // Four translucent projection walls attached to HUD part 1.
    // Canvas strips approximate the RDP plane texture, not the HUD model itself.
    const [sx,sy]=projector;
    ctx.save();
    const edges=[[[b.x,b.y],[b.x+b.w,b.y]],[[b.x+b.w,b.y],[b.x+b.w,b.y+b.h]],[[b.x+b.w,b.y+b.h],[b.x,b.y+b.h]],[[b.x,b.y+b.h],[b.x,b.y]]];
    edges.forEach(([a,c],edge)=>{
      const grad=ctx.createLinearGradient(sx,sy,(a[0]+c[0])/2,(a[1]+c[1])/2);
      grad.addColorStop(0,'rgba(0,240,255,.24)');grad.addColorStop(1,'rgba(0,96,191,.08)');
      triangle([[sx,sy],a,c],grad);
      for(let i=0;i<20;i++) {
        const f=(i/20+t*.12)%1,g=Math.min(1,f+.012);
        const p=[a[0]+(c[0]-a[0])*f,a[1]+(c[1]-a[1])*f];
        const q=[a[0]+(c[0]-a[0])*g,a[1]+(c[1]-a[1])*g];
        triangle([[sx,sy],p,q],'rgba(0,160,255,.06)');
      }
    });ctx.restore();
  }
  function draw(now=performance.now()) {
    if(!ready||page==='reading'||document.hidden)return;
    if(lastFrame&&!still)motionTime+=Math.max(0,Math.min(.1,(now-lastFrame)/1000));lastFrame=now;
    const t=motionTime;
    ctx.globalAlpha=1;ctx.imageSmoothingEnabled=true;
    ctx.fillStyle='#000';ctx.fillRect(0,0,640,480);ctx.drawImage(blur,0,0,640,480);
    if(hud){projector=hud.draw(t,still);ctx.drawImage(hud.canvas,0,0);}
    if(outgoing&&!still){
      const age=motionTime-entered;
      if(age<.6){const old={...outgoing.b};old.x-=outgoing.direction*(640+old.w)/2*(1-Math.pow(.7,age*60));renderDialog(pages[outgoing.page],old,outgoing.selected,t,10,outgoing.page);}
      else outgoing=null;
    }
    renderDialog(pages[page],animatedLayout(),selected,t,motionTime-entered,page);
    positionControls();
  }
  function renderDialog(p,b,focused,t,age,which) {
    beams(b,t);
    ctx.save();
    ctx.beginPath();ctx.rect(b.x-28,b.y,b.w+56,b.h);ctx.clip();
    const bodyGradient=ctx.createLinearGradient(0,b.y+12,0,b.y+b.h);
    bodyGradient.addColorStop(0,'rgba(0,0,47,.498)');bodyGradient.addColorStop(1,'rgba(0,0,111,.498)');
    ctx.fillStyle=bodyGradient;ctx.fillRect(b.x+1,b.y+12,b.w-2,b.h-12);
    let g=ctx.createLinearGradient(0,b.y,0,b.y+12);g.addColorStop(0,'rgba(0,96,191,.498)');g.addColorStop(.5,'rgba(0,0,80,.498)');g.addColorStop(1,'rgba(0,240,255,.498)');
    ctx.fillStyle=g;ctx.fillRect(b.x-2,b.y,b.w+4,12);
    g=ctx.createLinearGradient(b.x,0,b.x+b.w,0);g.addColorStop(0,'rgba(0,96,191,.498)');g.addColorStop(1,'rgba(0,240,255,.498)');
    ctx.fillStyle=g;ctx.fillRect(b.x,b.y+12,1,b.h-12);ctx.fillRect(b.x+b.w-2,b.y+12,1,b.h-12);ctx.fillRect(b.x,b.y+b.h-1,b.w,1);
    // One bright shimmer crosses each edge, like menugfxDrawShimmer.
    const shimmer=((t*180+b.x+b.y)%600)-40;
    ctx.save();ctx.beginPath();ctx.rect(b.x-2,b.y,b.w+4,b.h);ctx.clip();
    g=ctx.createLinearGradient(b.x+shimmer,0,b.x+shimmer+40,0);g.addColorStop(0,'#ffffff00');g.addColorStop(.85,'#ffffff60');g.addColorStop(1,'#ffffff00');
    ctx.fillStyle=g;ctx.fillRect(b.x+shimmer,b.y,40,1);ctx.fillRect(b.x+b.w-shimmer-40,b.y+b.h-1,40,1);ctx.restore();
    ctx.imageSmoothingEnabled=false;
    textRedraw=null;
    text(p.title,b.x+3,b.y+3,'sm','#000000');text(p.title,b.x+2,b.y+2,'sm','#ffffff');
    if(!still){const cycle=(age-4)%7;textRedraw=age<2?{x:b.x,y:b.y,timer:age*300,initial:true}:age>=4&&cycle<5?{x:b.x,y:b.y,timer:cycle*120,initial:false}:null;}
    (p.lines||[]).forEach((line,i)=>text(line,b.x+10,b.y+20+i*13,'sm','#b8ffff'));
    p.items.forEach((item,i)=>{
      const y=b.y+b.rowsY+i*b.row;
      const x=b.x+(p.big?45:10),ty=y+(p.big?8:4),size=p.big?'md':'sm';
      if(i===focused) {
        const ly=Math.round(y+b.row/2-1);
        const line=ctx.createLinearGradient(b.x+6,0,b.x+b.w/3,0);line.addColorStop(0,'#ffffffc0');line.addColorStop(1,'#00ffff00');
        ctx.fillStyle=line;ctx.fillRect(b.x+6,ly,b.w/3-6,1);
        triangle([[b.x,ly-1],[b.x+8,ly],[b.x,ly+2]],'#cfffff');
        text(label(item),x+1,ty+1,size,'#000000');
        const focusWeight=still?1:.5+.5*Math.sin(t*Math.PI*4);
        text(label(item),x,ty,size,'#ffffff');
        text(label(item),x,ty,size,'#007f7f',1-focusWeight);
      } else text(label(item),x,ty,size,'#00ffff');
    });
    textRedraw=null;
    const sibling=which==='options'?'Perfect Menu':'Options';
    const cy=b.y+b.h/2;
    triangle([[b.x-3,cy-4],[b.x-7,cy],[b.x-3,cy+4]],'#ffffff');
    triangle([[b.x+b.w+3,cy-4],[b.x+b.w+7,cy],[b.x+b.w+3,cy+4]],'#ffffff');
    ctx.save();ctx.translate(b.x-1,cy-textWidth(sibling,'xs')-3);ctx.rotate(Math.PI/2);text(sibling,0,0,'xs','#fff');ctx.restore();
    ctx.save();ctx.translate(b.x+b.w+7,cy+3);ctx.rotate(Math.PI/2);text(sibling,0,0,'xs','#fff');ctx.restore();
    ctx.restore();
  }
  function tick(now) {frame=0;draw(now);if(!still&&page!=='reading'&&!document.hidden)frame=requestAnimationFrame(tick);}
  function schedule() {cancelAnimationFrame(frame);frame=0;draw();if(!still&&ready&&page!=='reading'&&!document.hidden)frame=requestAnimationFrame(tick);}
  document.addEventListener('visibilitychange',()=>{lastFrame=0;audio.setActive(page!=='reading'&&!document.hidden);if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
  addEventListener('pagehide',()=>audio.setActive(false));
  addEventListener('pageshow',()=>audio.setActive(page!=='reading'&&!document.hidden));
  function loadImage(image) {return image.complete&&image.naturalWidth?Promise.resolve():new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('Menu image could not load.'));});}
  async function init() {
    route(true);
    const jobs=[loadImage(scene)];
    for(const [name,f]of Object.entries(PD_FONTS)){const im=new Image();im.src=f.image;images[name]=im;jobs.push(loadImage(im));}
    await Promise.all(jobs);
    try {hud=new PerfectHud();await hud.init();}catch(error){hud=null;notice.textContent=error.message;console.warn(error.message);}
    // Average 8x8 samples on a 320x240 grid, matching v88 menugfxCreateBlur.
    const sample=document.createElement('canvas');sample.width=640;sample.height=480;
    const s=sample.getContext('2d',{willReadFrequently:true});s.drawImage(scene,0,0,640,480);
    const raw=s.getImageData(0,0,640,480).data,result=blurCtx.createImageData(40,30);
    for(let y=0;y<30;y++)for(let x=0;x<40;x++) {
      const sums=[0,0,0];
      for(let yy=0;yy<8;yy++)for(let xx=0;xx<8;xx++)for(let c=0;c<3;c++)sums[c]+=raw[((y*16+yy*2)*640+x*16+xx*2)*4+c]>>3;
      const o=(y*40+x)*4;for(let c=0;c<3;c++){const v=Math.floor(sums[c]/64);result.data[o+c]=(v<<3)|(v>>2);}result.data[o+3]=255;
    }
    blurCtx.putImageData(result,0,0);
    ready=true;document.querySelector('#loading').hidden=true;audio.setActive(page!=='reading'&&!document.hidden);play('open');schedule();
  }
  init().catch(error=>{
    const el=document.querySelector('#loading');el.textContent='Menu assets could not load. ';
    const link=document.createElement('a');link.href='#reading';link.textContent='Open Reading View';el.append(link);
    console.error(error);
  });
})();
