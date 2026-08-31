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
    
    if (!orden.operario || orden.operario.trim() === '') {
        errores.push('El operario es obligatorio');
    }
    
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
// 8. FUNCIONES DE INTERACCIÓN - AMASADO (DEFINIDAS ANTES DE RENDERIZAR)
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
    renderizarOrdenAmasado();
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

function guardarOrdenAmasado() {
    console.log('💾 Guardando orden de amasado...');
    
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    const operarioInput = document.getElementById('operario-amasado');
    const horaInicio = document.getElementById('hora-inicio');
    const horaFin = document.getElementById('hora-fin');
    const tempInput = document.getElementById('temp-amasado');
    const humedadInput = document.getElementById('humedad-amasado');
    
    orden.operario = operarioInput ? operarioInput.value.trim() : '';
    orden.horaInicio = horaInicio ? horaInicio.value : '08:00';
    orden.horaFin = horaFin ? horaFin.value : '';
    orden.temperatura = tempInput ? parseFloat(tempInput.value) || 22 : 22;
    orden.humedad = humedadInput ? parseFloat(humedadInput.value) || 55 : 55;
    
    console.log('📋 Datos del formulario:');
    console.log('  - Operario:', orden.operario);
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
    console.log('✅ Orden guardada correctamente. Total bolas:', orden.totalBolas);
    mostrarNotificacion('✅ Orden de amasado guardada correctamente', 'success');
    renderizarOrdenAmasado();
}

function aplicarOrdenAProduccionUI() {
    console.log('📥 Aplicando orden a producción desde UI...');
    
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
    
    mostrarNotificacion('📥
