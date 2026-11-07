/* PRISCO v4 effects layer. Pure enhancement: the site works fully if this never runs. */
(function(){
'use strict';
var d=document,reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function ready(f){d.readyState==='loading'?d.addEventListener('DOMContentLoaded',f):f()}
ready(function(){
  var hdr=d.querySelector('.hdr');
  /* header gets a soft shadow once the page moves */
  var tick=false;
  var top=d.createElement('button');top.type='button';top.className='fx-top';top.setAttribute('aria-label','Back to top');
  top.innerHTML='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5-5 5 5"/></svg>';
  top.addEventListener('click',function(){window.scrollTo({top:0,behavior:reduce?'auto':'smooth'})});
  d.body.appendChild(top);
  function onScroll(){tick=false;var y=window.scrollY;if(hdr)hdr.classList.toggle('fx-solid',y>20);top.classList.toggle('on',y>700)}
  window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();

  /* hero pulse line */
  var hero=d.querySelector('.hero');
  if(hero&&!reduce){
    var w=d.createElement('div');w.className='fx-ecg';w.setAttribute('aria-hidden','true');
    var p='M0 45 H300 L330 45 L345 20 L365 78 L385 8 L405 60 L420 45 H620 L650 45 L665 22 L685 76 L705 12 L725 58 L740 45 H940 L970 45 L985 24 L1005 74 L1025 10 L1045 58 L1060 45 H1340';
    w.innerHTML='<svg viewBox="0 0 1340 90" preserveAspectRatio="none"><defs><linearGradient id="fxg" x1="0" x2="1"><stop offset="0" stop-color="#3fd0d0"/><stop offset="1" stop-color="#c9b78f"/></linearGradient></defs><path class="base" d="'+p+'" stroke="#fff"/><path d="'+p+'"/></svg>';
    hero.appendChild(w);
  }

  /* cursor spotlight and gentle tilt (fine pointers only) */
  var fine=window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var cards=d.querySelectorAll('.dcard,.pcard,.svc-item,.cyc-step,.vstep,.sol-row,.ledger,.pek-card');
  [].forEach.call(cards,function(c){
    c.classList.add('fx-spot');
    if(!fine||reduce)return;
    c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')});
  });

  /* count-up for any element marked data-count (e.g. <b data-count="98.5" data-suffix="%">) */
  var nums=d.querySelectorAll('[data-count]');
  if(nums.length&&'IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(en){en.forEach(function(x){
      if(!x.isIntersecting)return;io.unobserve(x.target);
      var el=x.target,to=parseFloat(el.dataset.count),dec=(el.dataset.count.split('.')[1]||'').length,suf=el.dataset.suffix||'',t0=performance.now();
      (function s(t){var k=Math.min(1,(t-t0)/1200),e=1-Math.pow(1-k,3);el.textContent=(to*e).toFixed(dec)+suf;if(k<1)requestAnimationFrame(s)})(t0);
    })},{threshold:.5});
    [].forEach.call(nums,function(n){io.observe(n)});
  }
});

/* healthcare icons + rotating tagline */
ready(function(){
  var hero=d.querySelector('.hero');if(!hero)return;
  var S={
   cross:'<svg viewBox="0 0 48 48"><path d="M19 6h10v13h13v10H29v13H19V29H6V19h13z"/></svg>',
   shield:'<svg viewBox="0 0 48 48" class="fx-pulse"><path d="M24 5l16 6v12c0 10-7 17-16 20C15 40 8 33 8 23V11z"/><path d="M13 25h6l3-7 4 12 3-5h6"/></svg>',
   helix:'<svg viewBox="0 0 48 96" class="fx-helix"><path d="M10 4c30 14 30 30 0 44s-30 30 0 44"/><path d="M38 4C8 18 8 34 38 48s30 30 0 44"/>'+[12,24,36,48,60,72,84].map(function(y,i){return '<path class="r" style="--k:'+i+'" d="M'+(i%2?'16':'14')+' '+y+'h'+(i%2?'16':'20')+'"/>'}).join('')+'</svg>',
   doc:'<svg viewBox="0 0 48 48"><path d="M12 5h17l8 8v30H12z"/><path d="M29 5v8h8M18 22h14M18 29h14M18 36h8"/></svg>',
   heart:'<svg viewBox="0 0 48 48" class="fx-pulse"><path d="M24 41S6 30 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 13-18 24-18 24z"/><path d="M10 24h9l3-6 4 10 3-4h9"/></svg>',
   steth:'<svg viewBox="0 0 48 48"><path d="M12 6v14a8 8 0 0 0 16 0V6M9 6h6M25 6h6M20 28v5a8 8 0 0 0 16 0v-5"/><circle cx="36" cy="25" r="3.5"/></svg>'
  };
  var spec=[['cross','6%','14%',54,'teal',0,15],['helix','46%','4%',56,'',3,18],['shield','88%','12%',70,'gold',1,16],['doc','51%','42%',60,'',5,13],['heart','4%','62%',64,'gold',2,17],['steth','47%','80%',58,'teal',4,15]];
  var box=d.createElement('div');box.className='fx-icons';box.setAttribute('aria-hidden','true');
  box.innerHTML=spec.map(function(a){return '<span class="fx-ico '+a[4]+'" style="left:'+a[1]+';top:'+a[2]+';--s:'+a[3]+'px;--d:-'+a[5]+'s;--t:'+a[6]+'s">'+S[a[0]]+'</span>'}).join('');
  hero.insertBefore(box,hero.firstChild);
  var h1=hero.querySelector('h1');if(!h1)return;
  var words=['Precision','Knowledge','Excellence'],tag=d.createElement('p');tag.className='fx-tag';
  tag.setAttribute('aria-label','Precision. Knowledge. Excellence.');
  tag.innerHTML='<i aria-hidden="true"></i><span aria-hidden="true">Prisco</span><b aria-hidden="true">'+words[0]+'</b>';
  h1.parentNode.insertBefore(tag,h1);
  if(reduce)return;
  var b=tag.querySelector('b'),n=0;
  setInterval(function(){b.classList.add('out');setTimeout(function(){n=(n+1)%3;b.textContent=words[n];b.classList.remove('out')},350)},2600);
});
})();
