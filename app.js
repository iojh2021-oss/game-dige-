import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js";

const TAU=Math.PI*2;
const zodiac=[
 ["♈","حمل","قوچ","آغاز و انرژی"],["♉","ثور","گاو","ثبات و زمین"],["♊","جوزا","دوپیکر","دوگانگی و ارتباط"],
 ["♋","سرطان","خرچنگ","پناه و رشد"],["♌","اسد","شیر","تابش و بیان"],["♍","سنبله","دوشیزه","نظم و دقت"],
 ["♎","میزان","ترازو","تعادل"],["♏","عقرب","کژدم","دگرگونی"],["♐","قوس","کماندار","حرکت"],
 ["♑","جدی","بز","استقامت"],["♒","دلو","آبریز","جریان"],["♓","حوت","ماهی","پیوستگی"]
];
const stages=[
 ["نور خورشید","پرتوی نمادین وارد جهان می‌شود."],["انرژی کیهانی","انرژی به حلقهٔ زودیاک می‌رسد."],
 ["درخت حیات","نور از گره‌های درخت عبور می‌کند."],["بذر","انرژی به زمین و بذر می‌رسد."],
 ["جوانه","بذر به حیات گیاهی تبدیل می‌شود."],["رشد","گیاه در زمین گسترش می‌یابد."],
 ["بلوغ","حیات به مرحلهٔ بالغ می‌رسد."],["زایش","نسل تازه در چرخه ظاهر می‌شود."],
 ["موجود زنده","موجودات در محیط حرکت می‌کنند."],["بازگشت","ماده و انرژی نمادین به چرخه برمی‌گردند."]
];
const sef=[
 ["۱","کِتِر","تاج"],["۲","حُخما","حکمت"],["۳","بیناه","فهم"],["۴","حِسِد","رحمت"],["۵","گِووراه","شدت"],
 ["۶","تیفِرِت","زیبایی"],["۷","نِتسَح","پیروزی"],["۸","هود","شکوه"],["۹","یسود","بنیاد"],["۱۰","ملכות","پادشاهی"]
];

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x071426);
scene.fog=new THREE.Fog(0x071426,32,78);
const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,120);
camera.position.set(0,9.5,25);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.18;
document.getElementById("canvasWrap").appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true; controls.dampingFactor=.065; controls.minDistance=7; controls.maxDistance=48;
controls.maxPolarAngle=Math.PI*.47; controls.target.set(0,4.5,0);

const clock=new THREE.Clock();
let speed=1,running=true,stage=0,cycle=0,stageTimer=0,lifeTimer=0,selected=null;

function M(color,rough=.7,metal=0,emissive=0){
 return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,emissive:emissive?color:0,emissiveIntensity:emissive});
}
const mats={
 grass:M(0x3d8d4b,.9), grass2:M(0x57a84f,.9), soil:M(0x5a3825,.95),
 trunk:M(0x6b4329,.9), leaf:M(0x31884a,.75), leaf2:M(0x54a94d,.72),
 rock:M(0x667687,.9), gold:M(0xf4c33f,.3,.45,.5), water:M(0x168bc8,.18,.1,.25),
 flower:M(0xf27ca6,.4,0,.15), white:M(0xf4edda,.55), red:M(0xc64b45,.5), blue:M(0x3c92d1,.4,.15),
 purple:M(0x8b65d8,.4,.1), brown:M(0x8a5632,.9), dark:M(0x26313a,.65)
};
const world=new THREE.Group();scene.add(world);

const hemi=new THREE.HemisphereLight(0x9dd9ff,0x193c22,1.65);scene.add(hemi);
const sunLight=new THREE.DirectionalLight(0xffd27a,3.2);sunLight.position.set(8,25,10);sunLight.castShadow=true;
sunLight.shadow.mapSize.set(1024,1024);sunLight.shadow.camera.left=-24;sunLight.shadow.camera.right=24;sunLight.shadow.camera.top=24;sunLight.shadow.camera.bottom=-24;scene.add(sunLight);
const fill=new THREE.DirectionalLight(0x68bfff,.75);fill.position.set(-16,12,-10);scene.add(fill);

function box(w,h,d,mat,px,py,pz){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(px,py,pz);m.castShadow=true;m.receiveShadow=true;return m;
}
function cyl(rt,rb,h,mat,px,py,pz,segments=10){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat);m.position.set(px,py,pz);m.castShadow=true;m.receiveShadow=true;return m;
}
function sphere(r,mat,px=0,py=0,pz=0){
 const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat);m.position.set(px,py,pz);m.castShadow=true;m.receiveShadow=true;return m;
}
function glow(r,color,intensity=1){
 const g=new THREE.Group();
 const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,16),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.25}));
 g.add(m);const l=new THREE.PointLight(color,4*r,7*r);g.add(l);return g;
}

const ground=new THREE.Mesh(new THREE.CylinderGeometry(16,16,1,96),mats.grass);ground.position.y=-.5;ground.receiveShadow=true;world.add(ground);
const innerGround=new THREE.Mesh(new THREE.CylinderGeometry(12.7,12.7,.28,96),mats.soil);innerGround.position.y=.04;innerGround.receiveShadow=true;world.add(innerGround);
const pathMat=M(0x9b7549,.98);
const path=new THREE.Mesh(new THREE.RingGeometry(3.4,5.1,64),pathMat);path.rotation.x=-Math.PI/2;path.position.y=.16;world.add(path);
const water=new THREE.Mesh(new THREE.CircleGeometry(8.8,96),new THREE.MeshPhysicalMaterial({color:0x1288c5,roughness:.12,metalness:.05,transmission:.12,transparent:true,opacity:.75,clearcoat:.65}));
water.rotation.x=-Math.PI/2;water.position.set(0,.19,-.4);world.add(water);
const island=new THREE.Mesh(new THREE.CircleGeometry(4.5,64),mats.soil);island.rotation.x=-Math.PI/2;island.position.set(0,.24,0);world.add(island);

function tree(x,z,s=1){
 const g=new THREE.Group();g.position.set(x,.1,z);g.scale.setScalar(s);
 g.add(cyl(.22,.34,2.7,mats.trunk,0,1.35,0,9));
 for(let i=0;i<5;i++)g.add(sphere(.72,mats[i%2?"leaf":"leaf2"],(Math.random()-.5)*.9,2.45+Math.random()*.9,(Math.random()-.5)*.8));
 g.userData={type:"tree"};world.add(g);return g;
}
for(let i=0;i<30;i++){const a=Math.random()*TAU,r=8.5+Math.random()*6;tree(Math.cos(a)*r,Math.sin(a)*r*.58,.65+Math.random()*.55)}

for(let i=0;i<75;i++){
 const a=Math.random()*TAU,r=4+Math.random()*11,g=new THREE.Group();
 const x=Math.cos(a)*r,z=Math.sin(a)*r*.58;
 g.add(new THREE.Mesh(new THREE.DodecahedronGeometry(.22+Math.random()*.42,1),mats.rock));
 g.position.set(x,.3,z);g.rotation.set(Math.random(),Math.random(),Math.random());world.add(g);
}
for(let i=0;i<140;i++){
 const a=Math.random()*TAU,r=1+Math.random()*14,g=new THREE.Group();
 const blade=new THREE.Mesh(new THREE.ConeGeometry(.035,.25+Math.random()*.3,5),i%4?mats.grass2:mats.grass);
 g.add(blade);g.position.set(Math.cos(a)*r,.27,Math.sin(a)*r*.58);g.rotation.y=Math.random()*TAU;world.add(g);
}

const flowerGroup=new THREE.Group();world.add(flowerGroup);
for(let i=0;i<48;i++){
 const a=Math.random()*TAU,r=2+Math.random()*10;
 const f=sphere(.1,mats.flower,Math.cos(a)*r,.5,Math.sin(a)*r*.58);
 flowerGroup.add(f);
}

const sun=glow(2.15,0xffb51e,2);scene.add(sun);sun.position.set(0,22,-2);
const sunHalo=new THREE.Mesh(new THREE.TorusGeometry(3.05,.07,10,96),new THREE.MeshBasicMaterial({color:0xffd75c,transparent:true,opacity:.9}));
sunHalo.position.copy(sun.position);scene.add(sunHalo);

const zodiacGroup=new THREE.Group();scene.add(zodiacGroup);zodiacGroup.position.copy(sun.position);
const zodiacRing=new THREE.Mesh(new THREE.TorusGeometry(8.2,.12,12,128),mats.gold);zodiacRing.rotation.x=Math.PI/2;zodiacGroup.add(zodiacRing);
const zodiacRing2=new THREE.Mesh(new THREE.TorusGeometry(9.5,.045,8,128),new THREE.MeshBasicMaterial({color:0x54baff,transparent:true,opacity:.7}));
zodiacRing2.rotation.x=Math.PI/2;zodiacGroup.add(zodiacRing2);

function textSprite(text,color="#ffe071",scale=.9){
 const c=document.createElement("canvas"),ctx=c.getContext("2d");c.width=512;c.height=128;
 ctx.font="800 34px Vazirmatn, sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=color;ctx.shadowColor="#000";ctx.shadowBlur=12;ctx.fillText(text,256,60);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(3.6*scale,.9*scale,1);return s;
}

function zodiacCreature(i){
 const g=new THREE.Group();
 const body=[0xd18a43,0x7b5b3c,0x9c7649,0x497ca0,0xb87938,0xc5aa72,0xd6bd58,0x5b6f3d,0xc7893e,0x8b6d45,0x5ba9c5,0x4c8fd0][i];
 const b=sphere(.48,M(body,.62),0,.65,0);b.scale.set(1.35,.78,.82);g.add(b);
 g.add(sphere(.32,M(body,.62),0,.78,.55));
 for(const x of[-.28,.28])g.add(cyl(.09,.11,.62,M(body,.65),x,.28,.08,8));
 if(i===0||i===1||i===9){for(const x of[-.18,.18]){const h=cyl(.045,.09,.55,mats.dark, x,1.2,.67,7);h.rotation.z=x*.9;g.add(h)}}
 if(i===4){for(let k=0;k<7;k++){const a=k/7*TAU;g.add(sphere(.11,mats.gold,Math.cos(a)*.48, .9+Math.sin(a)*.25,.5))}}
 if(i===7||i===11){const tail=new THREE.Mesh(new THREE.TorusGeometry(.28,.065,8,16),i===7?mats.red:mats.water);tail.rotation.y=Math.PI/2;tail.position.x=.48;tail.position.y=.65;g.add(tail)}
 if(i===10){g.add(cyl(.12,.02,.65,mats.water,0,1.2,.5,7))}
 return g;
}

const zodiacObjects=[];
zodiac.forEach((z,i)=>{
 const a=i/12*TAU+Math.PI/2,g=new THREE.Group();
 g.position.set(Math.cos(a)*8.2,0,Math.sin(a)*8.2);g.userData={type:"zodiac",index:i,name:z[1]};
 const pedestal=cyl(.58,.72,.18,mats.gold,0,-.48,0,24);g.add(pedestal);
 const orb=glow(.55,[0xffcf45,0x56c6ff,0xa97cff][i%3],.6);g.add(orb);
 const avatar=zodiacCreature(i);avatar.position.y=-.35;avatar.scale.setScalar(.9);g.add(avatar);
 const label=textSprite(z[0]+" "+z[1],i%2?"#fff2b0":"#ffd95b",.72);label.position.y=1.25;g.add(label);
 zodiacGroup.add(g);zodiacObjects.push(g);
});

const treeGroup=new THREE.Group();treeGroup.position.set(0,1.1,0);scene.add(treeGroup);
const trunk=cyl(.7,.95,7,mats.trunk,0,3.5,0,14);trunk.castShadow=true;treeGroup.add(trunk);
for(let i=0;i<10;i++){const a=i/10*TAU,r=1+Math.random()*1.8;const root=cyl(.12,.2,2.2,mats.trunk,Math.cos(a)*r*.55,.1,Math.sin(a)*r*.55,8);root.rotation.z=Math.cos(a)*.8;root.rotation.x=Math.sin(a)*.8;treeGroup.add(root)}
for(let i=0;i<32;i++){const a=Math.random()*TAU,r=Math.random()*3.4;treeGroup.add(sphere(.62+Math.random()*.55,i%3?mats.leaf:mats.leaf2,(Math.cos(a)*r),6.2+Math.random()*3,(Math.sin(a)*r)*.7))}
const fruitGroup=new THREE.Group();treeGroup.add(fruitGroup);
for(let i=0;i<18;i++){const a=Math.random()*TAU,r=.7+Math.random()*2.8;fruitGroup.add(glow(.11,i%2?0xffc74a:0xf05c49,.35)).position.set(Math.cos(a)*r,5.2+Math.random()*3,Math.sin(a)*r*.7)}

const nodePositions=[[0,9.5,0],[-2.8,8,0],[2.8,8,0],[-4,5.9,0],[4,5.9,0],[0,6,0],[-4,3.8,0],[4,3.8,0],[0,2.2,0],[0,.5,0]];
const nodeColors=[0xffd447,0x58c7ff,0x9c83ff,0x42d58b,0xff5964,0xffc638,0x45d7ae,0x9e72ff,0x5f8cff,0x9b653e];
const nodes=[];
sef.forEach((s,i)=>{
 const n=glow(.38,nodeColors[i],.8);n.position.set(...nodePositions[i]);n.userData={type:"sefirah",index:i};
 treeGroup.add(n);nodes.push(n);
 const tx=textSprite(s[0]+" "+s[1],"#fff0a5",.5);tx.position.set(0,.68,0);n.add(tx);
});
const connections=[[0,1],[0,2],[1,2],[1,3],[2,4],[3,4],[3,5],[4,5],[3,6],[5,6],[5,7],[4,7],[6,8],[7,8],[8,9]];
for(const [a,b] of connections){
 const A=new THREE.Vector3(...nodePositions[a]),B=new THREE.Vector3(...nodePositions[b]);
 const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([A,B]),new THREE.LineBasicMaterial({color:0xf2d45e,transparent:true,opacity:.48}));
 treeGroup.add(line);
}

const energyGroup=new THREE.Group();scene.add(energyGroup);
for(let i=0;i<36;i++){const p=glow(.055,i%2?0x6dd8ff:0xffdd57,1);p.userData={offset:i/36};energyGroup.add(p)}

function animal(i){
 const colors=[0xc18b59,0x9d734f,0xd4c4a2,0x7f624d,0x70513d,0xe1d1b3];
 const g=new THREE.Group(),m=M(colors[i%colors.length],.78);
 const body=sphere(.48,m,0,.78,0);body.scale.set(1.4,.82,.85);g.add(body);
 g.add(sphere(.29,m,0,.86,.58));
 for(const x of[-.3,.3])for(const z of[-.18,.18])g.add(cyl(.07,.1,.58,m,x,.34,z,7));
 const tail=sphere(.1,m,0,.86,-.55);g.add(tail);
 g.userData={type:"life",phase:Math.random()*TAU,speed:.18+Math.random()*.2,home:i};
 return g;
}
const animals=[];
for(let i=0;i<18;i++){const a=animal(i);const ang=i/18*TAU;const r=5+Math.random()*6;a.position.set(Math.cos(ang)*r,.35,Math.sin(ang)*r*.55);world.add(a);animals.push(a)}

const newborns=[];
function spawnNewborn(){
 if(newborns.length>10){world.remove(newborns.shift())}
 const b=animal(0);b.scale.setScalar(.62);b.userData.phase=Math.random()*TAU;b.userData.newborn=true;
 b.position.set((Math.random()-.5)*5,.35,(Math.random()-.5)*3);world.add(b);newborns.push(b);logEvent("نسل تازه وارد محیط شد.");
}

const clouds=[];
for(let i=0;i<7;i++){const g=new THREE.Group();for(let k=0;k<4;k++)g.add(sphere(1.1+Math.random()*.7,new THREE.MeshStandardMaterial({color:0xd8edf4,transparent:true,opacity:.18,depthWrite:false}),k*.8,0,0));g.position.set(-24+i*8,15+Math.sin(i)*2,-15-i*2);scene.add(g);clouds.push(g)}

const waterfallGroup=new THREE.Group();world.add(waterfallGroup);
for(let i=0;i<5;i++){
 const w=new THREE.Mesh(new THREE.PlaneGeometry(.7,4),new THREE.MeshBasicMaterial({color:0x72d9ff,transparent:true,opacity:.52,side:THREE.DoubleSide}));
 w.position.set(-10+i*5,2,-7.9);waterfallGroup.add(w);
}

const eventLog=document.getElementById("eventLog"),cycleEnergy=document.getElementById("cycleEnergy"),lifeEnergy=document.getElementById("lifeEnergy");
function logEvent(t){if(!eventLog)return;const p=document.createElement("p");p.textContent="• "+t;eventLog.prepend(p);while(eventLog.children.length>3)eventLog.lastElementChild.remove()}
function fa(s){return String(s).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d])}

const focusName=document.getElementById("focusName"),focusText=document.getElementById("focusText"),focusIcon=document.getElementById("focusIcon");
const stageNo=document.getElementById("stageNo"),bar=document.getElementById("bar"),chapter=document.getElementById("chapter"),chapterSub=document.getElementById("chapterSub");
const detail=document.getElementById("detail"),detailTitle=document.getElementById("detailTitle"),detailBody=document.getElementById("detailBody"),detailFacts=document.getElementById("detailFacts");

function openDetail(title,body,facts){
 detailTitle.textContent=title;detailBody.textContent=body;detailFacts.innerHTML=facts.map(x=>"<div class='detail-fact'><b>•</b>"+x+"</div>").join("");detail.classList.remove("hidden");
}
function setStage(){
 const p=stages[stage];chapter.textContent=p[0];chapterSub.textContent=p[1];
 focusName.textContent=p[0];focusText.textContent=p[1]+" این نمایش یک مدل نمادین و هنری در همین پروژه است.";
 stageNo.textContent=fa((stage+1)+" / "+stages.length);bar.style.width=((stage+1)/stages.length*100)+"%";
 nodes.forEach((n,i)=>n.scale.setScalar(i===stage%10?1.55:1));
 zodiacObjects.forEach((g,i)=>g.scale.setScalar(i===stage%12?1.18:1));
}
function cinematic(target,distance=7){
 const start=camera.position.clone(),target0=controls.target.clone(),dir=camera.position.clone().sub(target).normalize();
 if(dir.lengthSq()<.01)dir.set(0,.2,1);
 const end=target.clone().add(dir.multiplyScalar(distance)).add(new THREE.Vector3(0,1,0)),t0=performance.now();
 function step(t){const q=Math.min(1,(t-t0)/650),e=q*q*(3-2*q);camera.position.lerpVectors(start,end,e);controls.target.lerpVectors(target0,target,e);if(q<1)requestAnimationFrame(step)}requestAnimationFrame(step);
}
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
renderer.domElement.addEventListener("pointerdown",e=>{
 mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(mouse,camera);
 const hits=ray.intersectObjects([...zodiacObjects,...nodes,...animals],true);if(!hits.length)return;
 let o=hits[0].object;while(o.parent&&!o.userData.type)o=o.parent;
 selected=o;const wp=new THREE.Vector3();o.getWorldPosition(wp);cinematic(wp,o.userData.type==="zodiac"?5.5:6.5);
 if(o.userData.type==="zodiac"){const z=zodiac[o.userData.index];focusName.textContent=z[0]+" "+z[1];focusIcon.textContent=z[0];focusText.textContent=z[2]+" · "+z[3];openDetail(z[1],z[2]+" — "+z[3],["نشانهٔ "+fa(o.userData.index+1)+" از ۱۲","اتصال نمادین: خورشید → زودیاک → زمین"])}
 else if(o.userData.type==="sefirah"){const s=sef[o.userData.index];openDetail(s[1]+" · "+s[2],"گرهٔ نمادین در ساختار درخت حیات.",["شماره: "+s[0]+" از ۱۰","جایگاه: درخت حیات","مسیرهای نمایش‌داده‌شده: ۲۲ اتصال"])}
 else openDetail("موجود زنده","این موجود بخشی از چرخهٔ خودکار محیط است.",["حرکت: خودکار","نقش: حیات زمینی","کنترل بازیکن: ندارد"]);
});

const list=document.getElementById("zodiacList");
zodiac.forEach((z,i)=>{const el=document.createElement("div");el.className="zitem";el.innerHTML="<span class='zi'>"+z[0]+"</span><span>"+z[1]+" · "+z[2]+"</span>";el.onclick=()=>{const wp=new THREE.Vector3();zodiacObjects[i].getWorldPosition(wp);cinematic(wp,5.5);openDetail(z[1],z[2]+" · "+z[3],["۱۲ نشانهٔ حلقهٔ خورشیدی","موجود سه‌بعدی نمادین","دوربین ناظر"]) };list.appendChild(el)});

function focusZone(kind){
 if(kind==="sun"){controls.target.copy(sun.position);camera.position.set(0,22,13);chapter.textContent="خورشید";chapterSub.textContent="منبع نور نمادین"}
 if(kind==="zodiac"){controls.target.copy(zodiacGroup.position);camera.position.set(0,24,18);chapter.textContent="۱۲ زودیاک";chapterSub.textContent="حلقهٔ خورشیدی"}
 if(kind==="tree"){controls.target.set(0,5,0);camera.position.set(0,8,18);chapter.textContent="درخت حیات";chapterSub.textContent="۱۰ گره · ۲۲ مسیر"}
 if(kind==="earth"){controls.target.set(0,0,0);camera.position.set(0,10,20);chapter.textContent="زمین";chapterSub.textContent="محیط زنده"}
 if(kind==="life"){controls.target.set(0,1,0);camera.position.set(0,7,14);chapter.textContent="حیات";chapterSub.textContent="موجودات متحرک"}
 if(kind==="cycle"){controls.target.set(0,5,0);camera.position.set(0,10,25);chapter.textContent="چرخهٔ کامل";chapterSub.textContent="خورشید → زودیاک → درخت → زمین → حیات"}
 logEvent("ناظر به «"+chapter.textContent+"» رفت.");
}
document.querySelectorAll(".actionbar button[data-action]").forEach(b=>b.addEventListener("click",()=>focusZone(b.dataset.action)));
document.getElementById("overview").onclick=()=>focusZone("cycle");
document.getElementById("cameraReset")?.addEventListener("click",()=>focusZone("cycle"));
document.getElementById("zoomIn")?.addEventListener("click",()=>camera.position.lerp(controls.target,.18));
document.getElementById("zoomOut")?.addEventListener("click",()=>{const d=camera.position.clone().sub(controls.target);camera.position.copy(controls.target).add(d.multiplyScalar(1.2))});
document.getElementById("closeDetail").onclick=()=>detail.classList.add("hidden");
document.getElementById("pause").onclick=e=>{running=!running;e.currentTarget.textContent=running?"Ⅱ توقف":"▶ ادامه"};
document.getElementById("reset").onclick=()=>{stage=0;cycle=0;stageTimer=0;lifeTimer=0;running=true;setStage();focusZone("cycle")};
document.getElementById("speed").oninput=e=>{speed=Number(e.target.value);document.getElementById("speedText").textContent=fa(speed.toFixed(2).replace(".00",""))+"×"};

setStage();
logEvent("جهان سه‌بعدی آماده شد.");
logEvent("۱۲ موجود زودیاک و محیط زنده فعال شدند.");

let worldTime=0;
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.05);
 const now=performance.now();
 if(running){
  worldTime+=dt*speed;stageTimer+=dt*speed;lifeTimer+=dt*speed;
  if(stageTimer>3){stageTimer=0;stage++;if(stage>=stages.length){stage=0;cycle++;logEvent("چرخهٔ کامل شمارهٔ "+fa(cycle)+" آغاز شد.")}setStage()}
  if(lifeTimer>5.5){lifeTimer=0;if(stage===7||Math.random()<.3)spawnNewborn();logEvent(stages[stage][0]);}
 }
 const day=(Math.sin(worldTime*.055)+1)/2;
 const angle=worldTime*.055*TAU;
 sun.position.set(Math.cos(angle)*20,13+Math.sin(angle)*9,Math.sin(angle)*11);
 sunHalo.position.copy(sun.position);sunLight.position.copy(sun.position);
 sunLight.intensity=1.5+day*2.4;hemi.intensity=1.15+day*.8;
 const sky=new THREE.Color(0x061124).lerp(new THREE.Color(0x2c78a0),day*.34);scene.background.copy(sky);scene.fog.color.copy(sky);
 sun.rotation.y+=dt*.3;sunHalo.rotation.z+=dt*.12;zodiacGroup.rotation.y+=dt*.018;
 treeGroup.rotation.y+=dt*.015;
 water.material.opacity=.69+Math.sin(now*.0015)*.06;
 flowerGroup.children.forEach((f,i)=>f.position.y=.48+Math.sin(now*.0018+i)*.035);
 animals.forEach((a,i)=>{
  const r=5.2+(i%5)*1.25,ang=now*.00012*a.userData.speed*speed+i*TAU/18;
  a.position.x=Math.cos(ang)*r;a.position.z=Math.sin(ang)*r*.55;a.position.y=.38+Math.sin(now*.002+i)*.035;a.rotation.y=-ang+Math.PI/2;
  if(a.userData.newborn)a.scale.setScalar(.62+.05*Math.sin(now*.003+i));
 });
 energyGroup.children.forEach((p,i)=>{
  const t=(now*.00022*speed+i/36)%1,a=t*TAU*2.2,r=3.5+Math.sin(t*Math.PI)*6.5;
  p.position.set(Math.cos(a)*r,3+Math.sin(t*TAU)*6,Math.sin(a)*r*.55);
 });
 clouds.forEach((c,i)=>{c.position.x=-24+((now*.004*(.35+i*.04)+i*8)%56)});
 waterfallGroup.children.forEach((w,i)=>{w.material.opacity=.42+.13*Math.sin(now*.002+i);w.scale.y=.9+.1*Math.sin(now*.0025+i)});
 cycleEnergy.style.width=(55+Math.sin(now*.0018)*25)+"%";lifeEnergy.style.width=(68+Math.sin(now*.0013+2)*20)+"%";
 controls.update();renderer.render(scene,camera);
}
animate();
setTimeout(()=>{const l=document.getElementById("loading");if(l){l.style.opacity="0";setTimeout(()=>l.remove(),700)}},900);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5))});
