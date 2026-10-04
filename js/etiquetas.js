/**
 * ============================================================
 * MÓDULO: ETIQUETAS
 * ============================================================
 * Responsabilidades:
 *   - Generador de etiquetas reglamentarias UE
 *   - Formato seleccionable: Horizontal (80×68 mm) o Vertical (68×80 mm)
 *   - Idioma único seleccionable (ES obligatorio UE, PT/FR/EN opcionales)
 *   - Auto-selección de idioma según país del cliente
 *   - Cálculo automático de lote y fecha de caducidad
 *   - Datos reales: Hermanos Viudes S.L. + RGSEAA
 *   - Ficha técnica por producto (ingredientes, alérgenos, nutricional)
 *   - Vista previa en vivo
 *   - Generación de PDF de tamaño exacto (1 etiqueta = 1 página)
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

// Formatos de etiqueta disponibles (mm)
const FORMATOS_ETIQUETA = {
    horizontal: { ancho: 80, alto: 68, etiqueta: '🖨️ Horizontal (80 × 68 mm)' },
    vertical:   { ancho: 68, alto: 80, etiqueta: '🖨️ Vertical (68 × 80 mm)' }
};

// Formato por defecto
const FORMATO_DEFECTO = 'horizontal';
const MARGEN_MM = 1.5;

// Datos fijos del operador
const DATOS_OPERADOR = {
    razonSocial: 'Hermanos Viudes S.L.',
    rgseaa: '20.044822/A',
    direccion: 'Guardamar del Segura (Alicante)',
    paisOrigen: 'España'
};

// Mapeo país → idioma único
const MAPEO_PAIS_IDIOMA = {
    'España': 'es',
    'Portugal': 'pt',
    'Francia': 'fr',
    'Reino Unido': 'en',
    'Alemania': 'en',
    'Italia': 'en',
    'Países Bajos': 'en',
    'Bélgica': 'fr',
    'Irlanda': 'en',
    'Suiza': 'fr',
    'Andorra': 'fr',
    'Otros': 'en'
};

// Idiomas soportados
const IDIOMAS_DISPONIBLES = [
    { codigo: 'es', nombre: '🇪🇸 Español (obligatorio UE)' },
    { codigo: 'pt', nombre: '🇵🇹 Portugués' },
    { codigo: 'fr', nombre: '🇫🇷 Francés' },
    { codigo: 'en', nombre: '🇬🇧 Inglés' }
];

// Textos i18n (abreviados para máximo aprovechamiento)
const TEXTOS_I18N = {
    es: {
        fechaElaboracion: 'Fecha Elaboración',
        consumoPreferente: 'Consumo preferente',
        ingredientes: 'INGREDIENTES',
        infoNutricional: 'INFORMACIÓN NUTRICIONAL',
        valorMedio: 'Valor medio 100g',
        conservacion: 'CONSERVACIÓN',
        elaboracion: 'ELABORACIÓN',
        energia: 'V. energético',
        grasas: 'Grasas',
        grasasSaturadas: 'G. saturadas',
        hidratos: 'H. carbono',
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
        elaboracion: 'ELABORAÇÃO',
        energia: 'V. energético',
        grasas: 'Gorduras',
        grasasSaturadas: 'G. saturadas',
        hidratos: 'H. carbono',
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
        elaboracion: 'ÉLABORATION',
        energia: 'V. énergétique',
        grasas: 'Mat. grasses',
        grasasSaturadas: 'dont AG sat.',
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
        elaboracion: 'COOKING',
        energia: 'Energy',
        grasas: 'Fat',
        grasasSaturadas: 'Saturates',
        hidratos: 'Carbohydrate',
        azucares: 'Sugars',
        proteinas: 'Protein',
        sal: 'Salt'
    }
};

// Textos de conservación y elaboración por idioma
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
// 4. IDIOMA POR PAÍS
// ============================================================

/**
 * Devuelve el idioma sugerido para un país.
 * Por defecto 'es'.
 */
function idiomaPorPais(pais) {
    if (!pais) return 'es';
    return MAPEO_PAIS_IDIOMA[pais] || 'en';
}

/**
 * Devuelve el idioma sugerido para un cliente.
 */
function idiomaSugeridoCliente(cliente) {
    if (!cliente || !cliente.pais) return 'es';
    return idiomaPorPais(cliente.pais);
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
        formato: FORMATO_DEFECTO,     // 'horizontal' o 'vertical'
        idioma: 'es',                  // ES por defecto
        lote: generarLoteAutomatico(datos, fechaHoy),
        fechaProduccion: fechaHoy,
        fechaCaducidad: calcularFechaCaducidad(fechaHoy, diasCaducidad),
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
                            <span class="subtitle">Etiquetas reglamentarias UE · Impresora térmica</span>
                        </div>
                        <div class="flex gap-10">
                            <button class="btn btn-primary btn-sm" onclick="imprimirEtiquetaDirecto()" title="Imprimir directamente en la impresora térmica">🖨️ Imprimir</button>
                            <button class="btn btn-secondary btn-sm" onclick="generarPDFEtiquetas()" title="Descargar PDF">📄 PDF</button>
                            <button class="btn btn-secondary btn-sm" onclick="resetearFormularioEtiqueta()">🔄 Limpiar</button>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 380px; gap: 20px; align-items: start;">
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
                                    Vista previa a escala
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
                    <strong>Ficha técnica cargada:</strong>
                    <div style="margin-top: 4px; color: #555;">
                        Formato: ${escaparHTML(productoSeleccionado.formato) || '—'} ·
                        Peso: ${escaparHTML(productoSeleccionado.pesoNeto) || '—'}
                    </div>
                    <div style="margin-top: 6px; font-size: 0.8rem; color: #777;">
                        ✏️ Editar en <strong>📦 Productos → 📋</strong>
                    </div>
                </div>
            ` : ''}
        </div>

        <!-- FORMATO DE ETIQUETA -->
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">📐 Formato de etiqueta</h3>
            <div class="form-row">
                <div class="form-group">
                    <select id="etq-formato" onchange="cambiarFormatoEtiqueta(this.value)">
                        ${Object.entries(FORMATOS_ETIQUETA).map(([key, f]) => `
                            <option value="${key}" ${key === e.formato ? 'selected' : ''}>
                                ${f.etiqueta}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            <div style="font-size: 0.75rem; color: #999; margin-top: 5px;">
                💡 Horizontal: más ancho, ideal para 1 idioma · Vertical: más alto, formato clásico
            </div>
        </div>

        <!-- IDIOMA -->
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">🌍 Idioma de la etiqueta</h3>
            <div class="form-row">
                <div class="form-group">
                    <select id="etq-idioma" onchange="cambiarIdiomaEtiqueta(this.value)">
                        ${IDIOMAS_DISPONIBLES.map(i => `
                            <option value="${i.codigo}" ${i.codigo === e.idioma ? 'selected' : ''}>
                                ${i.nombre}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            ${clienteSeleccionado && clienteSeleccionado.pais ? `
                <div style="margin-top: 10px; padding: 8px 12px; background: #E3F2FD; border-radius: 6px; font-size: 0.85rem; color: #1565C0;">
                    🌍 Cliente de <strong>${escaparHTML(clienteSeleccionado.pais)}</strong> ·
                    Idioma sugerido: <strong>${idiomaSugeridoCliente(clienteSeleccionado).toUpperCase()}</strong>
                </div>
            ` : ''}
            <div style="font-size: 0.75rem; color: #999; margin-top: 8px;">
                ℹ️ El español es el idioma obligatorio por normativa UE, pero puedes cambiarlo si la etiqueta va destinada a otro país.
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
                💡 Caducidad automática: ${datos.configuracion.diasCaducidad || 19} días desde producción.
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

// ============================================================
// 6.2 VISTA PREVIA (optimizada, escala adaptativa)
// ============================================================

function renderizarVistaPreviaEtiqueta(datos) {
    const e = estadoFormularioEtiqueta;
    const productos = obtenerProductosActivos(datos).map(asegurarFichaTecnicaProducto);
    const producto = productos.find(p => p.id === e.productoId);

    if (!producto) {
        return `
            <div style="
                width: 300px;
                height: 260px;
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

    // Obtener dimensiones según formato
    const dim = FORMATOS_ETIQUETA[e.formato] || FORMATOS_ETIQUETA.horizontal;
    const anchoMM = dim.ancho;
    const altoMM = dim.alto;

    // Escala para que quepa en 340px de ancho
    const escala = Math.min(340 / anchoMM, 340 / altoMM);
    const anchoPx = anchoMM * escala;
    const altoPx = altoMM * escala;

    const idioma = e.idioma;
    const t = TEXTOS_I18N[idioma];
    const ing = producto[`ingredientes${idioma.toUpperCase()}`] || producto.ingredientesES;
    const aler = producto[`alergenos${idioma.toUpperCase()}`] || producto.alergenosES;
    const nut = producto.nutricional;

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
            font-size: ${escala * 2.2}px;
        ">
            <!-- Cabecera -->
            <div style="font-weight: bold; color: #F7941E; text-align: center; border-bottom: 0.5px solid #F7941E; padding-bottom: 1px; font-size: ${escala * 2.4}px; line-height: 1.1;">
                🍕 QUALITY PIZZAFRESH · ${DATOS_OPERADOR.razonSocial}
            </div>
            <div style="text-align: center; font-size: ${escala * 1.8}px; margin: 1px 0;">
                RGSEAA: ${DATOS_OPERADOR.rgseaa} · LOTE: <strong>${escaparHTML(e.lote)}</strong>
            </div>

            <!-- Nombre producto -->
            <div style="font-weight: bold; text-align: center; font-size: ${escala * 2.6}px; margin: 2px 0 3px 0;">
                ${escaparHTML(producto.nombre).toUpperCase()}
            </div>

            <!-- Fechas -->
            <div style="font-size: ${escala * 1.9}px; margin-bottom: 3px; line-height: 1.2;">
                <strong>${t.fechaElaboracion}:</strong> ${formatearFechaEtiqueta(e.fechaProduccion)}  ·  
                <strong>${t.consumoPreferente}:</strong> ${formatearFechaEtiqueta(e.fechaCaducidad)}
            </div>

            <!-- Ingredientes -->
            <div style="font-weight: bold; font-size: ${escala * 2}px; margin-top: 2px;">${t.ingredientes}:</div>
            <div style="font-size: ${escala * 1.85}px; line-height: 1.15; margin-bottom: 3px;">${escaparHTML(ing)}</div>

            <!-- Alérgenos -->
            <div style="font-weight: bold; font-size: ${escala * 1.85}px; color: #C00; line-height: 1.15; margin-bottom: 3px;">${escaparHTML(aler)}</div>

            <!-- Nutricional -->
            <div style="font-weight: bold; font-size: ${escala * 2}px; margin-top: 2px;">${t.infoNutricional}</div>
            <div style="font-size: ${escala * 1.75}px; line-height: 1.15;">
                <em>${t.valorMedio}</em><br>
                ${t.energia}: ${nut.energiaKJ}KJ/${nut.energiaKcal}kcal ·
                ${t.grasas}: ${nut.grasas}g ·
                ${t.grasasSaturadas}: ${nut.grasasSaturadas}g ·
                ${t.hidratos}: ${nut.hidratos}g ·
                ${t.azucares}: ${nut.azucares}g ·
                ${t.proteinas}: ${nut.proteinas}g ·
                ${t.sal}: ${nut.sal}g
            </div>

            <!-- Conservación y elaboración -->
            <div style="font-weight: bold; font-size: ${escala * 2}px; margin-top: 3px;">${t.conservacion}:</div>
            <div style="font-size: ${escala * 1.75}px;">${TEXTOS_CONSERVACION[idioma]}</div>
            <div style="font-weight: bold; font-size: ${escala * 2}px; margin-top: 2px;">${t.elaboracion}:</div>
            <div style="font-size: ${escala * 1.75}px;">${TEXTOS_ELABORACION[idioma]}</div>

            <!-- Pie -->
            <div style="margin-top: auto; font-size: ${escala * 1.6}px; text-align: center; border-top: 0.5px solid #ccc; padding-top: 2px; color: #666;">
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
                ${historial.map((h, idx) => {
                    // Compatibilidad con historial antiguo (idiomas array)
                    const idiomaMostrar = h.idioma
                        ? h.idioma.toUpperCase()
                        : (Array.isArray(h.idiomas) ? h.idiomas.map(i => i.toUpperCase()).join('+') : 'ES');
                    const formatoMostrar = h.formato === 'vertical' ? 'V' : 'H';

                    return `
                        <div style="display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #eee;">
                            <div style="flex: 1; font-size: 0.85rem;">
                                <div><strong>${escaparHTML(h.productoNombre)}</strong></div>
                                <div style="color: #666; font-size: 0.75rem;">
                                    ${new Date(h.generadoEn).toLocaleString('es-ES')} ·
                                    Lote: ${escaparHTML(h.lote)} ·
                                    Cad: ${formatearFechaEtiqueta(h.fechaCaducidad)} ·
                                    ${h.copias} copia${h.copias > 1 ? 's' : ''} ·
                                    ${formatoMostrar} · ${idiomaMostrar}
                                </div>
                            </div>
                            <button class="btn btn-secondary btn-sm" onclick="reimprimirDesdeHistorial(${idx})" title="Cargar en formulario">📄</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarEntradaHistorial(${idx})" title="Eliminar">🗑️</button>
                        </div>
                    `;
                }).join('')}
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

function cambiarFormatoEtiqueta(formato) {
    if (!estadoFormularioEtiqueta) return;
    estadoFormularioEtiqueta.formato = formato;
    renderizarEtiquetas();
}

function cambiarIdiomaEtiqueta(idioma) {
    if (!estadoFormularioEtiqueta) return;
    estadoFormularioEtiqueta.idioma = idioma;
    renderizarEtiquetas();
}

function actualizarFechaProduccion(fecha) {
    if (!estadoFormularioEtiqueta) return;
    const datos = cargarDatos();
    estadoFormularioEtiqueta.fechaProduccion = fecha;
    estadoFormularioEtiqueta.fechaCaducidad = calcularFechaCaducidad(fecha, datos.configuracion.diasCaducidad);
    renderizarEtiquetas();
}

/**
 * Cambia el cliente y auto-selecciona el idioma según su país.
 */
function cambiarClienteEtiqueta(clienteId) {
    if (!estadoFormularioEtiqueta) return;
    estadoFormularioEtiqueta.clienteId = clienteId;

    if (clienteId) {
        const datos = cargarDatos();
        const cliente = datos.clientes.find(c => c.id === clienteId);
        if (cliente && cliente.pais) {
            const idiomaSugerido = idiomaSugeridoCliente(cliente);
            estadoFormularioEtiqueta.idioma = idiomaSugerido;
            mostrarNotificacion(
                `🌍 Cliente de ${cliente.pais} → idioma cambiado a ${idiomaSugerido.toUpperCase()}`,
                'info'
            );
        }
    }
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
// 8. GENERACIÓN DE PDF
// ============================================================

function generarPDFEtiquetas() {
    const e = estadoFormularioEtiqueta;
    if (!e || !e.productoId) {
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

        const dim = FORMATOS_ETIQUETA[e.formato] || FORMATOS_ETIQUETA.horizontal;
        const anchoMM = dim.ancho;
        const altoMM = dim.alto;

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [anchoMM, altoMM]
        });

        const total = e.copias;

        for (let i = 0; i < total; i++) {
            if (i > 0) doc.addPage([anchoMM, altoMM], 'portrait');
            dibujarEtiquetaEnPDF(doc, 0, 0, e, producto, anchoMM, altoMM);
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
            idioma: e.idioma,
            formato: e.formato,
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
// 9. IMPRESIÓN DIRECTA
// ============================================================

function imprimirEtiquetaDirecto() {
    const e = estadoFormularioEtiqueta;
    if (!e || !e.productoId) {
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

        const dim = FORMATOS_ETIQUETA[e.formato] || FORMATOS_ETIQUETA.horizontal;
        const anchoMM = dim.ancho;
        const altoMM = dim.alto;

        const etiquetaHTML = renderizarEtiquetaParaImpresion(e, producto, anchoMM, altoMM);

        const ventana = window.open('', '_blank', 'width=500,height=400');
        if (!ventana) {
            mostrarNotificacion('❌ Bloqueador de ventanas activo. Permite popups.', 'error');
            return;
        }

        ventana.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Imprimir - ${escaparHTML(producto.nombre)}</title>
                <style>
                    @page {
                        size: ${anchoMM}mm ${altoMM}mm;
                        margin: 0;
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    html, body {
                        width: ${anchoMM}mm;
                        font-family: Arial, sans-serif;
                        color: #000;
                        background: white;
                    }
                    .etiqueta {
                        width: ${anchoMM}mm;
                        height: ${altoMM}mm;
                        padding: ${MARGEN_MM}mm;
                        display: flex;
                        flex-direction: column;
                        page-break-after: always;
                    }
                    .etiqueta:last-child { page-break-after: auto; }

                    .cabecera {
                        font-size: 6pt;
                        font-weight: bold;
                        color: #F7941E;
                        text-align: center;
                        border-bottom: 0.5pt solid #F7941E;
                        padding-bottom: 0.3mm;
                        line-height: 1.15;
                    }
                    .subcabecera {
                        font-size: 5pt;
                        text-align: center;
                        margin: 0.4mm 0 0.6mm 0;
                    }
                    .nombre-producto {
                        font-weight: bold;
                        text-align: center;
                        font-size: 7pt;
                        margin: 0.6mm 0 0.8mm 0;
                        line-height: 1.15;
                    }
                    .fechas {
                        font-size: 5.5pt;
                        margin-bottom: 0.8mm;
                        line-height: 1.2;
                    }
                    .titulo-seccion {
                        font-weight: bold;
                        font-size: 5.5pt;
                        margin-top: 0.7mm;
                        line-height: 1.15;
                    }
                    .texto {
                        font-size: 5pt;
                        line-height: 1.18;
                    }
                    .alergenos {
                        font-weight: bold;
                        font-size: 5pt;
                        color: #C00;
                        margin-top: 0.7mm;
                        line-height: 1.18;
                    }
                    .nutricional {
                        font-size: 5pt;
                        line-height: 1.18;
                    }
                    .pie {
                        font-size: 4pt;
                        text-align: center;
                        border-top: 0.3pt solid #ccc;
                        padding-top: 0.4mm;
                        margin-top: auto;
                        color: #666;
                        line-height: 1.1;
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
                        setTimeout(function() { window.print(); }, 300);
                    };
                <\/script>
            </body>
            </html>
        `);

        ventana.document.close();

        añadirAlHistorialEtiquetas(datos, {
            id: 'etq-' + Date.now(),
            productoId: e.productoId,
            productoNombre: producto.nombre,
            lote: e.lote,
            fechaProduccion: e.fechaProduccion,
            fechaCaducidad: e.fechaCaducidad,
            idioma: e.idioma,
            formato: e.formato,
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
 * Genera HTML de la etiqueta para impresión (1 idioma, formato adaptado).
 */
function renderizarEtiquetaParaImpresion(e, producto, anchoMM, altoMM) {
    const idioma = e.idioma;
    const t = TEXTOS_I18N[idioma];
    const ing = producto[`ingredientes${idioma.toUpperCase()}`] || producto.ingredientesES;
    const aler = producto[`alergenos${idioma.toUpperCase()}`] || producto.alergenosES;
    const nut = producto.nutricional;

    return `
        <div class="etiqueta">
            <div class="cabecera">
                🍕 QUALITY PIZZAFRESH · ${DATOS_OPERADOR.razonSocial}
            </div>
            <div class="subcabecera">
                RGSEAA: ${DATOS_OPERADOR.rgseaa} · LOTE: <strong>${escaparHTML(e.lote)}</strong>
            </div>
            <div class="nombre-producto">${escaparHTML(producto.nombre).toUpperCase()}</div>
            <div class="fechas">
                <strong>${t.fechaElaboracion}:</strong> ${formatearFechaEtiqueta(e.fechaProduccion)}  ·  
                <strong>${t.consumoPreferente}:</strong> ${formatearFechaEtiqueta(e.fechaCaducidad)}
            </div>
            <div class="titulo-seccion">${t.ingredientes}:</div>
            <div class="texto">${escaparHTML(ing)}</div>
            <div class="alergenos">${escaparHTML(aler)}</div>
            <div class="titulo-seccion">${t.infoNutricional}</div>
            <div class="nutricional">
                <em>${t.valorMedio}</em><br>
                ${t.energia}: ${nut.energiaKJ}KJ/${nut.energiaKcal}kcal · ${t.grasas}: ${nut.grasas}g · ${t.grasasSaturadas}: ${nut.grasasSaturadas}g · ${t.hidratos}: ${nut.hidratos}g · ${t.azucares}: ${nut.azucares}g · ${t.proteinas}: ${nut.proteinas}g · ${t.sal}: ${nut.sal}g
            </div>
            <div class="titulo-seccion">${t.conservacion}:</div>
            <div class="texto">${TEXTOS_CONSERVACION[idioma]}</div>
            <div class="titulo-seccion">${t.elaboracion}:</div>
            <div class="texto">${TEXTOS_ELABORACION[idioma]}</div>
            <div class="pie">
                ${DATOS_OPERADOR.direccion} · ${DATOS_OPERADOR.paisOrigen}
            </div>
        </div>
    `;
}

// ============================================================
// 10. DIBUJAR ETIQUETA EN PDF
// ============================================================

function dibujarEtiquetaEnPDF(doc, x, y, e, producto, anchoMM, altoMM) {
    const W = anchoMM;
    const H = altoMM;
    const M = MARGEN_MM;
    const interiorW = W - 2 * M;

    const idioma = e.idioma;
    const t = TEXTOS_I18N[idioma];
    const ing = producto[`ingredientes${idioma.toUpperCase()}`] || producto.ingredientesES;
    const aler = producto[`alergenos${idioma.toUpperCase()}`] || producto.alergenosES;
    const nut = producto.nutricional;

    let cursorY = y + M + 2;

    // Cabecera
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(247, 148, 30);
    doc.text('QUALITY PIZZAFRESH · ' + DATOS_OPERADOR.razonSocial, x + W / 2, cursorY, { align: 'center', maxWidth: interiorW });
    cursorY += 2.5;
    doc.setFontSize(5);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('RGSEAA: ' + DATOS_OPERADOR.rgseaa + '  ·  LOTE: ' + e.lote, x + W / 2, cursorY, { align: 'center', maxWidth: interiorW });
    cursorY += 1;
    doc.setDrawColor(247, 148, 30);
    doc.setLineWidth(0.15);
    doc.line(x + M, cursorY, x + W - M, cursorY);
    cursorY += 2.5;

    // Nombre producto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(producto.nombre.toUpperCase(), x + W / 2, cursorY, { align: 'center', maxWidth: interiorW });
    cursorY += 3.5;

    // Fechas en 1 línea
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
        `${t.fechaElaboracion}: ${formatearFechaEtiqueta(e.fechaProduccion)}   ·   ${t.consumoPreferente}: ${formatearFechaEtiqueta(e.fechaCaducidad)}`,
        x + W / 2, cursorY, { align: 'center', maxWidth: interiorW }
    );
    cursorY += 3.2;

    // Ingredientes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(t.ingredientes + ':', x + M, cursorY);
    cursorY += 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    const lineasIng = doc.splitTextToSize(ing, interiorW);
    doc.text(lineasIng, x + M, cursorY);
    cursorY += lineasIng.length * 1.7 + 1.5;

    // Alérgenos
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(200, 0, 0);
    const lineasAler = doc.splitTextToSize(aler, interiorW);
    doc.text(lineasAler, x + M, cursorY);
    cursorY += lineasAler.length * 1.7 + 1.5;
    doc.setTextColor(0, 0, 0);

    // Nutricional
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(t.infoNutricional, x + M, cursorY);
    cursorY += 2;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(4.5);
    doc.text(t.valorMedio, x + M, cursorY);
    cursorY += 1.8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);

    // Nutricional en 2 líneas horizontales (aprovecha el ancho)
    const linea1 = `${t.energia}: ${nut.energiaKJ}KJ/${nut.energiaKcal}kcal   ·   ${t.grasas}: ${nut.grasas}g   ·   ${t.grasasSaturadas}: ${nut.grasasSaturadas}g   ·   ${t.hidratos}: ${nut.hidratos}g`;
    const linea2 = `${t.azucares}: ${nut.azucares}g   ·   ${t.proteinas}: ${nut.proteinas}g   ·   ${t.sal}: ${nut.sal}g`;
    doc.text(linea1, x + M, cursorY, { maxWidth: interiorW });
    cursorY += 1.8;
    doc.text(linea2, x + M, cursorY, { maxWidth: interiorW });
    cursorY += 2.5;

    // Conservación
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(t.conservacion + ':', x + M, cursorY);
    cursorY += 1.8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.text(TEXTOS_CONSERVACION[idioma], x + M, cursorY, { maxWidth: interiorW });
    cursorY += 2.3;

    // Elaboración
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(t.elaboracion + ':', x + M, cursorY);
    cursorY += 1.8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.text(TEXTOS_ELABORACION[idioma], x + M, cursorY, { maxWidth: interiorW });

    // Pie
    const pieY = y + H - M - 1;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.05);
    doc.line(x + M, pieY - 0.8, x + W - M, pieY - 0.8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4);
    doc.setTextColor(120, 120, 120);
    doc.text(
        `${DATOS_OPERADOR.direccion} · ${DATOS_OPERADOR.paisOrigen}`,
        x + W / 2, pieY + 0.8,
        { align: 'center', maxWidth: interiorW }
    );
}

// ============================================================
// 11. ACCIONES DEL HISTORIAL
// ============================================================

function reimprimirDesdeHistorial(idx) {
    const datos = cargarDatos();
    const historial = obtenerHistorialEtiquetas(datos);
    const entrada = historial[idx];
    if (!entrada) return;

    // Compatibilidad con historial antiguo
    const idioma = entrada.idioma
        || (Array.isArray(entrada.idiomas) && entrada.idiomas[0])
        || 'es';
    const formato = entrada.formato || FORMATO_DEFECTO;

    estadoFormularioEtiqueta = {
        productoId: entrada.productoId,
        clienteId: null,
        formato: formato,
        idioma: idioma,
        lote: entrada.lote,
        fechaProduccion: entrada.fechaProduccion,
        fechaCaducidad: entrada.fechaCaducidad,
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
