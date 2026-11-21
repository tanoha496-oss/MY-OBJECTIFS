/* app.js — affichage, formulaire, actions et démarrage */
function pct(g){if(g.steps.length)return Math.round(g.steps.filter(function(s){return s.d}).length/g.steps.length*100);return g.done?100:0}
function fin(g){return pct(g)===100}
function late(g){if(!g.due||fin(g))return false;var t=new Date();t.setHours(0,0,0,0);var p=g.due.split("-");return new Date(+p[0],p[1]-1,+p[2])<t}
function ring(p,c){var r=21,l=2*Math.PI*r;return '<svg class="ring" viewBox="0 0 52 52" role="img" aria-label="'+p+' % accompli"><circle cx="26" cy="26" r="'+r+'" fill="none" stroke="var(--line)" stroke-width="5"/><circle cx="26" cy="26" r="'+r+'" fill="none" stroke="var('+c+')" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(l*p/100)+' '+l+'" transform="rotate(-90 26 26)"/><text x="26" y="30" text-anchor="middle">'+p+'</text></svg>'}
function when(g){if(!g.due&&!g.start)return"";var s=" — ";
  if(g.start&&g.due)s+="Du "+fmt(g.start)+" au "+fmt(g.due)+" ("+(dnum(g.due)-dnum(g.start)+1)+" jours)";
  else if(g.due)s+="Avant le "+fmt(g.due);else s+="À partir du "+fmt(g.start);
  if(g.due&&!fin(g)){var r=dnum(g.due)-dnum(iso(new Date()));s+=r<0?' <span class="late">· en retard de '+(-r)+" j</span>":" · "+(r===0?"dernier jour":r+" j restants")}
  return s}
function filesHtml(g){var h='<div class="files"><div class="fh">Pièces jointes</div>';
  g.files.forEach(function(f,i){h+='<div class="file">'+fileLink(f)+'<span class="meta">'+fmtSize(f.size)+'</span><button class="x" aria-label="Supprimer le fichier" data-act="rmfile" data-id="'+g.id+'" data-i="'+i+'">×</button></div>'});
  if(assets)h+='<label class="btn ghost sm up">'+(busy===g.id?"Envoi en cours…":"Joindre un PDF ou une image")+'<input type="file" hidden multiple accept="application/pdf,image/*" data-up="'+g.id+'"></label>';
  else if(!g.files.length)h+='<div class="meta">L’envoi de fichiers n’est pas disponible dans cette vue.</div>';
  return h+"</div>"}
function fileLink(f){return f.url?'<a href="'+esc(f.url)+'" target="_blank" rel="noopener">'+esc(f.name)+'</a>':'<a href="#" data-act="openfile" data-fid="'+esc(f.id)+'">'+esc(f.name)+'</a>'}
function openLocal(id){localAssets.get(id).then(function(b){if(!b){alert("Fichier introuvable sur cet appareil. Restaure une sauvegarde complète.");return}var u=URL.createObjectURL(b);if(!window.open(u,"_blank"))location.href=u}).catch(function(){alert("Impossible d’ouvrir ce fichier.")})}
function render(){
  var done=goals.filter(fin).length,tot=goals.length;
  $("sub").textContent=tot?done+" objectif"+(done>1?"s":"")+" atteint"+(done>1?"s":"")+" sur "+tot+".":"Note ici tout ce que tu veux accomplir : projets, diplômes, attestations, formations.";
  var sh="",lg="";
  Object.keys(CATS).forEach(function(k){var n=goals.filter(function(g){return g.cat===k}).length;if(!n)return;
    var d=goals.filter(function(g){return g.cat===k&&fin(g)}).length;
    sh+='<i style="width:'+(n/tot*100)+'%;background:var('+CATS[k][1]+')"></i>';
    lg+='<span><b style="color:var('+CATS[k][1]+')">'+CATS[k][0]+'</b> '+d+"/"+n+"</span>"});
  $("strip").innerHTML=sh;$("legend").innerHTML=lg;
  var fh='<button class="chip" aria-pressed="'+(filter==="all")+'" data-f="all">Tous</button>'+
    '<button class="chip" aria-pressed="'+(filter==="open")+'" data-f="open">En cours</button>'+
    '<button class="chip" aria-pressed="'+(filter==="done")+'" data-f="done">Terminés</button>';
  Object.keys(CATS).forEach(function(k){fh+='<button class="chip" aria-pressed="'+(filter===k)+'" data-f="'+k+'">'+CATS[k][0]+"</button>"});
  $("filters").innerHTML=view==="goals"?fh:"";
  if(view==="cal"){renderCal();return}
  if(view==="docs"){renderDocs();return}
  var q=($("q").value||"").toLowerCase();
  var vis=goals.filter(function(g){return (!q||(g.title+" "+g.note).toLowerCase().indexOf(q)>-1)&&(filter==="all"||(filter==="open"&&!fin(g))||(filter==="done"&&fin(g))||g.cat===filter)});
  if(!vis.length){$("list").innerHTML='<div class="empty">'+(tot?"Aucun objectif dans cette vue.":"Rien pour l’instant. Ajoute ton premier objectif pour commencer.")+"</div>";return}
  $("list").innerHTML=vis.map(function(g){
    var c=CATS[g.cat]||CATS.autre,p=pct(g);
    var h='<div class="goal'+(fin(g)?" fin":"")+'" style="--cc:var('+c[1]+')"><div class="top">'+ring(p,c[1])+
      '<div class="tt"><h3>'+esc(g.title)+'</h3><div class="meta"><span class="k">'+c[0]+"</span>"+
      when(g)+"</div></div></div>";
    if(g.steps.length){h+='<ul class="steps">'+g.steps.map(function(s,i){return '<li class="'+(s.d?"d":"")+'"><input type="checkbox" aria-label="Étape faite" data-act="tick" data-id="'+g.id+'" data-i="'+i+'"'+(s.d?" checked":"")+"><span>"+esc(s.t)+'</span><button class="x" aria-label="Supprimer l’étape" data-act="rmstep" data-id="'+g.id+'" data-i="'+i+'">×</button></li>'}).join("")+"</ul>"}
    h+='<div class="add"><input placeholder="Ajouter une étape" aria-label="Nouvelle étape" data-step="'+g.id+'"><button class="btn ghost sm" data-act="addstep" data-id="'+g.id+'">Ajouter</button></div>';
    if(g.note)h+='<p class="note">'+esc(g.note)+"</p>";
    h+=filesHtml(g);
    h+='<div class="acts">'+(!g.steps.length?'<button class="btn sm" data-act="toggle" data-id="'+g.id+'">'+(g.done?"Rouvrir":(g.cat==="diplome"||g.cat==="attest"?"Marquer obtenu":"Marquer terminé"))+"</button>":"")+
      '<button class="btn ghost sm" data-act="edit" data-id="'+g.id+'">Modifier</button><button class="btn ghost sm" data-act="del" data-id="'+g.id+'">Supprimer</button></div></div>';
    return h}).join("");
}
function find(id){return goals.filter(function(g){return g.id===id})[0]}
function openDlg(g){editId=g?g.id:null;$("dt").textContent=g?"Modifier l’objectif":"Nouvel objectif";
  $("f-title").value=g?g.title:"";$("f-cat").value=g?g.cat:"projet";$("f-due").value=g?g.due:"";$("f-start").value=g?g.start||"":"";$("f-note").value=g?g.note:"";$("dlg").showModal();$("f-title").focus()}
function addStep(id){var inp=document.querySelector('[data-step="'+id+'"]'),v=inp.value.trim();if(!v)return;find(id).steps.push({t:v,d:false});persist();render()}
$("f-cat").innerHTML=Object.keys(CATS).map(function(k){return '<option value="'+k+'">'+CATS[k][0]+"</option>"}).join("");
$("new").onclick=function(){openDlg(null)};
$("cancel").onclick=function(){$("dlg").close()};
$("save").onclick=function(){var t=$("f-title").value.trim();if(!t){$("f-title").focus();return}
  if($("f-start").value&&$("f-due").value&&$("f-start").value>$("f-due").value){alert("La date de début doit précéder la date de fin.");return}
  if(editId){var g=find(editId);g.title=t;g.cat=$("f-cat").value;g.due=$("f-due").value;g.start=$("f-start").value;g.note=$("f-note").value.trim()}
  else goals.unshift({id:"g"+Date.now(),title:t,cat:$("f-cat").value,start:$("f-start").value,due:$("f-due").value,note:$("f-note").value.trim(),steps:[],files:[],done:false});
  persist();$("dlg").close();render()};
$("filters").onclick=function(e){var f=e.target.getAttribute("data-f");if(f){filter=f;render()}};
$("list").onclick=function(e){var a=e.target.getAttribute("data-act");if(!a)return;var id=e.target.getAttribute("data-id"),g=find(id),i=+e.target.getAttribute("data-i");
  if(a==="openfile"){e.preventDefault();openLocal(e.target.getAttribute("data-fid"));return}
  else if(a==="calnav"){var dd=+e.target.getAttribute("data-d");if(dd===0){var n=new Date();calY=n.getFullYear();calM=n.getMonth();selDay=iso(n)}else{calM+=dd;if(calM<0){calM=11;calY--}if(calM>11){calM=0;calY++}}render();return}
  else if(a==="day"){selDay=e.target.getAttribute("data-day");render();return}
  else if(a==="newon"){openDlg(null);$("f-start").value=e.target.getAttribute("data-day");return}
  else if(a==="tick"){g.steps[i].d=e.target.checked}
  else if(a==="rmstep"){g.steps.splice(i,1)}
  else if(a==="addstep"){addStep(id);return}
  else if(a==="toggle"){g.done=!g.done}
  else if(a==="edit"){openDlg(g);return}
  else if(a==="rmfile"){var f=g.files[i];if(!confirm("Supprimer « "+f.name+" » ?"))return;g.files.splice(i,1);if(assets)assets.delete(f.id).catch(function(){})}
  else if(a==="del"){if(!confirm("Supprimer cet objectif ?"))return;goals=goals.filter(function(x){return x.id!==id})}
  persist();render()};
$("list").onkeydown=function(e){if(e.key==="Enter"&&e.target.getAttribute("data-step")){addStep(e.target.getAttribute("data-step"))}};
function setView(v){view=v;["goals","cal","docs"].forEach(function(k){$("t-"+k).setAttribute("aria-pressed",v===k)});render()}
$("t-goals").onclick=function(){setView("goals")};$("t-cal").onclick=function(){setView("cal")};$("t-docs").onclick=function(){setView("docs")};
$("q").oninput=render;
$("list").onchange=function(e){var id=e.target.getAttribute("data-up");if(id&&e.target.files.length)upload(id,Array.prototype.slice.call(e.target.files))};
async function upload(id,fl){var g=find(id);busy=id;render();
  for(var k=0;k<fl.length;k++){var f=fl[k];
    if(f.size>20*1048576){alert("« "+f.name+" » dépasse 20 Mo.");continue}
    try{var r=await assets.upload(f);g.files.push({id:r.id,url:r.url,name:f.name,size:f.size,date:new Date().toISOString().slice(0,10)})}
    catch(e){alert("L’envoi de « "+f.name+" » a échoué. Vérifie le format (PDF ou image).")}}
  busy=null;persist();render()}
function renderDocs(){var q=($("q").value||"").toLowerCase(),rows=[];
  goals.forEach(function(g){g.files.forEach(function(f){if(!q||(f.name+" "+g.title).toLowerCase().indexOf(q)>-1)rows.push({f:f,g:g})})});
  rows.sort(function(a,b){return (b.f.date||"")>(a.f.date||"")?1:-1});
  if(!rows.length){$("list").innerHTML='<div class="empty">Aucun document. Ouvre un objectif et joins-y tes attestations en PDF.</div>';return}
  $("list").innerHTML=rows.map(function(r){var c=CATS[r.g.cat]||CATS.autre;return '<div class="goal" style="--cc:var('+c[1]+')"><div class="file">'+fileLink(r.f)+'<span class="meta">'+fmtSize(r.f.size)+'</span></div><div class="meta"><span class="k">'+c[0]+'</span> — '+esc(r.g.title)+(r.f.date?" — ajouté le "+fmt(r.f.date):"")+'</div></div>'}).join("")}
function init(){assets=localAssets;$("st").textContent="Enregistré dans ce navigateur";render()}
load();goals.forEach(norm);render();init();
