/* Música e efeitos: tudo gerado no aparelho. */
/* ==================================================================
   ÁUDIO: tudo é gerado no navegador, sem arquivos externos.
   Música em camadas, chuva, efeitos e narração com a voz do aparelho.
   ================================================================== */
const SOM={ctx:null,camadas:{},alvo:{pad:0,baixo:0,vibra:0,escova:0,tensao:0},prox:0,passo:0,chuvaG:null};
const NOTA={A:[110,[220,261.63,329.63,392]],D:[73.42,[220,293.66,349.23,440]],F:[87.31,[220,261.63,329.63,349.23]],E:[82.41,[207.65,246.94,293.66,329.63]]};
const ACORDES=["A","D","F","E"],PENTA=[523.25,587.33,659.25,783.99,880];
const BATIDA=60/66;
function iniciarAudio(){
  if(SOM.ctx){SOM.ctx.resume();return}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const c=SOM.ctx=new AC();
  const lim=c.createDynamicsCompressor();lim.threshold.value=-6;lim.ratio.value=12;lim.connect(c.destination);
  SOM.master=c.createGain();SOM.master.gain.value=P.som?1:0;SOM.master.connect(lim);
  SOM.fx=c.createGain();SOM.fx.gain.value=.8;SOM.fx.connect(SOM.master);
  SOM.duck=c.createGain();SOM.duck.gain.value=1;SOM.duck.connect(SOM.master);
  for(const k in SOM.alvo){const g=c.createGain();g.gain.value=0;g.connect(SOM.duck);SOM.camadas[k]=g}
  const n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;SOM.ruido=b;
  const s=c.createBufferSource();s.buffer=b;s.loop=true;const hp=c.createBiquadFilter();hp.type="highpass";hp.frequency.value=1800;
  SOM.chuvaG=c.createGain();SOM.chuvaG.gain.value=0;s.connect(hp);hp.connect(SOM.chuvaG);SOM.chuvaG.connect(SOM.duck);s.start();
  SOM.prox=c.currentTime+.1;setInterval(agendar,100);c.resume();
}
function musica(alvo,chuva=0){if(!SOM.ctx)return;const t=SOM.ctx.currentTime;for(const k in SOM.alvo){const v=alvo[k]||0;SOM.alvo[k]=v;SOM.camadas[k].gain.setTargetAtTime(v,t,.9)}SOM.chuvaG.gain.setTargetAtTime(chuva*.05,t,.8)}
function tensao(v){if(!SOM.ctx)return;SOM.alvo.tensao=v;SOM.camadas.tensao.gain.setTargetAtTime(v,SOM.ctx.currentTime,.5)}
function abaixarMusica(sim){if(!SOM.ctx)return;SOM.duck.gain.setTargetAtTime(sim?.32:1,SOM.ctx.currentTime,sim?.06:.4)}
function nota(f,t,dur,vol,saida,tipo="sine",filtro=0,ataque=.008){const c=SOM.ctx,o=c.createOscillator(),g=c.createGain();o.type=tipo;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+ataque);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  if(filtro){const l=c.createBiquadFilter();l.type="lowpass";l.frequency.value=filtro;o.connect(l);l.connect(g)}else o.connect(g);g.connect(saida);o.start(t);o.stop(t+dur+.05)}
function ruido(t,dur,vol,saida,tipo="bandpass",freq=2000,q=1,freq2=0){const c=SOM.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=SOM.ruido;f.type=tipo;f.Q.value=q;f.frequency.setValueAtTime(freq,t);if(freq2)f.frequency.exponentialRampToValueAtTime(freq2,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(saida);s.start(t,Math.random());s.stop(t+dur+.02)}
/* Agenda oito notas por compasso, com leve swing, sempre um pouco à frente do relógio do áudio. */
function agendar(){const c=SOM.ctx;if(!c||c.state!=="running")return;
  while(SOM.prox<c.currentTime+.35){const p=SOM.passo,t=SOM.prox,oit=p%2===1,ac=NOTA[ACORDES[Math.floor(p/8)%4]],L=SOM.camadas;
    if(p%8===0)ac[1].forEach(f=>nota(f,t,BATIDA*4.2,.035,L.pad,"triangle",750,.8));
    if(p%2===0)nota(ac[0]*[1,1.5,1.2,1.33][(p/2)%4],t,BATIDA*.85,.17,L.baixo,"triangle",420);
    if(oit)ruido(t,.07,.035,L.escova,"highpass",6500);
    if(Math.random()<.13)nota(PENTA[Math.floor(Math.random()*5)],t,1.3,.05,L.vibra);
    if(p%4===0){nota(55,t,.28,.3,L.tensao);nota(50,t+.2,.26,.2,L.tensao)}
    if(oit&&SOM.alvo.tensao>.7)nota(1900,t,.03,.03,L.tensao,"square");
    SOM.prox+=BATIDA/2*(oit?.76:1.24);SOM.passo++}}
/* Efeitos sonoros: uma receita curta para cada acontecimento. */
function sfx(n){const c=SOM.ctx;if(!c)return;const t=c.currentTime,F=SOM.fx;({
  tecla(){ruido(t,.018,.05,F,"bandpass",2000+Math.random()*1600,3)},
  papel(){ruido(t,.26,.13,F,"bandpass",900,1,3600)},
  pino(){nota(1500,t,.06,.09,F);ruido(t,.02,.14,F,"highpass",3000)},
  fio(){nota(233,t,.45,.2,F,"triangle");nota(466,t,.2,.05,F)},
  carimbo(){nota(115,t,.32,.5,F);nota(58,t,.42,.42,F);ruido(t,.08,.35,F,"lowpass",1600)},
  whoosh(){ruido(t,.75,.28,F,"bandpass",260,1.2,2600)},
  trovao(){ruido(t,2.4,.32,F,"lowpass",240,.5,70)},
  miau(){const o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type="sawtooth";o.frequency.setValueAtTime(520,t);o.frequency.linearRampToValueAtTime(820,t+.16);o.frequency.linearRampToValueAtTime(470,t+.5);f.type="bandpass";f.frequency.setValueAtTime(900,t);f.frequency.linearRampToValueAtTime(1500,t+.2);f.frequency.linearRampToValueAtTime(800,t+.5);f.Q.value=3;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.3,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.55);o.connect(f);f.connect(g);g.connect(F);o.start(t);o.stop(t+.6)},
  silencio(){nota(180,t,1.1,.32,F,"sine",0,.75);ruido(t,1,.2,F,"bandpass",1700,4,240)},
  vitoria(){[523.25,659.25,783.99,1046.5].forEach((f,i)=>nota(f,t+i*.11,.55,.16,F,"triangle"))},
  queda(){[392,349.23,261.63].forEach((f,i)=>nota(f,t+i*.16,.5,.14,F,"triangle"))}
 })[n]?.()}
function tom(f,d=.08,q=0){const c=SOM.ctx;if(c)nota(f,c.currentTime+q,d,.09,SOM.fx)}

