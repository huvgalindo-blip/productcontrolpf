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
