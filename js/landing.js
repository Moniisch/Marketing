/* ================================
   Vividly — Landing Editor logic
================================ */
const LS_KEY = 'vividly_landing_state_v1';

const $  = (q, r=document) => r.querySelector(q);
const $$ = (q, r=document) => [...r.querySelectorAll(q)];

// --------- State ---------
const state = {
  tpl: 'a',
  bgType: 'gradient',
  bg: 'linear-gradient(135deg,#ffd5ec 0%,#ffeebe 100%)',
  bgSolid: '#ffffff',
  primary: '#f97316',
  accent:  '#2c1c3c',
  font: "'Poppins',system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif",
  headline: 'Grow faster with Vividly',
  subline: 'Launch beautiful pages in minutes. Convert more visitors with bold design and clear calls to action.',
  ctaText: 'Get Started',
  ctaLink: '#',
  heroSrc: '',
  fields: [
    { id: id(), label:'Full name', type:'text' },
    { id: id(), label:'Email',     type:'email' }
  ]
};

function id(){ return Math.random().toString(36).slice(2,9); }
function save(){
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}
function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return;
    const s = JSON.parse(raw);
    Object.assign(state, s);
  }catch{}
}

// --------- Apply to UI ---------
function apply(){
  // page style
  const page = $('#page');
  page.classList.toggle('tpl-a', state.tpl === 'a');
  page.classList.toggle('tpl-b', state.tpl === 'b');
  page.classList.toggle('tpl-c', state.tpl === 'c');

  page.style.setProperty('--primary', state.primary);
  page.style.setProperty('--accent', state.accent);
  page.style.setProperty('--bg', state.bgType === 'solid' ? state.bgSolid : state.bg);

  // font
  page.style.fontFamily = state.font;

  // copy
  $('#p-title').textContent = state.headline;
  $('#p-sub').textContent   = state.subline;
  const cta = $('#p-cta');
  cta.textContent = state.ctaText || 'Learn more';
  cta.href = state.ctaLink || '#';

  // image
  const img = $('#p-img');
  if(state.heroSrc){
    img.src = state.heroSrc;
    img.style.display = 'block';
  }else{
    img.removeAttribute('src');
    img.style.display = 'none';
  }

  // form fields (template C shows)
  renderFields();
  save(); // persist every apply
}

function renderFields(){
  const list  = $('#fieldsList');
  const mount = $('#formFields');

  list.innerHTML  = '';
  mount.innerHTML = '';

  state.fields.forEach(f => {
    // left builder row
    const row = document.createElement('div');
    row.className = 'field-row';
    row.innerHTML = `
      <div><strong>${escapeHTML(f.label)}</strong> <small style="opacity:.6">(${f.type})</small></div>
      <button class="kill" aria-label="Remove">✕</button>
    `;
    row.querySelector('.kill').onclick = () => {
      const idx = state.fields.findIndex(x => x.id === f.id);
      if(idx >= 0){ state.fields.splice(idx,1); apply(); }
    };
    list.appendChild(row);

    // preview field
    const fr = document.createElement('div');
    fr.className = 'frow';
    fr.innerHTML = `<label>${escapeHTML(f.label)}</label>`;
    if(f.type === 'textarea'){
      fr.innerHTML += `<textarea rows="3" placeholder="${escapeHTML(f.label)}"></textarea>`;
    }else{
      fr.innerHTML += `<input type="${f.type}" placeholder="${escapeHTML(f.label)}" />`;
    }
    mount.appendChild(fr);
  });
}

function escapeHTML(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// --------- Bind controls (instant) ---------
function bind(){
  // template
  $$('input[name="tpl"]').forEach(r => {
    r.checked = (r.value === state.tpl);
    r.addEventListener('input', () => { state.tpl = r.value; apply(); });
  });

  // background type
  $$('input[name="bgType"]').forEach(r => {
    r.checked = (r.value === state.bgType);
    r.addEventListener('input', () => {
      state.bgType = r.value;
      // toggle rows
      $('#solidRow').hidden = state.bgType !== 'solid';
      $('#gradRow').style.display = state.bgType === 'solid' ? 'none' : 'flex';
      apply();
    });
  });
  // gradient swatches
  $$('.swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      state.bg = btn.getAttribute('data-grad');
      apply();
    });
  });
  // solid color pickers
  $('#bgColor').value = state.bgSolid;
  $('#bgHex').value   = state.bgSolid;
  $('#bgColor').addEventListener('input', e => { state.bgSolid = e.target.value; $('#bgHex').value = state.bgSolid; apply(); });
  $('#bgHex').addEventListener('input', e => { state.bgSolid = e.target.value; $('#bgColor').value = state.bgSolid; apply(); });

  // primary / accent
  $('#primaryColor').value = state.primary;
  $('#primaryHex').value   = state.primary;
  $('#accentColor').value  = state.accent;
  $('#accentHex').value    = state.accent;

  $('#primaryColor').addEventListener('input', e => { state.primary = e.target.value; $('#primaryHex').value = state.primary; apply(); });
  $('#primaryHex').addEventListener('input',   e => { state.primary = e.target.value; $('#primaryColor').value = state.primary; apply(); });

  $('#accentColor').addEventListener('input', e => { state.accent = e.target.value; $('#accentHex').value = state.accent; apply(); });
  $('#accentHex').addEventListener('input',   e => { state.accent = e.target.value; $('#accentColor').value = state.accent; apply(); });

  // font
  $('#fontSel').value = state.font;
  $('#fontSel').addEventListener('input', e => { state.font = e.target.value; apply(); });

  // copy
  $('#headline').value = state.headline;
  $('#subline').value  = state.subline;
  $('#ctaText').value  = state.ctaText;
  $('#ctaLink').value  = state.ctaLink;

  $('#headline').addEventListener('input', e => { state.headline = e.target.value; apply(); });
  $('#subline').addEventListener('input',  e => { state.subline  = e.target.value; apply(); });
  $('#ctaText').addEventListener('input',  e => { state.ctaText  = e.target.value; apply(); });
  $('#ctaLink').addEventListener('input',  e => { state.ctaLink  = e.target.value; apply(); });

  // image
  $('#imgInput').addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if(!file) return;
    const b64 = await toDataURL(file);
    state.heroSrc = b64;
    apply();
    e.target.value = '';
  });

  // form builder
  $('#addField').addEventListener('click', () => {
    const label = $('#newLabel').value.trim();
    const type  = $('#newType').value;
    if(!label) return;
    state.fields.push({ id:id(), label, type });
    $('#newLabel').value = '';
    apply();
  });

  // reset & clear
  $('#resetBtn').addEventListener('click', () => {
    localStorage.removeItem(LS_KEY);
    location.reload();
  });
  $('#clearStorage').addEventListener('click', () => {
    localStorage.removeItem(LS_KEY);
    alert('Saved state cleared.');
  });

  // show/hide rows according to bgType
  $('#solidRow').hidden = state.bgType !== 'solid';
  $('#gradRow').style.display = state.bgType === 'solid' ? 'none' : 'flex';
}

function toDataURL(file){
  return new Promise((res,rej) => {
    const fr = new FileReader();
    fr.onload  = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

// --------- Boot ---------
document.addEventListener('DOMContentLoaded', () => {
  load();
  bind();
  apply();
});