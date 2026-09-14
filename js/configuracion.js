/**
 * ============================================================
 * MÓDULO: CONFIGURACIÓN
 * ============================================================
 * Responsabilidades:
 *   - Vista de configuración (ajustes + estadísticas)
 *   - Guardar ajustes (coste MOD, días caducidad)
 *   - Exportar / Importar backup completo (JSON)
 *   - Restaurar backup automático
 *   - Resetear datos a valores por defecto
 * 
 * Dependencias: datos.js, utilidades.js
 * ============================================================
 */

// ============================================================
// 1. RENDERIZADO DE LA VISTA CONFIGURACIÓN
// ============================================================

function renderizarConfiguracion() {
    const container = document.getElementById('vista-container');
    container.innerHTML = '<div class="loading">Cargando configuración...</div>';

    setTimeout(() => {
        try {
            const datos = cargarDatos();

            // Estadísticas generales
            const stats = calcularEstadisticasGenerales(datos);

            let html = `
                <div class="vista active">
                    <div class="vista-header">
                        <div>
                            <h2>⚙️ Configuración</h2>
                            <span class="subtitle">Ajustes generales de la aplicación</span>
                        </div>
                    </div>

                    <!-- AJUSTES -->
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 600px; margin-bottom: 20px;">
                        <h3 style="margin-bottom: 15px; color: var(--secondary);">💰 Parámetros de Coste</h3>

                        <div class="form-group">
                            <label for="config-coste-hora">Coste Mano de Obra (€/hora)</label>
                            <input type="number" step="0.01" min="0" id="config-coste-hora"
                                   value="${datos.configuracion.costeManoObraHora}">
                        </div>

                        <div class="form-group">
                            <label for="config-dias-caducidad">Días de Caducidad</label>
                            <input type="number" min="1" id="config-dias-caducidad"
                                   value="${datos.configuracion.diasCaducidad}">
                        </div>

                        <div class="flex gap-10" style="flex-wrap: wrap;">
                            <button class="btn btn-primary" onclick="guardarConfiguracion()">💾 Guardar Configuración</button>
                            <button class="btn btn-danger" onclick="resetearDatos()">🔄 Resetear Datos</button>
                        </div>
                    </div>

                    <!-- ESTADÍSTICAS -->
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 600px; margin-bottom: 20px;">
                        <h3 style="margin-bottom: 15px; color: var(--secondary);">📊 Estadísticas Generales</h3>
                        <div class="resumen-grid" style="grid-template-columns: 1fr 1fr;">
                            <div class="resumen-card">
                                <div class="label">Clientes</div>
                                <div class="value primary">${stats.clientesActivos} / ${stats.clientesTotales}</div>
                                <div style="font-size: 0.75rem; color: var(--text-light);">activos / totales</div>
                            </div>
                            <div class="resumen-card">
                                <div class="label">Productos</div>
                                <div class="value primary">${stats.productosActivos} / ${stats.productosTotales}</div>
                                <div style="font-size: 0.75rem; color: var(--text-light);">activos / totales</div>
                            </div>
                            <div class="resumen-card">
                                <div class="label">Días registrados</div>
                                <div class="value">${stats.diasRegistrados}</div>
                            </div>
                            <div class="resumen-card">
                                <div class="label">Total pedidos</div>
                                <div class="value">${stats.totalPedidos}</div>
                            </div>
                            <div class="resumen-card">
                                <div class="label">Órdenes amasado</div>
                                <div class="value">${stats.totalOrdenesAmasado}</div>
                            </div>
                            <div class="resumen-card">
                                <div class="label">Almacenamiento</div>
                                <div class="value">${stats.tamanoKB} KB</div>
                            </div>
                        </div>
                    </div>

                    <!-- ACCIONES AVANZADAS -->
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 600px;">
                        <h3 style="margin-bottom: 15px; color: var(--secondary);">🛠️ Copias de Seguridad</h3>
                        <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 15px;">
                            Exporta un archivo con todos tus datos para guardarlo. Podrás importarlo después para restaurar el estado.
                        </p>
                        <div class="flex gap-10" style="flex-wrap: wrap;">
                            <button class="btn btn-primary" onclick="exportarBackupJSON()">📥 Exportar Backup</button>
                            <button class="btn btn-secondary" onclick="importarBackupJSON()">📤 Importar Backup</button>
                            <button class="btn btn-warning" onclick="restaurarBackupUI()">🔄 Restaurar Backup</button>
                        </div>
                        <p style="font-size: 0.75rem; color: var(--text-light); margin-top: 10px;">
                            ℹ️ El backup se guarda automáticamente en cada cambio. "Restaurar Backup" recupera el último estado guardado en este navegador.
                        </p>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        } catch (error) {
            console.error('❌ Error al renderizar configuración:', error);
            container.innerHTML = `
                <div class="vista active">
                    <div class="vista-error">
                        <h3>❌ Error al cargar la configuración</h3>
                        <p>${escaparHTML(error.message)}</p>
                        <button class="btn btn-primary" onclick="renderizarConfiguracion()">🔄 Reintentar</button>
                    </div>
                </div>
            `;
        }
    }, 50);
}

// ============================================================
// 2. ESTADÍSTICAS GENERALES
// ============================================================

/**
 * Calcula estadísticas generales de la app.
 */
function calcularEstadisticasGenerales(datos) {
    const clientesTotales = datos.clientes.length;
    const clientesActivos = datos.clientes.filter(c => c.activo).length;
    const productosTotales = datos.productos.length;
    const productosActivos = datos.productos.filter(p => p.activo).length;
    const diasRegistrados = Object.keys(datos.produccion || {}).length;

    let totalPedidos = 0;
    Object.values(datos.produccion || {}).forEach(dia => {
        if (Array.isArray(dia.pedidos)) totalPedidos += dia.pedidos.length;
    });

    const totalOrdenesAmasado = Object.keys(datos.ordenesAmasado || {}).length;

    let tamanoKB = 0;
    try {
        tamanoKB = Math.round(JSON.stringify(datos).length / 1024);
    } catch (e) {
        tamanoKB = 0;
    }

    return {
        clientesTotales,
        clientesActivos,
        productosTotales,
        productosActivos,
        diasRegistrados,
        totalPedidos,
        totalOrdenesAmasado,
        tamanoKB
    };
}

// ============================================================
// 3. GUARDAR CONFIGURACIÓN
// ============================================================

/**
 * Guarda los ajustes de configuración (coste MOD, días caducidad).
 */
function guardarConfiguracion() {
    const datos = cargarDatos();
    const costeHora = aDecimal(document.getElementById('config-coste-hora').value);
    const diasCaducidad = aEntero(document.getElementById('config-dias-caducidad').value);

    let cambios = false;

    if (costeHora >= 0) {
        datos.configuracion.costeManoObraHora = costeHora;
        cambios = true;
    } else {
        mostrarNotificacion('⚠️ Coste por hora inválido', 'warning');
    }

    if (diasCaducidad > 0) {
        datos.configuracion.diasCaducidad = diasCaducidad;
        cambios = true;
    } else {
        mostrarNotificacion('⚠️ Días de caducidad inválidos', 'warning');
    }

    if (cambios) {
        guardarDatos(datos);
        mostrarNotificacion('✅ Configuración guardada', 'success');
    }
}

// ============================================================
// 4. EXPORTAR / IMPORTAR BACKUP
// ============================================================

/**
 * Exporta todos los datos como archivo JSON descargable.
 */
function exportarBackupJSON() {
    try {
        const datos = cargarDatos();
        const fecha = obtenerFechaActual();
        const json = JSON.stringify(datos, null, 2);

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quality_pizza_backup_${fecha}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        mostrarNotificacion('📥 Backup exportado correctamente', 'success');
    } catch (error) {
        console.error('Error al exportar backup:', error);
        mostrarNotificacion('❌ Error al exportar backup', 'error');
    }
}

/**
 * Abre un selector de archivo para importar un backup JSON.
 */
function importarBackupJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const datos = JSON.parse(event.target.result);
                procesarImportacionBackup(datos);
            } catch (error) {
                console.error('Error al parsear el archivo:', error);
                mostrarNotificacion('❌ El archivo no es un JSON válido', 'error');
            }
        };
        reader.readAsText(file);
    };

    input.click();
}

/**
 * Valida y aplica los datos importados desde un backup.
 */
function procesarImportacionBackup(datos) {
    // Validación mínima
    if (!datos || typeof datos !== 'object') {
        mostrarNotificacion('❌ El archivo no contiene datos válidos', 'error');
        return;
    }
    if (!Array.isArray(datos.productos) || !Array.isArray(datos.clientes)) {
        mostrarNotificacion('❌ El archivo no tiene la estructura esperada', 'error');
        return;
    }

    const totalClientes = datos.clientes.length;
    const totalProductos = datos.productos.length;
    const totalDias = Object.keys(datos.produccion || {}).length;

    const msg = `⚠️ ¿Importar este backup?\n\n` +
                `• Clientes: ${totalClientes}\n` +
                `• Productos: ${totalProductos}\n` +
                `• Días de producción: ${totalDias}\n\n` +
                `Se sobrescribirán los datos actuales.`;

    if (!confirm(msg)) return;

    // Asegurar estructura y guardar
    const datosSeguros = asegurarEstructuraDatos(datos);
    guardarDatos(datosSeguros);
    mostrarNotificacion('✅ Backup importado correctamente', 'success');
    renderizarConfiguracion();
}

// ============================================================
// 5. RESTAURAR BACKUP AUTOMÁTICO
// ============================================================

/**
 * Restaura el backup automático (guardado en cada cambio).
 */
function restaurarBackupUI() {
    if (!confirm('⚠️ ¿Restaurar el último backup automático?\n\nSe sobrescribirán los datos actuales.')) {
        return;
    }

    const ok = restaurarBackup();
    if (ok) {
        mostrarNotificacion('✅ Backup restaurado correctamente', 'success');
        // Recargar la vista por si acaso
        renderizarConfiguracion();
    } else {
        mostrarNotificacion('❌ No se pudo restaurar el backup', 'error');
    }
}

// ============================================================
// 6. RESETEAR DATOS
// ============================================================

/**
 * Resetea todos los datos a los valores por defecto.
 * Pide doble confirmación por ser una acción destructiva.
 */
function resetearDatos() {
    if (!confirm('⚠️ ¿Resetear TODOS los datos?\n\nSe perderán todos los pedidos, órdenes de amasado y configuración.')) {
        return;
    }
    if (!confirm('⚠️ ¿Estás COMPLETAMENTE seguro?\n\nEsta acción no se puede deshacer.')) {
        return;
    }

    // Guardar copia de seguridad antes de resetear (por si acaso)
    try {
        const actual = localStorage.getItem(CONSTANTES.CLAVE_LOCALSTORAGE);
        if (actual) {
            localStorage.setItem(CONSTANTES.CLAVE_BACKUP, actual);
        }
    } catch (e) { /* silencioso */ }

    // Guardar datos por defecto
    const datosDefecto = clonarProfundo(DATOS_POR_DEFECTO);
    guardarDatos(datosDefecto);

    mostrarNotificacion('✅ Datos reseteados correctamente', 'success');
    renderizarConfiguracion();
}
