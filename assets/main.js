// Menu mobile
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
}

// Formulaire : pas de serveur en local, on ouvre donc la messagerie
// avec le message pré-rempli (adresse définie dans data-mailto).
const form = document.querySelector('form[data-mailto]');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const body = [...data.entries()].map(([k, v]) => `${k} : ${v}`).join('\n');
    window.location.href =
      `mailto:${form.dataset.mailto}?subject=${encodeURIComponent('Message depuis ton portfolio')}&body=${encodeURIComponent(body)}`;
    form.querySelector('.form-status').textContent = 'Votre messagerie va s’ouvrir avec le message prêt à envoyer.';
  });
}

// Projecteur lumineux qui suit la souris (écrans à pointeur précis uniquement)
const spot = document.querySelector('.bg .spot');
if (spot && matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('pointermove', (e) => {
    spot.style.left = e.clientX + 'px';
    spot.style.top = e.clientY + 'px';
  }, { passive: true });
}

// Visionneuse d'images des études de cas
const lb = document.querySelector('.lightbox');
if (lb) {
  const img = lb.querySelector('img');
  const cap = lb.querySelector('p');
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
  document.querySelectorAll('.zoom').forEach((btn) =>
    btn.addEventListener('click', () => {
      img.src = btn.dataset.src;
      img.alt = btn.dataset.caption || '';
      cap.textContent = btn.dataset.caption || '';
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    })
  );
  lb.addEventListener('click', (e) => { if (e.target !== img) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) close(); });
}

// Apparition des blocs au défilement
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const targets = document.querySelectorAll('.feature, .card, .others > li, .skills > div, .timeline li, .certs, .cs-block');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach((t) => { t.classList.add('reveal'); io.observe(t); });
}
