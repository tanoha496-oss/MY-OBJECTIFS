/* calendar.js — vue calendrier mensuel */
var calY=new Date().getFullYear(),calM=new Date().getMonth(),selDay=iso(new Date());
function active(g,day){return g.start&&g.due?(g.start<=day&&day<=g.due):g.due?g.due===day:g.start?g.start===day:false}
function renderCal(){var first=new Date(calY,calM,1),off=(first.getDay()+6)%7,dim=new Date(calY,calM+1,0).getDate(),t=iso(new Date());
  var h='<div class="calh"><button class="btn ghost sm" data-act="calnav" data-d="-1" aria-label="Mois précédent">‹</button><h2>'+first.toLocaleDateString("fr-FR",{month:"long",year:"numeric"})+'</h2><button class="btn ghost sm" data-act="calnav" data-d="1" aria-label="Mois suivant">›</button><button class="btn ghost sm" data-act="calnav" data-d="0">Aujourd’hui</button></div><div class="cal">';
  ["lun.","mar.","mer.","jeu.","ven.","sam.","dim."].forEach(function(w){h+='<span class="wd">'+w+"</span>"});
  for(var i=0;i<off;i++)h+="<span></span>";
  for(var d=1;d<=dim;d++){var ds=calY+"-"+("0"+(calM+1)).slice(-2)+"-"+("0"+d).slice(-2);
    var on=goals.filter(function(g){return active(g,ds)});
    h+='<button class="cell'+(ds===t?" today":"")+(ds===selDay?" sel":"")+'" data-act="day" data-day="'+ds+'"><b>'+d+'</b><span class="bars">'+on.slice(0,4).map(function(g){return '<i style="background:var('+(CATS[g.cat]||CATS.autre)[1]+')"></i>'}).join("")+"</span></button>"}
  h+='</div><div class="seld"><h3>'+fmt(selDay)+"</h3>";
  var sel=goals.filter(function(g){return active(g,selDay)});
  h+=sel.length?sel.map(function(g){var c=CATS[g.cat]||CATS.autre;return '<div class="sg" style="--cc:var('+c[1]+')"><b>'+esc(g.title)+'</b><div class="meta"><span class="k">'+c[0]+"</span>"+when(g)+"</div></div>"}).join(""):'<p class="meta">Aucun objectif ce jour-là.</p>';
  h+='<button class="btn sm" data-act="newon" data-day="'+selDay+'">Commencer un objectif ce jour</button></div>';
  $("list").innerHTML=h}
