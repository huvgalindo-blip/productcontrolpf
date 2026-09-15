/**
 * ============================================================
 * MÓDULO: APP (PUNTO DE ENTRADA)
 * ============================================================
 * Responsabilidades:
 *   - Inicializar la aplicación al cargar el DOM
 *   - Verificar que los módulos estén cargados
 *   - Configurar eventos globales
 *   - Arrancar con la vista de producción
 * 
 * Dependencias: TODOS los módulos anteriores
 * Orden de carga en index.html: debe ser el último
 * ============================================================
 */

// ============================================================
// VERSIÓN DE LA APP
// ============================================================

const APP_VERSION = '1.0.0';

// ============================================================
// INICIALIZACIÓN
// ============================================================

/**
 * Arranca la aplicación.
 * Se llama una sola vez cuando el DOM está listo.
 */
function inicializarApp() {
    console.log('');
    console.log('🍕 ============================================');
    console.log(`🍕  Quality Pizzafresh — Control de Producción`);
    console.log(`🍕  v${APP_VERSION}`);
    console.log(`🍕  ${new Date().toLocaleString('es-ES')}`);
    console.log('🍕 ============================================');

    // --- Verificar que los módulos críticos estén cargados ---
    const modulosRequeridos = [
        'cargarDatos',
        'guardarDatos',
        'cambiarVista',
        'configurarEventos',
        'renderizarProduccion',
        'renderizarOrdenAmasado',
        'renderizarClientes',
        'renderizarProductos',
        'renderizarDashboard',
        'renderizarConfiguracion'
    ];

    const modulosFaltantes = modulosRequeridos.filter(
        fn => typeof window[fn] !== 'function'
    );

    if (modulosFaltantes.length > 0) {
        console.error('❌ Faltan módulos:', modulosFaltantes);
        const container = document.getElementById('vista-container');
        if (container) {
            container.innerHTML = `
                <div class="vista active">
                    <div class="vista-error">
                        <h3>❌ Error al inicializar la aplicación</h3>
                        <p>Faltan los siguientes módulos: <strong>${modulosFaltantes.join(', ')}</strong></p>
                        <p style="font-size: 0.85rem; margin-top: 10px;">
                            Comprueba que todos los scripts estén cargados correctamente en <code>index.html</code>.
                        </p>
                        <button class="btn btn-primary" onclick="location.reload()">🔄 Recargar</button>
                    </div>
                </div>
            `;
        }
        return;
    }

    // --- Cargar datos iniciales ---
    try {
        const datos = cargarDatos();
        console.log('📊 Datos cargados:');
        console.log(`   • Clientes: ${datos.clientes.length}`);
        console.log(`   • Productos: ${datos.productos.length}`);
        console.log(`   • Días de producción: ${Object.keys(datos.produccion || {}).length}`);
        console.log(`   • Órdenes de amasado: ${Object.keys(datos.ordenesAmasado || {}).length}`);
    } catch (error) {
        console.error('❌ Error al cargar datos iniciales:', error);
    }

    // --- Configurar eventos globales (nav, teclas, menú) ---
    configurarEventos();

    // --- Arrancar en la vista de producción ---
    cambiarVista('produccion');

    // --- Logs finales ---
    console.log('');
    console.log('✅ Aplicación inicializada correctamente');
    console.log('💡 Atajos de teclado:');
    console.log('   • Ctrl+1 → Producción');
    console.log('   • Ctrl+2 → Dashboard');
    console.log('   • Ctrl+3 → Amasado');
    console.log('   • Ctrl+4 → Clientes');
    console.log('   • Ctrl+5 → Productos');
    console.log('   • Ctrl+6 → Configuración');
    console.log('   • Esc    → Cerrar formularios');
    console.log('');
}

// ============================================================
// DISPARADOR DE ARRANQUE
// ============================================================

document.addEventListener('DOMContentLoaded', inicializarApp);
