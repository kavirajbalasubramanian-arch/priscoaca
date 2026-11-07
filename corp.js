/* PRISCO v14: dropdown menus and FAQ bot. Enhancement only; the site works if this never runs. */
(function(){'use strict';var d=document;function r(f){d.readyState==='loading'?d.addEventListener('DOMContentLoaded',f):f()}
r(function(){
 var acad=d.body.classList.contains('theme-academy');
 d.querySelectorAll('.dd-b').forEach(function(b){b.addEventListener('click',function(){var p=b.parentNode,o=p.classList.toggle('on');b.setAttribute('aria-expanded',o)})});
 /* FAQ bot */
 var home=acad?'enrol.html':'index.html#contact',form='<a href="'+home+'">enquiry form</a>';
 var P=[
 [/service|offer|what do you do|rcm|revenue/,'We support US providers with medical coding, coding quality assurance, denial management, E/M and ED coding, and revenue cycle support. See the Services section for details.'],
 [/denial|appeal/,'Our denial work groups denials by cause and payer, prepares appeals on time and reports repeat denials so the root cause gets fixed.'],
 [/hipaa|phi|secur|baa|privacy/,'A BAA is signed before any PHI is accessed, access is restricted and logged, and the public site is never a channel for patient data. Details are on the Trust page.'],
 [/pilot|start|onboard|begin/,'We begin with a short discovery, then a pilot on a sample of your work, then integrate into your workflow with regular reviews. Send us a note through the '+form+'.'],
 [/kpi|report|metric|accuracy|score/,'We agree targets such as coding accuracy, days in A/R, net collection and first-pass acceptance with each client, and report on them regularly.'],
 [/where|location|india|coimbatore|address|time/,'We work from Coimbatore, India and support US healthcare teams. Use the '+form+' and we will reply by email.'],
 [/ncci|icd|cpt|hcpcs|code/,'Our coders work with ICD-10-CM, ICD-10-PCS, CPT, HCPCS Level II and NCCI edits, always checked against the documentation.'],
 [/fee|price|cost|charge/,'Pricing depends on scope and volume. Please share your needs through the '+form+' and the team will respond by email.'],
 [/contact|email|reach|talk|enquir|inquir/,'The quickest way is the '+form+'. Our team replies by email.']];
 var A=[
 [/course|module|program|train|learn|syllabus/,'We train in medical coding and billing, CPC/CCS certification preparation, E/M for IP and OP, ED pro-fee and facility coding, cross training and denial management. See the Courses page.'],
 [/cpc|ccs|coc|certif|aapc|ahima|exam/,'We prepare you for CPC, COC and CCS with structured modules, coding practice, trainer feedback and mock assessments before the final exam-prep stage.'],
 [/eligib|who can|fresher|graduate|qualif|background/,'Freshers, graduates and working professionals can join. A life-science or healthcare background helps but is not required.'],
 [/online|classroom|mode|batch|timing/,'Both online and classroom options are available. Tell us what suits you through the '+form+'.'],
 [/job|career|hire|placement|work/,'After certification preparation we support you with interview readiness and information on openings. Hiring depends on your performance. See Careers for open roles.'],
 [/fee|price|cost|charge|discount/,'Fees depend on the module you choose. Please send an enquiry through the '+form+' and an advisor will reply by email.'],
 [/mock|assessment|practice|test/,'Mock assessments and real coding exercises are part of the training, with trainer feedback after each.'],
 [/contact|email|reach|talk|enrol|enroll|join|apply|enquir|inquir/,'Use the '+form+' to enrol or ask a question. An advisor replies by email.']];
 var K=acad?A:P,chips=acad?['Which courses do you offer?','How does CPC/CCS prep work?','Who can join?','Online or classroom?','How do I enrol?']:['What services do you offer?','How do you handle denials?','Is PHI safe with you?','How do we start a pilot?','How do I contact you?'];
 var b=d.createElement('button');b.className='pbot-b';b.type='button';b.setAttribute('aria-label','Open FAQ assistant');b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.4A8 8 0 1 1 21 12z"/><path d="M9 11h6M9 14h4"/></svg>';
 var p=d.createElement('div');p.className='pbot';p.setAttribute('role','dialog');p.setAttribute('aria-label','FAQ assistant');
 p.innerHTML='<header><span>Prisco FAQ assistant</span><button type="button" aria-label="Close">&times;</button></header><div class="log" aria-live="polite"></div><div class="qs"></div><form><input type="text" placeholder="Type your question" aria-label="Type your question" maxlength="200" autocomplete="off"><button type="submit">Send</button></form>';
 d.body.appendChild(p);d.body.appendChild(b);
 var log=p.querySelector('.log'),qs=p.querySelector('.qs'),inp=p.querySelector('input');
 function add(h,u){var m=d.createElement('div');m.className='m'+(u?' u':'');if(u)m.textContent=h;else m.innerHTML=h;log.appendChild(m);log.scrollTop=log.scrollHeight}
 function ask(q){add(q,1);var t=q.toLowerCase(),a='I may not have that answer. Please send it through the '+form+' and our team will reply by email.';
  for(var i=0;i<K.length;i++){if(K[i][0].test(t)){a=K[i][1];break}}setTimeout(function(){add(a)},250)}
 chips.forEach(function(c){var x=d.createElement('button');x.type='button';x.textContent=c;x.onclick=function(){ask(c)};qs.appendChild(x)});
 p.querySelector('form').onsubmit=function(e){e.preventDefault();if(inp.value.trim()){ask(inp.value.trim());inp.value=''}};
 var first=1;function tog(o){p.classList.toggle('on',o);if(o){if(first){add('Hello! I answer common questions about '+(acad?'our courses and certification prep':'our services, security and how to get started')+'. Pick a question or type your own.');first=0}inp.focus()}else b.focus()}
 b.onclick=function(){tog(!p.classList.contains('on'))};p.querySelector('header button').onclick=function(){tog(0)};
 d.addEventListener('keydown',function(e){if(e.key==='Escape'&&p.classList.contains('on'))tog(0)});
});})();
