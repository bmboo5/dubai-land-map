
const DATA=window.__DATA;
const PL=window.__PL;
const T=DATA.totals;
const fmt=n=>n==null?'—':Number(n).toLocaleString('en-US');
const USE={"Residential":["سكني","#7FBF95"],"Commercial":["تجاري","#7FA8D9"],"Industrial":["صناعي","#B3A394"],"Public Facilities":["مرافق عامة","#E9C77B"],"Public Facility":["مرافق عامة","#E9C77B"],"Government Authorities":["جهات حكومية","#B89BD1"],"Open Space":["مساحات خضرا","#A6D49F"],"Utility":["خدمات ومرافق","#BFC5CB"],"Agricultural":["زراعي","#C9DB8E"],"Future Development":["تطوير مستقبلي","#F2AE85"],"Transport":["طرق ومواصلات","#C9CDD6"],"Transportation":["طرق ومواصلات","#C9CDD6"],"Water Body":["مسطحات مائية","#A9CFE6"],"Educational":["تعليمي","#9BB7E0"],"Hospitality":["فندقي","#E59AA0"],"Healthcare":["صحي","#EFA3B8"],"Facilities":["مرافق عامة","#E9C77B"],"Recreational":["ترفيهي","#B6DDB0"],"Unknown":["غير معروف","#D9D9D9"]};
const useColor=t=>(USE[t]||["أخرى","#BDBDBD"])[1];
const useName=t=>(USE[t]||[t||"—"])[0];
DATA.features.forEach((f,i)=>{const p=f.properties;f.id=i;p.useColor=useColor(p.top);p.vacant=p.vacant||0;p.max_h=p.max_h||0;p.ext=Math.min(p.max_h,900)*3;});
document.getElementById('kpis').innerHTML=[
 [fmt(T.plots),'قطعة أرض مسجلة'],[fmt(T.vacant),'قطعة فاضية (تقدير)'],
 [fmt(T.built),'قطعة متبنية'],[fmt(T.registered),'عليها مبنى مسجل (جاهز/تحت الإنشاء)'],[fmt(T.permit),'عليها تصريح ولسه متبنتش'],
 [fmt(T.buildings),'مبنى في سجل البلدية'],[fmt(T.tall100),'مبنى ارتفاعه 100م أو أكتر'],[fmt(T.offplan),'مشروع شغال/جديد في دائرة الأراضي'],[T.yield_med+'%','متوسط العائد الإيجاري'],[fmt(T.offplan_late),'منهم عدّى ميعاد تسليمهم'],[fmt(T.land_psf)+' درهم','متوسط سعر قدم الأرض في دبي']
].map(([a,b])=>`<div class="kpi"><b>${a}</b><span>${b}</span></div>`).join('');

const vmax=Math.max(...DATA.features.map(f=>f.properties.vacant));
const VSTOPS=[-1,'#E2E4E0',0,'#F3F4F1',50,'#FDE3C4',300,'#F7B26A',1000,'#E07A1F',3000,'#9C4A0B'];
const PSTOPS=[-1,'#E6E8E4',0,'#EAF4EE',300,'#BFE3CC',800,'#6FBF8F',1500,'#2F8F5B',3000,'#0B5A33'];
const OSTOPS=[0,'#F3F4F1',1,'#DCE7F5',5,'#A9C4EA',15,'#5E8FD6',40,'#1F4E99'];
const YSTOPS=[-1,'#E6E8E4',0,'#FCEFD9',4,'#F6D08C',6,'#E8A33D',8,'#C46A12',10,'#7A3B05'];
const DSTOPS=[0,'#F3F4F1',1,'#FBD3D0',10,'#F08A80',40,'#D2433A',120,'#8E1B14'];
const HSTOPS=[0,'#EDEBF5',20,'#CFC8E8',60,'#A090D2',150,'#6E54B5',350,'#3E2A86'];
const ESRI='https://server.arcgisonline.com/ArcGIS/rest/services/';
const style={version:8,sources:{c:{type:'geojson',data:DATA},
 street:{type:'raster',tiles:[ESRI+'World_Street_Map/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:19,attribution:'Basemap © Esri, HERE, Garmin, OpenStreetMap contributors'},
 sat:{type:'raster',tiles:[ESRI+'World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:19,attribution:'Imagery © Esri, Maxar, Earthstar Geographics'},
 labels:{type:'raster',tiles:[ESRI+'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:19}},
 layers:[
 {id:'bg',type:'background',paint:{'background-color':'#DCE6EA'}},
 {id:'street',type:'raster',source:'street'},
 {id:'sat',type:'raster',source:'sat',layout:{visibility:'none'}},
 {id:'fill',type:'fill',source:'c',paint:{'fill-color':['get','useColor'],'fill-opacity':0.28}},
 {id:'ext',type:'fill-extrusion',source:'c',layout:{visibility:'none'},paint:{'fill-extrusion-color':['interpolate',['linear'],['get','max_h'],...HSTOPS],'fill-extrusion-height':['get','ext'],'fill-extrusion-opacity':0.92}},
 {id:'line',type:'line',source:'c',paint:{'line-color':['get','useColor'],'line-width':1.4,'line-opacity':0.95}},
 {id:'sel',type:'line',source:'c',filter:['==',['id'],-1],paint:{'line-color':'#0F6E73','line-width':3}},
 {id:'labels',type:'raster',source:'labels',layout:{visibility:'none'}}
]};
const map=new maplibregl.Map({container:'map',style,center:[55.30,25.12],zoom:9.6,attributionControl:{compact:true},maxPitch:70});
map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-left');
let mode='use';
function legend(){
 const L=document.getElementById('legend');
 if(mode==='vacant'){L.innerHTML=`<div class="lbl">عدد القطع الفاضية في المنطقة</div><div class="ramp" style="background:linear-gradient(to left,#F3F4F1,#FDE3C4,#F7B26A,#E07A1F,#9C4A0B)"></div><div class="rampl"><span>0</span><span>50</span><span>300</span><span>1,000</span><span>3,000+</span></div><div class="row"><span class="sw" style="background:#E2E4E0"></span>الحالة مش متاحة (تصاريحها من جهة تانية)</div>`;}
 else if(mode==='use'){const seen=[...new Set(DATA.features.map(f=>f.properties.top).filter(Boolean))];L.innerHTML='<div class="lbl">لون كل منطقة = الاستخدام الغالب فيها</div>'+seen.map(t=>`<div class="row"><span class="sw" style="background:${useColor(t)}"></span>${useName(t)}</div>`).join('')+'<div class="note" style="margin-top:6px">لما تدوس على منطقة هتلاقي تقسيم كل أراضيها حسب الاستخدام. رسم كل قطعة لوحدها مستني بيانات الإحداثيات من الطلب الرسمي.</div>';}
 else if(mode==='price'){L.innerHTML=`<div class="lbl">متوسط سعر قدم الأرض (درهم) — آخر سنتين</div><div class="ramp" style="background:linear-gradient(to left,#EAF4EE,#BFE3CC,#6FBF8F,#2F8F5B,#0B5A33)"></div><div class="rampl"><span>0</span><span>300</span><span>800</span><span>1,500</span><span>3,000+</span></div><div class="row"><span class="sw" style="background:#E6E8E4"></span>مفيش مبيعات أراضي كفاية</div><div class="note" style="margin-top:6px">من صفقات بيع الأراضي المسجلة في دائرة الأراضي (الوسيط). مش تقييم رسمي.</div>`;}
 else if(mode==='offplan'){L.innerHTML=`<div class="lbl">عدد المشاريع الشغالة/الجديدة في المنطقة</div><div class="ramp" style="background:linear-gradient(to left,#F3F4F1,#DCE7F5,#A9C4EA,#5E8FD6,#1F4E99)"></div><div class="rampl"><span>0</span><span>1</span><span>5</span><span>15</span><span>40+</span></div><div class="note" style="margin-top:6px">من سجل مشاريع دائرة الأراضي (المطوّر ونسبة الإنجاز وميعاد التسليم).</div>`;}
 else if(mode==='yield'){L.innerHTML=`<div class="lbl">العائد الإيجاري التقريبي %</div><div class="ramp" style="background:linear-gradient(to left,#FCEFD9,#F6D08C,#E8A33D,#C46A12,#7A3B05)"></div><div class="rampl"><span>0</span><span>4%</span><span>6%</span><span>8%</span><span>10%+</span></div><div class="row"><span class="sw" style="background:#E6E8E4"></span>مفيش داتا كفاية</div><div class="note" style="margin-top:6px">= متوسط الإيجار السنوي للقدم ÷ متوسط سعر بيع القدم في نفس المنطقة. تقريبي.</div>`;}
 else if(mode==='delayed'){L.innerHTML=`<div class="lbl">عدد المشاريع المتأخرة في المنطقة</div><div class="ramp" style="background:linear-gradient(to left,#F3F4F1,#FBD3D0,#F08A80,#D2433A,#8E1B14)"></div><div class="rampl"><span>0</span><span>1</span><span>10</span><span>40</span><span>120+</span></div><div class="note" style="margin-top:6px">متأخر = مشروع بناء لسه مفتوح، وتاريخ التسليم المتوقع عدّى، والمبنى لسه مخلصش. فرص للشراء أو الشراكة.</div>`;}
 else {L.innerHTML=`<div class="lbl">أعلى مبنى في المنطقة (متر)</div><div class="ramp" style="background:linear-gradient(to left,#EDEBF5,#CFC8E8,#A090D2,#6E54B5,#3E2A86)"></div><div class="rampl"><span>0</span><span>20</span><span>60</span><span>150</span><span>350+</span></div><div class="note" style="margin-top:6px">الارتفاع في الـ 3D مكبّر ×3 عشان يبان. اسحب بزرار الماوس اليمين أو بصباعين عشان تلف الخريطة.</div>`;}
}
function setMode(m){
 mode=m;document.querySelectorAll('#modes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===m));
 if(!map.isStyleLoaded())return;
 map.setLayoutProperty('ext','visibility',m==='height'?'visible':'none');
 map.setLayoutProperty('fill','visibility',m==='height'?'none':'visible');
 if(m==='vacant')map.setPaintProperty('fill','fill-color',['interpolate',['linear'],['get','vacant'],...VSTOPS]);
 if(m==='use')map.setPaintProperty('fill','fill-color',['get','useColor']);
 {const op=m==='use'?28:65;const s=document.getElementById('op');s.value=op;map.setPaintProperty('fill','fill-opacity',op/100);}
 map.setPaintProperty('line','line-color',m==='use'?['get','useColor']:'#ffffff');
 if(m==='price')map.setPaintProperty('fill','fill-color',['interpolate',['linear'],['get','land_psf_c'],...PSTOPS]);
 if(m==='offplan')map.setPaintProperty('fill','fill-color',['interpolate',['linear'],['get','offplan'],...OSTOPS]);
 if(m==='yield')map.setPaintProperty('fill','fill-color',['interpolate',['linear'],['coalesce',['get','yield_c'],-1],...YSTOPS]);
 if(m==='delayed')map.setPaintProperty('fill','fill-color',['interpolate',['linear'],['get','delayed'],...DSTOPS]);
 map.easeTo(m==='height'?{pitch:55,bearing:-20,zoom:Math.min(map.getZoom(),10.4),duration:900}:{pitch:0,bearing:0,duration:900});
 legend();
}
document.getElementById('base').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const s=b.dataset.b==='sat';document.querySelectorAll('#base button').forEach(x=>x.setAttribute('aria-pressed',x===b));map.setLayoutProperty('sat','visibility',s?'visible':'none');map.setLayoutProperty('street','visibility',s?'none':'visible');map.setLayoutProperty('labels','visibility',s?'visible':'none');});
document.getElementById('op').addEventListener('input',e=>{const v=e.target.value/100;map.setPaintProperty('fill','fill-opacity',v);map.setPaintProperty('ext','fill-extrusion-opacity',Math.max(v,0.3));});
document.getElementById('modes').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setMode(b.dataset.m);});
function bbox(g){let a=[180,90,-180,-90];const walk=c=>{if(typeof c[0]==='number'){a=[Math.min(a[0],c[0]),Math.min(a[1],c[1]),Math.max(a[2],c[0]),Math.max(a[3],c[1])];}else c.forEach(walk);};walk(g.coordinates);return [[a[0],a[1]],[a[2],a[3]]];}
let show=function(f,fly){
 const p=f.properties;
 map.setFilter('sel',['==',['id'],f.id]);
 if(fly)map.fitBounds(bbox(f.geometry),{padding:60,maxZoom:14,duration:800});
 const tot=p.plots||1;
 const vac=Math.max(p.vacant||0,0), other=Math.max((p.vacant_all||0)-vac,0);
 const seg=(n,c)=>n>0?`<span style="width:${n/tot*100}%;background:${c}"></span>`:'';
 const mix=Object.entries(p.mix||{}).map(([k,v])=>`<div class="row" style="display:flex;align-items:center;gap:8px;font-size:12px;margin:3px 0"><span class="sw" style="background:${useColor(k)}"></span><span style="flex:1">${useName(k)}</span><b>${fmt(v)}</b></div>`).join('');
 document.getElementById('detail').innerHTML=`<h2>${p.ar||''}</h2><div class="en">${p.en} · رقم المنطقة ${p.num}</div>${p.cov===false?'<div class="note" style="background:#FFF6E5;border-radius:8px;padding:8px;margin-bottom:8px">المنطقة دي تصاريح البناء فيها مش من بلدية دبي (زي DDA أو تراخيص أو نخيل)، فحالة فاضية/متبنية مش متاحة هنا.</div>':''}
 <table>
 <tr><td>قطع مسجلة</td><td>${fmt(p.plots)}</td></tr>
 <tr><td>فاضية (تقدير)</td><td style="color:#B4530A">${p.cov===false?'مش متاح':fmt(vac)}</td></tr>
 <tr><td>مساحة الأرض الفاضية</td><td>${p.vac_area?fmt(Math.round(p.vac_area*10.7639))+' قدم²':'—'}</td></tr>
 <tr><td>عليها تصريح ولسه متبنتش</td><td>${fmt(p.permit)}</td></tr>
 <tr><td>متبنية</td><td>${fmt(p.built)}</td></tr>
 <tr><td>عليها مبنى مسجل (جاهز/تحت الإنشاء)</td><td>${fmt(p.registered)}</td></tr>
 <tr><td>مشاريع بناء شغالة</td><td>${fmt(p.open_proj)}</td></tr>
 <tr><td>مشاريع متأخرة عن التسليم</td><td style="color:#B42318">${fmt(p.delayed)}</td></tr>
 <tr><td>سعر قدم الأرض (آخر سنتين)</td><td style="color:#1E6B45">${p.land_psf?fmt(p.land_psf)+' درهم':'—'}${p.land_n?' <span style="font-weight:400;color:#5A6570">('+fmt(p.land_n)+' صفقة)</span>':''}</td></tr>
 <tr><td>سعر القدم لكل العقارات (12 شهر)</td><td>${p.all_psf?fmt(p.all_psf)+' درهم':'—'}</td></tr>
 <tr><td>التغيير عن السنة اللي قبلها</td><td style="color:${p.yoy>0?'#1E6B45':'#B42318'}">${p.yoy==null?'—':(p.yoy>0?'+':'')+p.yoy+'%'}</td></tr>
 <tr><td>صفقات بيع (12 شهر)</td><td>${fmt(p.sales_12m)}</td></tr>
 ${p.rent_psf?`<tr><td>متوسط الإيجار السنوي للقدم</td><td>${fmt(p.rent_psf)} درهم</td></tr>`:''}
 ${p.yield?`<tr><td>العائد الإيجاري</td><td style="color:#B4530A">${p.yield}%</td></tr>`:''}
 ${p.rents?Object.entries(p.rents).map(([k,v])=>`<tr><td>إيجار ${k}</td><td>${fmt(v)} درهم/سنة</td></tr>`).join(''):''}
 ${p.rent_n?`<tr><td>عقود إيجار (آخر 12 شهر)</td><td>${fmt(p.rent_n)}</td></tr>`:''}
 <tr><td>فري هولد</td><td>${fmt(p.freehold)}</td></tr>
 <tr><td>مباني في سجل البلدية</td><td>${fmt(p.n_build)}</td></tr>
 <tr><td>أعلى مبنى</td><td>${p.max_h?Math.round(p.max_h)+' م':'—'}</td></tr>
 <tr><td>مباني 100م أو أكتر</td><td>${fmt(p.tall)}</td></tr>
 </table>
 <div class="bar">${seg(p.built,'#2F7D5B')}${seg(p.registered,'#3B6EA8')}${seg(p.permit,'#F2C14E')}${seg(vac,'#E07A1F')}${seg(other,'#CFCFCF')}</div>
 <div class="note">أخضر متبني · أزرق مبنى مسجل · أصفر تصريح · برتقالي فاضي · رمادي فاضي بس مش للبناء (طرق، حدايق، مرافق)</div>
 ${(p.plist&&p.plist.length)?`<div class="lbl" style="margin-top:12px">مشاريع شغالة/جديدة في المنطقة (${p.offplan})</div>`+p.plist.slice(0,12).map(j=>{const q=PL.PROJ[j];const pc=q[2]==null?0:q[2];return `<div style="padding:8px 0;border-bottom:1px solid #F0F1EE;font-size:13px"><b>${esc(q[0])}</b>${q[7]?' <span style="color:#B42318">⚠️ متأخر</span>':''}<div style="color:#5A6570;font-size:12px">${esc(q[1])}</div><div style="display:flex;align-items:center;gap:8px;margin-top:4px"><div style="flex:1;height:8px;background:#EEF0EC;border-radius:4px;overflow:hidden"><div style="width:${pc}%;height:100%;background:#3B6EA8"></div></div><span style="font-size:12px;font-weight:700">${pc}%</span></div><div style="color:#5A6570;font-size:12px">التسليم: ${q[3]||'—'}${q[4]?' · '+fmt(q[4])+' وحدة':''}${q[5]?' · '+fmt(q[5])+' فيلا':''} · ${q[6]}</div></div>`;}).join('')+(p.plist.length>12?`<div class="note">ومعاهم ${p.plist.length-12} مشروع تاني.</div>`:''):''}<div class="lbl" style="margin-top:12px">أراضي المنطقة حسب الاستخدام</div><div class="bar" style="height:14px">${Object.entries(p.mix||{}).map(([k,v])=>`<span title="${useName(k)}" style="width:${v/tot*100}%;background:${useColor(k)}"></span>`).join('')}</div>${mix||'<div class="empty">مفيش بيانات</div>'}`;
}
legend();
{
 map.on('click','fill',e=>show(DATA.features[e.features[0].id],false));
 map.on('click','ext',e=>show(DATA.features[e.features[0].id],false));
 const pop=new maplibregl.Popup({closeButton:false,closeOnClick:false,offset:8});
 const hov=e=>{const p=e.features[0].properties;map.getCanvas().style.cursor='pointer';pop.setLngLat(e.lngLat).setHTML(`<b>${p.ar}</b><br>${p.en}<br>فاضية: ${fmt(p.vacant)} من ${fmt(p.plots)}`).addTo(map);};
 ['fill','ext'].forEach(l=>{map.on('mousemove',l,hov);map.on('mouseleave',l,()=>{map.getCanvas().style.cursor='';pop.remove();});});
}
const q=document.getElementById('q'),R=document.getElementById('results');
q.addEventListener('input',()=>{const s=q.value.trim().toLowerCase();if(s.length<2){R.innerHTML='';return;}
 const hits=DATA.features.filter(f=>f.properties.en.toLowerCase().includes(s)||(f.properties.ar||'').includes(q.value.trim())||String(f.properties.num)===s).slice(0,8);
 R.innerHTML=hits.length?hits.map(f=>`<button data-i="${f.id}">${f.properties.ar} · ${f.properties.en} <span style="color:#5A6570">(${fmt(f.properties.vacant)} فاضية)</span></button>`).join(''):'<div class="empty" style="padding:8px 0">مفيش نتايج</div>';});
R.addEventListener('click',e=>{const b=e.target.closest('button');if(b){show(DATA.features[+b.dataset.i],true);R.innerHTML='';q.value='';}});

const N=PL.id.length, byId=new Map(), byComm=new Map(), featByNum=new Map();
for(let i=0;i<N;i++){byId.set(PL.id[i],i);const c=PL.c[i];if(!byComm.has(c))byComm.set(c,[]);byComm.get(c).push(i);}
DATA.features.forEach(f=>featByNum.set(f.properties.num,f));
const ST=['فاضية – مفيش عليها أي مبنى أو تصريح','عليها تصريح بناء – لسه متبنتش','متبنية (شهادة إنجاز من البلدية)','عليها مبنى مسجل في دائرة الأراضي (جاهز أو تحت الإنشاء)'], STC=['#B4530A','#9A6B00','#1E6B45','#3B6EA8'];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function plotCard(i){
 const f=featByNum.get(PL.c[i]); const p=f?f.properties:{};
 if(f){map.setFilter('sel',['==',['id'],f.id]);map.fitBounds(bbox(f.geometry),{padding:60,maxZoom:14,duration:800});}
 const d=k=>PL[k+'_d'][PL[k][i]];
 const row=(a,b)=>(b===''||b==null||b===0||b==='0')?'':`<tr><td>${a}</td><td>${b}</td></tr>`;
 const sec=(title,rows)=>{const r=rows.join('');return r?`<div class="lbl" style="margin-top:14px;color:#0F6E73">${title}</div><table>${r}</table>`:'';};
 const sq=PL.a[i], m2=sq?Math.round(sq/10.7639):0;
 const ps=d('ps');
 document.getElementById('detail').innerHTML=`<div class="lbl">أرض</div><h2 style="font-size:26px">${PL.id[i]}</h2>
 <div class="en">${esc(p.ar||'')} · ${esc(p.en||'')}</div>
 <div style="display:inline-block;margin:4px 0 6px;padding:5px 10px;border-radius:999px;font-size:12px;font-weight:700;color:#fff;background:${STC[PL.s[i]]}">${ST[PL.s[i]]}</div>`+
 sec('① التعريف',[row('رقم الأرض (البلدية / DDA)',PL.id[i]),row('رقم الأرض في دائرة الأراضي',esc(PL.ln[i])),row('الرقم الفرعي',PL.lsn[i]),row('رقم البلدية',PL.mn[i]),row('رقم التسجيل المبدئي',esc(PL.pre[i])),row('مقسومة من أرض تانية',PL.sep[i]?'أيوه':'')])+
 sec('② المكان',[row('المنطقة',esc(p.ar||'')+' ('+p.num+')'),row('المشروع الرئيسي',esc(d('mp'))),row('المشروع',esc(d('pr')))])+
 sec('③ الأرض',[row('الاستخدام',`<span class="sw" style="display:inline-block;vertical-align:middle;background:${useColor(d('u'))}"></span> ${esc(useName(d('u')))}`),row('النوع الفرعي',esc(d('pst'))),row('المساحة',sq?fmt(sq)+' قدم² · '+fmt(m2)+' م²':''),row('فري هولد',PL.fh[i]?'أيوه':'لأ')])+
 sec('④ المباني (دائرة الأراضي)',[row('مباني مسجلة',PL.dn[i]),row('منها فلل',PL.dv[i]),row('منها عمارات/أبراج',PL.db[i]),row('شقق',PL.dfl[i]),row('محلات',PL.dsh[i]),row('مكاتب',PL.dof[i]),row('أدوار',PL.dfr[i]),row('مساحة البناء',PL.dbua[i]?fmt(PL.dbua[i])+' قدم²':''),row('حمامات سباحة',PL.dpo[i]),row('أول تسجيل',PL.dfirst[i])])+
 sec('⑤ المباني (بلدية دبي)',[row('عدد المباني',PL.nb[i]),row('نوع المبنى',esc(d('bt'))),row('الاستخدام',esc(d('bu'))),row('الأدوار',esc(d('fl'))||(PL.f[i]||'')),row('أعلى ارتفاع',PL.h[i]?PL.h[i]+' م':''),row('مساحة البناء',PL.bua[i]?fmt(PL.bua[i])+' قدم²':''),row('سنة البناء',PL.yr[i]),row('مبنى أخضر',PL.gr[i]?'أيوه':''),row('مصاعد',PL.lf[i]),row('مواقف',PL.pk[i]),row('نوع الملكية',esc(d('ow'))),row('تاريخ تصريح المبنى',PL.bpd[i]),row('تاريخ إنجاز المبنى',PL.bcd[i])])+
 (PL.pj[i]>=0?(()=>{const q=PL.PROJ[PL.pj[i]];return sec('⑤ب المشروع في دائرة الأراضي',[row('اسم المشروع',esc(q[0])),row('المطوّر',esc(q[1])),row('نسبة الإنجاز',q[2]==null?'':`<span style="color:#3B6EA8">${q[2]}%</span>`),row('التسليم المتوقع',q[3]+(q[7]?' <span style="color:#B42318">(متأخر)</span>':'')),row('الحالة',q[6]),row('عدد الوحدات',q[4]),row('عدد الفلل',q[5]),row('حساب الضمان (Escrow)',esc(q[8]))]);})():'')+
 sec('⑥ مشروع البناء',[row('رقم المشروع',PL.pno[i]),row('عدد مشاريع البناء على الأرض',PL.np[i]),row('الحالة',ps==='Open'?'شغال':(ps==='Closed'?'مقفول':'')),row('تاريخ التصريح',PL.pd[i]),row('بداية الشغل',PL.ws[i]),row('التسليم المتوقع',PL.ec[i]+(PL.dl[i]?' <span style="color:#B42318">(متأخر)</span>':'')),row('تاريخ الإنجاز',PL.pc[i]),row('المقاول',esc(d('ct'))),row('الاستشاري',esc(d('cs')))])+
 sec('⑦ السعر',[row('آخر مرة اتباعت',PL.ls[i]?`<span style="color:#1E6B45">${PL.ls[i]}</span>`:'<span style="color:#5A6570;font-weight:400">مش لاقيين بيع مسجل</span>'),row('سعر آخر بيع',PL.lv[i]?fmt(PL.lv[i]*1000)+' درهم':''),row('سعر القدم في آخر بيع',PL.lp[i]?fmt(PL.lp[i])+' درهم':''),row('عدد مرات البيع',PL.tn[i]),row('سعر قدم الأرض في المنطقة',p.land_psf?fmt(p.land_psf)+' درهم':''),row('قيمة تقديرية',PL.v[i]?fmt(PL.v[i]*1000)+' درهم':'')])+
 `<div class="lbl" style="margin-top:14px;color:#0F6E73">⑧ مكان الأرض بالظبط</div>
 <a href="https://gis.dda.gov.ae/DIS?plotNumber=${PL.id[i]}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;min-height:44px;border-radius:10px;background:#0F6E73;color:#fff;text-decoration:none;font-size:14px">📍 افتح الأرض على خريطة DDA</a>
 <div class="note" style="margin-top:6px">لمناطق DDA. غير كده: تطبيق Dubai REST أو خريطتي برقم الأرض.</div>
 <div class="note" style="margin-top:10px">المصادر: سجل الأراضي والمعاملات (دائرة الأراضي)، المباني والمشاريع (بلدية دبي). آخر بيع متربط بالمساحة بالظبط داخل المنطقة. القيمة التقديرية = المساحة × متوسط سعر القدم.</div>
 <button id="back" style="margin-top:12px;min-height:44px;width:100%;border:1px solid #D5DAD3;background:#fff;border-radius:10px;font:inherit;cursor:pointer">← رجوع لأراضي المنطقة</button>`;
 document.getElementById('back').onclick=()=>{if(f)show(f,false);};
 document.getElementById('side').scrollTo({top:document.getElementById('detail').offsetTop-10,behavior:'smooth'});
}
function findPlot(){const v=parseInt(document.getElementById('pq').value.replace(/\D/g,''),10);const M=document.getElementById('pmsg');
 if(!v){M.textContent='اكتب رقم القطعة (7 أرقام).';return;} const i=byId.get(v);
 if(i===undefined){M.textContent='الرقم ده مش موجود في سجل الأراضي.';return;} M.textContent='';plotCard(i);}
document.getElementById('pgo').onclick=findPlot;
document.getElementById('pq').addEventListener('keydown',e=>{if(e.key==='Enter')findPlot();});
let useF='all', stF='all', sortF='area', pageF=0, qF='';
function oppList(num){
 let arr=(byComm.get(num)||[]).filter(i=>(useF==='all'||PL.u_d[PL.u[i]]===useF)&&(stF==='all'||PL.s[i]===+stF)&&(!qF||String(PL.id[i]).includes(qF)||(PL.pr_d[PL.pr[i]]||'').toLowerCase().includes(qF)));
 if(sortF==='area')arr.sort((a,b)=>PL.a[b]-PL.a[a]); else if(sortF==='sale')arr.sort((a,b)=>(PL.ls[b]||'').localeCompare(PL.ls[a]||'')); else arr.sort((a,b)=>PL.v[b]-PL.v[a]);
 const per=25, pages=Math.max(1,Math.ceil(arr.length/per)); if(pageF>=pages)pageF=0;
 const sel=(id,opts,cur)=>`<select data-k="${id}" style="flex:1;min-height:40px;border:1px solid #D5DAD3;border-radius:10px;font:inherit;font-size:13px;background:#fff">${opts.map(([v,l])=>`<option value="${v}" ${String(cur)===String(v)?'selected':''}>${l}</option>`).join('')}</select>`;
 return `<div class="lbl" style="margin-top:16px;color:#0F6E73">كل أراضي المنطقة (${fmt(arr.length)})</div>
 <input data-k="q" type="search" value="${esc(qF)}" placeholder="دوّر برقم أرض أو اسم مشروع" style="margin-bottom:6px">
 <div style="display:flex;gap:6px;margin-bottom:6px">${sel('u',[['all','كل الاستخدامات'],['Residential','سكني'],['Commercial','تجاري'],['Industrial','صناعي'],['Public Facilities','مرافق'],['Government Authorities','حكومي'],['Agricultural','زراعي']],useF)}${sel('s',[['all','كل الحالات'],['0','فاضية'],['1','عليها تصريح'],['2','متبنية'],['3','عليها مبنى مسجل']],stF)}</div>
 <div style="display:flex;gap:6px;margin-bottom:8px">${sel('o',[['area','الأكبر مساحة'],['sale','آخر بيع الأحدث'],['value','الأعلى قيمة']],sortF)}</div>`+
 (arr.length?arr.slice(pageF*per,pageF*per+per).map(i=>`<button class="opp" data-i="${i}" style="display:flex;width:100%;justify-content:space-between;align-items:center;gap:8px;text-align:right;background:none;border:0;border-bottom:1px solid var(--line);padding:9px 2px;font:inherit;font-size:13px;cursor:pointer;color:var(--ink)"><span style="display:flex;gap:8px;align-items:center"><span class="sw" style="background:${useColor(PL.u_d[PL.u[i]])}"></span><span><b>${PL.id[i]}</b> · ${useName(PL.u_d[PL.u[i]])}<br><span style="color:#5A6570">${fmt(PL.a[i])} قدم² · <span style="color:${STC[PL.s[i]]}">${['فاضية','تصريح','متبنية','مبنى مسجل'][PL.s[i]]}</span></span></span></span><span style="color:#1E6B45;white-space:nowrap;font-size:12px">${PL.ls[i]?'بيع '+PL.ls[i].slice(0,7):''}</span></button>`).join(''):'<div class="empty">مفيش أراضي بالفلتر ده.</div>')+
 (pages>1?`<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><button data-pg="-1" ${pageF===0?'disabled':''} style="min-height:40px;padding:0 14px;border:1px solid #D5DAD3;border-radius:10px;background:#fff;font:inherit;cursor:pointer">السابق</button><span class="note">صفحة ${pageF+1} من ${fmt(pages)}</span><button data-pg="1" ${pageF>=pages-1?'disabled':''} style="min-height:40px;padding:0 14px;border:1px solid #D5DAD3;border-radius:10px;background:#fff;font:inherit;cursor:pointer">التالي</button></div>`:'');
}
const _show=show;
show=function(f,fly){_show(f,fly);useF='all';stF='all';sortF='area';pageF=0;qF='';const D=document.getElementById('detail');D.insertAdjacentHTML('beforeend','<div id="opps">'+oppList(f.properties.num)+'</div>');
 const O=D.querySelector('#opps'), re=()=>{O.innerHTML=oppList(f.properties.num);};
 O.addEventListener('change',e=>{const k=e.target.dataset.k;if(k==='u')useF=e.target.value;if(k==='s')stF=e.target.value;if(k==='o')sortF=e.target.value;pageF=0;re();});
 O.addEventListener('input',e=>{if(e.target.dataset.k==='q'){qF=e.target.value.trim().toLowerCase();pageF=0;const pos=e.target.selectionStart;re();const q=O.querySelector('[data-k=q]');q.focus();q.setSelectionRange(pos,pos);}});
 O.addEventListener('click',e=>{const pg=e.target.closest('[data-pg]');if(pg){pageF+=+pg.dataset.pg;re();return;}const o=e.target.closest('.opp');if(o)plotCard(+o.dataset.i);});};
