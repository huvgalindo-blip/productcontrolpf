/**
 * ============================================================
 * MÓDULO: UTILIDADES
 * ============================================================
 * Responsabilidades:
 *   - Debounce para inputs que se repiten
 *   - Notificaciones visuales al usuario
 *   - Utilidades varias (clonado, validaciones básicas)
 * 
 * Dependencias: datos.js (CONSTANTES)
 * ============================================================
 */

// ============================================================
// 1. DEBOUNCE
// ============================================================

/**
 * Retrasa la ejecución de una función hasta que pase un tiempo
 * sin volver a ser llamada. Útil para inputs y búsquedas.
 * 
 * @param {Function} fn - Función a ejecutar
 * @param {number} delay - Milisegundos de espera
 * @returns {Function} Función debounced
 */
function debounce(fn, delay = CONSTANTES.DEBOUNCE_DELAY) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ============================================================
// 2. NOTIFICACIONES
// ============================================================

/**
 * Muestra una notificación flotante en la esquina superior derecha.
 * Se oculta automáticamente después de CONSTANTES.TIEMPO_NOTIFICACION ms.
 * 
 * @param {string} mensaje - Texto a mostrar
 * @param {string} tipo - 'success' | 'error' | 'warning' | 'info'
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) {
        console.warn('No existe el elemento #notification');
        return;
    }
    
    notification.textContent = mensaje;
    notification.className = `notification ${tipo}`;
    notification.classList.remove('hidden');

    clearTimeout(window.notificationTimeout);
    window.notificationTimeout = setTimeout(() => {
        notification.classList.add('hidden');
    }, CONSTANTES.TIEMPO_NOTIFICACION);
}

// ============================================================
// 3. UTILIDADES VARIAS
// ============================================================

/**
 * Devuelve una copia profunda de un objeto.
 * Evita mutaciones accidentales en datos compartidos.
 * 
 * @param {*} obj - Objeto a clonar
 * @returns {*} Copia profunda
 */
function clonarProfundo(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Convierte un valor a número entero, o devuelve 0 si no es válido.
 * 
 * @param {*} valor 
 * @returns {number}
 */
function aEntero(valor) {
    const n = parseInt(valor);
    return isNaN(n) ? 0 : n;
}

/**
 * Convierte un valor a número decimal, o devuelve 0 si no es válido.
 * 
 * @param {*} valor 
 * @returns {number}
 */
function aDecimal(valor) {
    const n = parseFloat(valor);
    return isNaN(n) ? 0 : n;
}

/**
 * Redondea un número a 2 decimales (para precios/costes).
 * 
 * @param {number} n 
 * @returns {number}
 */
function redondear2(n) {
    return Math.round((parseFloat(n) || 0) * 100) / 100;
}

/**
 * Escapa caracteres HTML para evitar inyecciones o roturas en el render.
 * Usar siempre que se interpole texto de usuario en HTML.
 * 
 * @param {string} texto 
 * @returns {string}
 */
function escaparHTML(texto) {
    if (texto === null || texto === undefined) return '';
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Suma todos los valores numéricos de un objeto.
 * Ej: {a: 2, b: 3} → 5
 * 
 * @param {object} obj 
 * @returns {number}
 */
function sumaValores(obj) {
    if (!obj || typeof obj !== 'object') return 0;
    return Object.values(obj).reduce((total, v) => total + (parseFloat(v) || 0), 0);
}
