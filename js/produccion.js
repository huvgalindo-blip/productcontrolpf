/**
 * ============================================================
 * MÓDULO: PRODUCCIÓN
 * ============================================================
 * Responsabilidades:
 *   - Obtener/crear el día de producción
 *   - Inicializar inventario (amasado o herencia del día anterior)
 *   - Calcular ventas diarias, costes y margen
 *   - CRUD de pedidos (añadir, duplicar, eliminar, limpiar)
 *   - Navegación entre días
 *   - Renderizado de la vista de Producción
 * 
 * Dependencias: datos.js, utilidades.js, productos.js, clientes.js
 * ============================================================
 */

// ============================================================
// 1. OBTENER / CREAR DÍA DE PRODUCCIÓN
// ============================================================

/**
 * Devuelve el objeto de producción para una fecha.
 * Si no existe, lo crea con estructura vacía.
 */
function obtenerProduccionDia(datos, fecha) {
    if (!datos.produccion[fecha]) {
        datos.produccion[fecha] = {
            inventarioInicial: {},
            horasTrabajadas: 0,
            pedidos: []
        };
    }
    return datos.produccion[fecha];
}

// ============================================================
// 2. INICIALIZACIÓN DE INVENTARIO
// ============================================================

/**
 * Busca una orden de amasado aplicada cuya fecha de uso sea la fecha dada.
 * Función defensiva: si amasado.js aún no está cargado, devuelve null.
 */
function buscarOrdenAmasadoPorFechaUsoSeguro(datos, fecha) {
    if (typeof buscarOrdenAmasadoPorFechaUso === 'function') {
        return buscarOrdenAmasadoPorFechaUso(datos, fecha);
    }
    const ordenes = datos.ordenesAmasado || {};
    for (const k in ordenes) {
        if (ordenes[k].fechaUso === fecha && ordenes[k].aplicadoAProduccion) {
            return ordenes[k];
        }
    }
    return null;
}

/**
 * Inicializa el inventario de un día si está vacío.
 * Orden de preferencia:
 *   1. Inventario ya existente (no tocar)
 *   2. Orden de amasado aplicada cuya fechaUso = fecha
 *   3. Heredar inventarioFinal del día anterior
 *   4. Cero para todos los productos activos
 */
function inicializarInventario(datos, fecha) {
    const productos = obtenerProductosActivos(datos);
    const produccion = obtenerProduccionDia(datos, fecha);

    // 1. Si ya hay inventario, respetarlo
    if (produccion.inventarioInicial && Object.keys(produccion.inventarioInicial).length > 0) {
        return produccion.inventarioInicial;
    }

    // 2. Buscar orden de amasado aplicada
    const ordenAmasado = buscarOrdenAmasadoPorFechaUsoSeguro(datos, fecha);
    if (ordenAmasado) {
        const inv = {};
        ordenAmasado.lineas.forEach(linea => {
            if (linea.distribucion) {
                Object.keys(linea.distribucion).forEach(prod => {
                    const c = linea.distribucion[prod] || 0;
                    if (c > 0) inv[prod] = (inv[prod] || 0) + c;
                });
            }
        });
        produccion.inventarioInicial = inv;
        produccion.inventarioDesdeAmasado = true;
        guardarDatos(datos);
        return inv;
    }

    // 3. Heredar del día anterior
    const fechaAnt = new Date(fecha);
    fechaAnt.setDate(fechaAnt.getDate() - 1);
    const fechaAntStr = fechaAnt.toISOString().split('T')[0];
    const prodAnt = datos.produccion[fechaAntStr];

    if (prodAnt && prodAnt.inventarioFinal) {
        produccion.inventarioInicial = prodAnt.inventarioFinal;
        guardarDatos(datos);
        return prodAnt.inventarioFinal;
    }

    // 4. Empezar de cero
    const inv = {};
    productos.forEach(p => { inv[p.nombre] = 0; });
    produccion.inventarioInicial = inv;
    guardarDatos(datos);
    return inv;
}

// ============================================================
// 3. CÁLCULOS DE PRODUCCIÓN
// ============================================================

function calcularVentasDiarias(pedidos) {
    const ventas = {};
    if (!Array.isArray(pedidos)) return ventas;
    pedidos.forEach(p => {
        if (p.productos && typeof p.productos === 'object') {
            Object.keys(p.productos).forEach(n => {
                const c = parseFloat(p.productos[n]) || 0;
                if (c > 0) ventas[n] = (ventas[n] || 0) + c;
            });
        }
    });
    return ventas;
}

function calcularInventarioFinal(inv, ventas) {
    const final = {};
    const todos = new Set([...Object.keys(inv || {}), ...Object.keys(ventas || {})]);
    todos.forEach(n => {
        final[n] = (parseFloat(inv?.[n]) || 0) - (parseFloat(ventas?.[n]) || 0);
    });
    return final;
}

function calcularCosteMateriaPrima(datos, ventas) {
    let total = 0;
    Object.keys(ventas || {}).forEach(n => {
        total += (parseFloat(ventas[n]) || 0) * obtenerPrecioCosto(datos, n);
    });
    return redondear2(total);
}

function calcularVentasGeneradas(datos, ventas) {
    let total = 0;
    Object.keys(ventas || {}).forEach(n => {
        total += (parseFloat(ventas[n]) || 0) * obtenerPrecioVenta(datos, n);
    });
    return redondear2(total);
}

function calcularMargen(ventas, coste) {
    if (ventas === 0) return 0;
    return Math.round(((ventas - coste) / ventas) * 10000) / 100;
}

function calcularTotalPedido(productos) {
    let total = 0;
    if (productos && typeof productos === 'object') {
        Object.keys(productos).forEach(n => {
            total += parseFloat(productos[n]) || 0;
        });
    }
    return total;
}

// ============================================================
// 4. RENDERIZADO DE LA VISTA PRODUCCIÓN
// ============================================================

/**
 * Renderiza la vista completa de producción diaria.
 * 
 * @param {string} fechaParam - (Opcional) Fecha en formato YYYY-MM-DD.
 *                              Si no se pasa, se lee del DOM o se usa hoy.
 *                              IMPORTANTE: se pasa desde los onchange de los
 *                              inputs y desde las funciones de navegación
 *                              para evitar que el re-render pierda la fecha.
 */
function renderizarProduccion(fechaParam) {
    const container = document.getElementById('vista-container');
    container.innerHTML = '<div class="loading">Cargando producción...</div>';

    setTimeout(() => {
        try {
            const datos = cargarDatos();

            // Prioridad: parámetro > input del DOM > hoy
            const fecha = fechaParam
                || document.getElementById('fecha-produccion')?.value
                || obtenerFechaActual();

            // Crear el día si no existe
            if (!datos.produccion[fecha]) {
                datos.produccion[fecha] = {
                    inventarioInicial: {},
                    horasTrabajadas: 0,
                    pedidos: []
                };
            }

            const produccion = obtenerProduccionDia(datos, fecha);
            const productosActivos = obtenerProductosActivos(datos);
            const clientesActivos = obtenerClientesActivos(datos);

            // Inicializar inventario si está vacío
            if (!produccion.inventarioInicial || Object.keys(produccion.inventarioInicial).length === 0) {
                inicializarInventario(datos, fecha);
            }

            // Verificar si hay orden de amasado aplicada
            const ordenAmasado = buscarOrdenAmasadoPorFechaUsoSeguro(datos, fecha);
            const esInventarioAmasado = produccion.inventarioDesdeAmasado || !!ordenAmasado;

            // Cálculos
            const ventasDiarias = calcularVentasDiarias(produccion.pedidos);
            const costeMP = calcularCosteMateriaPrima(datos, ventasDiarias);
            const costeMOD = redondear2((produccion.horasTrabajadas || 0) * datos.configuracion.costeManoObraHora);
            const ventasGen = calcularVentasGeneradas(datos, ventasDiarias);
            const costeTotal = redondear2(costeMP + costeMOD);
            const margen = calcularMargen(ventasGen, costeTotal);

            let html = `
                <div class="vista active">
                    <div class="vista-header">
                        <div>
                            <h2>📋 Producción Diaria</h2>
                            <span class="subtitle">${formatearFechaLarga(fecha)}</span>
                            ${esInventarioAmasado ? `<span style="background: #d4edda; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem; color: #155724; margin-left: 10px;">📦 Inventario desde Amasado</span>` : ''}
                        </div>
                        <div class="flex gap-10">
                            <input type="date" id="fecha-produccion" value="${fecha}" onchange="cambiarFechaProduccion(this.value)">
                            <button class="btn btn-secondary btn-sm" onclick="irDiaAnterior()" title="Día anterior">◀</button>
                            <button class="btn btn-secondary btn-sm" onclick="irDiaSiguiente()" title="Día siguiente">▶</button>
                            <button class="btn btn-primary btn-sm" onclick="irHoy()" title="Ir a hoy">Hoy</button>
                            <button class="btn btn-success btn-sm" onclick="irDiaAmasado()" title="Ir a la fecha de uso del amasado" style="background: #28a745;">🔄 Amasado</button>
                        </div>
                    </div>

                    <div class="tabla-container">
                        <div class="flex-between mb-10">
                            <span><strong>${productosActivos.length}</strong> productos activos | <strong>${produccion.pedidos.length}</strong> pedidos</span>
                            <div>
                                <button class="btn btn-primary btn-sm" onclick="añadirFilaPedido()">➕ Añadir fila</button>
                                <button class="btn btn-secondary btn-sm" onclick="limpiarPedidosFinalizados()" style="margin-left: 5px;">🧹 Limpiar finalizados</button>
                            </div>
                        </div>
                        <table id="tabla-pedidos">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Cliente</th>
                                    ${productosActivos.map(p => `<th title="${escaparHTML(p.nombre)}">${escaparHTML(p.nombre)}</th>`).join('')}
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
                                            ${escaparHTML(c.codigo)} - ${escaparHTML(c.nombre)}
                                        </option>
                                    `).join('')}
                                </select>
                            </td>
                            ${productosActivos.map(p => `
                                <td>
                                    <input type="number" min="0" step="1"
                                           class="cantidad-input"
                                           data-index="${index}"
                                           data-producto="${escaparHTML(p.nombre)}"
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
                                <button class="btn btn-danger btn-sm" onclick="eliminarFilaPedido(${index})" title="Eliminar fila">🗑️</button>
                                <button class="btn btn-secondary btn-sm" onclick="duplicarFilaPedido(${index})" title="Duplicar fila" style="margin-left: 5px;">📋</button>
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
                            <div class="value">${sumaValores(ventasDiarias)}</div>
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
                            <td><strong>${escaparHTML(nombre)}</strong></td>
                            <td>
                                <input type="number" min="0" step="1"
                                       style="width: 80px; padding: 4px; border: 1px solid #ddd; border-radius: 4px;"
                                       value="${inicial}"
                                       data-producto="${escaparHTML(nombre)}"
                                       onchange="actualizarInventarioInicial('${escaparHTML(nombre).replace(/'/g, "\\'")}', this.value)">
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
        } catch (error) {
            console.error('❌ Error al renderizar producción:', error);
            container.innerHTML = `
                <div class="vista active">
                    <div class="vista-error">
                        <h3>❌ Error al cargar la producción</h3>
                        <p>${escaparHTML(error.message)}</p>
                        <button class="btn btn-primary" onclick="renderizarProduccion()">🔄 Reintentar</button>
                    </div>
                </div>
            `;
        }
    }, 50);
}

// ============================================================
// 5. NAVEGACIÓN ENTRE DÍAS (CORREGIDA)
// ============================================================

/**
 * Cambia la fecha de producción y re-renderiza con la nueva fecha.
 * Se dispara desde el onchange del input #fecha-produccion.
 * 
 * @param {string} fecha - Fecha seleccionada (YYYY-MM-DD)
 */
function cambiarFechaProduccion(fecha) {
    if (!fecha) return;
    renderizarProduccion(fecha);
}

/**
 * Retrocede un día.
 */
function irDiaAnterior() {
    const input = document.getElementById('fecha-produccion');
    if (!input) return;
    const d = new Date(input.value);
    d.setDate(d.getDate() - 1);
    const nuevaFecha = d.toISOString().split('T')[0];
    renderizarProduccion(nuevaFecha);
}

/**
 * Avanza un día.
 */
function irDiaSiguiente() {
    const input = document.getElementById('fecha-produccion');
    if (!input) return;
    const d = new Date(input.value);
    d.setDate(d.getDate() + 1);
    const nuevaFecha = d.toISOString().split('T')[0];
    renderizarProduccion(nuevaFecha);
}

/**
 * Vuelve al día actual.
 */
function irHoy() {
    renderizarProduccion(obtenerFechaActual());
}

/**
 * Va a la fecha de uso de la orden de amasado activa.
 * Busca la orden más reciente que tenga una fecha de uso futura.
 */
function irDiaAmasado() {
    const datos = cargarDatos();
    const ordenes = datos.ordenesAmasado || {};
    const hoy = obtenerFechaActual();

    // Buscar la orden aplicada cuya fechaUso sea >= hoy, la más próxima
    let ordenObjetivo = null;
    Object.keys(ordenes).forEach(fechaOrden => {
        const orden = ordenes[fechaOrden];
        if (orden.aplicadoAProduccion && orden.fechaUso >= hoy) {
            if (!ordenObjetivo || orden.fechaUso < ordenObjetivo.fechaUso) {
                ordenObjetivo = orden;
            }
        }
    });

    if (!ordenObjetivo) {
        mostrarNotificacion('⚠️ No hay órdenes de amasado aplicadas recientes', 'warning');
        return;
    }

    renderizarProduccion(ordenObjetivo.fechaUso);
    mostrarNotificacion(`📅 Mostrando producción del ${formatearFechaLarga(ordenObjetivo.fechaUso)}`, 'info');
}

// ============================================================
// 6. CRUD DE PEDIDOS
// ============================================================

function añadirFilaPedido() {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    const productos = {};
    obtenerProductosActivos(datos).forEach(p => {
        productos[p.nombre] = 0;
    });

    produccion.pedidos.push({
        id: `P${String(produccion.pedidos.length + 1).padStart(3, '0')}`,
        clienteId: null,
        productos,
        finalizado: false,
        lote: '',
        caducidad: '',
        createdAt: new Date().toISOString()
    });

    guardarDatos(datos);
    renderizarProduccion(fecha);
    mostrarNotificacion('✅ Fila añadida', 'success');
}

function duplicarFilaPedido(index) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    if (index < 0 || index >= produccion.pedidos.length) return;

    const original = produccion.pedidos[index];
    const copia = {
        id: `P${String(produccion.pedidos.length + 1).padStart(3, '0')}`,
        clienteId: original.clienteId,
        productos: Object.assign({}, original.productos),
        finalizado: false,
        lote: '',
        caducidad: '',
        createdAt: new Date().toISOString()
    };

    produccion.pedidos.splice(index + 1, 0, copia);
    guardarDatos(datos);
    renderizarProduccion(fecha);
    mostrarNotificacion('✅ Fila duplicada', 'success');
}

function eliminarFilaPedido(index) {
    if (!confirm('⚠️ ¿Eliminar esta fila?')) return;

    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    if (index >= 0 && index < produccion.pedidos.length) {
        produccion.pedidos.splice(index, 1);
        guardarDatos(datos);
        renderizarProduccion(fecha);
        mostrarNotificacion('✅ Fila eliminada', 'success');
    }
}

function limpiarPedidosFinalizados() {
    if (!confirm('⚠️ ¿Eliminar todos los pedidos finalizados?')) return;

    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    const antes = produccion.pedidos.length;
    produccion.pedidos = produccion.pedidos.filter(p => !p.finalizado);
    const eliminados = antes - produccion.pedidos.length;

    if (eliminados === 0) {
        mostrarNotificacion('ℹ️ No hay pedidos finalizados', 'info');
        return;
    }

    guardarDatos(datos);
    renderizarProduccion(fecha);
    mostrarNotificacion(`✅ ${eliminados} pedidos finalizados eliminados`, 'success');
}

function actualizarPedido(index) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    if (index >= produccion.pedidos.length) return;

    const fila = document.querySelector(`#tabla-pedidos tbody tr:nth-child(${index + 1})`);
    if (!fila) return;

    const select = fila.querySelector('.cliente-select');
    if (select) {
        produccion.pedidos[index].clienteId = parseInt(select.value) || null;
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
    renderizarProduccion(fecha);
}

// ============================================================
// 7. ACTUALIZACIONES DE CAMPOS DEL DÍA
// ============================================================

function guardarHorasTrabajadas(valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);
    produccion.horasTrabajadas = aDecimal(valor);
    guardarDatos(datos);
    renderizarProduccion(fecha);
}

function actualizarInventarioInicial(producto, valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-produccion')?.value || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    if (!produccion.inventarioInicial) produccion.inventarioInicial = {};
    produccion.inventarioInicial[producto] = aEntero(valor);
    guardarDatos(datos);
    renderizarProduccion(fecha);
}
