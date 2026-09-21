const stages=[
{name:'کِتِر · تاج',text:'آغاز چرخه؛ نقطهٔ نمادینِ مبدأ در این مدل.',color:'#b89b5e'},
{name:'حُخما · حکمت',text:'انرژی چرخه به ایده و امکان تبدیل می‌شود؛ فقط در زبان نمادین.',color:'#8b8ea3'},
{name:'بیناه · فهم',text:'ایده به ساختار و درک تبدیل می‌شود؛ مشاهده، نه ادعای علمی.',color:'#52658e'},
{name:'حِسِد · رحمت',text:'چرخه به سمت گسترش، بخشش و فراوانی نمادین حرکت می‌کند.',color:'#55a6c8'},
{name:'گِووراه · شدت',text:'مرحلهٔ محدودیت و نظم؛ چرخه بدون این گام کامل نیست.',color:'#d94e48'},
{name:'تیفِرِت · زیبایی',text:'مرکز چرخه: تعادل نمادین میان قطب‌های مختلف.',color:'#e8c348'},
{name:'نِتسَح · پیروزی',text:'حرکت، استمرار و میل به ادامهٔ مسیر.',color:'#46aa65'},
{name:'هود · شکوه',text:'نام‌گذاری، بیان و تبدیل تجربه به نشانه.',color:'#e89a2f'},
{name:'یسود · بنیاد',text:'اتصال و آماده‌سازی برای بازگشت چرخه به جهان مادی.',color:'#8a4dc4'},
{name:'ملکوت · پادشاهی',text:'چرخه به سطح مادی می‌رسد؛ سپس دوباره از آغاز حرکت می‌کند.',color:'#6e6e62'}];
const diagram=document.getElementById('treeDiagram'),cropRow=document.getElementById('cropRow'),title=document.getElementById('stageTitle'),textEl=document.getElementById('stageText'),progress=document.getElementById('progress'),cycleEl=document.getElementById('cycleCount'),toggle=document.getElementById('toggle'),restart=document.getElementById('restart'),speed=document.getElementById('speed'),speedValue=document.getElementById('speedValue');
for(let i=0;i<24;i++){const c=document.createElement('div');c.className='crop';c.style.animationDelay=i*.08+'s';cropRow.appendChild(c)}
const positions=[[50,5],[73,16],[27,16],[76,34],[24,34],[50,48],[76,61],[24,61],[50,75],[50,90]];
const nodes=stages.map((s,i)=>{const n=document.createElement('div');n.className='node';n.style.left='calc('+positions[i][0]+'% - 27px)';n.style.top='calc('+positions[i][1]+'% - 27px)';n.style.borderColor=s.color;n.innerHTML='<small>'+(i+1)+'<br>'+s.name.split('·')[0]+'</small>';diagram.appendChild(n);return n});
for(let i=0;i<9;i++){const [x1,y1]=positions[i],[x2,y2]=positions[i+1],dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)*180/Math.PI,p=document.createElement('div');p.className='path';p.style.width=len+'%';p.style.left=x1+'%';p.style.top=y1+'%';p.style.transform='rotate('+angle+'deg)';diagram.appendChild(p)}
const dot=document.createElement('div');dot.className='flow-dot';diagram.appendChild(dot);let index=0,cycle=0,running=true,timer=null;
function render(){nodes.forEach((n,i)=>n.classList.toggle('active',i===index));const [x,y]=positions[index];dot.style.left='calc('+x+'% - 6px)';dot.style.top='calc('+y+'% - 6px)';title.textContent=stages[index].name;textEl.textContent=stages[index].text;progress.style.width=((index+1)/stages.length*100)+'%';cycleEl.textContent='چرخه '+cycle}
function schedule(){clearTimeout(timer);if(!running)return;timer=setTimeout(()=>{index++;if(index>=stages.length){index=0;cycle++}render();schedule()},2200/Number(speed.value))}
toggle.onclick=()=>{running=!running;toggle.textContent=running?'⏸ توقف چرخه':'▶ ادامهٔ چرخه';if(running)schedule();else clearTimeout(timer)};
restart.onclick=()=>{index=0;cycle=0;running=true;toggle.textContent='⏸ توقف چرخه';render();schedule()};
speed.oninput=()=>{speedValue.textContent=Number(speed.value).toFixed(1).replace('.0','')+'×';if(running)schedule()};render();schedule();