// ============================================================
// 0. GESTIÓN DE TIPOS DE BOLA (v4)
// ============================================================
// CRUD completo de tipos de bola desde la vista de amasado.
// - Crear, editar, borrar tipos.
// - Borrar bloqueado si algún producto lo usa.
// - Cambiar nombre: actualiza los productos automáticamente.

/**
 * Abre el modal de gestión de tipos de bola.
 */
function abrirGestorTiposBola() {
    const datos = cargarDatos();
    const tipos = datos.tiposBola || {};

    // Construir filas de la tabla
    let filasHTML = '';
    const nombresTipos = Object.keys(tipos).sort();

    if (nombresTipos.length === 0) {
        filasHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 20px; color: #999;">
                    No hay tipos de bola definidos. Pulsa "➕ Crear nuevo" para empezar.
                </td>
            </tr>
        `;
    } else {
        nombresTipos.forEach(nombre => {
            const t = tipos[nombre];
            const config = (t.configuraciones && t.configuraciones[0]) || {};
            const productosQueLoUsan = (datos.productos || []).filter(p => p.tipoBola === nombre);
            const numProductos = productosQueLoUsan.length;
            const enUso = numProductos > 0;

            filasHTML += `
                <tr>
                    <td><strong>${escaparHTML(nombre)}</strong></td>
                    <td>${t.peso || 0} g</td>
                    <td>
                        ${config.tipoCaja || '—'} · máx ${config.maxCajas || 0}<br>
                        <small style="color: #999;">Bolas: ${(config.opcionesBolas || []).join(', ') || '—'}</small>
                    </td>
                    <td>
                        ${enUso
                            ? `<span style="color: var(--primary);">${numProductos} producto${numProductos > 1 ? 's' : ''}</span>`
                            : `<span style="color: #999;">Ninguno</span>`}
                    </td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="abrirEditarTipoBola('${escaparHTML(nombre).replace(/'/g, "\\'")}')" title="Editar">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="intentarBorrarTipoBola('${escaparHTML(nombre).replace(/'/g, "\\'")}')" title="Eliminar" ${enUso ? 'style="opacity: 0.5; cursor: not-allowed;"' : ''}>🗑️</button>
                    </td>
                </tr>
            `;
        });
    }

    const modalHTML = `
        <div id="modal-gestor-tipos-bola" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            padding: 20px; box-sizing: border-box;
        ">
            <div style="
                background: white; padding: 25px; border-radius: 10px;
                max-width: 900px; width: 100%; max-height: 90vh;
                overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <div class="flex-between" style="margin-bottom: 15px;">
                    <h3 style="color: var(--secondary); margin: 0;">🔧 Gestionar tipos de bola</h3>
                    <button class="btn btn-secondary btn-sm" onclick="cerrarGestorTiposBola()">✖ Cerrar</button>
                </div>

                <p style="font-size: 0.85rem; color: #666; margin-bottom: 15px;">
                    Aquí defines las bolas que se amasan. Los productos eligen una de estas bolas.
                    Si un tipo está en uso por algún producto, no se puede borrar hasta reasignarlo.
                </p>

                <div class="flex gap-10" style="margin-bottom: 15px;">
                    <button class="btn btn-primary" onclick="abrirCrearTipoBola()">➕ Crear nuevo</button>
                </div>

                <div class="tabla-container" style="margin: 0;">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Peso</th>
                                <th>Configuración (caja · bolas)</th>
                                <th>Uso en productos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filasHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Eliminar modal previo si existe
    const previo = document.getElementById('modal-gestor-tipos-bola');
    if (previo) previo.remove();

    // Crear y añadir
    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
}

/**
 * Cierra el modal de gestión de tipos de bola.
 */
function cerrarGestorTiposBola() {
    const modal = document.getElementById('modal-gestor-tipos-bola');
    if (modal) modal.remove();
}

/**
 * Abre el modal para CREAR un tipo de bola nuevo.
 */
function abrirCrearTipoBola() {
    abrirFormularioTipoBola(null);
}

/**
 * Abre el modal para EDITAR un tipo de bola existente.
 */
function abrirEditarTipoBola(nombre) {
    const datos = cargarDatos();
    if (!datos.tiposBola || !datos.tiposBola[nombre]) {
        mostrarNotificacion('❌ Tipo de bola no encontrado', 'error');
        return;
    }
    abrirFormularioTipoBola(nombre);
}

/**
 * Abre el formulario de crear/editar tipo de bola.
 * Si `nombreExistente` es null → crear. Si no → editar.
 */
function abrirFormularioTipoBola(nombreExistente) {
    const datos = cargarDatos();
    const esEdicion = !!nombreExistente;
    let nombre = '';
    let peso = 200;
    let tipoCaja = 'Mediana';
    let maxCajas = 15;
    let opcionesStr = '6, 8';

    if (esEdicion) {
        const t = datos.tiposBola[nombreExistente];
        if (!t) return;
        const config = (t.configuraciones && t.configuraciones[0]) || {};
        nombre = nombreExistente;
        peso = t.peso || 200;
        tipoCaja = config.tipoCaja || 'Mediana';
        maxCajas = config.maxCajas || 15;
        opcionesStr = (config.opcionesBolas || [6, 8]).join(', ');
    }

    const titulo = esEdicion ? '✏️ Editar tipo de bola' : '➕ Crear nuevo tipo de bola';
    const productosQueLoUsan = esEdicion
        ? (datos.productos || []).filter(p => p.tipoBola === nombreExistente)
        : [];
    const enUso = productosQueLoUsan.length > 0;

    const avisoNombre = (esEdicion && enUso)
        ? `<div style="background: #FFF3E0; border-left: 4px solid var(--warning); padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 0.85rem;">
             ⚠️ <strong>Este tipo lo usan ${productosQueLoUsan.length} productos.</strong>
             Si cambias el nombre, se actualizarán automáticamente.
           </div>`
        : '';

    const modalHTML = `
        <div id="modal-form-tipo-bola" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            padding: 20px; box-sizing: border-box;
        ">
            <div style="
                background: white; padding: 25px; border-radius: 10px;
                max-width: 500px; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <h3 style="margin-bottom: 15px; color: var(--secondary);">${titulo}</h3>

                ${avisoNombre}

                <div class="form-group">
                    <label for="tb-nombre">Nombre del tipo *</label>
                    <input type="text" id="tb-nombre" value="${escaparHTML(nombre)}" placeholder="Ej: Grande 360" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>

                <div class="form-group">
                    <label for="tb-peso">Peso por bola (g) *</label>
                    <input type="number" id="tb-peso" min="1" step="1" value="${peso}" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>

                <div class="form-group">
                    <label for="tb-tipoCaja">Tipo de caja *</label>
                    <select id="tb-tipoCaja" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                        <option value="Pequeña" ${tipoCaja === 'Pequeña' ? 'selected' : ''}>Pequeña</option>
                        <option value="Mediana" ${tipoCaja === 'Mediana' ? 'selected' : ''}>Mediana</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="tb-maxCajas">Número máximo de cajas *</label>
                    <input type="number" id="tb-maxCajas" min="1" step="1" value="${maxCajas}" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>

                <div class="form-group">
                    <label for="tb-opcionesBolas">Opciones de bolas por caja * <small>(separadas por coma)</small></label>
                    <input type="text" id="tb-opcionesBolas" value="${escaparHTML(opcionesStr)}" placeholder="Ej: 8, 10, 11" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>

                <div class="flex gap-10" style="margin-top: 20px; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="cerrarFormularioTipoBola()">❌ Cancelar</button>
                    <button class="btn btn-primary" onclick="guardarTipoBola(${esEdicion ? `'${escaparHTML(nombreExistente).replace(/'/g, "\\'")}'` : 'null'})">💾 ${esEdicion ? 'Guardar cambios' : 'Crear tipo'}</button>
                </div>
            </div>
        </div>
    `;

    const previo = document.getElementById('modal-form-tipo-bola');
    if (previo) previo.remove();

    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
}

/**
 * Cierra el formulario de tipo de bola.
 */
function cerrarFormularioTipoBola() {
    const modal = document.getElementById('modal-form-tipo-bola');
    if (modal) modal.remove();
}

/**
 * Guarda un tipo de bola (nuevo o edición).
 * @param {string|null} nombreOriginal - Nombre original si es edición, null si es nuevo.
 */
function guardarTipoBola(nombreOriginal) {
    const nombre = (document.getElementById('tb-nombre')?.value || '').trim();
    const peso = parseFloat(document.getElementById('tb-peso')?.value) || 0;
    const tipoCaja = document.getElementById('tb-tipoCaja')?.value || 'Mediana';
    const maxCajas = parseInt(document.getElementById('tb-maxCajas')?.value) || 0;
    const opcionesStr = document.getElementById('tb-opcionesBolas')?.value || '';

    if (!nombre) {
        mostrarNotificacion('❌ El nombre es obligatorio', 'error');
        return;
    }
    if (peso <= 0) {
        mostrarNotificacion('❌ El peso debe ser mayor que 0', 'error');
        return;
    }
    if (maxCajas < 1) {
        mostrarNotificacion('❌ El número de cajas debe ser mayor que 0', 'error');
        return;
    }

    const opciones = opcionesStr
        .split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n) && n > 0);

    if (opciones.length === 0) {
        mostrarNotificacion('❌ Debe haber al menos una opción de bolas', 'error');
        return;
    }

    const datos = cargarDatos();
    if (!datos.tiposBola) datos.tiposBola = {};

    const esEdicion = !!nombreOriginal;
    const nombreCambiado = esEdicion && nombre !== nombreOriginal;

    // Si es nuevo o cambia el nombre, comprobar que no exista
    if (!esEdicion || nombreCambiado) {
        if (datos.tiposBola[nombre]) {
            mostrarNotificacion(`❌ Ya existe un tipo llamado "${nombre}"`, 'error');
            return;
        }
    }

    const configuracion = [{
        tipoCaja: tipoCaja,
        maxCajas: maxCajas,
        opcionesBolas: opciones
    }];

    if (esEdicion) {
        // Mantener productosDestino existente
        const anterior = datos.tiposBola[nombreOriginal] || {};
        datos.tiposBola[nombre] = {
            peso: peso,
            configuraciones: configuracion,
            productosDestino: anterior.productosDestino || []
        };
        // Si cambió el nombre → borrar el antiguo
        if (nombreCambiado) {
            delete datos.tiposBola[nombreOriginal];
            // Actualizar los productos que usaban el nombre antiguo
            let actualizados = 0;
            (datos.productos || []).forEach(p => {
                if (p.tipoBola === nombreOriginal) {
                    p.tipoBola = nombre;
                    actualizados++;
                }
            });
            if (actualizados > 0) {
                console.log(`[tipos-bola] ${actualizados} productos actualizados al nuevo nombre "${nombre}"`);
            }
        }
    } else {
        datos.tiposBola[nombre] = {
            peso: peso,
            configuraciones: configuracion,
            productosDestino: []
        };
    }

    guardarDatos(datos);

    cerrarFormularioTipoBola();

    // Refrescar el gestor si sigue abierto
    if (document.getElementById('modal-gestor-tipos-bola')) {
        // Reabrir el gestor para reflejar los cambios
        cerrarGestorTiposBola();
        abrirGestorTiposBola();
    } else {
        // Si estamos en el formulario de producto, actualizar el <select>
        const selectTipoBola = document.getElementById('producto-tipoBola');
        if (selectTipoBola) {
            renderizarProductos(); // Recargar la vista de productos completa
        }
    }

    // Si estamos en la vista de amasado, recargar
    if (document.getElementById('fecha-amasado')) {
        renderizarOrdenAmasado();
    }

    mostrarNotificacion(
        esEdicion
            ? (nombreCambiado ? `✅ Tipo renombrado a "${nombre}" y productos actualizados` : `✅ Tipo "${nombre}" actualizado`)
            : `✅ Tipo "${nombre}" creado`,
        'success'
    );
}

/**
 * Intenta borrar un tipo de bola. Si está en uso, bloquea y avisa.
 */
function intentarBorrarTipoBola(nombre) {
    const datos = cargarDatos();
    if (!datos.tiposBola || !datos.tiposBola[nombre]) {
        mostrarNotificacion('❌ Tipo no encontrado', 'error');
        return;
    }

    const productosQueLoUsan = (datos.productos || []).filter(p => p.tipoBola === nombre);

    if (productosQueLoUsan.length > 0) {
        const nombresProd = productosQueLoUsan.map(p => p.nombre).join(', ');
        mostrarNotificacion(
            `❌ No se puede borrar "${nombre}": lo usan ${productosQueLoUsan.length} productos (${nombresProd}). Reasígnalos primero.`,
            'error'
        );
        return;
    }

    if (!confirm(`⚠️ ¿Eliminar el tipo de bola "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }

    delete datos.tiposBola[nombre];
    guardarDatos(datos);

    // Refrescar el gestor
    cerrarGestorTiposBola();
    abrirGestorTiposBola();

    mostrarNotificacion(`✅ Tipo "${nombre}" eliminado`, 'success');
}
