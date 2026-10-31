/* ============================================================
   Quality Pizzafresh — Módulo de Etiquetas (v7)
   Impresora: Zebra ZD420 (térmica, B/N)
   Formato por defecto: Vertical 68×80 mm
   Márgenes de seguridad: 4 mm por lado
   Alérgenos: NEGRITA (sin color, térmica)
   Nutrición: tabla 2 columnas (Nutriente | Valor)
   Logo: carga desde URL e impresión si es posible
   ============================================================ */

(function (global) {
  'use strict';

  /* ---------- CONFIGURACIÓN ---------- */
  const CONFIG = {
    defaultFormat: 'vertical',
    formats: {
      vertical:   { width: 68, height: 80, label: 'Vertical 68×80 mm' },
      horizontal: { width: 80, height: 68, label: 'Horizontal 80×68 mm' },
      small:      { width: 50, height: 60, label: 'Pequeña 50×60 mm' }
    },
    safeMarginMm: 4,
    dpi: 203,
    logoUrl: 'https://qualitypizzafresh.com/assets/logo.png',
    company: {
      name: 'Quality Pizzafresh',
      address: 'C/ Ejemplo 123 · 28000 Madrid',
      phone: '+34 900 000 000',
      web: 'www.qualitypizzafresh.com'
    }
  };

  /* ---------- UTILIDADES ---------- */
  const mmToPx = (mm, dpi = CONFIG.dpi) => Math.round((mm / 25.4) * dpi);

  const fmtDate = (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt)) return '';
    const p = (n) => String(n).padStart(2, '0');
    return `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear()} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
  };

  const fmtDateShort = (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt)) return '';
    const p = (n) => String(n).padStart(2, '0');
    return `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear()}`;
  };

  const escapeHtml = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const loadImage = (url) =>
    new Promise((resolve) => {
      if (!url) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });

  /* ---------- CATÁLOGO DE ALÉRGENOS ---------- */
  const ALERGENOS = [
    'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes',
    'Soja', 'Lácteos', 'Frutos secos', 'Apio', 'Mostaza',
    'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos'
  ];

  /* ---------- RENDER HTML ---------- */
  function buildLabelHtml(data, formatKey) {
    const fmt = CONFIG.formats[formatKey] || CONFIG.formats[CONFIG.defaultFormat];
    const m = CONFIG.safeMarginMm;
    const d = data || {};
    const aler = Array.isArray(d.alergenos) ? d.alergenos : [];
    const nut = d.nutricion || {};

    const nutRows = [
      ['Valor energético', nut.energia],
      ['Grasas', nut.grasas],
      ['  · de las cuales saturadas', nut.saturadas],
      ['Hidratos de carbono', nut.hidratos],
      ['  · de los cuales azúcares', nut.azucares],
      ['Proteínas', nut.proteinas],
      ['Sal', nut.sal]
    ].filter(([, v]) => v != null && v !== '');

    const alerHtml = aler.length
      ? `<div class="qp-alergenos"><span class="qp-alergenos-tit">ALÉRGENOS:</span> ${aler
          .map((a) => `<strong>${escapeHtml(a)}</strong>`)
          .join(' · ')}</div>`
      : '';

    const nutHtml = nutRows.length
      ? `<table class="qp-nut"><caption>Información nutricional (por 100 g)</caption>
           <thead><tr><th>Nutriente</th><th>Valor</th></tr></thead>
           <tbody>${nutRows
             .map(
               ([k, v]) =>
                 `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`
             )
             .join('')}</tbody>
         </table>`
      : '';

    return `
<div class="qp-label qp-label--${formatKey}" style="
     width:${fmt.width}mm;height:${fmt.height}mm;
     padding:${m}mm;box-sizing:border-box;
     font-family:Arial,Helvetica,sans-serif;color:#000;background:#fff;
     overflow:hidden;display:flex;flex-direction:column;gap:1mm;">
  <header class="qp-head">
    <img class="qp-logo" src="${escapeHtml(CONFIG.logoUrl)}" alt="logo"
         onerror="this.style.display='none'" />
    <div class="qp-company">
      <div class="qp-company-name">${escapeHtml(CONFIG.company.name)}</div>
      <div class="qp-company-sub">${escapeHtml(CONFIG.company.address)}</div>
      <div class="qp-company-sub">${escapeHtml(CONFIG.company.phone)}</div>
    </div>
  </header>

  <div class="qp-product">${escapeHtml(d.producto || 'Producto')}</div>
  ${d.peso ? `<div class="qp-peso">Peso neto: <strong>${escapeHtml(d.peso)}</strong></div>` : ''}

  ${d.ingredientes ? `<div class="qp-ing"><span class="qp-tit">Ingredientes:</span> ${escapeHtml(d.ingredientes)}</div>` : ''}

  ${alerHtml}

  ${d.conservacion ? `<div class="qp-cons"><span class="qp-tit">Conservación:</span> ${escapeHtml(d.conservacion)}</div>` : ''}

  ${nutHtml}

  <footer class="qp-foot">
    <div class="qp-foot-row">
      <span>Lote: <strong>${escapeHtml(d.lote || '—')}</strong></span>
      <span>Cad.: <strong>${escapeHtml(d.caducidad ? fmtDateShort(d.caducidad) : '—')}</strong></span>
    </div>
    <div class="qp-foot-row">
      <span>Elab.: ${escapeHtml(d.elaboracion ? fmtDate(d.elaboracion) : '—')}</span>
      <span>Op.: ${escapeHtml(d.operador || '—')}</span>
    </div>
  </footer>
</div>`.trim();
  }

  /* ---------- ESTILOS ---------- */
  const STYLE_ID = 'qp-etiquetas-style-v7';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `
    .qp-label { border:0.3mm solid #000; }
    .qp-label * { box-sizing:border-box; }
    .qp-head { display:flex; align-items:center; gap:2mm; border-bottom:0.4mm solid #000; padding-bottom:1mm; }
    .qp-logo { height:9mm; width:auto; max-width:16mm; object-fit:contain; }
    .qp-company { flex:1; line-height:1.1; }
    .qp-company-name { font-weight:bold; font-size:3.2mm; }
    .qp-company-sub { font-size:2.2mm; }
    .qp-product { font-size:4.2mm; font-weight:bold; text-align:center; text-transform:uppercase; letter-spacing:0.1mm; }
    .qp-peso { font-size:2.8mm; text-align:center; }
    .qp-tit { font-weight:bold; }
    .qp-ing { font-size:2.4mm; line-height:1.15; }
    .qp-alergenos { font-size:2.6mm; border:0.4mm solid #000; padding:1mm; line-height:1.2; }
    .qp-alergenos strong { font-weight:900; }
    .qp-alergenos-tit { font-weight:bold; }
    .qp-cons { font-size:2.4mm; }
    .qp-nut { width:100%; border-collapse:collapse; font-size:2.2mm; }
    .qp-nut caption { caption-side:top; font-weight:bold; font-size:2.4mm; text-align:left; padding-bottom:0.5mm; }
    .qp-nut th, .qp-nut td { border:0.2mm solid #000; padding:0.6mm 1mm; }
    .qp-nut th { background:#000; color:#fff; font-weight:bold; text-align:left; }
    .qp-nut td:last-child { text-align:right; white-space:nowrap; }
    .qp-foot { margin-top:auto; border-top:0.4mm solid #000; padding-top:1mm; font-size:2.2mm; }
    .qp-foot-row { display:flex; justify-content:space-between; gap:2mm; }

    @media print {
      @page { margin:0; }
      body * { visibility:hidden !important; }
      .qp-print-area, .qp-print-area * { visibility:visible !important; }
      .qp-print-area { position:absolute; top:0; left:0; }
      .qp-label { border:0.3mm solid #000; }
    }
    `;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------- RENDER EN CONTENEDOR ---------- */
  function render(container, data, formatKey) {
    if (!container) throw new Error('[etiquetas] contenedor no válido');
    injectStyles();
    const key = formatKey || data?.formato || CONFIG.defaultFormat;
    container.innerHTML = buildLabelHtml(data, key);
    return container.firstElementChild;
  }

  /* ---------- IMPRESIÓN ---------- */
  function print(data, formatKey) {
    injectStyles();
    const key = formatKey || data?.formato || CONFIG.defaultFormat;

    return new Promise((resolve) => {
      const area = document.createElement('div');
      area.className = 'qp-print-area';
      area.innerHTML = buildLabelHtml(data, key);
      document.body.appendChild(area);

      const cleanup = () => {
        if (area.parentNode) area.parentNode.removeChild(area);
        window.removeEventListener('afterprint', cleanup);
        resolve(true);
      };
      window.addEventListener('afterprint', cleanup);

      const img = area.querySelector('img.qp-logo');
      const go = () => {
        try {
          window.print();
        } catch (e) {
          console.error('[etiquetas] print error', e);
          cleanup();
        }
      };
      if (img && !img.complete) {
        img.addEventListener('load', go, { once: true });
        img.addEventListener('error', go, { once: true });
        setTimeout(go, 800);
      } else {
        setTimeout(go, 50);
      }
    });
  }

  /* ---------- PREVIEW EN VENTANA NUEVA ---------- */
  function preview(data, formatKey) {
    injectStyles();
    const key = formatKey || data?.formato || CONFIG.defaultFormat;
    const html = `<!doctype html><html><head><meta charset="utf-8">
      <title>Etiqueta ${escapeHtml(data?.producto || '')}</title>
      <style>${document.getElementById(STYLE_ID).textContent}
      body{margin:0;padding:10mm;background:#eee;display:flex;justify-content:center;align-items:flex-start;}
      </style></head><body>${buildLabelHtml(data, key)}</body></html>`;
    const w = window.open('', '_blank', 'width=500,height=600');
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
    return w;
  }

  /* ---------- EXPORTACIÓN ---------- */
  const Etiquetas = {
    CONFIG,
    ALERGENOS,
    render,
    print,
    preview,
    buildLabelHtml,
    utils: { mmToPx, fmtDate, fmtDateShort, escapeHtml, loadImage }
  };

  global.Etiquetas = Etiquetas;
  if (typeof module !== 'undefined' && module.exports) module.exports = Etiquetas;
})(typeof window !== 'undefined' ? window : globalThis);
