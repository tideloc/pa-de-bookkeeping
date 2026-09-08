/* Tideloc live content for P A & D E Bookkeeping. Fetches the portal JSON and
   patches the hours line, office email and announcement bar when the portal
   copy is newer than the version baked into this page. Fails silently. */
(function(){var c=window.__TL;if(!c||!c.url||!window.fetch)return;
var D=["mon","tue","wed","thu","fri","sat","sun"],L={mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday",sat:"Saturday",sun:"Sunday"};
function fmt(t){var p=t.split(":"),h=+p[0],m=+p[1],ap=h>=12?"pm":"am",hh=((h+11)%12)+1;return m?hh+"."+(m<10?"0"+m:m)+ap:hh+ap}
function summary(hours){var by={};hours.forEach(function(h){by[h.day]=h});var runs=[],cur=null;D.forEach(function(d){var h=by[d],k=!h||h.closed?"closed":h.open+"-"+h.close;if(cur&&cur.key===k)cur.days.push(d);else{cur={key:k,days:[d]};runs.push(cur)}});var open=runs.filter(function(r){return r.key!=="closed"});if(!open.length)return"By appointment";return open.map(function(r){var lab=r.days.length>1?L[r.days[0]]+" to "+L[r.days[r.days.length-1]]:L[r.days[0]];var t=r.key.split("-");return lab+", "+fmt(t[0])+" to "+fmt(t[1])}).join("; ")}
function q(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
function apply(d){if(!d||typeof d.version!=="number"||d.version<=(c.version||0))return;
if(d.hours)q('[data-tl="hours.summary"]').forEach(function(e){e.textContent=summary(d.hours)});
if(d.contact&&d.contact.email){q('[data-tl="contact.email"]').forEach(function(e){e.textContent=d.contact.email;e.setAttribute("href","mailto:"+d.contact.email)});q('[data-tl-mailto]').forEach(function(e){e.setAttribute("href","mailto:"+d.contact.email)})}
if(d.announcement){q('[data-tl="announcement"]').forEach(function(e){e.hidden=!(d.announcement.enabled&&d.announcement.text)});q('[data-tl="announcement.text"]').forEach(function(e){e.textContent=d.announcement.text||""});q('[data-tl="announcement.link"]').forEach(function(a){if(d.announcement.link){a.setAttribute("href",d.announcement.link);a.textContent=d.announcement.linkText||"Find out more";a.hidden=false}else a.hidden=true})}}
function run(){fetch(c.url,{mode:"cors",credentials:"omit"}).then(function(r){return r.ok?r.json():null}).then(apply).catch(function(){})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run()})();
