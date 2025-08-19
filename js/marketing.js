// ---------- helpers ----------
const $  = (q, r=document) => r.querySelector(q);
const $$ = (q, r=document) => [...r.querySelectorAll(q)];
const key = 'vp_marketing_state';

const els = {
  template: $('#template'),
  accent:   $('#accent'),
  accentHex:$('#accentHex'),
  bgType:   $$('input[name="bgType"]'),
  gradRow:  $('#gradRow'),
  solidRow: $('#solidRow'),
  bgSolid:  $('#bgSolid'),
  bgHex:    $('#bgHex'),
  font:     $('#font'),
  siteTitle:$('#siteTitle'),
  headline: $('#headline'),
  subline:  $('#subline'),
  body:     $('#body'),
  ctaText:  $('#ctaText'),
  ctaLink:  $('#ctaLink'),
  imgInput: $('#imgInput'),
  clearImg: $('#clearImg'),

  addFeature: $('#addFeature'),
  featureInput: $('#featureInput'),
  featuresList: $('#featuresList'),

  // preview
  page: $('#page'),
  brandPreview: $('#brandPreview'),
  h1Preview: $('#h1Preview'),
  subPreview: $('#subPreview'),
  pPreview: $('#pPreview'),
  ctaPreview: $('#ctaPreview'),
  heroImg: $('#heroImg'),
  featuresPreview: $('#featuresPreview'),
  year: $('#year'),

  resetBtn: $('#resetBtn'),
  exportHtml: $('#exportHtml'),
};

const state = {
  template: 'classic',
  theme: {
    accent: '#f97316',
    bgType: 'gradient',
    bgGrad: 'linear-gradient(135deg,#ffd5ec 0%,#ffeebe 100%)',
    bgSolid: '#ffffff',
    font: "'Poppins',system-ui"
  },
  content: {
    siteTitle: 'Vividly',
    headline: 'Create Marketing Pages That Convert',
    subline: 'Beautiful templates, instant preview, zero code.',
    body: 'Design stunning landing pages with flexible blocks and a vibrant theme system.',
    ctaText: 'Get Started',
    ctaLink: '',
    heroImg: '' // dataURL
  },
  features: [
    '3 ready-made templates',
    'Instant live preview',
    'Beautiful, exportable result'
  ]
};

// ---------- state load/save ----------
function save() {
  localStorage.setItem(key, JSON.stringify(state));
}
function load() {
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    Object.assign(state, s);
  } catch {}
}

// ---------- rendering ----------
function applyTheme() {
  document.documentElement.style.setProperty('--accent', state.theme.accent);
  document.documentElement.style.setProperty('--bg-solid', state.theme.bgSolid);
  document.documentElement.style.setProperty('--bg-grad', state.theme.bgGrad);
  $('body').style.fontFamily = state.theme.font;
  if (state.theme.bgType === 'solid') {
    els.page.style.background = state.theme.bgSolid;
  } else {
    els.page.style.background = state.theme.bgGrad;
  }
  save();
}

function applyTemplate() {
  els.page.classList.remove('page--classic','page--split','page--cards');
  els.page.classList.add(`page--${state.template}`);
  save();
}

function applyContent() {
  els.brandPreview.textContent = state.content.siteTitle || '—';
  els.h1Preview.textContent    = state.content.headline || '';
  els.subPreview.textContent   = state.content.subline || '';
  els.pPreview.textContent     = state.content.body || '';
  els.ctaPreview.textContent   = state.content.ctaText || 'Learn more';
  els.ctaPreview.href          = state.content.ctaLink || '#';
  if (state.content.heroImg) {
    els.heroImg.src = state.content.heroImg;
    els.heroImg.style.display = 'block';
  } else {
    els.heroImg.removeAttribute('src');
    els.heroImg.style.display = 'none';
  }
  save();
}

function renderFeatures() {
  // preview cards
  els.featuresPreview.innerHTML = state.features.map(t =>
    `<div class="card">${escapeHtml(t)}</div>`).join('');

  // repeater list
  els.featuresList.innerHTML = '';
  state.features.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'repeater-item';
    row.innerHTML = `
      <div class="txt" title="${escapeHtml(t)}">${escapeHtml(t)}</div>
      <button class="rm" type="button" aria-label="Remove">✕</button>
    `;
    row.querySelector('.rm').onclick = () => {
      state.features.splice(i,1);
      renderFeatures(); save();
    };
    els.featuresList.appendChild(row);
  });
  save();
}

function escapeHtml(s=''){
  return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

// ---------- bind controls (instant, on input) ----------
function bind() {
  // template
  els.template.value = state.template;
  els.template.addEventListener('input', e => {
    state.template = e.target.value;
    applyTemplate();
  });

  // theme
  els.accent.value = state.theme.accent;
  els.accentHex.value = state.theme.accent;
  const syncAccent = (val) => {
    state.theme.accent = val;
    els.accent.value = val; els.accentHex.value = val;
    applyTheme();
  };
  els.accent.addEventListener('input', e => syncAccent(e.target.value));
  els.accentHex.addEventListener('input', e => syncAccent(e.target.value));

  // bg type
  els.bgType.forEach(r => {
    r.checked = r.value === state.theme.bgType;
    r.addEventListener('input', () => {
      state.theme.bgType = r.value;
      els.gradRow.hidden  = r.value !== 'gradient';
      els.solidRow.hidden = r.value !== 'solid';
      applyTheme();
    });
  });

  // gradient swatches
  $$('.swatch').forEach(b=>{
    b.addEventListener('click', ()=>{
      state.theme.bgGrad = b.dataset.grad;
      applyTheme();
    });
  });

  // solid color
  els.bgSolid.value = state.theme.bgSolid;
  els.bgHex.value   = state.theme.bgSolid;
  const syncSolid = (val)=>{ state.theme.bgSolid = val; els.bgSolid.value=val; els.bgHex.value=val; applyTheme(); };
  els.bgSolid.addEventListener('input', e=> syncSolid(e.target.value));
  els.bgHex.addEventListener('input',   e=> syncSolid(e.target.value));

  // font
  els.font.value = state.theme.font;
  els.font.addEventListener('input', e => { state.theme.font = e.target.value; applyTheme(); });

  // content fields
  const bindText = (el, path) => {
    el.value = path.get(state) || '';
    el.addEventListener('input', e => { path.set(state, e.target.value); applyContent(); });
  };
  bindText(els.siteTitle, Path`content.siteTitle`);
  bindText(els.headline,  Path`content.headline`);
  bindText(els.subline,   Path`content.subline`);
  bindText(els.body,      Path`content.body`);
  bindText(els.ctaText,   Path`content.ctaText`);
  bindText(els.ctaLink,   Path`content.ctaLink`);

  // image choose
  els.imgInput.addEventListener('change', async (e)=>{
    const file = e.target.files[0];
    if (!file) return;
    const dataURL = await fileToDataURL(file);
    state.content.heroImg = dataURL;
    applyContent();
    els.imgInput.value = '';
  });
  els.clearImg.addEventListener('click', ()=>{
    state.content.heroImg = '';
    applyContent();
  });

  // features
  els.addFeature.addEventListener('click', ()=>{
    const t = els.featureInput.value.trim();
    if(!t) return;
    state.features.push(t);
    els.featureInput.value='';
    renderFeatures();
  });
  els.featureInput.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter'){
      e.preventDefault(); els.addFeature.click();
    }
  });

  // reset/export
  els.resetBtn.addEventListener('click', ()=>{
    localStorage.removeItem(key);
    window.location.reload();
  });
  els.exportHtml.addEventListener('click', exportHTML);

  // footer year
  els.year.textContent = new Date().getFullYear();

  // show correct rows initially
  els.gradRow.hidden  = state.theme.bgType !== 'gradient';
  els.solidRow.hidden = state.theme.bgType !== 'solid';
}

function fileToDataURL(file){
  return new Promise((res, rej)=>{
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// mini “Path” helper to get/set nested props
function Path(strings,...keys){
  const path = strings[0];
  const parts = path.split('.').filter(Boolean);
  return {
    get: (obj)=> parts.reduce((o,k)=> o?.[k], obj),
    set: (obj,val)=> {
      let o=obj; for(let i=0;i<parts.length-1;i++) o=o[parts[i]];
      o[parts.at(-1)] = val;
    }
  };
}

// Export compact static HTML of the preview (inline styles + theme colors)
function exportHTML(){
  const html = `
<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(state.content.siteTitle)}</title>
<style>
  :root{ --accent:${state.theme.accent}; }
  body{ margin:0; font-family:${state.theme.font}; color:#2c1c3c; }
  .page{ ${state.theme.bgType==='solid'
    ? `background:${state.theme.bgSolid};`
    : `background:${state.theme.bgGrad};`} padding:24px }
  .site-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:16px }
  .brand{ font-weight:900 }
  .cta{ display:inline-block; background:var(--accent); color:#fff; text-decoration:none; padding:10px 16px; border-radius:999px; font-weight:800 }
  .features{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:18px }
  .card{ background:#fff; padding:12px; border-radius:12px; box-shadow:0 6px 14px rgba(0,0,0,.08) }
  img{ max-width:100%; height:auto; border-radius:12px }
</style>
</head><body>
<div class="page">
<header class="site-header">
  <div class="brand">${escapeHtml(state.content.siteTitle)}</div>
</header>
<section class="hero">
  <h1>${escapeHtml(state.content.headline)}</h1>
  <p>${escapeHtml(state.content.subline)}</p>
  <p>${escapeHtml(state.content.body)}</p>
  <a class="cta" href="${state.content.ctaLink || '#'}">${escapeHtml(state.content.ctaText)}</a>
  ${state.content.heroImg ? `<p><img src="${state.content.heroImg}" alt=""></p>` : ''}
</section>
<section class="features">
  ${state.features.map(t=>`<div class="card">${escapeHtml(t)}</div>`).join('')}
</section>
</div></body></html>`;
  const blob = new Blob([html], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'marketing-page.html';
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------- boot ----------
load();
bind();
applyTemplate();
applyTheme();
applyContent();
renderFeatures();