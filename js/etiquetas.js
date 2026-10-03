/**
 * ============================================================
 * MÓDULO: ETIQUETAS
 * ============================================================
 * Responsabilidades:
 *   - Generador de etiquetas reglamentarias UE (68 × 80 mm)
 *   - Multiidioma: ES (obligatorio), PT, FR, EN (opcionales)
 *   - Auto-selección de idiomas según país del cliente
 *   - Cálculo automático de lote y fecha de caducidad
 *   - Datos reales: Hermanos Viudes S.L. + RGSEAA
 *   - Ficha técnica por producto (ingredientes, alérgenos, nutricional)
 *   - Vista previa en vivo
 *   - Generación de PDF de 68 × 80 mm exactos (1 etiqueta = 1 página)
 *   - Impresión directa para impresora térmica (window.print)
 *   - Historial de últimas 50 etiquetas
 * 
 * Dependencias: datos.js, utilidades.js, productos.js, clientes.js
 * Librería externa: jsPDF
 * ============================================================
 */

// ============================================================
// 1. CONSTANTES
// ============================================================

const CLAVE_HISTORIAL_ETIQUETAS = 'historialEtiquetas';
const MAX_HISTORIAL_ETIQUETAS = 50;

const ETIQUETA_ANCHO_MM = 68;
const ETIQUETA_ALTO_MM = 80;
const MARGEN_MM = 2.5;

// Datos fijos del operador
const DATOS_OPERADOR = {
    razonSocial: 'Hermanos Viudes S.L.',
    rgseaa: '20.044822/A',
    direccion: 'Guardamar del Segura (Alicante)',
    paisOrigen: 'España'
};

// Mapeo país → idiomas adicionales
const MAPEO_PAIS_IDIOMAS = {
    'España': [],
    'Portugal': ['pt'],
    'Francia': ['fr'],
    'Reino Unido': ['en'],
    'Alemania': ['en'],
    'Italia': ['en'],
    'Países Bajos': ['en'],
    'Bélgica': ['fr'],
    'Irlanda': ['en'],
    'Suiza': ['fr'],
    'Andorra': ['fr'],
    'Otros': ['en']
};

// Textos i18n
const TEXTOS_I18N = {
    es: {
        fechaElaboracion: 'Fecha Elaboración',
        consumoPreferente: 'Consumo preferente',
        ingredientes: 'INGREDIENTES',
        infoNutricional: 'INFORMACIÓN NUTRICIONAL',
        valorMedio: 'Valor medio 100g',
        conservacion: 'CONSERVACIÓN',
        elaboracion: 'ELABORACIÓN',
        energia: 'Valor energético',
        grasas: 'Grasas',
        grasasSaturadas: 'Grasas saturadas',
        hidratos: 'Hidratos de carbono',
        azucares: 'Azúcares',
        proteinas: 'Proteínas',
        sal: 'Sal'
    },
    pt: {
        fechaElaboracion: 'Data de elaboração',
        consumoPreferente: 'Melhor antes da data',
        ingredientes: 'INGREDIENTES',
        infoNutricional: 'INFORMAÇÃO NUTRICIONAL',
        valorMedio: 'Valor médio 100g',
        conservacion: 'CONSERVAÇÃO',
        elaboracao: 'ELABORAÇÃO',
        energia: 'Valor energético',
        grasas: 'Gorduras',
        grasasSaturadas: 'Gorduras saturadas',
        hidratos: 'Hidratos de carbono',
        azucares: 'Açúcares',
        proteinas: 'Proteínas',
        sal: 'Sal'
    },
    fr: {
        fechaElaboracion: 'Date d\'élaboration',
        consumoPreferente: 'À consommer de préférence',
        ingredientes: 'INGRÉDIENTS',
        infoNutricional: 'INFORMATIONS NUTRITIONNELLES',
        valorMedio: 'Valeur moyenne 100g',
        conservacion: 'CONSERVATION',
        elaboracao: 'ÉLABORATION',
        energia: 'Valeur énergétique',
        grasas: 'Matières grasses',
        grasasSaturadas: 'dont acides gras saturés',
        hidratos: 'Glucides',
        azucares: 'dont sucres',
        proteinas: 'Protéines',
        sal: 'Sel'
    },
    en: {
        fechaElaboracion: 'Production date',
        consumoPreferente: 'Best before',
        ingredientes: 'INGREDIENTS',
        infoNutricional: 'NUTRITIONAL INFORMATION',
        valorMedio: 'Average value 100g',
        conservacion: 'STORAGE',
        elaboracao: 'COOKING',
        energia: 'Energy',
        grasas: 'Fat',
        grasasSaturadas: 'of which saturates',
        hidratos: 'Carbohydrate',
        azucares: 'of which sugars',
        proteinas: 'Protein',
        sal: 'Salt'
    }
};

// Textos de conservación y elaboración
const TEXTOS_CONSERVACION = {
    es: 'Mantener refrigeradas entre 0°C y 4°C',
    pt: 'Manter refrigerado entre 0°C e 4°C',
    fr: 'Conserver au réfrigérateur entre 0°C et 4°C',
    en: 'Keep refrigerated between 0°C and 4°C'
};

const TEXTOS_ELABORACION = {
    es: 'Cocinar en horno a 200°C-300°C aprox.',
    pt: 'Cozinhar no forno a 200°C-300°C aprox.',
    fr: 'Cuire au four à 200°C-300°C env.',
    en: 'Bake in oven at 200°C-300°C approx.'
};

// ============================================================
// 1.1 FICHA TÉCNICA POR DEFECTO
// ============================================================

function fichaTecnicaPorDefecto() {
    return {
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
}

function asegurarFichaTecnicaProducto(producto) {
    const defecto = fichaTecnicaPorDefecto();
    return {
        ...producto,
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
}

function migrarProductosConFichaTecnica(datos) {
    let cambios = false;
    datos.productos = datos.productos.map(p => {
        if (!p.nutricional) {
            cambios = true;
            return asegurarFichaTecnicaProducto(p);
        }
        return p;
    });
    if (cambios) guardarDatos(datos);
    return datos.productos;
}

// ============================================================
// 2. HISTORIAL DE ETIQUETAS
// ============================================================

function obtenerHistorialEtiquetas(datos) {
    if (!Array.isArray(datos[CLAVE_HISTORIAL_ETIQUETAS])) {
        datos[CLAVE_HISTORIAL_ETIQUETAS] = [];
        guardarDatos(datos);
    }
    return datos[CLAVE_HISTORIAL_ETIQUETAS];
}

function añadirAlHistorialEtiquetas(datos, entrada) {
    const historial = obtenerHistorialEtiquetas(datos);
    historial.unshift(entrada);
    if (historial.length > MAX_HISTORIAL_ETIQUETAS) {
        historial.splice(MAX_HISTORIAL_ETIQUETAS);
    }
    guardarDatos(datos);
}

// ============================================================
// 3. LOTE Y FECHAS
// ============================================================

function generarLoteAutomatico(datos, fecha) {
    const fechaStr = (fecha || obtenerFechaActual()).replace(/-/g, '');
    const historial = obtenerHistorialEtiquetas(datos);
    const lotesHoy = historial.filter(e =>
        e.lote && e.lote.includes(`L-${fechaStr}-`)
    ).length;
    const secuencial = String(lotesHoy + 1).padStart(3, '0');
    return `L-${fechaStr}-${secuencial}`;
}

function calcularFechaCaducidad(fechaProduccion, diasCaducidad) {
    const fecha = new Date(fechaProduccion);
    fecha.setDate(fecha.getDate() + (parseInt(diasCaducidad) || 0));
    return fecha.toISOString().split('T')[0];
}

function formatearFechaEtiqueta(fecha) {
    if (!fecha) return '';
    const partes = fecha.split('-');
    if (partes.length !== 3) return fecha;
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

// ============================================================
// 4. IDIOMAS POR PAÍS
// ============================================================

function idiomasAdicionalesPorPais(pais) {
    if (!pais) return [];
    return MAPEO_PAIS_IDIOMAS[pais] || ['en'];
}

function idiomasSugeridosCliente(cliente) {
    if (!cliente) return ['es'];
    const adicionales = idiomasAdicionalesPorPais(cliente.pais);
    return ['es', ...adicionales];
}

// ============================================================
// 5. ESTADO DEL FORMULARIO
// ============================================================

let estadoFormularioEtiqueta = null;

function inicializarEstadoFormulario() {
    const datos = cargarDatos();
    const fechaHoy = obtenerFechaActual();
    const diasCaducidad = datos.configuracion.diasCaducidad || 19;

    estadoFormularioEtiqueta = {
        productoId: null,
        clienteId: null,
        lote: generarLoteAutomatico(datos, fechaHoy),
        fechaProduccion: fechaHoy,
        fechaCaducidad: calcularFechaCaducidad(fechaHoy, diasCaducidad),
        idiomas: ['es'],
        copias: 1
    };
}

// ============================================================
// 6. RENDERIZADO PRINCIPAL
// ============================================================

function renderizarEtiquetas() {
    const container = document.getElementById('vista-container');
    container.innerHTML = '<div class="loading">Cargando generador de etiquetas...</div>';

    setTimeout(() => {
        try {
            let datos = cargarDatos();
            datos.productos = migrarProductosConFichaTecnica(datos);

            if (!estadoFormularioEtiqueta) {
                inicializarEstadoFormulario();
            }

            const productos = obtenerProductosActivos(datos).map(asegurarFichaTecnicaProducto);
            const clientes = obtenerClientesActivos(datos);
            const historial = obtenerHistorialEtiquetas(datos);

            let html = `
                <div class="vista active">
                    <div class="vista-header">
                        <div>
                            <h2>🏷️ Generador de Etiquetas</h2>
                            <span class="subtitle">Etiquetas reglamentarias UE · 68 × 80 mm · Impresora térmica</span>
                        </div>
                        <div class="flex gap-10">
                            <button class="btn btn-primary btn-sm" onclick="imprimirEtiquetaDirecto()" title="Imprimir directamente en la impresora térmica">🖨️ Imprimir</button>
                            <button class="btn btn-secondary btn-sm" onclick="generarPDFEtiquetas()" title="Descargar PDF de 68×80 mm">📄 PDF</button>
                            <button class="btn btn-secondary btn-sm" onclick="resetearFormularioEtiqueta()">🔄 Limpiar</button>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start;">
                        <div>
                            ${renderizarFormularioEtiqueta(datos, productos, clientes)}
                            ${renderizarHistorialEtiquetas(historial)}
                        </div>
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

// ============================================================
// 6.1 FORMULARIO
// ============================================================

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
                    <select id="etq-producto" onchange="cambiarProductoEtiqueta(parseInt(this.value) || null)">
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
            ${productoSeleccionado ? `
                <div style="background: #F5F5F5; padding: 10px 15px; border-radius: 6px; font-size: 0.85rem; margin-top: 10px;">
                    <strong>Ficha técnica cargada del producto:</strong>
                    <div style="margin-top: 4px; color: #555;">
                        Formato: ${escaparHTML(productoSeleccionado.formato) || '—'} ·
                        Peso: ${escaparHTML(productoSeleccionado.pesoNeto) || '—'}
                    </div>
                    <div style="margin-top: 6px; font-size: 0.8rem; color: #777;">
                        ✏️ Para editar la ficha técnica ve a <strong>📦 Productos → 📋</strong>
                    </div>
                </div>
            ` : ''}
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

        <!-- COPIAS -->
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <div class="form-row">
                <div class="form-group">
                    <label>Número de copias</label>
                    <input type="number" min="1" max="200" value="${e.copias}"
                           onchange="actualizarCampoEtiqueta('copias', parseInt(this.value) || 1)">
                </div>
            </div>
            <div style="font-size: 0.75rem; color: #999; margin-top: 5px;">
                🖨️ <strong>Imprimir</strong>: abre el diálogo de impresión de la impresora térmica.<br>
                📄 <strong>PDF</strong>: descarga un archivo PDF con el tamaño exacto 68 × 80 mm.
            </div>
        </div>
    `;
}

// ============================================================
// 6.2 VISTA PREVIA
// ============================================================

function renderizarVistaPreviaEtiqueta(datos) {
    const e = estadoFormularioEtiqueta;
    const productos = obtenerProductosActivos(datos).map(asegurarFichaTecnicaProducto);
    const producto = productos.find(p => p.id === e.productoId);

    if (!producto) {
        return `
            <div style="
                width: ${ETIQUETA_ANCHO_MM * 3.5}px;
                height: ${ETIQUETA_ALTO_MM * 3.5}px;
                border: 1px dashed #ccc;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #999;
                font-size: 0.85rem;
                text-align: center;
                padding: 20px;
            ">
                Selecciona un producto<br>para ver la vista previa
            </div>
        `;
    }

    const escala = 3.5;
    const anchoPx = ETIQUETA_ANCHO_MM * escala;
    const altoPx = ETIQUETA_ALTO_MM * escala;

    const columnas = e.idiomas.map(idioma => {
        const t = TEXTOS_I18N[idioma];
        const ing = producto[`ingredientes${idioma.toUpperCase()}`] || producto.ingredientesES;
        const aler = producto[`alergenos${idioma.toUpperCase()}`] || producto.alergenosES;
        const nut = producto.nutricional;

        return `
            <div style="flex: 1; font-size: 5px; line-height: 1.15; padding: 0 2px; overflow: hidden;">
                <div style="font-weight: bold; text-align: center; font-size: 6px; margin-bottom: 2px;">
                    ${escaparHTML(producto.nombre).toUpperCase()}
                </div>
                <div style="font-size: 5px; margin-bottom: 2px;">
                    <strong>${t.fechaElaboracion}:</strong> ${formatearFechaEtiqueta(e.fechaProduccion)}<br>
                    <strong>${t.consumoPreferente}:</strong> ${formatearFechaEtiqueta(e.fechaCaducidad)}
                </div>
                <div style="font-weight: bold; font-size: 5px; margin-bottom: 1px;">${t.ingredientes}:</div>
                <div style="font-size: 4.5px; margin-bottom: 2px;">${escaparHTML(ing)}</div>
                <div style="font-weight: bold; font-size: 4.5px; margin-bottom: 2px; color: #C00;">${escaparHTML(aler)}</div>
                <div style="font-weight: bold; font-size: 5px; margin-bottom: 1px;">${t.infoNutricional}</div>
                <div style="font-size: 4.5px;">
                    <em>${t.valorMedio}</em><br>
                    ${t.energia}: ${nut.energiaKJ} KJ / ${nut.energiaKcal} kcal<br>
                    ${t.grasas}: ${nut.grasas}g<br>
                    ${t.grasasSaturadas}: ${nut.grasasSaturadas}g<br>
                    ${t.hidratos}: ${nut.hidratos}g<br>
                    ${t.azucares}: ${nut.azucares}g<br>
                    ${t.proteinas}: ${nut.proteinas}g<br>
                    ${t.sal}: ${nut.sal}g
                </div>
                <div style="font-weight: bold; font-size: 5px; margin-top: 2px;">${t.conservacion}:</div>
                <div style="font-size: 4.5px; margin-bottom: 1px;">${TEXTOS_CONSERVACION[idioma]}</div>
                <div style="font-weight: bold; font-size: 5px;">${t.elaboracao}:</div>
                <div style="font-size: 4.5px;">${TEXTOS_ELABORACION[idioma]}</div>
            </div>
        `;
    }).join('<div style="width: 1px; background: #ccc;"></div>');

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
        ">
            <div style="font-size: 6px; font-weight: bold; color: #F7941E; text-align: center; border-bottom: 0.5px solid #F7941E; padding-bottom: 1px;">
                🍕 QUALITY PIZZAFRESH · ${DATOS_OPERADOR.razonSocial}
            </div>
            <div style="font-size: 4.5px; text-align: center; margin-bottom: 2px;">
                RGSEAA: ${DATOS_OPERADOR.rgseaa} · LOTE: <strong>${escaparHTML(e.lote)}</strong>
            </div>

            <div style="flex: 1; display: flex; overflow: hidden;">
                ${columnas}
            </div>

            <div style="font-size: 4px; text-align: center; border-top: 0.5px solid #ccc; padding-top: 1px; margin-top: 2px; color: #666;">
                ${DATOS_OPERADOR.direccion} · ${DATOS_OPERADOR.paisOrigen}
            </div>
        </div>
    `;
}

// ============================================================
// 6.3 HISTORIAL
// ============================================================

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
                        <button class="btn btn-secondary btn-sm" onclick="reimprimirDesdeHistorial(${idx})" title="Cargar en formulario">📄</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarEntradaHistorial(${idx})" title="Eliminar">🗑️</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============================================================
// 7. ACCIONES DEL FORMULARIO
// ============================================================

function actualizarCampoEtiqueta(campo, valor) {
    if (!estadoFormularioEtiqueta) return;
    estadoFormularioEtiqueta[campo] = valor;
    actualizarVistaPreviaEtiqueta();
}

function cambiarProductoEtiqueta(productoId) {
    if (!estadoFormularioEtiqueta) return;
    estadoFormularioEtiqueta.productoId = productoId;
    renderizarEtiquetas();
}

function actualizarFechaProduccion(fecha) {
    if (!estadoFormularioEtiqueta) return;
    const datos = cargarDatos();
    estadoFormularioEtiqueta.fechaProduccion = fecha;
    estadoFormularioEtiqueta.fechaCaducidad = calcularFechaCaducidad(fecha, datos.configuracion.diasCaducidad);
    renderizarEtiquetas();
}

function cambiarClienteEtiqueta(clienteId) {
    if (!estadoFormularioEtiqueta) return;
    estadoFormularioEtiqueta.clienteId = clienteId;

    if (clienteId) {
        const datos = cargarDatos();
        const cliente = datos.clientes.find(c => c.id === clienteId);
        if (cliente && cliente.pais) {
            estadoFormularioEtiqueta.idiomas = idiomasSugeridosCliente(cliente);
        }
    }
    renderizarEtiquetas();
}

function toggleIdiomaEtiqueta(idioma, activo) {
    if (!estadoFormularioEtiqueta) return;
    const idiomas = estadoFormularioEtiqueta.idiomas.filter(i => i !== 'es');
    if (activo && !idiomas.includes(idioma)) {
        idiomas.push(idioma);
    } else if (!activo) {
        const idx = idiomas.indexOf(idioma);
        if (idx >= 0) idiomas.splice(idx, 1);
    }
    estadoFormularioEtiqueta.idiomas = ['es', ...idiomas];
    renderizarEtiquetas();
}

function generarNuevoLote() {
    const datos = cargarDatos();
    const nuevo = generarLoteAutomatico(datos, estadoFormularioEtiqueta.fechaProduccion);
    estadoFormularioEtiqueta.lote = nuevo;
    renderizarEtiquetas();
    mostrarNotificacion(`🎲 Nuevo lote: ${nuevo}`, 'info');
}

function resetearFormularioEtiqueta() {
    if (!confirm('⚠️ ¿Limpiar el formulario?')) return;
    estadoFormularioEtiqueta = null;
    inicializarEstadoFormulario();
    renderizarEtiquetas();
    mostrarNotificacion('🔄 Formulario limpiado', 'info');
}

function actualizarVistaPreviaEtiqueta() {
    const contenedor = document.getElementById('vista-previa-etiqueta');
    if (!contenedor) return;
    const datos = cargarDatos();
    contenedor.innerHTML = renderizarVistaPreviaEtiqueta(datos);
}

// ============================================================
// 8. GENERACIÓN DE PDF (68 × 80 mm exactos para impresora térmica)
// ============================================================

/**
 * Genera un PDF con tamaño exacto 68 × 80 mm.
 * 1 etiqueta = 1 página (para impresora térmica).
 * Si hay varias copias, se crean varias páginas idénticas.
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
        if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
            mostrarNotificacion('❌ jsPDF no cargado. Recarga la página.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf || { jsPDF: window.jsPDF };
        const datos = cargarDatos();
        const productos = obtenerProductosActivos(datos).map(asegurarFichaTecnicaProducto);
        const producto = productos.find(p => p.id === e.productoId);

        if (!producto) {
            mostrarNotificacion('❌ Producto no encontrado', 'error');
            return;
        }

        // PDF con formato exacto 68 × 80 mm
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [ETIQUETA_ANCHO_MM, ETIQUETA_ALTO_MM]
        });

        const total = e.copias;

        for (let i = 0; i < total; i++) {
            if (i > 0) doc.addPage([ETIQUETA_ANCHO_MM, ETIQUETA_ALTO_MM], 'portrait');
            dibujarEtiquetaEnPDF(doc, 0, 0, e, producto);
        }

        const nombreArchivo = `etiqueta_${producto.nombre.replace(/\s+/g, '_')}_${e.lote}_${obtenerFechaActual()}.pdf`;
        doc.save(nombreArchivo);

        añadirAlHistorialEtiquetas(datos, {
            id: 'etq-' + Date.now(),
            productoId: e.productoId,
            productoNombre: producto.nombre,
            lote: e.lote,
            fechaProduccion: e.fechaProduccion,
            fechaCaducidad: e.fechaCaducidad,
            idiomas: [...e.idiomas],
            copias: e.copias,
            generadoEn: new Date().toISOString()
        });

        mostrarNotificacion(`✅ PDF generado (${total} etiqueta${total > 1 ? 's' : ''})`, 'success');
        renderizarEtiquetas();

    } catch (error) {
        console.error('❌ Error al generar PDF:', error);
        mostrarNotificacion('❌ Error al generar PDF: ' + error.message, 'error');
    }
}

// ============================================================
// 9. IMPRESIÓN DIRECTA (para impresora térmica)
// ============================================================

/**
 * Abre una ventana con la etiqueta en tamaño 68 × 80 mm y lanza print().
 * Optimizado para impresoras térmicas de etiquetas.
 */
function imprimirEtiquetaDirecto() {
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
        const datos = cargarDatos();
        const productos = obtenerProductosActivos(datos).map(asegurarFichaTecnicaProducto);
        const producto = productos.find(p => p.id === e.productoId);

        if (!producto) {
            mostrarNotificacion('❌ Producto no encontrado', 'error');
            return;
        }

        // Generar el HTML de UNA etiqueta
        const etiquetaHTML = renderizarEtiquetaParaImpresion(e, producto);

        // Crear una ventana con el HTML de impresión
        const ventana = window.open('', '_blank', 'width=400,height=600');
        if (!ventana) {
            mostrarNotificacion('❌ Bloqueador de ventanas activo. Permite popups.', 'error');
            return;
        }

        ventana.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Imprimir etiqueta - ${escaparHTML(producto.nombre)}</title>
                <style>
                    @page {
                        size: ${ETIQUETA_ANCHO_MM}mm ${ETIQUETA_ALTO_MM}mm;
                        margin: 0;
                    }
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    html, body {
                        width: ${ETIQUETA_ANCHO_MM}mm;
                        height: ${ETIQUETA_ALTO_MM}mm;
                        font-family: Arial, sans-serif;
                        color: #000;
                        background: white;
                    }
                    .etiqueta {
                        width: ${ETIQUETA_ANCHO_MM}mm;
                        height: ${ETIQUETA_ALTO_MM}mm;
                        padding: ${MARGEN_MM}mm;
                        display: flex;
                        flex-direction: column;
                        page-break-after: always;
                    }
                    .etiqueta:last-child {
                        page-break-after: auto;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${Array(e.copias).fill(etiquetaHTML).join('')}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 300);
                    };
                <\/script>
            </body>
            </html>
        `);

        ventana.document.close();

        // Guardar en historial
        añadirAlHistorialEtiquetas(datos, {
            id: 'etq-' + Date.now(),
            productoId: e.productoId,
            productoNombre: producto.nombre,
            lote: e.lote,
            fechaProduccion: e.fechaProduccion,
            fechaCaducidad: e.fechaCaducidad,
            idiomas: [...e.idiomas],
            copias: e.copias,
            generadoEn: new Date().toISOString(),
            metodo: 'impresion-directa'
        });

        mostrarNotificacion(`🖨️ Abriendo diálogo de impresión (${e.copias} copia${e.copias > 1 ? 's' : ''})`, 'info');

    } catch (error) {
        console.error('❌ Error al imprimir:', error);
        mostrarNotificacion('❌ Error al imprimir: ' + error.message, 'error');
    }
}

/**
 * Genera el HTML de una etiqueta individual (68 × 80 mm) para impresión.
 */
function renderizarEtiquetaParaImpresion(e, producto) {
    const columnas = e.idiomas.map(idioma => {
        const t = TEXTOS_I18N[idioma];
        const ing = producto[`ingredientes${idioma.toUpperCase()}`] || producto.ingredientesES;
        const aler = producto[`alergenos${idioma.toUpperCase()}`] || producto.alergenosES;
        const nut = producto.nutricional;

        return `
            <div class="columna">
                <div class="nombre-producto">${escaparHTML(producto.nombre).toUpperCase()}</div>
                <div class="fechas">
                    <strong>${t.fechaElaboracion}:</strong> ${formatearFechaEtiqueta(e.fechaProduccion)}<br>
                    <strong>${t.consumoPreferente}:</strong> ${formatearFechaEtiqueta(e.fechaCaducidad)}
                </div>
                <div class="titulo-seccion">${t.ingredientes}:</div>
                <div class="texto">${escaparHTML(ing)}</div>
                <div class="alergenos">${escaparHTML(aler)}</div>
                <div class="titulo-seccion">${t.infoNutricional}</div>
                <div class="texto">
                    <em>${t.valorMedio}</em><br>
                    ${t.energia}: ${nut.energiaKJ} KJ / ${nut.energiaKcal} kcal<br>
                    ${t.grasas}: ${nut.grasas}g<br>
                    ${t.grasasSaturadas}: ${nut.grasasSaturadas}g<br>
                    ${t.hidratos}: ${nut.hidratos}g<br>
                    ${t.azucares}: ${nut.azucares}g<br>
                    ${t.proteinas}: ${nut.proteinas}g<br>
                    ${t.sal}: ${nut.sal}g
                </div>
                <div class="titulo-seccion">${t.conservacion}:</div>
                <div class="texto">${TEXTOS_CONSERVACION[idioma]}</div>
                <div class="titulo-seccion">${t.elaboracao}:</div>
                <div class="texto">${TEXTOS_ELABORACION[idioma]}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="etiqueta">
            <style>
                .etiqueta {
                    width: ${ETIQUETA_ANCHO_MM}mm;
                    height: ${ETIQUETA_ALTO_MM}mm;
                    padding: ${MARGEN_MM}mm;
                    display: flex;
                    flex-direction: column;
                    font-size: 5pt;
                    line-height: 1.15;
                }
                .cabecera {
                    font-size: 6pt;
                    font-weight: bold;
                    color: #F7941E;
                    text-align: center;
                    border-bottom: 0.5pt solid #F7941E;
                    padding-bottom: 1mm;
                }
                .subcabecera {
                    font-size: 4.5pt;
                    text-align: center;
                    margin-bottom: 1mm;
                }
                .cuerpo {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }
                .columna {
                    flex: 1;
                    padding: 0 1mm;
                    overflow: hidden;
                }
                .columna + .columna {
                    border-left: 0.3pt solid #ccc;
                }
                .nombre-producto {
                    font-weight: bold;
                    text-align: center;
                    font-size: 6pt;
                    margin-bottom: 1mm;
                }
                .fechas {
                    font-size: 4.5pt;
                    margin-bottom: 1mm;
                }
                .titulo-seccion {
                    font-weight: bold;
                    font-size: 5pt;
                    margin-top: 0.5mm;
                }
                .texto {
                    font-size: 4pt;
                    line-height: 1.15;
                    margin-bottom: 0.5mm;
                }
                .alergenos {
                    font-weight: bold;
                    font-size: 4pt;
                    color: #C00;
                    margin: 0.5mm 0;
                }
                .pie {
                    font-size: 4pt;
                    text-align: center;
                    border-top: 0.3pt solid #ccc;
                    padding-top: 0.5mm;
                    margin-top: 1mm;
                    color: #666;
                }
            </style>
            <div class="cabecera">
                🍕 QUALITY PIZZAFRESH · ${DATOS_OPERADOR.razonSocial}
            </div>
            <div class="subcabecera">
                RGSEAA: ${DATOS_OPERADOR.rgseaa} · LOTE: <strong>${escaparHTML(e.lote)}</strong>
            </div>
            <div class="cuerpo">
                ${columnas}
            </div>
            <div class="pie">
                ${DATOS_OPERADOR.direccion} · ${DATOS_OPERADOR.paisOrigen}
            </div>
        </div>
    `;
}

// ============================================================
// 10. DIBUJAR ETIQUETA EN PDF (68 × 80 mm)
// ============================================================

function dibujarEtiquetaEnPDF(doc, x, y, e, producto) {
    const W = ETIQUETA_ANCHO_MM;
    const H = ETIQUETA_ALTO_MM;
    const M = MARGEN_MM;
    const interiorW = W - 2 * M;
    const numIdiomas = e.idiomas.length;
    const anchoColumna = interiorW / numIdiomas;

    let cursorY = y + M;

    // --- Cabecera ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(247, 148, 30);
    doc.text('QUALITY PIZZAFRESH · ' + DATOS_OPERADOR.razonSocial, x + W / 2, cursorY, { align: 'center', maxWidth: interiorW });
    cursorY += 2.5;
    doc.setFontSize(4.5);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('RGSEAA: ' + DATOS_OPERADOR.rgseaa, x + W / 2, cursorY, { align: 'center', maxWidth: interiorW });
    cursorY += 1;
    doc.setDrawColor(247, 148, 30);
    doc.line(x + M, cursorY, x + W - M, cursorY);
    cursorY += 1.5;

    // --- Lote ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.text('LOTE: ' + e.lote, x + W / 2, cursorY, { align: 'center', maxWidth: interiorW });
    cursorY += 2;

    // --- Columnas por idioma ---
    e.idiomas.forEach((idioma, idx) => {
        const colX = x + M + (idx * anchoColumna);
        const colAncho = anchoColumna - 0.5;
        const t = TEXTOS_I18N[idioma];
        const ing = producto[`ingredientes${idioma.toUpperCase()}`] || producto.ingredientesES;
        const aler = producto[`alergenos${idioma.toUpperCase()}`] || producto.alergenosES;
        const nut = producto.nutricional;

        let cy = cursorY;

        if (idx > 0) {
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.05);
            doc.line(colX - 0.25, cursorY - 1, colX - 0.25, y + H - M - 6);
        }

        // Nombre producto
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5);
        doc.text(producto.nombre.toUpperCase(), colX + colAncho / 2, cy, { align: 'center', maxWidth: colAncho });
        cy += 2.5;

        // Fechas
        doc.setFontSize(4);
        doc.setFont('helvetica', 'normal');
        doc.text(`${t.fechaElaboracion}: ${formatearFechaEtiqueta(e.fechaProduccion)}`, colX, cy, { maxWidth: colAncho });
        cy += 1.8;
        doc.text(`${t.consumoPreferente}: ${formatearFechaEtiqueta(e.fechaCaducidad)}`, colX, cy, { maxWidth: colAncho });
        cy += 2.2;

        // Ingredientes
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(4);
        doc.text(t.ingredientes + ':', colX, cy, { maxWidth: colAncho });
        cy += 1.6;
        doc.setFont('helvetica', 'normal');
        const lineasIng = doc.splitTextToSize(ing, colAncho);
        doc.text(lineasIng.slice(0, 4), colX, cy);
        cy += Math.min(lineasIng.length, 4) * 1.4 + 1;

        // Alérgenos
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(200, 0, 0);
        const lineasAler = doc.splitTextToSize(aler, colAncho);
        doc.text(lineasAler.slice(0, 3), colX, cy);
        cy += Math.min(lineasAler.length, 3) * 1.4 + 1;
        doc.setTextColor(0, 0, 0);

        // Nutricional
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(4);
        doc.text(t.infoNutricional, colX, cy, { maxWidth: colAncho });
        cy += 1.6;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(3.5);
        doc.text(t.valorMedio, colX, cy, { maxWidth: colAncho });
        cy += 1.4;
        doc.setFont('helvetica', 'normal');

        const nutricional = [
            `${t.energia}: ${nut.energiaKJ}KJ/${nut.energiaKcal}kcal`,
            `${t.grasas}: ${nut.grasas}g`,
            `${t.grasasSaturadas}: ${nut.grasasSaturadas}g`,
            `${t.hidratos}: ${nut.hidratos}g`,
            `${t.azucares}: ${nut.azucares}g`,
            `${t.proteinas}: ${nut.proteinas}g`,
            `${t.sal}: ${nut.sal}g`
        ];
        nutricional.forEach(linea => {
            doc.text(linea, colX, cy, { maxWidth: colAncho });
            cy += 1.4;
        });
        cy += 0.5;

        // Conservación
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(4);
        doc.text(t.conservacion + ':', colX, cy, { maxWidth: colAncho });
        cy += 1.4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(3.5);
        doc.text(TEXTOS_CONSERVACION[idioma], colX, cy, { maxWidth: colAncho });
        cy += 1.6;

        // Elaboración
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(4);
        doc.text(t.elaboracao + ':', colX, cy, { maxWidth: colAncho });
        cy += 1.4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(3.5);
        doc.text(TEXTOS_ELABORACION[idioma], colX, cy, { maxWidth: colAncho });
    });

    // --- Pie ---
    const pieY = y + H - M - 2;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.05);
    doc.line(x + M, pieY - 1, x + W - M, pieY - 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(3.5);
    doc.setTextColor(120, 120, 120);
    doc.text(`${DATOS_OPERADOR.direccion} · ${DATOS_OPERADOR.paisOrigen}`, x + W / 2, pieY + 0.8, { align: 'center', maxWidth: interiorW });
}

// ============================================================
// 11. ACCIONES DEL HISTORIAL
// ============================================================

function reimprimirDesdeHistorial(idx) {
    const datos = cargarDatos();
    const historial = obtenerHistorialEtiquetas(datos);
    const entrada = historial[idx];
    if (!entrada) return;

    estadoFormularioEtiqueta = {
        productoId: entrada.productoId,
        clienteId: null,
        lote: entrada.lote,
        fechaProduccion: entrada.fechaProduccion,
        fechaCaducidad: entrada.fechaCaducidad,
        idiomas: [...entrada.idiomas],
        copias: entrada.copias
    };

    renderizarEtiquetas();
    mostrarNotificacion('📄 Etiqueta cargada. Revisa y pulsa 🖨️ o 📄.', 'info');
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
