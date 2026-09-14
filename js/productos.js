/**
 * ============================================================
 * MÓDULO: PRODUCTOS
 * ============================================================
 * Responsabilidades:
 *   - Consultas de productos (activos, precios, búsqueda)
 *   - CRUD de productos (crear, editar, activar, desactivar)
 *   - Renderizado de la vista de Productos
 * 
 * Dependencias: datos.js, utilidades.js
 * ============================================================
 */

// ============================================================
// 1. CONSULTAS DE PRODUCTOS
// ============================================================

/**
 * Devuelve solo los productos activos.
 */
function obtenerProductosActivos(datos) {
    return datos.productos.filter(p => p.activo === true);
}

/**
 * Devuelve el precio de venta de un producto por nombre.
 * Si no existe o está inactivo, devuelve 0.
 */
function obtenerPrecioVenta(datos, nombre) {
    const p = datos.productos.find(x => x.nombre === nombre && x.activo);
    return p ? p.precioVenta : 0;
}

/**
 * Devuelve el precio de coste de un producto por nombre.
 * Si no existe o está inactivo, devuelve 0.
 */
function obtenerPrecioCosto(datos, nombre) {
    const p = datos.productos.find(x => x.nombre === nombre && x.activo);
    return p ? p.precioCosto : 0;
}

/**
 * Busca un producto activo por nombre exacto.
 */
function obtenerProductoPorNombre(datos, nombre) {
    return datos.productos.find(p => p.nombre === nombre && p.activo) || null;
}

// ============================================================
// 2. RENDERIZADO DE LA VISTA PRODUCTOS
// ============================================================

/**
 * Renderiza la vista completa de productos en #vista-container.
 */
function renderizarProductos() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();

    let html = `
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>📦 Productos</h2>
                    <span class="subtitle">${datos.productos.filter(p => p.activo).length} productos activos de ${datos.productos.length} totales</span>
                </div>
                <button class="btn btn-primary" onclick="mostrarFormularioProducto()">➕ Añadir Producto</button>
            </div>
            <div id="form-producto-container" style="display: none; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                <h3 id="form-producto-titulo">Añadir Producto</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="producto-nombre">Nombre *</label>
                        <input type="text" id="producto-nombre" placeholder="Ej: Pizza Familiar" required>
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

    if (datos.productos.length === 0) {
        html += `
            <tr>
                <td colspan="7" class="text-center" style="padding: 30px; color: #999;">
                    No hay productos registrados
                </td>
            </tr>
        `;
    } else {
        datos.productos.forEach(producto => {
            const margen = producto.precioVenta > 0
                ? Math.round(((producto.precioVenta - producto.precioCosto) / producto.precioVenta) * 10000) / 100
                : 0;

            html += `
                <tr>
                    <td>${producto.id}</td>
                    <td><strong>${escaparHTML(producto.nombre)}</strong></td>
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
                        <button class="btn btn-secondary btn-sm" onclick="editarProducto(${producto.id})" title="Editar">✏️</button>
                        ${producto.activo
                            ? `<button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})" title="Desactivar">🗑️</button>`
                            : `<button class="btn btn-success btn-sm" onclick="reactivarProducto(${producto.id})" title="Reactivar">↩️</button>`
                        }
                    </td>
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
}

// ============================================================
// 3. FORMULARIO DE PRODUCTOS
// ============================================================

function mostrarFormularioProducto() {
    document.getElementById('form-producto-container').style.display = 'block';
    document.getElementById('form-producto-titulo').textContent = 'Añadir Producto';
    document.getElementById('producto-nombre').value = '';
    document.getElementById('producto-precioCosto').value = '';
    document.getElementById('producto-precioVenta').value = '';
    document.getElementById('producto-editando-id').value = '';
    document.getElementById('producto-nombre').focus();
}

function cerrarFormularioProducto() {
    const container = document.getElementById('form-producto-container');
    if (container) container.style.display = 'none';
}

// ============================================================
// 4. CRUD DE PRODUCTOS
// ============================================================

/**
 * Guarda (crea o actualiza) un producto según el campo oculto editando-id.
 */
function guardarProducto() {
    const nombre = document.getElementById('producto-nombre').value.trim();
    const precioCosto = aDecimal(document.getElementById('producto-precioCosto').value);
    const precioVenta = aDecimal(document.getElementById('producto-precioVenta').value);
    const editandoId = document.getElementById('producto-editando-id').value;

    if (!nombre) {
        mostrarNotificacion('❌ El nombre es obligatorio', 'error');
        document.getElementById('producto-nombre').focus();
        return;
    }

    const datos = cargarDatos();

    if (editandoId) {
        // Editar producto existente
        const producto = datos.productos.find(p => p.id === parseInt(editandoId));
        if (producto) {
            const duplicado = datos.productos.find(
                p => p.nombre.toLowerCase() === nombre.toLowerCase() && p.id !== parseInt(editandoId)
            );
            if (duplicado) {
                mostrarNotificacion('❌ El nombre ya está en uso', 'error');
                document.getElementById('producto-nombre').focus();
                return;
            }
            producto.nombre = nombre;
            producto.precioCosto = precioCosto;
            producto.precioVenta = precioVenta;
            guardarDatos(datos);
            mostrarNotificacion('✅ Producto actualizado correctamente', 'success');
        }
    } else {
        // Crear nuevo producto
        const duplicado = datos.productos.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
        if (duplicado) {
            mostrarNotificacion('❌ El nombre ya está en uso', 'error');
            document.getElementById('producto-nombre').focus();
            return;
        }
        const nuevoProducto = {
            id: generarId(datos.productos),
            nombre,
            precioCosto,
            precioVenta,
            activo: true
        };
        datos.productos.push(nuevoProducto);
        guardarDatos(datos);
        mostrarNotificacion('✅ Producto añadido correctamente', 'success');
    }

    cerrarFormularioProducto();
    renderizarProductos();
}

/**
 * Carga un producto en el formulario para editarlo.
 */
function editarProducto(id) {
    const datos = cargarDatos();
    const producto = datos.productos.find(p => p.id === id);
    if (!producto) {
        mostrarNotificacion('❌ Producto no encontrado', 'error');
        return;
    }

    document.getElementById('form-producto-container').style.display = 'block';
    document.getElementById('form-producto-titulo').textContent = 'Editar Producto';
    document.getElementById('producto-nombre').value = producto.nombre;
    document.getElementById('producto-precioCosto').value = producto.precioCosto;
    document.getElementById('producto-precioVenta').value = producto.precioVenta;
    document.getElementById('producto-editando-id').value = producto.id;
    document.getElementById('producto-nombre').focus();
}

/**
 * Desactiva un producto (no lo borra).
 */
function eliminarProducto(id) {
    const datos = cargarDatos();
    const producto = datos.productos.find(p => p.id === id);
    if (!producto) return;

    if (!confirm(`⚠️ ¿Desactivar el producto "${producto.nombre}"?`)) return;

    producto.activo = false;
    guardarDatos(datos);
    renderizarProductos();
    mostrarNotificacion(`✅ Producto "${producto.nombre}" desactivado`, 'success');
}

/**
 * Reactiva un producto desactivado.
 */
function reactivarProducto(id) {
    const datos = cargarDatos();
    const producto = datos.productos.find(p => p.id === id);
    if (!producto) return;

    producto.activo = true;
    guardarDatos(datos);
    renderizarProductos();
    mostrarNotificacion(`✅ Producto "${producto.nombre}" reactivado`, 'success');
}
