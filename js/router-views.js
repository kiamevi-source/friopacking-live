/* ════════════════════════════════════════════════════════════════════
   router-views.js — Router de vistas con iframe-bridge al legacy
   - "inicio" muestra #view-home (KPIs + paneles)
   - Cualquier otro hash carga index.legacy.html y llama showView() adentro
   - Oculta el chrome del legacy via CSS injection en el iframe
   Dependencias: ninguna (autónomo)
   ════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const HOME_KEY = 'inicio';
  const LEGACY_URL = 'index.legacy.html';

  const homeEl  = document.getElementById('view-home');
  const vistaEl = document.getElementById('view-vista');
  const iframe  = document.getElementById('vista-frame');

  let iframeReady = false;
  let pendingView = null;

  // ── CSS que se inyecta dentro del iframe para ocultar el chrome del legacy ──
  const HIDE_CHROME_CSS = `
    /* Ocultar chrome del legacy (header, tabs, timemachine, KPIs, semáforo, ai-fab) */
    header.app,
    nav.tabs,
    .timemachine,
    .date-pills,
    .kpis,
    .semaforo,
    .ai-fab,
    #toast-container,
    .banner,
    .head-actions,
    .cmd-bar { display: none !important; }
    body { padding-top: 0 !important; margin: 0 !important; }
    /* Quitar el margen superior que dejaba el header sticky */
    body > *:first-child:not(script) { margin-top: 0 !important; }
  `;

  // ── Inyectar CSS dentro del iframe cuando carga ──
  function injectChromeHide() {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc) return;
      if (doc.getElementById('__embed_hide_chrome')) return;
      const style = doc.createElement('style');
      style.id = '__embed_hide_chrome';
      style.textContent = HIDE_CHROME_CSS;
      doc.head.appendChild(style);
    } catch (e) {
      console.warn('[router-views] no se pudo inyectar CSS al iframe:', e);
    }
  }

  // ── Cargar el legacy en el iframe (lazy, primera vez que se navega a una vista) ──
  function ensureIframeLoaded(thenShow) {
    if (iframeReady) { thenShow(); return; }
    pendingView = thenShow;
    if (iframe.src === 'about:blank' || !iframe.src.includes('index.legacy.html')) {
      iframe.src = LEGACY_URL;
    }
  }

  iframe.addEventListener('load', () => {
    iframeReady = true;
    injectChromeHide();
    if (pendingView) {
      const fn = pendingView;
      pendingView = null;
      // Pequeño delay para que el legacy termine de inicializar su JS
      setTimeout(fn, 200);
    }
  });

  // ── Cambiar a una vista específica ──
  function gotoLegacyView(name) {
    try {
      const win = iframe.contentWindow;
      if (win && typeof win.showView === 'function') {
        win.showView(name);
      } else {
        // Fallback: cambiar el hash del iframe
        win.location.hash = '#' + name;
      }
    } catch (e) {
      console.warn('[router-views] gotoLegacyView falló:', e);
    }
  }

  // ── Actualizar estado activo en sidebar y tabs ──
  function updateActive(name) {
    document.querySelectorAll('.nav-item, .tab-item').forEach(el => {
      const dataSection = el.dataset.section;
      const href = (el.getAttribute('href') || '').replace('#', '');
      const matches = dataSection === name || href === name;
      el.classList.toggle('active', matches);
    });
  }

  // ── API principal ──
  function showView(name) {
    name = (name || '').trim();
    if (!name) name = HOME_KEY;

    // Vista HOME: mostrar contenido nativo, ocultar iframe
    if (name === HOME_KEY) {
      homeEl.style.display  = '';
      vistaEl.style.display = 'none';
      updateActive(HOME_KEY);
      return;
    }

    // Cualquier otra vista: mostrar iframe, ocultar home
    homeEl.style.display  = 'none';
    vistaEl.style.display = '';
    updateActive(name);
    ensureIframeLoaded(() => gotoLegacyView(name));
  }

  window.showView = showView;

  // ── Interceptar clicks en elementos navegables ──
  function interceptClicks() {
    const selectors = '.sidebar .nav-item, .tabbar .tab-item, .panel .chip, .panel .action-card, .kpi-card';
    document.querySelectorAll(selectors).forEach(el => {
      el.addEventListener('click', (e) => {
        const href = el.getAttribute('href') || '';
        if (href.startsWith('#') && href.length > 1) {
          e.preventDefault();
          const name = href.slice(1);
          if (location.hash !== '#' + name) {
            location.hash = '#' + name;
            // hashchange disparará showView
          } else {
            showView(name);
          }
        }
      });
    });
  }

  // ── Listener de hashchange ──
  window.addEventListener('hashchange', () => {
    const h = (location.hash || '').slice(1);
    showView(h || HOME_KEY);
  });

  // ── Boot ──
  interceptClicks();
  const initialHash = (location.hash || '').slice(1);
  if (initialHash && initialHash !== HOME_KEY) {
    showView(initialHash);
  } else {
    updateActive(HOME_KEY);
  }
})();
