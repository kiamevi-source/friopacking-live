/* ════════════════════════════════════════════════════════════════════
   router.js — Sidebar mobile toggle, ⌘K, ESC, fecha, navegación
   Dependencias: core.js (lucide)
   ════════════════════════════════════════════════════════════════════ */

// ── Fecha en español en el header ──
(function setDate() {
  const days   = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const d = new Date();
  const txt = `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  const el = document.getElementById('hdr-date');
  if (el) el.textContent = txt;
})();

// ── Mobile sidebar toggle ──
(function setupSidebar() {
  const sb       = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sb-backdrop');
  const toggle   = document.getElementById('sidebar-toggle');
  if (!sb || !backdrop || !toggle) return;

  function open()  { sb.classList.add('open');    backdrop.classList.add('on');    }
  function close() { sb.classList.remove('open'); backdrop.classList.remove('on'); }

  toggle.addEventListener('click', open);
  backdrop.addEventListener('click', close);

  // Cerrar al navegar (mobile)
  sb.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => { if (window.innerWidth <= 767) close(); })
  );

  // ESC cierra sidebar
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

// ── ⌘K / Ctrl+K → enfocar búsqueda global ──
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const i = document.getElementById('global-search');
    if (i) { i.focus(); i.select(); }
  }
});
