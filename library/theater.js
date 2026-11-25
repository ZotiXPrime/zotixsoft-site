/* ZOTIXSOFT theater: fullscreen player shared by the homepage, /watch and the library.
   ZT.play(id) opens a film; ZT.list is the catalogue. v:1 = vertical video. */
(function(){
const B='/library/films/';
const list=[
 {id:'emerald-burst',parts:3,t:'Emerald Burst',k:'Game trailer',m:'Out now on the Epic Games Store',len:'1:21'},
 {id:'dirk-kaboom',t:'Dirk Kaboom',k:'Gameplay',m:'Seven candy-coloured guns in a neon retro FPS, ice bow included',len:'0:29'},
 {id:'riff-rampage',t:'Riff Rampage',k:'Gameplay',m:'A guitar-swinging rock platformer, World 1',len:'0:35'},
 {id:'xenith-overload',t:'Xenith: OverLoad',k:'Gameplay',m:'Eight plasma guns and a plasma katana on a ringworld',len:'0:30'},
 {id:'hakuya-titan',parts:3,t:'Hakuya: Breath of the Titan',k:'Short film',m:'The squad against a mountain titan, cut to an original song',len:'2:52'},
 {id:'hakuya-op',parts:2,t:'Hakuya: Opening',k:'Anime opening',m:'The cel-shaded opening that started it all',len:'0:47',v:1},
 {id:'hakuya-squad',parts:2,t:'Hakuya: Squad',k:'Game trailer',m:'A cocky flash-step squad you swap between mid-combo',len:'0:50'},
 {id:'fleeced',t:'FLEECED!',k:'Game trailer',m:'A cartoon sheep-heist stealth game',len:'1:01'},
 {id:'fangscape',t:'Fangscape',k:'Game trailer',m:'An old-school RPG where you play the vampire',len:'1:01',src:'/fangscape/video/trailer.mp4'},
 {id:'silver-sol',t:'Silver Sol',k:'Cinematic trailer',m:'One unbroken take, rendered in Unreal Engine 5',len:'0:31'},
 {id:'god-of-pork',parts:2,t:'God of Pork',k:'Game trailer',m:'An angry pig with chain blades against the whole pantheon',len:'1:05'},
 {id:'burst-league',t:'Burst League',k:'Game trailer',m:'Arena soccer played by anime heroes',len:'0:49'},
 {id:'golden-warrior',t:'Golden Warrior',k:'Game trailer',m:'First-person katana action in Unreal Engine 5',len:'0:45',v:1},
 {id:'hakuya',t:'Hakuya',k:'Game trailer',m:'Flash-step action with one hand in his pocket',len:'0:45',v:1},
 {id:'gloam',parts:2,t:'Gloam',k:'Game trailer',m:'Cave action lit by radiance cascades',len:'1:03'},
 {id:'ascension',t:'Ascension',k:'Cinematic',m:'A power-up in the tournament ring, Unreal Engine 5',len:'0:33'},
 {id:'ember-pillar',parts:2,t:'Ember Pillar',k:'Game trailer',m:'A flame swordsman against demon waves',len:'1:12'},
 {id:'sigilfall',t:'SIGILFALL',k:'Game trailer',m:'A card duel game on an in-house C++ and SDL3 engine',len:'0:47'},
 {id:'zabby',parts:2,t:"Zabby's Zabbatorium",k:'Game trailer',m:'A blue rabbit in power armour with a cupcake cannon',len:'1:01'},
 {id:'utsuro',t:'Utsuro',k:'Game trailer',m:'A masked wanderer who phases through spears and walls',len:'0:57'},
 {id:'twilight-chronicles',t:'Twilight Chronicles',k:'Game trailer',m:'A worlds-beyond action RPG',len:'1:12'},
 {id:'sugar-sands',t:'Sugar Sands',k:'Game trailer',m:'Tower defense in a desert made of dessert',len:'0:46'},
 {id:'crimson-alert',t:'Crimson Alert',k:'Game trailer',m:'An isometric RTS: Coalition against the Iron Pact',len:'0:49',v:1},
 {id:'pink-ocarina',t:'Pink Ocarina',k:'Game trailer',m:'A tiny forest adventure in a pink tunic',len:'0:55'},
 {id:'empress',t:'Empress of the Forest',k:'Game trailer',m:'A fast 2D action platformer',len:'0:29'},
 {id:'beast-gambit',t:'Beast Gambit',k:'Game trailer',m:'Pixel chess against the city animals',len:'0:40'},
 {id:'potion-peddler',t:'Potion Peddler',k:'Game trailer',m:'A cozy potion-selling deckbuilder',len:'0:30'},
 {id:'paper-skies',t:'Paper Skies',k:'Game trailer',m:'An origami shoot-em-up',len:'0:15',v:1}
];
list.forEach(f=>{f.src=f.src||B+f.id+'.mp4';f.poster=B+'posters/'+f.id+'.jpg'});
const css=`#zt{position:fixed;inset:0;z-index:9999;background:#000;display:none;flex-direction:column;font-family:Inter,"Segoe UI",system-ui,sans-serif;color:#fff}
#zt.on{display:flex}
#zt .stage{position:relative;flex:1;min-height:0}#zt video{position:absolute;inset:0;width:100%;height:100%;background:#000;object-fit:contain;outline:0}
#zt .ld{position:absolute;left:0;right:0;bottom:22%;text-align:center;font-size:15px;letter-spacing:.12em;pointer-events:none;text-shadow:0 2px 8px #000}
#zt .bar{display:flex;align-items:center;gap:14px;padding:10px 16px;background:linear-gradient(#000,#000c);transition:opacity .4s}
#zt.idle .bar{opacity:0}#zt.idle{cursor:none}
#zt .tt{flex:1;min-width:0}#zt .tt b{display:block;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#zt .tt span{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#2ee6d0}
#zt button{background:#fff1;color:#fff;border:1px solid #fff3;border-radius:8px;padding:8px 14px;font:600 14px inherit;cursor:pointer}
#zt button:hover{background:#2ee6d0;color:#012;border-color:#2ee6d0}
@media (max-width:560px){#zt .hide-s{display:none}}`;
let el,vid,idx=-1,idleT,wentFs=false;
function build(){
 const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
 el=document.createElement('div');el.id='zt';
 el.innerHTML='<div class="bar"><div class="tt"><span></span><b></b></div><button data-a="prev" class="hide-s" aria-label="Previous">&#9664; Prev</button><button data-a="next" aria-label="Next">Next &#9654;</button><button data-a="fs" class="hide-s">Fullscreen</button><button data-a="close" aria-label="Close">&#10005; Close</button></div><div class="stage"><video controls playsinline preload="metadata"></video><div class="ld"></div></div>';
 document.body.appendChild(el);vid=el.querySelector('video');
 el.addEventListener('click',e=>{const a=e.target.dataset&&e.target.dataset.a;if(a==='close')close();else if(a==='prev')step(-1);else if(a==='next')step(1);else if(a==='fs')fs()});
 vid.addEventListener('ended',()=>step(1));
 el.addEventListener('mousemove',wake);el.addEventListener('touchstart',wake,{passive:true});
 document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&wentFs&&ZT.open){wentFs=false;close()}});
 addEventListener('keydown',e=>{if(!ZT.open)return;const k=e.key;
  if(k==='Escape'||k==='Backspace')close();else if(k==='ArrowRight'&&e.shiftKey)step(1);else if(k==='ArrowLeft'&&e.shiftKey)step(-1);
  else if(k==='n'||k==='N')step(1);else if(k==='p'||k==='P')step(-1);else if(k==='f'||k==='F')fs();
  else if(k===' '){vid.paused?vid.play():vid.pause()}else return;e.preventDefault();e.stopImmediatePropagation()},true);
}
function wake(){el.classList.remove('idle');clearTimeout(idleT);idleT=setTimeout(()=>{if(!vid.paused)el.classList.add('idle')},2600)}
function fs(){if(document.fullscreenElement){wentFs=false;document.exitFullscreen()}else if(el.requestFullscreen){el.requestFullscreen().then(()=>{wentFs=true}).catch(()=>{})}}
function show(i){idx=(i+list.length)%list.length;const f=list[idx];vid.poster=f.poster;load(f);
 el.querySelector('.tt span').textContent=f.k+' · '+f.len;el.querySelector('.tt b').textContent=f.t;
 wake();try{history.replaceState(null,'','#'+f.id)}catch(e){}}
let tok=0,blobUrl;
/* Big films are stored as .partN byte slices (upload size limit); fetch them all and play the joined blob. */
async function load(f){const my=++tok;if(blobUrl){URL.revokeObjectURL(blobUrl);blobUrl=null}
 const note=el.querySelector('.ld');note.textContent='';
 if(!f.parts){vid.src=f.src;vid.play().catch(()=>{});return}
 vid.removeAttribute('src');vid.load();note.textContent='Loading… 0%';
 try{const base=f.src.replace(/\.mp4$/,''),bufs=[];let got=0,total=0;
  const rs=await Promise.all(Array.from({length:f.parts},(_,i)=>fetch(base+'.part'+(i+1))));
  if(rs.some(r=>!r.ok))throw 0;rs.forEach(r=>total+=+r.headers.get('content-length')||0);
  for(const r of rs){const rd=r.body.getReader(),ch=[];for(;;){const x=await rd.read();if(x.done)break;if(my!==tok){rd.cancel();return}ch.push(x.value);got+=x.value.length;if(total)note.textContent='Loading… '+Math.min(99,Math.round(got/total*100))+'%'}bufs.push(...ch)}
  if(my!==tok)return;blobUrl=URL.createObjectURL(new Blob(bufs,{type:'video/mp4'}));vid.src=blobUrl;note.textContent='';vid.play().catch(()=>{})
 }catch(e){if(my===tok)note.textContent='Could not load this one. Try the next.'}}
function step(d){show(idx+d)}
function play(id,noFs){if(!el)build();const i=list.findIndex(f=>f.id===id);if(i<0)return false;
 el.classList.add('on');ZT.open=true;document.documentElement.style.overflow='hidden';show(i);
 if(!noFs&&el.requestFullscreen&&!document.fullscreenElement)el.requestFullscreen().then(()=>{wentFs=true}).catch(()=>{});return true}
function close(){if(!ZT.open)return;ZT.open=false;tok++;vid.pause();vid.removeAttribute('src');vid.load();el.classList.remove('on');
 document.documentElement.style.overflow='';if(document.fullscreenElement){wentFs=false;document.exitFullscreen()}
 try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}if(ZT.onclose)ZT.onclose()}
window.ZT={list,play,close,open:false,has:id=>list.some(f=>f.id===id)};
})();
