/**
 * ============================================================
 * MÓDULO: PRODUCCIÓN (v4.5 - Categorías en Pedidos)
 * ============================================================
 */

let fechaActualProduccion = null;

// ... (El resto de funciones de cálculo se mantienen igual) ...

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

function inicializarInventario(datos, fecha) {
    const produccion = obtenerProduccionDia(datos, fecha);
    if (!produccion.inventarioInicial) {
        produccion.inventarioInicial = {};
    }
    return produccion.inventarioInicial;
}

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

function calcularTotalPedido(productos) {
    let total = 0;
    if (productos && typeof productos === 'object') {
        Object.keys(productos).forEach(n => {
            total += parseFloat(productos[n]) || 0;
        });
    }
    return total;
}

function obtenerStockBolasInicial(datos, fecha) {
    const produccion = obtenerProduccionDia(datos, fecha);

    if (produccion.inventarioBolas && Object.keys(produccion.inventarioBolas).length > 0) {
        return { ...produccion.inventarioBolas };
    }

    const ordenAmasado = buscarOrdenAmasadoPorFechaUsoSeguro(datos, fecha);
    if (ordenAmasado && typeof obtenerStockBolasDeOrden === 'function') {
        const stock = obtenerStockBolasDeOrden(ordenAmasado);
        produccion.inventarioBolas = stock;
        produccion.inventarioDesdeAmasado = true;
        guardarDatos(datos);
        return { ...stock };
    }

    const fechaAnt = new Date(fecha);
    fechaAnt.setDate(fechaAnt.getDate() - 1);
    const fechaAntStr = fechaAnt.toISOString().split('T')[0];
    const prodAnt = datos.produccion[fechaAntStr];
    if (prodAnt && prodAnt.inventarioBolas) {
        produccion.inventarioBolas = { ...prodAnt.inventarioBolas };
        guardarDatos(datos);
        return { ...produccion.inventarioBolas };
    }

    return {};
}

function calcularConsumoBolas(datos, fecha) {
    const produccion = obtenerProduccionDia(datos, fecha);
    const consumo = {};

    (produccion.pedidos || []).forEach(pedido => {
        if (!pedido.productos) return;
        Object.keys(pedido.productos).forEach(nombreProd => {
            const cant = parseFloat(pedido.productos[nombreProd]) || 0;
            if (cant <= 0) return;
            const producto = datos.productos.find(p => p.nombre === nombreProd);
            const tipo = producto?.tipoBola;
            if (!tipo) return;
            consumo[tipo] = (consumo[tipo] || 0) + cant;
        });
    });

    return consumo;
}

function calcularEstadoStockBolas(datos, fecha) {
    const inicial = obtenerStockBolasInicial(datos, fecha);
    const consumo = calcularConsumoBolas(datos, fecha);
    const tipos = new Set([...Object.keys(inicial), ...Object.keys(consumo)]);

    const resultado = [];
    tipos.forEach(tipo => {
        const ini = inicial[tipo] || 0;
        const con = consumo[tipo] || 0;
        const rest = ini - con;
        resultado.push({
            tipo,
            inicial: ini,
            consumido: con,
            restante: rest,
            deficit: rest < 0
        });
    });

    resultado.sort((a, b) => {
        if (a.deficit !== b.deficit) return a.deficit ? -1 : 1;
        return a.tipo.localeCompare(b.tipo);
    });

    return resultado;
}

function renderizarProduccion(fechaParam) {
    const container = document.getElementById('vista-container');
    container.innerHTML = '<div class="loading">Cargando producción...</div>';

    setTimeout(() => {
        try {
            const datos = cargarDatos();
            
            const fecha = fechaParam
                || fechaActualProduccion
                || document.getElementById('fecha-produccion')?.value
                || obtenerFechaActual();
                
            fechaActualProduccion = fecha;

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

            inicializarInventario(datos, fecha);

            const ordenAmasado = buscarOrdenAmasadoPorFechaUsoSeguro(datos, fecha);
            const esInventarioAmasado = produccion.inventarioDesdeAmasado || !!ordenAmasado;

            const ventasDiarias = calcularVentasDiarias(produccion.pedidos);
            const estadoBolas = calcularEstadoStockBolas(datos, fecha);
            const hayDeficit = estadoBolas.some(f => f.deficit);

            const totalPedidos = produccion.pedidos.length;
            const pedidosFinalizados = produccion.pedidos.filter(p => p.finalizado).length;
            const unidadesProducidas = sumaValores(ventasDiarias);

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

                    ${hayDeficit ? `
                        <div style="margin-bottom: 20px; padding: 15px; background: #FFEBEE; border-left: 4px solid var(--error); border-radius: 8px; color: #C62828;">
                            <strong>⚠️ ALERTA DE STOCK:</strong> Te has pasado de las bolas disponibles. 
                            Revisa los pedidos, ya que no hay suficiente masa para producir todo lo solicitado.
                        </div>
                    ` : ''}

                    <div class="tabla-container">
                        <div class="flex-between mb-10">
                            <span><strong>${productosActivos.length}</strong> productos activos</span>
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
                    const clienteObj = datos.clientes.find(c => c.id === pedido.clienteId);
                    
                    let catColor = '#f5f5f5';
                    let catTextColor = '#333';
                    if (clienteObj) {
                        if (clienteObj.categoria === 'Envío 24 horas') { catColor = '#E3F2FD'; catTextColor = '#1565C0'; }
                        if (clienteObj.categoria === 'Envío refrigerado - congelado') { catColor = '#E0F7FA'; catTextColor = '#00695C'; }
                        if (clienteObj.categoria === 'Distribución propia') { catColor = '#FFF3E0'; catTextColor = '#E65100'; }
                    }

                    const catHTML = clienteObj && clienteObj.categoria 
                        ? `<div style="font-size: 0.7rem; margin-top: 4px;"><span style="background: ${catColor}; color: ${catTextColor}; padding: 2px 6px; border-radius: 4px; white-space: nowrap;">${escaparHTML(clienteObj.categoria)}</span></div>` 
                        : '';

                    html += `
                        <tr class="${finalizado ? 'finalizado' : ''}" data-fila-index="${index}">
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
                                ${catHTML}
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
                            <td class="total-cell" data-total-index="${index}">${totalPedido}</td>
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

                    <div class="vista-header" style="margin-top: 10px;">
                        <h3>📦 Inventario (Solo productos con pedidos)</h3>
                    </div>
                    <div class="tabla-container">
                        <table id="tabla-inventario">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Producido</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            const productosConPedidos = Object.keys(ventasDiarias).filter(prod => ventasDiarias[prod] > 0);

            if (productosConPedidos.length === 0) {
                html += `
                    <tr>
                        <td colspan="2" class="text-center" style="padding: 20px; color: #999;">
                            No hay productos pedidos todavía. Añade un pedido arriba.
                        </td>
                    </tr>
                `;
            } else {
                productosConPedidos.forEach(nombre => {
                    const cant = ventasDiarias[nombre];
                    html += `
                        <tr>
                            <td><strong>${escaparHTML(nombre)}</strong></td>
                            <td style="font-weight: bold; color: var(--primary); font-size: 1.1rem;">${cant} uds</td>
                        </tr>
                    `;
                });
            }

            html += `
                            </tbody>
                        </table>
                    </div>

                    <div class="vista-header" style="margin-top: 20px;">
                        <h3>🍕 Stock de Bolas</h3>
                    </div>
                    <div class="tabla-container">
                        <table id="tabla-stock-bolas">
                            <thead>
                                <tr>
                                    <th>Tipo Bola</th>
                                    <th>Inicial</th>
                                    <th>Consumido</th>
                                    <th>Restante</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            if (estadoBolas.length === 0) {
                html += `
                    <tr>
                        <td colspan="4" class="text-center" style="padding: 20px; color: #999;">
                            Sin stock de bolas para este día (aplica una orden de amasado)
                        </td>
                    </tr>
                `;
            } else {
                estadoBolas.forEach(fila => {
                    const colorFila = fila.deficit ? 'background: #FFEBEE;' : '';
                    const colorRestante = fila.deficit
                        ? 'color: var(--error); font-weight: bold; font-size: 1.1rem;'
                        : fila.restante === 0
                            ? 'color: var(--warning); font-weight: bold;'
                            : 'color: var(--success); font-weight: bold;';

                    html += `
                        <tr style="${colorFila}">
                            <td><strong>${escaparHTML(fila.tipo)}</strong></td>
                            <td>${fila.inicial}</td>
                            <td>${fila.consumido}</td>
                            <td style="${colorRestante}">
                                ${fila.restante}
                                ${fila.deficit ? ' ⚠️ FALTAN BOLAS' : ''}
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
                        <h3>📊 Resumen de Producción</h3>
                    </div>

                    <div class="resumen-grid">
                        <div class="resumen-card">
                            <div class="label">Total Pedidos</div>
                            <div class="value primary">${totalPedidos}</div>
                            <div style="font-size: 0.8rem; color: var(--text-light); margin-top: 5px;">
                                (${pedidosFinalizados} finalizados)
                            </div>
                        </div>
                        <div class="resumen-card">
                            <div class="label">Unidades a Producir</div>
                            <div class="value success">${unidadesProducidas} uds</div>
                        </div>
                    </div>

                    <div class="vista-header" style="margin-top: 15px;">
                        <h4>📦 Desglose de Cajas</h4>
                    </div>
                    <div class="tabla-container">
                        <table style="width: 100%; max-width: 600px;">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th style="text-align: center;">Cajas Completas</th>
                                    <th style="text-align: center;">Sueltas</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productosConPedidos.map(nombre => {
                                    const cant = ventasDiarias[nombre];
                                    
                                    const prodInfo = datos.productos.find(p => p.nombre === nombre);
                                    const udsPorCaja = prodInfo?.unidadesPorCaja || 10; 

                                    const cajas = Math.floor(cant / udsPorCaja);
                                    const sueltas = cant % udsPorCaja;
                                    return `
                                        <tr>
                                            <td><strong>${escaparHTML(nombre)}</strong> <small style="color:#999;">(${udsPorCaja} uds/caja)</small></td>
                                            <td style="text-align: center; font-weight: bold;">${cajas}</td>
                                            <td style="text-align: center; color: ${sueltas > 0 ? 'var(--warning)' : '#999'};">${sueltas}</td>
                                        </tr>
                                    `;
                                }).join('')}
                                ${productosConPedidos.length === 0 ? `<tr><td colspan="3" class="text-center" style="padding: 20px; color: #999;">No hay pedidos</td></tr>` : ''}
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

// ... (El resto de funciones: actualizarVistaSinReRender, cambiarFechaProduccion, etc., se mantienen exactamente igual) ...

function actualizarVistaSinReRender() {
    renderizarProduccion();
}

function cambiarFechaProduccion(fecha) {
    if (!fecha) return;
    fechaActualProduccion = fecha;
    renderizarProduccion(fecha);
}

function irDiaAnterior() {
    const input = document.getElementById('fecha-produccion');
    if (!input) return;
    const d = new Date(input.value);
    d.setDate(d.getDate() - 1);
    const fecha = d.toISOString().split('T')[0];
    fechaActualProduccion = fecha;
    renderizarProduccion(fecha);
}

function irDiaSiguiente() {
    const input = document.getElementById('fecha-produccion');
    if (!input) return;
    const d = new Date(input.value);
    d.setDate(d.getDate() + 1);
    const fecha = d.toISOString().split('T')[0];
    fechaActualProduccion = fecha;
    renderizarProduccion(fecha);
}

function irHoy() {
    const fecha = obtenerFechaActual();
    fechaActualProduccion = fecha;
    renderizarProduccion(fecha);
}

function irDiaAmasado() {
    const datos = cargarDatos();
    const ordenes = datos.ordenesAmasado || {};
    const hoy = obtenerFechaActual();

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

    fechaActualProduccion = ordenObjetivo.fechaUso;
    renderizarProduccion(ordenObjetivo.fechaUso);
    mostrarNotificacion(`📅 Mostrando producción del ${formatearFechaLarga(ordenObjetivo.fechaUso)}`, 'info');
}

function añadirFilaPedido() {
    const datos = cargarDatos();
    const fecha = fechaActualProduccion || obtenerFechaActual();
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
    const fecha = fechaActualProduccion || obtenerFechaActual();
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
    const fecha = fechaActualProduccion || obtenerFechaActual();
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
    const fecha = fechaActualProduccion || obtenerFechaActual();
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
    const fecha = fechaActualProduccion || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);

    if (index >= produccion.pedidos.length) return;

    const fila = document.querySelector(`#tabla-pedidos tbody tr[data-fila-index="${index}"]`);
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
    actualizarVistaSinReRender(); 
}

function guardarHorasTrabajadas(valor) {
    const datos = cargarDatos();
    const fecha = fechaActualProduccion || obtenerFechaActual();
    const produccion = obtenerProduccionDia(datos, fecha);
    produccion.horasTrabajadas = aDecimal(valor);
    guardarDatos(datos);
    actualizarVistaSinReRender();
}
