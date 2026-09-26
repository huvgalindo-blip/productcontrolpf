/**
 * ============================================================
 * MÓDULO: CALCULADORA DE MASA
 * ============================================================
 * Responsabilidades:
 *   - Calculadora dinámica de recetas de masa y biga
 *   - Harinas e ingredientes editables
 *   - Cálculo en tiempo real
 *   - Guardar/cargar/duplicar/eliminar recetas
 *   - Impresión y exportación CSV
 * 
 * Dependencias: datos.js, utilidades.js
 * 
 * Estructura en localStorage:
 *   - datos.recetasMasa: {}  (diccionario por id)
 *   - datos.recetaActiva: "id-receta"
 * ============================================================
 */

// ============================================================
// 1. CONSTANTES Y ESTADO LOCAL
// ============================================================

const UNIDADES_VALIDAS = ['kg', 'L', 'g'];
const CLAVE_RECETA_ACTIVA = 'recetaActivaMasa';

// Estado en memoria (no persiste) para el filtro/edición actual
let recetaEnEdicion = null;

// ============================================================
// 2. RECETA POR DEFECTO (basada en el Excel)
// ============================================================

/**
 * Devuelve la receta estándar del Excel (versión verano).
 */
function crearRecetaPorDefecto(nombre = 'Receta Estándar Verano') {
    return {
        id: 'receta-default-verano',
        nombre: nombre,
        descripcion: 'Masa base con biga — receta estándar',
        kilosHarina: 25,
        estacion: 'verano',
        harinas: [
            { id: 'h1', nombre: 'Harina de trigo', porcentaje: 100 },
            { id: 'h2', nombre: 'Harina 01', porcentaje: 0 },
            { id: 'h3', nombre: 'Harina 02', porcentaje: 0 }
        ],
        ingredientes: [
            { id: 'i1', nombre: 'Agua', porcentaje: 54, unidad: 'L' },
            { id: 'i2', nombre: 'Levadura', porcentaje: 0.15, unidad: 'g' },
            { id: 'i3', nombre: 'Biga', porcentaje: 25, unidad: 'kg' },
            { id: 'i4', nombre: 'Sal', porcentaje: 2, unidad: 'g' },
            { id: 'i5', nombre: 'Aceite', porcentaje: 1, unidad: 'g' },
            { id: 'i6', nombre: 'Girasol', porcentaje: 1, unidad: 'g' },
            { id: 'i7', nombre: 'Malta', porcentaje: 0.5, unidad: 'g' },
            { id: 'i8', nombre: 'Vinagre', porcentaje: 0.5, unidad: 'g' }
        ],
        biga: {
            harina: 100,
            agua: 51,
            levadura: 0.06,
            panatura: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

/**
 * Devuelve la receta estándar en versión invierno.
 */
function crearRecetaInvierno() {
    const receta = crearRecetaPorDefecto('Receta Estándar Invierno');
    receta.id = 'receta-default-invierno';
    receta.estacion = 'invierno';
    receta.descripcion = 'Masa base con biga — receta de invierno';
    // Ajustar % de agua de la biga (56% en invierno)
    receta.biga.agua = 56;
    // Ajustar agua de la masa principal
    const agua = receta.ingredientes.find(i => i.nombre.toLowerCase() === 'agua');
    if (agua) agua.porcentaje = 56;
    return receta;
}

// ============================================================
// 3. PERSISTENCIA DE RECETAS
// ============================================================

/**
 * Obtiene el diccionario de recetas guardadas.
 * Si no existe, inicializa con las 2 recetas por defecto.
 */
function obtenerRecetasMasa(datos) {
    if (!datos.recetasMasa || typeof datos.recetasMasa !== 'object') {
        datos.recetasMasa = {};
        const verano = crearRecetaPorDefecto();
        const invierno = crearRecetaInvierno();
        datos.recetasMasa[verano.id] = verano;
        datos.recetasMasa[invierno.id] = invierno;
        guardarDatos(datos);
    }
    return datos.recetasMasa;
}

/**
 * Obtiene la receta activa o la primera disponible.
 */
function obtenerRecetaActiva() {
    const datos = cargarDatos();
    const recetas = obtenerRecetasMasa(datos);

    // Prioridad: receta activa guardada > primera del diccionario
    let idActiva = datos[CLAVE_RECETA_ACTIVA];
    if (!idActiva || !recetas[idActiva]) {
        idActiva = Object.keys(recetas)[0];
    }

    return {
        datos,
        receta: JSON.parse(JSON.stringify(recetas[idActiva])),
        idActiva
    };
}

/**
 * Guarda la receta actual como activa.
 */
function persistirRecetaActiva(datos, receta) {
    if (!datos.recetasMasa) datos.recetasMasa = {};
    receta.updatedAt = new Date().toISOString();
    datos.recetasMasa[receta.id] = receta;
    datos[CLAVE_RECETA_ACTIVA] = receta.id;
    guardarDatos(datos);
}

// ============================================================
// 4. CÁLCULO DE LA RECETA
// ============================================================

/**
 * Calcula las cantidades finales de una receta dado los kilos de harina.
 * 
 * Regla:
 *   - Harinas: se reparten los kilos según porcentaje (suma = 100%)
 *   - Ingredientes: porcentaje sobre harina total
 *     · unidad kg → kilos = kilosHarina × (% / 100)
 *     · unidad L  → litros = kilosHarina × (% / 100)
 *     · unidad g  → gramos = kilosHarina × (% / 100) × 1000
 *   - Biga: se calcula sobre los kg de biga que pide la receta principal
 *     y se reparte según los porcentajes de biga
 */
function calcularReceta(receta) {
    const kgHarina = parseFloat(receta.kilosHarina) || 0;

    // --- Harinas ---
    const harinasCalculadas = receta.harinas.map(h => {
        const porcentaje = parseFloat(h.porcentaje) || 0;
        return {
            ...h,
            cantidad: redondear2(kgHarina * porcentaje / 100)
        };
    });

    // --- Ingredientes ---
    const ingredientesCalculados = receta.ingredientes.map(i => {
        const porcentaje = parseFloat(i.porcentaje) || 0;
        const cantidadBase = kgHarina * porcentaje / 100;

        let cantidad;
        switch (i.unidad) {
            case 'kg':
                cantidad = redondear2(cantidadBase);
                break;
            case 'L':
                cantidad = redondear2(cantidadBase);
                break;
            case 'g':
                cantidad = Math.round(cantidadBase * 1000);
                break;
            default:
                cantidad = redondear2(cantidadBase);
        }

        return { ...i, cantidad };
    });

    // --- Biga ---
    // La cantidad de biga viene marcada por el ingrediente "Biga" de la receta principal
    const ingBiga = ingredientesCalculados.find(i =>
        i.nombre.toLowerCase() === 'biga'
    );
    const kgBiga = ingBiga ? ingBiga.cantidad : 0;

    const bigaCalculada = {
        harina: redondear2(kgBiga * (receta.biga.harina / 100)),
        agua: redondear2(kgBiga * (receta.biga.agua / 100)),
        levadura: Math.round(kgBiga * (receta.biga.levadura / 100) * 1000),
        panatura: Math.round(kgBiga * (receta.biga.panatura / 100) * 1000)
    };

    return {
        harinas: harinasCalculadas,
        ingredientes: ingredientesCalculados,
        biga: bigaCalculada,
        kgHarina,
        totalHarinas: redondear2(
            harinasCalculadas.reduce((sum, h) => sum + h.cantidad, 0)
        )
    };
}

/**
 * Formatea una cantidad según su unidad para mostrarla.
 */
function formatearCantidad(cantidad, unidad) {
    if (unidad === 'g') return `${cantidad} g`;
    if (unidad === 'kg') return `${cantidad.toFixed(2)} kg`;
    if (unidad === 'L') return `${cantidad.toFixed(2)} L`;
    return `${cantidad} ${unidad}`;
}

// ============================================================
// 5. RENDERIZADO DE LA VISTA
// ============================================================

/**
 * Renderiza la vista completa de la calculadora.
 */
function renderizarCalculadoraMasa() {
    const container = document.getElementById('vista-container');
    container.innerHTML = '<div class="loading">Cargando calculadora...</div>';

    setTimeout(() => {
        try {
            const { datos, receta, idActiva } = obtenerRecetaActiva();
            recetaEnEdicion = receta;

            const calculo = calcularReceta(receta);
            const recetas = obtenerRecetasMasa(datos);

            const sumaPorcentajesHarinas = receta.harinas.reduce(
                (s, h) => s + (parseFloat(h.porcentaje) || 0), 0
            );
            const sumaCorrecta = Math.abs(sumaPorcentajesHarinas - 100) < 0.01;

            let html = `
                <div class="vista active">
                    <div class="vista-header">
                        <div>
                            <h2>🧮 Calculadora de Masa</h2>
                            <span class="subtitle">Receta dinámica de masa y biga</span>
                        </div>
                        <div class="flex gap-10">
                            <button class="btn btn-secondary btn-sm" onclick="abrirModalRecetas()">📂 Recetas</button>
                            <button class="btn btn-primary btn-sm" onclick="guardarRecetaActual()">💾 Guardar</button>
                            <button class="btn btn-secondary btn-sm" onclick="imprimirReceta()">🖨️ Imprimir</button>
                            <button class="btn btn-secondary btn-sm" onclick="exportarRecetaCSV()">📥 CSV</button>
                            <button class="btn btn-secondary btn-sm" onclick="cambiarVista('amasado')">◀ Volver</button>
                        </div>
                    </div>

                    <!-- CABECERA DE LA RECETA -->
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                        <div class="form-row">
                            <div class="form-group" style="grid-column: span 2;">
                                <label>📝 Nombre de la receta</label>
                                <input type="text" id="receta-nombre" value="${escaparHTML(receta.nombre)}"
                                       onchange="actualizarNombreReceta(this.value)">
                            </div>
                            <div class="form-group">
                                <label>🌾 Kilos de harina</label>
                                <input type="number" id="receta-kilos" min="0.1" step="0.1"
                                       value="${receta.kilosHarina}"
                                       onchange="actualizarKilosHarina(this.value)">
                            </div>
                            <div class="form-group">
                                <label>☀️ Estación</label>
                                <select id="receta-estacion" onchange="actualizarEstacion(this.value)">
                                    <option value="verano" ${receta.estacion === 'verano' ? 'selected' : ''}>☀️ Verano (54%)</option>
                                    <option value="invierno" ${receta.estacion === 'invierno' ? 'selected' : ''}>❄️ Invierno (56%)</option>
                                    <option value="personalizado" ${receta.estacion === 'personalizado' ? 'selected' : ''}>⚙️ Personalizado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- DOS COLUMNAS: HARINAS + INGREDIENTES -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">

                        <!-- HARINAS -->
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <div class="flex-between mb-10">
                                <h3>🌾 Harinas</h3>
                                <button class="btn btn-primary btn-sm" onclick="añadirHarina()">➕ Añadir</button>
                            </div>
                            <table style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th style="text-align: left;">Nombre</th>
                                        <th>%</th>
                                        <th>Cantidad</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${calculo.harinas.map((h, idx) => `
                                        <tr>
                                            <td>
                                                <input type="text" value="${escaparHTML(h.nombre)}"
                                                       style="width: 100%; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px;"
                                                       onchange="actualizarHarina(${idx}, 'nombre', this.value)">
                                            </td>
                                            <td>
                                                <input type="number" min="0" max="100" step="0.1"
                                                       value="${h.porcentaje}"
                                                       style="width: 60px; text-align: center; padding: 4px; border: 1px solid #ddd; border-radius: 4px;"
                                                       onchange="actualizarHarina(${idx}, 'porcentaje', this.value)">
                                            </td>
                                            <td style="text-align: right; font-weight: bold; color: var(--primary);">
                                                ${h.cantidad.toFixed(2)} kg
                                            </td>
                                            <td>
                                                <button class="btn btn-danger btn-sm"
                                                        onclick="eliminarHarina(${idx})"
                                                        ${receta.harinas.length <= 1 ? 'disabled' : ''}
                                                        title="${receta.harinas.length <= 1 ? 'Debe haber al menos 1' : 'Eliminar'}">🗑️</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr style="background: #f5f5f5; font-weight: bold;">
                                        <td colspan="2" style="padding: 8px;">TOTAL: ${sumaPorcentajesHarinas.toFixed(2)}%</td>
                                        <td style="text-align: right; padding: 8px; color: var(--primary);">
                                            ${calculo.totalHarinas.toFixed(2)} kg
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                            ${!sumaCorrecta ? `
                                <div style="margin-top: 10px; padding: 10px; background: #FFF3E0; border-left: 4px solid var(--warning); border-radius: 4px; font-size: 0.85rem;">
                                    ⚠️ La suma de porcentajes de harinas debe ser 100%. Ahora: ${sumaPorcentajesHarinas.toFixed(2)}%
                                </div>
                            ` : ''}
                        </div>

                        <!-- INGREDIENTES -->
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <div class="flex-between mb-10">
                                <h3>🥣 Ingredientes</h3>
                                <button class="btn btn-primary btn-sm" onclick="añadirIngrediente()">➕ Añadir</button>
                            </div>
                            <table style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th style="text-align: left;">Nombre</th>
                                        <th>%</th>
                                        <th>U.</th>
                                        <th>Cantidad</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${calculo.ingredientes.map((i, idx) => `
                                        <tr>
                                            <td>
                                                <input type="text" value="${escaparHTML(i.nombre)}"
                                                       style="width: 100%; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px;"
                                                       onchange="actualizarIngrediente(${idx}, 'nombre', this.value)">
                                            </td>
                                            <td>
                                                <input type="number" min="0" step="0.01"
                                                       value="${i.porcentaje}"
                                                       style="width: 60px; text-align: center; padding: 4px; border: 1px solid #ddd; border-radius: 4px;"
                                                       onchange="actualizarIngrediente(${idx}, 'porcentaje', this.value)">
                                            </td>
                                            <td>
                                                <select onchange="actualizarIngrediente(${idx}, 'unidad', this.value)"
                                                        style="padding: 4px; border: 1px solid #ddd; border-radius: 4px;">
                                                    ${UNIDADES_VALIDAS.map(u => `
                                                        <option value="${u}" ${i.unidad === u ? 'selected' : ''}>${u}</option>
                                                    `).join('')}
                                                </select>
                                            </td>
                                            <td style="text-align: right; font-weight: bold; color: var(--primary); white-space: nowrap;">
                                                ${formatearCantidad(i.cantidad, i.unidad)}
                                            </td>
                                            <td>
                                                <button class="btn btn-danger btn-sm"
                                                        onclick="eliminarIngrediente(${idx})">🗑️</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- BIGA -->
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                        <div class="flex-between mb-10">
                            <h3>🫓 Biga (calculada sobre ${kgBigaTooltip(calculo)} kg de biga)</h3>
                            <button class="btn btn-secondary btn-sm" onclick="abrirModalBiga()">⚙️ Ajustar %</button>
                        </div>
                        <table style="width: 100%; max-width: 600px;">
                            <thead>
                                <tr>
                                    <th style="text-align: left;">Ingrediente</th>
                                    <th>%</th>
                                    <th style="text-align: right;">Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Harina</td>
                                    <td>${receta.biga.harina}%</td>
                                    <td style="text-align: right; font-weight: bold; color: var(--primary);">${calculo.biga.harina.toFixed(2)} kg</td>
                                </tr>
                                <tr>
                                    <td>Agua</td>
                                    <td>${receta.biga.agua}%</td>
                                    <td style="text-align: right; font-weight: bold; color: var(--primary);">${calculo.biga.agua.toFixed(2)} L</td>
                                </tr>
                                <tr>
                                    <td>Levadura</td>
                                    <td>${receta.biga.levadura}%</td>
                                    <td style="text-align: right; font-weight: bold; color: var(--primary);">${calculo.biga.levadura} g</td>
                                </tr>
                                <tr>
                                    <td>Panatura</td>
                                    <td>${receta.biga.panatura}%</td>
                                    <td style="text-align: right; font-weight: bold; color: var(--primary);">${calculo.biga.panatura} g</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            `;

            container.innerHTML = html;
        } catch (error) {
            console.error('❌ Error al renderizar calculadora:', error);
            container.innerHTML = `
                <div class="vista active">
                    <div class="vista-error">
                        <h3>❌ Error al cargar la calculadora</h3>
                        <p>${escaparHTML(error.message)}</p>
                        <button class="btn btn-primary" onclick="renderizarCalculadoraMasa()">🔄 Reintentar</button>
                    </div>
                </div>
            `;
        }
    }, 50);
}

/**
 * Helper para el título de biga.
 */
function kgBigaTooltip(calculo) {
    const ing = calculo.ingredientes.find(i => i.nombre.toLowerCase() === 'biga');
    return ing ? ing.cantidad.toFixed(2) : '0.00';
}

// ============================================================
// 6. ACTUALIZACIONES DE LA RECETA (recalcula y re-renderiza)
// ============================================================

function actualizarNombreReceta(valor) {
    recetaEnEdicion.nombre = valor.trim() || 'Receta sin nombre';
    persistirRecetaActiva(cargarDatos(), recetaEnEdicion);
}

function actualizarKilosHarina(valor) {
    recetaEnEdicion.kilosHarina = parseFloat(valor) || 0;
    persistirRecetaActiva(cargarDatos(), recetaEnEdicion);
    renderizarCalculadoraMasa();
}

function actualizarEstacion(valor) {
    recetaEnEdicion.estacion = valor;
    // Ajustar automáticamente el % de agua
    const aguaIng = recetaEnEdicion.ingredientes.find(
        i => i.nombre.toLowerCase() === 'agua'
    );
    if (valor === 'verano') {
        if (aguaIng) aguaIng.porcentaje = 54;
        recetaEnEdicion.biga.agua = 51;
    } else if (valor === 'invierno') {
        if (aguaIng) aguaIng.porcentaje = 56;
        recetaEnEdicion.biga.agua = 56;
    }
    persistirRecetaActiva(cargarDatos(), recetaEnEdicion);
    renderizarCalculadoraMasa();
}

function actualizarHarina(idx, campo, valor) {
    if (!recetaEnEdicion.harinas[idx]) return;
    if (campo === 'porcentaje') {
        recetaEnEdicion.harinas[idx].porcentaje = parseFloat(valor) || 0;
    } else {
        recetaEnEdicion.harinas[idx].nombre = valor;
    }
    persistirRecetaActiva(cargarDatos(), recetaEnEdicion);
    renderizarCalculadoraMasa();
}

function actualizarIngrediente(idx, campo, valor) {
    if (!recetaEnEdicion.ingredientes[idx]) return;
    if (campo === 'porcentaje') {
        recetaEnEdicion.ingredientes[idx].porcentaje = parseFloat(valor) || 0;
    } else if (campo === 'unidad') {
        recetaEnEdicion.ingredientes[idx].unidad = valor;
    } else {
        recetaEnEdicion.ingredientes[idx].nombre = valor;
    }
    persistirRecetaActiva(cargarDatos(), recetaEnEdicion);
    renderizarCalculadoraMasa();
}

function añadirHarina() {
    const id = 'h' + Date.now();
    recetaEnEdicion.harinas.push({
        id,
        nombre: 'Nueva harina',
        porcentaje: 0
    });
    persistirRecetaActiva(cargarDatos(), recetaEnEdicion);
    renderizarCalculadoraMasa();
}

function eliminarHarina(idx) {
    if (recetaEnEdicion.harinas.length <= 1) {
        mostrarNotificacion('⚠️ Debe haber al menos 1 harina', 'warning');
        return;
    }
    if (!confirm(`¿Eliminar la harina "${recetaEnEdicion.harinas[idx].nombre}"?`)) return;
    recetaEnEdicion.harinas.splice(idx, 1);
    persistirRecetaActiva(cargarDatos(), recetaEnEdicion);
    renderizarCalculadoraMasa();
}

function añadirIngrediente() {
    const id = 'i' + Date.now();
    recetaEnEdicion.ingredientes.push({
        id,
        nombre: 'Nuevo ingrediente',
        porcentaje: 0,
        unidad: 'g'
    });
    persistirRecetaActiva(cargarDatos(), recetaEnEdicion);
    renderizarCalculadoraMasa();
}

function eliminarIngrediente(idx) {
    if (!confirm(`¿Eliminar "${recetaEnEdicion.ingredientes[idx].nombre}"?`)) return;
    recetaEnEdicion.ingredientes.splice(idx, 1);
    persistirRecetaActiva(cargarDatos(), recetaEnEdicion);
    renderizarCalculadoraMasa();
}

// ============================================================
// 7. MODAL DE AJUSTE DE BIGA
// ============================================================

function abrirModalBiga() {
    const b = recetaEnEdicion.biga;
    const harina = prompt('Porcentaje de HARINA en la biga (sobre harina de biga):', b.harina);
    if (harina === null) return;
    const agua = prompt('Porcentaje de AGUA en la biga:', b.agua);
    if (agua === null) return;
    const levadura = prompt('Porcentaje de LEVADURA en la biga:', b.levadura);
    if (levadura === null) return;
    const panatura = prompt('Porcentaje de PANATURA en la biga:', b.panatura);
    if (panatura === null) return;

    recetaEnEdicion.biga = {
        harina: parseFloat(harina) || 0,
        agua: parseFloat(agua) || 0,
        levadura: parseFloat(levadura) || 0,
        panatura: parseFloat(panatura) || 0
    };
    persistirRecetaActiva(cargarDatos(), recetaEnEdicion);
    renderizarCalculadoraMasa();
    mostrarNotificacion('✅ Biga actualizada', 'success');
}

// ============================================================
// 8. GESTIÓN DE RECETAS (guardar, cargar, duplicar, eliminar)
// ============================================================

/**
 * Guarda la receta actual. Si el nombre ya existe, la sobrescribe.
 */
function guardarRecetaActual() {
    const datos = cargarDatos();
    const nombre = recetaEnEdicion.nombre.trim();
    if (!nombre) {
        mostrarNotificacion('⚠️ Pon un nombre a la receta', 'warning');
        return;
    }

    // Guardar en el diccionario (con la misma id, sobrescribe)
    persistirRecetaActiva(datos, recetaEnEdicion);
    mostrarNotificacion(`✅ Receta "${nombre}" guardada`, 'success');
}

/**
 * Abre modal con la lista de recetas guardadas.
 */
function abrirModalRecetas() {
    const datos = cargarDatos();
    const recetas = obtenerRecetasMasa(datos);
    const ids = Object.keys(recetas);

    let msg = 'Selecciona una receta para cargar:\n\n';
    ids.forEach((id, i) => {
        const r = recetas[id];
        const marca = id === datos[CLAVE_RECETA_ACTIVA] ? ' ✅' : '';
        msg += `${i + 1}. ${r.nombre} (${r.kilosHarina} kg)${marca}\n`;
    });
    msg += `\n${ids.length + 1}. 📋 Duplicar receta actual\n`;
    msg += `${ids.length + 2}. 🗑️ Eliminar una receta\n`;
    msg += `\n0. Cancelar`;

    const sel = prompt(msg);
    if (!sel || sel === '0') return;
    const idx = parseInt(sel) - 1;

    if (idx >= 0 && idx < ids.length) {
        // Cargar receta
        const idSeleccionada = ids[idx];
        recetaEnEdicion = JSON.parse(JSON.stringify(recetas[idSeleccionada]));
        persistirRecetaActiva(datos, recetaEnEdicion);
        renderizarCalculadoraMasa();
        mostrarNotificacion(`✅ Receta "${recetaEnEdicion.nombre}" cargada`, 'success');
    } else if (idx === ids.length) {
        // Duplicar
        duplicarRecetaActual();
    } else if (idx === ids.length + 1) {
        // Eliminar
        eliminarRecetaPorPrompt(ids, recetas);
    }
}

function duplicarRecetaActual() {
    const nuevoNombre = prompt('Nombre para la receta duplicada:', recetaEnEdicion.nombre + ' (copia)');
    if (!nuevoNombre) return;

    const datos = cargarDatos();
    const nueva = JSON.parse(JSON.stringify(recetaEnEdicion));
    nueva.id = 'receta-' + Date.now();
    nueva.nombre = nuevoNombre.trim();
    nueva.createdAt = new Date().toISOString();
    nueva.updatedAt = new Date().toISOString();

    datos.recetasMasa[nueva.id] = nueva;
    datos[CLAVE_RECETA_ACTIVA] = nueva.id;
    guardarDatos(datos);

    recetaEnEdicion = nueva;
    renderizarCalculadoraMasa();
    mostrarNotificacion(`✅ Receta duplicada como "${nueva.nombre}"`, 'success');
}

function eliminarRecetaPorPrompt(ids, recetas) {
    let msg = '¿Qué receta quieres eliminar?\n\n';
    ids.forEach((id, i) => {
        msg += `${i + 1}. ${recetas[id].nombre}\n`;
    });
    msg += '\n0. Cancelar';

    const sel = prompt(msg);
    if (!sel || sel === '0') return;
    const idx = parseInt(sel) - 1;
    if (isNaN(idx) || idx < 0 || idx >= ids.length) return;

    const idEliminar = ids[idx];
    if (ids.length <= 1) {
        mostrarNotificacion('⚠️ Debe quedar al menos 1 receta', 'warning');
        return;
    }
    if (!confirm(`¿Eliminar la receta "${recetas[idEliminar].nombre}"?`)) return;

    const datos = cargarDatos();
    delete datos.recetasMasa[idEliminar];

    // Si era la activa, cambiar a la primera disponible
    if (datos[CLAVE_RECETA_ACTIVA] === idEliminar) {
        datos[CLAVE_RECETA_ACTIVA] = Object.keys(datos.recetasMasa)[0];
    }
    guardarDatos(datos);

    // Recargar receta activa
    const { receta } = obtenerRecetaActiva();
    recetaEnEdicion = receta;
    renderizarCalculadoraMasa();
    mostrarNotificacion('✅ Receta eliminada', 'success');
}

// ============================================================
// 9. IMPRIMIR Y EXPORTAR CSV
// ============================================================

function imprimirReceta() {
    const receta = recetaEnEdicion;
    const calculo = calcularReceta(receta);

    let html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${escaparHTML(receta.nombre)}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                h1 { color: #F7941E; border-bottom: 2px solid #F7941E; padding-bottom: 10px; }
                h2 { color: #2D2D2D; margin-top: 25px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #2D2D2D; color: white; }
                .cantidad { text-align: right; font-weight: bold; color: #F7941E; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9rem; color: #666; }
                .firma { margin-top: 40px; display: flex; justify-content: space-between; }
                .firma div { width: 45%; border-top: 1px solid #333; padding-top: 5px; }
            </style>
        </head>
        <body>
            <h1>🧮 ${escaparHTML(receta.nombre)}</h1>
            <p><strong>Kilos de harina:</strong> ${receta.kilosHarina} kg · <strong>Estación:</strong> ${receta.estacion}</p>

            <h2>🌾 Harinas</h2>
            <table>
                <thead><tr><th>Harina</th><th>%</th><th class="cantidad">Cantidad</th></tr></thead>
                <tbody>
                    ${calculo.harinas.map(h => `
                        <tr><td>${escaparHTML(h.nombre)}</td><td>${h.porcentaje}%</td><td class="cantidad">${h.cantidad.toFixed(2)} kg</td></tr>
                    `).join('')}
                    <tr style="background:#f5f5f5; font-weight:bold;">
                        <td colspan="2">TOTAL</td>
                        <td class="cantidad">${calculo.totalHarinas.toFixed(2)} kg</td>
                    </tr>
                </tbody>
            </table>

            <h2>🥣 Ingredientes</h2>
            <table>
                <thead><tr><th>Ingrediente</th><th>%</th><th class="cantidad">Cantidad</th></tr></thead>
                <tbody>
                    ${calculo.ingredientes.map(i => `
                        <tr><td>${escaparHTML(i.nombre)}</td><td>${i.porcentaje}%</td><td class="cantidad">${formatearCantidad(i.cantidad, i.unidad)}</td></tr>
                    `).join('')}
                </tbody>
            </table>

            <h2>🫓 Biga</h2>
            <table>
                <thead><tr><th>Ingrediente</th><th>%</th><th class="cantidad">Cantidad</th></tr></thead>
                <tbody>
                    <tr><td>Harina</td><td>${receta.biga.harina}%</td><td class="cantidad">${calculo.biga.harina.toFixed(2)} kg</td></tr>
                    <tr><td>Agua</td><td>${receta.biga.agua}%</td><td class="cantidad">${calculo.biga.agua.toFixed(2)} L</td></tr>
                    <tr><td>Levadura</td><td>${receta.biga.levadura}%</td><td class="cantidad">${calculo.biga.levadura} g</td></tr>
                    <tr><td>Panatura</td><td>${receta.biga.panatura}%</td><td class="cantidad">${calculo.biga.panatura} g</td></tr>
                </tbody>
            </table>

            <div class="footer">
                <p>Impreso el ${new Date().toLocaleString('es-ES')} · Quality Pizzafresh</p>
                <div class="firma">
                    <div>Operario</div>
                    <div>Fecha y hora</div>
                </div>
            </div>
        </body>
        </html>
    `;

    const ventana = window.open('', '_blank');
    ventana.document.write(html);
    ventana.document.close();
    setTimeout(() => ventana.print(), 500);
}

function exportarRecetaCSV() {
    const receta = recetaEnEdicion;
    const calculo = calcularReceta(receta);

    let csv = `Receta: ${receta.nombre}\n`;
    csv += `Kilos de harina: ${receta.kilosHarina}\n`;
    csv += `Estación: ${receta.estacion}\n\n`;

    csv += 'HARINAS\n';
    csv += 'Nombre,Porcentaje,Cantidad (kg)\n';
    calculo.harinas.forEach(h => {
        csv += `${h.nombre},${h.porcentaje}%,${h.cantidad.toFixed(2)}\n`;
    });
    csv += `TOTAL,,${calculo.totalHarinas.toFixed(2)}\n\n`;

    csv += 'INGREDIENTES\n';
    csv += 'Nombre,Porcentaje,Cantidad,Unidad\n';
    calculo.ingredientes.forEach(i => {
        csv += `${i.nombre},${i.porcentaje}%,${i.cantidad},${i.unidad}\n`;
    });
    csv += '\n';

    csv += 'BIGA\n';
    csv += 'Ingrediente,Porcentaje,Cantidad\n';
    csv += `Harina,${receta.biga.harina}%,${calculo.biga.harina.toFixed(2)} kg\n`;
    csv += `Agua,${receta.biga.agua}%,${calculo.biga.agua.toFixed(2)} L\n`;
    csv += `Levadura,${receta.biga.levadura}%,${calculo.biga.levadura} g\n`;
    csv += `Panatura,${receta.biga.panatura}%,${calculo.biga.panatura} g\n`;

    try {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `receta_${receta.nombre.replace(/\s+/g, '_')}_${obtenerFechaActual()}.csv`;
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
