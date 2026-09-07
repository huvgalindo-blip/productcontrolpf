/**
 * ============================================================
 * APLICACIÓN CONTROL DE PRODUCCIÓN - Quality Pizzafresh
 * ============================================================
 * Archivo principal que orquesta toda la aplicación
 * Tecnología: JavaScript ES6+ con localStorage
 * Estilo: Simple, funcional y bien comentado
 * ============================================================
 */

// ============================================================
// 0. CONSTANTES GLOBALES
// ============================================================

const CONSTANTES = {
    DIAS_SEMANA: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    MESES: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    LIMITE_CAJAS: {
        'Pequeña': 25,
        'Mediana': 15
    },
    TIEMPO_NOTIFICACION: 3500,
    DEBOUNCE_DELAY: 300,
    MAX_REINTENTOS_GUARDADO: 3,
    CLAVE_LOCALSTORAGE: 'qualityPizzaData',
    CLAVE_BACKUP: 'qualityPizzaData_backup'
};

// ============================================================
// 1. DATOS POR DEFECTO (SEED DATA)
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
// 2. SERVICIO DE DATOS (OPTIMIZADO)
// ============================================================

function cargarDatos() {
    try {
        const datosGuardados = localStorage.getItem(CONSTANTES.CLAVE_LOCALSTORAGE);
        if (datosGuardados) {
            const datos = JSON.parse(datosGuardados);
            // Asegurar estructura completa
            return asegurarEstructuraDatos(datos);
        }
        guardarDatos(DATOS_POR_DEFECTO);
        return JSON.parse(JSON.stringify(DATOS_POR_DEFECTO));
    } catch (error) {
        console.error('Error al cargar datos:', error);
        mostrarNotificacion('⚠️ Error al cargar datos. Usando datos por defecto.', 'error');
        return JSON.parse(JSON.stringify(DATOS_POR_DEFECTO));
    }
}

function asegurarEstructuraDatos(datos) {
    // Crear copia para no modificar el original
    const datosSeguros = datos || {};
    
    // Asegurar cada propiedad
    if (!datosSeguros.productos || !Array.isArray(datosSeguros.productos)) {
        datosSeguros.productos = DATOS_POR_DEFECTO.productos;
    }
    if (!datosSeguros.clientes || !Array.isArray(datosSeguros.clientes)) {
        datosSeguros.clientes = DATOS_POR_DEFECTO.clientes;
    }
    if (!datosSeguros.configuracion || typeof datosSeguros.configuracion !== 'object') {
        datosSeguros.configuracion = DATOS_POR_DEFECTO.configuracion;
    }
    if (!datosSeguros.produccion || typeof datosSeguros.produccion !== 'object') {
        datosSeguros.produccion = {};
    }
    if (!datosSeguros.ordenesAmasado || typeof datosSeguros.ordenesAmasado !== 'object') {
        datosSeguros.ordenesAmasado = {};
    }
    
    return datosSeguros;
}

function guardarDatos(datos, reintentos = 0) {
    try {
        const datosStr = JSON.stringify(datos);
        localStorage.setItem(CONSTANTES.CLAVE_LOCALSTORAGE, datosStr);
        // Backup automático
        try {
            localStorage.setItem(CONSTANTES.CLAVE_BACKUP, datosStr);
        } catch (backupError) {
            console.warn('No se pudo crear backup:', backupError);
        }
        return true;
    } catch (error) {
        console.error('Error al guardar datos:', error);
        
        if (reintentos < CONSTANTES.MAX_REINTENTOS_GUARDADO) {
            console.log(`Reintentando guardar... (${reintentos + 1}/${CONSTANTES.MAX_REINTENTOS_GUARDADO})`);
            return guardarDatos(datos, reintentos + 1);
        }
        
        mostrarNotificacion('⚠️ Error al guardar datos. Verifique el espacio disponible.', 'error');
        return false;
    }
}

function restaurarBackup() {
    try {
        const backup = localStorage.getItem(CONSTANTES.CLAVE_BACKUP);
        if (backup) {
            const datos = JSON.parse(backup);
            localStorage.setItem(CONSTANTES.CLAVE_LOCALSTORAGE, backup);
            mostrarNotificacion('✅ Backup restaurado correctamente', 'success');
            return datos;
        }
        mostrarNotificacion('❌ No se encontró backup', 'error');
        return null;
    } catch (error) {
        console.error('Error al restaurar backup:', error);
        mostrarNotificacion('❌ Error al restaurar backup', 'error');
        return null;
    }
}

function generarId(coleccion) {
    if (!coleccion || !Array.isArray(coleccion) || coleccion.length === 0) return 1;
    const ids = coleccion.map(item => item.id || 0);
    return Math.max(...ids) + 1;
}

function obtenerFechaActual() {
    return new Date().toISOString().split('T')[0];
}

function formatearFecha(fecha) {
    if (!fecha) return '';
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearFechaLarga(fecha) {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ============================================================
// 2.1 FUNCIONES DE UTILIDAD (OPTIMIZADAS)
// ============================================================

function debounce(fn, delay = CONSTANTES.DEBOUNCE_DELAY) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function throttle(fn, limit = 1000) {
    let inThrottle = false;
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function validarNumeroPositivo(valor, campo) {
    const num = parseFloat(valor);
    if (isNaN(num) || num < 0) {
        throw new Error(`${campo} debe ser un número positivo`);
    }
    return num;
}

function validarTextoNoVacio(texto, campo) {
    if (!texto || texto.trim() === '') {
        throw new Error(`${campo} no puede estar vacío`);
    }
    return texto.trim();
}

// ============================================================
// 3. SERVICIO DE PRODUCTOS (OPTIMIZADO)
// ============================================================

function obtenerProductosActivos(datos) {
    return datos.productos.filter(p => p.activo === true);
}

function obtenerPrecioVenta(datos, nombre) {
    const producto = datos.productos.find(p => p.nombre === nombre && p.activo);
    return producto ? producto.precioVenta : 0;
}

function obtenerPrecioCosto(datos, nombre) {
    const producto = datos.productos.find(p => p.nombre === nombre && p.activo);
    return producto ? producto.precioCosto : 0;
}

function obtenerProductoPorNombre(datos, nombre) {
    return datos.productos.find(p => p.nombre === nombre && p.activo) || null;
}

// ============================================================
// 4. SERVICIO DE CLIENTES (OPTIMIZADO)
// ============================================================

function obtenerClientesActivos(datos) {
    return datos.clientes.filter(c => c.activo === true);
}

function obtenerClientePorId(datos, id) {
    return datos.clientes.find(c => c.id === id) || null;
}

function obtenerClientePorCodigo(datos, codigo) {
    return datos.clientes.find(c => c.codigo === codigo) || null;
}

function validarCliente(cliente) {
    const errores = [];
    
    if (!cliente.codigo || cliente.codigo.trim() === '') {
        errores.push('El código es obligatorio');
    }
    
    if (!cliente.nombre || cliente.nombre.trim() === '') {
        errores.push('El nombre es obligatorio');
    }
    
    return {
        valida: errores.length === 0,
        errores
    };
}

// ============================================================
// 5. SERVICIO DE PRODUCCIÓN (OPTIMIZADO)
// ============================================================

function obtenerProduccionDia(datos, fecha) {
    if (!datos.produccion[fecha]) {
        datos.produccion[fecha] = {
            inventarioInicial: {},
            horasTrabajadas: 0,
            pedidos: []
        };
        guardarDatos(datos);
    }
    return datos.produccion[fecha];
}

function inicializarInventario(datos, fecha) {
    const productos = obtenerProductosActivos(datos);
    const produccion = obtenerProduccionDia(datos, fecha);
    const inventario = {};

    // Si ya hay inventario, devolverlo
    if (produccion.inventarioInicial && Object.keys(produccion.inventarioInicial).length > 0) {
        return produccion.inventarioInicial;
    }

    // Buscar orden de amasado aplicada para este día
    const ordenAmasado = buscarOrdenAmasadoPorFechaUso(datos, fecha);
    if (ordenAmasado) {
        const inventarioDesdeAmasado = {};
        ordenAmasado.lineas.forEach(linea => {
            if (linea.distribucion) {
                Object.keys(linea.distribucion).forEach(producto => {
                    const cantidad = linea.distribucion[producto] || 0;
                    if (cantidad > 0) {
                        inventarioDesdeAmasado[producto] = (inventarioDesdeAmasado[producto] || 0) + cantidad;
                    }
                });
            }
        });
        produccion.inventarioInicial = inventarioDesdeAmasado;
        produccion.inventarioDesdeAmasado = true;
        guardarDatos(datos);
        return inventarioDesdeAmasado;
    }

    // Si no, heredar del día anterior
    const fechaAnterior = new Date(fecha);
    fechaAnterior.setDate(fechaAnterior.getDate() - 1);
    const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];
    const produccionAnterior = datos.produccion[fechaAnteriorStr];

    if (produccionAnterior && produccionAnterior.inventarioFinal) {
        produccion.inventarioInicial = produccionAnterior.inventarioFinal;
        guardarDatos(datos);
        return produccionAnterior.inventarioFinal;
    }

    // Si no hay nada, inicializar a 0
    productos.forEach(p => {
        inventario[p.nombre] = 0;
    });
    produccion.inventarioInicial = inventario;
    guardarDatos(datos);
    return inventario;
}

function buscarOrdenAmasadoPorFechaUso(datos, fecha) {
    const ordenes = datos.ordenesAmasado || {};
    for (const fechaOrden in ordenes) {
        const orden = ordenes[fechaOrden];
        if (orden.fechaUso === fecha && orden.aplicadoAProduccion) {
            return orden;
        }
    }
    return null;
}

function calcularVentasDiarias(pedidos) {
    const ventas = {};
    if (!pedidos || !Array.isArray(pedidos)) return ventas;
    
    pedidos.forEach(pedido => {
        if (pedido.productos && typeof pedido.productos === 'object') {
            Object.keys(pedido.productos).forEach(nombre => {
                const cantidad = parseFloat(pedido.productos[nombre]) || 0;
                if (cantidad > 0) {
                    ventas[nombre] = (ventas[nombre] || 0) + cantidad;
                }
            });
        }
    });
    return ventas;
}

function calcularInventarioFinal(inventarioInicial, ventasDiarias) {
    const final = {};
    const todosLosProductos = new Set([
        ...Object.keys(inventarioInicial || {}),
        ...Object.keys(ventasDiarias || {})
    ]);

    todosLosProductos.forEach(nombre => {
        const inicial = parseFloat(inventarioInicial?.[nombre]) || 0;
        const ventas = parseFloat(ventasDiarias?.[nombre]) || 0;
        final[nombre] = inicial - ventas;
    });

    return final;
}

function calcularCosteMateriaPrima(datos, ventasDiarias) {
    let total = 0;
    Object.keys(ventasDiarias || {}).forEach(nombre => {
        const cantidad = parseFloat(ventasDiarias[nombre]) || 0;
        const costeUnitario = obtenerPrecioCosto(datos, nombre);
        total += cantidad * costeUnitario;
    });
    return Math.round(total * 100) / 100;
}

function calcularVentasGeneradas(datos, ventasDiarias) {
    let total = 0;
    Object.keys(ventasDiarias || {}).forEach(nombre => {
        const cantidad = parseFloat(ventasDiarias[nombre]) || 0;
        const precioVenta = obtenerPrecioVenta(datos, nombre);
        total += cantidad * precioVenta;
    });
    return Math.round(total * 100) / 100;
}

function calcularMargen(ventasGeneradas, costeTotal) {
    if (ventasGeneradas === 0) return 0;
    return Math.round(((ventasGeneradas - costeTotal) / ventasGeneradas) * 10000) / 100;
}

function calcularTotalPedido(productos) {
    let total = 0;
    if (productos && typeof productos === 'object') {
        Object.keys(productos).forEach(nombre => {
            total += parseFloat(productos[nombre]) || 0;
        });
    }
    return total;
}

// ============================================================
// 6. CONFIGURACIÓN DE AMASADO
// ============================================================

const CONFIGURACION_AMASADO = {
    "Pequeña": {
        peso: 160,
        configuraciones: [
            { tipoCaja: "Pequeña", maxCajas: 25, opcionesBolas: [8, 10, 11] },
            { tipoCaja: "Mediana", maxCajas: 15, opcionesBolas: [8, 10, 11] }
        ],
        productosDestino: ["Pequeña", "M.Refinata", "Pequeña 25", "Allar 24x15"]
    },
    "Peq 190": {
        peso: 190,
        configuraciones: [
            { tipoCaja: "Pequeña", maxCajas: 25, opcionesBolas: [8, 10, 11] },
            { tipoCaja: "Mediana", maxCajas: 15, opcionesBolas: [8, 10, 11] }
        ],
        productosDestino: ["Peq 190", "cuad. 28x28"]
    },
    "Mediana": {
        peso: 260,
        configuraciones: [
            { tipoCaja: "Mediana", maxCajas: 15, opcionesBolas: [8, 10] },
            { tipoCaja: "Pequeña", maxCajas: 25, opcionesBolas: [8] }
        ],
        productosDestino: ["Mediana", "Med.28", "P.Americana", "G.Refinata", "Med.32", "Allar 30x18"]
    },
    "Grande": {
        peso: 460,
        configuraciones: [
            { tipoCaja: "Mediana", maxCajas: 15, opcionesBolas: [6] }
        ],
        productosDestino: ["Grande", "Med. America"]
    },
    "Plancha": {
        peso: 600,
        configuraciones: [
            { tipoCaja: "Mediana", maxCajas: 15, opcionesBolas: [3] }
        ],
        productosDestino: ["Plancha", "G.America", "Grand 50"]
    },
    "Single": {
        peso: 110,
        configuraciones: [
            { tipoCaja: "Pequeña", maxCajas: 25, opcionesBolas: [15] }
        ],
        productosDestino: ["Single", "Piadina"]
    },
    "Grande 360": {
        peso: 360,
        configuraciones: [
            { tipoCaja: "Mediana", maxCajas: 15, opcionesBolas: [6] }
        ],
        productosDestino: ["Med.35"]
    },
    "Pinsa Pequeña": {
        peso: 160,
        configuraciones: [
            { tipoCaja: "Pequeña", maxCajas: 25, opcionesBolas: [8] },
            { tipoCaja: "Mediana", maxCajas: 15, opcionesBolas: [8] }
        ],
        productosDestino: ["Pinsa Pequeña"]
    },
    "Pinsa Mediana": {
        peso: 260,
        configuraciones: [
            { tipoCaja: "Mediana", maxCajas: 15, opcionesBolas: [8] },
            { tipoCaja: "Pequeña", maxCajas: 25, opcionesBolas: [8] }
        ],
        productosDestino: ["Pinsa Mediana"]
    }
};

function obtenerTiposBola() {
    return Object.keys(CONFIGURACION_AMASADO);
}

function obtenerConfiguracionBola(tipo) {
    return CONFIGURACION_AMASADO[tipo] || null;
}

function obtenerFechaSiguiente(fecha) {
    const fechaObj = new Date(fecha);
    fechaObj.setDate(fechaObj.getDate() + 1);
    return fechaObj.toISOString().split('T')[0];
}

function obtenerHoraActual() {
    const ahora = new Date();
    return ahora.toTimeString().split(' ')[0].substring(0, 5);
}

function generarIdOrdenAmasado(fecha, numero) {
    const fechaLimpia = fecha.replace(/-/g, '');
    const numStr = String(numero).padStart(3, '0');
    return `ORD-${fechaLimpia}-${numStr}`;
}

// ============================================================
// 7. SERVICIO DE ÓRDENES DE AMASADO (OPTIMIZADO)
// ============================================================

function obtenerOrdenesAmasado(datos) {
    if (!datos.ordenesAmasado) {
        datos.ordenesAmasado = {};
        guardarDatos(datos);
    }
    return datos.ordenesAmasado;
}

function obtenerOrdenAmasado(datos, fecha) {
    const ordenes = obtenerOrdenesAmasado(datos);
    
    if (!ordenes[fecha]) {
        const numOrdenes = Object.keys(ordenes).length;
        
        ordenes[fecha] = {
            id: generarIdOrdenAmasado(fecha, numOrdenes + 1),
            fechaAmasado: fecha,
            fechaUso: obtenerFechaSiguiente(fecha),
            lineas: [],
            totalBolas: 0,
            pesoTotal: 0,
            aplicadoAProduccion: false,
            observaciones: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        guardarDatos(datos);
    }
    
    return ordenes[fecha];
}

function guardarOrdenAmasado(datos, fecha, orden) {
    const ordenes = obtenerOrdenesAmasado(datos);
    orden.updatedAt = new Date().toISOString();
    ordenes[fecha] = orden;
    return guardarDatos(datos);
}

function eliminarOrdenAmasado(datos, fecha) {
    const ordenes = obtenerOrdenesAmasado(datos);
    if (ordenes[fecha]) {
        delete ordenes[fecha];
        return guardarDatos(datos);
    }
    return false;
}

function validarOrdenAmasado(orden) {
    const errores = [];
    
    if (!orden) {
        errores.push('Orden no válida');
        return { valida: false, errores };
    }
    
    if (!orden.lineas || !Array.isArray(orden.lineas) || orden.lineas.length === 0) {
        errores.push('Debe haber al menos una línea de amasado');
        return { valida: false, errores };
    }
    
    orden.lineas.forEach((linea, index) => {
        const numLinea = index + 1;
        
        if (!linea.tipoBola) {
            errores.push(`Línea ${numLinea}: Tipo de bola no definido`);
        }
        
        if (!linea.peso || linea.peso <= 0) {
            errores.push(`Línea ${numLinea}: Peso inválido`);
        }
        
        if (!linea.tipoCaja) {
            errores.push(`Línea ${numLinea}: Tipo de caja no definido`);
        }
        
        const total = linea.total || 0;
        const asignado = linea.distribucion ? Object.values(linea.distribucion).reduce((a, b) => a + b, 0) : 0;
        
        if (linea.cajas < 1) {
            errores.push(`Línea ${numLinea}: El número de cajas debe ser mayor a 0`);
        }
        
        if (linea.bolasPorCaja < 1) {
            errores.push(`Línea ${numLinea}: Las bolas por caja deben ser mayor a 0`);
        }
        
        if (asignado !== total) {
            errores.push(`Línea ${numLinea}: Faltan ${total - asignado} bolas por asignar (total: ${total}, asignado: ${asignado})`);
        }
        
        if (linea.distribucion) {
            Object.entries(linea.distribucion).forEach(([producto, cantidad]) => {
                if (cantidad < 0) {
                    errores.push(`Línea ${numLinea}: Valor negativo para ${producto} (${cantidad})`);
                }
            });
        }
    });
    
    return {
        valida: errores.length === 0,
        errores: errores
    };
}

function aplicarOrdenAProduccion(datos, fecha) {
    const ordenes = obtenerOrdenesAmasado(datos);
    const orden = ordenes[fecha];
    
    if (!orden) {
        mostrarNotificacion('❌ No se encontró la orden de amasado', 'error');
        return false;
    }
    
    const validacion = validarOrdenAmasado(orden);
    if (!validacion.valida) {
        mostrarNotificacion('❌ La orden no está completa: ' + validacion.errores.join(', '), 'error');
        return false;
    }
    
    if (orden.aplicadoAProduccion) {
        mostrarNotificacion('⚠️ Esta orden ya fue aplicada a producción', 'warning');
        return false;
    }
    
    const fechaUso = orden.fechaUso;
    
    // Asegurar que la fecha de uso existe en producción
    if (!datos.produccion) datos.produccion = {};
    if (!datos.produccion[fechaUso]) {
        datos.produccion[fechaUso] = {
            inventarioInicial: {},
            horasTrabajadas: 0,
            pedidos: []
        };
    }
    
    // Calcular inventario desde la orden
    const inventario = {};
    orden.lineas.forEach(linea => {
        if (linea.distribucion) {
            Object.keys(linea.distribucion).forEach(producto => {
                const cantidad = linea.distribucion[producto] || 0;
                if (cantidad > 0) {
                    inventario[producto] = (inventario[producto] || 0) + cantidad;
                }
            });
        }
    });
    
    // Si ya existe inventario inicial, sumar en lugar de sobrescribir
    if (datos.produccion[fechaUso].inventarioInicial && 
        Object.keys(datos.produccion[fechaUso].inventarioInicial).length > 0 &&
        !datos.produccion[fechaUso].inventarioDesdeAmasado) {
        Object.keys(inventario).forEach(producto => {
            datos.produccion[fechaUso].inventarioInicial[producto] = 
                (datos.produccion[fechaUso].inventarioInicial[producto] || 0) + inventario[producto];
        });
    } else {
        datos.produccion[fechaUso].inventarioInicial = inventario;
    }
    
    datos.produccion[fechaUso].inventarioDesdeAmasado = true;
    orden.aplicadoAProduccion = true;
    orden.aplicadoEn = new Date().toISOString();
    orden.fechaAplicada = fechaUso;
    
    if (!guardarDatos(datos)) {
        mostrarNotificacion('❌ Error al guardar los datos', 'error');
        return false;
    }
    
    mostrarNotificacion(`✅ Orden aplicada a producción del día ${fechaUso}`, 'success');
    return true;
}

function obtenerResumenOrdenAmasado(orden) {
    let totalBolas = 0;
    let pesoTotal = 0;
    let totalCajas = 0;
    let totalTorres = 0;
    
    if (orden && orden.lineas && Array.isArray(orden.lineas)) {
        orden.lineas.forEach(linea => {
            totalBolas += linea.total || 0;
            pesoTotal += ((linea.total || 0) * linea.peso / 1000);
            totalCajas += linea.cajas || 0;
            totalTorres += 1;
        });
    }
    
    return {
        totalBolas: totalBolas,
        pesoTotal: Math.round(pesoTotal * 100) / 100,
        totalCajas: totalCajas,
        totalTorres: totalTorres,
        tieneDistribucion: totalBolas > 0
    };
}

// ============================================================
// 8. FUNCIONES DE INTERACCIÓN - AMASADO (CORREGIDAS)
// ============================================================

function obtenerClimaGuardamar() {
    try {
        const hora = new Date().getHours();
        const mes = new Date().getMonth();
        
        const tempPorMes = [12, 13, 15, 18, 21, 25, 28, 29, 26, 22, 17, 13];
        let temp = tempPorMes[mes] || 20;
        
        if (hora >= 6 && hora < 9) temp -= 2;
        else if (hora >= 9 && hora < 12) temp += 1;
        else if (hora >= 12 && hora < 15) temp += 3;
        else if (hora >= 15 && hora < 18) temp += 2;
        else if (hora >= 21 || hora < 6) temp -= 3;
        
        let humedad = 60 + Math.floor(Math.random() * 10);
        if (mes >= 6 && mes <= 9) humedad += 10;
        if (hora >= 6 && hora < 9) humedad += 5;
        if (hora >= 12 && hora < 15) humedad -= 5;
        
        temp = Math.round(Math.max(5, Math.min(35, temp)) * 10) / 10;
        humedad = Math.round(Math.max(40, Math.min(85, humedad)));
        
        return {
            temperatura: temp,
            humedad: humedad,
            ciudad: 'Guardamar del Segura',
            provincia: 'Alicante'
        };
    } catch (error) {
        console.error('Error al obtener clima:', error);
        return {
            temperatura: 22,
            humedad: 55,
            ciudad: 'Guardamar del Segura',
            provincia: 'Alicante'
        };
    }
}

function mostrarModalLineaAmasado() {
    const tipos = obtenerTiposBola();
    
    let mensaje = 'Selecciona el tipo de bola:\n';
    tipos.forEach((t, i) => {
        mensaje += `${i+1}. ${t}\n`;
    });
    mensaje += '\n0. Cancelar';
    
    const seleccion = prompt(mensaje);
    if (!seleccion || seleccion === '0') return;
    
    const index = parseInt(seleccion) - 1;
    if (isNaN(index) || index < 0 || index >= tipos.length) {
        mostrarNotificacion('❌ Selección inválida', 'error');
        return;
    }
    
    const tipoSeleccionado = tipos[index];
    const config = obtenerConfiguracionBola(tipoSeleccionado);
    if (!config) {
        mostrarNotificacion('❌ Tipo de bola no encontrado', 'error');
        return;
    }
    
    let mensajeCaja = 'Selecciona el tipo de caja:\n';
    config.configuraciones.forEach((c, i) => {
        mensajeCaja += `${i+1}. ${c.tipoCaja} (max ${c.maxCajas} cajas) - opciones: ${c.opcionesBolas.join(', ')}\n`;
    });
    mensajeCaja += '\n0. Cancelar';
    
    const seleccionCaja = prompt(mensajeCaja);
    if (!seleccionCaja || seleccionCaja === '0') return;
    
    const cajaIndex = parseInt(seleccionCaja) - 1;
    if (isNaN(cajaIndex) || cajaIndex < 0 || cajaIndex >= config.configuraciones.length) {
        mostrarNotificacion('❌ Selección inválida', 'error');
        return;
    }
    
    const configCaja = config.configuraciones[cajaIndex];
    
    const cajasStr = prompt(`Número de cajas (máximo ${configCaja.maxCajas}):`, '1');
    if (!cajasStr) return;
    const cajas = parseInt(cajasStr);
    if (isNaN(cajas) || cajas < 1 || cajas > configCaja.maxCajas) {
        mostrarNotificacion(`❌ Número de cajas inválido (máximo ${configCaja.maxCajas})`, 'error');
        return;
    }
    
    const bolasStr = prompt(`Bolas por caja (opciones: ${configCaja.opcionesBolas.join(', ')}):`, configCaja.opcionesBolas[0].toString());
    if (!bolasStr) return;
    const bolasPorCaja = parseInt(bolasStr);
    if (isNaN(bolasPorCaja) || !configCaja.opcionesBolas.includes(bolasPorCaja)) {
        mostrarNotificacion(`❌ Bolas por caja inválido (opciones: ${configCaja.opcionesBolas.join(', ')})`, 'error');
        return;
    }
    
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    const nuevaLinea = {
        tipoBola: tipoSeleccionado,
        peso: config.peso,
        tipoCaja: configCaja.tipoCaja,
        cajas: cajas,
        bolasPorCaja: bolasPorCaja,
        total: cajas * bolasPorCaja,
        distribucion: {}
    };
    
    config.productosDestino.forEach(p => {
        nuevaLinea.distribucion[p] = 0;
    });
    
    if (!orden.lineas) orden.lineas = [];
    orden.lineas.push(nuevaLinea);
    guardarDatos(datos);
    renderizarOrdenAmasado();
    mostrarNotificacion('✅ Línea añadida correctamente', 'success');
}

const actualizarLineaAmasadoDebounce = debounce(function(index, campo, valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (!orden.lineas || index >= orden.lineas.length) return;
    
    const linea = orden.lineas[index];
    const numValor = parseInt(valor) || 0;
    
    if (campo === 'cajas') {
        const config = obtenerConfiguracionBola(linea.tipoBola);
        const configCaja = config?.configuraciones.find(c => c.tipoCaja === linea.tipoCaja);
        if (configCaja && numValor > configCaja.maxCajas) {
            mostrarNotificacion(`⚠️ Máximo ${configCaja.maxCajas} cajas`, 'warning');
            return;
        }
        linea.cajas = numValor;
    } else if (campo === 'bolasPorCaja') {
        const config = obtenerConfiguracionBola(linea.tipoBola);
        const configCaja = config?.configuraciones.find(c => c.tipoCaja === linea.tipoCaja);
        if (configCaja && !configCaja.opcionesBolas.includes(numValor)) {
            mostrarNotificacion(`⚠️ Opciones: ${configCaja.opcionesBolas.join(', ')}`, 'warning');
            return;
        }
        linea.bolasPorCaja = numValor;
    }
    
    linea.total = (linea.cajas || 0) * (linea.bolasPorCaja || 0);
    
    guardarDatos(datos);
    renderizarOrdenAmasado();
}, 300);

function actualizarLineaAmasado(index, campo, valor) {
    actualizarLineaAmasadoDebounce(index, campo, valor);
}

const actualizarDistribucionDebounce = debounce(function(index, producto, valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (!orden.lineas || index >= orden.lineas.length) return;
    
    const linea = orden.lineas[index];
    if (!linea.distribucion) linea.distribucion = {};
    linea.distribucion[producto] = parseInt(valor) || 0;
    
    guardarDatos(datos);
    actualizarEstadoDistribucion();
}, 300);

function actualizarDistribucion(index, producto, valor) {
    actualizarDistribucionDebounce(index, producto, valor);
}

function eliminarLineaAmasado(index) {
    if (!confirm('⚠️ ¿Estás seguro de eliminar esta línea?')) return;
    
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (!orden.lineas || index >= orden.lineas.length) return;
    orden.lineas.splice(index, 1);
    guardarDatos(datos);
    renderizarOrdenAmasado();
    mostrarNotificacion('✅ Línea eliminada', 'success');
}

function duplicarLineaAmasado(index) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (!orden.lineas || index >= orden.lineas.length) return;
    
    const lineaOriginal = orden.lineas[index];
    
    const nuevaLinea = {
        tipoBola: lineaOriginal.tipoBola,
        peso: lineaOriginal.peso,
        tipoCaja: lineaOriginal.tipoCaja,
        cajas: lineaOriginal.cajas,
        bolasPorCaja: lineaOriginal.bolasPorCaja,
        total: lineaOriginal.total,
        distribucion: {}
    };
    
    if (lineaOriginal.distribucion) {
        Object.keys(lineaOriginal.distribucion).forEach(producto => {
            nuevaLinea.distribucion[producto] = lineaOriginal.distribucion[producto];
        });
    }
    
    orden.lineas.splice(index + 1, 0, nuevaLinea);
    
    guardarDatos(datos);
    renderizarOrdenAmasado();
    mostrarNotificacion('✅ Línea duplicada correctamente', 'success');
}

function duplicarTodasLineasAmasado() {
    if (!confirm('⚠️ ¿Duplicar todas las líneas de amasado?')) return;
    
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (!orden.lineas || orden.lineas.length === 0) {
        mostrarNotificacion('⚠️ No hay líneas para duplicar', 'warning');
        return;
    }
    
    const lineasOriginales = [...orden.lineas];
    
    lineasOriginales.forEach(lineaOriginal => {
        const nuevaLinea = {
            tipoBola: lineaOriginal.tipoBola,
            peso: lineaOriginal.peso,
            tipoCaja: lineaOriginal.tipoCaja,
            cajas: lineaOriginal.cajas,
            bolasPorCaja: lineaOriginal.bolasPorCaja,
            total: lineaOriginal.total,
            distribucion: {}
        };
        
        if (lineaOriginal.distribucion) {
            Object.keys(lineaOriginal.distribucion).forEach(producto => {
                nuevaLinea.distribucion[producto] = lineaOriginal.distribucion[producto];
            });
        }
        
        orden.lineas.push(nuevaLinea);
    });
    
    guardarDatos(datos);
    renderizarOrdenAmasado();
    mostrarNotificacion('✅ Todas las líneas duplicadas correctamente', 'success');
}

function actualizarEstadoDistribucion() {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    let todasAsignadas = true;
    let totalSinAsignar = 0;
    
    if (orden.lineas && Array.isArray(orden.lineas)) {
        orden.lineas.forEach((linea, index) => {
            const total = linea.total || 0;
            const asignado = linea.distribucion ? Object.values(linea.distribucion).reduce((a, b) => a + b, 0) : 0;
            const restante = total - asignado;
            
            if (asignado !== total) {
                todasAsignadas = false;
                totalSinAsignar += restante;
            }
            
            const estadoElement = document.querySelector(`.estado-distribucion-${index}`);
            if (estadoElement) {
                if (restante === 0 && total > 0) {
                    estadoElement.textContent = '✅ Todas las bolas asignadas';
                    estadoElement.style.color = 'var(--success)';
                } else {
                    estadoElement.textContent = `🔴 Restante sin asignar: ${restante} bolas`;
                    estadoElement.style.color = 'var(--error)';
                }
            }
        });
    }
    
    const estadoGlobal = document.querySelector('.estado-distribucion-global');
    if (estadoGlobal) {
        if (todasAsignadas) {
            estadoGlobal.textContent = '✅ Todas las bolas asignadas';
            estadoGlobal.style.color = 'var(--success)';
        } else {
            estadoGlobal.textContent = `⚠️ ${totalSinAsignar} bolas sin asignar`;
            estadoGlobal.style.color = 'var(--error)';
        }
    }
    
    const validacionDiv = document.querySelector('.validacion-orden');
    if (validacionDiv) {
        if (todasAsignadas) {
            validacionDiv.innerHTML = '✅ La orden está completa y lista para aplicar a producción';
            validacionDiv.style.background = '#E8F5E9';
            validacionDiv.style.borderLeftColor = 'var(--success)';
        } else {
            validacionDiv.innerHTML = `❌ Faltan ${totalSinAsignar} bolas por asignar`;
            validacionDiv.style.background = '#FFF3E0';
            validacionDiv.style.borderLeftColor = 'var(--error)';
        }
    }
}

function guardarOrdenAmasado() {
    console.log('💾 Guardando orden de amasado...');
    
    try {
        const datos = cargarDatos();
        const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
        const orden = obtenerOrdenAmasado(datos, fecha);
        
        // Obtener clima automáticamente
        const clima = obtenerClimaGuardamar();
        orden.temperatura = clima.temperatura;
        orden.humedad = clima.humedad;
        
        // Guardar datos climáticos para referencia
        orden.datosClima = {
            ciudad: clima.ciudad,
            provincia: clima.provincia,
            fecha: new Date().toISOString()
        };
        
        console.log('📋 Datos:');
        console.log('  - Fecha:', fecha);
        console.log('  - Líneas:', orden.lineas?.length || 0);
        console.log('  - Temperatura:', orden.temperatura, '°C');
        console.log('  - Humedad:', orden.humedad, '%');
        
        const validacion = validarOrdenAmasado(orden);
        if (!validacion.valida) {
            console.log('❌ Validación fallida:', validacion.errores);
            mostrarNotificacion('❌ ' + validacion.errores.join('. '), 'error');
            return;
        }
        
        const resumen = obtenerResumenOrdenAmasado(orden);
        orden.totalBolas = resumen.totalBolas;
        orden.pesoTotal = resumen.pesoTotal;
        
        if (!guardarOrdenAmasado(datos, fecha, orden)) {
            mostrarNotificacion('❌ Error al guardar la orden', 'error');
            return;
        }
        
        console.log('✅ Orden guardada correctamente');
        mostrarNotificacion(`✅ Orden de amasado guardada correctamente (${clima.temperatura}°C, ${clima.humedad}%)`, 'success');
        renderizarOrdenAmasado();
        
    } catch (error) {
        console.error('❌ Error al guardar orden:', error);
        mostrarNotificacion('❌ Error al guardar la orden: ' + error.message, 'error');
    }
}

// ... (resto del código manteniendo las mismas optimizaciones)
