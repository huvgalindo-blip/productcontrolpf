/**
 * ============================================================
 * MÓDULO: AMASADO
 * ============================================================
 * Responsabilidades:
 *   - Configuración de tipos de bola (9 tipos)
 *   - CRUD de órdenes de amasado
 *   - Distribución de bolas a productos finales
 *   - Clima automático (Guardamar del Segura)
 *   - Aplicación a producción (inventario del día siguiente)
 *   - Renderizado completo de la vista
 * 
 * Dependencias: datos.js, utilidades.js
 * ============================================================
 */

// ============================================================
// 1. CONFIGURACIÓN DE AMASADO
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

function generarIdOrdenAmasado(fecha, numero) {
    return `ORD-${fecha.replace(/-/g, '')}-${String(numero).padStart(3, '0')}`;
}

// ============================================================
// 2. ACCESO A ÓRDENES
// ============================================================

/**
 * Devuelve el objeto de todas las órdenes de amasado.
 */
function obtenerOrdenesAmasado(datos) {
    if (!datos.ordenesAmasado) datos.ordenesAmasado = {};
    return datos.ordenesAmasado;
}

/**
 * Devuelve la orden de amasado para una fecha.
 * Si no existe, la crea vacía.
 */
function obtenerOrdenAmasado(datos, fecha) {
    const ordenes = obtenerOrdenesAmasado(datos);
    if (!ordenes[fecha]) {
        ordenes[fecha] = {
            id: generarIdOrdenAmasado(fecha, Object.keys(ordenes).length + 1),
            fechaAmasado: fecha,
            fechaUso: obtenerFechaSiguiente(fecha),
            lineas: [],
            totalBolas: 0,
            pesoTotal: 0,
            aplicadoAProduccion: false,
            temperatura: null,
            humedad: null,
            datosClima: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    return ordenes[fecha];
}

/**
 * Busca una orden aplicada a producción cuya fecha de uso coincida.
 * Usada por produccion.js para inicializar el inventario del día.
 */
function buscarOrdenAmasadoPorFechaUso(datos, fecha) {
    const ordenes = datos.ordenesAmasado || {};
    for (const k in ordenes) {
        if (ordenes[k].fechaUso === fecha && ordenes[k].aplicadoAProduccion) {
            return ordenes[k];
        }
    }
    return null;
}

/**
 * Guarda una orden en el conjunto y actualiza updatedAt.
 */
function persistirOrdenAmasado(datos, fecha, orden) {
    orden.updatedAt = new Date().toISOString();
    datos.ordenesAmasado[fecha] = orden;
    return guardarDatos(datos);
}

// ============================================================
// 3. VALIDACIÓN
// ============================================================

/**
 * Valida una orden de amasado. Devuelve { valida, errores }.
 */
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
        if (l.cajas < 1) errores.push(`Línea ${n}: cajas debe ser > 0`);
        if (l.bolasPorCaja < 1) errores.push(`Línea ${n}: bolas/caja debe ser > 0`);
        const total = l.total || 0;
        const asignado = l.distribucion ? Object.values(l.distribucion).reduce((a, b) => a + b, 0) : 0;
        if (asignado !== total) errores.push(`Línea ${n}: faltan ${total - asignado} bolas por asignar`);
    });
    return { valida: errores.length === 0, errores };
}

/**
 * Calcula el resumen total de una orden.
 */
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

// ============================================================
// 4. CLIMA GUARDAMAR
// ============================================================

/**
 * Devuelve temperatura y humedad aproximadas de Guardamar del Segura.
 * Variación según mes y hora del día.
 */
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
// 5. RENDERIZADO DE LA VISTA AMASADO
// ============================================================

/**
 * Renderiza la vista completa de la orden de amasado.
 * 
 * @param {string} fechaParam - (Opcional) Fecha a mostrar en formato YYYY-MM-DD.
 *                              Si no se pasa, se lee del DOM o se usa hoy.
 *                              IMPORTANTE: se pasa desde el onchange del input
 *                              para evitar que el re-render pierda la fecha.
 */
function renderizarOrdenAmasado(fechaParam) {
    const container = document.getElementById('vista-container');
    container.innerHTML = '<div class="loading">Cargando orden de amasado...</div>';

    setTimeout(() => {
        try {
            const datos = cargarDatos();

            // Prioridad: parámetro > input del DOM > hoy
            // FIX: usar fechaParam evita que el re-render pierda la fecha seleccionada
            const fecha = fechaParam
                || document.getElementById('fecha-amasado')?.value
                || obtenerFechaActual();

            const orden = obtenerOrdenAmasado(datos, fecha);
            const resumen = obtenerResumenOrdenAmasado(orden);
            const validacion = validarOrdenAmasado(orden);
            const clima = obtenerClimaGuardamar();

            let todasAsignadas = true;
            let totalSinAsignar = 0;
            if (Array.isArray(orden.lineas)) {
                orden.lineas.forEach(linea => {
                    const total = linea.total || 0;
                    const asignado = linea.distribucion
                        ? Object.values(linea.distribucion).reduce((a, b) => a + b, 0) : 0;
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
                            <span class="subtitle">Producción de masa para el día siguiente</span>
                        </div>
                        <div>
                            <span class="subtitle" style="font-weight: bold; color: ${orden.aplicadoAProduccion ? 'var(--success)' : 'var(--warning)'};">
                                ${orden.aplicadoAProduccion ? '✅ Aplicado a producción' : '⏳ Pendiente de aplicar'}
                            </span>
                            ${orden.aplicadoAProduccion ? `<span style="font-size: 0.7rem; display: block; color: #666;">${new Date(orden.aplicadoEn).toLocaleString()}</span>` : ''}
                        </div>
                    </div>

                    <!-- CABECERA DATOS GENERALES -->
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                        <div class="form-row">
                            <div class="form-group">
                                <label>📅 Fecha Amasado</label>
                                <input type="date" id="fecha-amasado" value="${fecha}" onchange="renderizarOrdenAmasado(this.value)" ${orden.aplicadoAProduccion ? 'disabled' : ''}>
                            </div>
                            <div class="form-group">
                                <label>📅 Uso Previsto</label>
                                <input type="text" value="${orden.fechaUso} (${formatearFechaLarga(orden.fechaUso)})" readonly style="background: #f0f0f0; font-weight: bold;">
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

                    <!-- TABLA DE LÍNEAS -->
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
                    const asignado = linea.distribucion
                        ? Object.values(linea.distribucion).reduce((a, b) => a + b, 0) : 0;
                    const estado = asignado === total ? '✅' : '⚠️';
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
                            <td><strong>${total}</strong> ${estado}</td>
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

                    <!-- DISTRIBUCIÓN -->
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
                    const asignado = linea.distribucion
                        ? Object.values(linea.distribucion).reduce((a, b) => a + b, 0) : 0;
                    const restante = total - asignado;

                    html += `
                        <div style="border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-top: 10px; background: ${restante === 0 && total > 0 ? '#F0FFF0' : '#FFF8F8'};">
                            <h4>${escaparHTML(linea.tipoBola)} (${linea.peso}g) — Total: ${total} bolas</h4>
                            <div class="form-row">
                    `;
                    productosDestino.forEach(producto => {
                        const valor = linea.distribucion?.[producto] || 0;
                        html += `
                            <div class="form-group">
                                <label>${escaparHTML(producto)}</label>
                                <input type="number" min="0" step="1"
                                       style="width: 80px;" value="${valor}"
                                       onblur="actualizarDistribucion(${index}, '${producto.replace(/'/g, "\\'")}', this.value)"
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

                    <!-- RESUMEN -->
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

                    <!-- VALIDACIÓN -->
                    ${!orden.aplicadoAProduccion ? `
                        <div style="margin-top: 20px; padding: 15px; background: ${validacion.valida ? '#E8F5E9' : '#FFF3E0'}; border-radius: 8px; border-left: 4px solid ${validacion.valida ? 'var(--success)' : 'var(--error)'};" class="validacion-orden">
                            ${validacion.valida
                                ? '✅ La orden está completa y lista para aplicar a producción'
                                : '❌ ' + validacion.errores.map(escaparHTML).join('. ')
                            }
                        </div>
                    ` : ''}

                    <!-- BOTONES DE ACCIÓN -->
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
                                ℹ️ <strong>Nota:</strong> La orden se aplicará al inventario de producción del día <strong>${formatearFechaLarga(orden.fechaUso)}</strong>.
                                Asegúrate de que todas las bolas estén distribuidas correctamente antes de aplicar.
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
// 6. CRUD DE LÍNEAS DE AMASADO
// ============================================================

/**
 * Añade una línea nueva mediante prompts secuenciales.
 */
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
    // FIX: leer la fecha del DOM actual (el input ya tiene el valor correcto)
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);

    const nuevaLinea = {
        tipoBola: tipo,
        peso: config.peso,
        tipoCaja: cfgCaja.tipoCaja,
        cajas,
        bolasPorCaja: bolas,
        total: cajas * bolas,
        distribucion: {}
    };
    config.productosDestino.forEach(p => nuevaLinea.distribucion[p] = 0);
    orden.lineas.push(nuevaLinea);

    guardarDatos(datos);
    // FIX: pasar la fecha al re-render
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

const actualizarDistribucionDebounce = debounce(function(index, producto, valor) {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);
    if (index >= orden.lineas.length) return;

    const l = orden.lineas[index];
    if (!l.distribucion) l.distribucion = {};
    l.distribucion[producto] = parseInt(valor) || 0;
    guardarDatos(datos);
    actualizarEstadoDistribucion();
}, 300);

function actualizarDistribucion(i, p, v) {
    actualizarDistribucionDebounce(i, p, v);
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
    originales.forEach(l => orden.lineas.push(l));
    guardarDatos(datos);
    renderizarOrdenAmasado(fecha);
    mostrarNotificacion('✅ Líneas duplicadas', 'success');
}

// ============================================================
// 7. ACTUALIZACIÓN DE ESTADOS EN VIVO
// ============================================================

/**
 * Actualiza solo los indicadores de distribución sin re-render completo.
 */
function actualizarEstadoDistribucion() {
    const datos = cargarDatos();
    const fecha = document.getElementById('fecha-amasado')?.value || obtenerFechaActual();
    const orden = obtenerOrdenAmasado(datos, fecha);

    let todasAsignadas = true;
    let totalSinAsignar = 0;

    if (Array.isArray(orden.lineas)) {
        orden.lineas.forEach((linea, index) => {
            const total = linea.total || 0;
            const asignado = linea.distribucion
                ? Object.values(linea.distribucion).reduce((a, b) => a + b, 0) : 0;
            const restante = total - asignado;

            if (asignado !== total) {
                todasAsignadas = false;
                totalSinAsignar += restante;
            }

            const el = document.querySelector(`.estado-distribucion-${index}`);
            if (el) {
                el.textContent = restante === 0 && total > 0
                    ? '✅ Todas las bolas asignadas'
                    : `🔴 Restante sin asignar: ${restante} bolas`;
                el.style.color = restante === 0 ? 'var(--success)' : 'var(--error)';
            }
        });
    }

    const globalEl = document.querySelector('.estado-distribucion-global');
    if (globalEl) {
        globalEl.textContent = todasAsignadas
            ? '✅ Todas las bolas asignadas'
            : `⚠️ ${totalSinAsignar} bolas sin asignar`;
        globalEl.style.color = todasAsignadas ? 'var(--success)' : 'var(--error)';
    }

    const valDiv = document.querySelector('.validacion-orden');
    if (valDiv) {
        if (todasAsignadas) {
            valDiv.innerHTML = '✅ La orden está completa y lista para aplicar a producción';
            valDiv.style.background = '#E8F5E9';
            valDiv.style.borderLeftColor = 'var(--success)';
        } else {
            valDiv.innerHTML = `❌ Faltan ${totalSinAsignar} bolas por asignar`;
            valDiv.style.background = '#FFF3E0';
            valDiv.style.borderLeftColor = 'var(--error)';
        }
    }
}

// ============================================================
// 8. GUARDAR / APLICAR / DESAPLICAR / ELIMINAR
// ============================================================

/**
 * Guarda la orden (con clima automático) y valida.
 */
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

/**
 * Aplica la orden al inventario de producción del día siguiente.
 */
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

        const inv = {};
        orden.lineas.forEach(l => {
            if (l.distribucion) {
                Object.keys(l.distribucion).forEach(prod => {
                    const c = l.distribucion[prod] || 0;
                    if (c > 0) inv[prod] = (inv[prod] || 0) + c;
                });
            }
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

/**
 * Deshace la aplicación de la orden a producción.
 */
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
        delete datos.produccion[fechaUso].inventarioDesdeAmasado;
    }
    orden.aplicadoAProduccion = false;
    delete orden.aplicadoEn;
    guardarDatos(datos);
    mostrarNotificacion('✅ Aplicación deshecha', 'success');
    renderizarOrdenAmasado(fecha);
}

/**
 * Elimina la orden de amasado de la fecha actual.
 */
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

/**
 * Navega a la vista de producción en la fecha de uso de esta orden.
 */
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
// 9. EXPORTAR CSV
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
    csv += 'Tipo Bola,Peso,Caja,Cajas,Bolas/Caja,Total Bolas,Distribución\n';

    orden.lineas.forEach(linea => {
        const distribucion = linea.distribucion
            ? Object.entries(linea.distribucion).map(([k, v]) => `${k}: ${v}`).join(' | ')
            : 'Sin asignar';
        csv += `${linea.tipoBola},${linea.peso},${linea.tipoCaja},${linea.cajas},${linea.bolasPorCaja},${linea.total},"${distribucion}"\n`;
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
