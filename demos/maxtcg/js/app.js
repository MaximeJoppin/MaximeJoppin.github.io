/* MaxTCG — démo autonome (données d'exemple, aucun vrai paiement) */
const C={pokemon:'Pokémon',onepiece:'One Piece',riftbounds:'Rift Bounds'};
const COL={pokemon:['#f5c518','#e11d48'],onepiece:['#ef4444','#f59e0b'],riftbounds:['#14b8a6','#6366f1']};
// c=catégorie, t=type, s=stock, o=ancien prix, nw=nouveau
const P=[
{id:1,c:'pokemon',t:'Coffret',n:'ETB Zénith Suprême',p:74.9,s:3,k:'box'},
{id:2,c:'pokemon',t:'Booster',n:'Booster ME2',p:5.9,s:40,nw:1,k:'pack'},
{id:3,c:'pokemon',t:'Display',n:'Display JAP ME1 Lucario',p:169.9,o:189.9,s:2,k:'box'},
{id:4,c:'pokemon',t:'Carte',n:'Pikachu V – Promo SWSH061',p:19.9,o:24.9,s:5,k:'card'},
{id:5,c:'pokemon',t:'Accessoire',n:'Classeur Premium 9 poches',p:24.9,s:12,k:'flat'},
{id:6,c:'pokemon',t:'Carte',n:'Dracaufeu VMAX – gradée PSA 10',p:1800,s:1,k:'card'},
{id:7,c:'pokemon',t:'Booster',n:'Tripack Écarlate et Violet',p:14.9,s:0,k:'pack'},
{id:8,c:'onepiece',t:'Booster',n:'Booster OP-09',p:4.5,s:60,nw:1,k:'pack'},
{id:9,c:'onepiece',t:'Display',n:'Display OP-09 (24 boosters)',p:99.9,s:6,nw:1,k:'box'},
{id:10,c:'onepiece',t:'Deck',n:'Starter Deck Luffy',p:12.9,o:15.9,s:9,k:'box'},
{id:11,c:'onepiece',t:'Accessoire',n:'Playmat Gear 5',p:29.9,s:7,k:'flat'},
{id:12,c:'onepiece',t:'Accessoire',n:'100 pochettes Grand Line',p:7.9,s:25,k:'flat'},
{id:13,c:'riftbounds',t:'Booster',n:'Booster Origins',p:5.5,s:50,nw:1,k:'pack'},
{id:14,c:'riftbounds',t:'Display',n:'Display Origins (24 boosters)',p:124.9,s:4,k:'box'},
{id:15,c:'riftbounds',t:'Deck',n:'Deck de démarrage Origins',p:19.9,o:22.9,s:8,k:'box'},
{id:16,c:'riftbounds',t:'Accessoire',n:'Playmat Runeterra',p:27.9,s:0,k:'flat'}
];
const $=(s,r=document)=>r.querySelector(s),A=(s,r=document)=>[...r.querySelectorAll(s)];
const fmt=n=>n.toFixed(2).replace('.',',')+' €';
const get=id=>P.find(p=>p.id==id);
let S={cart:{},fav:[],promo:''};
try{Object.assign(S,JSON.parse(localStorage.getItem('mtcg')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('mtcg',JSON.stringify(S))}catch(e){}$('#cnt').textContent=Object.values(S.cart).reduce((a,b)=>a+b,0);$('#fcnt').textContent=S.fav.length};

function svgArt(p){const [a,b]=COL[p.c],l=C[p.c].toUpperCase();let f;
 if(p.k=='pack')f=`<path d="M95 40l10-10 10 10 10-10 10 10 10-10 10 10 10-10 10 10v220l-10 10-10-10-10 10-10-10-10 10-10-10-10 10-10-10z" fill="url(#g)" stroke="#fff3" /><circle cx="150" cy="140" r="34" fill="#0006"/>`;
 else if(p.k=='box')f=`<rect x="55" y="70" width="190" height="160" rx="10" fill="url(#g)" stroke="#fff3"/><rect x="55" y="70" width="190" height="34" rx="10" fill="#0005"/>${[0,1,2,3].map(i=>`<rect x="${72+i*43}" y="125" width="33" height="85" rx="4" fill="#0004"/>`).join('')}`;
 else if(p.k=='card')f=`<rect x="85" y="45" width="130" height="210" rx="12" fill="url(#g)" stroke="#fffa" stroke-width="3"/><rect x="100" y="62" width="100" height="100" rx="6" fill="#0005"/><rect x="100" y="178" width="100" height="10" rx="3" fill="#fff6"/><rect x="100" y="198" width="70" height="10" rx="3" fill="#fff4"/>`;
 else f=`<rect x="45" y="80" width="210" height="140" rx="12" fill="url(#g)" stroke="#fff3"/><path d="M45 130h210M45 175h210M150 80v140" stroke="#0004" stroke-width="3"/>`;
 return `<svg viewBox="0 0 300 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="300" height="300" fill="#0d0d20"/>${f}<text x="150" y="285" fill="#fff" font-size="15" font-family="Barlow Condensed,sans-serif" font-weight="800" text-anchor="middle" letter-spacing="2">${l}</text></svg>`}
const art=p=>`<div class="ph">${svgArt(p)}<img src="images/produits/${p.id}.jpg" alt="${p.n}" loading="lazy" onerror="if(!this.dataset.t){this.dataset.t=1;this.src=this.src.replace('.jpg','.png')}else this.remove()"></div>`;
const price=p=>`<span class="pr">${fmt(p.p)}</span>${p.o?` <s>${fmt(p.o)}</s>`:''}`;
const flags=p=>`<div class="fl">${p.nw?'<b class="n">NOUVEAU</b>':''}${p.o?'<b class="d">PROMO !</b>':''}${!p.s?'<b class="x">RUPTURE</b>':''}</div>`;
const card=p=>`<article class="pc"><a href="#/p/${p.id}" class="im">${art(p)}${flags(p)}</a><button class="hrt ${S.fav.includes(p.id)?'on':''}" data-fav="${p.id}" title="Favori">♥</button><div class="pd"><a href="#/p/${p.id}" class="pt">${p.n}</a><div>${price(p)}</div><button class="mtcg-btn mtcg-btn--primary sm" data-add="${p.id}" ${p.s?'':'disabled'}>${p.s?'AJOUTER':'INDISPONIBLE'}</button></div></article>`;
const grid=l=>l.length?`<div class="pg">${l.map(card).join('')}</div>`:'<p class="empty">Aucun produit ne correspond.</p>';
const wrap=h=>`<div class="mtcg-container pad">${h}</div>`;
const bc=(...x)=>`<nav class="bc"><a href="#/">Accueil</a> / ${x.join(' / ')}</nav>`;

/* PAGES */
function home(){$('#app').innerHTML=$('#home').innerHTML;$('#feat').innerHTML=grid(P.filter(p=>p.nw||p.o).slice(0,8))}
let F;
function cat(id){const T={all:'Tous les produits',new:'Nouveautés',promo:'Promotions',...C};
 if(!T[id])return nf();F={st:0,pr:0,ty:[],mx:2000,so:'rel',pg:1};
 const base=P.filter(p=>id=='all'||(id=='new'?p.nw:id=='promo'?p.o:p.c==id));
 listing(T[id],base)}
function listing(title,base){const types=[...new Set(base.map(p=>p.t))],max=Math.ceil(Math.max(...base.map(p=>p.p),1));F.mx=F.mx>max?max:F.mx;F.max=max;
 $('#app').innerHTML=wrap(bc(title)+`<div class="lay"><aside class="flt"><h4>FILTRER PAR</h4><label><input type="checkbox" id="fst"> En stock</label><label><input type="checkbox" id="fpr"> En promo</label><h5>TYPE</h5>${types.map(t=>`<label><input type="checkbox" class="fty" value="${t}"> ${t}</label>`).join('')}<h5>PRIX MAXIMUM : <span id="pv">${max} €</span></h5><input type="range" id="fmx" min="1" max="${max}" value="${max}"><button class="mtcg-btn mtcg-btn--outline sm" id="fcl">TOUT EFFACER</button></aside><section><h1 class="mtcg-section-title">${title.toUpperCase()}</h1><div class="bar"><span id="nb"></span><select id="fso"><option value="rel">Pertinence</option><option value="asc">Prix croissant</option><option value="desc">Prix décroissant</option><option value="az">Nom A–Z</option></select></div><div id="lst"></div><div id="pgn" class="pgn"></div></section></div>`);
 const upd=()=>{F.st=$('#fst').checked;F.pr=$('#fpr').checked;F.ty=A('.fty:checked').map(x=>x.value);F.mx=+$('#fmx').value;F.so=$('#fso').value;$('#pv').textContent=F.mx+' €';F.pg=1;draw()};
 const draw=()=>{let l=base.filter(p=>(!F.st||p.s)&&(!F.pr||p.o)&&(!F.ty.length||F.ty.includes(p.t))&&p.p<=F.mx);
  if(F.so=='asc')l.sort((a,b)=>a.p-b.p);if(F.so=='desc')l.sort((a,b)=>b.p-a.p);if(F.so=='az')l.sort((a,b)=>a.n.localeCompare(b.n));
  const n=Math.ceil(l.length/6)||1;$('#nb').textContent=`Il y a ${l.length} produit${l.length>1?'s':''}.`;$('#lst').innerHTML=grid(l.slice((F.pg-1)*6,F.pg*6));
  $('#pgn').innerHTML=n>1?Array.from({length:n},(_,i)=>`<button class="${i+1==F.pg?'on':''}" data-pg="${i+1}">${i+1}</button>`).join(''):'';
  A('[data-pg]').forEach(b=>b.onclick=()=>{F.pg=+b.dataset.pg;draw();scrollTo(0,0)})};
 A('.flt input,#fso').forEach(e=>e.oninput=upd);$('#fcl').onclick=()=>cat(location.hash.split('/')[2]||'all');draw()}
function search(q){q=decodeURIComponent(q||'').toLowerCase();F={st:0,pr:0,ty:[],mx:2000,so:'rel',pg:1};listing(`Recherche : ${q}`,P.filter(p=>(p.n+C[p.c]+p.t).toLowerCase().includes(q)))}
function prod(id){const p=get(id);if(!p)return nf();
 $('#app').innerHTML=wrap(bc(`<a href="#/c/${p.c}">${C[p.c]}</a>`,p.n)+`<div class="pp"><div class="pim">${art(p)}${flags(p)}</div><div><h1 class="mtcg-section-title">${p.n.toUpperCase()}</h1><p class="big">${price(p)}${p.o?` <b class="d">-${Math.round((1-p.p/p.o)*100)}%</b>`:''}</p><p class="${p.s?'ok':'ko'}">${p.s?(p.s<5?`Plus que ${p.s} en stock`:'En stock'):'Rupture de stock'}</p><div class="qty"><button data-q="-">−</button><input id="qv" value="1" readonly><button data-q="+">+</button></div> <button class="mtcg-btn mtcg-btn--primary" data-add="${p.id}" data-qty ${p.s?'':'disabled'}>AJOUTER AU PANIER</button> <button class="hrt inl ${S.fav.includes(p.id)?'on':''}" data-fav="${p.id}">♥</button>
 <div class="tabs"><b class="on" data-tab="0">Description</b><b data-tab="1">Détails</b><b data-tab="2">Livraison</b></div><div class="tc" id="tc"></div></div></div><h2 class="mtcg-section-title">VOUS AIMEREZ <span>AUSSI</span></h2>${grid(P.filter(x=>x.c==p.c&&x.id!=p.id).slice(0,4))}`);
 const T=[`Produit officiel ${C[p.c]} (${p.t.toLowerCase()}). Exemple de fiche : texte à remplacer par la vraie description.`,`<table><tr><td>Univers</td><td>${C[p.c]}</td></tr><tr><td>Type</td><td>${p.t}</td></tr><tr><td>Référence</td><td>MTCG-${1000+p.id}</td></tr></table>`,'Expédition sous 24 h ouvrées. Livraison offerte dès 60 €.'];
 const tab=i=>{$('#tc').innerHTML=T[i];A('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab==i))};A('[data-tab]').forEach(b=>b.onclick=()=>tab(b.dataset.tab));tab(0)}
const tot=()=>{const sub=Object.entries(S.cart).reduce((a,[i,q])=>a+get(i).p*q,0),rem=S.promo=='MAXTCG10'?sub*.1:0,ship=sub-rem>=60||!sub?0:4.9;return{sub,rem,ship,t:sub-rem+ship}};
function cart(){const e=Object.entries(S.cart),t=tot();
 $('#app').innerHTML=wrap(bc('Panier')+`<h1 class="mtcg-section-title">MON <span>PANIER</span></h1>`+(e.length?`<div class="lay2"><div>${e.map(([i,q])=>{const p=get(i);return `<div class="cl"><div class="th">${art(p)}</div><div class="ci"><a href="#/p/${i}" class="pt">${p.n}</a><div>${fmt(p.p)}</div></div><div class="qty"><button data-cq="${i}" data-d="-1">−</button><input value="${q}" readonly><button data-cq="${i}" data-d="1">+</button></div><b>${fmt(p.p*q)}</b><button class="rm" data-rm="${i}">✕</button></div>`}).join('')}</div><aside class="sum"><p>Sous-total <b>${fmt(t.sub)}</b></p>${t.rem?`<p>Code MAXTCG10 <b>-${fmt(t.rem)}</b></p>`:''}<p>Livraison <b>${t.ship?fmt(t.ship):'Offerte'}</b></p><p class="tt">Total <b>${fmt(t.t)}</b></p><div class="pcode"><input id="pc" placeholder="Code promo (essayez MAXTCG10)" value="${S.promo}"><button class="mtcg-btn mtcg-btn--outline sm" id="pa">OK</button></div><a href="#/commande" class="mtcg-btn mtcg-btn--primary">COMMANDER</a></aside></div>`:`<p class="empty">Votre panier est vide.</p><a href="#/c/all" class="mtcg-btn mtcg-btn--primary">VOIR LA BOUTIQUE</a>`));
 const pa=$('#pa');if(pa)pa.onclick=()=>{S.promo=$('#pc').value.trim().toUpperCase();save();cart()}}
function checkout(){if(!Object.keys(S.cart).length)return location.hash='#/panier';const t=tot();
 $('#app').innerHTML=wrap(bc('<a href="#/panier">Panier</a>','Commande')+`<h1 class="mtcg-section-title">FINALISER LA <span>COMMANDE</span></h1><p class="note">Démo : aucun paiement réel n'est effectué.</p><form id="ck" class="lay2"><div class="fm"><h4>ADRESSE</h4><input required placeholder="Prénom Nom"><input required type="email" placeholder="E-mail"><input required placeholder="Adresse"><div class="r2"><input required placeholder="Code postal" pattern="[0-9]{5}"><input required placeholder="Ville"></div><h4>PAIEMENT</h4><label><input type="radio" name="m" checked> Carte bancaire (simulée)</label><label><input type="radio" name="m"> PayPal (simulé)</label></div><aside class="sum"><p>Articles <b>${Object.values(S.cart).reduce((a,b)=>a+b,0)}</b></p><p class="tt">Total <b>${fmt(t.t)}</b></p><button class="mtcg-btn mtcg-btn--primary">CONFIRMER LA COMMANDE</button></aside></form>`);
 $('#ck').onsubmit=e=>{e.preventDefault();const n='MTCG-'+Math.floor(Math.random()*900000+100000);S.cart={};S.promo='';save();$('#app').innerHTML=wrap(`<div class="ok-box"><h1 class="mtcg-section-title">MERCI POUR VOTRE <span>COMMANDE</span></h1><p>Commande <b>${n}</b> enregistrée (démo).</p><a href="#/" class="mtcg-btn mtcg-btn--primary">RETOUR À L'ACCUEIL</a></div>`)}}
const favs=()=>{$('#app').innerHTML=wrap(bc('Favoris')+`<h1 class="mtcg-section-title">MES <span>FAVORIS</span></h1>`+grid(S.fav.map(get).filter(Boolean)))};
const nf=()=>{$('#app').innerHTML=wrap('<h1 class="mtcg-section-title">PAGE <span>INTROUVABLE</span></h1><a href="#/" class="mtcg-btn mtcg-btn--primary">ACCUEIL</a>')};

/* ROUTEUR */
function route(){const [,r,a]=location.hash.split('/');A('.menu a').forEach(x=>x.classList.toggle('cur',x.getAttribute('href')=='#/c/'+a&&r=='c'));
 ({'':home,c:()=>cat(a||'all'),p:()=>prod(a),panier:cart,commande:checkout,favoris:favs,q:()=>search(a)}[r||'']||nf)();scrollTo(0,0);save();$('#nav').classList.remove('open')}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2200)}
document.addEventListener('click',e=>{const t=e.target.closest('[data-add],[data-fav],[data-q],[data-cq],[data-rm],#burger,#login,.mclose');if(!t)return;
 if(t.dataset.add){const p=get(t.dataset.add),n=t.hasAttribute('data-qty')?+$('#qv').value:1;S.cart[p.id]=Math.min((S.cart[p.id]||0)+n,p.s);save();$('#modal').innerHTML=`<div class="mb"><button class="mclose">✕</button><h3>PRODUIT AJOUTÉ AU PANIER</h3><div class="cl"><div class="th">${art(p)}</div><div class="ci"><b>${p.n}</b><div>${fmt(p.p)}</div></div></div><a href="#/c/all" class="mtcg-btn mtcg-btn--outline mclose">CONTINUER</a> <a href="#/panier" class="mtcg-btn mtcg-btn--primary mclose">COMMANDER</a></div>`;$('#modal').classList.add('show')}
 else if(t.dataset.fav){const i=+t.dataset.fav,k=S.fav.indexOf(i);k<0?S.fav.push(i):S.fav.splice(k,1);save();t.classList.toggle('on');toast(k<0?'Ajouté aux favoris':'Retiré des favoris');if(location.hash=='#/favoris')favs()}
 else if(t.dataset.q){const v=$('#qv'),p=get(location.hash.split('/')[2]);v.value=Math.max(1,Math.min(p.s||1,+v.value+(t.dataset.q=='+'?1:-1)))}
 else if(t.dataset.cq){const i=t.dataset.cq,q=S.cart[i]+ +t.dataset.d;q<1?delete S.cart[i]:S.cart[i]=Math.min(q,get(i).s);save();cart()}
 else if(t.dataset.rm){delete S.cart[t.dataset.rm];save();cart()}
 else if(t.id=='burger')$('#nav').classList.toggle('open');
 else if(t.id=='login'){$('#modal').innerHTML=`<div class="mb"><button class="mclose">✕</button><h3>CONNEXION</h3><input placeholder="E-mail"><input type="password" placeholder="Mot de passe"><button class="mtcg-btn mtcg-btn--primary mclose">SE CONNECTER (DÉMO)</button></div>`;$('#modal').classList.add('show')}
 else $('#modal').classList.remove('show')});
$('#modal').addEventListener('click',e=>{if(e.target.id=='modal')e.target.classList.remove('show')});
$('#sf').onsubmit=e=>{e.preventDefault();const q=$('#sq').value.trim();if(q)location.hash='#/q/'+encodeURIComponent(q)};
addEventListener('hashchange',route);route();
