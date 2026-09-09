const gifts=[
 {name:'迪奥唇蜜',image:'dior',tier:'legendary',quality:'传奇',note:'把心动涂成唇色'},
 {name:'富士一次性胶片机',image:'fuji',tier:'premium',quality:'卓越',note:'定格每一份快乐'},
 {name:'蕉下重力眼罩',image:'beneunder',tier:'deluxe',quality:'奢华',note:'今晚，做个好梦'},
 {name:'美迪惠尔湿敷棉片',image:'mediheal',tier:'premium',quality:'卓越',note:'温柔照顾每一天'}
];
const cards=document.querySelector('.cards');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const timers=new Set();
let opened=new Set();
// Reveals are local to this browser; every recipient starts with four covered cards.
try{const stored=JSON.parse(localStorage.getItem('birthday-gifts-v1')||'[]');if(Array.isArray(stored))opened=new Set(stored.filter(n=>Number.isInteger(n)&&n>=0&&n<4));}catch{}
const save=()=>{try{localStorage.setItem('birthday-gifts-v1',JSON.stringify([...opened]));}catch{}};
gifts.forEach((gift,index)=>{
 const card=document.createElement('button');card.className='card';card.dataset.tier=gift.tier;card.dataset.index=index;
 card.innerHTML=`<span class="front" aria-hidden="true"><svg class="watermark"><use href="#${gift.tier}"/></svg><span class="tier-row"><svg class="tier-icon"><use href="#${gift.tier}"/></svg></span><span class="product-area"><img class="product ${gift.image}" src="assets/${gift.image}.webp" alt="" draggable="false"></span><span class="description"><span class="product-name">${gift.name}</span><span class="gift-note">${gift.note}</span></span></span><span class="cover" aria-hidden="true"></span><span class="color-wash" aria-hidden="true"></span><span class="flash" aria-hidden="true"></span>`;
 const label=()=>card.setAttribute('aria-label',opened.has(index)?`${gift.quality}礼物：${gift.name}。${gift.note}`:`揭晓第 ${index+1} 张生日礼物卡片`);
 label();if(opened.has(index)){card.classList.add('revealed');card.setAttribute('aria-disabled','true');}
 card.addEventListener('click',async()=>{
  if(opened.has(index)||card.classList.contains('revealing'))return;
  card.classList.add('revealing');card.setAttribute('aria-disabled','true');
  if(!reduceMotion){const motion=new Image();motion.className='reference-motion';motion.alt='';motion.setAttribute('aria-hidden','true');motion.src=`assets/reveal-${gift.tier}.webp?play=${Date.now()}-${index}`;card.append(motion);motion.onerror=()=>motion.remove();}
  const timer=setTimeout(()=>{card.classList.replace('revealing','revealed');card.querySelector('.reference-motion')?.remove();opened.add(index);save();label();document.querySelector('#announcement').textContent=`揭晓了${gift.quality}礼物：${gift.name}。${opened.size===4?'四份生日礼物已全部揭晓，生日快乐！':''}`;timers.delete(timer);},reduceMotion?180:2650);timers.add(timer);
 });cards.append(card);
});
function updateClock(){const now=new Date();const midnight=new Date(now);midnight.setHours(24,0,0,0);const remaining=Math.floor((midnight-now)/1000);['hours','minutes','seconds'].forEach((id,i)=>document.getElementById(id).textContent=String([Math.floor(remaining/3600),Math.floor(remaining/60)%60,remaining%60][i]).padStart(2,'0'));}
updateClock();setInterval(updateClock,1000);
let toastTimer;function toast(message){const el=document.querySelector('.toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3000);}
const dialog=document.querySelector('#reset-dialog');document.querySelector('.reset').addEventListener('click',()=>{if(!opened.size&&!timers.size){toast('点击任意卡片，拆开你的生日礼物');return;}dialog.showModal();});
dialog.addEventListener('close',()=>{if(dialog.returnValue!=='confirm')return;timers.forEach(clearTimeout);timers.clear();opened.clear();save();document.querySelectorAll('.card').forEach((card,index)=>{card.classList.remove('revealed','revealing');card.querySelector('.reference-motion')?.remove();card.removeAttribute('aria-disabled');card.setAttribute('aria-label',`揭晓第 ${index+1} 张生日礼物卡片`);});document.querySelector('#announcement').textContent='四张卡片已重新盖上';});
document.querySelector('.share').addEventListener('click',async()=>{const data={title:'给你的生日礼物',text:'四份惊喜，等你亲手揭晓。',url:location.href.split('#')[0]};try{if(navigator.share){await navigator.share(data);}else if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(data.url);toast('链接已复制，发给 TA 吧');}else{window.prompt('复制链接，分享你的生日礼物',data.url);}}catch(error){if(error.name!=='AbortError')toast('请复制浏览器地址栏中的链接分享');}});
if(document.modelContext?.registerTool){const lifecycle=new AbortController();try{Promise.resolve(document.modelContext.registerTool({name:'reveal_birthday_gift',description:'揭晓指定的一张生日礼物卡片，等待动画结束后返回礼物名称。',inputSchema:{type:'object',properties:{card:{type:'integer',minimum:1,maximum:4}},required:['card'],additionalProperties:false},annotations:{readOnlyHint:false},async execute(input){if(!input||!Number.isInteger(input.card)||input.card<1||input.card>4)throw new Error('card 必须是 1 至 4 的整数');const index=input.card-1;cards.children[index].click();if(!opened.has(index))await new Promise(resolve=>setTimeout(resolve,reduceMotion?200:2700));return{card:input.card,revealed:opened.has(index),gift:opened.has(index)?gifts[index].name:null};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}
