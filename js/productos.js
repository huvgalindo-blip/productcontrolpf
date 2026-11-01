/**
 * ============================================================
 * MÓDULO: PRODUCTOS (v2)
 * ============================================================
 * Cambios v2:
 *   - Campo tipoBola obligatorio en cada producto
 *   - Formulario con <select> de tipo de bola
 *   - Columna "Tipo Bola" en la tabla
 *   - Migración automática al cargar la lista
 *   - Aviso visual si un producto no tiene tipoBola
 *
 * Dependencias: datos.js, utilidades.js, amasado.js
 * ============================================================
 */

// ============================================================
// 1. ESTRUCTURA DE PRODUCTO
// ============================================================

function crearProductoVacio() {
    return {
        id: 0,
        nombre: "",
        precioCosto: 0,
        precioVenta: 0,
        activo: true,
        tipoBola: null,
        pesoNeto: "",
        formato: "",
        ingredientesES: "",
        ingredientesPT: "",
        ingredientesFR: "",
        ingredientesEN: "",
        alergenosES: "",
        alergenosPT: "",
        alergenosFR: "",
        alergenosEN: "",
        nutricional: null
    };
}

function asegurarEstructuraProducto(producto) {
    const plantilla = crearProductoVacio();
    return Object.assign({}, plantilla, producto);
}

/**
 * Rellena tipoBola de los productos que no lo tengan usando
 * el mapa derivado de CONFIGURACION_AMASADO.
 * Idempotente.
 */
function migrarProductosSinTipoBola(datos) {
    const productosSinTipo = datos.productos.filter(
        p => p.tipoBola === null || p.tipoBola === undefined
    );
    if (productosSinTipo.length === 0) return 0;

    // Intentar resolver por nombre contra el mapa de amasado
    if (typeof construirMapaProductoATipoBola === 'function') {
        const mapa = construirMapaProductoATipoBola();
        let migrados = 0;
        productosSinTipo.forEach(p => {
            if (mapa[p.nombre]) {
                p.tipoBola = mapa[p.nombre];
                migrados++;
            }
        });
        if (migrados > 0) guardarDatos(datos);
        return migrados;
    }
    return 0;
}

// ============================================================
// 2. CONSULTAS DE PRODUCTOS
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

function obtenerTiposBolaDisponibles() {
    if (typeof obtenerTiposBola === 'function') {
        return obtenerTiposBola();
    }
    return [];
}
// ============================================================
// 3. RENDERIZADO DE LA VISTA PRODUCTOS
// ============================================================

function renderizarProductos() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();

    // Migración automática al cargar la lista
    migrarProductosSinTipoBola(datos);

    // Normalizar estructura
    datos.productos = datos.productos.map(asegurarEstructuraProducto);

    const tiposBola = obtenerTiposBolaDisponibles();
    const productosConTipoBola = datos.productos.filter(p => p.tipoBola);
    const productosSinTipoBola = datos.productos.filter(p => !p.tipoBola);

    // Opciones para el select de tipo de bola
    const opcionesTipoBola = tiposBola
        .map(t => `<option value="${escaparHTML(t)}">${escaparHTML(t)}</option>`)
        .join('');

    let html = `
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>📦 Productos</h2>
                    <span class="subtitle">
                        ${datos.productos.filter(p => p.activo).length} activos de ${datos.productos.length} totales
                        ${productosSinTipoBola.length > 0
                            ? ` · <span style="color: var(--error); font-weight: bold;">⚠️ ${productosSinTipoBola.length} sin tipo de bola</span>`
                            : ''}
                    </span>
                </div>
                <button class="btn btn-primary" onclick="mostrarFormularioProducto()">➕ Añadir Producto</button>
            </div>

            ${productosSinTipoBola.length > 0 ? `
                <div style="background: #FFF3E0; border-left: 4px solid var(--warning); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>⚠️ Productos sin tipo de bola asignado:</strong>
                    ${productosSinTipoBola.map(p => escaparHTML(p.nombre)).join(', ')}.
                    <br>
                    <span style="font-size: 0.85rem; color: #666;">
                        Edita cada producto y asígnale un tipo de bola para que cuente en el amasado.
                    </span>
                </div>
            ` : ''}

            <div id="form-producto-container" style="display: none; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                <h3 id="form-producto-titulo">Añadir Producto</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="producto-nombre">Nombre *</label>
                        <input type="text" id="producto-nombre" placeholder="Ej: Pizza Familiar" required>
                    </div>
                    <div class="form-group">
                        <label for="producto-tipoBola">Tipo de bola *</label>
                        <select id="producto-tipoBola" required>
                            <option value="">— Seleccionar tipo —</option>
                            ${opcionesTipoBola}
                        </select>
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
                            <th>Tipo Bola</th>
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
                <td colspan="8" class="text-center" style="padding: 30px; color: #999;">
                    No hay productos registrados
                </td>
            </tr>
        `;
    } else {
        datos.productos.forEach(producto => {
            const margen = producto.precioVenta > 0
                ? Math.round(((producto.precioVenta - producto.precioCosto) / producto.precioVenta) * 10000) / 100
                : 0;

            const tipoBolaHTML = producto.tipoBola
                ? `<span style="background: #E3F2FD; color: #1565C0; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">${escaparHTML(producto.tipoBola)}</span>`
                : `<span style="background: #FFEBEE; color: #C62828; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 600;" title="Sin tipo de bola asignado">⚠️ Sin asignar</span>`;

            html += `
                <tr>
                    <td>${producto.id}</td>
                    <td><strong>${escaparHTML(producto.nombre)}</strong></td>
                    <td>${tipoBolaHTML}</td>
                    <td>${(producto.precioCosto || 0).toFixed(2)} €</td>
                    <td>${(producto.precioVenta || 0).toFixed(2)} €</td>
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
// 4. FORMULARIO DE PRODUCTOS
// ============================================================

function mostrarFormularioProducto() {
    document.getElementById('form-producto-container').style.display = 'block';
    document.getElementById('form-producto-titulo').textContent = 'Añadir Producto';
    document.getElementById('producto-nombre').value = '';
    document.getElementById('producto-tipoBola').value = '';
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
// 5. CRUD DE PRODUCTOS
// ============================================================

function guardarProducto() {
    const nombre = document.getElementById('producto-nombre').value.trim();
    const tipoBola = document.getElementById('producto-tipoBola').value;
    const precioCosto = aDecimal(document.getElementById('producto-precioCosto').value);
    const precioVenta = aDecimal(document.getElementById('producto-precioVenta').value);
    const editandoId = document.getElementById('producto-editando-id').value;

    if (!nombre) {
        mostrarNotificacion('❌ El nombre es obligatorio', 'error');
        document.getElementById('producto-nombre').focus();
        return;
    }
    if (!tipoBola) {
        mostrarNotificacion('❌ El tipo de bola es obligatorio', 'error');
        document.getElementById('producto-tipoBola').focus();
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
            producto.tipoBola = tipoBola;
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
        const nuevoProducto = Object.assign(crearProductoVacio(), {
            id: generarId(datos.productos),
            nombre,
            tipoBola,
            precioCosto,
            precioVenta,
            activo: true
        });
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
    document.getElementById('producto-tipoBola').value = producto.tipoBola || '';
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
// 6. FICHA TÉCNICA DEL PRODUCTO
// ============================================================

function editarFichaTecnicaProducto(id) {
    const datos = cargarDatos();
    const producto = datos.productos.find(p => p.id === id);
    if (!producto) {
        mostrarNotificacion('❌ Producto no encontrado', 'error');
        return;
    }

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
            energiaKJ: 1160, energiaKcal: 274, grasas: 4.3, grasasSaturadas: 1.2,
            hidratos: 50, azucares: 0.5, proteinas: 8.6, sal: 1.5
        }
    };

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

    const pesoNeto = prompt('📦 Peso neto (ej: 100 g):', ficha.pesoNeto);
    if (pesoNeto === null) return;
    const formato = prompt('📐 Formato (ej: Single 100 g):', ficha.formato);
    if (formato === null) return;

    const ingredientesES = prompt('🥣 Ingredientes (ES):', ficha.ingredientesES);
    if (ingredientesES === null) return;
    const ingredientesPT = prompt('🥣 Ingredientes (PT):', ficha.ingredientesPT);
    if (ingredientesPT === null) return;
    const ingredientesFR = prompt('🥣 Ingredientes (FR):', ficha.ingredientesFR);
    if (ingredientesFR === null) return;
    const ingredientesEN = prompt('🥣 Ingredientes (EN):', ficha.ingredientesEN);
    if (ingredientesEN === null) return;

    const alergenosES = prompt('⚠️ Alérgenos (ES):', ficha.alergenosES);
    if (alergenosES === null) return;
    const alergenosPT = prompt('⚠️ Alérgenos (PT):', ficha.alergenosPT);
    if (alergenosPT === null) return;
    const alergenosFR = prompt('⚠️ Alérgenos (FR):', ficha.alergenosFR);
    if (alergenosFR === null) return;
    const alergenosEN = prompt('⚠️ Alérgenos (EN):', ficha.alergenosEN);
    if (alergenosEN === null) return;

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
