/* ================================
   Vividly — Campaign Overview
   Fresh, minimal, working
================================ */

const LS_BANNERS = 'vm_banners'; // expected array from banner editor

document.addEventListener('DOMContentLoaded', () => {
  wirePills();
  renderBanners();
});

/* ---- Pills redirect (EXACT filenames) ---- */
function wirePills() {
  const routes = {
    banner:    'banner.html',
    marketing: 'marketing.html',
    landing:   'landing.html',
  };
  document.querySelectorAll('.pills [data-go]').forEach(btn => {
    const key = btn.dataset.go;
    const url = routes[key];
    if (!url) return;
    btn.addEventListener('click', () => { window.location.href = url; });
  });
}

/* ---- Optional banners list (from localStorage) ---- */
function readBanners() {
  try {
    const raw = localStorage.getItem(LS_BANNERS);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function saveBanners(list) {
  localStorage.setItem(LS_BANNERS, JSON.stringify(list || []));
}

function renderBanners() {
  const grid  = document.getElementById('bGrid');
  const count = document.getElementById('bCount');
  const empty = document.getElementById('bEmpty');
  if (!grid || !count || !empty) return;

  const banners = readBanners();
  grid.innerHTML = '';
  count.textContent = String(banners.length);
  empty.hidden = banners.length > 0;

  banners.forEach(b => {
    const card = document.createElement('article');
    card.className = 'card';

    // thumb
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    if (b.thumb) {
      const img = document.createElement('img');
      img.alt = 'Banner preview';
      img.src = b.thumb;
      thumb.appendChild(img);
    } else {
      thumb.classList.add('placeholder','banner');
    }

    // meta
    const meta = document.createElement('div');
    meta.className = 'meta';
    const h3 = document.createElement('h3');
    h3.textContent = b.headline || 'Banner';
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = sizeLabel(b);
    meta.append(h3,p);

    // actions
    const actions = document.createElement('div');
    actions.className = 'actions';
    const edit = document.createElement('a');
    edit.className = 'btn';
    edit.textContent = 'Edit';
    // if you support id param, append ?id=...
    edit.href = 'banner.html';
    const del = document.createElement('button');
    del.className = 'btn danger';
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      const next = banners.filter(x => x !== b);
      saveBanners(next);
      renderBanners();
    });
    actions.append(edit, del);

    card.append(thumb, meta, actions);
    grid.appendChild(card);
  });
}

function sizeLabel(b) {
  const w = Number(b?.w) || null;
  const h = Number(b?.h) || null;
  return (w && h) ? `${w} × ${h}` : 'Saved banner';
}