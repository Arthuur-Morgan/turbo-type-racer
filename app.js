
(function(){
"use strict";
var gameAPI=window.gameAPI;
var TEXTS=[
"The engine roars to life as the green light flashes across the starting grid. Every keystroke is a shift of gear, every word a corner taken at full speed. Stay calm, keep your fingers fast, and let the rhythm carry you toward the checkered flag.",
"Under the neon skyline the highway stretches into the night, glowing with streaks of cyan and pink. Precision beats panic on every straight, so breathe steadily, correct each mistake, and push the throttle when the road opens up ahead of you.",
"Champions are not born at the finish line but made in the quiet hours of practice. Each accurate letter builds momentum, each clean sentence widens the gap, and the fastest driver is always the one who never lifts off the pedal.",
"Rain hammers the asphalt while the pack screams through the final chicane. Heart pounding and hands steady, you read the road ahead like a sentence you have typed a thousand times, and the finish line rushes forward to meet you."
];
var DIFF=[{n:"Beginner",lo:30,hi:45},{n:"Normal",lo:55,hi:70},{n:"Expert",lo:85,hi:105}];
var COLS=[{c:"#00f0ff",c2:"#ff2d95",m:0},{c:"#ff2d95",c2:"#ffffff",m:1},{c:"#9dff00",c2:"#0a0a0a",m:2}];
var BODY=[
"M6 28 C6 16 14 12 30 10 L84 8 C104 8 116 20 116 28 C116 36 104 48 84 48 L30 46 C14 44 6 40 6 28Z",
"M4 28 C4 14 20 10 40 10 L88 11 C110 12 118 22 118 28 C118 34 110 44 88 45 L40 46 C20 46 4 42 4 28Z",
"M8 22 L30 12 L92 10 L116 26 L116 30 L92 46 L30 44 L8 34Z"];
var $=function(i){return document.getElementById(i)};
function rnd(a,b){return a+Math.random()*(b-a)}
function ri(a,b){return Math.floor(rnd(a,b+1))}
var S={mode:"solo",role:null,diff:1,state:"idle",text:"",spans:[],idx:0,wrong:false,keys:0,good:0,t0:0,racers:[],timers:[],order:[],fw:0,fa:100,finishReported:false,finalOrder:null};
var NET={pc:null,ch:null};
var PROFILE_KEY="turbo-type-racer-profile-v1";
var profile=loadProfile();

function loadProfile(){
  try{
    var value=JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}");
    return {races:Math.max(0,+value.races||0),wins:Math.max(0,+value.wins||0),bestWpm:Math.max(0,+value.bestWpm||0),bestAccuracy:Math.max(0,+value.bestAccuracy||0),difficulty:[0,1,2].indexOf(+value.difficulty)>=0?+value.difficulty:1};
  }catch(e){return {races:0,wins:0,bestWpm:0,bestAccuracy:0,difficulty:1}}
}
function saveProfile(){try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profile))}catch(e){toast("Could not save your record in this browser")}}
function renderProfile(){
  $("profileRaces").textContent=profile.races;
  $("profileWins").textContent=profile.wins;
  $("profileBest").textContent=profile.bestWpm+" WPM";
  $("profileAccuracy").textContent=profile.bestAccuracy+"%";
  $("dRange").value=profile.difficulty;
  updDiff();
}

/* ---------- Car art (inline SVG) ---------- */
function carSVG(col,id){
  return '<svg viewBox="0 0 120 56" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col.c+'"/><stop offset="1" stop-color="'+col.c+'" stop-opacity=".55"/></linearGradient><radialGradient id="r'+id+'"><stop offset="0" stop-color="#ddd"/><stop offset="1" stop-color="#666"/></radialGradient></defs>'+
  '<g fill="#0b0b10" stroke="#555"><rect x="18" y="1" width="20" height="9" rx="3"/><rect x="18" y="46" width="20" height="9" rx="3"/><rect x="80" y="1" width="20" height="9" rx="3"/><rect x="80" y="46" width="20" height="9" rx="3"/></g>'+
  '<g fill="url(#r'+id+')"><rect x="22" y="3" width="12" height="4" rx="2"/><rect x="22" y="49" width="12" height="4" rx="2"/><rect x="84" y="3" width="12" height="4" rx="2"/><rect x="84" y="49" width="12" height="4" rx="2"/></g>'+
  '<rect x="0" y="9" width="9" height="38" rx="2" fill="'+col.c2+'" stroke="#000" stroke-opacity=".5"/><rect x="8" y="22" width="6" height="12" fill="#222"/>'+
  '<path d="'+BODY[col.m]+'" fill="url(#g'+id+')" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/>'+
  '<rect x="26" y="24.5" width="88" height="3" fill="'+col.c2+'"/><rect x="26" y="29.5" width="88" height="3" fill="'+col.c2+'"/>'+
  '<path d="M52 17 L76 14 L84 28 L76 42 L52 39 L60 28Z" fill="#071522" stroke="#9fe" stroke-opacity=".6"/><path d="M64 18 L74 16.5 L79 24 L68 24Z" fill="#fff" opacity=".25"/>'+
  '<path d="M30 14 L44 15 L44 41 L30 42" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="1.5"/>'+
  '<path d="M80 9 L88 3 L90 7 L84 12Z" fill="'+col.c2+'" stroke="#000" stroke-opacity=".5"/><path d="M80 47 L88 53 L90 49 L84 44Z" fill="'+col.c2+'" stroke="#000" stroke-opacity=".5"/>'+
  '<ellipse cx="112" cy="16" rx="4" ry="2.6" fill="#fffbd0"/><ellipse cx="112" cy="40" rx="4" ry="2.6" fill="#fffbd0"/><rect x="2" y="12" width="3" height="5" fill="#ff1744"/><rect x="2" y="39" width="3" height="5" fill="#ff1744"/></svg>';
}
function drawFinish(){
  var c=$("fin"),x=c.getContext("2d"),s=8;
  for(var yy=0;yy<Math.ceil(c.height/s);yy++)for(var xx=0;xx<Math.ceil(c.width/s);xx++){x.fillStyle=((xx+yy)%2)?"#000":"#fff";x.fillRect(xx*s,yy*s,s,s)}
}

/* ---------- Helpers ---------- */
function show(id){["home","solo","host","join","game"].forEach(function(s){$(s).classList.toggle("on",s===id)})}
function clearTimers(){S.timers.forEach(function(t){clearTimeout(t);clearInterval(t)});S.timers=[]}
function later(f,ms){var t=setTimeout(f,ms);S.timers.push(t);return t}
function every(f,ms){var t=setInterval(f,ms);S.timers.push(t);return t}
function toast(m){var t=$("toast");t.textContent=m;t.style.display="block";clearTimeout(toast.h);toast.h=setTimeout(function(){t.style.display="none"},3500)}
function copyTxt(v){if(!v)return;try{var result=gameAPI?gameAPI.copyText(v):navigator.clipboard.writeText(v);Promise.resolve(result).then(function(){toast("Copied to clipboard")}).catch(function(){toast("Copy failed - select the text manually")})}catch(e){toast("Copy failed - select the text manually")}}
function chOpen(){return NET.ch&&NET.ch.readyState==="open"}

/* ---------- Race setup ---------- */
function startRace(ti){
  clearTimers();
  var d=DIFF[S.diff];
  S.text=TEXTS[ti%TEXTS.length];S.idx=0;S.wrong=false;S.keys=0;S.good=0;S.order=[];S.state="countdown";S.fw=0;S.fa=100;S.finishReported=false;S.finalOrder=null;
  var multi=S.mode==="multi";
  var ghost=DIFF[1];
  S.racers=[{name:"YOU",cc:"YOU",p:0,wpm:0,col:COLS[0],you:true}];
  if(multi){
    S.racers.push({name:"FRIEND",cc:"P2P",p:0,wpm:0,col:COLS[1],remote:true});
    S.racers.push({name:"GHOST BOT",cc:"AI",p:0,wpm:0,col:COLS[2],chars:0,lo:ghost.lo,hi:ghost.hi,cur:rnd(ghost.lo,ghost.hi),tgt:rnd(ghost.lo,ghost.hi),burst:0,mirror:S.role==="guest"});
  }else{
    S.racers.push({name:"BOT APEX",cc:"AI",p:0,wpm:0,col:COLS[1],chars:0,lo:d.lo,hi:d.hi,cur:rnd(d.lo,d.hi),tgt:rnd(d.lo,d.hi),burst:0});
    S.racers.push({name:"BOT VOLT",cc:"AI",p:0,wpm:0,col:COLS[2],chars:0,lo:d.lo,hi:d.hi,cur:rnd(d.lo,d.hi),tgt:rnd(d.lo,d.hi),burst:0});
  }
  var tr=$("track");tr.classList.remove("racing");
  Array.prototype.slice.call(tr.querySelectorAll(".lane")).forEach(function(l){l.remove()});
  S.racers.forEach(function(r,i){
    var l=document.createElement("div");l.className="lane";
    l.innerHTML='<div class="lbl"><span class="flag">'+r.cc+'</span><b style="color:'+r.col.c+'">'+r.name+'</b><i id="lp'+i+'">0%</i></div><div class="car" id="car'+i+'" style="--p:0;--glow:'+r.col.c+'">'+carSVG(r.col,i)+'</div>';
    tr.insertBefore(l,$("fin"));
  });
  drawFinish();
  var tx=$("text");tx.innerHTML="";S.spans=[];
  for(var i=0;i<S.text.length;i++){var s=document.createElement("span");s.textContent=S.text[i];tx.appendChild(s);S.spans.push(s)}
  S.spans[0].className="cur";
  $("vW").textContent="0";$("vA").textContent="100%";$("vT").textContent="0.0s";$("vP").textContent="0%";
  $("modal").classList.remove("on");
  show("game");
  var n=3,cd=$("cd"),cn=$("cdn");
  (function tick(){
    cd.classList.add("on");cn.style.animation="none";void cn.offsetWidth;cn.style.animation="";
    if(n>0){cn.textContent=n;cn.style.color="var(--cy)";n--;later(tick,1000)}
    else{cn.textContent="RACE!";cn.style.color="var(--lm)";go();later(function(){cd.classList.remove("on")},800)}
  })();
}
function go(){
  S.state="racing";S.t0=performance.now();$("track").classList.add("racing");
  every(botTick,100);every(updateStats,200);
  if(S.mode==="multi")every(netTick,100);
}

/* ---------- Bot typing simulation ---------- */
function botStep(b){
  if(Math.random()<0.07)b.tgt=rnd(b.lo,b.hi);
  if(b.burst<=0&&Math.random()<0.03){b.burst=ri(5,14);b.bm=Math.random()<.5?rnd(1.12,1.3):rnd(.6,.85)}
  var m=1;if(b.burst>0){m=b.bm;b.burst--}
  b.cur+=(b.tgt-b.cur)*0.2+(Math.random()-.5)*3;
  b.cur=Math.max(b.lo,Math.min(b.hi,b.cur));
  var w=window.TypeRacerCore.botWpm({low:b.lo,high:b.hi,current:b.cur},m);
  b.chars+=w*5/60*0.1;b.wpm=w;
  b.p=Math.min(1,b.chars/S.text.length);
}
function botTick(){
  if(S.state!=="racing")return;
  S.racers.forEach(function(r){if(r.chars!==undefined&&!r.mirror)botStep(r)});
  render();checkEnd();
}
function render(){
  S.racers.forEach(function(r,i){
    var el=$("car"+i);if(!el)return;
    el.style.setProperty("--p",r.p.toFixed(4));
    $("lp"+i).textContent=Math.floor(r.p*100)+"%"+(r.wpm>0?" \u00b7 "+Math.round(r.wpm)+" WPM":"");
  });
  $("vP").textContent=Math.floor(S.racers[0].p*100)+"%";
}
function curWpm(){return window.TypeRacerCore.wpm(S.idx,performance.now()-S.t0)}
function curAcc(){return window.TypeRacerCore.accuracy(S.good,S.keys)}
function updateStats(){
  if(S.state!=="racing")return;
  var w=curWpm();S.racers[0].wpm=w;
  $("vW").textContent=w;$("vA").textContent=curAcc()+"%";$("vT").textContent=((performance.now()-S.t0)/1000).toFixed(1)+"s";
}

/* ---------- Typing engine ---------- */
function paint(){
  for(var i=0;i<S.spans.length;i++){
    var c=i<S.idx?"ok":(i===S.idx?(S.wrong?"bad":"cur"):"");
    if(S.spans[i].className!==c)S.spans[i].className=c;
  }
}
function shake(){var t=$("typeBox");t.classList.remove("shake");void t.offsetWidth;t.classList.add("shake")}
function onKey(e){
  if(e.key==="Escape"&&(S.state==="racing"||S.state==="countdown")){quit();return}
  if(S.state!=="racing"||e.ctrlKey||e.metaKey||e.altKey)return;
  if(S.idx>=S.text.length)return;
  var me=S.racers[0];
  if(e.key==="Backspace"){e.preventDefault();if(S.wrong){S.wrong=false;paint()}return}
  if(e.key.length!==1)return;
  if(S.wrong){e.preventDefault();shake();return}
  e.preventDefault();S.keys++;
  if(e.key===S.text[S.idx]){
    S.good++;S.idx++;me.p=S.idx/S.text.length;paint();render();
    if(S.idx>=S.text.length){updateStats();if(S.mode==="multi")netTick();checkEnd()}
  }else{S.wrong=true;paint();shake()}
}
document.addEventListener("keydown",onKey);

/* ---------- Finish verification & podium ---------- */
function checkEnd(){
  if(S.state!=="racing")return;
  S.racers.forEach(function(r){
    if(r.p>=1){if(!Number.isFinite(r.finishMs))r.finishMs=performance.now()-S.t0;if(S.order.indexOf(r)<0)S.order.push(r)}
    r.orderIndex=S.order.indexOf(r);
  });
  if(S.mode==="multi"){
    if(S.racers[0].p>=1&&!S.finishReported){S.finishReported=true;netTick();toast("Finish line crossed. Waiting for your opponent.")}
    if(!window.TypeRacerCore.bothPlayersFinished(S.racers[0].p,S.racers[1].p))return;
  }else if(!S.racers.some(function(r){return r.p>=1}))return;
  if(S.mode==="multi"&&S.role==="guest"){
    S.state="awaiting-result";clearTimers();$("track").classList.remove("racing");netTick();return;
  }
  if(S.mode==="multi"&&S.role==="host"){
    var hostKeys={0:"host",1:"guest",2:"ghost"};
    S.finalOrder=window.TypeRacerCore.rankRacers(S.racers.map(function(r){return {id:hostKeys[S.racers.indexOf(r)],progress:r.p,finishMs:r.finishMs,orderIndex:r.orderIndex}})).map(function(r){return r.id});
    send({t:"result",order:S.finalOrder});
  }
  finalizeRace();
}
function finalizeRace(){
  S.state="finished";clearTimers();$("track").classList.remove("racing");
  S.fw=curWpm();S.fa=curAcc();
  S.racers.forEach(function(r){if(r.p>=1){r.p=1}});render();
  profile.races++;
  if(S.racers[0].p>=1)profile.wins++;
  profile.bestWpm=Math.max(profile.bestWpm,S.fw);
  if(S.keys>0)profile.bestAccuracy=Math.max(profile.bestAccuracy,S.fa);
  saveProfile();renderProfile();
  later(showResults,900);
}
function showResults(){
  var rank;
  if(S.finalOrder){
    var ids=S.role==="host"?{host:0,guest:1,ghost:2}:{host:1,guest:0,ghost:2};
    rank=S.finalOrder.map(function(id){return S.racers[ids[id]]}).filter(Boolean);
  }else rank=window.TypeRacerCore.rankRacers(S.racers.map(function(r){return {racer:r,progress:r.p,finishMs:r.finishMs,orderIndex:S.order.indexOf(r)}})).map(function(item){return item.racer});
  var lab=["1ST","2ND","3RD"],h="";
  rank.forEach(function(r,i){h+='<div class="row r'+(i+1)+'"><div class="rk">'+lab[i]+'</div><span class="flag">'+r.cc+'</span><div class="nm" style="color:'+r.col.c+'">'+r.name+'</div><div class="pc">'+Math.floor(r.p*100)+'%</div></div>'});
  $("podium").innerHTML=h;
  var won=rank[0]===S.racers[0];
  $("mTitle").textContent=won?"Victory!":"Race Finished";
  $("mSub").textContent=won?"You crossed the line first":"You placed "+lab[rank.indexOf(S.racers[0])];
  $("rW").textContent=S.fw;$("rA").textContent=S.fa+"%";
  $("bAgain").textContent=S.mode==="multi"?"Rematch":"Retry";
  $("modal").classList.add("on");
  $("bAgain").focus();
}
function quit(){
  clearTimers();S.state="idle";$("cd").classList.remove("on");$("track").classList.remove("racing");$("modal").classList.remove("on");
  closeConn();show("home");$("bSolo").focus();
}

/* ---------- WebRTC peer-to-peer ---------- */
function mkPC(useStun){
  closeConn();
  var cfg={iceServers:useStun?[{urls:"stun:stun.l.google.com:19302"}]:[]};
  var pc=new RTCPeerConnection(cfg);
  pc.onconnectionstatechange=function(){
    var st=pc.connectionState;
    if(st==="failed"||st==="disconnected"||st==="closed")onLost();
  };
  NET.pc=pc;return pc;
}
function waitICE(pc){
  return new Promise(function(res){
    if(pc.iceGatheringState==="complete"){res();return}
    var done=false;function fin(){if(!done){done=true;res()}}
    pc.addEventListener("icegatheringstatechange",function(){if(pc.iceGatheringState==="complete")fin()});
    setTimeout(fin,5000);
  });
}
function enc(d){return btoa(JSON.stringify({type:d.type,sdp:d.sdp}))}
function dec(s){return JSON.parse(atob(s.replace(/\s+/g,"")))}
function wireChannel(ch,role){
  NET.ch=ch;
  ch.onopen=function(){
    if(role==="host"){$("hStat").textContent="Connected! Friend is ready.";$("hStat").classList.add("ok");$("hStart").disabled=false}
    else{$("gStat").textContent="Connected! Waiting for the host to start the race...";$("gStat").classList.add("ok")}
  };
  ch.onclose=onLost;
  ch.onmessage=onMsg;
}
function hostGen(){
  var pc=mkPC($("stunH").checked);S.role="host";
  wireChannel(pc.createDataChannel("race",{ordered:true}),"host");
  $("hStat").textContent="Generating offer...";$("hStat").classList.remove("ok");$("hStart").disabled=true;
  pc.createOffer().then(function(o){return pc.setLocalDescription(o)}).then(function(){return waitICE(pc)}).then(function(){
    $("hOffer").value=enc(pc.localDescription);$("hStat").textContent="Offer ready. Send it to your friend, then paste their answer below.";
  }).catch(function(e){$("hStat").textContent="Error: "+e.message});
}
function hostConnect(){
  if(!NET.pc||!NET.pc.localDescription){toast("Generate an offer first");return}
  var v=$("hAns").value.trim();if(!v){toast("Paste the answer string first");return}
  try{
    NET.pc.setRemoteDescription(new RTCSessionDescription(dec(v))).then(function(){$("hStat").textContent="Connecting..."}).catch(function(e){$("hStat").textContent="Error: "+e.message});
  }catch(e){$("hStat").textContent="Invalid answer string"}
}
function guestGen(){
  var v=$("gOffer").value.trim();if(!v){toast("Paste the host's offer first");return}
  var offer;try{offer=dec(v)}catch(e){$("gStat").textContent="Invalid offer string";return}
  var pc=mkPC($("stunG").checked);S.role="guest";
  pc.ondatachannel=function(ev){wireChannel(ev.channel,"guest")};
  $("gStat").textContent="Generating answer...";$("gStat").classList.remove("ok");
  pc.setRemoteDescription(new RTCSessionDescription(offer)).then(function(){return pc.createAnswer()}).then(function(a){return pc.setLocalDescription(a)}).then(function(){return waitICE(pc)}).then(function(){
    $("gAns").value=enc(pc.localDescription);$("gStat").textContent="Answer ready. Send it to the host - connection starts automatically.";
  }).catch(function(e){$("gStat").textContent="Error: "+e.message});
}
function send(o){if(chOpen()){try{NET.ch.send(JSON.stringify(o))}catch(e){}}}
function netTick(){
  if(S.state!=="racing"&&S.state!=="finished")return;
  var o={t:"pos",p:S.racers[0].p,w:curWpm(),a:curAcc(),finished:S.racers[0].p>=1,finishMs:S.racers[0].finishMs};
  if(S.role==="host"){o.b=S.racers[2].p;o.bw=S.racers[2].wpm}
  send(o);
}
function onMsg(ev){
  var m;try{m=JSON.parse(ev.data)}catch(e){return}
  if(m.t==="start"&&Number.isInteger(m.ti)&&m.ti>=0&&m.ti<TEXTS.length){S.mode="multi";S.diff=1;startRace(m.ti)}
  else if(m.t==="pos"&&(S.state==="racing"||S.state==="finished")){
    S.racers[1].p=Math.max(0,Math.min(1,+m.p||0));S.racers[1].wpm=+m.w||0;
    if(m.finished===true){S.racers[1].p=1;if(Number.isFinite(m.finishMs))S.racers[1].finishMs=m.finishMs}
    if(S.role==="guest"&&typeof m.b==="number"){S.racers[2].p=window.TypeRacerCore.clamp(m.b,0,1);S.racers[2].wpm=+m.bw||0}
    render();checkEnd();
  }
  else if(m.t==="result"&&S.role==="guest"&&Array.isArray(m.order)&&m.order.length===3&&m.order.every(function(id){return ["host","guest","ghost"].indexOf(id)>=0})){S.finalOrder=m.order;if(S.state==="awaiting-result")finalizeRace()}
}
function hostStart(){
  if(!chOpen()){toast("No connected player");return}
  var ti=ri(0,TEXTS.length-1);S.mode="multi";S.role="host";
  send({t:"start",ti:ti});startRace(ti);
}
function onLost(){
  if(!NET.pc&&!NET.ch)return;
  var was=S.mode==="multi"&&(S.state==="racing"||S.state==="countdown"||S.state==="awaiting-result");
  closeConn();
  $("hStat").textContent="Not connected";$("hStat").classList.remove("ok");$("hStart").disabled=true;
  $("gStat").textContent="Not connected";$("gStat").classList.remove("ok");
  if(was){clearTimers();S.state="idle";$("cd").classList.remove("on");$("track").classList.remove("racing");show("home");toast("Opponent disconnected")}
}
function closeConn(){
  var c=NET.ch,p=NET.pc;NET.ch=null;NET.pc=null;
  if(c){c.onclose=null;c.onmessage=null;try{c.close()}catch(e){}}
  if(p){p.onconnectionstatechange=null;try{p.close()}catch(e){}}
  S.role=null;
}

/* ---------- UI wiring ---------- */
function updDiff(){
  S.diff=+$("dRange").value;var d=DIFF[S.diff];
  $("dDesc").textContent=d.n+" \u2014 opponents type "+d.lo+"\u2013"+d.hi+" WPM";
  Array.prototype.forEach.call($("dLbl").children,function(s,i){s.classList.toggle("on",i===S.diff)});
}
$("dRange").addEventListener("input",function(){updDiff();profile.difficulty=S.diff;saveProfile()});updDiff();renderProfile();
$("bSolo").addEventListener("click",function(){show("solo")});
$("dGo").addEventListener("click",function(){S.mode="solo";S.role=null;startRace(ri(0,TEXTS.length-1))});
$("bHost").addEventListener("click",function(){closeConn();$("hOffer").value="";$("hAns").value="";$("hStat").textContent="Not connected";$("hStat").classList.remove("ok");$("hStart").disabled=true;show("host")});
$("bJoin").addEventListener("click",function(){closeConn();$("gOffer").value="";$("gAns").value="";$("gStat").textContent="Not connected";$("gStat").classList.remove("ok");show("join")});
$("hGen").addEventListener("click",hostGen);
$("hConn").addEventListener("click",hostConnect);
$("hCopy").addEventListener("click",function(){copyTxt($("hOffer").value)});
$("hStart").addEventListener("click",hostStart);
$("gGen").addEventListener("click",guestGen);
$("gCopy").addEventListener("click",function(){copyTxt($("gAns").value)});
Array.prototype.forEach.call(document.querySelectorAll("[data-home]"),function(b){b.addEventListener("click",function(){closeConn();show("home")})});
$("bAgain").addEventListener("click",function(){
  $("modal").classList.remove("on");
  if(S.mode==="multi"&&chOpen()){
    if(S.role==="host"){show("host");$("hStart").disabled=false}
    else{show("join");$("gStat").textContent="Connected! Waiting for the host to start the next race..."}
  }else if(S.mode==="solo"){startRace(ri(0,TEXTS.length-1))}
  else{closeConn();show("home")}
});
$("bMenu").addEventListener("click",quit);
$("wMin").addEventListener("click",function(){if(gameAPI)gameAPI.minimize()});
$("wClose").addEventListener("click",function(){if(gameAPI)gameAPI.close()});
drawFinish();
})();
