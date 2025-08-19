/* ================================
   Vividly Marketing – script.js
================================ */

/* ---------- Helpers ---------- */
const $  = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];

/* ---------- LocalStorage keys ---------- */
const LS_USERS   = 'vm_users';
const LS_CURRENT = 'vm_current_user';

/* ---------- Seed a demo user (once) ---------- */
(() => {
  if (!localStorage.getItem(LS_USERS)) {
    localStorage.setItem(LS_USERS, JSON.stringify([{ username: 'demo', password: 'demo123' }]));
  }
})();

/* ---------- Profile UI (left pill) ---------- */
function initProfileUI() {
  const profileArea = $('#profileArea');
  if (!profileArea) return;

  const userSpan  = $('#currentUser');
  const chevron   = $('#profileChevron');
  const menu      = $('#profileMenu');
  const logoutBtn = $('#logoutBtn');
  const current   = localStorage.getItem(LS_CURRENT);

  if (current) {
    userSpan.textContent = current;
    profileArea.style.display = 'flex';
  } else {
    profileArea.style.display = 'none';
  }

  const closeMenu = () => {
    if (menu) menu.style.display = 'none';
    chevron?.setAttribute('aria-expanded', 'false');
  };

  chevron?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu && menu.style.display === 'flex';
    if (menu) menu.style.display = open ? 'none' : 'flex';
    chevron?.setAttribute('aria-expanded', String(!open));
  });

  document.addEventListener('click', (e) => {
    if (!menu) return;
    if (!menu.contains(e.target) && e.target !== chevron) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem(LS_CURRENT);
    window.location.href = 'register.html';
  });
}

/* ---------- Smooth in‑page anchors ---------- */
function initSmoothAnchors() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id && id !== '#' ? $(id) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });
}

function initTeamSlider() {
  const cards = $$('.team-card');
  const btnPrev = $('.arrow.prev');
  const btnNext = $('.arrow.next');
  if (!cards.length || !btnPrev || !btnNext) return;

  let current = Math.max(cards.findIndex(c => c.classList.contains('active')), 0);

  const show = (i) => {
    current = (i + cards.length) % cards.length;
    cards.forEach((c, idx) => c.classList.toggle('active', idx === current));
  };

  // Bind clicks
  btnPrev.addEventListener('click', () => show(current - 1));
  btnNext.addEventListener('click', () => show(current + 1));

  // Also expose globals in case HTML still uses onclick
  window.prevCard = () => show(current - 1);
  window.nextCard = () => show(current + 1);

  // Optional: keyboard support when slider is in view
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}

/* ---------- Team modal ---------- */
function initTeamModal() {
  const overlay = $('#teamModal');
  const content = $('#modalContent');
  if (!overlay || !content) return;

  const close = () => {
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onEsc);
  };
  const onEsc = (e) => { if (e.key === 'Escape') close(); };

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // expose a helper
  window.openTeamModal = (name, bio) => {
    content.innerHTML = `
      <h2>${name}</h2>
      <p>${bio}</p>
      <span class="close" aria-label="Close" role="button">×</span>
    `;
    content.querySelector('.close').addEventListener('click', close);
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
    document.addEventListener('keydown', onEsc);
  };
}
// alias used above
const openModal = (name, bio) => window.openTeamModal?.(name, bio);

/* ---------- Pretty “Thanks” popup (Contact) ---------- */
function openThanks(message) {
  const overlay = $('#thanksModal');
  const ok = $('#thanksOk');
  const card = overlay?.querySelector('.thanks-card');
  if (!overlay || !ok || !card) { window.alert(message || 'Thank you!'); return; }

  const p = card.querySelector('p');
  if (message && p) p.textContent = message;

  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  ok.focus();

  const close = () => {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.removeEventListener('click', onBackdrop);
    document.removeEventListener('keydown', onEsc);
  };
  const onBackdrop = (e) => { if (e.target === overlay) close(); };
  const onEsc = (e) => { if (e.key === 'Escape') close(); };

  ok.onclick = close;
  overlay.addEventListener('click', onBackdrop);
  document.addEventListener('keydown', onEsc);
}

/* Contact form -> show Thanks popup */
function initContactForm() {
  const form = $('.contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    openThanks('Thank you! We will get back to you.');
    form.reset();
  });
}

/* ---------- Mobile colorful burger (HEADER) ---------- */
function initToolsBurger() {
  const btn = $('#toolsBurger');
  const drawer = $('#toolsMenu'); // matches HTML id
  if (!btn || !drawer) return;

  const openDrawer = () => {
    drawer.hidden = false;                  // reveal element
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  };
  const closeDrawer = () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    drawer.hidden = true;                   // hide again
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  drawer.querySelector('.drawer-close')?.addEventListener('click', closeDrawer);

  drawer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') closeDrawer(); // close on navigation tap
  });

  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && e.target !== btn) closeDrawer();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Close if resized up to desktop
  const mq = window.matchMedia('(min-width: 721px)');
  (mq.addEventListener || mq.addListener).call(
    mq,
    'change',
    (ev) => { if (ev.matches) closeDrawer(); }
  );
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initProfileUI();
  initSmoothAnchors();
  initTeamSlider();
  initTeamModal();
  initContactForm();
  initToolsBurger();
});
// Force colorful, bold roles per card (runtime safety net)
(function () {
  const colors = ['#F95019', '#6A42C2', '#EF3795', '#2397ea', '#00B894'];
  document.querySelectorAll('.team-section .team-slider .team-card').forEach((card, i) => {
    const role = card.querySelector('.member-role');   // <-- correct selector
    if (!role) return;
    role.style.color = colors[i % colors.length];
    role.style.fontWeight = '800';
    role.style.opacity = '1';
  });
})();
