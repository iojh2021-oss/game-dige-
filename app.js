import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";

const TAU=Math.PI*2;
const zodiac=[
 ["♈","حمل","قوچ"],["♉","ثور","گاو"],["♊","جوزا","دوپیکر"],["♋","سرطان","خرچنگ"],
 ["♌","اسد","شیر"],["♍","سنبله","دوشیزه"],["♎","میزان","ترازو"],["♏","عقرب","کژدم"],
 ["♐","قوس","کماندار"],["♑","جدی","بز"],["♒","دلو","آبریز"],["♓","حوت","ماهی"]
];
const stages=[
 ["نور خورشید","نور نمادین وارد چرخه می‌شود."],["۱۲ زودیاک","نور در حلقهٔ خورشیدی پخش می‌شود."],
 ["درخت حیات","انرژی از ریشه تا تاج جریان می‌یابد."],["بذر","انرژی به زمین و بذر می‌رسد."],
 ["جوانه","حیات گیاهی آغاز می‌شود."],["رشد","گیاه و محیط گسترش می‌یابند."],
 ["بلوغ","جهان به مرحلهٔ بالغ می‌رسد."],["زایش","نسل تازه وارد چرخه می‌شود."],
 ["حیات","موجودات در جهان حرکت می‌کنند."],["بازگشت","انرژی به آغاز چرخه بازمی‌گردد."]
];

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x4b9fd0);
scene.fog=new THREE.FogExp2(0x78b9cf,.009);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,220);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.48;
document.getElementById("canvasWrap").appendChild(renderer.domElement); const boot=document.getElementById("bootDebug"); if(boot) boot.textContent="VERSION 2026-09-21-D5 · GAMEPLAY WORLD · LOADING";

const clock=new THREE.Clock();
let time=0,stage=0,stageTimer=0,running=true,speed=1,cycle=0;
let camYaw=0,camPitch=.12,camDist=18,dragging=false,lastX=0,lastY=0;
let observerT=.08,cinematicObserver=true;
const observerPos=new THREE.Vector3(),observerLook=new THREE.Vector3();
let gameplayActor=null,gameplayMixer=null;
const world=new THREE.Group();scene.add(world);
const assetRoot=new THREE.Group();assetRoot.name="REAL_ASSETS";world.add(assetRoot);
const gltfLoader=new GLTFLoader();
const mats={};
const mat=(c,r=.8,e=0,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:e?c:0,emissiveIntensity:e});
Object.assign(mats,{
 grass:mat(0x4d9a4b,.95), grass2:mat(0x69b75a,.9), soil:mat(0x8a5b35,.95),
 trunk:mat(0x6b4228,.95), leaf:mat(0x2f7f42,.85), leaf2:mat(0x58a94e,.8),
 stone:mat(0x697b83,.92), gold:mat(0xf4c84d,.3,.5,.35), water:mat(0x168fc7,.18,.1,.25),
 white:mat(0xf4f0df,.55), dark:mat(0x25333a,.65), flower:mat(0xf07aa6,.45,.2),
 red:mat(0xc94e45,.5), blue:mat(0x4a9ed1,.4,.1), purple:mat(0x8d69d6,.4,.1)
});

function mesh(g,geo,material,x=0,y=0,z=0){
 const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;
}
function box(g,w,h,d,m,x,y,z){return mesh(g,new THREE.BoxGeometry(w,h,d),m,x,y,z)}
function cyl(g,r1,r2,h,m,x,y,z,n=10){return mesh(g,new THREE.CylinderGeometry(r1,r2,h,n),m,x,y,z)}
function sph(g,r,m,x,y,z){return mesh(g,new THREE.SphereGeometry(r,12,8),m,x,y,z)}
function cone(g,r,h,m,x,y,z,n=10){return mesh(g,new THREE.ConeGeometry(r,h,n),m,x,y,z)}

const hemi=new THREE.HemisphereLight(0xbfe9ff,0x294321,1.8);scene.add(hemi);
const sunLight=new THREE.DirectionalLight(0xffe1a1,3.4);
sunLight.castShadow=true;sunLight.shadow.mapSize.set(1024,1024);
sunLight.shadow.camera.left=-30;sunLight.shadow.camera.right=30;sunLight.shadow.camera.top=30;sunLight.shadow.camera.bottom=-30;
scene.add(sunLight);
const rim=new THREE.DirectionalLight(0x6fc7ff,.9);rim.position.set(-20,16,-20);scene.add(rim);

function skyTexture(){
 const c=document.createElement("canvas"),x=c.getContext("2d");c.width=512;c.height=512;
 const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,"#17639b");g.addColorStop(.45,"#54a9c9");g.addColorStop(1,"#d7c887");
 x.fillStyle=g;x.fillRect(0,0,512,512);
 return new THREE.CanvasTexture(c);
}
const sky=new THREE.Mesh(new THREE.SphereGeometry(70,32,16),new THREE.MeshBasicMaterial({map:skyTexture(),side:THREE.BackSide}));
scene.add(sky);

const ground=new THREE.Mesh(new THREE.CylinderGeometry(38,38,1.5,128),mats.grass);
ground.position.y=-.65;ground.receiveShadow=true;world.add(ground);
const field=new THREE.Mesh(new THREE.CircleGeometry(34,128),mats.grass2);
field.rotation.x=-Math.PI/2;field.position.y=-.02;field.receiveShadow=true;world.add(field);
const dirt=new THREE.Mesh(new THREE.RingGeometry(5.0,15.5,96),mats.soil);
dirt.rotation.x=-Math.PI/2;dirt.position.y=.035;world.add(dirt);

function mountain(x,z,s){
 const g=new THREE.Group();g.userData.proceduralEnvironment=true;g.position.set(x,0,z);
 cone(g,5*s,8*s,mat(0x426b66,.98),0,4*s,0,6);
 cone(g,3.3*s,5.5*s,mat(0x63877b,.98),0,4.3*s,.1,7);
 cone(g,1.1*s,2*s,mat(0xe8e5d2,.9),0,6.7*s,.15,6);
 world.add(g);
}
mountain(-18,-15,1.2);mountain(-8,-20,.9);mountain(8,-20,1.05);mountain(18,-14,1.25);

function tree(x,z,s=1){
 const g=new THREE.Group();g.userData.proceduralTree=true;g.position.set(x,.05,z);g.scale.setScalar(s);
 cyl(g,.3,.42,3.1,mats.trunk,0,1.55,0,9);
 for(let i=0;i<6;i++)sph(g,.85,i%2?mats.leaf:mats.leaf2,(Math.random()-.5)*1.15,2.7+Math.random()*1.1,(Math.random()-.5)*.85);
 world.add(g);return g;
}
for(let i=0;i<30;i++){const a=i/30*TAU+(Math.random()-.5)*.12,r=15+Math.random()*10;tree(Math.cos(a)*r,Math.sin(a)*r*.58,.72+Math.random()*.48)}

for(let i=0;i<48;i++){
 const a=Math.random()*TAU,r=4+Math.random()*12;
 const g=new THREE.Group();g.position.set(Math.cos(a)*r,.25,Math.sin(a)*r*.62);
 g.userData.proceduralRock=true;const s=sph(g,.25+Math.random()*.35,mats.stone,0,0,0);s.rotation.set(Math.random(),Math.random(),Math.random());world.add(g);
}
for(let i=0;i<90;i++){
 const a=Math.random()*TAU,r=3+Math.random()*13,g=new THREE.Group();
 const b=cone(g,.05,.25+Math.random()*.35,i%5?mats.grass:mats.grass2,0,.18,0,5);
 g.position.set(Math.cos(a)*r,.1,Math.sin(a)*r*.62);g.rotation.y=Math.random()*TAU;world.add(g);
}

const river=new THREE.Mesh(new THREE.RingGeometry(13.8,16.4,96),new THREE.MeshPhysicalMaterial({color:0x168fca,roughness:.12,metalness:.02,transparent:true,opacity:.9,clearcoat:.9,emissive:0x063f5d,emissiveIntensity:.18}));
river.rotation.x=-Math.PI/2;river.position.set(0,.12,0);world.add(river);
const pond=new THREE.Mesh(new THREE.CircleGeometry(4.8,64),new THREE.MeshPhysicalMaterial({color:0x20a9d5,roughness:.06,transparent:true,opacity:.92,clearcoat:.9,emissive:0x063b52,emissiveIntensity:.12}));
pond.rotation.x=-Math.PI/2;pond.position.set(-8,.2,-4);world.add(pond);


// CINEMATIC LANDSCAPE LAYER
function cliff(x,z,s){
 const g=new THREE.Group();g.userData.proceduralEnvironment=true;g.position.set(x,-.1,z);g.scale.setScalar(s);
 const rock=mat(0x3d665f,.98);
 const top=mat(0x6e8c6c,.92);
 cone(g,4.8,6.5,rock,0,3.1,0,7);
 cone(g,3.9,1.4,top,0,5.9,0,8);
 for(let i=0;i<5;i++){
   const w=mesh(g,new THREE.PlaneGeometry(.5+Math.random()*.35,3.2+Math.random()*2.5),
     new THREE.MeshBasicMaterial({color:0x9be9ff,transparent:true,opacity:.52,side:THREE.DoubleSide}),
     -2+i*.9,3.1,-3.0);
   w.rotation.x=-.08;
 }
 world.add(g);
}
cliff(-12,-8,1.15);cliff(12,-9,1.0);cliff(-18,-1,.78);cliff(18,1,.82);

function cloud(x,y,z,s){
 const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);
 const cm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,transparent:true,opacity:.82});
 for(let i=0;i<7;i++) sph(g,.8+Math.random()*.8,cm,(i-3)*.85,(Math.random()-.2)*.65,Math.random()*.5);
 world.add(g);
}
cloud(-15,13,-18,1.2);cloud(14,15,-20,1.5);cloud(-4,17,-25,1.0);

function flowersPatch(x,z,s){
 for(let i=0;i<12;i++){
   const g=new THREE.Group();g.position.set(x+(Math.random()-.5)*s,z+(Math.random()-.5)*s);
   cyl(g,.018,.028,.35,mats.grass2,0,.18,0,5);
   sph(g,.10,mats.flower,0,.38,0);world.add(g);
 }
}
flowersPatch(-7,-2,6);flowersPatch(7,-1,7);flowersPatch(0,7,8);

const sun=new THREE.Group();scene.add(sun);
const sunCore=new THREE.Mesh(new THREE.SphereGeometry(2.1,24,16),new THREE.MeshBasicMaterial({color:0xffc42f}));
sun.add(sunCore);
const sunHalo=new THREE.Mesh(new THREE.SphereGeometry(4.2,32,20),new THREE.MeshBasicMaterial({color:0xffcf4c,transparent:true,opacity:.12,blending:THREE.AdditiveBlending}));
sun.add(sunHalo);
const sunRing=new THREE.Mesh(new THREE.TorusGeometry(3.3,.07,8,80),new THREE.MeshBasicMaterial({color:0xffe48a}));
sun.add(sunRing);sun.position.set(0,18,-10);

function label(text,scale=.65){
 const c=document.createElement("canvas"),x=c.getContext("2d");c.width=512;c.height=128;
 x.font="800 36px Vazirmatn,Tahoma";x.textAlign="center";x.textBaseline="middle";x.fillStyle="#fff0a4";x.shadowColor="#17324a";x.shadowBlur=12;x.fillText(text,256,62);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(3.4*scale,.85*scale,1);return s;
}

const zodiacGroup=new THREE.Group();scene.add(zodiacGroup);
zodiacGroup.position.set(0,13.8,-7.5);
const ring=new THREE.Mesh(new THREE.TorusGeometry(7.4,.18,16,160),mats.gold);zodiacGroup.add(ring);
const ring2=new THREE.Mesh(new THREE.TorusGeometry(8.05,.055,10,160),new THREE.MeshBasicMaterial({color:0x9fe9ff,transparent:true,opacity:.9}));zodiacGroup.add(ring2);
const zodiacObjects=[];
const zColors=[0xd18a43,0x8c6948,0x9e7a4e,0x4e8caf,0xd07c35,0xc6ad79,0xd5bc56,0x607544,0xc8883e,0x8b6845,0x58a7c2,0x4e91d1];

function creature(i){
 const g=new THREE.Group(),m=mat(zColors[i],.65);
 sph(g,.55,m,0,.55,0).scale.set(1.35,.78,.85);
 sph(g,.34,m,0,.65,.58);
 for(const x of[-.32,.32])for(const z of[-.2,.2])cyl(g,.08,.1,.62,m,x,.15,z,7);
 if([0,1,4,9].includes(i)){for(const x of[-.2,.2]){const h=cyl(g,.05,.08,.62,m,x,1.05,.52,7);h.rotation.z=x*.9}}
 if(i===4)for(let k=0;k<7;k++){const a=k/7*TAU;sph(g,.11,mats.gold,Math.cos(a)*.5,.72+Math.sin(a)*.22,.55)}
 if(i===7||i===11){const t=new THREE.Mesh(new THREE.TorusGeometry(.28,.07,8,16),i===7?mats.red:mats.water);t.rotation.y=Math.PI/2;t.position.set(.52,.55,0);g.add(t)}
 if(i===8){const bow=cyl(g,.045,.045,1.2,mats.gold,0,1.1,.58,8);bow.rotation.z=.8}
 if(i===10){cyl(g,.1,.025,.8,mats.water,0,1.15,.5,7)}
 return g;
}
zodiac.forEach((z,i)=>{
 const a=i/12*TAU+Math.PI/2,g=new THREE.Group();g.position.set(Math.cos(a)*7.4,Math.sin(a)*7.4,0);
 g.userData={type:"zodiac",index:i};
 const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(.42,.58,.18,20),mats.gold);pedestal.position.z=.18;g.add(pedestal);
 const c=creature(i);c.scale.setScalar(1.18);c.position.z=.18;g.add(c);
 const l=label(z[0]+" "+z[1],.48);l.position.y=-.92;g.add(l);
 zodiacGroup.add(g);zodiacObjects.push(g);
});

const life=new THREE.Group();life.position.set(0,.2,0);life.scale.set(1.08,1.12,1.08);world.add(life);
cyl(life,.72,1.0,7.8,mats.trunk,0,3.9,0,14);
for(let i=0;i<12;i++){
 const a=i/12*TAU,r=1+Math.random()*1.7;
 const b=cyl(life,.12,.22,2.6,mats.trunk,Math.cos(a)*r*.55,.35,Math.sin(a)*r*.55,8);
 b.rotation.z=Math.cos(a)*.7;b.rotation.x=Math.sin(a)*.7;
}
for(let i=0;i<36;i++){const a=Math.random()*TAU,r=Math.random()*3.5;sph(life,.55+Math.random()*.55,i%3?mats.leaf:mats.leaf2,Math.cos(a)*r,7.1+Math.random()*2.6,Math.sin(a)*r*.7)}
const crown=label("درخت حیات",.72);crown.position.set(0,10.8,0);life.add(crown);

const nodeColors=[0xffd447,0x59c8ff,0x9b80ff,0x48d58b,0xff5964,0xffc638,0x45d7ae,0x9e72ff,0x5f8cff,0x9b653e];
const nodePos=[[0,10.0,0],[-2.4,8.5,.2],[2.4,8.5,.2],[-3.1,6.6,.2],[3.1,6.6,.2],[0,6.5,.5],[-3,4.5,.4],[3,4.5,.4],[0,2.7,.6],[0,.9,.6]];
const nodes=[];
nodePos.forEach((p,i)=>{const n=new THREE.Mesh(new THREE.SphereGeometry(.3,16,10),new THREE.MeshStandardMaterial({color:nodeColors[i],emissive:nodeColors[i],emissiveIntensity:.8}));n.position.set(...p);n.userData={type:"node",index:i};life.add(n);nodes.push(n)});
[[0,1],[0,2],[1,2],[1,3],[2,4],[3,5],[4,5],[3,6],[5,6],[5,7],[4,7],[6,8],[7,8],[8,9]].forEach(([a,b])=>{
 const A=new THREE.Vector3(...nodePos[a]),B=new THREE.Vector3(...nodePos[b]),geo=new THREE.BufferGeometry().setFromPoints([A,B]);
 life.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xf6d568,transparent:true,opacity:.45})));
});

const energy=new THREE.Group();scene.add(energy);
for(let i=0;i<48;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),new THREE.MeshBasicMaterial({color:i%2?0x8ee9ff:0xffe05a}));p.userData.t=i/48;energy.add(p)}

function animal(i){
 const g=new THREE.Group(),m=mat([0xc58e5b,0x96704d,0xd8c7a7,0x73523e][i%4],.8);
 sph(g,.48,m,0,.65,0).scale.set(1.35,.8,.85);sph(g,.28,m,0,.74,.55);
 for(const x of[-.3,.3])for(const z of[-.18,.18])cyl(g,.07,.09,.55,m,x,.22,z,7);
 g.userData={type:"animal",i,phase:Math.random()*TAU};return g;
}
const animals=[];
for(let i=0;i<10;i++){const a=animal(i),ang=i/10*TAU,r=4.7+Math.random()*4;a.position.set(Math.cos(ang)*r,.3,Math.sin(ang)*r*.58);world.add(a);animals.push(a)}

const flowers=new THREE.Group();world.add(flowers);
for(let i=0;i<32;i++){const a=Math.random()*TAU,r=3+Math.random()*11;sph(flowers,.11,mats.flower,Math.cos(a)*r,.42,Math.sin(a)*r*.58)}

/* QUIXEL / FAB ASSET LAYER
   D7: the previous arbitrary remote GLBs are removed.
   The scene now accepts a coherent local Quixel/Fab asset set under
   assets/quixel/. This avoids mixing unrelated asset styles and keeps
   redistribution/licensing under the user's own Fab/Quixel account.
*/
const QUIXEL_ASSETS={
  forestTerrain:"./assets/quixel/forest-terrain.glb",
  broadleafCliff:"./assets/quixel/broadleaf-cliff-l01.glb",
  broadleafRock:"./assets/quixel/broadleaf-rock-l03.glb",
  nordicRock:"./assets/quixel/nordic-forest-cluster-rock-small.glb",
  mossyRockCluster:"./assets/quixel/mossy-rock-cluster.glb",
  englishOak:"./assets/quixel/english-oak.glb",
  balticPine:"./assets/quixel/baltic-pine.glb",
  wildGrass:"./assets/quixel/wild-grass.glb"
};
function prepareQuixelModel(root){
  root.traverse(o=>{
    if(o.isMesh){
      o.castShadow=true;o.receiveShadow=true;
      if(o.material){
        const ms=Array.isArray(o.material)?o.material:[o.material];
        ms.forEach(m=>{
          if("roughness" in m)m.roughness=Math.max(.45,Math.min(.92,m.roughness??.7));
          if("metalness" in m)m.metalness=Math.min(.08,m.metalness||0);
          if("envMapIntensity" in m)m.envMapIntensity=1.2;
        });
      }
    }
  });
}
function setAssetLoadingMessage(message){
  const boot=document.getElementById("bootDebug");
  if(boot) boot.textContent=message;
  const loading=document.querySelector("#loading b");
  if(loading) loading.textContent=message;
}
function loadGLTF(url){
  return new Promise((resolve,reject)=>gltfLoader.load(url,resolve,undefined,reject));
}
function addQuixelClone(source,parent,pos,scale=1,rot=0){
  const c=source.clone(true);c.position.set(...pos);c.rotation.y=rot;c.scale.setScalar(scale);
  prepareQuixelModel(c);parent.add(c);return c;
}
async function loadQuixelWorld(){
  setAssetLoadingMessage("VERSION 2026-09-21-D7 · QUIXEL/FAB ASSETS · CHECKING…");
  try{
    const entries=Object.entries(QUIXEL_ASSETS);
    const loaded=await Promise.allSettled(entries.map(([key,url])=>loadGLTF(url).then(v=>({key,url,scene:v.scene,animations:v.animations||[]}))));
    const ok=loaded.filter(x=>x.status==="fulfilled").map(x=>x.value);
    const byKey=Object.fromEntries(ok.map(x=>[x.key,x]));

    if(!ok.length){
      throw new Error("Quixel GLB files are not installed yet in assets/quixel/");
    }

    ok.forEach(x=>prepareQuixelModel(x.scene));

    // Remove the previous D6 arbitrary remote game assets if they exist.
    assetRoot.clear();

    // Keep the symbolic world, but replace the visible environmental language
    // with coherent photogrammetry assets whenever the corresponding files exist.
    const trees=[byKey.englishOak,byKey.balticPine].filter(Boolean);
    const rocks=[byKey.broadleafRock,byKey.nordicRock,byKey.mossyRockCluster].filter(Boolean);
    const terrain=byKey.forestTerrain;
    const cliff=byKey.broadleafCliff;

    if(terrain){
      for(let i=0;i<4;i++){
        const c=addQuixelClone(terrain.scene,assetRoot,
          [(i%2?1:-1)*(9+i*2),-.15,-8-i*3],
          2.0+(i%2)*.35,(i%4)*1.57);
        c.userData.quixelTerrain=true;
      }
    }

    const treeSpots=[
      [-19,-7,1.5],[-16,0,1.25],[-13,7,1.05],[-9,12,.95],[-4,15,1.05],
      [3,15,.98],[9,12,1.12],[14,7,1.2],[18,0,1.35],[16,-8,1.12],
      [10,-13,1.0],[4,-15,1.08],[-4,-15,1.2],[-12,-12,1.0]
    ];
    if(trees.length){
      treeSpots.forEach((p,i)=>addQuixelClone(
        trees[i%trees.length].scene,assetRoot,[p[0],0,p[1]],p[2],i*.53
      ));
    }

    if(rocks.length){
      for(let i=0;i<34;i++){
        const a=i/34*TAU+(i%3)*.16,r=5.5+(i%8)*1.5;
        addQuixelClone(rocks[i%rocks.length].scene,assetRoot,
          [Math.cos(a)*r,.02,Math.sin(a)*r*.64],
          .32+(i%4)*.11,i*.41);
      }
    }

    if(cliff){
      [[-17,-4,1.1],[17,-5,1.05],[-14,8,.8],[15,10,.82]].forEach((p,i)=>
        addQuixelClone(cliff.scene,assetRoot,[p[0],-.1,p[1]],p[2],i*.8)
      );
    }

    // The hero Tree of Life uses the most natural available broadleaf asset,
    // enlarged and framed by the symbolic energy network.
    if(trees.length){
      const hero=addQuixelClone(trees[0].scene,assetRoot,[0,.05,0],4.8,.2);
      hero.name="TreeOfLife_QUIXEL_HERO";
    }

    // Restore the observer character as a simple neutral marker, not a player.
    // It is intentionally procedural so the environment remains Quixel-led.
    gameplayActor=new THREE.Group();
    gameplayActor.name="ObserverMarker";
    const markerMat=new THREE.MeshStandardMaterial({color:0xffd76a,emissive:0xff9d24,emissiveIntensity:.45,roughness:.6});
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.22,.65,6,10),markerMat);
    body.position.y=.72;body.castShadow=true;gameplayActor.add(body);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(.48,.035,8,32),new THREE.MeshBasicMaterial({color:0xffdf7a,transparent:true,opacity:.8}));
    halo.rotation.x=Math.PI/2;halo.position.y=.18;gameplayActor.add(halo);
    assetRoot.add(gameplayActor);

    setAssetLoadingMessage("VERSION 2026-09-21-D7 · QUIXEL/FAB WORLD · "+ok.length+" ASSET TYPES ACTIVE");
    log("لایهٔ محیطی Quixel/Fab فعال شد؛ مدل‌های ناسازگار قبلی حذف شدند.");
  }catch(err){
    console.warn("Quixel local asset layer unavailable; keeping procedural fallback.",err);
    setAssetLoadingMessage("VERSION 2026-09-21-D7 · QUIXEL ASSETS NOT INSTALLED · FALLBACK");
    log("فایل‌های Quixel هنوز داخل assets/quixel قرار نگرفته‌اند؛ محیط فعلاً با fallback اجرا می‌شود.");
  }
}

const waterfall=new THREE.Group();world.add(waterfall);
for(let i=0;i<6;i++){const w=new THREE.Mesh(new THREE.PlaneGeometry(.7,4.5),new THREE.MeshBasicMaterial({color:0x91e6ff,transparent:true,opacity:.5,side:THREE.DoubleSide}));w.position.set(-9+i*3.6,2.3,-8.2);waterfall.add(w)}

const focusName=document.getElementById("focusName"),focusText=document.getElementById("focusText"),stageNo=document.getElementById("stageNo"),bar=document.getElementById("bar"),chapter=document.getElementById("chapter"),chapterSub=document.getElementById("chapterSub");
const eventLog=document.getElementById("eventLog"),detail=document.getElementById("detail"),detailTitle=document.getElementById("detailTitle"),detailBody=document.getElementById("detailBody"),detailFacts=document.getElementById("detailFacts");
function fa(v){return String(v).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d])}
function log(t){if(!eventLog)return;const p=document.createElement("p");p.textContent="• "+t;eventLog.prepend(p);while(eventLog.children.length>3)eventLog.lastElementChild.remove()}
function setStage(){const s=stages[stage];chapter.textContent=s[0];chapterSub.textContent=s[1];focusName.textContent=s[0];focusText.textContent=s[1]+" این نمایش یک چرخهٔ نمادین و هنری است.";stageNo.textContent=fa((stage+1)+" / "+stages.length);bar.style.width=((stage+1)/stages.length*100)+"%";nodes.forEach((n,i)=>n.scale.setScalar(i===stage%10?1.5:1));zodiacObjects.forEach((o,i)=>o.scale.setScalar(i===stage%12?1.2:1))}

/* GAMEPLAY-STYLE OBSERVER PATH
   The camera behaves like a third-person adventure-game spectator:
   low to the ground, forward-facing, moving through the world automatically.
*/
const observerPath=new THREE.CatmullRomCurve3([
 new THREE.Vector3(0,.95,18),
 new THREE.Vector3(-9,.95,13),
 new THREE.Vector3(-15,0.95,3),
 new THREE.Vector3(-10,0.95,-7),
 new THREE.Vector3(0,0.95,-12),
 new THREE.Vector3(11,0.95,-8),
 new THREE.Vector3(15,0.95,1),
 new THREE.Vector3(9,0.95,12),
 new THREE.Vector3(0,0.95,18)
],true,"catmullrom",.55);

const trailCurve=new THREE.CatmullRomCurve3([
 new THREE.Vector3(0,.045,19),new THREE.Vector3(-8,.045,14),new THREE.Vector3(-13,.045,5),
 new THREE.Vector3(-8,.045,-5),new THREE.Vector3(0,.045,-10),new THREE.Vector3(9,.045,-6),
 new THREE.Vector3(13,.045,3),new THREE.Vector3(7,.045,12),new THREE.Vector3(0,.045,19)
],true,"catmullrom",.55);
const trail=new THREE.Mesh(
 new THREE.TubeGeometry(trailCurve,180,.34,6,true),
 new THREE.MeshStandardMaterial({color:0x7b633f,roughness:1})
);
trail.name="AdventureTrail";
trail.receiveShadow=true;
world.add(trail);

function updateObserver(dt){
 if(!cinematicObserver)return;
 observerT=(observerT+dt*.012*speed)%1;
 observerPath.getPointAt(observerT,observerPos);
 observerPath.getPointAt((observerT+.012)%1,observerLook);
 const tangent=observerLook.clone().sub(observerPos).normalize();
 if(gameplayActor){
   gameplayActor.position.copy(observerPos);
   gameplayActor.rotation.y=Math.atan2(tangent.x,tangent.z);
 }
 if(gameplayMixer) gameplayMixer.update(dt*speed);
 observerLook.copy(observerPos);
 observerLook.y+=1.8;
}

function cameraUpdate(){
 if(cinematicObserver){
   const tangent=observerLook.clone().sub(observerPos).normalize();
   const behind=observerPos.clone().sub(tangent.multiplyScalar(6.2));
   camera.position.lerp(new THREE.Vector3(behind.x,observerPos.y+3.25,behind.z),.16);
   camera.lookAt(observerLook);
   return;
 }
 const target=new THREE.Vector3(0,6.8,0);
 const x=Math.sin(camYaw)*Math.cos(camPitch)*camDist,y=target.y+Math.sin(camPitch)*camDist,z=Math.cos(camYaw)*Math.cos(camPitch)*camDist;
 camera.position.set(x,y,z);camera.lookAt(target);
}
updateObserver(0);
cameraUpdate();

renderer.domElement.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY});
addEventListener("pointerup",()=>dragging=false);
addEventListener("pointermove",e=>{if(!dragging)return;camYaw-=(e.clientX-lastX)*.006;camPitch+=(e.clientY-lastY)*.004;camPitch=Math.max(-.05,Math.min(.7,camPitch));lastX=e.clientX;lastY=e.clientY});
renderer.domElement.addEventListener("wheel",e=>{camDist=Math.max(18,Math.min(42,camDist+e.deltaY*.015))},{passive:true});

function focus(kind){
 if(kind==="sun"){cinematicObserver=false;camDist=22;camPitch=.35;chapter.textContent="خورشید";chapterSub.textContent="منبع نور نمادین"}
 if(kind==="zodiac"){cinematicObserver=false;camDist=24;camPitch=.3;chapter.textContent="۱۲ زودیاک";chapterSub.textContent="حلقهٔ خورشیدی"}
 if(kind==="tree"){cinematicObserver=false;camDist=18;camPitch=.28;chapter.textContent="درخت حیات";chapterSub.textContent="تاج · ریشه · مسیرهای نور"}
 if(kind==="earth"){cinematicObserver=false;camDist=24;camPitch=.12;chapter.textContent="زمین";chapterSub.textContent="محیط زنده و طبیعی"}
 if(kind==="life"){cinematicObserver=false;camDist=20;camPitch=.18;chapter.textContent="حیات";chapterSub.textContent="حرکت و زایش"}
 if(kind==="cycle"){cinematicObserver=true;camDist=16;camPitch=.10;chapter.textContent="چرخهٔ کامل";chapterSub.textContent="نمای گیم‌پلی ناظر · خورشید → زودیاک → درخت → زمین → حیات"}
 cameraUpdate();log("نمای «"+chapter.textContent+"» انتخاب شد.");
}
document.querySelectorAll(".actionbar button[data-action]").forEach(b=>b.onclick=()=>focus(b.dataset.action));
document.getElementById("overview").onclick=()=>focus("cycle");
document.getElementById("cameraReset")?.addEventListener("click",()=>focus("cycle"));
document.getElementById("zoomIn")?.addEventListener("click",()=>{camDist=Math.max(18,camDist-3);cameraUpdate()});
document.getElementById("zoomOut")?.addEventListener("click",()=>{camDist=Math.min(42,camDist+3);cameraUpdate()});
document.getElementById("pause").onclick=e=>{running=!running;e.currentTarget.textContent=running?"Ⅱ توقف":"▶ ادامه"};
document.getElementById("reset").onclick=()=>{stage=0;cycle=0;stageTimer=0;running=true;setStage();focus("cycle")};
document.getElementById("speed").oninput=e=>{speed=Number(e.target.value);document.getElementById("speedText").textContent=fa(speed.toFixed(2).replace(".00",""))+"×"};
document.getElementById("closeDetail").onclick=()=>detail.classList.add("hidden");
document.querySelectorAll(".zitem").forEach(()=>{});
const list=document.getElementById("zodiacList");
zodiac.forEach((z,i)=>{const el=document.createElement("div");el.className="zitem";el.innerHTML="<span class='zi'>"+z[0]+"</span><span>"+z[1]+" · "+z[2]+"</span>";el.onclick=()=>{focus("zodiac");openDetail(z[1],z[2]+" · نشانهٔ نمادین حلقهٔ خورشیدی",["شمارهٔ "+fa(i+1)+" از ۱۲","موجود سه‌بعدی نمادین","حرکت خودکار"])};list.appendChild(el)});
function openDetail(t,b,f){detailTitle.textContent=t;detailBody.textContent=b;detailFacts.innerHTML=f.map(x=>"<div class='detail-fact'><b>•</b>"+x+"</div>").join("");detail.classList.remove("hidden")}
renderer.domElement.addEventListener("click",e=>{
 if(Math.abs(e.clientX-lastX)+Math.abs(e.clientY-lastY)>12)return;
 const ray=new THREE.Raycaster(),m=new THREE.Vector2(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(m,camera);
 const hits=ray.intersectObjects([...zodiacObjects,...nodes,...animals],true);if(!hits.length)return;
 let o=hits[0].object;while(o.parent&&!o.userData.type)o=o.parent;
 if(o.userData.type==="zodiac"){const z=zodiac[o.userData.index];openDetail(z[1],z[2]+" · نشانهٔ نمادین حلقهٔ خورشیدی",["شمارهٔ "+fa(o.userData.index+1)+" از ۱۲","موجود سه‌بعدی نمادین","دوربین ناظر"])}
 else if(o.userData.type==="node")openDetail("گرهٔ درخت حیات","یک نقطهٔ نمادین در ساختار درخت حیات.",["انرژی نور در چرخه حرکت می‌کند","کنترل بازیکن ندارد"]);
 else openDetail("موجود زنده","بخشی از چرخهٔ خودکار محیط.",["حرکت خودکار","نقش: حیات زمینی","کنترل بازیکن: ندارد"]);
});

setStage();log("محیط فانتزی سه‌بعدی آماده شد.");
loadQuixelWorld();
log("دوربین ناظر وارد مسیر گیم‌پلی شد؛ حرکت خودکار و بدون کنترل شخصیت.");log("۱۲ موجود زودیاک، درخت حیات و چرخهٔ حیات فعال شدند.");

function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.05);time+=dt;
 if(running){
  stageTimer+=dt*speed;
  if(stageTimer>3.4){stageTimer=0;stage++;if(stage>=stages.length){stage=0;cycle++;log("چرخهٔ شمارهٔ "+fa(cycle)+" آغاز شد.")}setStage()}
 }
 updateObserver(dt);
 const day=(Math.sin(time*.045)+1)/2;
 const sunA=time*.018*TAU;
 sun.position.set(Math.cos(sunA)*18,18+Math.sin(sunA)*3,-11);
 sunLight.position.copy(sun.position);sunLight.intensity=1.7+day*2.2;hemi.intensity=1.25+day*.7;
 sky.rotation.y+=dt*.001;
 zodiacGroup.rotation.z+=dt*.006;
 life.rotation.y+=dt*.008;
 sun.rotation.z+=dt*.15;sunRing.rotation.y+=dt*.4;
 animals.forEach((a,i)=>{const r=5+(i%4)*1.25,ang=time*(.12+i*.008)+a.userData.phase;a.position.x=Math.cos(ang)*r;a.position.z=Math.sin(ang)*r*.58;a.position.y=.3+Math.sin(time*2+i)*.035;a.rotation.y=-ang+Math.PI/2});
 energy.children.forEach((p,i)=>{const q=(time*.16*speed+i/48)%1,a=q*TAU*2.5,r=3+Math.sin(q*Math.PI)*6.5;p.position.set(Math.cos(a)*r,1+q*15,Math.sin(a)*r*.38);if(q>.92){p.position.lerp(sun.position,.5)}});
 flowers.children.forEach((f,i)=>f.position.y=.42+Math.sin(time*2+i)*.04);
 waterfall.children.forEach((w,i)=>w.material.opacity=.38+.14*Math.sin(time*3+i));
 document.getElementById("cycleEnergy").style.width=(60+Math.sin(time*1.4)*25)+"%";
 document.getElementById("lifeEnergy").style.width=(70+Math.sin(time*1.1+1)*20)+"%";
 cameraUpdate();renderer.render(scene,camera);
}
animate();
setTimeout(()=>{const l=document.getElementById("loading");if(l){l.style.opacity="0";setTimeout(()=>l.remove(),600)}},1200);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.35))});
