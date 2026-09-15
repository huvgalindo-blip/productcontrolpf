/**
 * ============================================================
 * MÓDULO: UI (ENRUTADOR Y EVENTOS)
 * ============================================================
 * Responsabilidades:
 *   - Enrutador central de vistas (cambiarVista)
 *   - Recuperar la vista activa
 *   - Menú móvil (hamburguesa)
 *   - Registro de eventos globales (nav, teclas rápidas, clicks)
 * 
 * Dependencias: todos los módulos de vistas
 * ============================================================
 */

// ============================================================
// 1. ENRUTADOR CENTRAL
// ============================================================

/**
 * Cambia a la vista indicada: marca el botón activo y renderiza el contenido.
 * Vistas válidas: produccion | dashboard | amasado | clientes | productos | configuracion
 * 
 * @param {string} vista 
 */
function cambiarVista(vista) {
    console.log('🔄 Cambiando a vista:', vista);

    // Actualizar botón activo
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.vista === vista);
    });

    // Enrutar a la función de render correspondiente
    switch (vista) {
        case 'produccion':
            renderizarProduccion();
            break;
        case 'dashboard':
            renderizarDashboard();
            break;
        case 'amasado':
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
            console.warn(`Vista desconocida: "${vista}". Redirigiendo a producción.`);
            renderizarProduccion();
    }
}

/**
 * Vuelve a renderizar la vista que está activa.
 * Útil tras una importación de datos, restauración de backup, etc.
 */
function renderizarVistaActual() {
    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn) {
        cambiarVista(activeBtn.dataset.vista);
    } else {
        cambiarVista('produccion');
    }
}

// ============================================================
// 2. MENÚ MÓVIL
// ============================================================

/**
 * Muestra u oculta el menú de navegación en móvil.
 */
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.toggle('open');
}

/**
 * Cierra el menú móvil.
 */
function cerrarMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.remove('open');
}

// ============================================================
// 3. EVENTOS GLOBALES
// ============================================================

/**
 * Configura todos los listeners globales de la UI.
 * Se llama una sola vez al inicializar la app.
 */
function configurarEventos() {
    // --- 3.1 Navegación por botones ---
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const vista = this.dataset.vista;
            cambiarVista(vista);
            cerrarMenu();
        });
    });

    // --- 3.2 Cerrar menú móvil al hacer click fuera ---
    document.addEventListener('click', function(e) {
        const nav = document.getElementById('navbar');
        const navLinks = document.querySelector('.nav-links');
        if (nav && navLinks && !nav.contains(e.target)) {
            navLinks.classList.remove('open');
        }
    });

    // --- 3.3 Teclas rápidas ---
    document.addEventListener('keydown', function(e) {
        // Ctrl+1..6 → cambio de vista
        if (e.ctrlKey && e.key >= '1' && e.key <= '6') {
            e.preventDefault();
            const vistas = ['produccion', 'dashboard', 'amasado', 'clientes', 'productos', 'configuracion'];
            const index = parseInt(e.key) - 1;
            if (index >= 0 && index < vistas.length) {
                cambiarVista(vistas[index]);
            }
        }

        // Escape → cerrar formularios abiertos
        if (e.key === 'Escape') {
            // Formularios de clientes y productos
            if (typeof cerrarFormularioCliente === 'function') cerrarFormularioCliente();
            if (typeof cerrarFormularioProducto === 'function') cerrarFormularioProducto();
        }
    });

    console.log('✅ Eventos globales configurados');
}
