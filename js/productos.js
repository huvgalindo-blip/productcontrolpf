/**
 * ============================================================
 * MÓDULO: PRODUCTOS (v3)
 * ============================================================
 * Cambios v3:
 *   - Botón "➕ Crear nuevo tipo" junto al select de tipo de bola
 *   - Modal para crear tipos nuevos (nombre, peso, caja, bolas)
 *   - Los tipos se guardan en datos.tiposBola
 *   - Al crear un tipo nuevo, se selecciona automáticamente
 *
 * Dependencias: datos.js, utilidades.js
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

/**
 * Devuelve la lista de nombres de tipos de bola desde datos.tiposBola.
 * Si no existe, devuelve array vacío.
 */
function obtenerTiposBolaDisponibles() {
    const datos = cargarDatos();
    const tipos = datos.tiposBola || {};
    return Object.keys(tipos);
}

// ============================================================
// 3. CREAR TIPO DE BOLA NUEVO (modal)
// ============================================================

/**
 * Abre un modal para crear un tipo de bola nuevo.
 * Al guardar, lo añade a datos.tiposBola y lo selecciona en el formulario.
 */
function abrirModalNuevoTipoBola() {
    // Crear el HTML del modal
    const modalHTML = `
        <div id="modal-tipo-bola" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
        ">
            <div style="
                background: white; padding: 25px; border-radius: 10px;
                max-width: 500px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <h3 style="margin-bottom: 15px; color: var(--secondary);">➕ Crear nuevo tipo de bola</h3>

                <div class="form-group">
                    <label for="ntb-nombre">Nombre del tipo *</label>
                    <input type="text" id="ntb-nombre" placeholder="Ej: Espelta Pequeña" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>

                <div class="form-group">
                    <label for="ntb-peso">Peso por bola (g) *</label>
                    <input type="number" id="ntb-peso" min="1" step="1" placeholder="Ej: 150" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>

                <div class="form-group">
                    <label for="ntb-tipoCaja">Tipo de caja *</label>
                    <select id="ntb-tipoCaja" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                        <option value="Pequeña">Pequeña</option>
                        <option value="Mediana" selected>Mediana</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="ntb-maxCajas">Número máximo de cajas *</label>
                    <input type="number" id="ntb-maxCajas" min="1" step="1" value="15" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>

                <div class="form-group">
                    <label for="ntb-opcionesBolas">Opciones de bolas por caja * <small>(separadas por coma)</small></label>
                    <input type="text" id="ntb-opcionesBolas" placeholder="Ej: 8, 10, 11" value="8" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>

                <div class="flex gap-10" style="margin-top: 20px; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="cerrarModalNuevoTipoBola()">❌ Cancelar</button>
                    <button class="btn btn-primary" onclick="guardarNuevoTipoBola()">💾 Crear tipo</button>
                </div>
            </div>
        </div>
    `;

    // Añadir el modal al body
    const divExistente = document.getElementById('modal-tipo-bola');
    if (divExistente) divExistente.remove();

    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
}

/**
 * Cierra el modal de crear tipo de bola.
 */
function cerrarModalNuevoTipoBola() {
    const modal = document.getElementById('modal-tipo-bola');
    if (modal) modal.remove();
}

/**
 * Guarda el tipo de bola nuevo en datos.tiposBola.
 * Valida los datos, añade el tipo, lo selecciona en el <select> del formulario.
 */
function guardarNuevoTipoBola() {
    const nombre = document.getElementById('ntb-nombre')?.value.trim() || '';
    const peso = parseFloat(document.getElementById('ntb-peso')?.value) || 0;
    const tipoCaja = document.getElementById('ntb-tipoCaja')?.value || 'Mediana';
    const maxCajas = parseInt(document.getElementById('ntb-maxCajas')?.value) || 0;
    const opcionesStr = document.getElementById('ntb-opcionesBolas')?.value || '';

    // Validaciones
    if (!nombre) {
        mostrarNotificacion('❌ El nombre del tipo es obligatorio', 'error');
        return;
    }
    if (peso <= 0) {
        mostrarNotificacion('❌ El peso debe ser un número positivo', 'error');
        return;
    }
    if (maxCajas < 1) {
        mostrarNotificacion('❌ El número máximo de cajas debe ser mayor que 0', 'error');
        return;
    }

    // Parsear opciones de bolas: "8, 10, 11" → [8, 10, 11]
    const opciones = opcionesStr
        .split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n) && n > 0);

    if (opciones.length === 0) {
        mostrarNotificacion('❌ Debe haber al menos una opción de bolas por caja', 'error');
        return;
    }

    // Comprobar que no exista
    const datos = cargarDatos();
    if (!datos.tiposBola) datos.tiposBola = {};
    if (datos.tiposBola[nombre]) {
        mostrarNotificacion(`❌ Ya existe un tipo de bola llamado "${nombre}"`, 'error');
        return;
    }

    // Crear el tipo
    datos.tiposBola[nombre] = {
        peso: peso,
        configuraciones: [
            { tipoCaja: tipoCaja, maxCajas: maxCajas, opcionesBolas: opciones }
        ],
        productosDestino: []
    };

    guardarDatos(datos);

    // Cerrar modal
    cerrarModalNuevoTipoBola();

    // Actualizar el <select> del formulario de producto
    const selectTipoBola = document.getElementById('producto-tipoBola');
    if (selectTipoBola) {
        const opt = document.createElement('option');
        opt.value = nombre;
        opt.textContent = nombre;
        opt.selected = true;
        selectTipoBola.appendChild(opt);
        selectTipoBola.value = nombre;
    }

    mostrarNotificacion(`✅ Tipo "${nombre}" creado y seleccionado`, 'success');
}

// ============================================================
// 4. RENDERIZADO DE LA VISTA PRODUCTOS
// ============================================================

function renderizarProductos() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();

    datos.productos = datos.productos.map(asegurarEstructuraProducto);

    const tiposBola = obtenerTiposBolaDisponibles();
    const productosSinTipoBola = datos.productos.filter(p => !p.tipoBola);

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
                        <div style="display: flex; gap: 6px;">
                            <select id="producto-tipoBola" required style="flex: 1;">
                                <option value="">— Seleccionar tipo —</option>
                                ${opcionesTipoBola}
                            </select>
                            <button type="button" class="btn btn-success btn-sm" onclick="abrirModalNuevoTipoBola()" title="Crear tipo de bola nuevo" style="background: #28a745; white-space: nowrap;">➕ Nuevo tipo</button>
                        </div>
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
                : `<span style="background: #FFEBEE; color: #C62828; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">⚠️ Sin asignar</span>`;

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
                        <button class="btn btn-info btn-sm" onclick="editarFichaTecnicaProducto(${producto.id})" title="Ficha técnica" style="background: #17a2b8; color: white;">📋</button>
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
// 5. FORMULARIO DE PRODUCTOS
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
// 6. CRUD DE PRODUCTOS
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
// 7. FICHA TÉCNICA
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
        alergenosES: 'SOJA Y MOSTARDA.',
        alergenosPT: 'SOJA E MOSTARDA.',
        alergenosFR: 'SOJA ET MOUTARDE.',
        alergenosEN: 'SOY AND MUSTARD.',
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

    const pesoNeto = prompt('📦 Peso neto:', ficha.pesoNeto);
    if (pesoNeto === null) return;
    const formato = prompt('📐 Formato:', ficha.formato);
    if (formato === null) return;
    const ingES = prompt('🥣 Ingredientes (ES):', ficha.ingredientesES);
    if (ingES === null) return;
    const ingPT = prompt('🥣 Ingredientes (PT):', ficha.ingredientesPT);
    if (ingPT === null) return;
    const ingFR = prompt('🥣 Ingredientes (FR):', ficha.ingredientesFR);
    if (ingFR === null) return;
    const ingEN = prompt('🥣 Ingredientes (EN):', ficha.ingredientesEN);
    if (ingEN === null) return;
    const alES = prompt('⚠️ Alérgenos (ES):', ficha.alergenosES);
    if (alES === null) return;
    const alPT = prompt('⚠️ Alérgenos (PT):', ficha.alergenosPT);
    if (alPT === null) return;
    const alFR = prompt('⚠️ Alérgenos (FR):', ficha.alergenosFR);
    if (alFR === null) return;
    const alEN = prompt('⚠️ Alérgenos (EN):', ficha.alergenosEN);
    if (alEN === null) return;
    const kj = prompt('🔥 Energía (KJ):', ficha.nutricional.energiaKJ);
    if (kj === null) return;
    const kcal = prompt('🔥 Energía (kcal):', ficha.nutricional.energiaKcal);
    if (kcal === null) return;
    const gr = prompt('🧈 Grasas (g):', ficha.nutricional.grasas);
    if (gr === null) return;
    const grSat = prompt('🧈 Grasas saturadas (g):', ficha.nutricional.grasasSaturadas);
    if (grSat === null) return;
    const hid = prompt('🍞 Hidratos (g):', ficha.nutricional.hidratos);
    if (hid === null) return;
    const azu = prompt('🍯 Azúcares (g):', ficha.nutricional.azucares);
    if (azu === null) return;
    const prot = prompt('💪 Proteínas (g):', ficha.nutricional.proteinas);
    if (prot === null) return;
    const sal = prompt('🧂 Sal (g):', ficha.nutricional.sal);
    if (sal === null) return;

    producto.pesoNeto = pesoNeto.trim();
    producto.formato = formato.trim();
    producto.ingredientesES = ingES.trim();
    producto.ingredientesPT = ingPT.trim();
    producto.ingredientesFR = ingFR.trim();
    producto.ingredientesEN = ingEN.trim();
    producto.alergenosES = alES.trim();
    producto.alergenosPT = alPT.trim();
    producto.alergenosFR = alFR.trim();
    producto.alergenosEN = alEN.trim();
    producto.nutricional = {
        energiaKJ: parseFloat(kj) || 0,
        energiaKcal: parseFloat(kcal) || 0,
        grasas: parseFloat(gr) || 0,
        grasasSaturadas: parseFloat(grSat) || 0,
        hidratos: parseFloat(hid) || 0,
        azucares: parseFloat(azu) || 0,
        proteinas: parseFloat(prot) || 0,
        sal: parseFloat(sal) || 0
    };

    guardarDatos(datos);
    mostrarNotificacion(`✅ Ficha técnica actualizada`, 'success');
    renderizarProductos();
}
