// ZChess rules - shared by browser and server
(function(root){
const col=p=>p?(p===p.toUpperCase()?'w':'b'):null;
const inB=(r,f)=>r>=0&&r<8&&f>=0&&f<8;
const KN=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const KG=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const RD=[[-1,0],[1,0],[0,-1],[0,1]],BD=[[-1,-1],[-1,1],[1,-1],[1,1]];
function start(){
  const b=Array(64).fill('');const back='rnbqkbnr';
  for(let f=0;f<8;f++){b[f]=back[f];b[8+f]='p';b[48+f]='P';b[56+f]=back[f].toUpperCase();}
  return {b,turn:'w',castle:{K:1,Q:1,k:1,q:1},ep:-1};
}
function attacked(b,r,f,by){
  const W=by==='w',up=W?1:-1;
  for(const df of[-1,1]){const rr=r+up,ff=f+df;if(inB(rr,ff)&&b[rr*8+ff]===(W?'P':'p'))return true;}
  for(const[dr,df]of KN){const rr=r+dr,ff=f+df;if(inB(rr,ff)&&b[rr*8+ff]===(W?'N':'n'))return true;}
  for(const[dr,df]of KG){const rr=r+dr,ff=f+df;if(inB(rr,ff)&&b[rr*8+ff]===(W?'K':'k'))return true;}
  const sl=(dirs,a,c)=>{for(const[dr,df]of dirs){let rr=r+dr,ff=f+df;while(inB(rr,ff)){const p=b[rr*8+ff];if(p){if(col(p)===by&&(p.toLowerCase()===a||p.toLowerCase()===c))return true;break;}rr+=dr;ff+=df;}}return false;};
  return sl(RD,'r','q')||sl(BD,'b','q');
}
function pseudo(s){
  const out=[],me=s.turn,b=s.b,op=me==='w'?'b':'w';
  const add=(from,to,x={})=>{const p=b[from].toLowerCase(),tr=to>>3;
    if(p==='p'&&(tr===0||tr===7))for(const pr of'qrbn')out.push({from,to,promo:pr,...x});else out.push({from,to,...x});};
  for(let sq=0;sq<64;sq++){const p=b[sq];if(col(p)!==me)continue;const r=sq>>3,f=sq&7,t=p.toLowerCase();
    if(t==='p'){const d=me==='w'?-1:1,st=me==='w'?6:1;
      if(inB(r+d,f)&&!b[(r+d)*8+f]){add(sq,(r+d)*8+f);if(r===st&&!b[(r+2*d)*8+f])add(sq,(r+2*d)*8+f,{dbl:1});}
      for(const df of[-1,1]){const rr=r+d,ff=f+df;if(!inB(rr,ff))continue;const to=rr*8+ff;
        if(col(b[to])===op)add(sq,to);else if(to===s.ep)add(sq,to,{ep:1});}
    }else if(t==='n'||t==='k'){for(const[dr,df]of(t==='n'?KN:KG)){const rr=r+dr,ff=f+df;if(inB(rr,ff)&&col(b[rr*8+ff])!==me)add(sq,rr*8+ff);}}
    else{const dirs=t==='r'?RD:t==='b'?BD:RD.concat(BD);
      for(const[dr,df]of dirs){let rr=r+dr,ff=f+df;while(inB(rr,ff)){const c=col(b[rr*8+ff]);if(c===me)break;add(sq,rr*8+ff);if(c)break;rr+=dr;ff+=df;}}}
  }
  const C=s.castle;
  if(me==='w'&&b[60]==='K'&&!attacked(b,7,4,'b')){
    if(C.K&&b[63]==='R'&&!b[61]&&!b[62]&&!attacked(b,7,5,'b')&&!attacked(b,7,6,'b'))out.push({from:60,to:62,castle:'K'});
    if(C.Q&&b[56]==='R'&&!b[59]&&!b[58]&&!b[57]&&!attacked(b,7,3,'b')&&!attacked(b,7,2,'b'))out.push({from:60,to:58,castle:'Q'});}
  if(me==='b'&&b[4]==='k'&&!attacked(b,0,4,'w')){
    if(C.k&&b[7]==='r'&&!b[5]&&!b[6]&&!attacked(b,0,5,'w')&&!attacked(b,0,6,'w'))out.push({from:4,to:6,castle:'k'});
    if(C.q&&b[0]==='r'&&!b[3]&&!b[2]&&!b[1]&&!attacked(b,0,3,'w')&&!attacked(b,0,2,'w'))out.push({from:4,to:2,castle:'q'});}
  return out;
}
function make(s,m){
  const b=s.b.slice(),p=b[m.from],me=s.turn;
  b[m.to]=p;b[m.from]='';
  if(m.ep)b[(m.from>>3)*8+(m.to&7)]='';
  if(m.promo)b[m.to]=me==='w'?m.promo.toUpperCase():m.promo;
  const RM={K:[63,61],Q:[56,59],k:[7,5],q:[0,3]};
  if(m.castle){const[a,c]=RM[m.castle];b[c]=b[a];b[a]='';}
  const castle={...s.castle};
  if(p==='K'){castle.K=castle.Q=0}if(p==='k'){castle.k=castle.q=0}
  const RS={63:'K',56:'Q',7:'k',0:'q'};if(RS[m.from])castle[RS[m.from]]=0;if(RS[m.to])castle[RS[m.to]]=0;
  return {b,turn:me==='w'?'b':'w',castle,ep:m.dbl?(m.from+m.to)/2:-1};
}
function inCheck(s){const k=s.b.indexOf(s.turn==='w'?'K':'k');return attacked(s.b,k>>3,k&7,s.turn==='w'?'b':'w');}
function legal(s){return pseudo(s).filter(m=>{const n=make(s,m);const k=n.b.indexOf(s.turn==='w'?'K':'k');return !attacked(n.b,k>>3,k&7,n.turn);});}
function onlyKings(b){return b.every(p=>!p||'KkNnBb'.includes(p))&&b.filter(p=>p&&p.toLowerCase()!=='k').length<=1;}
const sqName=i=>'abcdefgh'[i&7]+(8-(i>>3));
function san(s,m){
  if(m.castle)return m.castle.toLowerCase()==='k'?'O-O':'O-O-O';
  const p=s.b[m.from].toLowerCase(),cap=s.b[m.to]||m.ep;
  let t=p==='p'?(cap?'abcdefgh'[m.from&7]:''):p.toUpperCase();
  if(p!=='p'){const amb=legal(s).filter(o=>o.to===m.to&&o.from!==m.from&&s.b[o.from]===s.b[m.from]);
    if(amb.length)t+=amb.some(o=>(o.from&7)===(m.from&7))?(8-(m.from>>3)):'abcdefgh'[m.from&7];}
  t+=(cap?'x':'')+sqName(m.to)+(m.promo?'='+m.promo.toUpperCase():'');
  const n=make(s,m);if(inCheck(n))t+=legal(n).length?'+':'#';
  return t;
}
// result of a position: null (ongoing) or {winner:'w'|'b'|null, reason}
function result(s){
  if(!legal(s).length)return inCheck(s)?{winner:s.turn==='w'?'b':'w',reason:'checkmate'}:{winner:null,reason:'stalemate'};
  if(onlyKings(s.b))return {winner:null,reason:'insufficient material'};
  return null;
}
const API={col,start,attacked,legal,make,inCheck,onlyKings,san,sqName,result};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.Chess=API;
})(this);
