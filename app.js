import * as THREE from "https://esm.sh/three@0.161.0";
import {OrbitControls} from "https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";

const TAU=Math.PI*2;
const zodiac=[
 ["♈","حمل","قوچ","آغاز/انرژی"],["♉","ثور","گاو","ثبات/زمین"],["♊","جوزا","دوپیکر","دوگانگی/ارتباط"],["♋","سرطان","خرچنگ","پناه/رشد"],["♌","اسد","شیر","تابش/بیان"],["♍","سنبله","دوشیزه","نظم/دقت"],["♎","میزان","ترازو","تعادل"],["♏","عقرب","کژدم","دگرگونی"],["♐","قوس","کماندار","حرکت"],["♑","جدی","بز","استقامت"],["♒","دلو","آبریز","جریان"],["♓","حوت","ماهی","پیوستگی"]
];
const sef=[
 ["۱","کِتِر","تاج","مبدأ نمادین چرخه"],["۲","حُخما","حکمت","ایده و امکان"],["۳","بیناه","فهم","ساختار و درک"],["۴","حِسِد","رحمت","گسترش و بخشش"],["۵","گِووراه","شدت","مرز و نظم"],["۶","تیفِرِت","زیبایی","مرکز و تعادل"],["۷","نِتسَح","پیروزی","حرکت و استمرار"],["۸","هود","شکوه","بیان و نشانه"],["۹","یسود","بنیاد","پیوند و انتقال"],["۱۰","ملکوت","پادشاهی","سطح مادی چرخه"]
];
const process=[
 ["نور خورشید","پرتوی نمادین وارد جهان می‌شود."],["انرژی کیهانی","انرژی به حلقهٔ زودیاک می‌رسد."],["درخت حیات","نور از گره‌های درخت عبور می‌کند."],["بذر","انرژی به زمین و بذر می‌رسد."],["جوانه","بذر به حیات گیاهی تبدیل می‌شود."],["گیاه","رشد و گسترش در زمین دیده می‌شود."],["درخت","حیات بالغ و بارده می‌شود."],["گل و میوه","مرحلهٔ زایش و تولید نمایان می‌شود."],["موجود زنده","موجودات در محیط ظاهر و حرکت می‌کنند."],["تولید مثل","یک نسل نمادین نسل بعد را پدید می‌آورد."],["بازگشت","مواد و انرژی به چرخه برمی‌گردند."]
];

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x020a18);
scene.fog=new THREE.FogExp2(0x061526,.012);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,200);
camera.position.set(0,10,27);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
document.getElementById("canvasWrap").appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.055;controls.minDistance=8;controls.maxDistance=55;controls.maxPolarAngle=Math.PI*.47;controls.target.set(0,5,0);

const ambient=new THREE.HemisphereLight(0x8fd8ff,0x17351d,2.2);scene.add(ambient);
const sunLight=new THREE.PointLight(0xffc44d,220,70,2);sunLight.position.set(0,18,2);sunLight.castShadow=true;scene.add(sunLight);
const fill=new THREE.PointLight(0x4aa8ff,65,50,2);fill.position.set(-14,7,12);scene.add(fill);

function mat(color,rough=.55,metal=.05,em=0){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,emissive:em?color:0,emissiveIntensity:em})}
const gold=mat(0xffc83d,.28,.65,.4), green=mat(0x2e8b57), leaf=mat(0x62bd4f), water=mat(0x1ea9df,.18,.1,.15), soil=mat(0x63402a), stone=mat(0x667582), white=mat(0xfff1cf), flower=mat(0xf06d9a,.35,0,.15);

const world=new THREE.Group();scene.add(world);
const ground=new THREE.Mesh(new THREE.CylinderGeometry(13,13,1.2,96),mat(0x4b9c48));ground.position.y=-.6;ground.receiveShadow=true;world.add(ground);
const soilDisk=new THREE.Mesh(new THREE.CylinderGeometry(9.4,9.4,.35,96),soil);soilDisk.position.y=.05;world.add(soilDisk);
const waterRing=new THREE.Mesh(new THREE.TorusGeometry(10.3,.75,16,96),water);waterRing.rotation.x=Math.PI/2;waterRing.position.y=.18;world.add(waterRing);

const starGroup=new THREE.Group();scene.add(starGroup);
for(let i=0;i<180;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.035+Math.random()*.06,6,6),new THREE.MeshBasicMaterial({color:i%4===0?0xffd96b:0xa8d9ff}));const a=Math.random()*TAU,r=25+Math.random()*45;p.position.set(Math.cos(a)*r,8+Math.random()*35,Math.sin(a)*r);starGroup.add(p)}

function glowSphere(r,color,intensity=1){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,32),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.25,metalness:.2}));g.add(m);const l=new THREE.PointLight(color,5*r,8*r);g.add(l);return g}
const sun=glowSphere(2.2,0xffb71b,1.8);sun.position.set(0,20,0);scene.add(sun);
const halo=new THREE.Mesh(new THREE.TorusGeometry(3.2,.055,8,128),new THREE.MeshBasicMaterial({color:0xffd85a}));halo.position.copy(sun.position);scene.add(halo);

const zodiacGroup=new THREE.Group();zodiacGroup.position.set(0,20,0);scene.add(zodiacGroup);
const ring=new THREE.Mesh(new THREE.TorusGeometry(7.2,.11,12,128),gold);ring.rotation.x=Math.PI/2;zodiacGroup.add(ring);
const ring2=new THREE.Mesh(new THREE.TorusGeometry(9.1,.06,10,128),new THREE.MeshBasicMaterial({color:0x49a8ff}));ring2.rotation.x=Math.PI/2;zodiacGroup.add(ring2);
const zodiacObjects=[];
function makeTextSprite(text,color="#ffd34e",scale=1){const c=document.createElement("canvas"),x=c.getContext("2d");c.width=256;c.height=96;x.clearRect(0,0,c.width,c.height);x.font="800 30px Vazirmatn, sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillStyle=color;x.shadowColor="#000";x.shadowBlur=8;x.fillText(text,128,45);const t=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(2.5*scale,.9*scale,1);return s}
zodiac.forEach((z,i)=>{const a=i/12*TAU+Math.PI/2;const g=new THREE.Group();g.position.set(Math.cos(a)*8.1,0,Math.sin(a)*8.1);g.userData={type:"zodiac",index:i,name:z[1],animal:z[2],meaning:z[3]};const badge=glowSphere(.62,0x1d6fa8,.55);g.add(badge);const tx=makeTextSprite(z[0]+"  "+z[1],i%2? "#ffe37a":"#fff");tx.position.y=1.05;g.add(tx);zodiacGroup.add(g);zodiacObjects.push(g)});

const tree=new THREE.Group();tree.position.set(0,4.4,0);scene.add(tree);
const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.65,.95,7,14),mat(0x754629));trunk.position.y=1.2;trunk.castShadow=true;tree.add(trunk);
const roots=[];for(let i=0;i<8;i++){const a=i/8*TAU;const r=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,3,8),mat(0x754629));r.position.set(Math.cos(a)*1.1,-1.7,Math.sin(a)*1.1);r.rotation.z=Math.cos(a)*.9;r.rotation.x=Math.sin(a)*.9;tree.add(r)}
for(let i=0;i<34;i++){const leafMesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.65+Math.random()*.65,1),leaf);leafMesh.position.set((Math.random()-.5)*5,3+Math.random()*4,(Math.random()-.5)*4);leafMesh.scale.y=.75;leafMesh.castShadow=true;tree.add(leafMesh)}
const fruitGroup=new THREE.Group();tree.add(fruitGroup);for(let i=0;i<14;i++){const f=glowSphere(.12,i%3===0?0xf05b43:0xf7c64b,.3);f.position.set((Math.random()-.5)*3.8,3+Math.random()*3,(Math.random()-.5)*3.2);fruitGroup.add(f)}

const treeNodes=[];const nodePos=[ [0,8.4,0],[-3,6.7,0],[3,6.7,0],[-4.3,4.4,0],[4.3,4.4,0],[0,4.2,0],[-4.2,2.1,0],[4.2,2.1,0],[0,1.5,0],[0,-.3,0] ];
sef.forEach((s,i)=>{const n=glowSphere(.62,[0xffd447,0x55b9ff,0x8d7bff,0x37c98b,0xf04e63,0xffc22e,0x41d6a0,0x9b6cff,0x5d7dff,0x8d5b37][i],.7);n.position.set(...nodePos[i]);n.userData={type:"sefirah",index:i,name:s[1],meaning:s[2],text:s[3]};tree.add(n);treeNodes.push(n)});
const edges=[];[[0,1],[0,2],[1,2],[1,3],[2,4],[3,4],[3,5],[4,5],[3,6],[5,6],[5,7],[4,7],[6,8],[7,8],[8,9]].forEach(([a,b])=>{const A=new THREE.Vector3(...nodePos[a]),B=new THREE.Vector3(...nodePos[b]);const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([A,B]),new THREE.LineBasicMaterial({color:0xffd34e,transparent:true,opacity:.6}));tree.add(line);edges.push(line)});

const pillars=[];[[-5,0xffc53d],[0,0x43b9ff],[5,0xff4657]].forEach(([x,c])=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.32,.45,7.5,16),mat(c,.3,.45,.35));p.position.set(x,3,2);p.castShadow=true;tree.add(p);pillars.push(p)});

const creatureGroup=new THREE.Group();world.add(creatureGroup);
const creatures=[];
function creature(color=0xb47a46,scale=1){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.SphereGeometry(.48,12,10),mat(color));body.scale.set(1.35,.8,.75);g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.3,12,10),mat(color));head.position.z=.55;head.position.y=.12;g.add(head);for(const x of [-.3,.3]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.55,8),mat(color));leg.position.set(x,-.5,.1);g.add(leg)}return g}
for(let i=0;i<18;i++){const c=creature([0xb77b45,0xd6c18b,0x7c9b54,0x9b6d4c][i%4],.8);c.position.set((Math.random()-.5)*16,.65,(Math.random()-.5)*9);c.userData={type:"life",index:i};creatureGroup.add(c);creatures.push(c)}

const flowers=new THREE.Group();world.add(flowers);for(let i=0;i<55;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(.12,7,7),flower);f.position.set((Math.random()-.5)*18,.35,(Math.random()-.5)*12);flowers.add(f)}
const energy=new THREE.Group();scene.add(energy);for(let i=0;i<24;i++){const p=glowSphere(.08,0xffe66b,1);p.userData.t=i/24;energy.add(p)}
const cycleStages=[...process];let stage=0,cycle=0,running=true,last=performance.now(),stageClock=0,speed=1;
const focusName=document.getElementById("focusName"),focusText=document.getElementById("focusText"),focusIcon=document.getElementById("focusIcon"),stageNo=document.getElementById("stageNo"),bar=document.getElementById("bar"),chapter=document.getElementById("chapter"),chapterSub=document.getElementById("chapterSub"),pause=document.getElementById("pause"),reset=document.getElementById("reset"),speedInput=document.getElementById("speed"),speedText=document.getElementById("speedText"),detail=document.getElementById("detail"),detailTitle=document.getElementById("detailTitle"),detailBody=document.getElementById("detailBody"),detailFacts=document.getElementById("detailFacts");

const list=document.getElementById("zodiacList");zodiac.forEach((z,i)=>{const el=document.createElement("div");el.className="zitem";el.innerHTML='<span class="zi">'+z[0]+'</span><span>'+z[1]+' · '+z[2]+'</span>';el.onclick=()=>focusZodiac(i,true);list.appendChild(el)});
function faToDigits(s){return String(s).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d])}
function setStage(){const p=cycleStages[stage];chapter.textContent=p[0];chapterSub.textContent=p[1];focusName.textContent=p[0];focusText.textContent=p[1]+" این یک توصیف نمادین در همین پروژه است، نه ادعای علمی.";stageNo.textContent=faToDigits((stage+1)+" / "+cycleStages.length);bar.style.width=((stage+1)/cycleStages.length*100)+"%";zodiacObjects.forEach((o,i)=>o.scale.setScalar(i===stage%12?1.35:1));treeNodes.forEach((n,i)=>n.scale.setScalar(i===stage%10?1.45:1));}
function focusZodiac(i,open=false){const z=zodiac[i];const g=zodiacObjects[i];const wp=new THREE.Vector3();g.getWorldPosition(wp);controls.target.lerp(wp,.75);camera.position.lerp(wp.clone().add(new THREE.Vector3(0,3,6)),.55);focusName.textContent=z[0]+" "+z[1];focusIcon.textContent=z[0];focusText.textContent="موجود نمادین: "+z[2]+" · "+z[3];document.querySelectorAll(".zitem").forEach((e,j)=>e.classList.toggle("active",i===j));if(open)openDetail(z[1],z[2]+" — "+z[3],["جایگاه: حلقهٔ ۱۲ نشانه","نقش: موجود/نماد زودیاکی","اتصال: خورشید → زودیاک → چرخهٔ زمین"])}
function openDetail(title,body,facts){detailTitle.textContent=title;detailBody.textContent=body;detailFacts.innerHTML=facts.map(x=>'<div class="detail-fact"><b>•</b>'+x+'</div>').join("");detail.classList.remove("hidden")}
function selectObject(o){if(o.userData.type==="zodiac"){focusZodiac(o.userData.index,true)}else if(o.userData.type==="sefirah"){const s=sef[o.userData.index];const wp=new THREE.Vector3();o.getWorldPosition(wp);controls.target.lerp(wp,.8);camera.position.lerp(wp.clone().add(new THREE.Vector3(0,2,6)),.7);openDetail(s[1]+" · "+s[2],s[3]+" — این نام‌گذاری در چارچوب نمادین پروژه استفاده شده است.",["شماره: "+s[0]+" از ۱۰","جایگاه: درخت حیات","مسیر: بخشی از شبکهٔ نمادین ۲۲ مسیر"])}else if(o.userData.type==="life"){openDetail("موجود زنده","این موجود بخشی از چرخهٔ نمایشی زمین است؛ حرکت و تکثیر آن خودکار است.",["رفتار: حرکت خودکار","مرحله: حیات زمینی","ناظر: بدون کنترل مستقیم"])}}
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();renderer.domElement.addEventListener("pointerdown",e=>{mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(mouse,camera);const hits=ray.intersectObjects([...zodiacObjects,...treeNodes,...creatures],true);if(hits.length){let o=hits[0].object;while(o.parent&&!o.userData.type)o=o.parent;selectObject(o)}});

pause.onclick=()=>{running=!running;pause.textContent=running?"Ⅱ توقف":"▶ ادامه";};
reset.onclick=()=>{stage=0;cycle=0;running=true;setStage();controls.target.set(0,5,0);camera.position.set(0,10,27)};
document.getElementById("overview").onclick=()=>{controls.target.set(0,6,0);camera.position.set(0,10,27)};
document.getElementById("closeDetail").onclick=()=>detail.classList.add("hidden");
speedInput.oninput=()=>{speed=Number(speedInput.value);speedText.textContent=faToDigits(speed.toFixed(2).replace(".00","")+"×")};

function animate(now){requestAnimationFrame(animate);const dt=Math.min(.05,(now-last)/1000);last=now;if(running){stageClock+=dt*speed;if(stageClock>2.9){stageClock=0;stage++;if(stage>=cycleStages.length){stage=0;cycle++}setStage()}}
sun.rotation.y+=dt*.25;halo.rotation.z+=dt*.18;zodiacGroup.rotation.y+=dt*.035;tree.rotation.y+=Math.sin(now*.0002)*dt*.05;
creatures.forEach((c,i)=>{const a=now*.00012*(i%3+1)+i;const r=5+(i%4)*1.5;c.position.x=Math.cos(a)*r;c.position.z=Math.sin(a)*r*.55;c.rotation.y=-a+Math.PI/2;c.position.y=.6+Math.sin(now*.002+i)*.08});
energy.children.forEach((p,i)=>{const t=(now*.00025*speed+i/24)%1;const a=t*TAU;const r=8; p.position.set(Math.cos(a)*r,12+Math.sin(a*2)*2,Math.sin(a)*r*.35)});
controls.update();renderer.render(scene,camera)}
setStage();animate(performance.now());
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))});
setTimeout(()=>{document.getElementById("loading").style.opacity="0";setTimeout(()=>document.getElementById("loading").remove(),700)},900);


// --- Observer MMO HUD interactions ---
const eventLog=document.getElementById("eventLog");
const cycleEnergy=document.getElementById("cycleEnergy");
const lifeEnergy=document.getElementById("lifeEnergy");
function logEvent(t){if(!eventLog)return;const p=document.createElement("p");p.textContent="• "+t;eventLog.prepend(p);while(eventLog.children.length>3)eventLog.lastElementChild.remove();}
function focusZone(kind){
  document.querySelectorAll(".actionbar button").forEach(b=>b.classList.toggle("active",b.dataset.action===kind));
  if(kind==="sun"){controls.target.set(0,18,0);camera.position.set(0,19,11);chapter.textContent="خورشید";chapterSub.textContent="منبع نور نمادین";}
  if(kind==="zodiac"){controls.target.set(0,20,0);camera.position.set(0,25,18);chapter.textContent="۱۲ زودیاک";chapterSub.textContent="چرخهٔ خورشیدی";}
  if(kind==="tree"){controls.target.set(0,5,0);camera.position.set(0,8,18);chapter.textContent="درخت حیات";chapterSub.textContent="۱۰ سفیروت · ۲۲ مسیر";}
  if(kind==="earth"){controls.target.set(0,0,0);camera.position.set(0,8,18);chapter.textContent="زمین";chapterSub.textContent="بستر چرخه";}
  if(kind==="life"){controls.target.set(0,1,0);camera.position.set(0,6,13);chapter.textContent="موجودات زنده";chapterSub.textContent="حرکت خودکار";}
  if(kind==="cycle"){document.getElementById("overview").click();chapter.textContent="چرخهٔ کامل";chapterSub.textContent="خورشید → زودیاک → درخت → زمین → حیات → بازگشت";}
  logEvent("ناظر به بخش «"+chapter.textContent+"» رفت.");
}
document.querySelectorAll(".actionbar button[data-action]").forEach(b=>b.addEventListener("click",()=>focusZone(b.dataset.action)));
document.getElementById("cameraReset")?.addEventListener("click",()=>document.getElementById("overview").click());
document.getElementById("zoomIn")?.addEventListener("click",()=>{camera.position.multiplyScalar(.82)});
document.getElementById("zoomOut")?.addEventListener("click",()=>{camera.position.multiplyScalar(1.22)});



/* ===== LIVING WORLD EXTENSION =====
   Stylized MMO-like observer world. External production assets are referenced
   in README; this fallback geometry keeps the world playable without downloads. */
const living=[];
const env=new THREE.Group(); world.add(env);

function simpleTree(x,z,s=1){
  const g=new THREE.Group(); g.position.set(x,.15,z); g.scale.setScalar(s);
  const t=new THREE.Mesh(new THREE.CylinderGeometry(.16,.28,2.1,9),mat(0x68402b)); t.position.y=1; t.castShadow=true; g.add(t);
  for(let k=0;k<5;k++){const c=new THREE.Mesh(new THREE.IcosahedronGeometry(.65,1),mat([0x3d9b51,0x58b84e,0x2f7f46][k%3])); c.position.set((Math.random()-.5)*.7,1.8+Math.random()*.8,(Math.random()-.5)*.7); c.scale.y=.8; c.castShadow=true; g.add(c)}
  env.add(g); living.push({g,type:"tree",phase:Math.random()*TAU});
}
for(let i=0;i<34;i++){const a=Math.random()*TAU,r=7+Math.random()*5;simpleTree(Math.cos(a)*r,Math.sin(a)*r*.55,.65+Math.random()*.65)}

function rock(x,z,s=1){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.35*s,1),stone);r.position.set(x,.28*s,z);r.rotation.set(Math.random(),Math.random(),Math.random());r.castShadow=true;env.add(r)}
for(let i=0;i<45;i++){const a=Math.random()*TAU,r=4+Math.random()*8;rock(Math.cos(a)*r,Math.sin(a)*r*.58,.4+Math.random()*.9)}

function plant(x,z,c=0x6dcf5a){const g=new THREE.Group();g.position.set(x,.25,z);const stem=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,.5,6),mat(0x3e873b));stem.position.y=.25;g.add(stem);for(let i=0;i<4;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.13,7,5),mat(c));l.scale.set(.8,.3,1);l.position.set((i-1.5)*.09,.5+Math.random()*.15,(Math.random()-.5)*.12);g.add(l)}env.add(g);living.push({g,type:"plant",phase:Math.random()*TAU})}
for(let i=0;i<110;i++){const a=Math.random()*TAU,r=1+Math.random()*9;plant(Math.cos(a)*r,Math.sin(a)*r*.6,[0x6fcf55,0x88d65a,0x3fae64][i%3])}

const skyCycle=new THREE.Group();scene.add(skyCycle);
for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.SphereGeometry(1.3+Math.random()*.8,12,8),new THREE.MeshStandardMaterial({color:0x8ec8e8,transparent:true,opacity:.12,depthWrite:false}));c.position.set(-18+i*9,14+Math.sin(i)*3,-12-i*2);skyCycle.add(c)}

function zodiacAvatar(kind){
  const g=new THREE.Group();
  const body=mat(0xd89b43,.45,.05,.05), dark=mat(0x5d3b25,.5), whiteM=mat(0xf4ead5,.5);
  const b=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),body);b.scale.set(1.25,.85,.85);g.add(b);
  const h=new THREE.Mesh(new THREE.SphereGeometry(.24,12,10),body);h.position.z=.38;h.position.y=.05;g.add(h);
  if(kind===0){for(const s of[-1,1]){const horn=new THREE.Mesh(new THREE.TorusGeometry(.18,.045,6,12,Math.PI),dark);horn.position.set(s*.18,.25,.36);horn.rotation.x=Math.PI/2;g.add(horn)}}
  if(kind===1){const horn1=new THREE.Mesh(new THREE.ConeGeometry(.08,.5,8),dark);horn1.position.set(-.16,.48,.34);horn1.rotation.z=-.3;g.add(horn1);const horn2=horn1.clone();horn2.position.x=.16;horn2.rotation.z=.3;g.add(horn2)}
  if(kind===2){const h2=h.clone();h2.position.x=.34;h2.position.z=.28;g.add(h2)}
  if(kind===3){const cl=new THREE.Mesh(new THREE.TorusGeometry(.2,.07,7,12),body);cl.position.set(.28,0,.34);cl.rotation.y=Math.PI/2;g.add(cl)}
  if(kind===4){const mane=new THREE.Mesh(new THREE.TorusGeometry(.3,.09,8,16),gold);mane.position.z=.38;g.add(mane)}
  if(kind===5){const horn=new THREE.Mesh(new THREE.ConeGeometry(.07,.5,7),dark);horn.position.set(.15,.42,.35);horn.rotation.z=.35;g.add(horn)}
  if(kind===6){const arm=new THREE.Mesh(new THREE.TorusGeometry(.3,.045,6,24),gold);arm.rotation.z=Math.PI/2;arm.position.y=.05;g.add(arm)}
  if(kind===7){const st=new THREE.Mesh(new THREE.TorusGeometry(.22,.06,7,18),dark);st.position.z=.4;st.rotation.x=Math.PI/2;g.add(st)}
  if(kind===8){const bow=new THREE.Mesh(new THREE.TorusGeometry(.32,.045,6,24,Math.PI),gold);bow.rotation.y=Math.PI/2;bow.position.z=.35;g.add(bow)}
  if(kind===9){const horn=new THREE.Mesh(new THREE.ConeGeometry(.09,.55,8),dark);horn.position.y=.45;horn.position.z=.32;g.add(horn)}
  if(kind===10){const v=new THREE.Mesh(new THREE.ConeGeometry(.3,.5,6),water);v.position.y=.45;v.position.z=.35;g.add(v)}
  if(kind===11){const tail=new THREE.Mesh(new THREE.TorusGeometry(.25,.07,8,18),water);tail.rotation.y=Math.PI/2;tail.position.x=.25;g.add(tail)}
  return g;
}
zodiacObjects.forEach((g,i)=>{const av=zodiacAvatar(i);av.scale.setScalar(.9);av.position.y=-.1;g.add(av);g.userData.avatar=av});

const lifeGlow=glowSphere(1.05,0x5be56d,1.4);lifeGlow.position.set(0,1.8,0);lifeGlow.scale.y=1.35;tree.add(lifeGlow);
const orbitParticles=[];
for(let i=0;i<70;i++){const p=glowSphere(.035+Math.random()*.045,i%3===0?0xffd45a:0x7ee8ff,1);p.userData.a=Math.random()*TAU;p.userData.r=2+Math.random()*7;p.userData.v=.15+Math.random()*.45;scene.add(p);orbitParticles.push(p)}

const rippleGroup=new THREE.Group();world.add(rippleGroup);
for(let i=0;i<9;i++){const q=new THREE.Mesh(new THREE.TorusGeometry(.4+i*.35,.018,6,32),new THREE.MeshBasicMaterial({color:0x72d9ff,transparent:true,opacity:.22}));q.rotation.x=Math.PI/2;q.position.set((i%3-1)*2.1,.18,(Math.floor(i/3)-1)*1.2);rippleGroup.add(q)}

const birds=[];
for(let i=0;i<12;i++){const g=new THREE.Group();const wing1=new THREE.Mesh(new THREE.PlaneGeometry(.35,.08),new THREE.MeshBasicMaterial({color:0xdcecff,side:THREE.DoubleSide,transparent:true,opacity:.8}));const wing2=wing1.clone();wing1.position.x=-.18;wing2.position.x=.18;g.add(wing1,wing2);g.position.set((Math.random()-.5)*18,6+Math.random()*7,(Math.random()-.5)*12);scene.add(g);birds.push({g,phase:Math.random()*TAU})}

let celestialTime=0;
function animateLiving(now){
  requestAnimationFrame(animateLiving);
  const dt=.016; celestialTime+=dt*speed;
  living.forEach(o=>{o.g.rotation.z=Math.sin(now*.0008+o.phase)*.025;if(o.type==="plant")o.g.rotation.x=Math.sin(now*.0012+o.phase)*.045});
  zodiacObjects.forEach((g,i)=>{const av=g.userData.avatar;if(av){av.rotation.y+=dt*(.25+(i%3)*.06);av.position.y=-.1+Math.sin(now*.002+i)*.04}});
  orbitParticles.forEach((p,i)=>{p.userData.a+=dt*p.userData.v;const a=p.userData.a;p.position.set(Math.cos(a)*p.userData.r,9+Math.sin(a*2+i)*2.5,Math.sin(a)*p.userData.r*.45)});
  birds.forEach((b,i)=>{const a=now*.00012*(1+i%3)+b.phase;b.g.position.x=Math.cos(a)*12;b.g.position.z=Math.sin(a)*7;b.g.position.y=7+Math.sin(a*2)*1.2;b.g.rotation.y=-a;b.g.children[0].rotation.z=Math.sin(now*.008+i)*.5;b.g.children[1].rotation.z=-Math.sin(now*.008+i)*.5});
  rippleGroup.children.forEach((q,i)=>{q.scale.setScalar(1+((now*.0004+i*.13)%1)*.6);q.material.opacity=.3-(q.scale.x-1)*.25});
  sunLight.intensity=180+Math.sin(now*.00035)*35;sun.scale.setScalar(1+Math.sin(now*.001)*.025);
  updateAssetLife(dt,now);
  worldClock+=dt;
  // Day/night is symbolic and slow; the solar wheel remains the source of the cycle.
  const daylight=(Math.sin(worldClock*.045)+1)/2;
  scene.background.lerpColors(new THREE.Color(0x020a18),new THREE.Color(0x071d36),daylight*.35);
  ambient.intensity=1.7+daylight*.9;
  loadedActors.forEach((a,i)=>{a.mixer.update(dt*speed);a.root.position.y+=Math.sin(now*.0012+a.phase)*.0008;a.root.rotation.y+=dt*(i%2?-.06:.04)});
  streamParticles.forEach((p,i)=>{p.userData.t=(p.userData.t+p.userData.speed*dt)%1;const t=p.userData.t;const a=p.userData.offset+t*TAU*2;const rr=.35+Math.sin(t*Math.PI)*1.3;p.position.set(Math.cos(a)*rr,t*7+.7,Math.sin(a)*rr*.5);p.scale.setScalar(.6+Math.sin(t*Math.PI)*1.6);});
  growthBeds.forEach(g=>{g.mesh.scale.y=.25+.8*(.5+.5*Math.sin(worldClock*.55+g.phase));});
  zodiacPulse.forEach((r,i)=>{const q=.82+.18*Math.sin(now*.002+i);r.scale.setScalar(q);r.material.opacity=.35+.3*q;});

}
animateLiving(performance.now());
