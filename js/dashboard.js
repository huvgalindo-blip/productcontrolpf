/**
 * ============================================================
 * MÓDULO: DASHBOARD
 * ============================================================
 * Responsabilidades:
 *   - Vista semanal con resumen por día
 *   - Totales agregados de la semana
 *   - Navegación entre semanas
 *   - Renderizado completo
 * 
 * Dependencias: datos.js, utilidades.js, produccion.js
 * ============================================================
 */

// Estado en memoria (no persiste) para saber qué semana estamos viendo
let semanaActualDashboard = null;

// ============================================================
// 1. CÁLCULOS DE SEMANA
// ============================================================

/**
 * Devuelve la fecha (YYYY-MM-DD) del lunes de la semana a la que pertenece `fecha`.
 * Si no se pasa fecha, usa hoy.
 */
function obtenerLunesDeSemana(fecha = null) {
    const base = fecha ? new Date(fecha) : new Date();
    const dia = base.getDay(); // 0=Dom, 1=Lun, ...
    const diff = dia === 0 ? 6 : dia - 1; // Cuántos días restar para llegar al lunes
    const lunes = new Date(base);
    lunes.setDate(base.getDate() - diff);
    return lunes.toISOString().split('T')[0];
}

/**
 * Devuelve array de 7 fechas (YYYY-MM-DD) empezando por el lunes indicado.
 */
function obtenerFechasSemana(lunesStr) {
    const fechas = [];
    const lunes = new Date(lunesStr);
    for (let i = 0; i < 7; i++) {
        const d = new Date(lunes);
        d.setDate(lunes.getDate() + i);
        fechas.push(d.toISOString().split('T')[0]);
    }
    return fechas;
}

/**
 * Calcula métricas de un día a partir de su producción.
 * Devuelve { unidades, ventas, coste, margen, pedidos, tieneDatos }.
 */
function calcularMetricasDia(datos, fecha) {
    const produccion = datos.produccion?.[fecha];
    const tieneDatos = !!(produccion && Array.isArray(produccion.pedidos) && produccion.pedidos.length > 0);

    if (!tieneDatos) {
        return { unidades: 0, ventas: 0, coste: 0, margen: 0, pedidos: 0, tieneDatos: false };
    }

    const ventasDiarias = calcularVentasDiarias(produccion.pedidos);
    const unidades = sumaValores(ventasDiarias);
    const ventas = calcularVentasGeneradas(datos, ventasDiarias);
    const costeMP = calcularCosteMateriaPrima(datos, ventasDiarias);
    const costeMOD = redondear2((produccion.horasTrabajadas || 0) * datos.configuracion.costeManoObraHora);
    const coste = redondear2(costeMP + costeMOD);
    const margen = calcularMargen(ventas, coste);

    return {
        unidades,
        ventas,
        coste,
        margen,
        pedidos: produccion.pedidos.length,
        tieneDatos: true
    };
}

// ============================================================
// 2. RENDERIZADO DEL DASHBOARD
// ============================================================

function renderizarDashboard() {
    const container = document.getElementById('vista-container');
    container.innerHTML = '<div class="loading">Cargando dashboard...</div>';

    setTimeout(() => {
        try {
            const datos = cargarDatos();

            // Determinar el lunes de la semana a mostrar
            const lunes = semanaActualDashboard
                ? obtenerLunesDeSemana(semanaActualDashboard)
                : obtenerLunesDeSemana();

            const fechas = obtenerFechasSemana(lunes);
            const domingo = fechas[6];

            // Acumuladores semanales
            let totalUnidades = 0;
            let totalVentas = 0;
            let totalCoste = 0;
            let totalPedidos = 0;
            let diasConDatos = 0;

            // Tarjetas por día
            let tarjetasDias = '';
            fechas.forEach(fecha => {
                const dia = new Date(fecha + 'T00:00:00');
                const nombreDia = CONSTANTES.DIAS_SEMANA[dia.getDay()];
                const esHoy = fecha === obtenerFechaActual();

                const m = calcularMetricasDia(datos, fecha);

                if (m.tieneDatos) {
                    totalUnidades += m.unidades;
                    totalVentas += m.ventas;
                    totalCoste += m.coste;
                    totalPedidos += m.pedidos;
                    diasConDatos++;
                }

                tarjetasDias += `
                    <div class="resumen-card" style="${m.tieneDatos ? '' : 'opacity: 0.5;'} ${esHoy ? 'border: 2px solid var(--primary);' : ''}">
                        <div class="label">
                            ${nombreDia} ${esHoy ? '• HOY' : ''}
                        </div>
                        <div style="font-size: 0.75rem; color: #999; margin-bottom: 5px;">
                            ${formatearFecha(fecha)}
                        </div>
                        <div class="value" style="font-size: 0.9rem;">
                            ${m.tieneDatos ? `${m.unidades} uds` : 'Sin datos'}
                        </div>
                        ${m.tieneDatos ? `
                            <div style="font-size: 0.8rem; color: var(--text-light);">
                                ${m.ventas.toFixed(2)} € | ${m.margen}%
                            </div>
                            <div style="font-size: 0.7rem; color: #999;">
                                ${m.pedidos} pedidos
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            const margenSemanal = totalVentas > 0
                ? Math.round(((totalVentas - totalCoste) / totalVentas) * 10000) / 100
                : 0;

            const promedioUnidades = diasConDatos > 0 ? Math.round(totalUnidades / diasConDatos) : 0;
            const promedioVentas = diasConDatos > 0 ? totalVentas / diasConDatos : 0;

            let html = `
                <div class="vista active">
                    <div class="vista-header">
                        <div>
                            <h2>📊 Dashboard Semanal</h2>
                            <span class="subtitle">
                                Semana del ${formatearFecha(lunes)} al ${formatearFecha(domingo)}
                            </span>
                        </div>
                        <div class="flex gap-10">
                            <button class="btn btn-secondary btn-sm" onclick="cambiarSemana(-1)" title="Semana anterior">◀</button>
                            <button class="btn btn-secondary btn-sm" onclick="cambiarSemana(1)" title="Semana siguiente">▶</button>
                            <button class="btn btn-primary btn-sm" onclick="irSemanaActual()">Esta semana</button>
                        </div>
                    </div>

                    <!-- Tarjetas por día -->
                    <div class="resumen-grid" style="margin-bottom: 20px;">
                        ${tarjetasDias}
                    </div>

                    <!-- Resumen semanal -->
                    <div class="vista-header">
                        <h3>📈 Resumen de la Semana</h3>
                    </div>
                    <div class="resumen-grid">
                        <div class="resumen-card">
                            <div class="label">Días con producción</div>
                            <div class="value">${diasConDatos} / 7</div>
                        </div>
                        <div class="resumen-card">
                            <div class="label">Total Pedidos</div>
                            <div class="value primary">${totalPedidos}</div>
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
                        <div class="resumen-card" style="grid-column: span 2;">
                            <div class="label">Promedio diario</div>
                            <div class="value" style="font-size: 0.9rem;">
                                ${diasConDatos > 0
                                    ? `${promedioUnidades} uds/día | ${promedioVentas.toFixed(2)} €/día`
                                    : 'Sin datos'}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        } catch (error) {
            console.error('❌ Error al renderizar dashboard:', error);
            container.innerHTML = `
                <div class="vista active">
                    <div class="vista-error">
                        <h3>❌ Error al cargar el dashboard</h3>
                        <p>${escaparHTML(error.message)}</p>
                        <button class="btn btn-primary" onclick="renderizarDashboard()">🔄 Reintentar</button>
                    </div>
                </div>
            `;
        }
    }, 50);
}

// ============================================================
// 3. NAVEGACIÓN ENTRE SEMANAS
// ============================================================

/**
 * Cambia de semana. direccion = -1 (anterior) o +1 (siguiente).
 */
function cambiarSemana(direccion) {
    // Base: semana actual mostrada o la de hoy
    const baseStr = semanaActualDashboard || obtenerFechaActual();
    const base = new Date(baseStr);
    base.setDate(base.getDate() + (direccion * 7));
    semanaActualDashboard = base.toISOString().split('T')[0];
    renderizarDashboard();
}

/**
 * Vuelve a la semana actual.
 */
function irSemanaActual() {
    semanaActualDashboard = null;
    renderizarDashboard();
}
