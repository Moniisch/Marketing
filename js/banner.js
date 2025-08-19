/* ---------- Helpers ---------- */
const $  = (q, r=document) => r.querySelector(q);
const $$ = (q, r=document) => [...r.querySelectorAll(q)];

/* Root for CSS vars */
const root = document.documentElement;

/* Stage + core elements */
const stage     = $('#stage');
const dragLayer = $('#dragLayer');
const H1        = $('#h1');
const P1        = $('#p1');
const CTA       = $('#cta');

/* ---------- Background controls ---------- */
const bgRadios   = $$('input[name="bgType"]');
const gradRow    = $('#gradRow');
const solidRow   = $('#solidRow');
const solidPick  = $('#solidPicker');
const solidHex   = $('#solidHex');

bgRadios.forEach(r => r.addEventListener('change', () => {
  if (r.checked && r.value === 'gradient') {
    gradRow.hidden = false;
    solidRow.hidden = true;
    // apply first swatch if none yet
    const first = gradRow.querySelector('.swatch');
    if (first) stage.style.backgroundImage = first.dataset.grad;
  }
  if (r.checked && r.value === 'solid') {
    gradRow.hidden = true;
    solidRow.hidden = false;
    stage.style.backgroundImage = 'none';
    stage.style.backgroundColor = solidHex.value;
  }
}));

// gradient swatches
gradRow.addEventListener('click', (e) => {
  const btn = e.target.closest('.swatch');
  if (!btn) return;
  stage.style.backgroundImage = btn.dataset.grad;
  stage.style.backgroundColor = '';
});

// solid picker + hex sync
function setSolid(val){
  solidPick.value = val;
  solidHex.value  = val;
  stage.style.backgroundImage = 'none';
  stage.style.backgroundColor = val;
}
solidPick.addEventListener('input', e => setSolid(e.target.value));
solidHex.addEventListener('input', e => {
  const v = e.target.value.trim();
  if(/^#([0-9A-F]{3}){1,2}$/i.test(v)) setSolid(v);
});

/* ---------- Size presets ---------- */
const sizeSel = $('#bannerSize');
const setSize = (wh) => {
  const [w,h] = wh.split('x').map(n => parseInt(n,10));
  root.style.setProperty('--stage-w', w);
  root.style.setProperty('--stage-h', h);
};
setSize(sizeSel.value);
sizeSel.addEventListener('change', () => setSize(sizeSel.value));

/* ---------- Text + sizes + CTA color ---------- */
$('#headline').addEventListener('input', e => H1.textContent = e.target.value);
$('#subline').addEventListener('input',  e => P1.textContent = e.target.value);
$('#ctaText').addEventListener('input',  e => CTA.textContent = e.target.value);

$('#headlineSize').addEventListener('input', e => H1.style.fontSize = `${e.target.value}px`);
$('#sublineSize').addEventListener('input',  e => P1.style.fontSize = `${e.target.value}px`);
$('#ctaSize').addEventListener('input',      e => CTA.style.fontSize = `${e.target.value}px`);

const ctaPicker = $('#ctaPicker');
const ctaHex    = $('#ctaHex');
function setCTAColor(val){
  ctaPicker.value = val;
  ctaHex.value    = val;
  CTA.style.backgroundColor = val;
}
ctaPicker.addEventListener('input', e => setCTAColor(e.target.value));
ctaHex.addEventListener('input', e => {
  const v = e.target.value.trim();
  if(/^#([0-9A-F]{3}){1,2}$/i.test(v)) setCTAColor(v);
});

/* ---------- Stickers ---------- */
$('#stickers').addEventListener('click', (e) => {
  const b = e.target.closest('.sticker');
  if (!b) return;
  addSticker(b.dataset.emoji);
});
function addSticker(emoji){
  const n = document.createElement('div');
  n.className = 'item stk';
  n.textContent = emoji;
  // random-ish start
  n.style.left = (20 + Math.random()*80) + 'px';
  n.style.top  = (20 + Math.random()*60) + 'px';
  dragLayer.appendChild(n);
  makeDraggable(n);
}

/* ---------- Image upload ---------- */
$('#imgInput').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const wrap = document.createElement('div');
    wrap.className = 'item';
    const img = document.createElement('img');
    img.src = reader.result;
    img.alt = 'User image';
    wrap.appendChild(img);
    wrap.style.left = '40px';
    wrap.style.top  = '40px';
    dragLayer.appendChild(wrap);
    makeDraggable(wrap);
    e.target.value = '';
  };
  reader.readAsDataURL(file);
});

/* ---------- Dragging ---------- */
function makeDraggable(el){
  let sx=0, sy=0, sl=0, st=0, dragging=false;

  const onDown = (ev) => {
    dragging = true;
    el.style.cursor = 'grabbing';
    const p = getPoint(ev);
    sx = p.x; sy = p.y;
    const r = el.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    sl = r.left - sr.left;
    st = r.top  - sr.top;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once:true });
  };

  const onMove = (ev) => {
    if (!dragging) return;
    const p = getPoint(ev);
    const dx = p.x - sx;
    const dy = p.y - sy;

    // Bounds inside stage
    const S  = stage.getBoundingClientRect();
    const ER = el.getBoundingClientRect();
    let newL = sl + dx;
    let newT = st + dy;

    const maxL = S.width - ER.width  - 2;
    const maxT = S.height - ER.height - 2;
    newL = Math.max(2, Math.min(newL, maxL));
    newT = Math.max(2, Math.min(newT, maxT));

    el.style.left = newL + 'px';
    el.style.top  = newT + 'px';
  };

  const onUp = () => {
    dragging = false;
    el.style.cursor = 'grab';
    window.removeEventListener('pointermove', onMove);
  };

  el.addEventListener('pointerdown', onDown);
}

function getPoint(ev){
  if (ev.touches?.[0]) return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
  return { x: ev.clientX, y: ev.clientY };
}

/* ---------- Export ---------- */
// JPG
$('#btnJpg').addEventListener('click', async () => {
  const canvas = await html2canvas(stage, {
    backgroundColor: null,
    scale: window.devicePixelRatio || 1.5
  });
  const data = canvas.toDataURL('image/jpeg', 0.95);
  downloadDataURL(data, 'banner.jpg');
});

// PDF
$('#btnPdf').addEventListener('click', async () => {
  const canvas = await html2canvas(stage, { backgroundColor: null, scale: 2 });
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('l', 'pt', [canvas.width, canvas.height]); // match canvas size
  pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
  pdf.save('banner.pdf');
});

function downloadDataURL(dataURL, filename){
  const a = document.createElement('a');
  a.href = dataURL; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
}

/* ---------- Initialize defaults ---------- */
// default gradient is already on .stage via CSS; ensure radio UI matches
bgRadios.find(r => r.value === 'gradient').checked = true;
gradRow.hidden = false;
solidRow.hidden = true;