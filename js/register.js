/* ================================
   Vividly Marketing – register.js
   (popup + home button matching Banner page)
================================ */

const LS_USERS   = 'vm_users';
const LS_CURRENT = 'vm_current_user';

const $  = (q, r=document) => r.querySelector(q);
const $$ = (q, r=document) => [...r.querySelectorAll(q)];

/* Seed demo user once */
(() => {
  if (!localStorage.getItem(LS_USERS)) {
    localStorage.setItem(LS_USERS, JSON.stringify([{ username: 'demo', password: 'demo123' }]));
  }
})();

/* ---------------- Popup (auto-injected) ---------------- */
function ensurePopupUI() {
  if (document.getElementById('vm-pop-overlay')) return;

  // Styles (includes popup + Home button identical to banner page)
  const css = `
  .vm-pop-overlay{
    position:fixed; inset:0; display:none;
    justify-content:center; align-items:center;
    background:rgba(0,0,0,.5); z-index:9999;
    backdrop-filter: blur(2px);
  }
  .vm-pop{
    width:min(90vw,420px);
    background:#fff; color:#2c1c3c; border-radius:18px;
    box-shadow:0 22px 60px rgba(0,0,0,.28);
    padding:22px 22px 20px; text-align:center;
    transform:translateY(8px); opacity:0;
    transition:opacity .18s ease, transform .18s ease;
  }
  .vm-pop.show{ opacity:1; transform:translateY(0) }
  .vm-pop .title{ font-weight:900; margin:2px 0 8px; font-size:1.15rem; }
  .vm-pop .msg{ margin:0 0 14px; line-height:1.45 }
  .vm-pop .ok{
    appearance:none; border:0; cursor:pointer;
    padding:10px 16px; border-radius:12px; font-weight:800;
    background:linear-gradient(135deg,#ffec3d,#ff8a23); color:#1f0f2c;
    box-shadow:0 10px 24px rgba(255,166,0,.4);
  }
  .vm-pop.error .title{ color:#b00020 }
  .vm-pop.info  .title{ color:#f97316 }

  /* -------- Home button (match Banner Editor) -------- */
  .home-link{
    position:fixed; top:18px; left:18px;
    display:inline-flex; align-items:center; gap:10px;
    padding:12px 22px; border-radius:999px;
    background:linear-gradient(135deg,#ffd557,#ff8a23);
    color:#241432; text-decoration:none;
    font-weight:800;
    box-shadow:0 18px 40px rgba(255,140,35,.35);
    z-index:9999;
    transition:transform .15s ease, box-shadow .2s ease;
  }
  .home-link:hover{
    transform:translateY(-2px);
    box-shadow:0 22px 44px rgba(255,140,35,.42);
  }
  .home-link .arrow{
    font-size:1.2rem; line-height:1; transform:translateY(-1px);
  }
  `;
  const style = document.createElement('style');
  style.id = 'vm-pop-style';
  style.textContent = css;
  document.head.appendChild(style);

  // HTML popup
  const overlay = document.createElement('div');
  overlay.id = 'vm-pop-overlay';
  overlay.className = 'vm-pop-overlay';
  overlay.innerHTML = `
    <div class="vm-pop info" role="dialog" aria-modal="true" aria-live="assertive">
      <div class="title">Notice</div>
      <p class="msg"></p>
      <button class="ok" type="button">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Home button (exactly one arrow)
  const homeBtn = document.createElement('a');
  homeBtn.href = 'index.html';
  homeBtn.className = 'home-link';
  homeBtn.innerHTML = '<span class="arrow">←</span> Home';
  document.body.appendChild(homeBtn);

  // close on backdrop
  overlay.addEventListener('click', (e) => { if (e.target === overlay) hidePopup(); });
  overlay.querySelector('.ok').addEventListener('click', hidePopup);
}
let _afterPopup = null;
function showPopup(message, {title='Notice', type='info', timeout=1800, afterHide=null} = {}) {
  ensurePopupUI();
  const overlay = $('#vm-pop-overlay');
  const card    = overlay.querySelector('.vm-pop');
  overlay.style.display = 'flex';
  card.classList.remove('error','info');
  card.classList.add(type);
  card.querySelector('.title').textContent = title;
  card.querySelector('.msg').innerHTML = message;
  requestAnimationFrame(() => card.classList.add('show'));
  _afterPopup = typeof afterHide === 'function' ? afterHide : null;

  if (timeout > 0) {
    clearTimeout(card._t);
    card._t = setTimeout(hidePopup, timeout);
  }
}
function hidePopup() {
  const overlay = $('#vm-pop-overlay');
  if (!overlay) return;
  const card = overlay.querySelector('.vm-pop');
  card.classList.remove('show');
  setTimeout(() => {
    overlay.style.display = 'none';
    if (_afterPopup) { const fn = _afterPopup; _afterPopup = null; fn(); }
  }, 160);
}

/* ---------------- Users helpers ---------------- */
function getUsers() {
  try { return JSON.parse(localStorage.getItem(LS_USERS)) || []; }
  catch { return []; }
}
function setUsers(list) {
  localStorage.setItem(LS_USERS, JSON.stringify(list));
}

/* ---------------- Tabs ---------------- */
function activateTab(name) {
  $$('.tab').forEach(btn => {
    const on = btn.dataset.tab === name;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', String(on));
  });
  $$('.panel').forEach(p => p.classList.toggle('active', p.id === (name + 'Form')));
}
function initTabs() {
  $$('.tab').forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));
}

/* ---------------- Login ---------------- */
function initLogin() {
  const form = $('#loginForm');
  const err  = $('#loginError');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    err.textContent = '';

    const username = $('#login-username').value.trim();
    const password = $('#login-password').value;

    const users = getUsers();
    const user  = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      showPopup(
        `No such user <b>${username || ''}</b>. Switching to Sign up…`,
        {
          title: 'Account Not Found',
          type: 'error',
          timeout: 1600,
          afterHide: () => {
            activateTab('register');
            $('#reg-username').value = username;
            $('#reg-password').focus();
          }
        }
      );
      return;
    }

    if (user.password !== password) {
      showPopup('Wrong password. Please try again.', {
        title: 'Login Failed',
        type: 'error',
        timeout: 1800
      });
      $('#login-password').focus();
      return;
    }

    localStorage.setItem(LS_CURRENT, user.username);
    window.location.href = 'index.html';
  });
}

/* ---------------- Register ---------------- */
function initRegister() {
  const form = $('#registerForm');
  const err  = $('#registerError');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    err.textContent = '';

    const username = $('#reg-username').value.trim();
    const pw1 = $('#reg-password').value;
    const pw2 = $('#reg-password2').value;

    if (username.length < 3) {
      showPopup('Username must be at least 3 characters.', { title:'Check Username', type:'error' });
      return;
    }
    if (pw1.length < 6) {
      showPopup('Password must be at least 6 characters.', { title:'Weak Password', type:'error' });
      return;
    }
    if (pw1 !== pw2) {
      showPopup('Passwords do not match.', { title:'Mismatch', type:'error' });
      return;
    }

    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      showPopup('That username is already taken.', { title:'Unavailable', type:'error' });
      return;
    }

    users.push({ username, password: pw1 });
    setUsers(users);
    localStorage.setItem(LS_CURRENT, username);
    showPopup('Welcome aboard! Logging you in…', {
      title:'Success',
      type:'info',
      timeout: 900,
      afterHide: () => { window.location.href = 'index.html'; }
    });
  });
}

/* ---------------- Boot ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initLogin();
  initRegister();
  ensurePopupUI(); // make sure popup + matching Home button are ready
});