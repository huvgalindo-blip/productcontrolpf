/**
 * ============================================================
 * MÓDULO: ETIQUETAS
 * ============================================================
 * Responsabilidades:
 *   - Generador de etiquetas reglamentarias UE (68 × 80 mm)
 *   - Multiidioma: ES (obligatorio), PT, FR, EN (opcionales)
 *   - Auto-selección de idiomas según país del cliente
 *   - Cálculo automático de lote y fecha de caducidad
 *   - Vista previa en vivo
 *   - Generación de PDF con jsPDF
 *   - Historial de últimas 50 etiquetas
 * 
 * Dependencias: datos.js, utilidades.js, productos.js, clientes.js
 * Librería externa: jsPDF (cargada en index.html)
 * ============================================================
 */

// ============================================================
// 1. CONSTANTES
// ============================================================

const CLAVE_HISTORIAL_ETIQUETAS = 'historialEtiquetas';
const MAX_HISTORIAL_ETIQUETAS = 50;

// Dimensiones de la etiqueta en milímetros
const ETIQUETA_ANCHO_MM = 68;
const ETIQUETA_ALTO_MM = 80;
const MARGEN_MM = 3;

// Mapeo de país → idiomas adicionales sugeridos
const MAPEO_PAIS_IDIOMAS = {
    'España': [],
    'Portugal': ['pt'],
    'Francia': ['fr'],
    'Reino Unido': ['en'],
    'Alemania': ['en'],       // Inglés como idioma de trabajo
    'Italia': ['en'],
    'Países Bajos': ['en'],
    'Bélgica': ['fr'],         // francés o neerlandés; por defecto FR
    'Irlanda': ['en'],
    'Suiza': ['fr'],
    'Andorra': ['fr'],
    'Otros': ['en']
};

// Textos i18n de etiqueta
const TEXTOS_I18N = {
    es: {
        denominacion: 'Masa de pizza precocida',
        ingredientes: 'Ingredientes',
        contiene: 'Contiene',
        conservacion: 'Conservación',
        modoEmpleo: 'Modo de empleo',
        lote: 'LOTE',
        caducidad: 'CAD',
        peso: 'Peso neto',
        formato: 'Formato',
        origen: 'Origen'
    },
    pt: {
        denominacion: 'Massa de pizza pré-cozida',
        ingredientes: 'Ingredientes',
        contiene: 'Contém',
        conservacion: 'Conservação',
        modoEmpleo: 'Modo de preparo',
        lote: 'LOTE',
        caducidad: 'VALIDADE',
        peso: 'Peso líquido',
        formato: 'Formato',
        origem: 'Origem'
    },
    fr: {
        denominacion: 'Pâte à pizza précuite',
        ingredientes: 'Ingrédients',
        contiene: 'Contient',
        conservacion: 'Conservation',
        modoEmpleo: 'Mode d\'emploi',
        lote: 'LOT',
        caducidad: 'DLC',
        peso: 'Poids net',
        formato: 'Format',
        origem: 'Origine'
    },
    en: {
        denominacion: 'Pre-cooked pizza base',
        ingredientes: 'Ingredients',
        contiene: 'Contains',
        conservacion: 'Storage',
        modoEmpleo: 'Instructions',
        lote: 'BATCH',
        caducidad: 'EXP',
        peso: 'Net weight',
        formato: 'Format',
        origem: 'Origin'
    }
};

// Plantillas de contenido por producto (autocompletar)
const PLANTILLAS_CONTENIDO = {
    porDefecto: {
        ingredientes: 'Harina de trigo, agua, aceite de oliva virgen extra (3%), sal, levadura, mejorante panario (E-300).',
        alergenos: 'gluten',
        conservacion: 'Conservar refrigerado entre 2°C y 6°C.',
        modoEmpleo: 'Hornear a 220°C durante 8-10 minutos.'
    },
    sinGluten: {
        ingredientes: 'Almidón de maíz, agua, harina de arroz, aceite de oliva virgen extra (3%), sal, levadura, fibra vegetal.',
        alergenos: 'Ninguno declarado.',
        conservacion: 'Conservar refrigerado entre 2°C y 6°C.',
        modoEmpleo: 'Hornear a 220°C durante 8-10 minutos.'
    }
};

// ============================================================
// 2. HISTORIAL DE ETIQUETAS
// ============================================================

/**
 * Obtiene el historial de etiquetas generadas.
 */
function obtenerHistorialEtiquetas(datos) {
    if (!Array.isArray(datos[CLAVE_HISTORIAL_ETIQUETAS])) {
        datos[CLAVE_HISTORIAL_ETIQUETAS] = [];
        guardarDatos(datos);
    }
    return datos[CLAVE_HISTORIAL_ETIQUETAS];
}

/**
 * Añade una entrada al historial y limpia si supera el máximo.
 */
function añadirAlHistorialEtiquetas(datos, entrada) {
    const historial = obtenerHistorialEtiquetas(datos);
    historial.unshift(entrada);
    if (historial.length > MAX_HISTORIAL_ETIQUETAS) {
        historial.splice(MAX_HISTORIAL_ETIQUETAS);
    }
    guardarDatos(datos);
}

// ============================================================
// 3. GENERACIÓN DE LOTE Y FECHAS
// ============================================================

/**
 * Genera un código de lote único basado en la fecha.
 * Formato: L-AAAAMMDD-XXX donde XXX es el número secuencial del día.
 */
function generarLoteAutomatico(datos, fecha) {
    const fechaStr = (fecha || obtenerFechaActual()).replace(/-/g, '');
    const historial = obtenerHistorialEtiquetas(datos);

    // Contar cuántos lotes con esa fecha ya existen en el historial
    const lotesHoy = historial.filter(e =>
        e.lote && e.lote.includes(`L-${fechaStr}-`)
    ).length;

    const secuencial = String(lotesHoy + 1).padStart(3, '0');
    return `L-${fechaStr}-${secuencial}`;
}

/**
 * Calcula la fecha de caducidad sumando los días de caducidad configurados.
 */
function calcularFechaCaducidad(fechaProduccion, diasCaducidad) {
    const fecha = new Date(fechaProduccion);
    fecha.setDate(fecha.getDate() + (parseInt(diasCaducidad) || 0));
    return fecha.toISOString().split('T')[0];
}

/**
 * Formatea una fecha YYYY-MM-DD a DD/MM/YYYY.
 */
function formatearFechaEtiqueta(fecha) {
    if (!fecha) return '';
    const partes = fecha.split('-');
    if (partes.length !== 3) return fecha;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ============================================================
// 4. AUTO-SELECCIÓN DE IDIOMAS POR PAÍS
// ============================================================

/**
 * Devuelve los idiomas adicionales sugeridos para un país.
 */
function idiomasAdicionalesPorPais(pais) {
    if (!pais) return [];
    return MAPEO_PAIS_IDIOMAS[pais] || ['en'];
}

/**
 * Al elegir un cliente, devuelve los idiomas automáticos.
 * Siempre incluye 'es'.
 */
function idiomasSugeridosCliente(cliente) {
    if (!cliente) return ['es'];
    const adicionales = idiomasAdicionalesPorPais(cliente.pais);
    return ['es', ...adicionales];
}

// ============================================================
// 5. RENDERIZADO DE LA VISTA
// ============================================================

/**
 * Estado del formulario actual (no persiste hasta pulsar Generar).
 */
let estadoFormularioEtiqueta = null;

/**
 * Inicializa el estado del formulario con valores por defecto.
 */
function inicializarEstadoFormulario() {
    const datos = cargarDatos();
    const fechaHoy = obtenerFechaActual();
    const diasCaducidad = datos.configuracion.diasCaducidad || 19;

    estadoFormularioEtiqueta = {
        productoId: null,
        clienteId: null,
        formato: '',
        pesoNeto: '',
        lote: generarLoteAutomatico(datos, fechaHoy),
        fechaProduccion: fechaHoy,
        fechaCaducidad: calcularFechaCaducidad(fechaHoy, diasCaducidad),
        idiomas: ['es'],      // ES siempre activo
        ingredientes: PLANTILLAS_CONTENIDO.porDefecto.ingredientes,
        alergenos: PLANTILLAS_CONTENIDO.porDefecto.alergenos,
        conservacion: PLANTILLAS_CONTENIDO.porDefecto.conservacion,
        modoEmpleo: PLANTILLAS_CONTENIDO.porDefecto.modoEmpleo,
        operador: 'Quality Pizzafresh S.L.',
        direccion: 'Guardamar del Segura (Alicante)',
        paisOrigen: 'España',
        copias: 1
    };
}

/**
 * Renderiza la vista completa del generador de etiquetas.
 */
function renderizarEtiquetas() {
    const container = document.getElementById('vista-container');
    container.innerHTML = '<div class="loading">Cargando generador de etiquetas...</div>';

    setTimeout(() => {
        try {
            const datos = cargarDatos();

            // Inicializar estado solo la primera vez
            if (!estadoFormularioEtiqueta) {
                inicializarEstadoFormulario();
            }

            const productos = obtenerProductosActivos(datos);
            const clientes = obtenerClientesActivos(datos);
            const historial = obtenerHistorialEtiquetas(datos);

            let html = `
                <div class="vista active">
                    <div class="vista-header">
                        <div>
                            <h2>🏷️ Generador de Etiquetas</h2>
                            <span class="subtitle">Etiquetas reglamentarias UE · 68 × 80 mm</span>
                        </div>
                        <div class="flex gap-10">
                            <button class="btn btn-primary btn-sm" onclick="generarPDFEtiquetas()">📄 Generar PDF</button>
                            <button class="btn btn-secondary btn-sm" onclick="resetearFormularioEtiqueta()">🔄 Limpiar</button>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start;">

                        <!-- FORMULARIO -->
                        <div>
                            ${renderizarFormularioEtiqueta(datos, productos, clientes)}
                            ${renderizarHistorialEtiquetas(historial)}
                        </div>

                        <!-- VISTA PREVIA -->
                        <div style="position: sticky; top: 80px;">
                            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <h4 style="margin-bottom: 10px;">👁️ Vista previa</h4>
                                <div id="vista-previa-etiqueta">
                                    ${renderizarVistaPreviaEtiqueta(datos)}
                                </div>
                                <p style="font-size: 0.7rem; color: #999; text-align: center; margin-top: 10px;">
                                    Tamaño real: 68 × 80 mm
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            `;

            container.innerHTML = html;
        } catch (error) {
            console.error('❌ Error al renderizar etiquetas:', error);
            container.innerHTML = `
                <div class="vista active">
                    <div class="vista-error">
                        <h3>❌ Error al cargar el generador de etiquetas</h3>
                        <p>${escaparHTML(error.message)}</p>
                        <button class="btn btn-primary" onclick="renderizarEtiquetas()">🔄 Reintentar</button>
                    </div>
                </div>
            `;
        }
    }, 50);
}

/**
 * Renderiza el formulario principal.
 */
function renderizarFormularioEtiqueta(datos, productos, clientes) {
    const e = estadoFormularioEtiqueta;
    const productoSeleccionado = productos.find(p => p.id === e.productoId);
    const clienteSeleccionado = clientes.find(c => c.id === e.clienteId);

    return `
        <!-- PRODUCTO Y DESTINO -->
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">📦 Producto y destino</h3>
            <div class="form-row">
                <div class="form-group">
                    <label>Producto *</label>
                    <select id="etq-producto" onchange="actualizarCampoEtiqueta('productoId', parseInt(this.value) || null)">
                        <option value="">— Seleccionar producto —</option>
                        ${productos.map(p => `
                            <option value="${p.id}" ${p.id === e.productoId ? 'selected' : ''}>
                                ${escaparHTML(p.nombre)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Cliente destino (opcional)</label>
                    <select id="etq-cliente" onchange="cambiarClienteEtiqueta(parseInt(this.value) || null)">
                        <option value="">— Etiqueta genérica (sin cliente) —</option>
                        ${clientes.map(c => `
                            <option value="${c.id}" ${c.id === e.clienteId ? 'selected' : ''}>
                                ${escaparHTML(c.codigo)} - ${escaparHTML(c.nombre)}${c.pais ? ` (${c.pais})` : ''}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Formato (ej: Mediana 32 cm)</label>
                    <input type="text" value="${escaparHTML(e.formato)}"
                           onchange="actualizarCampoEtiqueta('formato', this.value)"
                           placeholder="Mediana 32 cm">
                </div>
                <div class="form-group">
                    <label>Peso neto (ej: 250 g)</label>
                    <input type="text" value="${escaparHTML(e.pesoNeto)}"
                           onchange="actualizarCampoEtiqueta('pesoNeto', this.value)"
                           placeholder="250 g">
                </div>
            </div>
        </div>

        <!-- FECHAS Y LOTE -->
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">📅 Fechas y lote</h3>
            <div class="form-row">
                <div class="form-group" style="grid-column: span 2;">
                    <label>Lote</label>
                    <div style="display: flex; gap: 6px;">
                        <input type="text" value="${escaparHTML(e.lote)}"
                               onchange="actualizarCampoEtiqueta('lote', this.value)"
                               style="flex: 1;">
                        <button class="btn btn-secondary btn-sm" onclick="generarNuevoLote()" title="Generar lote nuevo">🎲</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Fecha producción</label>
                    <input type="date" value="${e.fechaProduccion}"
                           onchange="actualizarFechaProduccion(this.value)">
                </div>
                <div class="form-group">
                    <label>Fecha caducidad</label>
                    <input type="date" value="${e.fechaCaducidad}"
                           onchange="actualizarCampoEtiqueta('fechaCaducidad', this.value)">
                </div>
            </div>
            <div style="font-size: 0.75rem; color: #999;">
                💡 La caducidad se calcula automáticamente con los días configurados (${datos.configuracion.diasCaducidad || 19} días). Puedes cambiarla manualmente.
            </div>
        </div>

        <!-- IDIOMAS -->
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">🌍 Idiomas</h3>
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: not-allowed; opacity: 0.7;">
                    <input type="checkbox" checked disabled>
                    <span>🇪🇸 Español <small>(obligatorio)</small></span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="checkbox" ${e.idiomas.includes('pt') ? 'checked' : ''}
                           onchange="toggleIdiomaEtiqueta('pt', this.checked)">
                    <span>🇵🇹 Portugués</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="checkbox" ${e.idiomas.includes('fr') ? 'checked' : ''}
                           onchange="toggleIdiomaEtiqueta('fr', this.checked)">
                    <span>🇫🇷 Francés</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="checkbox" ${e.idiomas.includes('en') ? 'checked' : ''}
                           onchange="toggleIdiomaEtiqueta('en', this.checked)">
                    <span>🇬🇧 Inglés</span>
                </label>
            </div>
            ${clienteSeleccionado && clienteSeleccionado.pais ? `
                <div style="margin-top: 10px; padding: 8px 12px; background: #E3F2FD; border-radius: 6px; font-size: 0.85rem; color: #1565C0;">
                    🌍 Cliente de <strong>${escaparHTML(clienteSeleccionado.pais)}</strong> · Idiomas sugeridos: ${idiomasSugeridosCliente(clienteSeleccionado).map(i => i.toUpperCase()).join(', ')}
                </div>
            ` : ''}
        </div>

        <!-- CONTENIDO LEGAL -->
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">📝 Contenido legal</h3>

            <div class="form-group">
                <label>Ingredientes (castellano)</label>
                <textarea rows="2" style="width:100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit; resize: vertical;"
                          onchange="actualizarCampoEtiqueta('ingredientes', this.value)"
                          placeholder="Harina de trigo, agua, aceite...">${escaparHTML(e.ingredientes)}</textarea>
            </div>

            <div class="form-group">
                <label>Alérgenos (castellano)</label>
                <input type="text" value="${escaparHTML(e.alergenos)}"
                       onchange="actualizarCampoEtiqueta('alergenos', this.value)"
                       placeholder="Contiene: gluten">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Conservación</label>
                    <input type="text" value="${escaparHTML(e.conservacion)}"
                           onchange="actualizarCampoEtiqueta('conservacion', this.value)">
                </div>
                <div class="form-group">
                    <label>Modo de empleo</label>
                    <input type="text" value="${escaparHTML(e.modoEmpleo)}"
                           onchange="actualizarCampoEtiqueta('modoEmpleo', this.value)">
                </div>
            </div>

            <div class="form-group">
                <label>Operador (razón social)</label>
                <input type="text" value="${escaparHTML(e.operador)}"
                       onchange="actualizarCampoEtiqueta('operador', this.value)">
            </div>

            <div class="form-group">
                <label>Dirección del operador</label>
                <input type="text" value="${escaparHTML(e.direccion)}"
                       onchange="actualizarCampoEtiqueta('direccion', this.value)">
            </div>
        </div>

        <!-- COPIAS -->
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <div class="form-row">
                <div class="form-group">
                    <label>Número de copias</label>
                    <input type="number" min="1" max="200" value="${e.copias}"
                           onchange="actualizarCampoEtiqueta('copias', parseInt(this.value) || 1)">
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza la vista previa en vivo de la etiqueta.
 * Simula el tamaño real 68×80 mm usando escala.
 */
function renderizarVistaPreviaEtiqueta(datos) {
    const e = estadoFormularioEtiqueta;
    const productos = obtenerProductosActivos(datos);
    const producto = productos.find(p => p.id === e.productoId);

    // Escala: 1 mm → 3.5 px para que quepa bien en la columna de 320px
    const escala = 3.5;
    const anchoPx = ETIQUETA_ANCHO_MM * escala;  // 238 px
    const altoPx = ETIQUETA_ALTO_MM * escala;    // 280 px

    const nombreProducto = producto ? producto.nombre : '[Sin producto]';

    return `
        <div style="
            width: ${anchoPx}px;
            height: ${altoPx}px;
            border: 1px dashed #ccc;
            background: white;
            padding: ${MARGEN_MM * escala}px;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            color: #000;
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow: hidden;
        ">
            <!-- Marca -->
            <div style="font-size: 8px; font-weight: bold; color: #F7941E; border-bottom: 1px solid #F7941E; padding-bottom: 2px;">
                🍕 QUALITY PIZZAFRESH
            </div>

            <!-- Denominación -->
            <div style="font-size: 7px; font-weight: bold; margin-top: 3px;">
                ${escaparHTML(nombreProducto).toUpperCase()}
            </div>
            ${e.idiomas.includes('en') ? `<div style="font-size: 6px; font-style: italic;">Pre-cooked pizza base</div>` : ''}
            ${e.idiomas.includes('pt') ? `<div style="font-size: 6px; font-style: italic;">Massa de pizza pré-cozida</div>` : ''}
            ${e.idiomas.includes('fr') ? `<div style="font-size: 6px; font-style: italic;">Pâte à pizza précuite</div>` : ''}

            <!-- Lote y caducidad destacados -->
            <div style="border: 1px solid #000; padding: 3px; margin-top: 3px; font-size: 7px; font-weight: bold;">
                <div>LOTE: ${escaparHTML(e.lote)}</div>
                <div>CAD: ${formatearFechaEtiqueta(e.fechaCaducidad)}</div>
            </div>

            <!-- Formato y peso -->
            <div style="font-size: 6px; margin-top: 2px;">
                ${e.formato ? `Formato: ${escaparHTML(e.formato)}` : ''}
                ${e.pesoNeto ? ` · ${escaparHTML(e.pesoNeto)}` : ''}
            </div>

            <!-- Ingredientes -->
            ${e.ingredientes ? `
                <div style="font-size: 5px; margin-top: 2px; line-height: 1.15;">
                    <strong>Ingredientes:</strong> ${escaparHTML(e.ingredientes.substring(0, 180))}${e.ingredientes.length > 180 ? '...' : ''}
                </div>
            ` : ''}

            <!-- Alérgenos -->
            ${e.alergenos ? `
                <div style="font-size: 6px; font-weight: bold; margin-top: 2px;">
                    ${escaparHTML(e.alergenos)}
                </div>
            ` : ''}

            <!-- Conservación y uso -->
            ${e.conservacion ? `<div style="font-size: 5px; margin-top: 2px;">${escaparHTML(e.conservacion)}</div>` : ''}
            ${e.modoEmpleo ? `<div style="font-size: 5px;">${escaparHTML(e.modoEmpleo)}</div>` : ''}

            <!-- Pie -->
            <div style="margin-top: auto; font-size: 5px; line-height: 1.15; border-top: 1px solid #ccc; padding-top: 2px;">
                ${escaparHTML(e.operador)}<br>
                ${escaparHTML(e.direccion)} · ${escaparHTML(e.paisOrigen)}
            </div>
        </div>
    `;
}

/**
 * Renderiza la sección del historial.
 */
function renderizarHistorialEtiquetas(historial) {
    if (!historial || historial.length === 0) {
        return `
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 15px;">📜 Historial</h3>
                <p style="color: #999; text-align: center; padding: 20px;">
                    Aún no has generado ninguna etiqueta.
                </p>
            </div>
        `;
    }

    return `
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div class="flex-between mb-10">
                <h3>📜 Historial (${historial.length})</h3>
                <button class="btn btn-danger btn-sm" onclick="limpiarHistorialEtiquetas()">🗑️ Limpiar todo</button>
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                ${historial.map((h, idx) => `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #eee;">
                        <div style="flex: 1; font-size: 0.85rem;">
                            <div><strong>${escaparHTML(h.productoNombre)}</strong></div>
                            <div style="color: #666; font-size: 0.75rem;">
                                ${new Date(h.generadoEn).toLocaleString('es-ES')} ·
                                Lote: ${escaparHTML(h.lote)} ·
                                Cad: ${formatearFechaEtiqueta(h.fechaCaducidad)} ·
                                ${h.copias} copia${h.copias > 1 ? 's' : ''} ·
                                ${h.idiomas.map(i => i.toUpperCase()).join('+')}
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-sm" onclick="reimprimirDesdeHistorial(${idx})" title="Reimprimir">📄</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarEntradaHistorial(${idx})" title="Eliminar">🗑️</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============================================================
// 6. ACCIONES DEL FORMULARIO
// ============================================================

function actualizarCampoEtiqueta(campo, valor) {
    if (!estadoFormularioEtiqueta) return;
    estadoFormularioEtiqueta[campo] = valor;
    actualizarVistaPreviaEtiqueta();
}

function actualizarFechaProduccion(fecha) {
    if (!estadoFormularioEtiqueta) return;
    const datos = cargarDatos();
    estadoFormularioEtiqueta.fechaProduccion = fecha;
    // Recalcular caducidad
    estadoFormularioEtiqueta.fechaCaducidad = calcularFechaCaducidad(fecha, datos.configuracion.diasCaducidad);
    // Re-render completo para que el input de caducidad se actualice
    renderizarEtiquetas();
}

function cambiarClienteEtiqueta(clienteId) {
    if (!estadoFormularioEtiqueta) return;
    estadoFormularioEtiqueta.clienteId = clienteId;

    if (clienteId) {
        const datos = cargarDatos();
        const cliente = datos.clientes.find(c => c.id === clienteId);
        if (cliente && cliente.pais) {
            // Auto-seleccionar idiomas según país
            const idiomasSugeridos = idiomasSugeridosCliente(cliente);
            estadoFormularioEtiqueta.idiomas = idiomasSugeridos;
        }
    }
    renderizarEtiquetas();
}

function toggleIdiomaEtiqueta(idioma, activo) {
    if (!estadoFormularioEtiqueta) return;
    const idiomas = estadoFormularioEtiqueta.idiomas.filter(i => i !== 'es'); // siempre quitamos 'es' y lo volvemos a añadir
    if (activo && !idiomas.includes(idioma)) {
        idiomas.push(idioma);
    } else if (!activo) {
        const idx = idiomas.indexOf(idioma);
        if (idx >= 0) idiomas.splice(idx, 1);
    }
    estadoFormularioEtiqueta.idiomas = ['es', ...idiomas];
    actualizarVistaPreviaEtiqueta();
}

function generarNuevoLote() {
    const datos = cargarDatos();
    const nuevo = generarLoteAutomatico(datos, estadoFormularioEtiqueta.fechaProduccion);
    estadoFormularioEtiqueta.lote = nuevo;
    renderizarEtiquetas();
    mostrarNotificacion(`🎲 Nuevo lote: ${nuevo}`, 'info');
}

function resetearFormularioEtiqueta() {
    if (!confirm('⚠️ ¿Limpiar el formulario? Se perderán los cambios no guardados.')) return;
    estadoFormularioEtiqueta = null;
    inicializarEstadoFormulario();
    renderizarEtiquetas();
    mostrarNotificacion('🔄 Formulario limpiado', 'info');
}

/**
 * Actualiza solo la vista previa (sin re-render completo).
 * Se usa cuando se cambia texto en inputs para no perder el foco.
 */
function actualizarVistaPreviaEtiqueta() {
    const contenedor = document.getElementById('vista-previa-etiqueta');
    if (!contenedor) return;
    const datos = cargarDatos();
    contenedor.innerHTML = renderizarVistaPreviaEtiqueta(datos);
}

// ============================================================
// 7. GENERACIÓN DE PDF
// ============================================================

/**
 * Genera el PDF con jsPDF.
 * Formato: 68 × 80 mm por etiqueta, varias etiquetas por página A4.
 */
function generarPDFEtiquetas() {
    const e = estadoFormularioEtiqueta;
    if (!e) {
        mostrarNotificacion('⚠️ Formulario vacío', 'warning');
        return;
    }
    if (!e.productoId) {
        mostrarNotificacion('⚠️ Selecciona un producto', 'warning');
        return;
    }
    if (!e.lote) {
        mostrarNotificacion('⚠️ El lote es obligatorio', 'warning');
        return;
    }

    try {
        // Comprobar que jsPDF está cargado
        if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
            mostrarNotificacion('❌ jsPDF no cargado. Recarga la página.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf || { jsPDF: window.jsPDF };
        const datos = cargarDatos();
        const productos = obtenerProductosActivos(datos);
        const producto = productos.find(p => p.id === e.productoId);
        const nombreProducto = producto ? producto.nombre : 'Producto';

        // Crear documento A4
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Distribución en A4 (210 × 297 mm)
        // Caben 3 columnas (68×3=204) y 3 filas (80×3=240)
        const etiquetasPorFila = 3;
        const etiquetasPorColumna = 3;
        const etiquetasPorPagina = etiquetasPorFila * etiquetasPorColumna;

        // Espaciado para centrar en A4
        const anchoTotal = etiquetasPorFila * ETIQUETA_ANCHO_MM;
        const altoTotal = etiquetasPorColumna * ETIQUETA_ALTO_MM;
        const margenX = (210 - anchoTotal) / 2;
        const margenY = (297 - altoTotal) / 2;

        const total = e.copias;
        let contador = 0;

        for (let i = 0; i < total; i++) {
            if (contador > 0 && contador % etiquetasPorPagina === 0) {
                doc.addPage();
            }
            const posEnPagina = contador % etiquetasPorPagina;
            const col = posEnPagina % etiquetasPorFila;
            const fila = Math.floor(posEnPagina / etiquetasPorFila);
            const x = margenX + col * ETIQUETA_ANCHO_MM;
            const y = margenY + fila * ETIQUETA_ALTO_MM;

            dibujarEtiquetaEnPDF(doc, x, y, e, nombreProducto, datos);
            contador++;
        }

        // Nombre del archivo
        const nombreArchivo = `etiquetas_${nombreProducto.replace(/\s+/g, '_')}_${e.lote}_${obtenerFechaActual()}.pdf`;
        doc.save(nombreArchivo);

        // Guardar en historial
        añadirAlHistorialEtiquetas(datos, {
            id: 'etq-' + Date.now(),
            productoId: e.productoId,
            productoNombre: nombreProducto,
            lote: e.lote,
            fechaProduccion: e.fechaProduccion,
            fechaCaducidad: e.fechaCaducidad,
            idiomas: [...e.idiomas],
            copias: e.copias,
            formato: e.formato,
            pesoNeto: e.pesoNeto,
            generadoEn: new Date().toISOString()
        });

        mostrarNotificacion(`✅ ${total} etiqueta${total > 1 ? 's' : ''} generada${total > 1 ? 's' : ''}`, 'success');
        renderizarEtiquetas();

    } catch (error) {
        console.error('❌ Error al generar PDF:', error);
        mostrarNotificacion('❌ Error al generar PDF: ' + error.message, 'error');
    }
}

/**
 * Dibuja una etiqueta individual en el PDF.
 */
function dibujarEtiquetaEnPDF(doc, x, y, e, nombreProducto, datos) {
    const W = ETIQUETA_ANCHO_MM;
    const H = ETIQUETA_ALTO_MM;
    const M = MARGEN_MM;
    const interiorW = W - 2 * M;

    let cursorY = y + M + 2;

    // --- Cabecera marca ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(247, 148, 30); // naranja
    doc.text('QUALITY PIZZAFRESH', x + M, cursorY);
    doc.setDrawColor(247, 148, 30);
    doc.setLineWidth(0.2);
    doc.line(x + M, cursorY + 1, x + W - M, cursorY + 1);
    cursorY += 4;

    // --- Denominación ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(nombreProducto.toUpperCase(), x + M, cursorY, { maxWidth: interiorW });
    cursorY += 3;

    // Idiomas adicionales (denominación traducida)
    doc.setFontSize(5);
    doc.setFont('helvetica', 'italic');
    if (e.idiomas.includes('en')) {
        doc.text('Pre-cooked pizza base', x + M, cursorY);
        cursorY += 2.3;
    }
    if (e.idiomas.includes('pt')) {
        doc.text('Massa de pizza pre-cozida', x + M, cursorY);
        cursorY += 2.3;
    }
    if (e.idiomas.includes('fr')) {
        doc.text('Pate a pizza precuite', x + M, cursorY);
        cursorY += 2.3;
    }

    cursorY += 1;

    // --- Lote y caducidad (caja destacada) ---
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(x + M, cursorY - 3, interiorW, 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(`LOTE: ${e.lote}`, x + M + 1.5, cursorY);
    cursorY += 3;
    doc.text(`CAD: ${formatearFechaEtiqueta(e.fechaCaducidad)}`, x + M + 1.5, cursorY);
    cursorY += 5;

    // --- Formato y peso ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    const lineaFormato = [
        e.formato ? `Formato: ${e.formato}` : '',
        e.pesoNeto ? `Peso neto: ${e.pesoNeto}` : ''
    ].filter(Boolean).join('  ·  ');
    if (lineaFormato) {
        doc.text(lineaFormato, x + M, cursorY, { maxWidth: interiorW });
        cursorY += 3;
    }

    // --- Ingredientes ---
    if (e.ingredientes) {
        doc.setFontSize(4.5);
        const textoIng = `Ingredientes: ${e.ingredientes}`;
        const lineasIng = doc.splitTextToSize(textoIng, interiorW);
        const maxLineas = 5; // limitar para no salirse
        const lineasMostrar = lineasIng.slice(0, maxLineas);
        doc.text(lineasMostrar, x + M, cursorY);
        cursorY += lineasMostrar.length * 1.8 + 1;
    }

    // --- Alérgenos ---
    if (e.alergenos) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        doc.text(e.alergenos, x + M, cursorY, { maxWidth: interiorW });
        cursorY += 3;
    }

    // --- Conservación y uso ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.5);
    if (e.conservacion) {
        doc.text(e.conservacion, x + M, cursorY, { maxWidth: interiorW });
        cursorY += 2.3;
    }
    if (e.modoEmpleo) {
        doc.text(e.modoEmpleo, x + M, cursorY, { maxWidth: interiorW });
        cursorY += 2.3;
    }

    // --- Pie (operador) ---
    const pieY = y + H - M - 5;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.1);
    doc.line(x + M, pieY - 1, x + W - M, pieY - 1);
    doc.setFontSize(4.5);
    doc.text(e.operador, x + M, pieY + 1, { maxWidth: interiorW });
    doc.text(`${e.direccion} · ${e.paisOrigen}`, x + M, pieY + 3.2, { maxWidth: interiorW });
}

// ============================================================
// 8. ACCIONES DEL HISTORIAL
// ============================================================

function reimprimirDesdeHistorial(idx) {
    const datos = cargarDatos();
    const historial = obtenerHistorialEtiquetas(datos);
    const entrada = historial[idx];
    if (!entrada) return;

    // Cargar la entrada en el formulario
    estadoFormularioEtiqueta = {
        productoId: entrada.productoId,
        clienteId: null,
        formato: entrada.formato || '',
        pesoNeto: entrada.pesoNeto || '',
        lote: entrada.lote,
        fechaProduccion: entrada.fechaProduccion,
        fechaCaducidad: entrada.fechaCaducidad,
        idiomas: [...entrada.idiomas],
        ingredientes: PLANTILLAS_CONTENIDO.porDefecto.ingredientes,
        alergenos: PLANTILLAS_CONTENIDO.porDefecto.alergenos,
        conservacion: PLANTILLAS_CONTENIDO.porDefecto.conservacion,
        modoEmpleo: PLANTILLAS_CONTENIDO.porDefecto.modoEmpleo,
        operador: 'Quality Pizzafresh S.L.',
        direccion: 'Guardar del Segura (Alicante)',
        paisOrigen: 'España',
        copias: entrada.copias
    };

    renderizarEtiquetas();
    mostrarNotificacion('📄 Etiqueta cargada. Revisa y genera el PDF.', 'info');
}

function eliminarEntradaHistorial(idx) {
    if (!confirm('⚠️ ¿Eliminar esta entrada del historial?')) return;
    const datos = cargarDatos();
    const historial = obtenerHistorialEtiquetas(datos);
    historial.splice(idx, 1);
    guardarDatos(datos);
    renderizarEtiquetas();
    mostrarNotificacion('✅ Entrada eliminada', 'success');
}

function limpiarHistorialEtiquetas() {
    if (!confirm('⚠️ ¿Eliminar TODO el historial de etiquetas?')) return;
    const datos = cargarDatos();
    datos[CLAVE_HISTORIAL_ETIQUETAS] = [];
    guardarDatos(datos);
    renderizarEtiquetas();
    mostrarNotificacion('✅ Historial limpiado', 'success');
}
