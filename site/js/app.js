
import { createApi } from './api.js';
import { LIMIT, isFull, joinBlock } from './rules.js';

const { api, data: D, fallback } = await createApi();

var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

var ICONS={
 search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',pin:'<path d="M12 21s6-5.6 6-11a6 6 0 10-12 0c0 5.4 6 11 6 11z"/><circle cx="12" cy="10" r="2.2"/>',
 users:'<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19c.6-3.3 3-5 6-5s5.4 1.7 6 5"/><path d="M16 5.5a3 3 0 010 6M18.5 14.5c1.6.7 2.6 2.2 2.9 4.5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
 moon:'<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
 home:'<path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z"/>',graph:'<circle cx="6" cy="7" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="12" cy="18" r="2.4"/><path d="M8 8l3 8M16.2 7.6L13 16M8.4 7h7"/>',
 user:'<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.8 3.6-5.6 7-5.6s6.2 1.8 7 5.6"/>',
 tg:'<path d="M21 4L3 11l5.5 2 2 6 3-4 5 3.5z"/><path d="M8.5 13L21 4"/>',mail:'<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 8l8 5.5L20 8"/>',
 cap:'<path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 12v4.5c1.5 1.4 3.4 2 5.5 2s4-.6 5.5-2V12"/>',
 grad:'<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.3 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
 door:'<path d="M6 20V5a1 1 0 011-1h9a1 1 0 011 1v15"/><path d="M4 20h16M13.5 12v.5"/>',
 file:'<path d="M14 3H7a1.5 1.5 0 00-1.5 1.5v15A1.5 1.5 0 007 21h10a1.5 1.5 0 001.5-1.5V8z"/><path d="M14 3v5h4.5"/>',
 cal:'<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',spark:'<path d="M12 3v5M12 16v5M3 12h5M16 12h5"/>'
};
function ic(n){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+(ICONS[n]||'')+'</svg>'}

/* ---------- data ---------- */
var TAGS=D.tags,G=D.groups,EV=D.events;
var TN={};TAGS.forEach(function(t){TN[t.id]=t.n});
var MON=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'], WD=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
var ROLES={
 student:{n:'Студент ИМЭС',d:'Полный доступ после проверки студенческого.',i:'cap'},
 alumni:{n:'Выпускник',d:'Те же возможности. Проверим по студенческому или диплому.',i:'grad'},
 applicant:{n:'Абитуриент',d:'Смотри всё и вступай в открытые группы, до 3 штук.',i:'door'}
};

/* ---------- state ---------- */
var S={user:D.user,joined:D.joined,going:D.going,view:'feed',ff:'all',q:'',gt:'all',gtag:null,gsel:null};
function full(){return isFull(S.user)}
function initials(n){var p=String(n||'').trim().split(/\s+/);return ((p[0]||'?')[0]+(p[1]?p[1][0]:'')).toUpperCase()}
function allEv(){return EV.slice().sort(function(a,b){return (a.date+a.time)<(b.date+b.time)?-1:1})}
function gById(id){return G.filter(function(g){return g.id===id})[0]}

var toastT;function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on')},3200)}

/* ---------- header / nav ---------- */
var NAV=[['feed','Лента','home'],['groups','Группы','users'],['graph','Граф','graph'],['profile','Профиль','user']];
function renderNav(){
  $('#nav').innerHTML=NAV.map(function(n){return '<button data-act="nav" data-v="'+n[0]+'"'+(S.view===n[0]?' aria-current="page"':'')+'>'+ic(n[2])+n[1]+'</button>'}).join('');
  $('#bnav').innerHTML=NAV.map(function(n){return '<button data-act="nav" data-v="'+n[0]+'"'+(S.view===n[0]?' aria-current="page"':'')+'>'+ic(n[2])+n[1]+'</button>'}).join('');
  $('#meSlot').innerHTML=S.user?'<button class="me" data-act="nav" data-v="profile" aria-label="Мой профиль"><span class="ava">'+esc(initials(S.user.name))+'</span><span>'+esc(S.user.name.split(' ')[0])+'</span></button>'
    :'<button class="btn btn-primary btn-sm" data-act="reg">Войти</button>';
  var dark=isDark();$('#themeBtn').innerHTML=ic(dark?'sun':'moon');
}
function isDark(){var t=document.documentElement.getAttribute('data-theme');return t?t==='dark':(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)}
function setView(v){
  S.view=v;$$('.view').forEach(function(el){el.classList.toggle('on',el.id==='v-'+v)});
  renderNav();
  if(v==='feed')renderFeed();if(v==='groups')renderGroups();if(v==='profile')renderProfile();
  window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});
  if(v==='graph'){renderGraphPanel();startGraph()}
  try{history.replaceState(null,'','#'+v)}catch(e){}
}

/* ---------- feed ---------- */
function evCard(e,i){
  var g=e.g?gById(e.g):null,d=new Date(e.date+'T12:00:00'),on=S.going.indexOf(e.id)>-1;
  return '<article class="ev card" style="--i:'+i+'"><div class="ev-date"><b>'+d.getDate()+'</b><span>'+MON[d.getMonth()]+'</span></div>'+
   '<div><div class="ev-top"><span class="pill '+(e.src==='imes'?'pill-imes':'pill-stu')+'">'+(e.src==='imes'?'ИМЭС':'Студенты')+'</span>'+(g?'<button class="link" data-act="group" data-id="'+g.id+'">'+esc(g.n)+'</button>':'')+'</div>'+
   '<h3>'+esc(e.t)+'</h3><p class="meta"><span>'+ic('clock')+' '+WD[d.getDay()]+', '+esc(e.time)+'</span><span>'+ic('pin')+' '+esc(e.place)+'</span></p></div>'+
   '<div class="ev-go"><button class="btn btn-sm '+(on?'on':'btn-ghost')+'" data-act="going" data-id="'+e.id+'" aria-pressed="'+on+'">'+(on?ic('check')+' Иду':'Пойду')+'</button><span class="count">'+e.go+' идут</span></div></article>';
}
function renderFeed(){
  var evs=allEv().filter(function(e){
    if(S.ff==='imes')return e.src==='imes';if(S.ff==='stu')return e.src==='stu';
    if(S.ff==='mine')return e.g&&S.joined.indexOf(e.g)>-1;return true});
  var F=[['all','Все'],['imes','От ИМЭС'],['stu','От студентов'],['mine','Мои группы']];
  var hero='<div class="hero"><h1 class="h-title">Найди своих<br>в <em>ИМЭС</em></h1><p class="lead">Группы по интересам, события вуза и студентов в одном месте. Выбери, что тебе нравится, и мы покажем, где собираются такие же люди.</p>'+
   '<p class="hero-q">Что тебе интересно?</p><div class="hero-chips">'+['games','code','lang','sport','music','photo','startup','cinema'].map(function(t,i){return '<button class="chip" style="--i:'+i+'" data-act="tag-go" data-id="'+t+'">'+esc(TN[t])+'</button>'}).join('')+'</div></div>';
  var list=evs.length?'<div class="stagger">'+evs.map(evCard).join('')+'</div>':
    '<div class="empty"><b>Здесь пока пусто</b>'+(S.ff==='mine'?'Вступи в группу, и её события появятся тут.':'Событий не найдено.')+'<div style="margin-top:14px"><button class="btn btn-primary btn-sm" data-act="nav" data-v="groups">Посмотреть группы</button></div></div>';
  var side=S.user?'<div class="card" style="padding:18px"><h3 class="sec-title" style="font-size:17px">Мои группы</h3><div style="margin-top:8px">'+
      (S.joined.length?S.joined.map(function(id){var g=gById(id);return '<button class="mini" data-act="group" data-id="'+id+'"><span class="emb" style="--h:'+g.h+';width:40px;height:40px;border-radius:12px;font-size:14px">'+esc(g.n[0])+'</span><span><b style="font-weight:600">'+esc(g.n)+'</b><br><span class="hint">'+g.m+' участников</span></span></button>'}).join(''):'<p class="hint" style="padding:8px 4px">Ты пока не вступил ни в одну группу.</p><button class="btn btn-soft btn-sm" style="margin-top:8px" data-act="nav" data-v="groups">Найти группу</button>')+
    '</div></div>'
    :'<div class="card steps3"><h3 class="sec-title" style="font-size:17px">Как это работает</h3><ol>'+
      [['Зарегистрируйся','Займёт минуту. Можно через почту или Telegram.'],['Выбери интересы','Отметь, что любишь. Мы подберём группы.'],['Вступай и приходи','Нажми «Вступить» и смотри события в ленте.']].map(function(s,i){return '<li><span class="stepn">'+(i+1)+'</span><span><b>'+s[0]+'</b><br><span class="hint">'+s[1]+'</span></span></li>'}).join('')+
    '</ol><button class="btn btn-primary" data-act="reg">Создать профиль</button></div>';
  $('#v-feed').innerHTML=hero+'<div class="cols"><div><div class="row" style="justify-content:space-between;margin-bottom:12px"><div class="scroll-x" role="group" aria-label="Фильтр событий">'+
    F.map(function(f){return '<button class="chip" data-act="ff" data-id="'+f[0]+'" aria-pressed="'+(S.ff===f[0])+'">'+f[1]+'</button>'}).join('')+'</div>'+
    '<button class="btn btn-ghost btn-sm" data-act="compose">'+ic('plus')+' Предложить событие</button></div>'+list+'</div><aside>'+side+'</aside></div>';
}

/* ---------- groups ---------- */
function gCard(g,i){
  var j=S.joined.indexOf(g.id)>-1;
  return '<article class="gc card" style="--i:'+i+'" data-act="group" data-id="'+g.id+'" tabindex="0" role="button" aria-label="Открыть группу '+esc(g.n)+'">'+
   '<div class="gtop"><span class="emb" style="--h:'+g.h+'">'+esc(g.n.slice(0,1))+'</span><div><h3>'+esc(g.n)+'</h3><span class="pill '+(g.type==='teacher'?'pill-warn':'pill-stu')+'" style="margin-top:4px">'+(g.type==='teacher'?'Ведёт преподаватель':'Студенческая')+'</span></div></div>'+
   '<p>'+esc(g.d)+'</p><div class="tags">'+g.tags.map(function(t){return '<span class="tag">'+esc(TN[t])+'</span>'}).join('')+'</div>'+
   '<div class="gfoot"><span class="hint">'+ic('users')+' '+g.m+(g.open?'':' · '+ic('lock')+' закрытая')+'</span>'+
   '<button class="btn btn-sm '+(j?'on':'btn-primary')+'" data-act="join" data-id="'+g.id+'">'+(j?ic('check')+' Вы в группе':'Вступить')+'</button></div></article>';
}
function filteredGroups(){
  var q=S.q.trim().toLowerCase();
  return G.filter(function(g){
    if(S.gt!=='all'&&g.type!==S.gt)return false;
    if(S.gtag&&g.tags.indexOf(S.gtag)<0)return false;
    if(q&&(g.n+' '+g.d+' '+g.tags.map(function(t){return TN[t]}).join(' ')).toLowerCase().indexOf(q)<0)return false;return true});
}
function renderGroups(){
  var el=$('#v-groups');
  var mine=S.user?S.user.interests||[]:[];
  el.innerHTML='<h1 class="h-title" style="font-size:clamp(26px,4.4vw,40px)">Группы по интересам</h1><p class="lead">Выбери тему или найди группу по названию.</p>'+
  '<div class="tools"><div class="search"><label class="sr" for="gq">Поиск групп</label>'+ic('search')+'<input id="gq" type="search" placeholder="Например: английский, футбол, дизайн" value="'+esc(S.q)+'" autocomplete="off"></div>'+
  '<div class="row"><div class="seg" role="group" aria-label="Тип групп">'+[['all','Все'],['student','Студенческие'],['teacher','Преподавательские']].map(function(s){return '<button data-act="gt" data-id="'+s[0]+'" aria-pressed="'+(S.gt===s[0])+'">'+s[1]+'</button>'}).join('')+'</div></div>'+
  '<div class="scroll-x" role="group" aria-label="Интересы"><button class="chip" data-act="gtag" data-id="" aria-pressed="'+(!S.gtag)+'">Все темы</button>'+
   TAGS.map(function(t){return '<button class="chip'+(mine.indexOf(t.id)>-1&&S.gtag!==t.id?' mine':'')+'" data-act="gtag" data-id="'+t.id+'" aria-pressed="'+(S.gtag===t.id)+'">'+esc(t.n)+'</button>'}).join('')+'</div></div><div id="glist"></div>';
  drawGroupList();
}
function drawGroupList(){
  var l=filteredGroups();
  $('#glist').innerHTML=l.length?'<div class="grid stagger">'+l.map(gCard).join('')+'</div>':
   '<div class="empty" style="margin-top:14px"><b>Ничего не нашлось</b>Попробуй другое слово или сбрось фильтры.<div style="margin-top:14px"><button class="btn btn-primary btn-sm" data-act="reset-f">Сбросить фильтры</button></div></div>';
}

/* ---------- group sheet ---------- */
function openSheet(id){
  var g=gById(id);if(!g)return;S.gsel=id;
  var j=S.joined.indexOf(id)>-1,evs=allEv().filter(function(e){return e.g===id}).slice(0,3);
  var rel=G.filter(function(x){return x.id!==id&&x.tags.some(function(t){return g.tags.indexOf(t)>-1})}).slice(0,3);
  $('#sheet').innerHTML='<button class="ibtn xbtn" data-act="close-all" aria-label="Закрыть">'+ic('x')+'</button>'+
   '<span class="emb" style="--h:'+g.h+';width:68px;height:68px;font-size:26px;border-radius:20px">'+esc(g.n[0])+'</span><h2>'+esc(g.n)+'</h2>'+
   '<div class="row"><span class="pill '+(g.type==='teacher'?'pill-warn':'pill-stu')+'">'+(g.type==='teacher'?'Ведёт преподаватель':'Студенческая группа')+'</span><span class="pill '+(g.open?'pill-ok':'pill-mute')+'">'+(g.open?'Открытая':'Только для подтверждённых')+'</span></div>'+
   '<p style="margin-top:14px;font-size:17px">'+esc(g.d)+'</p>'+
   '<div class="kv"><div><h4>Темы</h4><div class="tags">'+g.tags.map(function(t){return '<span class="tag">'+esc(TN[t])+'</span>'}).join('')+'</div></div>'+
   '<div><h4>Участники</h4><p>'+ic('users')+' '+g.m+'</p></div>'+
   '<div><h4>Ближайшие события</h4>'+(evs.length?evs.map(function(e){var d=new Date(e.date+'T12:00:00');return '<p style="padding:6px 0"><b>'+d.getDate()+' '+MON[d.getMonth()]+', '+esc(e.time)+'</b> · '+esc(e.t)+'</p>'}).join(''):'<p class="hint">Пока ничего не запланировано.</p>')+'</div>'+
   (rel.length?'<div><h4>Похожие группы</h4><div class="row">'+rel.map(function(r){return '<button class="chip" data-act="group" data-id="'+r.id+'">'+esc(r.n)+'</button>'}).join('')+'</div></div>':'')+'</div>'+
   '<button class="btn '+(j?'on':'btn-primary')+'" style="width:100%;margin-top:24px" data-act="join" data-id="'+id+'">'+(j?ic('check')+' Вы в группе. Нажмите, чтобы выйти':'Вступить в группу')+'</button>';
  $('#sheet').classList.add('on');$('#sheet').setAttribute('aria-hidden','false');$('#scrim').classList.add('on');
}
function closeSheet(){$('#sheet').classList.remove('on');$('#sheet').setAttribute('aria-hidden','true');if(!$('#modal').classList.contains('on'))$('#scrim').classList.remove('on');S.gsel=null}

/* ---------- actions ---------- */
function lockMsg(){return S.user&&S.user.role==='applicant'?'Для абитуриентов это пока закрыто. Станет доступно, когда ты поступишь и подтвердишь студенческий.':'Это откроется после проверки студенческого. Загляни в профиль.'}
function errText(e){
  var c=e&&e.code;
  if(c==='closed_group')return 'Эта группа закрытая. '+lockMsg();
  if(c==='join_limit')return 'Пока можно вступить максимум в '+LIMIT+' группы. '+lockMsg();
  if(c==='bad_code')return 'Код не подошёл. Проверь цифры и попробуй снова.';
  if(c==='rate_limit')return 'Слишком много попыток. Подожди минуту и повтори.';
  if(c==='forbidden')return 'Это действие пока недоступно для твоего аккаунта.';
  if(c==='auth_required')return 'Сначала войди в аккаунт.';
  return 'Не получилось. Проверь интернет и попробуй ещё раз.';
}
async function busy(btn,fn){
  if(btn){btn.disabled=true}
  try{return await fn()}finally{if(btn&&btn.isConnected)btn.disabled=false}
}
async function toggleJoin(id){
  if(!S.user){openReg(id);return}
  var g=gById(id),i=S.joined.indexOf(id);
  try{
    if(i>-1){await api.leave(id);S.joined.splice(i,1);g.m=Math.max(0,g.m-1);toast('Вы вышли из группы «'+g.n+'»')}
    else{
      var why=joinBlock(S.user,g,S.joined.length);
      if(why){toast(errText({code:why}));return}
      await api.join(id);S.joined.push(id);g.m++;toast('Готово. Вы в группе «'+g.n+'»')
    }
  }catch(e){toast(errText(e));return}
  refresh();if(S.gsel)openSheet(S.gsel);
}
async function toggleGoing(id){
  if(!S.user){openReg();return}
  var on=S.going.indexOf(id)<0,ev=allEv().filter(function(e){return e.id===id})[0];
  try{
    await api.setGoing(id,on);
    if(on){S.going.push(id);ev.go++;toast('Записали. Напомним о событии.')}
    else{S.going.splice(S.going.indexOf(id),1);ev.go=Math.max(0,ev.go-1)}
  }catch(e){toast(errText(e));return}
  refresh();
}
function refresh(){renderNav();if(S.view==='feed')renderFeed();if(S.view==='groups')drawGroupList();if(S.view==='profile')renderProfile();if(S.view==='graph'){buildGraph();renderGraphPanel()}}

/* compose event */
function openCompose(){
  if(!S.user){openReg();return}
  if(!full()){toast(lockMsg());return}
  if(!S.joined.length){toast('Сначала вступи в группу. Событие создаётся от её имени.');return}
  var m=$('#mbox');
  m.innerHTML='<button class="ibtn xbtn" data-act="close-all" aria-label="Закрыть" style="top:14px">'+ic('x')+'</button><h2>Предложить событие</h2><p class="hint">Оно появится в ленте у всех студентов.</p>'+
   '<div class="fld"><label for="ct">Название</label><input id="ct" placeholder="Например: Вечер настольных игр" maxlength="70"></div>'+
   '<div class="fld"><label for="cg">От какой группы</label><select id="cg">'+S.joined.map(function(id){return '<option value="'+id+'">'+esc(gById(id).n)+'</option>'}).join('')+'</select></div>'+
   '<div class="row" style="margin-top:0"><div class="fld" style="flex:1;min-width:150px"><label for="cd">Дата</label><input id="cd" type="date" value="2026-11-10"></div><div class="fld" style="flex:1;min-width:120px"><label for="cti">Время</label><input id="cti" type="time" value="18:00"></div></div>'+
   '<div class="fld"><label for="cp">Где</label><input id="cp" placeholder="Аудитория или ссылка" maxlength="60"></div><div class="err" id="cerr"></div>'+
   '<div class="mfoot"><button class="btn btn-ghost" data-act="close-all">Отмена</button><button class="btn btn-primary" data-act="compose-ok">Опубликовать</button></div>';
  showModal();
}
async function composeOk(btn){
  var t=$('#ct').value.trim(),p=$('#cp').value.trim(),d=$('#cd').value,ti=$('#cti').value,g=$('#cg').value;
  if(t.length<4){$('#cerr').textContent='Напиши название, хотя бы пару слов.';return}
  if(!d){$('#cerr').textContent='Выбери дату.';return}
  var gid=isNaN(+g)?g:+g;
  try{
    var ev=await busy(btn,function(){return api.createEvent({title:t,groupId:gid,date:d,time:ti,place:p})});
    await api.setGoing(ev.id,true);ev.go=1;EV.push(ev);S.going.push(ev.id);
  }catch(e){$('#cerr').textContent=errText(e);return}
  closeModal();S.ff='all';refresh();toast('Событие опубликовано');
}

/* ---------- profile ---------- */
function rights(){
  var f=full(),a=S.user&&S.user.role==='applicant';
  var lockTxt=a?'После поступления':'После проверки';
  return [['Смотреть ленту и группы',true,'Да'],['Вступать в открытые группы',true,f?'Без лимита':'До '+LIMIT],['Вступать в закрытые группы',f,lockTxt],['Предлагать события',f,lockTxt],['Отмечать «Пойду»',true,'Да']];
}
function renderProfile(){
  var el=$('#v-profile'),u=S.user;
  if(!u){
    el.innerHTML='<div class="card"><div class="cover"></div><div class="pf-head"><span class="ava pf-ava">?</span><div><h1>Твой профиль</h1><p class="hint">Здесь будут твои интересы, группы и статус проверки.</p></div></div></div>'+
     '<div class="empty" style="margin-top:16px"><b>Профиль появится после регистрации</b>Это быстро. Почта, интересы, и всё готово.<div style="margin-top:14px"><button class="btn btn-primary" data-act="reg">Создать профиль</button></div></div>';return}
  var R=ROLES[u.role],ints=u.interests||[];
  var pct=40+(u.verify==='ok'?20:0)+(ints.length>=3?20:0)+(S.joined.length?20:0);
  var vtxt=u.role==='applicant'?'Не требуется':u.verify==='ok'?'Подтверждён':u.verify==='pending'?'На проверке':u.verify==='rejected'?'Отклонён':'Не отправлен';
  var edit=!!S.editInt;
  el.innerHTML='<div class="card"><div class="cover"></div><div class="pf-head"><span class="ava pf-ava">'+esc(initials(u.name))+'</span><div style="flex:1;min-width:200px"><h1>'+esc(u.name)+'</h1>'+
   '<div class="row" style="margin-top:8px"><span class="pill pill-imes">'+R.n+'</span><span class="pill '+(u.verify==='ok'?'pill-ok':u.role==='applicant'?'pill-mute':'pill-warn')+'">'+(u.verify==='ok'?ic('check')+' ':'')+'Студенческий: '+vtxt.toLowerCase()+'</span>'+(u.tg?'<span class="pill pill-stu">'+ic('tg')+' Telegram</span>':'')+'</div></div>'+
   '<button class="btn btn-ghost btn-sm" data-act="logout">Выйти</button></div></div>'+
  '<div class="pgrid"><div class="card pcard"><h3 class="sec-title" style="font-size:17px">Заполненность профиля</h3><div class="bar"><i style="width:'+pct+'%"></i></div><p class="hint" style="margin-top:8px">'+pct+'%'+(pct<100?'. Выбери 3 интереса и вступи в группу, чтобы заполнить на 100%.':'. Всё готово.')+'</p>'+
   '<div class="vlist"><div class="vitem"><span class="dot '+(u.email?'ok':'wait')+'">'+(u.email?ic('check'):ic('clock'))+'</span><span><b>Почта</b><br><span class="hint">'+(u.email?esc(u.email):'Не указана. Вход идёт через Telegram.')+'</span></span></div>'+
   '<div class="vitem"><span class="dot '+(u.role==='applicant'?'':u.verify==='ok'?'ok':'wait')+'">'+(u.verify==='ok'?ic('check'):ic('clock'))+'</span><span><b>Студенческий</b><br><span class="hint">'+(u.role==='applicant'?'Абитуриентам не нужен':u.verify==='ok'?'Проверка пройдена':u.verify==='pending'?'Ждёт проверки. Пока действуют ограничения.':u.verify==='rejected'?'Не подошло. Отправь данные ещё раз.':'Пока не отправлен. До проверки действуют ограничения.')+'</span></span></div></div>'+
   (u.role!=='applicant'&&u.verify!=='ok'&&u.verify!=='pending'?'<button class="btn btn-primary btn-sm" style="margin-top:16px" data-act="verify-open">Отправить студенческий</button>':'')+(api.mode==='mock'&&u.verify==='pending'?'<button class="btn btn-soft btn-sm" style="margin-top:16px" data-act="demo-verify">Демо: имитировать подтверждение</button>':'')+'</div>'+
  '<div class="card pcard"><h3 class="sec-title" style="font-size:17px">Что тебе доступно</h3><table class="acc"><tbody>'+rights().map(function(r){return '<tr><td>'+r[0]+'</td><td>'+(r[1]?'<span class="pill pill-ok">'+r[2]+'</span>':'<span class="pill pill-mute">'+ic('lock')+' '+r[2]+'</span>')+'</td></tr>'}).join('')+'</tbody></table></div></div>'+
  '<div class="card pcard" style="margin-top:16px"><div class="row" style="justify-content:space-between"><h3 class="sec-title" style="font-size:17px">Мои интересы</h3><button class="btn btn-ghost btn-sm" data-act="edit-int">'+(edit?'Готово':'Изменить')+'</button></div><div class="chips-wrap">'+
   (edit?TAGS.map(function(t){var on=ints.indexOf(t.id)>-1;return '<button class="chip'+(on?' mine':'')+'" data-act="int" data-id="'+t.id+'" aria-pressed="'+on+'">'+esc(t.n)+'</button>'}).join(''):(ints.length?ints.map(function(t){return '<span class="chip mine">'+esc(TN[t])+'</span>'}).join(''):'<p class="hint">Пока ничего не выбрано.</p>'))+'</div>'+
   '<div style="margin-top:16px"><button class="btn btn-soft btn-sm" data-act="nav" data-v="graph">'+ic('graph')+' Показать на графе</button></div></div>'+
  '<div class="card pcard" style="margin-top:16px"><h3 class="sec-title" style="font-size:17px">Мои группы</h3><div class="grid" style="margin-top:10px">'+
   (S.joined.length?S.joined.map(function(id,i){return gCard(gById(id),i)}).join(''):'<div class="empty" style="grid-column:1/-1"><b>Групп пока нет</b>Найди ту, где собираются такие же, как ты.<div style="margin-top:14px"><button class="btn btn-primary btn-sm" data-act="nav" data-v="groups">Посмотреть группы</button></div></div>')+'</div></div>';
}

/* ---------- registration wizard ---------- */
var REG=null;
function newReg(){return {step:0,role:null,name:'',email:'',tg:false,ticket:'',file:'',fileObj:null,demo:'',ints:[],join:null}}
function openReg(joinId){
  if(S.user){setView('profile');return}
  if(!REG)REG=newReg();if(joinId)REG.join=joinId;
  renderReg();showModal();
}
function showModal(){$('#modal').classList.add('on');$('#scrim').classList.add('on');closeSheetSoft()}
function closeSheetSoft(){$('#sheet').classList.remove('on')}
function closeModal(){$('#modal').classList.remove('on');if(!$('#sheet').classList.contains('on'))$('#scrim').classList.remove('on')}
function closeAll(){closeModal();closeSheet();$('#scrim').classList.remove('on')}
var STEPS=['Кто ты','Вход','Почта','Студенческий','Интересы'];
function regHead(){
  return '<button class="ibtn xbtn" data-act="close-all" aria-label="Закрыть" style="top:14px">'+ic('x')+'</button><div class="prog">'+STEPS.map(function(s,i){return '<i class="'+(i<REG.step?'d':i===REG.step?'c':'')+'"></i>'}).join('')+'</div><p class="stepname">Шаг '+(REG.step+1)+' из 5 · '+STEPS[REG.step]+'</p>';
}
function renderReg(done){
  var r=REG||{step:5},m=$('#mbox'),h=REG?regHead():'',b='';
  if(r.step===0){
    b='<h2>Кто ты?</h2><p class="hint">От этого зависит, что откроется сразу.</p><div class="rcards">'+Object.keys(ROLES).map(function(k){var o=ROLES[k];return '<button class="rc" data-act="role" data-id="'+k+'" aria-pressed="'+(r.role===k)+'"><span class="ico">'+ic(o.i)+'</span><span><b>'+o.n+'</b><span>'+o.d+'</span></span></button>'}).join('')+'</div><div class="err" id="regerr"></div>'+
     '<div class="mfoot"><span></span><button class="btn btn-primary" data-act="next">Дальше '+ic('arrow')+'</button></div>';
  }else if(r.step===1){
    b='<h2>Как тебя зовут?</h2><p class="hint">Имя увидят в группах. Почта нужна, чтобы подтвердить аккаунт.</p>'+
     '<div class="fld"><label for="rn">Имя и фамилия</label><input id="rn" autocomplete="name" placeholder="Например: Анна Иванова" value="'+esc(r.name)+'"></div>'+
     '<div class="fld"><label for="re">Почта</label><input id="re" type="email" autocomplete="email" inputmode="email" placeholder="name@example.com" value="'+esc(r.email)+'"></div>'+
     '<div class="or">или быстрее</div><div class="alt"><button class="btn btn-ghost" data-act="tg">'+ic('tg')+' Через Telegram'+'</button><button class="btn btn-ghost" disabled title="Скоро">MAX · скоро</button></div>'+
     '<div id="tgbox" style="margin-top:12px"></div>'+'<div class="err" id="regerr"></div>'+
     '<div class="mfoot"><button class="btn btn-ghost" data-act="back">'+ic('back')+' Назад</button><button class="btn btn-primary" data-act="next">Получить код</button></div>';
  }else if(r.step===2){
    b='<h2>Проверь почту</h2><p class="hint">Мы отправили код из 6 цифр на <b>'+esc(r.email)+'</b>. Введи его ниже.</p><div class="otp" id="otp">'+[0,1,2,3,4,5].map(function(i){return '<input inputmode="numeric" maxlength="1" autocomplete="'+(i===0?'one-time-code':'off')+'" data-i="'+i+'" aria-label="Цифра '+(i+1)+'">'}).join('')+'</div><div class="err" id="regerr"></div>'+
     (api.mode==='mock'?'<div class="note"><b>Демо-режим.</b> Письмо не отправляется. Введи код <b>'+esc(r.demo)+'</b>.</div>':'<p class="hint" style="margin-top:14px">Письмо может идти до минуты. Загляни в «Спам», если его нет.</p>')+
     '<div class="mfoot"><button class="btn btn-ghost" data-act="back">'+ic('back')+' Назад</button><button class="link" data-act="resend">Отправить код ещё раз</button></div>';
  }else if(r.step===3){
    if(r.role==='applicant'){
      b='<h2>Студенческий не нужен</h2><p style="margin-top:8px">Абитуриентам достаточно почты. Ты сможешь смотреть всё и вступать в открытые группы, до '+LIMIT+' штук. Когда поступишь, добавь студенческий в профиле.</p>'+
       '<div class="mfoot"><button class="btn btn-ghost" data-act="back">'+ic('back')+' Назад</button><button class="btn btn-primary" data-act="next">Понятно, дальше '+ic('arrow')+'</button></div>';
    }else{
      b='<h2>'+(r.role==='alumni'?'Подтверди, что ты учился в ИМЭС':'Подтверди, что ты студент')+'</h2><p class="hint">Это защищает группы от посторонних. Достаточно номера или фотографии.</p>'+
       '<div class="fld"><label for="rt">Номер студенческого'+(r.role==='alumni'?' или диплома':'')+'</label><input id="rt" placeholder="Номер с карточки" value="'+esc(r.ticket)+'" autocomplete="off"></div>'+
       '<div class="or">или фото</div><label class="drop" for="rf"><span class="ico">'+ic('file')+'</span><span><b id="fname">'+(r.fileObj?esc(r.fileObj.name):'Загрузить фото или PDF')+'</b><br><span class="hint">Нажми и выбери файл</span></span></label><input class="sr" id="rf" type="file" accept="image/jpeg,image/png,application/pdf">'+
       '<div class="note">'+(api.mode==='mock'?'В демо-режиме файл никуда не отправляется. ':'')+'После отправки статус будет «На проверке». До решения действуют те же ограничения, что у абитуриента.</div><div class="err" id="regerr"></div>'+
       '<div class="mfoot"><button class="btn btn-ghost" data-act="back">'+ic('back')+' Назад</button><span class="row"><button class="btn btn-ghost" data-act="skipv">Позже</button><button class="btn btn-primary" data-act="next">Отправить</button></span></div>';
    }
  }else if(r.step===4){
    b='<h2>Что тебе интересно?</h2><p class="hint">Выбери от 1 до 8 тем. Потом их можно поменять.</p><div class="chips-wrap">'+TAGS.map(function(t){var on=r.ints.indexOf(t.id)>-1;return '<button class="chip'+(on?' mine':'')+'" data-act="rint" data-id="'+t.id+'" aria-pressed="'+on+'">'+esc(t.n)+'</button>'}).join('')+'</div>'+
     '<p class="hint" style="margin-top:14px" id="icnt">Выбрано: '+r.ints.length+'</p><div class="err" id="regerr"></div>'+
     '<div class="mfoot"><button class="btn btn-ghost" data-act="back">'+ic('back')+' Назад</button><button class="btn btn-primary" data-act="finish">Готово</button></div>';
  }else{
    var u=S.user,pend=u.verify==='pending';
    var conf='';if(!reduce){var cols=['var(--accent)','var(--blue)','var(--ok)','var(--warn)'];for(var k=0;k<26;k++)conf+='<i style="left:'+Math.round(Math.random()*100)+'%;background:'+cols[k%4]+';animation-delay:'+(Math.random()*.5).toFixed(2)+'s"></i>'}
    m.innerHTML='<button class="ibtn xbtn" data-act="close-all" aria-label="Закрыть" style="top:14px">'+ic('x')+'</button><div class="conf">'+conf+'</div><div style="text-align:center"><div class="done-ic">'+ic('check')+'</div><h2>Добро пожаловать, '+esc(u.name.split(' ')[0])+'!</h2>'+
     '<p style="color:var(--muted)">'+(pend?'Студенческий ушёл на проверку. Пока можно вступать в открытые группы, до '+LIMIT+' штук.':u.role==='applicant'?'Смотри группы и вступай в открытые, до '+LIMIT+' штук.':u.verify==='ok'?'Всё готово.':'Студенческий можно отправить позже в профиле. До проверки можно вступать в открытые группы, до '+LIMIT+' штук.')+'</p></div>'+
     '<div class="mfoot" style="justify-content:center"><button class="btn btn-ghost" data-act="done-go" data-v="profile">Мой профиль</button><button class="btn btn-primary" data-act="done-go" data-v="groups">Найти группы</button></div>';
    return;
  }
  m.innerHTML=h+b;
  var f=$('#rn')||$('#rt');if(f&&!('ontouchstart' in window))f.focus();
  if(r.step===2){var o=$('#otp input');if(o&&!('ontouchstart' in window))o.focus()}
}
function regErr(t){var e=$('#regerr');if(e)e.textContent=t}
async function reloadSession(){var d=await api.init();S.user=d.user;S.joined=d.joined;S.going=d.going}
async function regNext(btn){
  var r=REG;
  if(r.step===0){if(!r.role)return regErr('Выбери один вариант.');r.step=1}
  else if(r.step===1){
    r.name=$('#rn').value.trim();r.email=$('#re').value.trim();
    if(r.name.length<2)return regErr('Напиши имя, чтобы тебя узнавали.');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(r.email))return regErr('Проверь почту. Она должна выглядеть так: name@example.com');
    try{var res=await busy(btn,function(){return api.requestCode({email:r.email,name:r.name,role:r.role})});r.demo=res.demoCode||''}
    catch(e){return regErr(errText(e))}
    r.step=2;
  }
  else if(r.step===3){
    if(r.role!=='applicant'){
      r.ticket=$('#rt').value.trim();
      if(r.ticket.length<5&&!r.fileObj)return regErr('Введи номер (от 5 знаков) или добавь фото.');
      try{S.user=await busy(btn,function(){return api.submitVerification({ticket:r.ticket,file:r.fileObj})})}
      catch(e){return regErr(errText(e))}
      renderNav();
    }
    r.step=4;
  }
  renderReg();
}
async function otpCheck(){
  var v=$$('#otp input').map(function(i){return i.value}).join('');
  if(v.length<6)return;
  try{
    await api.verifyCode({email:REG.email,code:v});
    await reloadSession();renderNav();refresh();
    var returning=S.user&&(S.user.interests.length>0||S.user.verify!=='none');
    if(returning){REG=null;renderReg(true);toast('С возвращением!');return}
    REG.step=3;renderReg();
  }catch(e){
    var o=$('#otp');o.classList.remove('shake');void o.offsetWidth;o.classList.add('shake');regErr(errText(e));
    $$('#otp input').forEach(function(i){i.value=''});$('#otp input').focus();
  }
}
async function tgDone(tg){
  try{
    S.user=await api.telegramLogin(tg,REG.role);await reloadSession();
    REG.tg=true;renderNav();refresh();
    var returning=S.user&&(S.user.interests.length>0||S.user.verify!=='none');
    if(returning){REG=null;renderReg(true);return}
    REG.step=3;renderReg();
  }catch(e){regErr(errText(e))}
}
function tgStart(){
  if(api.mode==='mock'){
    return tgDone({first_name:(REG.name||'Пользователь').split(' ')[0],last_name:(REG.name||'').split(' ').slice(1).join(' ')});
  }
  if(!api.telegramBot){toast('Вход через Telegram ещё не настроен');return}
  var box=$('#tgbox');if(!box||box.firstChild)return;
  window.onTelegramAuth=tgDone;
  var sc=document.createElement('script');sc.async=true;sc.src='https://telegram.org/js/telegram-widget.js?22';
  sc.setAttribute('data-telegram-login',api.telegramBot);sc.setAttribute('data-size','large');sc.setAttribute('data-radius','12');
  sc.setAttribute('data-onauth','onTelegramAuth(user)');sc.setAttribute('data-request-access','write');
  box.appendChild(sc);
}
async function finishReg(btn){
  var r=REG;if(!r.ints.length)return regErr('Выбери хотя бы одну тему.');
  try{
    S.user=await busy(btn,function(){return api.saveProfile({interests:r.ints})});
    var j=r.join;
    if(j&&gById(j)&&S.joined.indexOf(j)<0&&!joinBlock(S.user,gById(j),S.joined.length)){
      await api.join(j);S.joined.push(j);gById(j).m++;
      setTimeout(function(){toast('Вы вступили в группу «'+gById(j).n+'»')},600);
    }
  }catch(e){return regErr(errText(e))}
  REG=null;renderNav();renderReg(true);refresh();
}
function openVerify(){
  if(!S.user)return openReg();
  var m=$('#mbox');
  m.innerHTML='<button class="ibtn xbtn" data-act="close-all" aria-label="Закрыть" style="top:14px">'+ic('x')+'</button><h2>Подтвердить студенческий</h2><p class="hint">Введи номер или добавь фото. Проверяющий посмотрит и откроет полный доступ.</p>'+
   '<div class="fld"><label for="rt">Номер студенческого или диплома</label><input id="rt" placeholder="Номер с карточки" autocomplete="off"></div>'+
   '<div class="or">или фото</div><label class="drop" for="rf"><span class="ico">'+ic('file')+'</span><span><b id="fname">Загрузить фото или PDF</b><br><span class="hint">Нажми и выбери файл</span></span></label><input class="sr" id="rf" type="file" accept="image/jpeg,image/png,application/pdf">'+
   '<div class="err" id="regerr"></div><div class="mfoot"><button class="btn btn-ghost" data-act="close-all">Отмена</button><button class="btn btn-primary" data-act="verify-ok">Отправить</button></div>';
  VER={fileObj:null};showModal();
}
var VER=null;
async function verifyOk(btn){
  var t=$('#rt').value.trim();
  if(t.length<5&&!(VER&&VER.fileObj))return regErr('Введи номер (от 5 знаков) или добавь фото.');
  try{S.user=await busy(btn,function(){return api.submitVerification({ticket:t,file:VER&&VER.fileObj})})}catch(e){return regErr(errText(e))}
  closeModal();refresh();toast('Отправили на проверку');
}

/* ---------- graph ---------- */
var GN=[],GL=[],ADJ={},cv,cx,GW=0,GH=0,raf=0,alpha=1,hover=null,selN=null,drag=null,moved=false,C={},dpr=1;
function readColors(){
  var s=getComputedStyle(document.documentElement),g=function(n){return s.getPropertyValue(n).trim()};
  C={ink:g('--ink'),muted:g('--muted'),line:g('--line'),accent:g('--accent'),blue:g('--blue'),surface:g('--surface'),s2:g('--surface-2'),onA:g('--on-accent'),asoft:g('--accent-soft')};
}
function buildGraph(){
  var old={};GN.forEach(function(n){old[n.id]={x:n.x,y:n.y}});
  GN=[];GL=[];ADJ={};var mine=S.user?S.user.interests||[]:[];
  var deg={};G.forEach(function(g){g.tags.forEach(function(t){deg[t]=(deg[t]||0)+1})});
  var W=GW||600,H=GH||500;
  function pos(id,i,n,rad){var o=old[id];if(o)return o;var a=i/n*Math.PI*2;return {x:W/2+Math.cos(a)*rad*(.6+Math.random()*.4),y:H/2+Math.sin(a)*rad*(.6+Math.random()*.4)}}
  TAGS.forEach(function(t,i){var p=pos('t:'+t.id,i,TAGS.length,Math.min(W,H)*.3);GN.push({id:'t:'+t.id,k:'tag',raw:t.id,label:t.n,r:9+(deg[t.id]||0)*1.8,x:p.x,y:p.y,vx:0,vy:0})});
  G.forEach(function(g,i){var p=pos('g:'+g.id,i,G.length,Math.min(W,H)*.42);GN.push({id:'g:'+g.id,k:'group',raw:g.id,label:g.n,r:7,x:p.x,y:p.y,vx:0,vy:0});g.tags.forEach(function(t){GL.push({a:'g:'+g.id,b:'t:'+t})})});
  if(S.user){var p0=pos('me',0,1,40);GN.push({id:'me',k:'me',label:'Ты',r:15,x:p0.x||W/2,y:p0.y||H/2,vx:0,vy:0});mine.forEach(function(t){GL.push({a:'me',b:'t:'+t})})}
  GN.forEach(function(n){ADJ[n.id]=[]});
  GL.forEach(function(l){ADJ[l.a].push(l.b);ADJ[l.b].push(l.a)});
  alpha=1;
}
function nodeById(id){for(var i=0;i<GN.length;i++)if(GN[i].id===id)return GN[i]}
function tick(){
  var n=GN.length,i,j,a,b,dx,dy,d2,d,f,k=Math.max(1,Math.min(GW,GH)/420);
  for(i=0;i<n;i++){a=GN[i];for(j=i+1;j<n;j++){b=GN[j];dx=a.x-b.x;dy=a.y-b.y;d2=dx*dx+dy*dy+40;if(d2>90000*k*k)continue;f=(a.k==='group'&&b.k==='group'?1500:2600)*k*k/d2*alpha;d=Math.sqrt(d2);dx=dx/d*f;dy=dy/d*f;a.vx+=dx;a.vy+=dy;b.vx-=dx;b.vy-=dy}}
  GL.forEach(function(l){a=nodeById(l.a);b=nodeById(l.b);dx=b.x-a.x;dy=b.y-a.y;d=Math.sqrt(dx*dx+dy*dy)||1;var len=(a.k==='me'?110:78)*k;f=(d-len)*.018;dx=dx/d*f;dy=dy/d*f;a.vx+=dx;a.vy+=dy;b.vx-=dx;b.vy-=dy});
  GN.forEach(function(p){
    p.vx+=(GW/2-p.x)*.0009;p.vy+=(GH/2-p.y)*.0009;
    if(p===drag)return;
    p.vx*=.82;p.vy*=.82;p.x+=p.vx;p.y+=p.vy;
    var m=p.r+22;p.x=Math.max(m,Math.min(GW-m,p.x));p.y=Math.max(m,Math.min(GH-m,p.y));
  });
  alpha=Math.max(reduce?0:.05,alpha*.985);
}
function neighborsOf(id){var s={};s[id]=1;(ADJ[id]||[]).forEach(function(x){s[x]=1});return s}
function draw(){
  if(!cx)return;
  cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,GW,GH);
  var focus=(drag&&drag.id)||(hover&&hover.id)||(selN&&selN),set=focus?neighborsOf(focus):null,mine=S.user?S.user.interests||[]:[];
  GL.forEach(function(l){
    var a=nodeById(l.a),b=nodeById(l.b),on=set&&set[l.a]&&set[l.b]&&(l.a===focus||l.b===focus);
    cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);
    cx.strokeStyle=on?C.accent:C.line;cx.globalAlpha=set&&!on?.35:1;cx.lineWidth=on?2.2:1.2;cx.stroke();
  });
  cx.globalAlpha=1;cx.textAlign='center';cx.textBaseline='middle';
  GN.forEach(function(p){
    var dim=set&&!set[p.id],isMine=p.k==='tag'&&mine.indexOf(p.raw)>-1,isSel=p.id===selN;
    cx.globalAlpha=dim?.28:1;cx.beginPath();cx.arc(p.x,p.y,p.r+(isSel||(hover&&hover.id===p.id)?3:0),0,7);
    if(p.k==='me'){cx.fillStyle=C.accent}
    else if(p.k==='tag'){cx.fillStyle=isMine?C.accent:C.s2}
    else{cx.fillStyle=C.blue}
    cx.fill();
    if(p.k==='tag'){cx.lineWidth=2;cx.strokeStyle=isMine||isSel?C.accent:C.muted;cx.stroke()}
    if(isSel){cx.lineWidth=3;cx.strokeStyle=C.ink;cx.beginPath();cx.arc(p.x,p.y,p.r+6,0,7);cx.stroke()}
    var showLbl=p.k!=='group'||GW>=720||(set&&set[p.id]&&!dim)||isSel;
    if(p.k==='me'){cx.fillStyle=C.onA;cx.font='700 12px Onest,system-ui,sans-serif';cx.fillText('Ты',p.x,p.y+.5)}
    else if(showLbl){
      cx.font=(p.k==='tag'?'600 13px':'500 12px')+' Onest,system-ui,sans-serif';
      var ty=p.y+p.r+13;cx.lineWidth=4;cx.strokeStyle=C.surface;cx.lineJoin='round';cx.strokeText(p.label,p.x,ty);cx.fillStyle=p.k==='tag'?C.ink:C.blue;cx.fillText(p.label,p.x,ty);
    }
  });
  cx.globalAlpha=1;
}
function frame(){
  if(S.view!=='graph'){raf=0;return}
  tick();draw();raf=requestAnimationFrame(frame);
}
function startGraph(){
  cv=$('#gcv');if(!cv)return;cx=cv.getContext('2d');readColors();sizeGraph();
  if(!GN.length||!GN.some(function(n){return n.k==='tag'}))buildGraph();
  if(reduce){alpha=1;for(var i=0;i<260;i++)tick();alpha=0;draw()}
  if(!raf)raf=requestAnimationFrame(frame);
}
function sizeGraph(){
  var w=$('#gwrap');if(!w||!cv)return;var r=w.getBoundingClientRect();
  if(!r.width)return;dpr=Math.min(window.devicePixelRatio||1,2);GW=r.width;GH=r.height;
  cv.width=Math.round(GW*dpr);cv.height=Math.round(GH*dpr);
}
function renderGraphPanel(){
  var el=$('#v-graph');
  if(!$('#gwrap')){
    el.innerHTML='<h1 class="h-title" style="font-size:clamp(26px,4.4vw,40px)">Граф интересов</h1><p class="lead">Серые кружки — темы. Синие — группы. Линия значит «группа про эту тему». Нажми на любой кружок.</p>'+
    '<div class="card gwrap" id="gwrap"><canvas id="gcv" aria-label="Граф связей между интересами и группами"></canvas><div class="legend"><span><i style="background:var(--surface-2);border:2px solid var(--muted)"></i>Тема</span><span><i style="background:var(--blue)"></i>Группа</span><span><i style="background:var(--accent)"></i>Твои интересы</span></div></div>'+
    '<div class="card gpanel" id="gpanel"></div>';
    cv=$('#gcv');bindGraph();
    if('ResizeObserver' in window)new ResizeObserver(function(){sizeGraph();if(S.view==='graph'&&reduce)draw()}).observe($('#gwrap'));
  }
  var p=$('#gpanel');
  if(!selN){
    p.innerHTML='<h3>Как читать граф</h3><p class="hint" style="margin-top:6px">Нажми на тему, и увидишь все группы по ней. Нажми на группу, и откроются её темы. Кружки можно перетаскивать.</p>'+
     (S.user?'':'<div style="margin-top:14px"><button class="btn btn-primary btn-sm" data-act="reg">Создать профиль и увидеть свои связи</button></div>');
  }else{
    var n=nodeById(selN);if(!n){selN=null;return renderGraphPanel()}
    if(n.k==='tag'){
      var gs=G.filter(function(g){return g.tags.indexOf(n.raw)>-1});
      p.innerHTML='<h3>'+esc(n.label)+'</h3><p class="hint" style="margin:4px 0 10px">Групп по этой теме: '+gs.length+'</p><div>'+gs.map(function(g){return '<button class="mini" data-act="group" data-id="'+g.id+'"><span class="emb" style="--h:'+g.h+';width:40px;height:40px;border-radius:12px;font-size:14px">'+esc(g.n[0])+'</span><span><b style="font-weight:600">'+esc(g.n)+'</b><br><span class="hint">'+g.m+' участников</span></span></button>'}).join('')+'</div>';
    }else if(n.k==='group'){
      var g=gById(n.raw);p.innerHTML='<h3>'+esc(g.n)+'</h3><p style="margin:6px 0 12px">'+esc(g.d)+'</p><div class="row"><button class="btn btn-primary btn-sm" data-act="group" data-id="'+g.id+'">Открыть группу</button><button class="btn btn-ghost btn-sm" data-act="clear-sel">Сбросить</button></div>';
    }else{
      p.innerHTML='<h3>Это ты</h3><p class="hint" style="margin-top:6px">Линии ведут к твоим интересам. Через них видно, какие группы тебе ближе всего. Измени интересы в профиле, и граф перестроится.</p>';
    }
  }
}
function hit(x,y){var best=null,bd=1e9;GN.forEach(function(p){var d=Math.hypot(p.x-x,p.y-y);if(d<p.r+8&&d<bd){bd=d;best=p}});return best}
function ptr(e){var r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}}
function bindGraph(){
  cv.addEventListener('pointermove',function(e){var p=ptr(e);if(drag){drag.x=p.x;drag.y=p.y;drag.vx=drag.vy=0;moved=true;alpha=Math.max(alpha,.5);if(reduce)draw();return}
    var h=hit(p.x,p.y);if(h!==hover){hover=h;cv.style.cursor=h?'pointer':'grab';if(reduce)draw()}});
  cv.addEventListener('pointerdown',function(e){var p=ptr(e),h=hit(p.x,p.y);moved=false;if(h){drag=h;try{cv.setPointerCapture(e.pointerId)}catch(x){}cv.style.cursor='grabbing'}});
  function up(){if(drag){if(!moved){selN=selN===drag.id?null:drag.id;renderGraphPanel()}drag=null;if(reduce)draw()}}
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',function(){drag=null});
  cv.addEventListener('pointerleave',function(){if(!drag){hover=null;if(reduce)draw()}});
}

/* ---------- events ---------- */
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-act]');if(!t)return;
  var a=t.dataset.act,id=t.dataset.id;
  switch(a){
   case 'nav':closeAll();setView(t.dataset.v);break;
   case 'theme':var d=isDark();document.documentElement.setAttribute('data-theme',d?'light':'dark');try{localStorage.setItem('svoi-theme',d?'light':'dark')}catch(x){}renderNav();readColors();if(reduce)draw();break;
   case 'reg':openReg();break;
   case 'close-all':closeAll();break;
   case 'ff':S.ff=id;renderFeed();break;
   case 'tag-go':S.gtag=id;S.q='';S.gt='all';setView('groups');renderGroups();break;
   case 'group':closeModal();openSheet(+id);break;
   case 'join':e.stopPropagation();toggleJoin(+id);break;
   case 'going':toggleGoing(isNaN(+id)?id:+id);break;
   case 'gt':S.gt=id;renderGroups();break;
   case 'gtag':S.gtag=id||null;renderGroups();break;
   case 'reset-f':S.q='';S.gt='all';S.gtag=null;renderGroups();break;
   case 'compose':openCompose();break;
   case 'compose-ok':composeOk(t);break;
   case 'verify-open':openVerify();break;
   case 'verify-ok':verifyOk(t);break;
   case 'role':REG.role=id;$$('.rc').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.id===id))});regErr('');break;
   case 'next':regNext(t);break;
   case 'back':REG.step=Math.max(0,REG.step-1);if(REG.step===2)REG.step=1;renderReg();break;
   case 'tg':REG.name=$('#rn').value.trim()||REG.name;tgStart();break;
   case 'resend':api.requestCode({email:REG.email,name:REG.name,role:REG.role}).then(function(res){REG.demo=res.demoCode||'';renderReg();toast('Отправили код ещё раз')}).catch(function(e){regErr(errText(e))});break;
   case 'skipv':REG.ticket='';REG.fileObj=null;REG.step=4;renderReg();break;
   case 'rint':var k=REG.ints.indexOf(id);if(k>-1)REG.ints.splice(k,1);else if(REG.ints.length<8)REG.ints.push(id);else{regErr('Можно выбрать до 8 тем.');break}t.classList.toggle('mine');t.setAttribute('aria-pressed',String(k<0));$('#icnt').textContent='Выбрано: '+REG.ints.length;regErr('');break;
   case 'finish':finishReg(t);break;
   case 'done-go':closeAll();setView(t.dataset.v);if(t.dataset.v==='groups')renderGroups();break;
   case 'logout':api.signOut().then(function(){S.user=null;S.joined=[];S.going=[];S.editInt=false;buildGraph();renderNav();setView('feed');renderFeed();toast('Вы вышли из аккаунта')});break;
   case 'demo-verify':api.demoApprove().then(function(u){S.user=u;refresh();toast('Студенческий подтверждён. Ограничения сняты.')});break;
   case 'edit-int':S.editInt=!S.editInt;renderProfile();break;
   case 'int':var ii=S.user.interests||[],q=ii.indexOf(id);if(q>-1)ii.splice(q,1);else if(ii.length<8)ii.push(id);else{toast('Можно выбрать до 8 тем');break}S.user.interests=ii;renderProfile();buildGraph();api.saveProfile({interests:ii}).catch(function(e){toast(errText(e))});break;
   case 'clear-sel':selN=null;renderGraphPanel();break;
  }
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape')closeAll();
  if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.gc')){e.preventDefault();openSheet(+e.target.dataset.id)}
  if(e.key==='Enter'&&e.target.matches&&e.target.matches('#rn,#re,#rt')){e.preventDefault();regNext()}
  if(e.key==='Backspace'&&e.target.matches&&e.target.matches('#otp input')&&!e.target.value){var p=e.target.previousElementSibling;if(p){p.focus();p.value=''}}
});
document.addEventListener('input',function(e){
  var t=e.target;
  if(t.id==='gq'){S.q=t.value;drawGroupList()}
  if(t.matches&&t.matches('#otp input')){
    t.value=t.value.replace(/\D/g,'').slice(-1);regErr('');
    if(t.value&&t.nextElementSibling)t.nextElementSibling.focus();otpCheck();
  }
});
document.addEventListener('paste',function(e){
  if(e.target.matches&&e.target.matches('#otp input')){
    var s=((e.clipboardData||window.clipboardData).getData('text')||'').replace(/\D/g,'').slice(0,6);
    if(s){e.preventDefault();$$('#otp input').forEach(function(i,k){i.value=s[k]||''});otpCheck()}
  }
});
document.addEventListener('change',function(e){
  if(e.target.id!=='rf')return;
  var f=e.target.files&&e.target.files[0],tgt=REG||VER;
  if(f&&f.size>5*1024*1024){e.target.value='';regErr('Файл больше 5 МБ. Выбери поменьше.');return}
  if(tgt)tgt.fileObj=f||null;
  $('#fname').textContent=f?f.name:'Загрузить фото или PDF';regErr('');
});
window.addEventListener('scroll',function(){$('#hdr').classList.toggle('scrolled',window.scrollY>8)},{passive:true});
window.addEventListener('resize',function(){sizeGraph();if(reduce&&S.view==='graph')draw()});
window.addEventListener('hashchange',function(){var v=location.hash.slice(1);if(['feed','groups','graph','profile'].indexOf(v)>-1&&v!==S.view){setView(v)}});
if(window.matchMedia)try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){renderNav();readColors()})}catch(e){}

/* ---------- init ---------- */
try{var th=localStorage.getItem('svoi-theme');if(th)document.documentElement.setAttribute('data-theme',th)}catch(e){}
var ft=$('#foot');if(ft)ft.textContent=fallback?'Сервер сейчас недоступен. Показаны демонстрационные данные, изменения сохраняются только в этом браузере.':api.mode==='mock'?'Демо-режим: данные хранятся только в этом браузере, письма и проверка студенческого имитируются. Группы и события взяты как примеры.':'Свои в ИМЭС. Данные хранятся в базе проекта.';
renderFeed();renderGroups();renderProfile();renderGraphPanel();buildGraph();
var bt=$('#boot');if(bt)bt.remove();
var h0=location.hash.slice(1);setView(['feed','groups','graph','profile'].indexOf(h0)>-1?h0:'feed');

