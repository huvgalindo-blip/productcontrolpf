/**
 * ============================================================
 * MÓDULO: PRODUCTOS
 * ============================================================
 * Responsabilidades:
 *   - Consultas de productos (activos, precios, búsqueda)
 *   - CRUD de productos (crear, editar, activar, desactivar)
 *   - Ficha técnica editable (ingredientes, alérgenos, nutricional)
 *   - Renderizado de la vista de Productos
 * 
 * Dependencias: datos.js, utilidades.js
 * ============================================================
 */

// ============================================================
// 1. CONSULTAS DE PRODUCTOS
// ============================================================

function obtenerProductosActivos(datos) {
    return datos.productos.filter(p => p.activo === true);
}

function obtenerPrecioVenta(datos, nombre) {
    const p = datos.productos.find(x => x.nombre === nombre && x.activo);
    return p ? p.precioVenta : 0;
}

function obtenerPrecioCosto(datos, nombre) {
    const p = datos.productos.find(x => x.nombre === nombre && x.activo);
    return p ? p.precioCosto : 0;
}

function obtenerProductoPorNombre(datos, nombre) {
    return datos.productos.find(p => p.nombre === nombre && p.activo) || null;
}

// ============================================================
// 2. RENDERIZADO DE LA VISTA PRODUCTOS
// ============================================================

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
                        <button class="btn btn-info btn-sm" onclick="editarFichaTecnicaProducto(${producto.id})" title="Ficha técnica (ingredientes, alérgenos, nutricional)" style="background: #17a2b8; color: white;">📋</button>
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

function reactivarProducto(id) {
    const datos = cargarDatos();
    const producto = datos.productos.find(p => p.id === id);
    if (!producto) return;

    producto.activo = true;
    guardarDatos(datos);
    renderizarProductos();
    mostrarNotificacion(`✅ Producto "${producto.nombre}" reactivado`, 'success');
}

// ============================================================
// 5. FICHA TÉCNICA DEL PRODUCTO
// ============================================================
// La ficha técnica incluye:
//   - Peso neto y formato
//   - Ingredientes en 4 idiomas (ES, PT, FR, EN)
//   - Alérgenos en 4 idiomas
//   - Información nutricional (por 100 g)
// Se usa en el módulo de etiquetas para generar la info legal.
// ============================================================

/**
 * Abre el editor de ficha técnica del producto.
 * Permite editar ingredientes, alérgenos y nutricional.
 * Los cambios se guardan directamente en el producto.
 */
function editarFichaTecnicaProducto(id) {
    const datos = cargarDatos();
    const producto = datos.productos.find(p => p.id === id);
    if (!producto) {
        mostrarNotificacion('❌ Producto no encontrado', 'error');
        return;
    }

    // Valores por defecto (Hermanos Viudes S.L.)
    const defecto = {
        pesoNeto: '',
        formato: '',
        ingredientesES: 'Harina de trigo (gluten), agua, sal, levadura, aceite de oliva.',
        ingredientesPT: 'Farinha de trigo (glúten), água, sal, fermento, azeite de oliva.',
        ingredientesFR: 'Farine de blé (gluten), eau, sel, levure, huile d\'olive.',
        ingredientesEN: 'Wheat flour (gluten), water, salt, yeast, olive oil.',
        alergenosES: 'SOJA Y MOSTARDA (No presente en la formulación, pero no se puede descartar por contaminación cruzada).',
        alergenosPT: 'SOJA E MOSTARDA (Presentes na formulação, mas não podem ser descartadas devido à contaminação cruzada).',
        alergenosFR: 'SOJA ET MOUTARDE (Non présents dans la formulation, mais ne peuvent être exclus en raison d\'une contamination croisée).',
        alergenosEN: 'SOY AND MUSTARD (Not present in the formulation, but cannot be ruled out due to cross-contamination).',
        nutricional: {
            energiaKJ: 1160,
            energiaKcal: 274,
            grasas: 4.3,
            grasasSaturadas: 1.2,
            hidratos: 50,
            azucares: 0.5,
            proteinas: 8.6,
            sal: 1.5
        }
    };

    // Combinar valores actuales del producto con los por defecto
    const ficha = {
        pesoNeto: producto.pesoNeto || defecto.pesoNeto,
        formato: producto.formato || defecto.formato,
        ingredientesES: producto.ingredientesES || defecto.ingredientesES,
        ingredientesPT: producto.ingredientesPT || defecto.ingredientesPT,
        ingredientesFR: producto.ingredientesFR || defecto.ingredientesFR,
        ingredientesEN: producto.ingredientesEN || defecto.ingredientesEN,
        alergenosES: producto.alergenosES || defecto.alergenosES,
        alergenosPT: producto.alergenosPT || defecto.alergenosPT,
        alergenosFR: producto.alergenosFR || defecto.alergenosFR,
        alergenosEN: producto.alergenosEN || defecto.alergenosEN,
        nutricional: producto.nutricional || { ...defecto.nutricional }
    };

    // --- 1. Datos generales ---
    const pesoNeto = prompt('📦 Peso neto (ej: 100 g):', ficha.pesoNeto);
    if (pesoNeto === null) return;
    const formato = prompt('📐 Formato (ej: Single 100 g):', ficha.formato);
    if (formato === null) return;

    // --- 2. Ingredientes por idioma ---
    const ingredientesES = prompt('🥣 Ingredientes (ES):', ficha.ingredientesES);
    if (ingredientesES === null) return;
    const ingredientesPT = prompt('🥣 Ingredientes (PT):', ficha.ingredientesPT);
    if (ingredientesPT === null) return;
    const ingredientesFR = prompt('🥣 Ingredientes (FR):', ficha.ingredientesFR);
    if (ingredientesFR === null) return;
    const ingredientesEN = prompt('🥣 Ingredientes (EN):', ficha.ingredientesEN);
    if (ingredientesEN === null) return;

    // --- 3. Alérgenos por idioma ---
    const alergenosES = prompt('⚠️ Alérgenos (ES):', ficha.alergenosES);
    if (alergenosES === null) return;
    const alergenosPT = prompt('⚠️ Alérgenos (PT):', ficha.alergenosPT);
    if (alergenosPT === null) return;
    const alergenosFR = prompt('⚠️ Alérgenos (FR):', ficha.alergenosFR);
    if (alergenosFR === null) return;
    const alergenosEN = prompt('⚠️ Alérgenos (EN):', ficha.alergenosEN);
    if (alergenosEN === null) return;

    // --- 4. Información nutricional (por 100 g) ---
    const energiaKJ = prompt('🔥 Energía (KJ) por 100g:', ficha.nutricional.energiaKJ);
    if (energiaKJ === null) return;
    const energiaKcal = prompt('🔥 Energía (kcal) por 100g:', ficha.nutricional.energiaKcal);
    if (energiaKcal === null) return;
    const grasas = prompt('🧈 Grasas (g) por 100g:', ficha.nutricional.grasas);
    if (grasas === null) return;
    const grasasSaturadas = prompt('🧈 Grasas saturadas (g) por 100g:', ficha.nutricional.grasasSaturadas);
    if (grasasSaturadas === null) return;
    const hidratos = prompt('🍞 Hidratos de carbono (g) por 100g:', ficha.nutricional.hidratos);
    if (hidratos === null) return;
    const azucares = prompt('🍯 Azúcares (g) por 100g:', ficha.nutricional.azucares);
    if (azucares === null) return;
    const proteinas = prompt('💪 Proteínas (g) por 100g:', ficha.nutricional.proteinas);
    if (proteinas === null) return;
    const sal = prompt('🧂 Sal (g) por 100g:', ficha.nutricional.sal);
    if (sal === null) return;

    // --- 5. Guardar cambios en el producto ---
    producto.pesoNeto = pesoNeto.trim();
    producto.formato = formato.trim();
    producto.ingredientesES = ingredientesES.trim();
    producto.ingredientesPT = ingredientesPT.trim();
    producto.ingredientesFR = ingredientesFR.trim();
    producto.ingredientesEN = ingredientesEN.trim();
    producto.alergenosES = alergenosES.trim();
    producto.alergenosPT = alergenosPT.trim();
    producto.alergenosFR = alergenosFR.trim();
    producto.alergenosEN = alergenosEN.trim();
    producto.nutricional = {
        energiaKJ: parseFloat(energiaKJ) || 0,
        energiaKcal: parseFloat(energiaKcal) || 0,
        grasas: parseFloat(grasas) || 0,
        grasasSaturadas: parseFloat(grasasSaturadas) || 0,
        hidratos: parseFloat(hidratos) || 0,
        azucares: parseFloat(azucares) || 0,
        proteinas: parseFloat(proteinas) || 0,
        sal: parseFloat(sal) || 0
    };

    guardarDatos(datos);
    mostrarNotificacion(`✅ Ficha técnica de "${producto.nombre}" actualizada`, 'success');
    renderizarProductos();
}
