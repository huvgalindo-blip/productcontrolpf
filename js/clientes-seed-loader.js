/* ============================================================
   Quality Pizzafresh — Loader del seed de clientes (1VERONA)
   ============================================================
   - Se ejecuta UNA sola vez por instalación (flag en localStorage).
   - Añade los clientes de window.CLIENTES_SEED que no existan
     (comparando por `codigo`).
   - No borra ni modifica los clientes actuales.
   - Los duplicados ya vienen renumerados con sufijo B desde el seed.
   ============================================================ */

(function () {
  'use strict';

  const CLAVE_FLAG = 'clientesSeedAplicado_v1';

  function aplicarSeed() {
    // Ya aplicado antes → salir
    if (localStorage.getItem(CLAVE_FLAG)) {
      console.log('[clientes-seed] Ya aplicado previamente. Omitiendo.');
      return;
    }

    // Validaciones defensivas
    if (typeof cargarDatos !== 'function' || typeof guardarDatos !== 'function') {
      console.warn('[clientes-seed] cargarDatos/guardarDatos no disponibles. ¿datos.js cargado?');
      return;
    }
    if (!window.CLIENTES_SEED || !Array.isArray(window.CLIENTES_SEED)) {
      console.warn('[clientes-seed] window.CLIENTES_SEED no encontrado. ¿clientes-seed.js cargado?');
      return;
    }

    const datos = cargarDatos();
    if (!Array.isArray(datos.clientes)) datos.clientes = [];

    const codigosExistentes = new Set(datos.clientes.map(c => String(c.codigo)));

    const baseId = Date.now();
    let añadidos = 0;
    let omitidos = 0;

    window.CLIENTES_SEED.forEach((c, i) => {
      const codigo = String(c.codigo || '').trim();
      if (!codigo) return;

      if (codigosExistentes.has(codigo)) {
        omitidos++;
        return;
      }

      datos.clientes.push({
        id: baseId + i,
        codigo,
        nombre: (c.nombre || '(sin nombre)').trim(),
        pais: c.pais || 'España',
        activo: true,
        notas: '',
        origen: 'seed_1verona'
      });
      codigosExistentes.add(codigo);
      añadidos++;
    });

    guardarDatos(datos);
    localStorage.setItem(CLAVE_FLAG, JSON.stringify({
      aplicadoEn: new Date().toISOString(),
      añadidos,
      omitidos,
      totalSeed: window.CLIENTES_SEED.length
    }));

    console.log(`[clientes-seed] ✅ Añadidos ${añadidos} clientes. Omitidos por código existente: ${omitidos}. Total seed: ${window.CLIENTES_SEED.length}.`);

    // Refresco visual si la función existe
    if (typeof renderizarClientes === 'function') {
      try { renderizarClientes(); } catch (_) {}
    }
  }

  // Ejecutar cuando el DOM esté listo (garantiza que datos.js ya se ha cargado)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarSeed);
  } else {
    aplicarSeed();
  }

  // Exponer función de reseteo por si necesitas re-aplicar el seed
  // (ej. tras cambiar el .txt y regenerar clientes-seed.js)
  window.resetearSeedClientes = function () {
    localStorage.removeItem(CLAVE_FLAG);
    console.log('[clientes-seed] Flag borrado. Recarga la página para re-aplicar.');
  };
})();
