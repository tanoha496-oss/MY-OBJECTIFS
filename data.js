/* data.js — outils, données, sauvegarde et stockage des fichiers (IndexedDB) */
function $(i){return document.getElementById(i)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function dnum(s){var p=s.split("-");return Date.UTC(+p[0],p[1]-1,+p[2])/864e5}
function iso(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
function fmt(d){var p=d.split("-");return new Date(+p[0],p[1]-1,+p[2]).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}
function fmtSize(n){return n>1048576?(n/1048576).toFixed(1)+" Mo":Math.max(1,Math.round(n/1024))+" Ko"}
var CATS={projet:["Projet","--c-projet"],diplome:["Diplôme","--c-diplome"],attest:["Attestation","--c-attest"],prog:["À apprendre","--c-prog"],autre:["Autre","--c-autre"]};
var KEY="objectifs.v1",goals=[],filter="all",editId=null;
function load(){try{var r=localStorage.getItem(KEY);goals=r?JSON.parse(r):[]}catch(e){goals=[]}if(!Array.isArray(goals))goals=[]}
var view="goals",busy=null,db=null,assets=null,ref=null;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(goals))}catch(e){}if(ref){ref.set({items:goals}).catch(function(){})}}
function norm(g){g.files=g.files||[];g.steps=g.steps||[];g.note=g.note||"";g.due=g.due||"";g.start=g.start||"";return g}
var idbP=null;
function idbOpen(){if(!idbP)idbP=new Promise(function(res,rej){var r=indexedDB.open("objectifs-files",1);r.onupgradeneeded=function(){r.result.createObjectStore("f")};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}});return idbP}
function idbDo(mode,fn){return idbOpen().then(function(d){return new Promise(function(res,rej){var tx=d.transaction("f",mode),rq=fn(tx.objectStore("f"));tx.oncomplete=function(){res(rq&&rq.result)};tx.onerror=function(){rej(tx.error)}})})}
var localAssets={
  upload:function(file){var id="f"+Date.now()+Math.random().toString(36).slice(2,7);return idbDo("readwrite",function(s){return s.put(file,id)}).then(function(){return{id:id,url:"",sizeBytes:file.size,contentType:file.type}})},
  delete:function(id){return idbDo("readwrite",function(s){return s.delete(id)})},
  get:function(id){return idbDo("readonly",function(s){return s.get(id)})}};
function b2d(b){return new Promise(function(r){var fr=new FileReader();fr.onload=function(){r(fr.result)};fr.readAsDataURL(b)})}
async function restore(a){for(var i=0;i<a.length;i++){var fl=a[i].files||[];for(var j=0;j<fl.length;j++){var f=fl[j];if(f.data){try{var b=await (await fetch(f.data)).blob();await idbDo("readwrite",function(s){return s.put(b,f.id)})}catch(e){}delete f.data}}}goals=a.map(norm);persist();render()}
$("exp").onclick=async function(){var items=JSON.parse(JSON.stringify(goals));
  for(var i=0;i<items.length;i++)for(var j=0;j<items[i].files.length;j++){var f=items[i].files[j];try{var b=await localAssets.get(f.id);if(b)f.data=await b2d(b)}catch(e){}}
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify({v:2,date:new Date().toISOString(),items:items})],{type:"application/json"}));
  a.download="mes-objectifs-"+iso(new Date())+".json";document.body.appendChild(a);a.click();a.remove()};
$("imp").onclick=function(){$("file").click()};
$("file").onchange=function(){var inp=this,f=inp.files[0];if(!f)return;
  f.text().then(function(t){try{var d=JSON.parse(t),a=Array.isArray(d)?d:d.items;if(!Array.isArray(a))throw 0;
    if(!confirm("Remplacer tes "+goals.length+" objectifs par ceux du fichier ("+a.length+") ?"))return;
    restore(a)}catch(e){alert("Fichier invalide : choisis une sauvegarde exportée par l’app.")}});inp.value=""};
