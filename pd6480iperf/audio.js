/* Original PD menu samples + a sample-accurate, continuously running music loop. */
(() => {
  'use strict';
  class PerfectAudio {
    constructor({music, announce}) {
      this.music=music;this.announce=announce;
      this.active=false;this.musicEnabled=true;this.sfxEnabled=true;
      this.buffers={};this.voices=new Map();this.pendingEffects=[];
      this.musicSource=null;this.musicOffset=0;this.startedAt=0;
      this.hasGesture=false;this.resumePending=null;this.musicError=false;
      music.dataset.backend='webaudio';
      music.dataset.loopStart=String(PD_MUSIC_LOOP.loopStart);
      music.dataset.loopEnd=String(PD_MUSIC_LOOP.loopEnd);
      try {
        const Context=window.AudioContext||window.webkitAudioContext;
        this.context=new Context({sampleRate:PD_MUSIC_LOOP.sampleRate});
        this.musicGain=this.context.createGain();this.musicGain.gain.value=.35;
        this.sfxGain=this.context.createGain();this.sfxGain.gain.value=.55;
        this.musicGain.connect(this.context.destination);this.sfxGain.connect(this.context.destination);
        this.context.addEventListener('statechange',()=>{this.sync();this.flushEffects();});
        this.ready=this.load();
      } catch(error) {
        this.context=null;this.ready=Promise.resolve();music.dataset.state='unavailable';
        announce('Audio is unavailable in this browser.');
      }
    }
    async load() {
      const files={music:'music/institute-menu-loop.wav',focus:'focus.wav',select:'select.wav',open:'open.wav',swipe:'swipe.wav',toggleoff:'back.wav'};
      await Promise.all(Object.entries(files).map(async([name,file])=>{
        try {
          const response=await fetch(`assets/${file}`);
          if(!response.ok)throw new Error(`Audio HTTP ${response.status}`);
          this.buffers[name]=await this.context.decodeAudioData(await response.arrayBuffer());
          // Start the decoded music immediately; a slow SFX request must not
          // hold autoplay behind the rest of the sound bank.
          if(name==='music')this.sync();
          this.flushEffects();
        } catch(error) {
          if(name==='music')this.musicError=true;
          this.announce(name==='music'?'Music could not load.':'A menu sound could not load.');
        }
      }));
      this.music.dataset.effectsLoaded=String(Object.keys(this.buffers).filter(name=>name!=='music').length);
      this.sync();this.flushEffects();
    }
    // Shared with the OfflineAudioContext loop verification page.
    static createLoopSource(context,buffer,destination,offset=0) {
      const source=context.createBufferSource();source.buffer=buffer;
      source.loop=true;source.loopStart=PD_MUSIC_LOOP.loopStart;source.loopEnd=PD_MUSIC_LOOP.loopEnd;
      source.connect(destination);source.start(0,offset);return source;
    }
    wantsMusic() {return this.active&&this.musicEnabled&&!document.hidden;}
    position() {
      let position=this.musicOffset;
      if(this.musicSource)position+=this.context.currentTime-this.startedAt;
      const {loopStart,loopEnd}=PD_MUSIC_LOOP;
      return position>=loopEnd?loopStart+(position-loopStart)%(loopEnd-loopStart):position;
    }
    pauseMusic() {
      if(!this.musicSource)return;
      this.musicOffset=this.position();
      const old=this.musicSource;this.musicSource=null;old.stop();old.disconnect();
      this.music.dataset.position=String(this.musicOffset);
    }
    sync() {
      if(!this.context)return;
      if(!this.wantsMusic()) {
        this.pauseMusic();this.music.dataset.state=this.musicEnabled?'paused':'muted';return;
      }
      if(this.musicError){this.music.dataset.state='unavailable';return;}
      if(!this.buffers.music){this.music.dataset.state='loading';return;}
      if(this.context.state!=='running'){
        if(this.music.dataset.state!=='blocked')this.announce('Music is on. Click or press a key to start audio.');
        this.music.dataset.state='blocked';return;
      }
      if(!this.musicSource) {
        this.startedAt=this.context.currentTime;
        this.musicSource=PerfectAudio.createLoopSource(this.context,this.buffers.music,this.musicGain,this.musicOffset);
      }
      this.music.dataset.state='playing';
    }
    requestResume(gesture=false) {
      if(!this.context||!this.active)return;
      if(this.context.state==='running'){this.sync();this.flushEffects();return;}
      if(this.resumePending&&!gesture)return;
      const promise=this.context.resume();this.resumePending=promise;
      promise.then(()=>{
        if(this.resumePending===promise)this.resumePending=null;
        this.sync();this.flushEffects();
      }).catch(error=>{
        if(this.resumePending===promise)this.resumePending=null;
        if(error.name!=='NotAllowedError')this.announce('Audio could not start. Click or press a key to retry.');
      });
    }
    setActive(active) {
      this.active=active;
      if(!active)this.stopEffects();
      this.sync();if(active)this.requestResume();
    }
    setMusicEnabled(enabled){this.musicEnabled=enabled;this.sync();if(enabled)this.requestResume(true);}
    setSfxEnabled(enabled){this.sfxEnabled=enabled;if(!enabled)this.stopEffects();}
    unlock(){this.hasGesture=true;this.requestResume(true);}
    play(name) {
      if(!this.context||!this.active||!this.sfxEnabled||document.hidden)return;
      if(this.context.state!=='running'||!this.buffers[name]) {
        // Never release an old page-open or hover sound on a later gesture.
        if(this.hasGesture)this.pendingEffects.push({name,expires:performance.now()+200});
        this.pendingEffects=this.pendingEffects.slice(-6);return;
      }
      const pool=this.voices.get(name)||new Set();this.voices.set(name,pool);
      if(pool.size>=3){const old=pool.values().next().value;pool.delete(old);old.stop();old.disconnect();}
      const voice=this.context.createBufferSource();voice.buffer=this.buffers[name];voice.connect(this.sfxGain);
      voice.onended=()=>{pool.delete(voice);voice.disconnect();};pool.add(voice);voice.start();
      this.music.dataset.lastEffect=name;
    }
    flushEffects() {
      if(!this.context||this.context.state!=='running')return;
      const pending=this.pendingEffects;this.pendingEffects=[];
      for(const event of pending)if(event.expires>=performance.now()&&this.buffers[event.name])this.play(event.name);
    }
    stopEffects() {
      this.pendingEffects=[];
      for(const pool of this.voices.values()){for(const voice of pool){voice.stop();voice.disconnect();}pool.clear();}
    }
  }
  window.PerfectAudio=PerfectAudio;
})();
