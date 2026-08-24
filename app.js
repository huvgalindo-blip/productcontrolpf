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

/**
 * Datos iniciales que se cargan la primera vez que se usa la app
 * Incluye productos, clientes y configuración
 */
const DATOS_POR_DEFECTO = {
    // Lista de productos con sus precios
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

    // Lista de clientes de ejemplo
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

    // Configuración general de la aplicación
    configuracion: {
        costeManoObraHora: 7.24,
        diasCaducidad: 19
    },

    // Producción diaria (inicialmente vacía)
    produccion: {}
};

// ============================================================
// 2. SERVICIO DE DATOS (localStorage)
// ============================================================

/**
 * Carga todos los datos de la aplicación desde localStorage
 * Si no existen, crea los datos por defecto
 * @returns {Object} - Todos los datos de la aplicación
 */
function cargarDatos() {
    try {
        const datosGuardados = localStorage.getItem('qualityPizzaData');
        if (datosGuardados) {
            const datos = JSON.parse(datosGuardados);
            // Verificar que todos los campos existen
            if (!datos.productos) datos.productos = DATOS_POR_DEFECTO.productos;
            if (!datos.clientes) datos.clientes = DATOS_POR_DEFECTO.clientes;
            if (!datos.configuracion) datos.configuracion = DATOS_POR_DEFECTO.configuracion;
            if (!datos.produccion) datos.produccion = {};
            return datos;
        }
        // Si no hay datos, guardar los datos por defecto
        guardarDatos(DATOS_POR_DEFECTO);
        return DATOS_POR_DEFECTO;
    } catch (error) {
        console.error('Error al cargar datos:', error);
        return DATOS_POR_DEFECTO;
    }
}

/**
 * Guarda todos los datos en localStorage
 * @param {Object} datos - Todos los datos de la aplicación
 */
function guardarDatos(datos) {
    try {
        localStorage.setItem('qualityPizzaData', JSON.stringify(datos));
    } catch (error) {
        console.error('Error al guardar datos:', error);
        mostrarNotificacion('Error al guardar datos', 'error');
    }
}

/**
 * Genera un ID único para nuevos registros
 * @param {Array} coleccion - Array de objetos existentes
 * @returns {number} - Nuevo ID
 */
function generarId(coleccion) {
    if (!coleccion || coleccion.length === 0) return 1;
    const ids = coleccion.map(item => item.id);
    return Math.max(...ids) + 1;
}

/**
 * Genera un lote automático para pedidos
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {number} numero - Número de pedido del día
 * @returns {string} - Lote formateado (ej: 20260817-001)
 */
function generarLote(fecha, numero) {
    const fechaLimpia = fecha.replace(/-/g, '');
    const numStr = String(numero).padStart(3, '0');
    return `${fechaLimpia}-${numStr}`;
}

/**
 * Calcula la fecha de caducidad (fecha + días)
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {number} dias - Número de días a añadir
 * @returns {string} - Fecha de caducidad en formato YYYY-MM-DD
 */
function calcularCaducidad(fecha, dias) {
    const fechaObj = new Date(fecha);
    fechaObj.setDate(fechaObj.getDate() + dias);
    return fechaObj.toISOString().split('T')[0];
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string} - Fecha actual
 */
function obtenerFechaActual() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Formatea una fecha para mostrar (DD/MM/YYYY)
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada
 */
function formatearFecha(fecha) {
    if (!fecha) return '';
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ============================================================
// 3. SERVICIO DE PRODUCTOS
// ============================================================

/**
 * Obtiene la lista de productos activos
 * @param {Object} datos - Todos los datos de la app
 * @returns {Array} - Lista de productos activos
 */
function obtenerProductosActivos(datos) {
    return datos.productos.filter(p => p.activo === true);
}

/**
 * Obtiene un producto por su ID
 * @param {Object} datos - Todos los datos de la app
 * @param {number} id - ID del producto
 * @returns {Object|null} - Producto encontrado o null
 */
function obtenerProductoPorId(datos, id) {
    return datos.productos.find(p => p.id === id) || null;
}

/**
 * Obtiene el precio de venta de un producto por su nombre
 * @param {Object} datos - Todos los datos de la app
 * @param {string} nombre - Nombre del producto
 * @returns {number} - Precio de venta (0 si no se encuentra)
 */
function obtenerPrecioVenta(datos, nombre) {
    const producto = datos.productos.find(p => p.nombre === nombre && p.activo);
    return producto ? producto.precioVenta : 0;
}

/**
 * Obtiene el precio de coste de un producto por su nombre
 * @param {Object} datos - Todos los datos de la app
 * @param {string} nombre - Nombre del producto
 * @returns {number} - Precio de coste (0 si no se encuentra)
 */
function obtenerPrecioCosto(datos, nombre) {
    const producto = datos.productos.find(p => p.nombre === nombre && p.activo);
    return producto ? producto.precioCosto : 0;
}

// ============================================================
// 4. SERVICIO DE CLIENTES
// ============================================================

/**
 * Obtiene la lista de clientes activos
 * @param {Object} datos - Todos los datos de la app
 * @returns {Array} - Lista de clientes activos
 */
function obtenerClientesActivos(datos) {
    return datos.clientes.filter(c => c.activo === true);
}

/**
 * Obtiene un cliente por su ID
 * @param {Object} datos - Todos los datos de la app
 * @param {number} id - ID del cliente
 * @returns {Object|null} - Cliente encontrado o null
 */
function obtenerClientePorId(datos, id) {
    return datos.clientes.find(c => c.id === id) || null;
}

/**
 * Obtiene el nombre de un cliente por su ID
 * @param {Object} datos - Todos los datos de la app
 * @param {number} id - ID del cliente
 * @returns {string} - Nombre del cliente o 'Cliente desconocido'
 */
function obtenerNombreCliente(datos, id) {
    const cliente = obtenerClientePorId(datos, id);
    return cliente ? cliente.nombre : 'Cliente desconocido';
}

// ============================================================
// 5. SERVICIO DE PRODUCCIÓN
// ============================================================

/**
 * Obtiene la producción de un día específico
 * Si no existe, crea un registro vacío para ese día
 * @param {Object} datos - Todos los datos de la app
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Object} - Datos de producción del día
 */
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

/**
 * Inicializa el inventario inicial para un día
 * Usa los valores del día anterior si existen
 * @param {Object} datos - Todos los datos de la app
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Object} - Inventario inicial con todos los productos
 */
function inicializarInventario(datos, fecha) {
    const productos = obtenerProductosActivos(datos);
    const produccion = obtenerProduccionDia(datos, fecha);
    const inventario = {};

    // Si ya hay inventario inicial guardado, usarlo
    if (produccion.inventarioInicial && Object.keys(produccion.inventarioInicial).length > 0) {
        return produccion.inventarioInicial;
    }

    // Si no, intentar usar el inventario final del día anterior
    const fechaAnterior = new Date(fecha);
    fechaAnterior.setDate(fechaAnterior.getDate() - 1);
    const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];
    const produccionAnterior = datos.produccion[fechaAnteriorStr];

    if (produccionAnterior && produccionAnterior.inventarioFinal) {
        return produccionAnterior.inventarioFinal;
    }

    // Si no hay datos anteriores, inicializar con 0
    productos.forEach(p => {
        inventario[p.nombre] = 0;
    });

    return inventario;
}

/**
 * Calcula las ventas diarias sumando todos los pedidos del día
 * @param {Array} pedidos - Lista de pedidos del día
 * @returns {Object} - Ventas por producto { nombreProducto: cantidad }
 */
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

/**
 * Calcula el inventario final (inicial - ventas)
 * @param {Object} inventarioInicial - Inventario inicial por producto
 * @param {Object} ventasDiarias - Ventas por producto
 * @returns {Object} - Inventario final por producto
 */
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

/**
 * Calcula el coste de materia prima del día
 * @param {Object} datos - Todos los datos de la app
 * @param {Object} ventasDiarias - Ventas por producto
 * @returns {number} - Coste total de materia prima
 */
function calcularCosteMateriaPrima(datos, ventasDiarias) {
    let total = 0;
    Object.keys(ventasDiarias).forEach(nombre => {
        const cantidad = parseFloat(ventasDiarias[nombre]) || 0;
        const costeUnitario = obtenerPrecioCosto(datos, nombre);
        total += cantidad * costeUnitario;
    });
    return Math.round(total * 100) / 100;
}

/**
 * Calcula las ventas generadas en el día
 * @param {Object} datos - Todos los datos de la app
 * @param {Object} ventasDiarias - Ventas por producto
 * @returns {number} - Total de ventas generadas
 */
function calcularVentasGeneradas(datos, ventasDiarias) {
    let total = 0;
    Object.keys(ventasDiarias).forEach(nombre => {
        const cantidad = parseFloat(ventasDiarias[nombre]) || 0;
        const precioVenta = obtenerPrecioVenta(datos, nombre);
        total += cantidad * precioVenta;
    });
    return Math.round(total * 100) / 100;
}

/**
 * Calcula el margen del día
 * @param {number} ventasGeneradas - Total de ventas generadas
 * @param {number} costeTotal - Coste total (materia prima + mano de obra)
 * @returns {number} - Margen en porcentaje
 */
function calcularMargen(ventasGeneradas, costeTotal) {
    if (ventasGeneradas === 0) return 0;
    return Math.round(((ventasGeneradas - costeTotal) / ventasGeneradas) * 10000) / 100;
}

/**
 * Calcula el total de un pedido sumando todas las cantidades
 * @param {Object} productos - Objeto con { nombreProducto: cantidad }
 * @returns {number} - Total de unidades del pedido
 */
function calcularTotalPedido(productos) {
    let total = 0;
    if (productos) {
        Object.keys(productos).forEach(nombre => {
            total += parseFloat(productos[nombre]) || 0;
        });
    }
    return total;
}

/**
 * Obtiene el siguiente número de lote para un día
 * @param {Array} pedidos - Lista de pedidos del día
 * @returns {number} - Siguiente número de lote
 */
function obtenerSiguienteNumeroLote(pedidos) {
    if (!pedidos || pedidos.length === 0) return 1;
    const numeros = pedidos.map(p => {
        if (p.lote) {
            const partes = p.lote.split('-');
            return parseInt(partes[partes.length - 1]) || 0;
        }
        return 0;
    });
    return Math.max(...numeros) + 1;
}

// ============================================================
// 6. INTERFAZ DE USUARIO - RENDERIZADO
// ============================================================

/**
 * Renderiza la vista de producción diaria
 */
function renderizarProduccion() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);
    const productosActivos = obtenerProductosActivos(datos);
    const clientesActivos = obtenerClientesActivos(datos);

    // Inicializar inventario si está vacío
    if (!produccion.inventarioInicial || Object.keys(produccion.inventarioInicial).length === 0) {
        produccion.inventarioInicial = inicializarInventario(datos, fecha);
        guardarDatos(datos);
    }

    // Calcular ventas y resumen
    const ventasDiarias = calcularVentasDiarias(produccion.pedidos);
    const inventarioFinal = calcularInventarioFinal(produccion.inventarioInicial, ventasDiarias);
    const costeMP = calcularCosteMateriaPrima(datos, ventasDiarias);
    const costeMOD = parseFloat(produccion.horasTrabajadas) * parseFloat(datos.configuracion.costeManoObraHora);
    const ventasGen = calcularVentasGeneradas(datos, ventasDiarias);
    const costeTotal = costeMP + costeMOD;
    const margen = calcularMargen(ventasGen, costeTotal);

    // Generar HTML de la vista
    let html = `
        <!-- ======================================= -->
        <!-- VISTA: PRODUCCIÓN DIARIA               -->
        <!-- ======================================= -->
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>📋 Producción Diaria</h2>
                    <span class="subtitle">Registro de pedidos del día</span>
                </div>
                <div class="flex gap-10">
                    <input type="date" id="fecha-produccion" value="${fecha}" onchange="cambiarFechaProduccion(this.value)">
                    <button class="btn btn-secondary btn-sm" onclick="irDiaAnterior()">◀</button>
                    <button class="btn btn-secondary btn-sm" onclick="irDiaSiguiente()">▶</button>
                    <button class="btn btn-primary btn-sm" onclick="irHoy()">Hoy</button>
                </div>
            </div>

            <!-- ======================================= -->
            <!-- TABLA DE PEDIDOS                       -->
            <!-- ======================================= -->
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

    // Si no hay pedidos, mostrar fila vacía
    if (produccion.pedidos.length === 0) {
        html += `
            <tr>
                <td colspan="${productosActivos.length + 4}" class="text-center" style="padding: 30px; color: #999;">
                    No hay pedidos registrados para este día
                </td>
            </tr>
        `;
    } else {
        // Mostrar cada pedido
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

            <!-- ======================================= -->
            <!-- RESUMEN DEL DÍA                       -->
            <!-- ======================================= -->
            <div class="vista-header" style="margin-top: 20px;">
                <h3>📊 Resumen del Día</h3>
                <span class="subtitle">${formatearFecha(fecha)}</span>
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

            <!-- ======================================= -->
            <!-- INVENTARIO                             -->
            <!-- ======================================= -->
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

    // Mostrar inventario por producto
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

/**
 * Cambia la fecha de producción y recarga la vista
 */
function cambiarFechaProduccion(fecha) {
    renderizarProduccion();
}

/**
 * Navega al día anterior
 */
function irDiaAnterior() {
    const fechaInput = document.getElementById('fecha-produccion');
    if (fechaInput) {
        const fecha = new Date(fechaInput.value);
        fecha.setDate(fecha.getDate() - 1);
        fechaInput.value = fecha.toISOString().split('T')[0];
        renderizarProduccion();
    }
}

/**
 * Navega al día siguiente
 */
function irDiaSiguiente() {
    const fechaInput = document.getElementById('fecha-produccion');
    if (fechaInput) {
        const fecha = new Date(fechaInput.value);
        fecha.setDate(fecha.getDate() + 1);
        fechaInput.value = fecha.toISOString().split('T')[0];
        renderizarProduccion();
    }
}

/**
 * Navega al día de hoy
 */
function irHoy() {
    const fechaInput = document.getElementById('fecha-produccion');
    if (fechaInput) {
        fechaInput.value = obtenerFechaActual();
        renderizarProduccion();
    }
}

/**
 * Añade una nueva fila de pedido vacía
 */
function añadirFilaPedido() {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    // Crear objeto de productos vacío
    const productos = {};
    const productosActivos = obtenerProductosActivos(datos);
    productosActivos.forEach(p => {
        productos[p.nombre] = 0;
    });

    // Obtener siguiente número de lote
    const numLote = obtenerSiguienteNumeroLote(produccion.pedidos);

    // Crear nuevo pedido
    const nuevoPedido = {
        id: `P${String(produccion.pedidos.length + 1).padStart(3, '0')}`,
        clienteId: null,
        productos: productos,
        finalizado: false,
        lote: generarLote(fecha, numLote),
        caducidad: calcularCaducidad(fecha, datos.configuracion.diasCaducidad || 19)
    };

    produccion.pedidos.push(nuevoPedido);
    guardarDatos(datos);
    renderizarProduccion();
    mostrarNotificacion('Fila añadida correctamente', 'success');
}

/**
 * Elimina una fila de pedido
 */
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

/**
 * Actualiza un pedido cuando cambia algún campo
 */
function actualizarPedido(index) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    if (index >= produccion.pedidos.length) return;

    // Obtener todos los elementos de la fila
    const fila = document.querySelector(`#tabla-pedidos tbody tr:nth-child(${index + 1})`);
    if (!fila) return;

    // Actualizar cliente
    const selectCliente = fila.querySelector('.cliente-select');
    if (selectCliente) {
        produccion.pedidos[index].clienteId = parseInt(selectCliente.value) || null;
    }

    // Actualizar cantidades de productos
    const inputs = fila.querySelectorAll('.cantidad-input');
    inputs.forEach(input => {
        const producto = input.dataset.producto;
        const valor = parseFloat(input.value) || 0;
        if (!produccion.pedidos[index].productos) {
            produccion.pedidos[index].productos = {};
        }
        produccion.pedidos[index].productos[producto] = valor;
    });

    // Actualizar estado finalizado
    const checkbox = fila.querySelector('.finalizado-check');
    if (checkbox) {
        produccion.pedidos[index].finalizado = checkbox.checked;
    }

    guardarDatos(datos);
    renderizarProduccion();
}

/**
 * Guarda las horas trabajadas del día
 */
function guardarHorasTrabajadas(valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    produccion.horasTrabajadas = parseFloat(valor) || 0;
    guardarDatos(datos);
    renderizarProduccion();
}

/**
 * Actualiza el inventario inicial de un producto
 */
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
// 7. INTERFAZ DE USUARIO - CLIENTES
// ============================================================

/**
 * Renderiza la vista de gestión de clientes
 */
function renderizarClientes() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();

    let html = `
        <!-- ======================================= -->
        <!-- VISTA: CLIENTES                         -->
        <!-- ======================================= -->
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>👥 Clientes</h2>
                    <span class="subtitle">${datos.clientes.filter(c => c.activo).length} clientes activos</span>
                </div>
                <button class="btn btn-primary" onclick="mostrarFormularioCliente()">➕ Añadir Cliente</button>
            </div>

            <!-- Formulario para añadir/editar -->
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

            <!-- Tabla de clientes -->
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

/**
 * Muestra el formulario para añadir cliente
 */
function mostrarFormularioCliente() {
    document.getElementById('form-cliente-container').style.display = 'block';
    document.getElementById('form-cliente-titulo').textContent = 'Añadir Cliente';
    document.getElementById('cliente-codigo').value = '';
    document.getElementById('cliente-nombre').value = '';
    document.getElementById('cliente-editando-id').value = '';
    document.getElementById('cliente-codigo').focus();
}

/**
 * Cierra el formulario de cliente
 */
function cerrarFormularioCliente() {
    document.getElementById('form-cliente-container').style.display = 'none';
}

/**
 * Guarda un cliente (nuevo o editado)
 */
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
        // Editar cliente existente
        const cliente = datos.clientes.find(c => c.id === parseInt(editandoId));
        if (cliente) {
            // Verificar que el código no esté siendo usado por otro cliente
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
        // Añadir nuevo cliente
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

/**
 * Edita un cliente existente (carga los datos en el formulario)
 */
function editarCliente(id) {
    const datos = cargarDatos();
    const cliente = datos.clientes.find(c => c.id === id);
    if (!cliente) return;

    document.getElementById('form-cliente-container').style.display = 'block';
    document.getElementById('form-cliente-titulo').textContent = 'Editar Cliente';
    document.getElementById('cliente-codigo').value = cliente.codigo;
    document.getElementById('cliente-nombre').value = cliente.nombre;
    document.getElementById('cliente-editando-id').value = cliente.id;
    document.getElementById('cliente-codigo').focus();
}

/**
 * Elimina un cliente (soft delete)
 */
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

/**
 * Reactiva un cliente
 */
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
// 8. INTERFAZ DE USUARIO - PRODUCTOS
// ============================================================

/**
 * Renderiza la vista de gestión de productos
 */
function renderizarProductos() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();

    let html = `
        <!-- ======================================= -->
        <!-- VISTA: PRODUCTOS                        -->
        <!-- ======================================= -->
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>📦 Productos</h2>
                    <span class="subtitle">${datos.productos.filter(p => p.activo).length} productos activos</span>
                </div>
                <button class="btn btn-primary" onclick="mostrarFormularioProducto()">➕ Añadir Producto</button>
            </div>

            <!-- Formulario para añadir/editar -->
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

            <!-- Tabla de productos -->
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

/**
 * Muestra el formulario para añadir producto
 */
function mostrarFormularioProducto() {
    document.getElementById('form-producto-container').style.display = 'block';
    document.getElementById('form-producto-titulo').textContent = 'Añadir Producto';
    document.getElementById('producto-nombre').value = '';
    document.getElementById('producto-precioCosto').value = '';
    document.getElementById('producto-precioVenta').value = '';
    document.getElementById('producto-editando-id').value = '';
    document.getElementById('producto-nombre').focus();
}

/**
 * Cierra el formulario de producto
 */
function cerrarFormularioProducto() {
    document.getElementById('form-producto-container').style.display = 'none';
}

/**
 * Guarda un producto (nuevo o editado)
 */
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
        // Editar producto existente
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
        // Añadir nuevo producto
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

/**
 * Edita un producto existente (carga los datos en el formulario)
 */
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
    document.getElementById('producto-nombre').focus();
}

/**
 * Elimina un producto (soft delete)
 */
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

/**
 * Reactiva un producto
 */
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
// 9. INTERFAZ DE USUARIO - DASHBOARD
// ============================================================

/**
 * Renderiza el dashboard semanal
 */
function renderizarDashboard() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();

    // Obtener la semana actual (Lunes a Domingo)
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0=Dom, 1=Lun...
    const diffLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diffLunes);

    let html = `
        <!-- ======================================= -->
        <!-- VISTA: DASHBOARD SEMANAL               -->
        <!-- ======================================= -->
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

    // Calcular totales de la semana
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

    // Totales de la semana
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
    // Guardar la semana actual para navegación
    window.semanaActual = lunes.toISOString().split('T')[0];
}

/**
 * Cambia la semana (anterior o siguiente)
 */
function cambiarSemana(direccion) {
    if (!window.semanaActual) {
        window.semanaActual = obtenerFechaActual();
    }
    const fecha = new Date(window.semanaActual);
    fecha.setDate(fecha.getDate() + (direccion * 7));
    window.semanaActual = fecha.toISOString().split('T')[0];
    renderizarDashboard();
}

/**
 * Va a la semana actual
 */
function irSemanaActual() {
    window.semanaActual = null;
    renderizarDashboard();
}

// ============================================================
// 10. INTERFAZ DE USUARIO - CONFIGURACIÓN
// ============================================================

/**
 * Renderiza la vista de configuración
 */
function renderizarConfiguracion() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();

    let html = `
        <!-- ======================================= -->
        <!-- VISTA: CONFIGURACIÓN                    -->
        <!-- ======================================= -->
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

/**
 * Guarda la configuración
 */
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

/**
 * Resetea todos los datos a los valores por defecto
 */
function resetearDatos() {
    if (!confirm('⚠️ ¿Estás seguro de resetear todos los datos? Se perderán todos los pedidos registrados.')) return;
    if (!confirm('¿Estás completamente seguro? Esta acción no se puede deshacer.')) return;

    guardarDatos(DATOS_POR_DEFECTO);
    mostrarNotificacion('Datos reseteados correctamente', 'success');
    renderizarVistaActual();
}

// ============================================================
// 11. NAVEGACIÓN Y UTILIDADES
// ============================================================

/**
 * Cambia entre las diferentes vistas de la aplicación
 */
function cambiarVista(vista) {
    // Actualizar botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.vista === vista);
    });

    // Renderizar la vista correspondiente
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
        case 'configuracion':
            renderizarConfiguracion();
            break;
        default:
            renderizarProduccion();
    }
}

/**
 * Renderiza la vista actual según la navegación
 */
function renderizarVistaActual() {
    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn) {
        cambiarVista(activeBtn.dataset.vista);
    } else {
        cambiarVista('produccion');
    }
}

/**
 * Alterna el menú en dispositivos móviles
 */
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('open');
}

/**
 * Muestra una notificación en la pantalla
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = mensaje;
    notification.className = `notification ${tipo}`;
    notification.classList.remove('hidden');

    // Ocultar después de 3 segundos
    clearTimeout(window.notificationTimeout);
    window.notificationTimeout = setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// ============================================================
// 12. INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================

/**
 * Inicializa la aplicación cuando se carga la página
 */
function inicializarApp() {
    // Cargar datos para asegurar que existen
    cargarDatos();

    // Configurar eventos de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            cambiarVista(this.dataset.vista);
            // Cerrar menú en móvil
            document.querySelector('.nav-links').classList.remove('open');
        });
    });

    // Cerrar menú al hacer click fuera
    document.addEventListener('click', function(e) {
        const nav = document.getElementById('navbar');
        if (!nav.contains(e.target)) {
            document.querySelector('.nav-links').classList.remove('open');
        }
    });

    // Renderizar la vista inicial
    renderizarProduccion();

    console.log('🍕 Quality Pizzafresh - App de Control de Producción');
    console.log('📊 Datos cargados correctamente');
    console.log('👥 Clientes:', cargarDatos().clientes.length);
    console.log('📦 Productos:', cargarDatos().productos.length);
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarApp);

// ============================================================
// NUEVA FUNCIONALIDAD: COMPARATIVA DE PRODUCCIÓN
// ============================================================

/**
 * Renderiza la vista de comparativa de producción
 */
function renderizarComparativa() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();

    // Obtener fechas por defecto (últimos 30 días)
    const hoy = new Date();
    const hace30Dias = new Date(hoy);
    hace30Dias.setDate(hoy.getDate() - 30);

    const fechaFin = hoy.toISOString().split('T')[0];
    const fechaInicio = hace30Dias.toISOString().split('T')[0];

    let html = `
        <!-- ======================================= -->
        <!-- VISTA: COMPARATIVA DE PRODUCCIÓN       -->
        <!-- ======================================= -->
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>📈 Comparativa de Producción</h2>
                    <span class="subtitle">Análisis histórico de producción</span>
                </div>
            </div>

            <!-- ======================================= -->
            <!-- SELECTOR DE FECHAS                     -->
            <!-- ======================================= -->
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                <div class="form-row">
                    <div class="form-group">
                        <label for="comparativa-fecha-inicio">Fecha Inicio</label>
                        <input type="date" id="comparativa-fecha-inicio" value="${fechaInicio}">
                    </div>
                    <div class="form-group">
                        <label for="comparativa-fecha-fin">Fecha Fin</label>
                        <input type="date" id="comparativa-fecha-fin" value="${fechaFin}">
                    </div>
                    <div class="form-group" style="display: flex; align-items: flex-end;">
                        <button class="btn btn-primary" onclick="actualizarComparativa()">🔍 Actualizar</button>
                        <button class="btn btn-secondary" onclick="exportarCSVComparativa()" style="margin-left: 10px;">📥 Exportar CSV</button>
                    </div>
                </div>
            </div>

            <!-- ======================================= -->
            <!-- CONTENEDOR DE RESULTADOS               -->
            <!-- ======================================= -->
            <div id="comparativa-resultados">
                <!-- Los resultados se cargarán aquí -->
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Cargar los datos iniciales
    actualizarComparativa();
}

/**
 * Actualiza la comparativa con las fechas seleccionadas
 */
function actualizarComparativa() {
    const fechaInicio = document.getElementById('comparativa-fecha-inicio').value;
    const fechaFin = document.getElementById('comparativa-fecha-fin').value;

    if (!fechaInicio || !fechaFin) {
        mostrarNotificacion('Selecciona ambas fechas', 'error');
        return;
    }

    if (fechaInicio > fechaFin) {
        mostrarNotificacion('La fecha de inicio no puede ser mayor que la fecha fin', 'error');
        return;
    }

    const datos = cargarDatos();
    const resultados = obtenerDatosComparativa(datos, fechaInicio, fechaFin);
    renderizarResultadosComparativa(resultados, fechaInicio, fechaFin);
}

/**
 * Obtiene los datos de producción para un rango de fechas
 */
function obtenerDatosComparativa(datos, fechaInicio, fechaFin) {
    const resultados = [];
    let fechaActual = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);

    while (fechaActual <= fechaFinObj) {
        const fechaStr = fechaActual.toISOString().split('T')[0];
        const produccion = datos.produccion[fechaStr];
        const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fechaActual.getDay()];

        let unidades = 0;
        let ventas = 0;
        let costeMP = 0;
        let costeMOD = 0;
        let costeTotal = 0;
        let margen = 0;
        let pedidosCount = 0;

        if (produccion && produccion.pedidos && produccion.pedidos.length > 0) {
            const ventasDiarias = calcularVentasDiarias(produccion.pedidos);
            unidades = Object.values(ventasDiarias).reduce((a, b) => a + b, 0);
            ventas = calcularVentasGeneradas(datos, ventasDiarias);
            costeMP = calcularCosteMateriaPrima(datos, ventasDiarias);
            costeMOD = parseFloat(produccion.horasTrabajadas) * parseFloat(datos.configuracion.costeManoObraHora);
            costeTotal = costeMP + costeMOD;
            margen = calcularMargen(ventas, costeTotal);
            pedidosCount = produccion.pedidos.length;
        }

        resultados.push({
            fecha: fechaStr,
            diaSemana: diaSemana,
            unidades: unidades,
            ventas: ventas,
            costeMP: costeMP,
            costeMOD: costeMOD,
            costeTotal: costeTotal,
            margen: margen,
            pedidos: pedidosCount,
            tieneDatos: produccion && produccion.pedidos && produccion.pedidos.length > 0
        });

        fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return resultados;
}

/**
 * Renderiza los resultados de la comparativa con gráficos
 */
function renderizarResultadosComparativa(resultados, fechaInicio, fechaFin) {
    const container = document.getElementById('comparativa-resultados');

    // Calcular totales
    const totalUnidades = resultados.reduce((sum, r) => sum + r.unidades, 0);
    const totalVentas = resultados.reduce((sum, r) => sum + r.ventas, 0);
    const totalCoste = resultados.reduce((sum, r) => sum + r.costeTotal, 0);
    const totalPedidos = resultados.reduce((sum, r) => sum + r.pedidos, 0);
    const diasConDatos = resultados.filter(r => r.tieneDatos).length;
    const totalDias = resultados.length;
    const mediaUnidades = diasConDatos > 0 ? Math.round(totalUnidades / diasConDatos) : 0;
    const margenTotal = totalVentas > 0 ? Math.round(((totalVentas - totalCoste) / totalVentas) * 10000) / 100 : 0;
    const maxUnidades = Math.max(...resultados.map(r => r.unidades), 1);
    const maxVentas = Math.max(...resultados.map(r => r.ventas), 1);

    let html = `
        <!-- ======================================= -->
        <!-- RESULTADOS Y GRÁFICOS                   -->
        <!-- ======================================= -->

        <!-- Resumen del período -->
        <div class="resumen-grid" style="margin-bottom: 20px;">
            <div class="resumen-card">
                <div class="label">Días analizados</div>
                <div class="value">${totalDias} (${diasConDatos} con datos)</div>
            </div>
            <div class="resumen-card">
                <div class="label">Total Unidades</div>
                <div class="value primary">${totalUnidades}</div>
            </div>
            <div class="resumen-card">
                <div class="label">Media diaria</div>
                <div class="value">${mediaUnidades} uds</div>
            </div>
            <div class="resumen-card">
                <div class="label">Total Pedidos</div>
                <div class="value">${totalPedidos}</div>
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
                <div class="label">Margen Período</div>
                <div class="value ${margenTotal > 0 ? 'success' : 'danger'}">${margenTotal}%</div>
            </div>
        </div>

        <!-- Gráfico: Unidades producidas -->
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3>📊 Unidades Producidas por Día</h3>
            <div style="display: flex; align-items: flex-end; height: 200px; gap: 4px; padding-top: 10px; border-bottom: 2px solid #ddd;">
    `;

    resultados.forEach((r, index) => {
        const altura = r.unidades > 0 ? (r.unidades / maxUnidades) * 180 : 2;
        const color = r.tieneDatos ? '#F7941E' : '#E0E0E0';
        const tooltip = r.tieneDatos 
            ? `${r.fecha}: ${r.unidades} uds, ${r.ventas.toFixed(2)} €`
            : `${r.fecha}: Sin datos`;

        html += `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 20px;">
                <div style="width: 100%; min-width: 12px; max-width: 40px; height: ${altura}px; background: ${color}; border-radius: 4px 4px 0 0; transition: all 0.3s; position: relative; cursor: pointer;"
                     onmouseover="this.style.opacity='0.8'"
                     onmouseout="this.style.opacity='1'"
                     title="${tooltip}">
                    <span style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #333; font-weight: bold; display: ${r.unidades > 0 ? 'block' : 'none'};">
                        ${r.unidades}
                    </span>
                </div>
                <span style="font-size: 8px; margin-top: 4px; text-align: center; color: #666; writing-mode: vertical-lr; transform: rotate(0deg);">
                    ${r.fecha.split('-')[2]}/${r.fecha.split('-')[1]}
                </span>
            </div>
        `;
    });

    html += `
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 11px; color: #999;">
                <span>${resultados[0]?.fecha || ''}</span>
                <span>${resultados[resultados.length - 1]?.fecha || ''}</span>
            </div>
            <div style="display: flex; gap: 20px; margin-top: 10px; font-size: 12px;">
                <span><span style="display: inline-block; width: 12px; height: 12px; background: #F7941E; border-radius: 2px; vertical-align: middle;"></span> Con datos</span>
                <span><span style="display: inline-block; width: 12px; height: 12px; background: #E0E0E0; border-radius: 2px; vertical-align: middle;"></span> Sin datos</span>
            </div>
        </div>

        <!-- Tabla de datos detallada -->
        <div class="tabla-container">
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Día</th>
                        <th>Pedidos</th>
                        <th>Unidades</th>
                        <th>Ventas (€)</th>
                        <th>Coste MP (€)</th>
                        <th>Coste MOD (€)</th>
                        <th>Coste Total (€)</th>
                        <th>Margen</th>
                    </tr>
                </thead>
                <tbody>
    `;

    resultados.forEach(r => {
        const margenColor = r.margen > 30 ? 'var(--success)' : r.margen > 15 ? 'var(--warning)' : 'var(--error)';
        html += `
            <tr style="${r.tieneDatos ? '' : 'opacity: 0.4;'}">
                <td><strong>${r.fecha}</strong></td>
                <td>${r.diaSemana}</td>
                <td>${r.pedidos}</td>
                <td><strong>${r.unidades}</strong></td>
                <td style="color: var(--success);">${r.ventas.toFixed(2)}</td>
                <td>${r.costeMP.toFixed(2)}</td>
                <td>${r.costeMOD.toFixed(2)}</td>
                <td>${r.costeTotal.toFixed(2)}</td>
                <td style="color: ${margenColor}; font-weight: bold;">${r.margen}%</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Exporta los datos de comparativa a CSV
 */
function exportarCSVComparativa() {
    const fechaInicio = document.getElementById('comparativa-fecha-inicio').value;
    const fechaFin = document.getElementById('comparativa-fecha-fin').value;

    if (!fechaInicio || !fechaFin) {
        mostrarNotificacion('Selecciona ambas fechas', 'error');
        return;
    }

    const datos = cargarDatos();
    const resultados = obtenerDatosComparativa(datos, fechaInicio, fechaFin);

    // Crear contenido CSV
    let csv = 'Fecha,Día,Pedidos,Unidades,Ventas (€),Coste MP (€),Coste MOD (€),Coste Total (€),Margen (%)\n';
    resultados.forEach(r => {
        csv += `${r.fecha},${r.diaSemana},${r.pedidos},${r.unidades},${r.ventas.toFixed(2)},${r.costeMP.toFixed(2)},${r.costeMOD.toFixed(2)},${r.costeTotal.toFixed(2)},${r.margen}\n`;
    });

    // Calcular totales para el resumen
    const totalUnidades = resultados.reduce((sum, r) => sum + r.unidades, 0);
    const totalVentas = resultados.reduce((sum, r) => sum + r.ventas, 0);
    const totalCoste = resultados.reduce((sum, r) => sum + r.costeTotal, 0);
    const totalPedidos = resultados.reduce((sum, r) => sum + r.pedidos, 0);
    const diasConDatos = resultados.filter(r => r.tieneDatos).length;
    const mediaUnidades = diasConDatos > 0 ? Math.round(totalUnidades / diasConDatos) : 0;
    const margenTotal = totalVentas > 0 ? Math.round(((totalVentas - totalCoste) / totalVentas) * 10000) / 100 : 0;

    // Añadir resumen al CSV
    csv += '\n\nRESUMEN\n';
    csv += `Días analizados,${resultados.length}\n`;
    csv += `Días con datos,${diasConDatos}\n`;
    csv += `Total Unidades,${totalUnidades}\n`;
    csv += `Media diaria,${mediaUnidades}\n`;
    csv += `Total Pedidos,${totalPedidos}\n`;
    csv += `Total Ventas,${totalVentas.toFixed(2)}\n`;
    csv += `Total Costes,${totalCoste.toFixed(2)}\n`;
    csv += `Margen Período,${margenTotal}%\n`;

    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `comparativa_produccion_${fechaInicio}_a_${fechaFin}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    mostrarNotificacion('CSV exportado correctamente', 'success');
}

// ============================================================
// ACTUALIZAR NAVEGACIÓN PARA INCLUIR LA NUEVA VISTA
// ============================================================

/**
 * Función para actualizar la navegación con la nueva pestaña
 */
function actualizarNavegacionConComparativa() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !document.querySelector('[data-vista="comparativa"]')) {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.dataset.vista = 'comparativa';
        btn.textContent = '📈 Comparativa';
        btn.onclick = function() {
            cambiarVista('comparativa');
            document.querySelector('.nav-links').classList.remove('open');
        };
        navLinks.appendChild(btn);
    }
}

// ============================================================
// ACTUALIZAR FUNCIÓN cambiarVista
// ============================================================

// Sobrescribir la función cambiarVista para incluir la comparativa
const cambiarVistaOriginal = window.cambiarVista;
window.cambiarVista = function(vista) {
    // Actualizar botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.vista === vista);
    });

    // Renderizar la vista correspondiente
    switch (vista) {
        case 'produccion':
            renderizarProduccion();
            break;
        case 'dashboard':
            renderizarDashboard();
            break;
        case 'comparativa':
            renderizarComparativa();
            break;
        case 'clientes':
            renderizarClientes();
            break;
        case 'productos':
            renderizarProductos();
            break;
        case 'configuracion':
            renderizarConfiguracion();
            break;
        default:
            renderizarProduccion();
    }
};

// ============================================================
// INICIALIZACIÓN CON LA NUEVA NAVEGACIÓN
// ============================================================

// Añadir la nueva pestaña después de la inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que la navegación está cargada
    setTimeout(actualizarNavegacionConComparativa, 100);
});
// ============================================================
// CONFIGURACIÓN DE AMASADO - Quality Pizzafresh
// ============================================================
// Esta configuración define todos los tipos de bolas, sus pesos,
// formatos de caja y productos finales asociados.
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

/**
 * Obtiene la lista de tipos de bola disponibles
 * @returns {string[]} - Lista de nombres de tipos de bola
 */
function obtenerTiposBola() {
    return Object.keys(CONFIGURACION_AMASADO);
}

/**
 * Obtiene la configuración completa de un tipo de bola
 * @param {string} tipo - Nombre del tipo de bola
 * @returns {Object|null} - Configuración o null si no existe
 */
function obtenerConfiguracionBola(tipo) {
    return CONFIGURACION_AMASADO[tipo] || null;
}

/**
 * Obtiene la fecha del día siguiente
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha del día siguiente
 */
function obtenerFechaSiguiente(fecha) {
    const fechaObj = new Date(fecha);
    fechaObj.setDate(fechaObj.getDate() + 1);
    return fechaObj.toISOString().split('T')[0];
}

/**
 * Obtiene la hora actual en formato HH:MM
 * @returns {string} - Hora actual
 */
function obtenerHoraActual() {
    const ahora = new Date();
    return ahora.toTimeString().split(' ')[0].substring(0, 5);
}

/**
 * Genera un ID único para una orden de amasado
 * @param {string} fecha - Fecha de la orden
 * @param {number} numero - Número correlativo
 * @returns {string} - ID de la orden
 */
function generarIdOrdenAmasado(fecha, numero) {
    const fechaLimpia = fecha.replace(/-/g, '');
    const numStr = String(numero).padStart(3, '0');
    return `ORD-${fechaLimpia}-${numStr}`;
}
// ============================================================
// SERVICIO DE ÓRDENES DE AMASADO
// ============================================================
// Gestiona el CRUD de órdenes de amasado en localStorage
// ============================================================

/**
 * Obtiene todas las órdenes de amasado
 * @param {Object} datos - Datos completos de la aplicación
 * @returns {Object} - Objeto con todas las órdenes indexadas por fecha
 */
function obtenerOrdenesAmasado(datos) {
    if (!datos.ordenesAmasado) {
        datos.ordenesAmasado = {};
        guardarDatos(datos);
    }
    return datos.ordenesAmasado;
}

/**
 * Obtiene una orden de amasado por fecha
 * Si no existe, crea una nueva orden vacía
 * @param {Object} datos - Datos completos de la aplicación
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Object} - Orden de amasado
 */
function obtenerOrdenAmasado(datos, fecha) {
    const ordenes = obtenerOrdenesAmasado(datos);
    
    if (!ordenes[fecha]) {
        // Contar órdenes existentes para generar ID
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

/**
 * Guarda una orden de amasado en localStorage
 * @param {Object} datos - Datos completos de la aplicación
 * @param {string} fecha - Fecha de la orden
 * @param {Object} orden - Orden de amasado a guardar
 */
function guardarOrdenAmasado(datos, fecha, orden) {
    const ordenes = obtenerOrdenesAmasado(datos);
    orden.updatedAt = new Date().toISOString();
    ordenes[fecha] = orden;
    guardarDatos(datos);
}

/**
 * Elimina una orden de amasado
 * @param {Object} datos - Datos completos de la aplicación
 * @param {string} fecha - Fecha de la orden a eliminar
 * @returns {boolean} - True si se eliminó, false si no existía
 */
function eliminarOrdenAmasado(datos, fecha) {
    const ordenes = obtenerOrdenesAmasado(datos);
    if (ordenes[fecha]) {
        delete ordenes[fecha];
        guardarDatos(datos);
        return true;
    }
    return false;
}

/**
 * Valida que una orden de amasado esté completa
 * @param {Object} orden - Orden de amasado a validar
 * @returns {Object} - { valida: boolean, errores: string[] }
 */
function validarOrdenAmasado(orden) {
    const errores = [];
    
    // Validar operario
    if (!orden.operario || orden.operario.trim() === '') {
        errores.push('El operario es obligatorio');
    }
    
    // Validar líneas
    if (!orden.lineas || orden.lineas.length === 0) {
        errores.push('Debe haber al menos una línea de amasado');
    } else {
        // Validar cada línea
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

/**
 * Aplica una orden de amasado al inventario de producción del día siguiente
 * @param {Object} datos - Datos completos de la aplicación
 * @param {string} fecha - Fecha de la orden de amasado
 * @returns {boolean} - True si se aplicó correctamente
 */
function aplicarOrdenAProduccion(datos, fecha) {
    const ordenes = obtenerOrdenesAmasado(datos);
    const orden = ordenes[fecha];
    
    if (!orden) {
        mostrarNotificacion('No se encontró la orden de amasado', 'error');
        return false;
    }
    
    // Validar que la orden esté completa
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
    
    // Crear producción para el día de uso si no existe
    if (!datos.produccion) datos.produccion = {};
    if (!datos.produccion[fechaUso]) {
        datos.produccion[fechaUso] = {
            inventarioInicial: {},
            horasTrabajadas: 0,
            pedidos: []
        };
    }
    
    // Construir inventario inicial desde la distribución
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
    
    // Aplicar inventario
    datos.produccion[fechaUso].inventarioInicial = inventario;
    
    // Marcar como aplicada
    orden.aplicadoAProduccion = true;
    orden.aplicadoEn = new Date().toISOString();
    
    guardarDatos(datos);
    return true;
}

/**
 * Obtiene el resumen de una orden de amasado
 * @param {Object} orden - Orden de amasado
 * @returns {Object} - Resumen con totales
 */
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
            totalTorres += 1; // Cada línea es una torre
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
// UI - ORDEN DE AMASADO
// ============================================================
// Renderizado y eventos de la vista de orden de amasado
// ============================================================

/**
 * Renderiza la vista de Orden de Amasado
 * Esta es la vista principal para crear y gestionar órdenes
 */
function renderizarOrdenAmasado() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    const tiposBola = obtenerTiposBola();
    const resumen = obtenerResumenOrdenAmasado(orden);
    const validacion = validarOrdenAmasado(orden);
    
    // Calcular estado de asignación
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
        <!-- ======================================= -->
        <!-- VISTA: ORDEN DE AMASADO                 -->
        <!-- ======================================= -->
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
            
            <!-- ======================================= -->
            <!-- DATOS GENERALES                        -->
            <!-- ======================================= -->
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
                        <label>👤 Operario</label>
                        <input type="text" id="operario-amasado" value="${orden.operario || ''}" placeholder="Nombre del operario" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>⏰ Hora Inicio</label>
                        <input type="time" id="hora-inicio" value="${orden.horaInicio || '08:00'}" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                    </div>
                    <div class="form-group">
                        <label>⏰ Hora Fin</label>
                        <input type="time" id="hora-fin" value="${orden.horaFin || ''}" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                    </div>
                    <div class="form-group">
                        <label>🌡️ Temperatura (°C)</label>
                        <input type="number" id="temp-amasado" value="${orden.temperatura || 22}" step="0.5" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                    </div>
                    <div class="form-group">
                        <label>💧 Humedad (%)</label>
                        <input type="number" id="humedad-amasado" value="${orden.humedad || 55}" step="1" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                    </div>
                </div>
            </div>
            
            <!-- ======================================= -->
            <!-- TABLA DE AMASADO                       -->
            <!-- ======================================= -->
            <div class="tabla-container">
                <div class="flex-between mb-10">
                    <h3>📦 Bolas a Amasar</h3>
                    ${!orden.aplicadoAProduccion ? `<button class="btn btn-primary btn-sm" onclick="mostrarModalLineaAmasado()">➕ Añadir Línea</button>` : ''}
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
                        ${!orden.aplicadoAProduccion ? `<button class="btn btn-danger btn-sm" onclick="eliminarLineaAmasado(${index})">🗑️</button>` : ''}
                    </td>
                </tr>
            `;
        });
    }
    
    html += `
                    </tbody>
                </table>
            </div>
            
            <!-- ======================================= -->
            <!-- DISTRIBUCIÓN A PRODUCTOS                -->
            <!-- ======================================= -->
            <div style="margin-top: 20px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div class="flex-between mb-10">
                    <h3>📦 Distribución a Productos Finales</h3>
                    <span style="font-size: 0.9rem; color: ${todasAsignadas ? 'var(--success)' : 'var(--error)'};">
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
                               onchange="actualizarDistribucion(${index}, '${producto}', this.value)"
                               ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                    </div>
                `;
            });
            
            html += `
                    </div>
                    <div style="margin-top: 10px; font-weight: bold; color: ${restante === 0 ? 'var(--success)' : 'var(--error)'};">
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
            
            <!-- ======================================= -->
            <!-- RESUMEN                                -->
            <!-- ======================================= -->
            <div class="resumen-grid" style="margin-top: 20px;">
                <div class="resumen-card">
                    <div class="label">Total Bolas</div>
                    <div class="value primary">${resumen.totalBolas}</div>
                </div>
                <div class="resumen-card">
                    <div class="label">Peso Total</div>
                    <div class="value">${resumen.pesoTotal} kg</div>
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
            
            <!-- ======================================= -->
            <!-- VALIDACIÓN Y BOTONES                    -->
            <!-- ======================================= -->
            ${!orden.aplicadoAProduccion ? `
                <div style="margin-top: 20px; padding: 15px; background: ${validacion.valida ? '#E8F5E9' : '#FFF3E0'}; border-radius: 8px; border-left: 4px solid ${validacion.valida ? 'var(--success)' : 'var(--error)'};">
                    ${validacion.valida ? 
                        '✅ La orden está completa y lista para aplicar a producción' :
                        '❌ ' + validacion.errores.join('. ')
                    }
                </div>
            ` : ''}
            
            <div class="flex gap-10" style="margin-top: 20px; flex-wrap: wrap;">
                ${!orden.aplicadoAProduccion ? `
                    <button class="btn btn-primary" onclick="guardarOrdenAmasado()">💾 Guardar Orden</button>
                    <button class="btn btn-success" onclick="aplicarOrdenAProduccionUI()">📥 Aplicar a Producción</button>
                    <button class="btn btn-danger" onclick="eliminarOrdenAmasado()">🗑️ Eliminar Orden</button>
                ` : `
                    <button class="btn btn-secondary" onclick="renderizarOrdenAmasado()">🔄 Recargar</button>
                    <button class="btn btn-warning" onclick="desaplicarOrdenAmasado()">↩️ Deshacer Aplicación</button>
                `}
                <button class="btn btn-secondary" onclick="exportarOrdenAmasado()">📥 Exportar CSV</button>
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
    
    // Si la orden está aplicada, mostrar mensaje de éxito
    if (orden.aplicadoAProduccion) {
        mostrarNotificacion('✅ Orden aplicada a producción', 'success');
    }
}

// ============================================================
// FUNCIONES DE INTERACCIÓN - ORDEN DE AMASADO
// ============================================================

/**
 * Muestra un modal para añadir una línea de amasado
 * Usa prompt para simplificar (mejorable con modal HTML)
 */
function mostrarModalLineaAmasado() {
    const tipos = obtenerTiposBola();
    
    // Mostrar selector de tipo de bola
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
    
    // Seleccionar tipo de caja
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
    
    // Número de cajas
    const cajasStr = prompt(`Número de cajas (máximo ${configCaja.maxCajas}):`, '1');
    if (!cajasStr) return;
    const cajas = parseInt(cajasStr);
    if (isNaN(cajas) || cajas < 1 || cajas > configCaja.maxCajas) {
        mostrarNotificacion(`Número de cajas inválido (máximo ${configCaja.maxCajas})`, 'error');
        return;
    }
    
    // Bolas por caja
    const bolasStr = prompt(`Bolas por caja (opciones: ${configCaja.opcionesBolas.join(', ')}):`, configCaja.opcionesBolas[0].toString());
    if (!bolasStr) return;
    const bolasPorCaja = parseInt(bolasStr);
    if (isNaN(bolasPorCaja) || !configCaja.opcionesBolas.includes(bolasPorCaja)) {
        mostrarNotificacion(`Bolas por caja inválido (opciones: ${configCaja.opcionesBolas.join(', ')})`, 'error');
        return;
    }
    
    // Crear la línea
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
    
    // Inicializar distribución a 0
    config.productosDestino.forEach(p => {
        nuevaLinea.distribucion[p] = 0;
    });
    
    if (!orden.lineas) orden.lineas = [];
    orden.lineas.push(nuevaLinea);
    guardarDatos(datos);
    renderizarOrdenAmasado();
    mostrarNotificacion('✅ Línea añadida correctamente', 'success');
}

/**
 * Actualiza una línea de amasado en tiempo real
 */
function actualizarLineaAmasado(index, campo, valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (index >= orden.lineas.length) return;
    
    const linea = orden.lineas[index];
    const numValor = parseInt(valor) || 0;
    
    if (campo === 'cajas') {
        // Validar límite
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
    
    // Recalcular total
    linea.total = (linea.cajas || 0) * (linea.bolasPorCaja || 0);
    
    guardarDatos(datos);
    renderizarOrdenAmasado();
}

/**
 * Actualiza la distribución de una línea
 */
function actualizarDistribucion(index, producto, valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (index >= orden.lineas.length) return;
    
    const linea = orden.lineas[index];
    if (!linea.distribucion) linea.distribucion = {};
    linea.distribucion[producto] = parseInt(valor) || 0;
    
    guardarDatos(datos);
    
    // Actualizar solo el resumen de distribución (sin recargar toda la vista)
    // O simplemente recargar
    renderizarOrdenAmasado();
}

/**
 * Elimina una línea de amasado
 */
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

/**
 * Guarda la orden de amasado completa
 */
function guardarOrdenAmasado() {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    // Actualizar campos del formulario
    orden.operario = document.getElementById('operario-amasado')?.value || '';
    orden.horaInicio = document.getElementById('hora-inicio')?.value || '08:00';
    orden.horaFin = document.getElementById('hora-fin')?.value || '';
    orden.temperatura = parseFloat(document.getElementById('temp-amasado')?.value) || 22;
    orden.humedad = parseFloat(document.getElementById('humedad-amasado')?.value) || 55;
    
    // Validar
    const validacion = validarOrdenAmasado(orden);
    if (!validacion.valida) {
        mostrarNotificacion('❌ ' + validacion.errores.join('. '), 'error');
        return;
    }
    
    // Recalcular totales
    const resumen = obtenerResumenOrdenAmasado(orden);
    orden.totalBolas = resumen.totalBolas;
    orden.pesoTotal = resumen.pesoTotal;
    
    guardarOrdenAmasado(datos, fecha, orden);
    mostrarNotificacion('✅ Orden de amasado guardada correctamente', 'success');
    renderizarOrdenAmasado();
}

/**
 * Aplica la orden a producción desde UI
 */
function aplicarOrdenAProduccionUI() {
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const datos = cargarDatos();
    
    // Primero guardar la orden
    guardarOrdenAmasado();
    
    // Luego aplicar
    const resultado = aplicarOrdenAProduccion(datos, fecha);
    if (resultado) {
        mostrarNotificacion(`✅ Orden aplicada a producción del día ${orden.fechaUso}`, 'success');
        renderizarOrdenAmasado();
    }
}

/**
 * Deshace la aplicación de una orden
 */
function desaplicarOrdenAmasado() {
    if (!confirm('⚠️ ¿Estás seguro de deshacer la aplicación de esta orden a producción?')) return;
    
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (!orden.aplicadoAProduccion) {
        mostrarNotificacion('Esta orden no está aplicada a producción', 'warning');
        return;
    }
    
    // Eliminar inventario del día de uso
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

/**
 * Elimina la orden de amasado completa
 */
function eliminarOrdenAmasado() {
    if (!confirm('⚠️ ¿Estás seguro de eliminar esta orden de amasado?')) return;
    
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    
    if (orden.aplicadoAProduccion) {
        if (!confirm('⚠️ Esta orden ya está aplicada a producción. ¿Seguro que quieres eliminarla?')) return;
    }
    
    const resultado = eliminarOrdenAmasado(datos, fecha);
    if (resultado) {
        mostrarNotificacion('✅ Orden eliminada correctamente', 'success');
        renderizarOrdenAmasado();
    }
}

/**
 * Exporta la orden de amasado a CSV
 */
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
    
    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orden_amasado_${fecha}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    mostrarNotificacion('📥 CSV exportado correctamente', 'success');
}
// ============================================================
// NAVEGACIÓN - Actualizar para incluir Orden de Amasado
// ============================================================

/**
 * Actualiza la barra de navegación con todas las vistas incluyendo Amasado
 */
function actualizarNavegacionCompleta() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    // Limpiar solo si es necesario (para evitar duplicados en recargas)
    // navLinks.innerHTML = '';
    
    // Definir todas las vistas
    const vistas = [
        { id: 'produccion', icono: '📋', nombre: 'Producción' },
        { id: 'dashboard', icono: '📊', nombre: 'Dashboard' },
        { id: 'comparativa', icono: '📈', nombre: 'Comparativa' },
        { id: 'amasado', icono: '🔄', nombre: 'Amasado' },
        { id: 'clientes', icono: '👥', nombre: 'Clientes' },
        { id: 'productos', icono: '📦', nombre: 'Productos' },
        { id: 'configuracion', icono: '⚙️', nombre: 'Config' }
    ];
    
    // Crear botones si no existen
    vistas.forEach(v => {
        if (!document.querySelector(`.nav-btn[data-vista="${v.id}"]`)) {
            const btn = document.createElement('button');
            btn.className = 'nav-btn';
            btn.dataset.vista = v.id;
            btn.innerHTML = `${v.icono} ${v.nombre}`;
            btn.onclick = function(e) {
                e.preventDefault();
                cambiarVista(v.id);
                document.querySelector('.nav-links')?.classList.remove('open');
            };
            navLinks.appendChild(btn);
        }
    });
}

/**
 * Sobrescribe la función cambiarVista para incluir la nueva vista
 * Esta función se llama desde la navegación
 */
// Esta parte ya está en el código existente. Solo asegurar que el switch incluya 'amasado'
// La función cambiarVista debe estar definida y actualizada con el nuevo caso

// ============================================================
// INICIALIZACIÓN - Ejecutar al cargar la página
// ============================================================

// Asegurar que la navegación se actualiza después de cargar
// Esta función se llama desde app.js
// document.addEventListener('DOMContentLoaded', function() {
//     setTimeout(actualizarNavegacionCompleta, 100);
//     // ... resto de la inicialización
// });
// Buscar y reemplazar el switch en la función cambiarVista
// Añadir el caso 'amasado':

function cambiarVista(vista) {
    // Actualizar botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.vista === vista);
    });

    // Renderizar la vista correspondiente
    switch (vista) {
        case 'produccion':
            renderizarProduccion();
            break;
        case 'dashboard':
            renderizarDashboard();
            break;
        case 'comparativa':
            renderizarComparativa();
            break;
        case 'amasado':          // ← NUEVO CASO
            renderizarOrdenAmasado();
            break;
        case 'clientes':
            renderizarClientes();
            break;
        case 'productos':
            renderizarProductos();
            break;
        case 'configuracion':
            renderizarConfiguracion();
            break;
        default:
            renderizarProduccion();
    }
}

// Llamar a la función de actualización de navegación al cargar
// Asegurar que la navegación incluye el botón de Amasado
// setTimeout(actualizarNavegacionCompleta, 200);
