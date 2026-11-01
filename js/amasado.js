/**
 * ============================================================
 * MÓDULO: AMASADO (v2 — Fase 1)
 * ============================================================
 * El amasado solo gestiona BOLAS por tipo (sin distribución por producto).
 * El campo tipoBola de cada producto es la fuente de verdad.
 *
 * Dependencias: datos.js, utilidades.js, productos.js
 * ============================================================
 */

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

function generarIdOrdenAmasado(fecha, numero) {
    return `ORD-${fecha.replace(/-/g, '')}-${String(numero).padStart(3, '0')}`;
}

function calcularFechaUsoPorDefecto(fechaAmasado) {
    return obtenerFechaSiguiente(fechaAmasado);
}

// ============================================================
// MIGRACIÓN: asignar tipoBola a productos
// ============================================================

function construirMapaProductoATipoBola() {
    const mapa = {};
    for (const tipoBola in CONFIGURACION_AMASADO) {
        const destino = CONFIGURACION_AMASADO[tipoBola].productosDestino || [];
        destino.forEach(prod => {
            if (!mapa[prod]) mapa[prod] = tipoBola;
        });
    }
    return mapa;
}

function migrarProductosConTipoBola(datos) {
    const mapa = construirMapaProductoATipoBola();
    const sinMapeo = [];
    let migrados = 0;
    let cambios = false;

    datos.productos.forEach(p => {
        if (p.tipoBola) return;
        const tipo = mapa[p.nombre];
        if (tipo) {
            p.tipoBola = tipo;
            migrados++;
            cambios = true;
        } else {
            p.tipoBola = null;
            sinMapeo.push(p.nombre);
            cambios = true;
        }
    });

    if (cambios) guardarDatos(datos);
    if (sinMapeo.length > 0) {
        console.warn('[amasado] Productos sin tipoBola asignado:', sinMapeo);
    }
    return { migrados, sinMapeo };
}

function migrarAmasadosV2(datos) {
    const ordenes = datos.ordenesAmasado || {};
    let cambios = false;
    for (const fecha in ordenes) {
        const orden = ordenes[fecha];
        if (orden.modelo === 'v2') continue;
        (orden.lineas || []).forEach(l => {
            delete l.distribucion;
        });
        orden.modelo = 'v2';
        cambios = true;
    }
    if (cambios) guardarDatos(datos);
    return cambios;
}
// ============================================================
// ACCESO A ÓRDENES
// ============================================================

function obtenerOrdenesAmasado(datos) {
    if (!datos.ordenesAmasado) datos.ordenesAmasado = {};
    return datos.ordenesAmasado;
}

function obtenerOrdenAmasado(datos, fecha) {
    const ordenes = obtenerOrdenesAmasado(datos);
    if (!ordenes[fecha]) {
        ordenes[fecha] = {
            id: generarIdOrdenAmasado(fecha, Object.keys(ordenes).length + 1),
            fechaAmasado: fecha,
            fechaUso: calcularFechaUsoPorDefecto(fecha),
            lineas: [],
            totalBolas: 0,
            pesoTotal: 0,
            aplicadoAProduccion: false,
            temperatura: null,
            humedad: null,
            datosClima: null,
            modelo: 'v2',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    return ordenes[fecha];
}

function buscarOrdenAmasadoPorFechaUso(datos, fecha) {
    const ordenes = datos.ordenesAmasado || {};
    for (const k in ordenes) {
        if (ordenes[k].fechaUso === fecha && ordenes[k].aplicadoAProduccion) {
            return ordenes[k];
        }
    }
    return null;
}

function persistirOrdenAmasado(datos, fecha, orden) {
    orden.updatedAt = new Date().toISOString();
    datos.ordenesAmasado[fecha] = orden;
    return guardarDatos(datos);
}

// ============================================================
// VALIDACIÓN Y RESUMEN
// ============================================================

function validarOrdenAmasado(orden) {
    const errores = [];
    if (!orden) return { valida: false, errores: ['Orden no válida'] };
    if (!Array.isArray(orden.lineas) || orden.lineas.length === 0) {
        return { valida: false, errores: ['Debe haber al menos una línea'] };
    }
    orden.lineas.forEach((l, i) => {
        const n = i + 1;
        if (!l.tipoBola) errores.push(`Línea ${n}: falta tipo de bola`);
        if (!l.peso || l.peso <= 0) errores.push(`Línea ${n}: peso inválido`);
        if (!l.tipoCaja) errores.push(`Línea ${n}: falta tipo de caja`);
        if (!l.cajas || l.cajas < 1) errores.push(`Línea ${n}: cajas debe ser > 0`);
        if (!l.bolasPorCaja || l.bolasPorCaja < 1) errores.push(`Línea ${n}: bolas/caja debe ser > 0`);
    });
    return { valida: errores.length === 0, errores };
}

function obtenerResumenOrdenAmasado(orden) {
    let totalBolas = 0, pesoTotal = 0, totalCajas = 0, totalTorres = 0;
    if (orden?.lineas) {
        orden.lineas.forEach(l => {
            totalBolas += l.total || 0;
            pesoTotal += ((l.total || 0) * l.peso / 1000);
            totalCajas += l.cajas || 0;
            totalTorres += 1;
        });
    }
    return {
        totalBolas,
        pesoTotal: redondear2(pesoTotal),
        totalCajas,
        totalTorres
    };
}

function obtenerStockBolasDeOrden(orden) {
    const stock = {};
    (orden?.lineas || []).forEach(l => {
        const tipo = l.tipoBola;
        if (!tipo) return;
        stock[tipo] = (stock[tipo] || 0) + (l.total || 0);
    });
    return stock;
}

// ============================================================
// CLIMA
// ============================================================

function obtenerClimaGuardamar() {
    const hora = new Date().getHours();
    const mes = new Date().getMonth();
    const tempPorMes = [12, 13, 15, 18, 21, 25, 28, 29, 26, 22, 17, 13];
    let temp = tempPorMes[mes] || 20;
    if (hora >= 6 && hora < 9) temp -= 2;
    else if (hora >= 9 && hora < 12) temp += 1;
    else if (hora >= 12 && hora < 15) temp += 3;
    else if (hora >= 15 && hora < 18) temp += 2;
    else if (hora >= 21 || hora < 6) temp -= 3;
    let hum = 60 + Math.floor(Math.random() * 10);
    if (mes >= 6 && mes <= 9) hum += 10;
    if (hora >= 6 && hora < 9) hum += 5;
    if (hora >= 12 && hora < 15) hum -= 5;
    temp = Math.round(Math.max(5, Math.min(35, temp)) * 10) / 10;
    hum = Math.round(Math.max(40, Math.min(85, hum)));
    return {
        temperatura: temp,
        humedad: hum,
        ciudad: 'Guardamar del Segura',
        provincia: 'Alicante'
    };
}
// ============================================================
// RENDERIZADO
// ============================================================

function renderizarOrdenAmasado(fechaParam) {
    const container = document.getElementById('vista-container');
    container.innerHTML = '<div class="loading">Cargando orden de amasado...</div>';

    setTimeout(() => {
        try {
            const datos = cargarDatos();

            migrarProductosConTipoBola(datos);
            migrarAmasadosV2(datos);

            const fecha = fechaParam
                || document.getElementById('fecha-amasado')?.value
                || obtenerFechaActual();

            const orden = obtenerOrdenAmasado(datos, fecha);
            const resumen = obtenerResumenOrdenAmasado(orden);
            const validacion = validarOrdenAmasado(orden);
            const clima = obtenerClimaGuardamar();
            const fechaAuto = calcularFechaUsoPorDefecto(fecha);
            const fechaUsoEsAuto = orden.fechaUso === fechaAuto;

            let html = `
                <div class="vista active">
                    <div class="vista-header">
                        <div>
                            <h2>🔄 Orden de Amasado</h2>
                            <span class="subtitle">Stock de bolas para el día de uso</span>
                        </div>
                        <div class="flex gap-10" style="align-items: center;">
                            <button class="btn btn-primary btn-sm" onclick="cambiarVista('calculadoraMasa')" title="Abrir calculadora de masa">🧮 Calculadora</button>
                            <span class="subtitle" style="font-weight: bold; color: ${orden.aplicadoAProduccion ? 'var(--success)' : 'var(--warning)'};">
                                ${orden.aplicadoAProduccion ? '✅ Aplicado a producción' : '⏳ Pendiente de aplicar'}
                            </span>
                            ${orden.aplicadoAProduccion ? `<span style="font-size: 0.7rem; display: block; color: #666;">${new Date(orden.aplicadoEn).toLocaleString()}</span>` : ''}
                        </div>
                    </div>

                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                        <div class="form-row">
                            <div class="form-group">
                                <label>📅 Fecha Amasado</label>
                                <input type="date" id="fecha-amasado" value="${fecha}" onchange="renderizarOrdenAmasado(this.value)" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                            </div>
                            <div class="form-group">
                                <label>📅 Uso Previsto ${fechaUsoEsAuto ? '<span style="color: #999; font-weight: normal; font-size: 0.8rem;">(auto)</span>' : '<span style="color: var(--primary); font-weight: normal; font-size: 0.8rem;">(manual)</span>'}</label>
                                <div style="display: flex; gap: 6px; align-items: center;">
                                    <input type="date" id="fecha-uso" value="${orden.fechaUso}"
                                           onchange="cambiarFechaUsoAmasado(this.value)"
                                           style="flex: 1; font-weight: bold;" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                                    ${!orden.aplicadoAProduccion ? `
                                        <button class="btn btn-secondary btn-sm" onclick="restaurarFechaUsoPorDefecto()"
                                                title="Volver al cálculo automático (día siguiente)"
                                                style="padding: 6px 10px; font-size: 0.85rem; white-space: nowrap;">↺ Auto</button>
                                    ` : ''}
                                </div>
                                <div style="font-size: 0.75rem; color: #999; margin-top: 4px;">
                                    ${formatearFechaLarga(orden.fechaUso)}
                                </div>
                            </div>
                            <div class="form-group">
                                <label>🌡️ Temperatura (${clima.ciudad})</label>
                                <input type="text" value="${orden.temperatura || clima.temperatura} °C" readonly style="background: #f0f0f0; font-weight: bold; color: var(--primary);">
                            </div>
                            <div class="form-group">
                                <label>💧 Humedad (${clima.ciudad})</label>
                                <input type="text" value="${orden.humedad || clima.humedad} %" readonly style="background: #f0f0f0; font-weight: bold; color: var(--primary);">
                            </div>
                        </div>
                        <div style="font-size: 0.8rem; color: #999; margin-top: 5px; text-align: center;">
                            🌡️ Clima automático de ${clima.ciudad} (${clima.provincia}) — ${new Date().toLocaleString()}
                        </div>
                    </div>

                    <div class="tabla-container">
                        <div class="flex-between mb-10">
                            <h3>📦 Bolas a Amasar</h3>
                            ${!orden.aplicadoAProduccion ? `
                                <div>
                                    <button class="btn btn-primary btn-sm" onclick="mostrarModalLineaAmasado()">➕ Añadir Línea</button>
                                    <button class="btn btn-success btn-sm" onclick="duplicarTodasLineasAmasado()" style="background: #28a745; margin-left: 4px;">📋 Duplicar Todas</button>
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
                    const cfgCaja = config?.configuraciones.find(c => c.tipoCaja === linea.tipoCaja);

                    html += `
                        <tr>
                            <td><strong>${escaparHTML(linea.tipoBola)}</strong></td>
                            <td>${linea.peso}g</td>
                            <td>${escaparHTML(linea.tipoCaja)}</td>
                            <td>
                                ${orden.aplicadoAProduccion ? linea.cajas : `
                                    <input type="number" min="1" max="${cfgCaja?.maxCajas || 25}"
                                           style="width: 60px;" value="${linea.cajas || 0}"
                                           onchange="actualizarLineaAmasado(${index}, 'cajas', this.value)">
                                `}
                            </td>
                            <td>
                                ${orden.aplicadoAProduccion ? linea.bolasPorCaja : `
                                    <select onchange="actualizarLineaAmasado(${index}, 'bolasPorCaja', this.value)">
                                        ${(cfgCaja?.opcionesBolas || [8, 10]).map(op => `
                                            <option value="${op}" ${op == linea.bolasPorCaja ? 'selected' : ''}>${op}</option>
                                        `).join('')}
                                    </select>
                                `}
                            </td>
                            <td><strong>${total}</strong></td>
                            <td>
                                ${!orden.aplicadoAProduccion ? `
                                    <button class="btn btn-success btn-sm" onclick="duplicarLineaAmasado(${index})" title="Duplicar" style="background: #28a745; margin-right: 4px;">📋</button>
                                    <button class="btn btn-danger btn-sm" onclick="eliminarLineaAmasado(${index})" title="Eliminar">🗑️</button>
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

                    ${!orden.aplicadoAProduccion ? `
                        <div style="margin-top: 20px; padding: 15px; background: ${validacion.valida ? '#E8F5E9' : '#FFF3E0'}; border-radius: 8px; border-left: 4px solid ${validacion.valida ? 'var(--success)' : 'var(--error)'};">
                            ${validacion.valida
                                ? '✅ La orden está completa y lista para aplicar a producción'
                                : '❌ ' + validacion.errores.map(escaparHTML).join('. ')
                            }
                        </div>
                    ` : ''}

                    <div class="flex gap-10" style="margin-top: 20px; flex-wrap: wrap;">
                        ${!orden.aplicadoAProduccion ? `
                            <button class="btn btn-primary" onclick="guardarOrdenAmasado()">💾 Guardar Orden</button>
                            <button class="btn btn-success" onclick="aplicarOrdenAProduccionUI()">📥 Aplicar a Producción</button>
                            <button class="btn btn-danger" onclick="eliminarOrdenAmasado()">🗑️ Eliminar Orden</button>
                            <button class="btn btn-info" onclick="verProduccionDesdeAmasado()" style="background: #17a2b8; color: white;">📋 Ver en Producción</button>
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
                                ℹ️ <strong>Nota:</strong> La orden se aplicará como stock de bolas al día <strong>${formatearFechaLarga(orden.fechaUso)}</strong>.
                                La asignación de bolas a productos se hace desde Producción.
                            </p>
                        </div>
                    `}
                </div>
            `;

            container.innerHTML = html;
            guardarDatos(datos);
        } catch (error) {
            console.error('❌ Error al renderizar orden de amasado:', error);
            container.innerHTML = `
                <div class="vista active">
                    <div class="vista-error">
                        <h3>❌ Error al cargar la orden de amasado</h3>
                        <p>${escaparHTML(error.message)}</p>
                        <button class="btn btn-primary" onclick="renderizarOrdenAmasado()">🔄 Reintentar</button>
                    </div>
                </div>
            `;
        }
    }, 50);
}
// ============================================================
// FECHA DE USO
// ============================================================

function cambiarFechaUsoAmasado(nuevaFecha) {
    if (!nuevaFecha) return;
    const datos = cargarDatos();
    const fechaAmasado = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fechaAmasado);
    if (orden.aplicadoAProduccion) {
        mostrarNotificacion('⚠️ No se puede cambiar: la orden ya está aplicada', 'warning');
        return;
    }
    orden.fechaUso = nuevaFecha;
    persistirOrdenAmasado(datos, fechaAmasado, orden);
    renderizarOrdenAmasado(fechaAmasado);
    mostrarNotificacion(`✅ Fecha de uso actualizada al ${formatearFechaLarga(nuevaFecha)}`, 'success');
}

function restaurarFechaUsoPorDefecto() {
    const datos = cargarDatos();
    const fechaAmasado = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fechaAmasado);
    if (orden.aplicadoAProduccion) {
        mostrarNotificacion('⚠️ No se puede cambiar: la orden ya está aplicada', 'warning');
        return;
    }
    const fechaAuto = calcularFechaUsoPorDefecto(fechaAmasado);
    orden.fechaUso = fechaAuto;
    persistirOrdenAmasado(datos, fechaAmasado, orden);
    renderizarOrdenAmasado(fechaAmasado);
    mostrarNotificacion(`↺ Fecha de uso restaurada al ${formatearFechaLarga(fechaAuto)}`, 'info');
}

// ============================================================
// CRUD DE LÍNEAS
// ============================================================

function mostrarModalLineaAmasado() {
    const tipos = obtenerTiposBola();

    let msg = 'Selecciona el tipo de bola:\n';
    tipos.forEach((t, i) => { msg += `${i+1}. ${t}\n`; });
    msg += '\n0. Cancelar';

    const sel = prompt(msg);
    if (!sel || sel === '0') return;
    const idx = parseInt(sel) - 1;
    if (isNaN(idx) || idx < 0 || idx >= tipos.length) {
        mostrarNotificacion('❌ Selección inválida', 'error');
        return;
    }

    const tipo = tipos[idx];
    const config = obtenerConfiguracionBola(tipo);

    let msgCaja = 'Selecciona tipo de caja:\n';
    config.configuraciones.forEach((c, i) => {
        msgCaja += `${i+1}. ${c.tipoCaja} (max ${c.maxCajas}) — bolas: ${c.opcionesBolas.join(', ')}\n`;
    });
    msgCaja += '\n0. Cancelar';

    const selCaja = prompt(msgCaja);
    if (!selCaja || selCaja === '0') return;
    const cIdx = parseInt(selCaja) - 1;
    if (isNaN(cIdx) || cIdx < 0 || cIdx >= config.configuraciones.length) {
        mostrarNotificacion('❌ Selección inválida', 'error');
        return;
    }
    const cfgCaja = config.configuraciones[cIdx];

    const cajasStr = prompt(`Número de cajas (máx ${cfgCaja.maxCajas}):`, '1');
    if (!cajasStr) return;
    const cajas = parseInt(cajasStr);
    if (isNaN(cajas) || cajas < 1 || cajas > cfgCaja.maxCajas) {
        mostrarNotificacion(`❌ Máx ${cfgCaja.maxCajas} cajas`, 'error');
        return;
    }

    const bolasStr = prompt(`Bolas por caja (${cfgCaja.opcionesBolas.join(', ')}):`, cfgCaja.opcionesBolas[0].toString());
    if (!bolasStr) return;
    const bolas = parseInt(bolasStr);
    if (isNaN(bolas) || !cfgCaja.opcionesBolas.includes(bolas)) {
        mostrarNotificacion(`❌ Opciones: ${cfgCaja.opcionesBolas.join(', ')}`, 'error');
        return;
    }

    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);

    const nuevaLinea = {
        tipoBola: tipo,
        peso: config.peso,
        tipoCaja: cfgCaja.tipoCaja,
        cajas,
        bolasPorCaja: bolas,
        total: cajas * bolas
    };
    orden.lineas.push(nuevaLinea);

    guardarDatos(datos);
    renderizarOrdenAmasado(fecha);
    mostrarNotificacion('✅ Línea añadida', 'success');
}

const actualizarLineaAmasadoDebounce = debounce(function(index, campo, valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    if (index >= orden.lineas.length) return;

    const l = orden.lineas[index];
    const v = parseInt(valor) || 0;

    if (campo === 'cajas') {
        const cfg = obtenerConfiguracionBola(l.tipoBola);
        const cc = cfg?.configuraciones.find(c => c.tipoCaja === l.tipoCaja);
        if (cc && v > cc.maxCajas) {
            mostrarNotificacion(`⚠️ Máx ${cc.maxCajas}`, 'warning');
            return;
        }
        l.cajas = v;
    } else if (campo === 'bolasPorCaja') {
        const cfg = obtenerConfiguracionBola(l.tipoBola);
        const cc = cfg?.configuraciones.find(c => c.tipoCaja === l.tipoCaja);
        if (cc && !cc.opcionesBolas.includes(v)) {
            mostrarNotificacion(`⚠️ Opciones: ${cc.opcionesBolas.join(', ')}`, 'warning');
            return;
        }
        l.bolasPorCaja = v;
    }
    l.total = (l.cajas || 0) * (l.bolasPorCaja || 0);
    guardarDatos(datos);
    renderizarOrdenAmasado(fecha);
}, 300);

function actualizarLineaAmasado(i, c, v) {
    actualizarLineaAmasadoDebounce(i, c, v);
}

function eliminarLineaAmasado(index) {
    if (!confirm('⚠️ ¿Eliminar esta línea?')) return;
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    if (index >= orden.lineas.length) return;
    orden.lineas.splice(index, 1);
    guardarDatos(datos);
    renderizarOrdenAmasado(fecha);
    mostrarNotificacion('✅ Línea eliminada', 'success');
}

function duplicarLineaAmasado(index) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    if (index >= orden.lineas.length) return;
    const copia = clonarProfundo(orden.lineas[index]);
    delete copia.distribucion;
    orden.lineas.splice(index + 1, 0, copia);
    guardarDatos(datos);
    renderizarOrdenAmasado(fecha);
    mostrarNotificacion('✅ Línea duplicada', 'success');
}

function duplicarTodasLineasAmasado() {
    if (!confirm('⚠️ ¿Duplicar todas las líneas?')) return;
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    if (!orden.lineas || orden.lineas.length === 0) {
        mostrarNotificacion('⚠️ No hay líneas', 'warning');
        return;
    }
    const originales = clonarProfundo(orden.lineas);
    originales.forEach(l => {
        delete l.distribucion;
        orden.lineas.push(l);
    });
    guardarDatos(datos);
    renderizarOrdenAmasado(fecha);
    mostrarNotificacion('✅ Líneas duplicadas', 'success');
}
// ============================================================
// GUARDAR / APLICAR / DESAPLICAR / ELIMINAR
// ============================================================

function guardarOrdenAmasado() {
    try {
        const datos = cargarDatos();
        const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
        const orden = obtenerOrdenAmasado(datos, fecha);

        const clima = obtenerClimaGuardamar();
        orden.temperatura = clima.temperatura;
        orden.humedad = clima.humedad;
        orden.datosClima = {
            ciudad: clima.ciudad,
            provincia: clima.provincia,
            fecha: new Date().toISOString()
        };

        const validacion = validarOrdenAmasado(orden);
        if (!validacion.valida) {
            mostrarNotificacion('❌ ' + validacion.errores.join('. '), 'error');
            return;
        }

        const resumen = obtenerResumenOrdenAmasado(orden);
        orden.totalBolas = resumen.totalBolas;
        orden.pesoTotal = resumen.pesoTotal;

        persistirOrdenAmasado(datos, fecha, orden);
        mostrarNotificacion(`✅ Orden guardada (${clima.temperatura}°C, ${clima.humedad}%)`, 'success');
        renderizarOrdenAmasado(fecha);
    } catch (error) {
        console.error('Error al guardar orden:', error);
        mostrarNotificacion('❌ Error: ' + error.message, 'error');
    }
}

function aplicarOrdenAProduccionUI() {
    try {
        const datos = cargarDatos();
        const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
        const orden = obtenerOrdenAmasado(datos, fecha);

        const validacion = validarOrdenAmasado(orden);
        if (!validacion.valida) {
            mostrarNotificacion('❌ ' + validacion.errores.join('. '), 'error');
            return;
        }
        if (orden.aplicadoAProduccion) {
            mostrarNotificacion('⚠️ Ya fue aplicada', 'warning');
            return;
        }

        if (!confirm(`📥 ¿Aplicar esta orden al inventario del ${formatearFechaLarga(orden.fechaUso)}?`)) return;

        const fechaUso = orden.fechaUso;
        if (!datos.produccion[fechaUso]) {
            datos.produccion[fechaUso] = { inventarioInicial: {}, horasTrabajadas: 0, pedidos: [] };
        }

        // v2: stock de bolas por tipo
        const stockBolas = {};
        orden.lineas.forEach(l => {
            const tipo = l.tipoBola;
            if (!tipo) return;
            stockBolas[tipo] = (stockBolas[tipo] || 0) + (l.total || 0);
        });
        datos.produccion[fechaUso].inventarioBolas = stockBolas;

        // Compatibilidad v1: rellenar inventarioInicial por producto usando tipoBola del producto
        const inv = {};
        orden.lineas.forEach(l => {
            const tipo = l.tipoBola;
            if (!tipo) return;
            const totalBolas = l.total || 0;
            // Distribuir bolas entre los productos de ese tipo
            const productosDeEsteTipo = datos.productos.filter(p =>
                p.tipoBola === tipo && p.activo !== false
            );
            if (productosDeEsteTipo.length === 0) return;
            // Reparto simple: a partes iguales
            const porProducto = Math.floor(totalBolas / productosDeEsteTipo.length);
            const resto = totalBolas - porProducto * productosDeEsteTipo.length;
            productosDeEsteTipo.forEach((p, i) => {
                const cant = porProducto + (i < resto ? 1 : 0);
                if (cant > 0) inv[p.nombre] = (inv[p.nombre] || 0) + cant;
            });
        });
        datos.produccion[fechaUso].inventarioInicial = inv;
        datos.produccion[fechaUso].inventarioDesdeAmasado = true;

        orden.aplicadoAProduccion = true;
        orden.aplicadoEn = new Date().toISOString();

        guardarDatos(datos);
        mostrarNotificacion(`✅ Orden aplicada al ${formatearFechaLarga(fechaUso)}`, 'success');
        renderizarOrdenAmasado(fecha);
    } catch (error) {
        console.error('Error al aplicar:', error);
        mostrarNotificacion('❌ Error: ' + error.message, 'error');
    }
}

function desaplicarOrdenAmasado() {
    if (!confirm('⚠️ ¿Deshacer la aplicación a producción?')) return;
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    if (!orden.aplicadoAProduccion) {
        mostrarNotificacion('⚠️ No está aplicada', 'warning');
        return;
    }
    const fechaUso = orden.fechaUso;
    if (datos.produccion?.[fechaUso]) {
        datos.produccion[fechaUso].inventarioInicial = {};
        datos.produccion[fechaUso].inventarioBolas = {};
        delete datos.produccion[fechaUso].inventarioDesdeAmasado;
    }
    orden.aplicadoAProduccion = false;
    delete orden.aplicadoEn;
    guardarDatos(datos);
    mostrarNotificacion('✅ Aplicación deshecha', 'success');
    renderizarOrdenAmasado(fecha);
}

function eliminarOrdenAmasado() {
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const datos = cargarDatos();
    const orden = obtenerOrdenAmasado(datos, fecha);

    let msg = '⚠️ ¿Eliminar esta orden de amasado?';
    if (orden.aplicadoAProduccion) {
        msg = '⚠️ La orden YA está aplicada a producción. ¿Eliminar de todas formas?';
    }
    if (!confirm(msg)) return;

    delete datos.ordenesAmasado[fecha];
    guardarDatos(datos);
    mostrarNotificacion('✅ Orden eliminada', 'success');
    renderizarOrdenAmasado(fecha);
}

function verProduccionDesdeAmasado() {
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const datos = cargarDatos();
    const orden = obtenerOrdenAmasado(datos, fecha);
    if (!orden) return;
    cambiarVista('produccion');
    setTimeout(() => {
        const input = document.getElementById('fecha-produccion');
        if (input) {
            input.value = orden.fechaUso;
            renderizarProduccion();
        }
    }, 100);
}

// ============================================================
// EXPORTAR CSV
// ============================================================

function exportarOrdenAmasado() {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);

    if (!orden.lineas || orden.lineas.length === 0) {
        mostrarNotificacion('⚠️ No hay datos para exportar', 'warning');
        return;
    }

    let csv = 'Orden de Amasado - Quality Pizzafresh\n';
    csv += `Fecha Amasado: ${fecha}\n`;
    csv += `Fecha Uso: ${orden.fechaUso}\n`;
    csv += `Total Bolas: ${orden.totalBolas || 0}\n`;
    csv += `Peso Total: ${orden.pesoTotal || 0} kg\n\n`;
    csv += 'Tipo Bola,Peso,Caja,Cajas,Bolas/Caja,Total Bolas\n';

    orden.lineas.forEach(linea => {
        csv += `${linea.tipoBola},${linea.peso},${linea.tipoCaja},${linea.cajas},${linea.bolasPorCaja},${linea.total}\n`;
    });

    try {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `orden_amasado_${fecha}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        mostrarNotificacion('📥 CSV exportado', 'success');
    } catch (error) {
        console.error('Error al exportar:', error);
        mostrarNotificacion('❌ Error al exportar CSV', 'error');
    }
}
