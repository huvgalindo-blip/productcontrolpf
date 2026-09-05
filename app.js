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
    produccion: {}
};

// ============================================================
// 2. SERVICIO DE DATOS (localStorage)
// ============================================================

function cargarDatos() {
    try {
        const datosGuardados = localStorage.getItem('qualityPizzaData');
        if (datosGuardados) {
            const datos = JSON.parse(datosGuardados);
            if (!datos.productos) datos.productos = DATOS_POR_DEFECTO.productos;
            if (!datos.clientes) datos.clientes = DATOS_POR_DEFECTO.clientes;
            if (!datos.configuracion) datos.configuracion = DATOS_POR_DEFECTO.configuracion;
            if (!datos.produccion) datos.produccion = {};
            return datos;
        }
        guardarDatos(DATOS_POR_DEFECTO);
        return DATOS_POR_DEFECTO;
    } catch (error) {
        console.error('Error al cargar datos:', error);
        return DATOS_POR_DEFECTO;
    }
}

function guardarDatos(datos) {
    try {
        localStorage.setItem('qualityPizzaData', JSON.stringify(datos));
    } catch (error) {
        console.error('Error al guardar datos:', error);
    }
}

function generarId(coleccion) {
    if (!coleccion || coleccion.length === 0) return 1;
    const ids = coleccion.map(item => item.id);
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

// ============================================================
// 3. SERVICIO DE PRODUCTOS
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

// ============================================================
// 4. SERVICIO DE CLIENTES
// ============================================================

function obtenerClientesActivos(datos) {
    return datos.clientes.filter(c => c.activo === true);
}

function obtenerClientePorId(datos, id) {
    return datos.clientes.find(c => c.id === id) || null;
}

// ============================================================
// 5. SERVICIO DE PRODUCCIÓN
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

    if (produccion.inventarioInicial && Object.keys(produccion.inventarioInicial).length > 0) {
        return produccion.inventarioInicial;
    }

    const fechaAnterior = new Date(fecha);
    fechaAnterior.setDate(fechaAnterior.getDate() - 1);
    const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];
    const produccionAnterior = datos.produccion[fechaAnteriorStr];

    if (produccionAnterior && produccionAnterior.inventarioFinal) {
        return produccionAnterior.inventarioFinal;
    }

    productos.forEach(p => {
        inventario[p.nombre] = 0;
    });

    return inventario;
}

function calcularVentasDiarias(pedidos) {
    const ventas = {};
    pedidos.forEach(pedido => {
        if (pedido.productos) {
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
        ...Object.keys(inventarioInicial),
        ...Object.keys(ventasDiarias)
    ]);

    todosLosProductos.forEach(nombre => {
        const inicial = parseFloat(inventarioInicial[nombre]) || 0;
        const ventas = parseFloat(ventasDiarias[nombre]) || 0;
        final[nombre] = inicial - ventas;
    });

    return final;
}

function calcularCosteMateriaPrima(datos, ventasDiarias) {
    let total = 0;
    Object.keys(ventasDiarias).forEach(nombre => {
        const cantidad = parseFloat(ventasDiarias[nombre]) || 0;
        const costeUnitario = obtenerPrecioCosto(datos, nombre);
        total += cantidad * costeUnitario;
    });
    return Math.round(total * 100) / 100;
}

function calcularVentasGeneradas(datos, ventasDiarias) {
    let total = 0;
    Object.keys(ventasDiarias).forEach(nombre => {
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
    if (productos) {
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
// 7. SERVICIO DE ÓRDENES DE AMASADO
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
            operario: '',
            horaInicio: obtenerHoraActual(),
            horaFin: '',
            temperatura: 22,
            humedad: 55,
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
    guardarDatos(datos);
}

function eliminarOrdenAmasado(datos, fecha) {
    const ordenes = obtenerOrdenesAmasado(datos);
    if (ordenes[fecha]) {
        delete ordenes[fecha];
        guardarDatos(datos);
        return true;
    }
    return false;
}

function validarOrdenAmasado(orden) {
    const errores = [];
    
    // Validación de líneas
    if (!orden.lineas || orden.lineas.length === 0) {
        errores.push('Debe haber al menos una línea de amasado');
    } else {
        orden.lineas.forEach((linea, index) => {
            const total = linea.total || 0;
            const asignado = linea.distribucion ? Object.values(linea.distribucion).reduce((a, b) => a + b, 0) : 0;
            
            if (linea.cajas < 1) {
                errores.push(`Línea ${index + 1}: El número de cajas debe ser mayor a 0`);
            }
            
            if (asignado !== total) {
                errores.push(`Línea ${index + 1}: Faltan ${total - asignado} bolas por asignar`);
            }
        });
    }
    
    return {
        valida: errores.length === 0,
        errores: errores
    };
}

function aplicarOrdenAProduccion(datos, fecha) {
    const ordenes = obtenerOrdenesAmasado(datos);
    const orden = ordenes[fecha];
    
    if (!orden) {
        mostrarNotificacion('No se encontró la orden de amasado', 'error');
        return false;
    }
    
    const validacion = validarOrdenAmasado(orden);
    if (!validacion.valida) {
        mostrarNotificacion('La orden no está completa: ' + validacion.errores.join(', '), 'error');
        return false;
    }
    
    if (orden.aplicadoAProduccion) {
        mostrarNotificacion('Esta orden ya fue aplicada a producción', 'warning');
        return false;
    }
    
    const fechaUso = orden.fechaUso;
    
    if (!datos.produccion) datos.produccion = {};
    if (!datos.produccion[fechaUso]) {
        datos.produccion[fechaUso] = {
            inventarioInicial: {},
            horasTrabajadas: 0,
            pedidos: []
        };
    }
    
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
    
    datos.produccion[fechaUso].inventarioInicial = inventario;
    datos.produccion[fechaUso].inventarioDesdeAmasado = true;
    orden.aplicadoAProduccion = true;
    orden.aplicadoEn = new Date().toISOString();
    
    guardarDatos(datos);
    return true;
}

function obtenerResumenOrdenAmasado(orden) {
    let totalBolas = 0;
    let pesoTotal = 0;
    let totalCajas = 0;
    let totalTorres = 0;
    
    if (orden.lineas) {
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
// 8. FUNCIONES DE INTERACCIÓN - AMASADO
// ============================================================

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
        mostrarNotificacion('Selección inválida', 'error');
        return;
    }
    
    const tipoSeleccionado = tipos[index];
    const config = obtenerConfiguracionBola(tipoSeleccionado);
    if (!config) {
        mostrarNotificacion('Tipo de bola no encontrado', 'error');
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
        mostrarNotificacion('Selección inválida', 'error');
        return;
    }
    
    const configCaja = config.configuraciones[cajaIndex];
    
    const cajasStr = prompt(`Número de cajas (máximo ${configCaja.maxCajas}):`, '1');
    if (!cajasStr) return;
    const cajas = parseInt(cajasStr);
    if (isNaN(cajas) || cajas < 1 || cajas > configCaja.maxCajas) {
        mostrarNotificacion(`Número de cajas inválido (máximo ${configCaja.maxCajas})`, 'error');
        return;
    }
    
    const bolasStr = prompt(`Bolas por caja (opciones: ${configCaja.opcionesBolas.join(', ')}):`, configCaja.opcionesBolas[0].toString());
    if (!bolasStr) return;
    const bolasPorCaja = parseInt(bolasStr);
    if (isNaN(bolasPorCaja) || !configCaja.opcionesBolas.includes(bolasPorCaja)) {
        mostrarNotificacion(`Bolas por caja inválido (opciones: ${configCaja.opcionesBolas.join(', ')})`, 'error');
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

function actualizarLineaAmasado(index, campo, valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (index >= orden.lineas.length) return;
    
    const linea = orden.lineas[index];
    const numValor = parseInt(valor) || 0;
    
    if (campo === 'cajas') {
        const config = obtenerConfiguracionBola(linea.tipoBola);
        const configCaja = config?.configuraciones.find(c => c.tipoCaja === linea.tipoCaja);
        if (configCaja && numValor > configCaja.maxCajas) {
            mostrarNotificacion(`Máximo ${configCaja.maxCajas} cajas`, 'warning');
            return;
        }
        linea.cajas = numValor;
    } else if (campo === 'bolasPorCaja') {
        const config = obtenerConfiguracionBola(linea.tipoBola);
        const configCaja = config?.configuraciones.find(c => c.tipoCaja === linea.tipoCaja);
        if (configCaja && !configCaja.opcionesBolas.includes(numValor)) {
            mostrarNotificacion(`Opciones: ${configCaja.opcionesBolas.join(', ')}`, 'warning');
            return;
        }
        linea.bolasPorCaja = numValor;
    }
    
    linea.total = (linea.cajas || 0) * (linea.bolasPorCaja || 0);
    
    guardarDatos(datos);
    renderizarOrdenAmasado();
}

function actualizarDistribucion(index, producto, valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (index >= orden.lineas.length) return;
    
    const linea = orden.lineas[index];
    if (!linea.distribucion) linea.distribucion = {};
    linea.distribucion[producto] = parseInt(valor) || 0;
    
    guardarDatos(datos);
    actualizarEstadoDistribucion();
}

function eliminarLineaAmasado(index) {
    if (!confirm('¿Estás seguro de eliminar esta línea?')) return;
    
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (index >= orden.lineas.length) return;
    orden.lineas.splice(index, 1);
    guardarDatos(datos);
    renderizarOrdenAmasado();
    mostrarNotificacion('✅ Línea eliminada', 'success');
}

// ✅ NUEVA FUNCIÓN: Duplicar una línea de amasado
function duplicarLineaAmasado(index) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (index >= orden.lineas.length) return;
    
    const lineaOriginal = orden.lineas[index];
    
    // Crear una copia profunda de la línea
    const nuevaLinea = {
        tipoBola: lineaOriginal.tipoBola,
        peso: lineaOriginal.peso,
        tipoCaja: lineaOriginal.tipoCaja,
        cajas: lineaOriginal.cajas,
        bolasPorCaja: lineaOriginal.bolasPorCaja,
        total: lineaOriginal.total,
        distribucion: {}
    };
    
    // Copiar la distribución
    if (lineaOriginal.distribucion) {
        Object.keys(lineaOriginal.distribucion).forEach(producto => {
            nuevaLinea.distribucion[producto] = lineaOriginal.distribucion[producto];
        });
    }
    
    // Insertar la línea duplicada justo después de la original
    orden.lineas.splice(index + 1, 0, nuevaLinea);
    
    guardarDatos(datos);
    renderizarOrdenAmasado();
    mostrarNotificacion('✅ Línea duplicada correctamente', 'success');
}

// ✅ NUEVA FUNCIÓN: Duplicar todas las líneas de amasado
function duplicarTodasLineasAmasado() {
    if (!confirm('⚠️ ¿Duplicar todas las líneas de amasado?')) return;
    
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (!orden.lineas || orden.lineas.length === 0) {
        mostrarNotificacion('No hay líneas para duplicar', 'warning');
        return;
    }
    
    const lineasOriginales = [...orden.lineas];
    
    // Duplicar cada línea
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
    
    if (orden.lineas) {
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
    
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    // Todos los campos opcionales
    const operarioInput = document.getElementById('operario-amasado');
    orden.operario = operarioInput ? operarioInput.value : '';
    
    const horaInicio = document.getElementById('hora-inicio');
    const horaFin = document.getElementById('hora-fin');
    const tempInput = document.getElementById('temp-amasado');
    const humedadInput = document.getElementById('humedad-amasado');
    
    orden.horaInicio = horaInicio ? horaInicio.value : '';
    orden.horaFin = horaFin ? horaFin.value : '';
    orden.temperatura = tempInput ? parseFloat(tempInput.value) || 0 : 0;
    orden.humedad = humedadInput ? parseFloat(humedadInput.value) || 0 : 0;
    
    console.log('📋 Datos:');
    console.log('  - Operario:', orden.operario || '(vacío)');
    console.log('  - Fecha:', fecha);
    console.log('  - Líneas:', orden.lineas.length);
    console.log('  - Total bolas:', orden.totalBolas);
    
    const validacion = validarOrdenAmasado(orden);
    if (!validacion.valida) {
        console.log('❌ Validación fallida:', validacion.errores);
        mostrarNotificacion('❌ ' + validacion.errores.join('. '), 'error');
        return;
    }
    
    const resumen = obtenerResumenOrdenAmasado(orden);
    orden.totalBolas = resumen.totalBolas;
    orden.pesoTotal = resumen.pesoTotal;
    
    guardarOrdenAmasado(datos, fecha, orden);
    console.log('✅ Orden guardada correctamente');
    mostrarNotificacion('✅ Orden de amasado guardada correctamente', 'success');
    renderizarOrdenAmasado();
}

function aplicarOrdenAProduccionUI() {
    console.log('📥 Aplicando orden a producción...');
    
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const datos = cargarDatos();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    const validacion = validarOrdenAmasado(orden);
    if (!validacion.valida) {
        mostrarNotificacion('❌ ' + validacion.errores.join('. '), 'error');
        return;
    }
    
    if (orden.aplicadoAProduccion) {
        mostrarNotificacion('⚠️ Esta orden ya fue aplicada a producción', 'warning');
        return;
    }
    
    if (!confirm(`📥 ¿Aplicar esta orden al inventario de producción del día ${orden.fechaUso}?`)) {
        return;
    }
    
    const resultado = aplicarOrdenAProduccion(datos, fecha);
    if (resultado) {
        mostrarNotificacion(`✅ Orden aplicada a producción del día ${orden.fechaUso}`, 'success');
        renderizarOrdenAmasado();
    }
}

function desaplicarOrdenAmasado() {
    if (!confirm('⚠️ ¿Estás seguro de deshacer la aplicación de esta orden a producción?')) return;
    
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (!orden.aplicadoAProduccion) {
        mostrarNotificacion('Esta orden no está aplicada a producción', 'warning');
        return;
    }
    
    const fechaUso = orden.fechaUso;
    if (datos.produccion && datos.produccion[fechaUso]) {
        datos.produccion[fechaUso].inventarioInicial = {};
        delete datos.produccion[fechaUso].inventarioDesdeAmasado;
    }
    
    orden.aplicadoAProduccion = false;
    delete orden.aplicadoEn;
    
    guardarDatos(datos);
    mostrarNotificacion('✅ Aplicación deshecha correctamente', 'success');
    renderizarOrdenAmasado();
}

function eliminarOrdenAmasado() {
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const datos = cargarDatos();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (orden.aplicadoAProduccion) {
        if (!confirm('⚠️ Esta orden ya está aplicada a producción. ¿Seguro que quieres eliminarla?')) {
            return;
        }
    }
    
    if (!confirm('⚠️ ¿Estás seguro de eliminar esta orden de amasado?')) {
        return;
    }
    
    const resultado = eliminarOrdenAmasado(datos, fecha);
    if (resultado) {
        mostrarNotificacion('✅ Orden eliminada correctamente', 'success');
        renderizarOrdenAmasado();
    }
}

function exportarOrdenAmasado() {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (!orden.lineas || orden.lineas.length === 0) {
        mostrarNotificacion('No hay datos para exportar', 'warning');
        return;
    }
    
    let csv = 'Orden de Amasado - Quality Pizzafresh\n';
    csv += `Fecha: ${fecha}\n`;
    csv += `Operario: ${orden.operario}\n`;
    csv += `Total Bolas: ${orden.totalBolas}\n`;
    csv += `Peso Total: ${orden.pesoTotal} kg\n\n`;
    
    csv += 'Tipo Bola,Peso,Caja,Cajas,Bolas/Caja,Total Bolas,Distribución\n';
    
    orden.lineas.forEach(linea => {
        const distribucion = linea.distribucion ? 
            Object.entries(linea.distribucion).map(([k, v]) => `${k}: ${v}`).join(' | ') : 
            'Sin asignar';
        
        csv += `${linea.tipoBola},${linea.peso},${linea.tipoCaja},${linea.cajas},${linea.bolasPorCaja},${linea.total},"${distribucion}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orden_amasado_${fecha}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    mostrarNotificacion('📥 CSV exportado correctamente', 'success');
}

// ============================================================
// 9. UI - RENDERIZADO DE VISTAS
// ============================================================

// ============================================================
// 9. UI - RENDERIZADO DE VISTAS
// ============================================================

function renderizarProduccion() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);
    const productosActivos = obtenerProductosActivos(datos);
    const clientesActivos = obtenerClientesActivos(datos);

    const esInventarioAmasado = produccion.inventarioDesdeAmasado || false;

    if (!produccion.inventarioInicial || Object.keys(produccion.inventarioInicial).length === 0) {
        produccion.inventarioInicial = inicializarInventario(datos, fecha);
        guardarDatos(datos);
    }

    const ventasDiarias = calcularVentasDiarias(produccion.pedidos);
    const inventarioFinal = calcularInventarioFinal(produccion.inventarioInicial, ventasDiarias);
    const costeMP = calcularCosteMateriaPrima(datos, ventasDiarias);
    const costeMOD = parseFloat(produccion.horasTrabajadas) * parseFloat(datos.configuracion.costeManoObraHora);
    const ventasGen = calcularVentasGeneradas(datos, ventasDiarias);
    const costeTotal = costeMP + costeMOD;
    const margen = calcularMargen(ventasGen, costeTotal);

    let html = `
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>📋 Producción Diaria</h2>
                    <span class="subtitle">${formatearFecha(fecha)}</span>
                    ${esInventarioAmasado ? `<span style="background: #d4edda; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem; color: #155724;">📦 Inventario desde Amasado</span>` : ''}
                </div>
                <div class="flex gap-10">
                    <input type="date" id="fecha-produccion" value="${fecha}" onchange="renderizarProduccion()">
                    <button class="btn btn-secondary btn-sm" onclick="irDiaAnterior()">◀</button>
                    <button class="btn btn-secondary btn-sm" onclick="irDiaSiguiente()">▶</button>
                    <button class="btn btn-primary btn-sm" onclick="irHoy()">Hoy</button>
                </div>
            </div>

            <div class="tabla-container">
                <div class="flex-between mb-10">
                    <span><strong>${productosActivos.length}</strong> productos activos</span>
                    <button class="btn btn-primary btn-sm" onclick="añadirFilaPedido()">➕ Añadir fila</button>
                </div>
                <table id="tabla-pedidos">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Cliente</th>
                            ${productosActivos.map(p => `<th title="${p.nombre}">${p.nombre}</th>`).join('')}
                            <th>Total</th>
                            <th>Finalizado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (produccion.pedidos.length === 0) {
        html += `
            <tr>
                <td colspan="${productosActivos.length + 4}" class="text-center" style="padding: 30px; color: #999;">
                    No hay pedidos registrados para este día
                </td>
            </tr>
        `;
    } else {
        produccion.pedidos.forEach((pedido, index) => {
            const cliente = obtenerClientePorId(datos, pedido.clienteId);
            const totalPedido = calcularTotalPedido(pedido.productos);
            const finalizado = pedido.finalizado || false;

            html += `
                <tr class="${finalizado ? 'finalizado' : ''}">
                    <td>${index + 1}</td>
                    <td>
                        <select class="cliente-select" data-index="${index}" onchange="actualizarPedido(${index})">
                            <option value="">Seleccionar cliente</option>
                            ${clientesActivos.map(c => `
                                <option value="${c.id}" ${c.id === pedido.clienteId ? 'selected' : ''}>
                                    ${c.codigo} - ${c.nombre}
                                </option>
                            `).join('')}
                        </select>
                    </td>
                    ${productosActivos.map(p => `
                        <td>
                            <input type="number" min="0" step="1"
                                   class="cantidad-input" 
                                   data-index="${index}" 
                                   data-producto="${p.nombre}"
                                   value="${pedido.productos?.[p.nombre] || 0}"
                                   onchange="actualizarPedido(${index})">
                        </td>
                    `).join('')}
                    <td class="total-cell">${totalPedido}</td>
                    <td>
                        <input type="checkbox" class="finalizado-check" 
                               data-index="${index}"
                               ${finalizado ? 'checked' : ''}
                               onchange="actualizarPedido(${index})">
                    </td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="eliminarFilaPedido(${index})">🗑️</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `
                    </tbody>
                </table>
            </div>

            <div class="vista-header" style="margin-top: 20px;">
                <h3>📊 Resumen del Día</h3>
            </div>

            <div class="resumen-grid">
                <div class="resumen-card">
                    <div class="label">Horas Trabajadas</div>
                    <input type="number" step="0.5" min="0" 
                           style="width: 80px; text-align: center; margin: 5px auto; padding: 5px; border: 1px solid #ddd; border-radius: 4px;"
                           value="${produccion.horasTrabajadas || 0}"
                           onchange="guardarHorasTrabajadas(this.value)">
                </div>
                <div class="resumen-card">
                    <div class="label">Coste Materia Prima</div>
                    <div class="value primary">${costeMP.toFixed(2)} €</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Coste Mano de Obra</div>
                    <div class="value primary">${costeMOD.toFixed(2)} €</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Coste Total</div>
                    <div class="value">${costeTotal.toFixed(2)} €</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Ventas Generadas</div>
                    <div class="value success">${ventasGen.toFixed(2)} €</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Margen</div>
                    <div class="value ${margen > 0 ? 'success' : 'danger'}">${margen}%</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Total Pedidos</div>
                    <div class="value">${produccion.pedidos.length}</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Unidades Producidas</div>
                    <div class="value">${Object.values(ventasDiarias).reduce((a,b) => a + b, 0)}</div>
                </div>
            </div>

            <div class="vista-header" style="margin-top: 10px;">
                <h3>📦 Inventario</h3>
            </div>
            <div class="tabla-container">
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Inicial</th>
                            <th>Ventas</th>
                            <th>Final</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    const todosProductos = new Set([
        ...Object.keys(produccion.inventarioInicial || {}),
        ...Object.keys(ventasDiarias)
    ]);

    if (todosProductos.size === 0) {
        html += `
            <tr>
                <td colspan="4" class="text-center" style="padding: 20px; color: #999;">
                    No hay productos registrados
                </td>
            </tr>
        `;
    } else {
        todosProductos.forEach(nombre => {
            const inicial = parseFloat(produccion.inventarioInicial?.[nombre]) || 0;
            const ventas = parseFloat(ventasDiarias?.[nombre]) || 0;
            const final = inicial - ventas;

            html += `
                <tr>
                    <td><strong>${nombre}</strong></td>
                    <td>
                        <input type="number" min="0" step="1"
                               style="width: 80px; padding: 4px; border: 1px solid #ddd; border-radius: 4px;"
                               value="${inicial}"
                               data-producto="${nombre}"
                               onchange="actualizarInventarioInicial('${nombre}', this.value)">
                    </td>
                    <td>${ventas}</td>
                    <td><strong>${final}</strong></td>
                </tr>
            `;
        });
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
    guardarDatos(datos);
}

function irDiaAnterior() {
    const fechaInput = document.getElementById('fecha-produccion');
    if (fechaInput) {
        const fecha = new Date(fechaInput.value);
        fecha.setDate(fecha.getDate() - 1);
        fechaInput.value = fecha.toISOString().split('T')[0];
        renderizarProduccion();
    }
}

function irDiaSiguiente() {
    const fechaInput = document.getElementById('fecha-produccion');
    if (fechaInput) {
        const fecha = new Date(fechaInput.value);
        fecha.setDate(fecha.getDate() + 1);
        fechaInput.value = fecha.toISOString().split('T')[0];
        renderizarProduccion();
    }
}

function irHoy() {
    const fechaInput = document.getElementById('fecha-produccion');
    if (fechaInput) {
        fechaInput.value = obtenerFechaActual();
        renderizarProduccion();
    }
}

function añadirFilaPedido() {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    const productos = {};
    const productosActivos = obtenerProductosActivos(datos);
    productosActivos.forEach(p => {
        productos[p.nombre] = 0;
    });

    const nuevoPedido = {
        id: `P${String(produccion.pedidos.length + 1).padStart(3, '0')}`,
        clienteId: null,
        productos: productos,
        finalizado: false,
        lote: '',
        caducidad: ''
    };

    produccion.pedidos.push(nuevoPedido);
    guardarDatos(datos);
    renderizarProduccion();
    mostrarNotificacion('Fila añadida correctamente', 'success');
}

function eliminarFilaPedido(index) {
    if (!confirm('¿Estás seguro de eliminar esta fila?')) return;

    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    if (index >= 0 && index < produccion.pedidos.length) {
        produccion.pedidos.splice(index, 1);
        guardarDatos(datos);
        renderizarProduccion();
        mostrarNotificacion('Fila eliminada correctamente', 'success');
    }
}

function actualizarPedido(index) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    if (index >= produccion.pedidos.length) return;

    const fila = document.querySelector(`#tabla-pedidos tbody tr:nth-child(${index + 1})`);
    if (!fila) return;

    const selectCliente = fila.querySelector('.cliente-select');
    if (selectCliente) {
        produccion.pedidos[index].clienteId = parseInt(selectCliente.value) || null;
    }

    const inputs = fila.querySelectorAll('.cantidad-input');
    inputs.forEach(input => {
        const producto = input.dataset.producto;
        const valor = parseFloat(input.value) || 0;
        if (!produccion.pedidos[index].productos) {
            produccion.pedidos[index].productos = {};
        }
        produccion.pedidos[index].productos[producto] = valor;
    });

    const checkbox = fila.querySelector('.finalizado-check');
    if (checkbox) {
        produccion.pedidos[index].finalizado = checkbox.checked;
    }

    guardarDatos(datos);
    renderizarProduccion();
}

function guardarHorasTrabajadas(valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    produccion.horasTrabajadas = parseFloat(valor) || 0;
    guardarDatos(datos);
    renderizarProduccion();
}

function actualizarInventarioInicial(producto, valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    if (!produccion.inventarioInicial) {
        produccion.inventarioInicial = {};
    }
    produccion.inventarioInicial[producto] = parseFloat(valor) || 0;
    guardarDatos(datos);
    renderizarProduccion();
}

// ============================================================
// 10. UI - ORDEN DE AMASADO (CON BOTÓN DUPLICAR)
// ============================================================

function renderizarOrdenAmasado() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    const resumen = obtenerResumenOrdenAmasado(orden);
    const validacion = validarOrdenAmasado(orden);
    
    let todasAsignadas = true;
    let totalSinAsignar = 0;
    
    if (orden.lineas) {
        orden.lineas.forEach(linea => {
            const total = linea.total || 0;
            const asignado = linea.distribucion ? Object.values(linea.distribucion).reduce((a, b) => a + b, 0) : 0;
            if (asignado !== total) {
                todasAsignadas = false;
                totalSinAsignar += (total - asignado);
            }
        });
    }
    
    let html = `
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>🔄 Orden de Amasado</h2>
                    <span class="subtitle">Registro de producción de masa para el día siguiente</span>
                </div>
                <div>
                    <span class="subtitle" style="font-weight: bold; color: ${orden.aplicadoAProduccion ? 'var(--success)' : 'var(--warning)'};">
                        ${orden.aplicadoAProduccion ? '✅ Aplicado a producción' : '⏳ Pendiente de aplicar'}
                    </span>
                </div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                <div class="form-row">
                    <div class="form-group">
                        <label>📅 Fecha Amasado</label>
                        <input type="date" id="fecha-amasado" value="${fecha}" onchange="renderizarOrdenAmasado()">
                    </div>
                    <div class="form-group">
                        <label>📅 Uso Previsto</label>
                        <input type="text" id="fecha-uso" value="${orden.fechaUso}" readonly style="background: #f0f0f0; font-weight: bold;">
                    </div>
                    <div class="form-group">
                        <label>👤 Operario (opcional)</label>
                        <input type="text" id="operario-amasado" value="${orden.operario || ''}" placeholder="Opcional" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>⏰ Hora Inicio (opcional)</label>
                        <input type="time" id="hora-inicio" value="${orden.horaInicio || ''}" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                    </div>
                    <div class="form-group">
                        <label>⏰ Hora Fin (opcional)</label>
                        <input type="time" id="hora-fin" value="${orden.horaFin || ''}" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                    </div>
                    <div class="form-group">
                        <label>🌡️ Temperatura (°C) (opcional)</label>
                        <input type="number" id="temp-amasado" value="${orden.temperatura || ''}" step="0.5" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                    </div>
                    <div class="form-group">
                        <label>💧 Humedad (%) (opcional)</label>
                        <input type="number" id="humedad-amasado" value="${orden.humedad || ''}" step="1" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                    </div>
                </div>
            </div>
            
            <div class="tabla-container">
                <div class="flex-between mb-10">
                    <h3>📦 Bolas a Amasar</h3>
                    ${!orden.aplicadoAProduccion ? `
                        <div>
                            <button class="btn btn-primary btn-sm" id="btn-añadir-linea">➕ Añadir Línea</button>
                            <button class="btn btn-success btn-sm" id="btn-duplicar-todas" style="background: #28a745; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; margin-left: 4px;">📋 Duplicar Todas</button>
                        </div>
                    ` : ''}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Tipo Bola</th>
                            <th>Peso</th>
                            <th>Caja</th>
                            <th>Nº Cajas</th>
                            <th>Bolas/Caja</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (!orden.lineas || orden.lineas.length === 0) {
        html += `
            <tr>
                <td colspan="7" class="text-center" style="padding: 30px; color: #999;">
                    No hay líneas de amasado. Haz clic en "➕ Añadir Línea" para comenzar.
                </td>
            </tr>
        `;
    } else {
        orden.lineas.forEach((linea, index) => {
            const config = obtenerConfiguracionBola(linea.tipoBola);
            const total = linea.total || 0;
            const asignado = linea.distribucion ? Object.values(linea.distribucion).reduce((a, b) => a + b, 0) : 0;
            const estado = asignado === total ? '✅' : '⚠️';
            
            html += `
                <tr>
                    <td><strong>${linea.tipoBola}</strong></td>
                    <td>${linea.peso}g</td>
                    <td>${linea.tipoCaja}</td>
                    <td>
                        ${orden.aplicadoAProduccion ? linea.cajas : `
                            <input type="number" min="1" max="${config ? config.configuraciones.find(c => c.tipoCaja === linea.tipoCaja)?.maxCajas || 25 : 25}" 
                                   style="width: 60px;" value="${linea.cajas || 0}"
                                   data-linea-index="${index}" data-campo="cajas"
                                   onchange="actualizarLineaAmasado(${index}, 'cajas', this.value)">
                        `}
                    </td>
                    <td>
                        ${orden.aplicadoAProduccion ? linea.bolasPorCaja : `
                            <select data-linea-index="${index}" data-campo="bolasPorCaja" 
                                    onchange="actualizarLineaAmasado(${index}, 'bolasPorCaja', this.value)">
                                ${(config ? config.configuraciones.find(c => c.tipoCaja === linea.tipoCaja)?.opcionesBolas || [8, 10] : [8, 10]).map(op => `
                                    <option value="${op}" ${op == linea.bolasPorCaja ? 'selected' : ''}>${op}</option>
                                `).join('')}
                            </select>
                        `}
                    </td>
                    <td><strong>${total}</strong> ${estado}</td>
                    <td>
                        ${!orden.aplicadoAProduccion ? `
                            <button class="btn btn-success btn-sm" onclick="duplicarLineaAmasado(${index})" title="Duplicar esta línea" style="background: #28a745; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; margin-right: 4px;">📋</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarLineaAmasado(${index})">🗑️</button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
    }
    
    html += `
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 20px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div class="flex-between mb-10">
                    <h3>📦 Distribución a Productos Finales</h3>
                    <span style="font-size: 0.9rem; color: ${todasAsignadas ? 'var(--success)' : 'var(--error)'};" class="estado-distribucion-global">
                        ${todasAsignadas ? '✅ Todas las bolas asignadas' : `⚠️ ${totalSinAsignar} bolas sin asignar`}
                    </span>
                </div>
    `;
    
    if (orden.lineas && orden.lineas.length > 0) {
        orden.lineas.forEach((linea, index) => {
            const config = obtenerConfiguracionBola(linea.tipoBola);
            const total = linea.total || 0;
            const productosDestino = config ? config.productosDestino : [];
            const asignado = linea.distribucion ? Object.values(linea.distribucion).reduce((a, b) => a + b, 0) : 0;
            const restante = total - asignado;
            
            html += `
                <div style="border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-top: 10px; background: ${restante === 0 && total > 0 ? '#F0FFF0' : '#FFF8F8'};">
                    <h4>${linea.tipoBola} (${linea.peso}g) - Total: ${total} bolas</h4>
                    <div class="form-row">
            `;
            
            productosDestino.forEach(producto => {
                const valor = linea.distribucion?.[producto] || 0;
                html += `
                    <div class="form-group">
                        <label>${producto}</label>
                        <input type="number" min="0" step="1" 
                               style="width: 80px;" value="${valor}"
                               data-linea-index="${index}" data-producto="${producto}"
                               onblur="actualizarDistribucion(${index}, '${producto}', this.value)"
                               ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                    </div>
                `;
            });
            
            html += `
                    </div>
                    <div style="margin-top: 10px; font-weight: bold; color: ${restante === 0 ? 'var(--success)' : 'var(--error)'};" class="estado-distribucion-${index}">
                        ${restante === 0 ? '✅ Todas las bolas asignadas' : `🔴 Restante sin asignar: ${restante} bolas`}
                    </div>
                </div>
            `;
        });
    } else {
        html += `
            <div style="padding: 20px; color: #999; text-align: center;">
                Añade líneas de amasado para distribuir las bolas a productos.
            </div>
        `;
    }
    
    html += `
            </div>
            
            <div class="resumen-grid" style="margin-top: 20px;">
                <div class="resumen-card">
                    <div class="label">Total Bolas</div>
                    <div class="value primary resumen-total-bolas">${resumen.totalBolas}</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Peso Total</div>
                    <div class="value resumen-peso-total">${resumen.pesoTotal} kg</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Total Cajas</div>
                    <div class="value">${resumen.totalCajas}</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Torres</div>
                    <div class="value">${resumen.totalTorres}</div>
                </div>
            </div>
            
            ${!orden.aplicadoAProduccion ? `
                <div style="margin-top: 20px; padding: 15px; background: ${validacion.valida ? '#E8F5E9' : '#FFF3E0'}; border-radius: 8px; border-left: 4px solid ${validacion.valida ? 'var(--success)' : 'var(--error)'};" class="validacion-orden">
                    ${validacion.valida ? 
                        '✅ La orden está completa y lista para aplicar a producción' :
                        '❌ ' + validacion.errores.join('. ')
                    }
                </div>
            ` : ''}
            
            <div class="flex gap-10" style="margin-top: 20px; flex-wrap: wrap;">
                ${!orden.aplicadoAProduccion ? `
                    <button class="btn btn-primary" id="btn-guardar-orden">💾 Guardar Orden</button>
                    <button class="btn btn-success" id="btn-aplicar-produccion">📥 Aplicar a Producción</button>
                    <button class="btn btn-danger" id="btn-eliminar-orden">🗑️ Eliminar Orden</button>
                    <button class="btn btn-info" id="btn-ver-produccion" style="background: #17a2b8; color: white;">📋 Ver en Producción</button>
                ` : `
                    <button class="btn btn-secondary" id="btn-recargar">🔄 Recargar</button>
                    <button class="btn btn-warning" id="btn-desaplicar">↩️ Deshacer Aplicación</button>
                `}
                <button class="btn btn-secondary" id="btn-exportar-csv">📥 Exportar CSV</button>
            </div>
            
            ${orden.aplicadoAProduccion ? `
                <div style="margin-top: 15px; padding: 15px; background: #E8F5E9; border-radius: 8px; border-left: 4px solid var(--success);">
                    <p style="font-size: 0.9rem; color: #2E7D32;">
                        ✅ Esta orden fue aplicada a producción el ${new Date(orden.aplicadoEn).toLocaleString()}
                    </p>
                </div>
            ` : `
                <div style="margin-top: 15px; padding: 15px; background: #FFF8E1; border-radius: 8px; border-left: 4px solid var(--warning);">
                    <p style="font-size: 0.9rem; color: #666;">
                        ℹ️ <strong>Nota:</strong> La orden se aplicará al inventario de producción del día <strong>${orden.fechaUso}</strong>.
                        Asegúrate de que todas las bolas estén distribuidas correctamente antes de aplicar.
                    </p>
                </div>
            `}
        </div>
    `;
    
    container.innerHTML = html;
    
    // ============================================================
    // ASIGNAR EVENTOS CON addEventListener
    // ============================================================
    
    const btnAddLinea = document.getElementById('btn-añadir-linea');
    if (btnAddLinea) {
        btnAddLinea.addEventListener('click', function() {
            mostrarModalLineaAmasado();
        });
    }
    
    const btnDuplicarTodas = document.getElementById('btn-duplicar-todas');
    if (btnDuplicarTodas) {
        btnDuplicarTodas.addEventListener('click', function() {
            duplicarTodasLineasAmasado();
        });
    }
    
    const btnGuardar = document.getElementById('btn-guardar-orden');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', function() {
            guardarOrdenAmasado();
        });
    }
    
    const btnAplicar = document.getElementById('btn-aplicar-produccion');
    if (btnAplicar) {
        btnAplicar.addEventListener('click', function() {
            aplicarOrdenAProduccionUI();
        });
    }
    
    const btnEliminar = document.getElementById('btn-eliminar-orden');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', function() {
            eliminarOrdenAmasado();
        });
    }
    
    const btnRecargar = document.getElementById('btn-recargar');
    if (btnRecargar) {
        btnRecargar.addEventListener('click', function() {
            renderizarOrdenAmasado();
        });
    }
    
    const btnDesaplicar = document.getElementById('btn-desaplicar');
    if (btnDesaplicar) {
        btnDesaplicar.addEventListener('click', function() {
            desaplicarOrdenAmasado();
        });
    }
    
    const btnExportar = document.getElementById('btn-exportar-csv');
    if (btnExportar) {
        btnExportar.addEventListener('click', function() {
            exportarOrdenAmasado();
        });
    }
    
    const btnVerProduccion = document.getElementById('btn-ver-produccion');
    if (btnVerProduccion) {
        btnVerProduccion.addEventListener('click', function() {
            document.getElementById('fecha-produccion').value = orden.fechaUso;
            cambiarVista('produccion');
        });
    }
}

// ============================================================
// 11. UI - CLIENTES (SIMPLIFICADO)
// ============================================================

function renderizarClientes() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();

    let html = `
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>👥 Clientes</h2>
                    <span class="subtitle">${datos.clientes.filter(c => c.activo).length} clientes activos</span>
                </div>
                <button class="btn btn-primary" onclick="mostrarFormularioCliente()">➕ Añadir Cliente</button>
            </div>
            <div id="form-cliente-container" style="display: none; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                <h3 id="form-cliente-titulo">Añadir Cliente</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="cliente-codigo">Código</label>
                        <input type="text" id="cliente-codigo" placeholder="Ej: 100.0">
                    </div>
                    <div class="form-group">
                        <label for="cliente-nombre">Nombre</label>
                        <input type="text" id="cliente-nombre" placeholder="Nombre del cliente">
                    </div>
                </div>
                <input type="hidden" id="cliente-editando-id">
                <div class="flex gap-10">
                    <button class="btn btn-primary" onclick="guardarCliente()">💾 Guardar</button>
                    <button class="btn btn-secondary" onclick="cerrarFormularioCliente()">❌ Cancelar</button>
                </div>
            </div>
            <div class="tabla-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    datos.clientes.forEach(cliente => {
        html += `
            <tr>
                <td>${cliente.id}</td>
                <td><strong>${cliente.codigo}</strong></td>
                <td>${cliente.nombre}</td>
                <td>
                    <span style="color: ${cliente.activo ? 'var(--success)' : 'var(--error)'}">
                        ${cliente.activo ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editarCliente(${cliente.id})">✏️</button>
                    ${cliente.activo ? 
                        `<button class="btn btn-danger btn-sm" onclick="eliminarCliente(${cliente.id})">🗑️</button>` :
                        `<button class="btn btn-success btn-sm" onclick="reactivarCliente(${cliente.id})">↩️</button>`
                    }
                </td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function mostrarFormularioCliente() {
    document.getElementById('form-cliente-container').style.display = 'block';
    document.getElementById('form-cliente-titulo').textContent = 'Añadir Cliente';
    document.getElementById('cliente-codigo').value = '';
    document.getElementById('cliente-nombre').value = '';
    document.getElementById('cliente-editando-id').value = '';
}

function cerrarFormularioCliente() {
    document.getElementById('form-cliente-container').style.display = 'none';
}

function guardarCliente() {
    const codigo = document.getElementById('cliente-codigo').value.trim();
    const nombre = document.getElementById('cliente-nombre').value.trim();
    const editandoId = document.getElementById('cliente-editando-id').value;

    if (!codigo || !nombre) {
        mostrarNotificacion('Código y nombre son obligatorios', 'error');
        return;
    }

    const datos = cargarDatos();

    if (editandoId) {
        const cliente = datos.clientes.find(c => c.id === parseInt(editandoId));
        if (cliente) {
            const duplicado = datos.clientes.find(c => c.codigo === codigo && c.id !== parseInt(editandoId));
            if (duplicado) {
                mostrarNotificacion('El código ya está en uso', 'error');
                return;
            }
            cliente.codigo = codigo;
            cliente.nombre = nombre;
            guardarDatos(datos);
            mostrarNotificacion('Cliente actualizado correctamente', 'success');
        }
    } else {
        const duplicado = datos.clientes.find(c => c.codigo === codigo);
        if (duplicado) {
            mostrarNotificacion('El código ya está en uso', 'error');
            return;
        }
        const nuevoCliente = {
            id: generarId(datos.clientes),
            codigo: codigo,
            nombre: nombre,
            activo: true
        };
        datos.clientes.push(nuevoCliente);
        guardarDatos(datos);
        mostrarNotificacion('Cliente añadido correctamente', 'success');
    }

    cerrarFormularioCliente();
    renderizarClientes();
}

function editarCliente(id) {
    const datos = cargarDatos();
    const cliente = datos.clientes.find(c => c.id === id);
    if (!cliente) return;

    document.getElementById('form-cliente-container').style.display = 'block';
    document.getElementById('form-cliente-titulo').textContent = 'Editar Cliente';
    document.getElementById('cliente-codigo').value = cliente.codigo;
    document.getElementById('cliente-nombre').value = cliente.nombre;
    document.getElementById('cliente-editando-id').value = cliente.id;
}

function eliminarCliente(id) {
    if (!confirm('¿Estás seguro de desactivar este cliente?')) return;

    const datos = cargarDatos();
    const cliente = datos.clientes.find(c => c.id === id);
    if (cliente) {
        cliente.activo = false;
        guardarDatos(datos);
        renderizarClientes();
        mostrarNotificacion('Cliente desactivado correctamente', 'success');
    }
}

function reactivarCliente(id) {
    const datos = cargarDatos();
    const cliente = datos.clientes.find(c => c.id === id);
    if (cliente) {
        cliente.activo = true;
        guardarDatos(datos);
        renderizarClientes();
        mostrarNotificacion('Cliente reactivado correctamente', 'success');
    }
}

// ============================================================
// 12. UI - PRODUCTOS (SIMPLIFICADO)
// ============================================================

function renderizarProductos() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();

    let html = `
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>📦 Productos</h2>
                    <span class="subtitle">${datos.productos.filter(p => p.activo).length} productos activos</span>
                </div>
                <button class="btn btn-primary" onclick="mostrarFormularioProducto()">➕ Añadir Producto</button>
            </div>
            <div id="form-producto-container" style="display: none; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                <h3 id="form-producto-titulo">Añadir Producto</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="producto-nombre">Nombre</label>
                        <input type="text" id="producto-nombre" placeholder="Ej: Pizza Familiar">
                    </div>
                    <div class="form-group">
                        <label for="producto-precioCosto">Precio Coste (€)</label>
                        <input type="number" step="0.01" min="0" id="producto-precioCosto" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label for="producto-precioVenta">Precio Venta (€)</label>
                        <input type="number" step="0.01" min="0" id="producto-precioVenta" placeholder="0.00">
                    </div>
                </div>
                <input type="hidden" id="producto-editando-id">
                <div class="flex gap-10">
                    <button class="btn btn-primary" onclick="guardarProducto()">💾 Guardar</button>
                    <button class="btn btn-secondary" onclick="cerrarFormularioProducto()">❌ Cancelar</button>
                </div>
            </div>
            <div class="tabla-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio Coste</th>
                            <th>Precio Venta</th>
                            <th>Margen</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    datos.productos.forEach(producto => {
        const margen = producto.precioVenta > 0 
            ? Math.round(((producto.precioVenta - producto.precioCosto) / producto.precioVenta) * 10000) / 100 
            : 0;

        html += `
            <tr>
                <td>${producto.id}</td>
                <td><strong>${producto.nombre}</strong></td>
                <td>${producto.precioCosto.toFixed(2)} €</td>
                <td>${producto.precioVenta.toFixed(2)} €</td>
                <td style="color: ${margen > 30 ? 'var(--success)' : margen > 15 ? 'var(--warning)' : 'var(--error)'}">
                    ${margen}%
                </td>
                <td>
                    <span style="color: ${producto.activo ? 'var(--success)' : 'var(--error)'}">
                        ${producto.activo ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editarProducto(${producto.id})">✏️</button>
                    ${producto.activo ? 
                        `<button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})">🗑️</button>` :
                        `<button class="btn btn-success btn-sm" onclick="reactivarProducto(${producto.id})">↩️</button>`
                    }
                </td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function mostrarFormularioProducto() {
    document.getElementById('form-producto-container').style.display = 'block';
    document.getElementById('form-producto-titulo').textContent = 'Añadir Producto';
    document.getElementById('producto-nombre').value = '';
    document.getElementById('producto-precioCosto').value = '';
    document.getElementById('producto-precioVenta').value = '';
    document.getElementById('producto-editando-id').value = '';
}

function cerrarFormularioProducto() {
    document.getElementById('form-producto-container').style.display = 'none';
}

function guardarProducto() {
    const nombre = document.getElementById('producto-nombre').value.trim();
    const precioCosto = parseFloat(document.getElementById('producto-precioCosto').value) || 0;
    const precioVenta = parseFloat(document.getElementById('producto-precioVenta').value) || 0;
    const editandoId = document.getElementById('producto-editando-id').value;

    if (!nombre) {
        mostrarNotificacion('El nombre es obligatorio', 'error');
        return;
    }

    const datos = cargarDatos();

    if (editandoId) {
        const producto = datos.productos.find(p => p.id === parseInt(editandoId));
        if (producto) {
            const duplicado = datos.productos.find(p => p.nombre.toLowerCase() === nombre.toLowerCase() && p.id !== parseInt(editandoId));
            if (duplicado) {
                mostrarNotificacion('El nombre ya está en uso', 'error');
                return;
            }
            producto.nombre = nombre;
            producto.precioCosto = precioCosto;
            producto.precioVenta = precioVenta;
            guardarDatos(datos);
            mostrarNotificacion('Producto actualizado correctamente', 'success');
        }
    } else {
        const duplicado = datos.productos.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
        if (duplicado) {
            mostrarNotificacion('El nombre ya está en uso', 'error');
            return;
        }
        const nuevoProducto = {
            id: generarId(datos.productos),
            nombre: nombre,
            precioCosto: precioCosto,
            precioVenta: precioVenta,
            activo: true
        };
        datos.productos.push(nuevoProducto);
        guardarDatos(datos);
        mostrarNotificacion('Producto añadido correctamente', 'success');
    }

    cerrarFormularioProducto();
    renderizarProductos();
}

function editarProducto(id) {
    const datos = cargarDatos();
    const producto = datos.productos.find(p => p.id === id);
    if (!producto) return;

    document.getElementById('form-producto-container').style.display = 'block';
    document.getElementById('form-producto-titulo').textContent = 'Editar Producto';
    document.getElementById('producto-nombre').value = producto.nombre;
    document.getElementById('producto-precioCosto').value = producto.precioCosto;
    document.getElementById('producto-precioVenta').value = producto.precioVenta;
    document.getElementById('producto-editando-id').value = producto.id;
}

function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de desactivar este producto?')) return;

    const datos = cargarDatos();
    const producto = datos.productos.find(p => p.id === id);
    if (producto) {
        producto.activo = false;
        guardarDatos(datos);
        renderizarProductos();
        mostrarNotificacion('Producto desactivado correctamente', 'success');
    }
}

function reactivarProducto(id) {
    const datos = cargarDatos();
    const producto = datos.productos.find(p => p.id === id);
    if (producto) {
        producto.activo = true;
        guardarDatos(datos);
        renderizarProductos();
        mostrarNotificacion('Producto reactivado correctamente', 'success');
    }
}

// ============================================================
// 13. UI - DASHBOARD (SIMPLIFICADO)
// ============================================================

function renderizarDashboard() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();

    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diffLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diffLunes);

    let html = `
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>📊 Dashboard Semanal</h2>
                    <span class="subtitle">Semana del ${formatearFecha(lunes.toISOString().split('T')[0])}</span>
                </div>
                <div class="flex gap-10">
                    <button class="btn btn-secondary btn-sm" onclick="cambiarSemana(-1)">◀</button>
                    <button class="btn btn-secondary btn-sm" onclick="cambiarSemana(1)">▶</button>
                    <button class="btn btn-primary btn-sm" onclick="irSemanaActual()">Esta semana</button>
                </div>
            </div>
            <div class="resumen-grid" style="margin-bottom: 20px;">
    `;

    let totalUnidades = 0;
    let totalVentas = 0;
    let totalCoste = 0;
    let totalDiasConDatos = 0;

    for (let i = 0; i < 7; i++) {
        const fecha = new Date(lunes);
        fecha.setDate(lunes.getDate() + i);
        const fechaStr = fecha.toISOString().split('T')[0];
        const diaSemanaNombre = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()];
        const produccion = datos.produccion[fechaStr];
        const tieneDatos = produccion && produccion.pedidos && produccion.pedidos.length > 0;

        let unidades = 0;
        let ventas = 0;
        let coste = 0;
        let margen = 0;

        if (tieneDatos) {
            const ventasDiarias = calcularVentasDiarias(produccion.pedidos);
            unidades = Object.values(ventasDiarias).reduce((a, b) => a + b, 0);
            ventas = calcularVentasGeneradas(datos, ventasDiarias);
            const costeMP = calcularCosteMateriaPrima(datos, ventasDiarias);
            const costeMOD = parseFloat(produccion.horasTrabajadas) * parseFloat(datos.configuracion.costeManoObraHora);
            coste = costeMP + costeMOD;
            margen = calcularMargen(ventas, coste);

            totalUnidades += unidades;
            totalVentas += ventas;
            totalCoste += coste;
            totalDiasConDatos++;
        }

        html += `
            <div class="resumen-card" style="${tieneDatos ? '' : 'opacity: 0.5;'}">
                <div class="label">${diaSemanaNombre}</div>
                <div class="value" style="font-size: 0.9rem;">
                    ${tieneDatos ? `${unidades} uds` : 'Sin datos'}
                </div>
                ${tieneDatos ? `
                    <div style="font-size: 0.8rem; color: var(--text-light);">
                        ${ventas.toFixed(2)} € | ${margen}%
                    </div>
                ` : ''}
            </div>
        `;
    }

    const margenSemanal = totalVentas > 0 ? Math.round(((totalVentas - totalCoste) / totalVentas) * 10000) / 100 : 0;

    html += `
            </div>
            <div class="vista-header">
                <h3>📈 Resumen Semanal</h3>
            </div>
            <div class="resumen-grid">
                <div class="resumen-card">
                    <div class="label">Días con producción</div>
                    <div class="value">${totalDiasConDatos} / 7</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Total Unidades</div>
                    <div class="value primary">${totalUnidades}</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Total Ventas</div>
                    <div class="value success">${totalVentas.toFixed(2)} €</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Total Costes</div>
                    <div class="value">${totalCoste.toFixed(2)} €</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Margen Semanal</div>
                    <div class="value ${margenSemanal > 0 ? 'success' : 'danger'}">${margenSemanal}%</div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    window.semanaActual = lunes.toISOString().split('T')[0];
}

function cambiarSemana(direccion) {
    if (!window.semanaActual) {
        window.semanaActual = obtenerFechaActual();
    }
    const fecha = new Date(window.semanaActual);
    fecha.setDate(fecha.getDate() + (direccion * 7));
    window.semanaActual = fecha.toISOString().split('T')[0];
    renderizarDashboard();
}

function irSemanaActual() {
    window.semanaActual = null;
    renderizarDashboard();
}

// ============================================================
// 14. UI - CONFIGURACIÓN (SIMPLIFICADO)
// ============================================================

function renderizarConfiguracion() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();

    let html = `
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>⚙️ Configuración</h2>
                    <span class="subtitle">Ajustes generales de la aplicación</span>
                </div>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 500px;">
                <div class="form-group">
                    <label for="config-coste-hora">Coste Mano de Obra (€/hora)</label>
                    <input type="number" step="0.01" min="0" id="config-coste-hora" 
                           value="${datos.configuracion.costeManoObraHora}" 
                           onchange="guardarConfiguracion()">
                </div>
                <div class="form-group">
                    <label for="config-dias-caducidad">Días de Caducidad</label>
                    <input type="number" min="1" id="config-dias-caducidad" 
                           value="${datos.configuracion.diasCaducidad}" 
                           onchange="guardarConfiguracion()">
                </div>
                <button class="btn btn-primary" onclick="guardarConfiguracion()">💾 Guardar Configuración</button>
                <button class="btn btn-danger" onclick="resetearDatos()" style="margin-left: 10px;">🔄 Resetear Datos</button>
            </div>
            <div style="margin-top: 30px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 500px;">
                <h3>📊 Estadísticas Generales</h3>
                <div style="margin-top: 10px;">
                    <p><strong>Clientes:</strong> ${datos.clientes.length} (${datos.clientes.filter(c => c.activo).length} activos)</p>
                    <p><strong>Productos:</strong> ${datos.productos.length} (${datos.productos.filter(p => p.activo).length} activos)</p>
                    <p><strong>Días registrados:</strong> ${Object.keys(datos.produccion).length}</p>
                    <p><strong>Total pedidos:</strong> ${Object.values(datos.produccion).reduce((sum, dia) => sum + dia.pedidos.length, 0)}</p>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function guardarConfiguracion() {
    const datos = cargarDatos();
    const costeHora = parseFloat(document.getElementById('config-coste-hora').value);
    const diasCaducidad = parseInt(document.getElementById('config-dias-caducidad').value);

    if (!isNaN(costeHora) && costeHora >= 0) {
        datos.configuracion.costeManoObraHora = costeHora;
    }
    if (!isNaN(diasCaducidad) && diasCaducidad > 0) {
        datos.configuracion.diasCaducidad = diasCaducidad;
    }

    guardarDatos(datos);
    mostrarNotificacion('Configuración guardada correctamente', 'success');
}

function resetearDatos() {
    if (!confirm('⚠️ ¿Estás seguro de resetear todos los datos? Se perderán todos los pedidos registrados.')) return;
    if (!confirm('¿Estás completamente seguro? Esta acción no se puede deshacer.')) return;

    guardarDatos(DATOS_POR_DEFECTO);
    mostrarNotificacion('Datos reseteados correctamente', 'success');
    renderizarVistaActual();
}

// ============================================================
// 15. NAVEGACIÓN Y UTILIDADES
// ============================================================

function cambiarVista(vista) {
    console.log('🔄 Cambiando a vista:', vista);
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.vista === vista);
    });

    switch (vista) {
        case 'produccion':
            renderizarProduccion();
            break;
        case 'dashboard':
            renderizarDashboard();
            break;
        case 'clientes':
            renderizarClientes();
            break;
        case 'productos':
            renderizarProductos();
            break;
        case 'amasado':
            renderizarOrdenAmasado();
            break;
        case 'configuracion':
            renderizarConfiguracion();
            break;
        default:
            renderizarProduccion();
    }
}

function renderizarVistaActual() {
    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn) {
        cambiarVista(activeBtn.dataset.vista);
    } else {
        cambiarVista('produccion');
    }
}

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('open');
    }
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = mensaje;
    notification.className = `notification ${tipo}`;
    notification.classList.remove('hidden');

    clearTimeout(window.notificationTimeout);
    window.notificationTimeout = setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// ============================================================
// 16. INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================

function inicializarApp() {
    console.log('🍕 Inicializando Quality Pizzafresh App...');
    
    cargarDatos();
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const vista = this.dataset.vista;
            cambiarVista(vista);
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) navLinks.classList.remove('open');
        });
    });

    document.addEventListener('click', function(e) {
        const nav = document.getElementById('navbar');
        const navLinks = document.querySelector('.nav-links');
        if (nav && navLinks && !nav.contains(e.target)) {
            navLinks.classList.remove('open');
        }
    });

    cambiarVista('produccion');

    console.log('✅ App inicializada correctamente');
    console.log('👥 Clientes:', cargarDatos().clientes.length);
    console.log('📦 Productos:', cargarDatos().productos.length);
}

document.addEventListener('DOMContentLoaded', inicializarApp);
