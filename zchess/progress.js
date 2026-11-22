// ZChess progression - local profile: XP, levels, practice rating, badges, daily quests, cosmetic unlocks.
// All of this is cosmetic. The leaderboard stays rating-only and nothing here can touch it.
(function(root){
const BOTS=[
  {id:'pip',n:'Pip the Pawn',r:400,pc:'p',c:'#c08a5a',depth:1,blunder:.5,noise:80,say:'I just learned how the horsey moves!'},
  {id:'bunny',n:'Blunder Bunny',r:700,pc:'n',c:'#c3cad6',depth:1,blunder:.15,noise:40,say:'Oops is my middle name.'},
  {id:'charlie',n:'Chill Charlie',r:1000,pc:'b',c:'#ffc93a',depth:2,blunder:.06,noise:25,say:'No stress. Just vibes and forks.'},
  {id:'steve',n:'Sweaty Steve',r:1300,pc:'r',c:'#38e0c0',depth:2,blunder:0,noise:8,say:'I have been warming up for six hours.'},
  {id:'gambit',n:'Madame Gambit',r:1500,pc:'q',c:'#9a8cff',depth:3,blunder:0,noise:6,say:'Every pawn you take was a gift, darling.'},
  {id:'prime',n:'ZBOT Prime',r:1800,pc:'k',c:'#ff5f8a',depth:4,blunder:0,noise:0,say:'Calculating your resignation.'},
];
const LEAGUES=[
  {n:'Pawn',min:0,pc:'p',c:'#c08a5a'},{n:'Knight',min:1000,pc:'n',c:'#c3cad6'},{n:'Bishop',min:1300,pc:'b',c:'#ffc93a'},
  {n:'Rook',min:1500,pc:'r',c:'#38e0c0'},{n:'Queen',min:1700,pc:'q',c:'#9a8cff'},{n:'King',min:1900,pc:'k',c:'#ff5f8a'},
  {n:'Grandmaster',min:2100,pc:'k',c:'#fff2a8'},
];
function league(r){
  let i=0;while(i<LEAGUES.length-1&&r>=LEAGUES[i+1].min)i++;
  const L=LEAGUES[i],nx=LEAGUES[i+1];let div='';
  if(nx){const lo=i?L.min:400;div=' '+['III','II','I'][Math.min(2,Math.max(0,Math.floor((r-lo)/((nx.min-lo)/3))))];}
  return {...L,i,label:L.n+' League'+div,next:nx};
}

// ---------- levels ----------
const need=l=>60+40*l; // xp to go from level l to l+1
const TITLES=[[1,'Newcomer'],[3,'Woodpusher'],[5,'Tactician'],[8,'Strategist'],[12,'Expert'],[16,'Master'],[20,'Legend']];
function level(xp){let l=1;while(xp>=need(l)){xp-=need(l);l++;}
  let title='';for(const[n,t]of TITLES)if(l>=n)title=t;return {lvl:l,cur:xp,need:need(l),title};}

// ---------- cosmetic unlocks ----------
const UNLOCK={
  style:{glass:{lvl:3},metal:{lvl:5},shadow:{lvl:8},neon:{bot:'steve'},gem:{bot:'prime'}},
  brd:{ember:{lvl:2},candy:{lvl:4},midnight:{lvl:6},void:{bot:'gambit'}},
};
function unlocked(kind,key){const u=UNLOCK[kind][key];if(!u)return true;
  return u.lvl?level(P.xp).lvl>=u.lvl:!!P.beaten[u.bot];}
function reqText(kind,key){const u=UNLOCK[kind][key];if(!u)return 'Free';
  return u.lvl?'Level '+u.lvl:'Beat '+BOTS.find(b=>b.id===u.bot).n;}
function allUnlocked(){const out=[];for(const k in UNLOCK)for(const key in UNLOCK[k])if(unlocked(k,key))out.push(k+':'+key);return out;}

// ---------- profile ----------
const DEF={xp:0,games:0,wins:0,losses:0,draws:0,streak:0,best:0,pr:800,beaten:{},ach:{},day:'',dayStreak:0,daily:{date:'',c:{},done:{}}};
let P=JSON.parse(JSON.stringify(DEF));
try{Object.assign(P,JSON.parse(localStorage.getItem('zchess_profile')||'{}'))}catch(e){}
function save(){try{localStorage.setItem('zchess_profile',JSON.stringify(P))}catch(e){}}
const dstr=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>dstr(new Date());
function ensureDaily(){if(P.daily.date!==today())P.daily={date:today(),c:{},done:{}};}
function touchDay(){const t=today();if(P.day===t)return;const y=new Date();y.setDate(y.getDate()-1);
  P.dayStreak=P.day===dstr(y)?P.dayStreak+1:1;P.day=t;}
const beatenCount=()=>BOTS.filter(b=>P.beaten[b.id]).length;

// ---------- daily quests ----------
const QUESTS=[
  {id:'win1',t:'Win a game',k:'wins',n:1,xp:40},{id:'play3',t:'Finish 3 games',k:'games',n:3,xp:40},
  {id:'cap12',t:'Capture 12 pieces',k:'caps',n:12,xp:30},{id:'chk6',t:'Give 6 checks',k:'checks',n:6,xp:30},
  {id:'castle2',t:'Castle in 2 games',k:'castles',n:2,xp:30},{id:'black1',t:'Win as Black',k:'blackWins',n:1,xp:50},
  {id:'mate1',t:'Deliver a checkmate',k:'mates',n:1,xp:50},{id:'tough',t:'Beat a bot rated 1000+ or a rated opponent',k:'tough',n:1,xp:60},
  {id:'promo1',t:'Promote a pawn',k:'promos',n:1,xp:40},
];
function todays(){ensureDaily();let h=7;for(const ch of P.daily.date)h=(h*31+ch.charCodeAt(0))>>>0;
  const pool=QUESTS.slice(),out=[];while(out.length<3){h=(h*1103515245+12345)>>>0;out.push(pool.splice((h>>>8)%pool.length,1)[0]);}return out;}
function quests(){return todays().map(q=>({...q,have:Math.min(q.n,P.daily.c[q.k]||0),done:!!P.daily.done[q.id]}));}

// ---------- badges ----------
let T={};
const ACH=[
  {id:'first',i:'🩸',n:'First Blood',d:'Win your first game',t:x=>x.win},
  {id:'g10',i:'♟️',n:'Regular',d:'Finish 10 games',any:1,t:()=>P.games>=10},
  {id:'g50',i:'🐀',n:'Board Rat',d:'Finish 50 games',any:1,t:()=>P.games>=50},
  {id:'s3',i:'🔥',n:'Heating Up',d:'Win 3 games in a row',t:()=>P.streak>=3},
  {id:'s5',i:'☄️',n:'On Fire',d:'Win 5 games in a row',t:()=>P.streak>=5},
  {id:'speed',i:'⚡',n:'Speedrun',d:'Checkmate in 15 moves or fewer',t:x=>x.win&&x.o.reason==='checkmate'&&x.o.plies<=30},
  {id:'mara',i:'🏃',n:'Marathon',d:'Finish a game that lasts 60+ moves',t:x=>x.o.plies>=120},
  {id:'castle',i:'🏰',n:'Safe & Sound',d:'Castle your king',t:()=>T.castled},
  {id:'promo',i:'✨',n:'Glow Up',d:'Promote a pawn',t:()=>T.promos>0},
  {id:'under',i:'🎩',n:'Underpromoter',d:'Promote to something that is not a queen',t:()=>T.under},
  {id:'ep',i:'🥐',n:'En Passant!',d:'Capture a pawn en passant',t:()=>T.ep},
  {id:'qless',i:'💔',n:'Who Needs Her',d:'Win after losing your queen',t:x=>x.win&&T.lostQueen},
  {id:'clean',i:'🛡️',n:'Untouchable',d:'Win without losing a single piece or pawn',t:x=>x.win&&x.mine===16},
  {id:'pmate',i:'⭐',n:'Pawn Star',d:'Deliver checkmate with a pawn',t:x=>x.win&&T.mateBy==='p'},
  {id:'nmate',i:'🐴',n:'Knight Fever',d:'Deliver checkmate with a knight',t:x=>x.win&&T.mateBy==='n'},
  {id:'dark',i:'🌑',n:'Dark Side',d:'Win as Black',t:x=>x.win&&x.o.myColor==='b'},
  {id:'stale',i:'🤦',n:'Oops',d:'Draw by stalemate',t:x=>x.o.reason==='stalemate'},
  {id:'lad3',i:'🪜',n:'Ladder Climber',d:'Beat 3 different bots',t:()=>beatenCount()>=3},
  {id:'lad6',i:'🤖',n:'Bot Slayer',d:'Beat all 6 bots',t:()=>beatenCount()>=6},
  {id:'prime',i:'👑',n:'Prime Time',d:'Beat ZBOT Prime',t:()=>P.beaten.prime>0},
  {id:'d3',i:'📅',n:'Habit',d:'Play 3 days in a row',any:1,t:()=>P.dayStreak>=3},
  {id:'d7',i:'🗓️',n:'Devoted',d:'Play 7 days in a row',any:1,t:()=>P.dayStreak>=7},
  {id:'quests',i:'✅',n:'Overachiever',d:'Finish all 3 daily quests in one day'},
  {id:'giant',i:'🗡️',n:'Giant Slayer',d:'Beat a rated opponent 150+ points above you',t:x=>x.win&&x.o.kind==='online'&&x.o.oppRating-x.o.myRating>=150},
  {id:'placed',i:'🎯',n:'Placed',d:'Finish 5 rated online games'},
  {id:'rook',i:'🏯',n:'Castle Walls',d:'Reach Rook League in rated play'},
  {id:'lv5',i:'🎖️',n:'High Five',d:'Reach level 5'},
  {id:'lv10',i:'🏅',n:'Double Digits',d:'Reach level 10'},
];
const ACH_XP=25;
function give(id,out){if(P.ach[id])return;P.ach[id]=Date.now();P.xp+=ACH_XP;out.push(ACH.find(a=>a.id===id));}
function levelBadges(out){const l=level(P.xp).lvl;if(l>=5)give('lv5',out);if(level(P.xp).lvl>=10)give('lv10',out);}

// ---------- per-game tracking ----------
function begin(){T={caps:0,checks:0,promos:0,castled:0,under:0,ep:0,lostQueen:0,mateBy:'',undo:0};}
begin();
function move(s,m,sn,mine){
  const pc=s.b[m.from].toLowerCase(),cap=s.b[m.to]||(m.ep?'p':'');
  if(mine){if(cap)T.caps++;if(/[+#]/.test(sn))T.checks++;if(m.castle)T.castled=1;
    if(m.promo){T.promos++;if(m.promo!=='q')T.under=1;}if(m.ep)T.ep=1;if(sn.endsWith('#'))T.mateBy=pc;}
  else if(cap.toLowerCase()==='q')T.lostQueen=1;
}
function undo(){T.undo=1;}

// o: {kind:'bot'|'online', bot, result:'win'|'loss'|'draw', reason, myColor, s, plies, rated, myRating, oppRating}
function end(o){
  const out={xp:0,ach:[],quests:[],unlocks:[],lvl:0,pr:null,practice:false};
  if(o.kind==='online'&&!o.rated)return out;
  ensureDaily();touchDay();
  const before=allUnlocked(),lv0=level(P.xp).lvl,xp0=P.xp;
  const win=o.result==='win',draw=o.result==='draw',clean=!T.undo;
  P.games++;
  if(o.kind==='bot'){
    const i=BOTS.indexOf(o.bot);let x=win?15+i*12:draw?8+i*5:6;
    if(!clean){x=Math.ceil(x/2);out.practice=true;}
    P.xp+=x;
    if(clean){const e=1/(1+Math.pow(10,(o.bot.r-P.pr)/400)),old=P.pr;
      P.pr=Math.max(100,Math.round(P.pr+32*((win?1:draw?.5:0)-e)));out.pr={old,new:P.pr};
      if(win)P.beaten[o.bot.id]=(P.beaten[o.bot.id]||0)+1;}
  }else P.xp+=win?60:draw?30:15;
  if(clean){
    if(win){P.wins++;P.streak++;P.best=Math.max(P.best,P.streak);}else{P.streak=0;if(draw)P.draws++;else P.losses++;}
    const c=P.daily.c,add=(k,v)=>{c[k]=(c[k]||0)+v;};
    add('games',1);add('caps',T.caps);add('checks',T.checks);add('promos',T.promos);if(T.castled)add('castles',1);
    if(win){add('wins',1);if(o.myColor==='b')add('blackWins',1);if(o.reason==='checkmate')add('mates',1);
      if(o.kind==='online'||o.bot.r>=1000)add('tough',1);}
    const qs=todays();
    for(const q of qs)if(!P.daily.done[q.id]&&(c[q.k]||0)>=q.n){P.daily.done[q.id]=1;P.xp+=q.xp;out.quests.push(q);}
    if(qs.every(q=>P.daily.done[q.id]))give('quests',out.ach);
  }
  const x={o,win,draw,mine:o.s.b.filter(p=>p&&(p===p.toUpperCase())===(o.myColor==='w')).length};
  for(const a of ACH)if(a.t&&(clean||a.any)&&!P.ach[a.id]&&a.t(x))give(a.id,out.ach);
  levelBadges(out.ach);
  out.xp=P.xp-xp0;
  const lv1=level(P.xp).lvl;if(lv1>lv0)out.lvl=lv1;
  out.unlocks=allUnlocked().filter(u=>!before.includes(u)).map(u=>u.split(':'));
  save();return out;
}
// badges that depend on the real (server) rating
function onlineUser(u){const out=[];if(!u)return out;
  if(u.games>=5)give('placed',out);if(!u.provisional&&u.rating>=1500)give('rook',out);
  if(out.length){levelBadges(out);save();}return out;}

root.ZP={BOTS,LEAGUES,ACH,UNLOCK,get P(){return P;},league,level,quests,unlocked,reqText,beatenCount,begin,move,undo,end,onlineUser};
})(this);
