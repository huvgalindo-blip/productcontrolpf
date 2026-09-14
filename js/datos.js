/**
 * ============================================================
 * MÓDULO: DATOS
 * ============================================================
 * Responsabilidades:
 *   - Constantes globales de la aplicación
 *   - Datos por defecto (seed data)
 *   - Persistencia en localStorage (cargar/guardar/backup)
 *   - Validación de estructura de datos
 *   - Helpers de fecha
 * 
 * Dependencias: ninguna
 * ============================================================
 */

// ============================================================
// 1. CONSTANTES GLOBALES
// ============================================================

const CONSTANTES = {
    DIAS_SEMANA: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    MESES: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    TIEMPO_NOTIFICACION: 3500,
    DEBOUNCE_DELAY: 300,
    MAX_REINTENTOS_GUARDADO: 3,
    CLAVE_LOCALSTORAGE: 'qualityPizzaData',
    CLAVE_BACKUP: 'qualityPizzaData_backup'
};

// ============================================================
// 2. DATOS POR DEFECTO (SEED DATA)
// ============================================================

const DATOS_POR_DEFECTO = {
    productos: [
        { id: 1, nombre: "Pequeña", precioCosto: 0.09, precioVenta: 0.75, activo: true },
        { id: 2, nombre: "Peq 190", precioCosto: 0.09, precioVenta: 0.75, activo: true },
        { id: 3, nombre: "Mediana", precioCosto: 0.14, precioVenta: 1.10, activo: true },
        { id: 4, nombre: "Grande", precioCosto: 0.24, precioVenta: 1.80, activo: true },
        { id: 5, nombre: "Plancha", precioCosto: 0.30, precioVenta: 2.30, activo: true },
        { id: 6, nombre: "Piadina", precioCosto: 0.30, precioVenta: 2.30, activo: true },
        { id: 7, nombre: "Espelta", precioCosto: 0.45, precioVenta: 1.45, activo: true },
        { id: 8, nombre: "Single", precioCosto: 0.07, precioVenta: 0.65, activo: true },
        { id: 9, nombre: "P.Americana", precioCosto: 0.14, precioVenta: 0.95, activo: true },
        { id: 10, nombre: "Med. America", precioCosto: 0.24, precioVenta: 1.70, activo: true },
        { id: 11, nombre: "G.Americana", precioCosto: 0.30, precioVenta: 2.20, activo: true },
        { id: 12, nombre: "M.Refinata", precioCosto: 0.09, precioVenta: 1.35, activo: true },
        { id: 13, nombre: "G.Refinata", precioCosto: 0.14, precioVenta: 1.00, activo: true },
        { id: 14, nombre: "Med. 32", precioCosto: 0.14, precioVenta: 1.35, activo: true },
        { id: 15, nombre: "Med.35", precioCosto: 0.20, precioVenta: 1.42, activo: true },
        { id: 16, nombre: "Pequeña 25", precioCosto: 0.09, precioVenta: 0.75, activo: true },
        { id: 17, nombre: "Allar 24x15", precioCosto: 0.14, precioVenta: 1.10, activo: true },
        { id: 18, nombre: "Allar 30x18", precioCosto: 0.14, precioVenta: 1.10, activo: true },
        { id: 19, nombre: "cuad. 28x28", precioCosto: 0.14, precioVenta: 1.10, activo: true },
        { id: 20, nombre: "Grand 50", precioCosto: 0.30, precioVenta: 2.20, activo: true }
    ],
    clientes: [
        { id: 1, codigo: "5.0", nombre: "LA HOYA ROSARIO MONTERO BOIX", activo: true },
        { id: 2, codigo: "6.0", nombre: "GOYOS CIUDAD QUESADA (COMARCA)", activo: true },
        { id: 3, codigo: "8.0", nombre: "LITTOS ALTET", activo: true },
        { id: 4, codigo: "10.0", nombre: "SERVIPIZZA GUARDAMAR", activo: true },
        { id: 5, codigo: "11.0", nombre: "SERVIPIZZA ROJALES", activo: true },
        { id: 6, codigo: "12.0", nombre: "SERVIPIZZA ALMORADÍ", activo: true },
        { id: 7, codigo: "13.0", nombre: "SERVIPIZZA SANTOMERA", activo: true },
        { id: 8, codigo: "14.0", nombre: "SERVIPIZZA TORRE PACHECO", activo: true },
        { id: 9, codigo: "15.0", nombre: "SERVIPIZZA SAN JUAN", activo: true },
        { id: 10, codigo: "16.0", nombre: "SERVIPIZZA CREVILLENTE", activo: true }
    ],
    configuracion: {
        costeManoObraHora: 7.24,
        diasCaducidad: 19
    },
    produccion: {},
    ordenesAmasado: {}
};

// ============================================================
// 3. PERSISTENCIA (localStorage)
// ============================================================

/**
 * Carga los datos desde localStorage.
 * Si no existen, guarda los datos por defecto y los devuelve.
 * Siempre garantiza que la estructura sea válida.
 */
function cargarDatos() {
    try {
        const datosGuardados = localStorage.getItem(CONSTANTES.CLAVE_LOCALSTORAGE);
        if (datosGuardados) {
            const datos = JSON.parse(datosGuardados);
            return asegurarEstructuraDatos(datos);
        }
        // Primera vez: guardar por defecto y devolver copia
        guardarDatos(DATOS_POR_DEFECTO);
        return JSON.parse(JSON.stringify(DATOS_POR_DEFECTO));
    } catch (error) {
        console.error('Error al cargar datos:', error);
        return JSON.parse(JSON.stringify(DATOS_POR_DEFECTO));
    }
}

/**
 * Guarda los datos en localStorage con reintentos.
 * También crea un backup automático.
 */
function guardarDatos(datos, reintentos = 0) {
    try {
        const datosStr = JSON.stringify(datos);
        localStorage.setItem(CONSTANTES.CLAVE_LOCALSTORAGE, datosStr);
        
        // Backup automático (silencioso si falla)
        try {
            localStorage.setItem(CONSTANTES.CLAVE_BACKUP, datosStr);
        } catch (e) {
            console.warn('No se pudo crear backup:', e);
        }
        return true;
    } catch (error) {
        console.error('Error al guardar datos:', error);
        if (reintentos < CONSTANTES.MAX_REINTENTOS_GUARDADO) {
            return guardarDatos(datos, reintentos + 1);
        }
        return false;
    }
}

/**
 * Restaura los datos desde el backup automático.
 */
function restaurarBackup() {
    try {
        const backup = localStorage.getItem(CONSTANTES.CLAVE_BACKUP);
        if (backup) {
            localStorage.setItem(CONSTANTES.CLAVE_LOCALSTORAGE, backup);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error al restaurar backup:', error);
        return false;
    }
}

/**
 * Asegura que la estructura de datos tenga todas las propiedades necesarias.
 * Evita errores si el localStorage está corrupto o es de una versión antigua.
 */
function asegurarEstructuraDatos(datos) {
    const d = datos || {};
    if (!Array.isArray(d.productos)) d.productos = DATOS_POR_DEFECTO.productos;
    if (!Array.isArray(d.clientes)) d.clientes = DATOS_POR_DEFECTO.clientes;
    if (!d.configuracion || typeof d.configuracion !== 'object') {
        d.configuracion = DATOS_POR_DEFECTO.configuracion;
    }
    if (!d.produccion || typeof d.produccion !== 'object') d.produccion = {};
    if (!d.ordenesAmasado || typeof d.ordenesAmasado !== 'object') d.ordenesAmasado = {};
    return d;
}

// ============================================================
// 4. GENERADOR DE IDs
// ============================================================

/**
 * Genera un nuevo ID incremental para una colección.
 */
function generarId(coleccion) {
    if (!Array.isArray(coleccion) || coleccion.length === 0) return 1;
    return Math.max(...coleccion.map(i => i.id || 0)) + 1;
}

// ============================================================
// 5. HELPERS DE FECHA
// ============================================================

/**
 * Devuelve la fecha actual en formato YYYY-MM-DD.
 */
function obtenerFechaActual() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Formatea una fecha YYYY-MM-DD a DD/MM/YYYY.
 */
function formatearFecha(fecha) {
    if (!fecha) return '';
    const p = fecha.split('-');
    return `${p[2]}/${p[1]}/${p[0]}`;
}

/**
 * Formatea una fecha a texto largo en español.
 * Ejemplo: "lunes, 14 de septiembre de 2026"
 */
function formatearFechaLarga(fecha) {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Devuelve la fecha siguiente a la indicada.
 */
function obtenerFechaSiguiente(fecha) {
    const d = new Date(fecha);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
}
