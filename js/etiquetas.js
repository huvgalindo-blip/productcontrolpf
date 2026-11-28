/**
 * ============================================================
 * MÓDULO: ETIQUETAS (v10 - Corrección de Orientación y Negritas)
 * ============================================================
 * - Forzado el formato Vertical (68x80mm) para evitar que la Zebra voltee la etiqueta.
 * - Función para resaltar ingredientes usando marcas **texto**.
 * - CSS de impresión blindado para evitar cortes y escalados.
 * ============================================================
 */

const CLAVE_HISTORIAL_ETIQUETAS = 'historialEtiquetas';
const MAX_HISTORIAL_ETIQUETAS = 50;
const URL_LOGO = 'https://qualitypizzafresh.com/img/cms/LOGOTIPO_QUALITY_PIZZAFRESH_1.png';

let logoBase64Cache = null;

const FORMATOS_ETIQUETA = {
    vertical: { ancho: 68, alto: 80, etiqueta: '🖨️ Vertical (68 × 80 mm)' }
};

const FORMATO_DEFECTO = 'vertical';
const MARGEN_TOTAL_MM = 3; // Margen interno para la Zebra

const DATOS_OPERADOR = {
    razonSocial: 'Hermanos Viudes S.L.',
    rgseaa: '20.044822/A',
    direccion: 'Guardamar del Segura (Alicante)',
    paisOrigen: 'España'
};

const MAPEO_PAIS_IDIOMA = {
    'España': 'es', 'Portugal': 'pt', 'Francia': 'fr',
    'Reino Unido': 'en', 'Alemania': 'en', 'Italia': 'en',
    'Países Bajos': 'en', 'Bélgica': 'fr', 'Irlanda': 'en',
    'Suiza': 'fr', 'Andorra': 'fr', 'Otros': 'en'
};

const IDIOMAS_DISPONIBLES = [
    { codigo: 'es', nombre: '🇪🇸 Español (obligatorio UE)' },
    { codigo: 'pt', nombre: '🇵🇹 Portugués' },
    { codigo: 'fr', nombre: '🇫🇷 Francés' },
    { codigo: 'en', nombre: '🇬🇧 Inglés' }
];

const TEXTOS_I18N = {
    es: {
        fechaElaboracion: 'F. Elaboración', consumoPreferente: 'Consumo preferente',
        ingredientes: 'INGREDIENTES', alergenos: 'ALÉRGENOS',
        infoNutricional: 'INFO. NUTRICIONAL', valorMedio: 'Valor medio 100g',
        conservacion: 'CONSERVACIÓN', elaboracion: 'ELABORACIÓN',
        energia: 'V. energético', grasas: 'Grasas', grasasSaturadas: 'G. saturadas',
        hidratos: 'H. carbono', azucares: 'Azúcares', proteinas: 'Proteínas', sal: 'Sal',
        colNutriente: 'Nutriente', colValor: 'Valor'
    },
    pt: {
        fechaElaboracion: 'F. Elaboração', consumoPreferente: 'Consumir de preferência',
        ingredientes: 'INGREDIENTES', alergenos: 'ALERGÉNIOS',
        infoNutricional: 'INFO. NUTRICIONAL', valorMedio: 'Valor médio 100g',
        conservacion: 'CONSERVAÇÃO', elaboracion: 'ELABORAÇÃO',
        energia: 'V. energético', grasas: 'Gorduras', grasasSaturadas: 'G. saturadas',
        hidratos: 'H. carbono', azucares: 'Açúcares', proteinas: 'Proteínas', sal: 'Sal',
        colNutriente: 'Nutriente', colValor: 'Valor'
    },
    fr: {
        fechaElaboracion: 'Date d\'élaboration', consumoPreferente: 'À consommer de préf.',
        ingredientes: 'INGRÉDIENTS', alergenos: 'ALLERGÈNES',
        infoNutricional: 'INFO. NUTRITIONNELLES', valorMedio: 'Valeur moyenne 100g',
        conservacion: 'CONSERVATION', elaboracion: 'ÉLABORATION',
        energia: 'V. énergétique', grasas: 'Mat. grasses', grasasSaturadas: 'dont AG sat.',
        hidratos: 'Glucides', azucares: 'dont sucres', proteinas: 'Protéines', sal: 'Sel',
        colNutriente: 'Nutriment', colValor: 'Valeur'
    },
    en: {
        fechaElaboracion: 'Production date', consumoPreferente: 'Best before',
        ingredientes: 'INGREDIENTS', alergenos: 'ALLERGENS',
        infoNutricional: 'NUTRITIONAL INFO.', valorMedio: 'Average value 100g',
        conservacion: 'STORAGE', elaboracion: 'COOKING',
        energia: 'Energy', grasas: 'Fat', grasasSaturadas: 'Saturates',
        hidratos: 'Carbohydrate', azucares: 'Sugars', proteinas: 'Protein', sal: 'Salt',
        colNutriente: 'Nutrient', colValor: 'Value'
    }
};

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

async function cargarLogoBase64() {
    if (logoBase64Cache) return logoBase64Cache;
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                logoBase64Cache = canvas.toDataURL('image/png');
                resolve(logoBase64Cache);
            } catch (e) {
                resolve(null);
            }
        };
        img.onerror = function() { resolve(null); };
        setTimeout(() => resolve(null), 3000);
        img.src = URL_LOGO;
    });
}

function fichaTecnicaPorDefecto() {
    return {
        pesoNeto: '', formato: '',
        // Aquí ya incluimos las marcas ** ** en la harina
        ingredientesES: '**Harina de trigo (gluten)**, agua, sal, levadura, aceite de oliva.',
        ingredientesPT: '**Farinha de trigo (glúten)**, água, sal, fermento, azeite de oliva.',
        ingredientesFR: '**Farine de blé (gluten)**, eau, sel, levure, huile d\'olive.',
        ingredientesEN: '**Wheat flour (gluten)**, water, salt, yeast, olive oil.',
        alergenosES: 'SOJA Y MOSTARDA (No presente en la formulación, pero no se puede descartar por contaminación cruzada).',
        alergenosPT: 'SOJA E MOSTARDA (Presentes na formulação, mas não podem ser descartadas devido à contaminação cruzada).',
        alergenosFR: 'SOJA ET MOUTARDE (Non présents dans la formulation, mais ne peuvent être exclus en raison d\'une contamination croisée).',
        alergenosEN: 'SOY AND MUSTARD (Not present in the formulation, but cannot be ruled out due to cross-contamination).',
        nutricional: {
            energiaKJ: 1160, energiaKcal: 274, grasas: 4.3, grasasSaturadas: 1.2,
            hidratos: 50, azucares: 0.5, proteinas: 8.6, sal: 1.5
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
    if (historial.length > MAX_HISTORIAL_ETIQUETAS) historial.splice(MAX_HISTORIAL_ETIQUETAS);
    guardarDatos(datos);
}

function generarLoteAutomatico(datos, fecha) {
    const fechaStr = (fecha || obtenerFechaActual()).replace(/-/g, '');
    const historial = obtenerHistorialEtiquetas(datos);
    const lotesHoy = historial.filter(e => e.lote && e.lote.includes(`L-${fechaStr}-`)).length;
    return `L-${fechaStr}-${String(lotesHoy + 1).padStart(3, '0')}`;
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

function idiomaPorPais(pais) {
    if (!pais) return 'es';
    return MAPEO_PAIS_IDIOMA[pais] || 'en';
}

function idiomaSugeridoCliente(cliente) {
    if (!cliente || !cliente.pais) return 'es';
    return idiomaPorPais(cliente.pais);
}

/**
 * NUEVA FUNCIÓN: Convierte marcas **texto** en <strong>texto</strong>
 * respetando la seguridad (escapa el resto del texto).
 */
function resaltarIngredientes(texto) {
    if (!texto) return '';
    const partes = String(texto).split(/(\*\*[^*]+\*\*)/g);
    return partes.map(parte => {
        if (parte.startsWith('**') && parte.endsWith('**')) {
            const contenido = parte.slice(2, -2).trim();
            return `<strong>${escaparHTML(contenido)}</strong>`;
        }
        return escaparHTML(parte);
    }).join('');
}

let estadoFormularioEtiqueta = null;

function inicializarEstadoFormulario() {
    const datos = cargarDatos();
    const fechaHoy = obtenerFechaActual();
    const diasCaducidad = datos.configuracion.diasCaducidad || 19;

    estadoFormularioEtiqueta = {
        productoId: null, clienteId: null, formato: FORMATO_DEFECTO, idioma: 'es',
        lote: generarLoteAutomatico(datos, fechaHoy),
        fechaProduccion: fechaHoy,
        fechaCaducidad: calcularFechaCaducidad(fechaHoy, diasCaducidad),
        copias: 1
    };
}

function renderizarEtiquetas() {
    const container = document.getElementById('vista-container');
    container.innerHTML = '<div class="loading">Cargando generador de etiquetas...</div>';

    setTimeout(() => {
        try {
            let datos = cargarDatos();
            datos.productos = migrarProductosConFichaTecnica(datos);
            if (!estadoFormularioEtiqueta) inicializarEstadoFormulario();

            const productos = obtenerProductosActivos(datos).map(asegurarFichaTecnicaProducto);
            const clientes = obtenerClientesActivos(datos);
            const historial = obtenerHistorialEtiquetas(datos);
            cargarLogoBase64();

            let html = `
                <div class="vista active">
                    <div class="vista-header">
                        <div>
                            <h2>🏷️ Generador de Etiquetas</h2>
                            <span class="subtitle">Etiquetas reglamentarias UE · Zebra ZD420</span>
                        </div>
                        <div class="flex gap-10">
                            <button class="btn btn-primary btn-sm" onclick="imprimirEtiquetaDirecto()" title="Imprimir">🖨️ Imprimir</button>
                            <button class="btn btn-secondary btn-sm" onclick="resetearFormularioEtiqueta()">🔄 Limpiar</button>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 400px; gap: 20px; align-items: start;">
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
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML = html;
        } catch (error) {
            console.error('❌ Error al renderizar etiquetas:', error);
            container.innerHTML = `<div class="vista active"><div class="vista-error"><h3>❌ Error</h3><p>${escaparHTML(error.message)}</p></div></div>`;
        }
    }, 50);
}

function renderizarFormularioEtiqueta(datos, productos, clientes) {
    const e = estadoFormularioEtiqueta;
    return `
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">📦 Producto y destino</h3>
            <div class="form-row">
                <div class="form-group">
                    <label>Producto *</label>
                    <select id="etq-producto" onchange="cambiarProductoEtiqueta(parseInt(this.value) || null)">
                        <option value="">— Seleccionar producto —</option>
                        ${productos.map(p => `<option value="${p.id}" ${p.id === e.productoId ? 'selected' : ''}>${escaparHTML(p.nombre)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Cliente destino (opcional)</label>
                    <select id="etq-cliente" onchange="cambiarClienteEtiqueta(parseInt(this.value) || null)">
                        <option value="">— Etiqueta genérica (sin cliente) —</option>
                        ${clientes.map(c => `<option value="${c.id}" ${c.id === e.clienteId ? 'selected' : ''}>${escaparHTML(c.codigo)} - ${escaparHTML(c.nombre)}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">🌍 Idioma de la etiqueta</h3>
            <div class="form-row">
                <div class="form-group">
                    <select id="etq-idioma" onchange="cambiarIdiomaEtiqueta(this.value)">
                        ${IDIOMAS_DISPONIBLES.map(i => `<option value="${i.codigo}" ${i.codigo === e.idioma ? 'selected' : ''}>${i.nombre}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">📅 Fechas y lote</h3>
            <div class="form-row">
                <div class="form-group" style="grid-column: span 2;">
                    <label>Lote</label>
                    <div style="display: flex; gap: 6px;">
                        <input type="text" value="${escaparHTML(e.lote)}" onchange="actualizarCampoEtiqueta('lote', this.value)" style="flex: 1;">
                        <button class="btn btn-secondary btn-sm" onclick="generarNuevoLote()">🎲</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Fecha producción</label>
                    <input type="date" value="${e.fechaProduccion}" onchange="actualizarFechaProduccion(this.value)">
                </div>
                <div class="form-group">
                    <label>Fecha caducidad</label>
                    <input type="date" value="${e.fechaCaducidad}" onchange="actualizarCampoEtiqueta('fechaCaducidad', this.value)">
                </div>
            </div>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <div class="form-row">
                <div class="form-group">
                    <label>Número de copias</label>
                    <input type="number" min="1" max="200" value="${e.copias}" onchange="actualizarCampoEtiqueta('copias', parseInt(this.value) || 1)">
                </div>
            </div>
        </div>
    `;
}

function renderizarVistaPreviaEtiqueta(datos) {
    const e = estadoFormularioEtiqueta;
    const productos = obtenerProductosActivos(datos).map(asegurarFichaTecnicaProducto);
    const producto = productos.find(p => p.id === e.productoId);

    if (!producto) {
        return `<div style="width: 340px; height: 280px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999; font-size: 0.85rem; text-align: center; padding: 20px;">Selecciona un producto<br>para ver la vista previa</div>`;
    }

    const dim = FORMATOS_ETIQUETA[e.formato] || FORMATOS_ETIQUETA.vertical;
    const escala = Math.min(360 / dim.ancho, 360 / dim.alto);
    
    const idioma = e.idioma;
    const t = TEXTOS_I18N[idioma];
    const ing = producto[`ingredientes${idioma.toUpperCase()}`] || producto.ingredientesES;
    const aler = producto[`alergenos${idioma.toUpperCase()}`] || producto.alergenosES;
    const nut = producto.nutricional;

    const logoHTML = logoBase64Cache
        ? `<img src="${logoBase64Cache}" alt="Logo" style="height: ${escala * 6}px; max-width: ${escala * 22}px; object-fit: contain;">`
        : `<span style="font-size: ${escala * 1.8}px; color: #000; font-weight: bold;">PIZZAFRESH</span>`;

    const filasNut = [
        [t.energia, `${nut.energiaKJ}KJ/${nut.energiaKcal}kcal`],
        [t.grasas, `${nut.grasas}g`],
        [t.grasasSaturadas, `${nut.grasasSaturadas}g`],
        [t.hidratos, `${nut.hidratos}g`],
        [t.azucares, `${nut.azucares}g`],
        [t.proteinas, `${nut.proteinas}g`],
        [t.sal, `${nut.sal}g`]
    ];

    return `
        <div style="
            width: ${dim.ancho * escala}px; height: ${dim.alto * escala}px;
            border: 1px dashed #999; background: white;
            padding: ${MARGEN_TOTAL_MM * escala}px;
            box-sizing: border-box; font-family: Arial, sans-serif;
            color: #000; display: flex; flex-direction: column;
            font-size: ${escala * 2}px; overflow: hidden;
        ">
            <div style="display: flex; align-items: center; gap: ${escala * 1.5}px; border-bottom: 0.5px solid #000; padding-bottom: ${escala * 0.5}px;">
                <div style="flex-shrink: 0;">${logoHTML}</div>
                <div style="flex: 1; font-size: ${escala * 1.6}px; font-weight: bold; color: #000; line-height: 1.1; text-align: right;">
                    ${DATOS_OPERADOR.razonSocial}<br>
                    <span style="font-weight: normal; font-size: ${escala * 1.4}px;">RGSEAA: ${DATOS_OPERADOR.rgseaa}</span>
                </div>
            </div>

            <div style="text-align: center; font-size: ${escala * 1.8}px; font-weight: bold; margin: ${escala * 0.8}px 0; background: #000; color: #fff; padding: ${escala * 0.4}px; border-radius: 2px;">
                LOTE: ${escaparHTML(e.lote)}
            </div>

            <div style="font-weight: bold; text-align: center; font-size: ${escala * 2.2}px; margin: ${escala * 0.5}px 0;">
                ${escaparHTML(producto.nombre).toUpperCase()}
            </div>

            <div style="font-size: ${escala * 1.5}px; margin-bottom: ${escala * 0.6}px; line-height: 1.1;">
                <strong>${t.fechaElaboracion}:</strong> ${formatearFechaEtiqueta(e.fechaProduccion)}<br>
                <strong>${t.consumoPreferente}:</strong> ${formatearFechaEtiqueta(e.fechaCaducidad)}
            </div>

            <div style="font-weight: bold; font-size: ${escala * 1.6}px; margin-top: ${escala * 0.4}px;">${t.ingredientes}:</div>
            <div style="font-size: ${escala * 1.4}px; line-height: 1.1; margin-bottom: ${escala * 0.6}px;">${resaltarIngredientes(ing)}</div>

            <div style="border: 0.5px solid #000; padding: ${escala * 0.4}px; margin-bottom: ${escala * 0.6}px;">
                <span style="font-weight: bold; font-size: ${escala * 1.6}px;">${t.alergenos}: </span>
                <span style="font-weight: 900; font-size: ${escala * 1.4}px; line-height: 1.1;">${escaparHTML(aler)}</span>
            </div>

            <div style="font-weight: bold; font-size: ${escala * 1.6}px; margin-top: ${escala * 0.2}px;">${t.infoNutricional}</div>
            <div style="font-size: ${escala * 1.3}px; margin-bottom: ${escala * 0.2}px;"><em>${t.valorMedio}</em></div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: ${escala * 1.4}px; line-height: 1.1; margin-top: ${escala * 0.2}px;">
                <thead>
                    <tr>
                        <th style="text-align: left; border: 0.3px solid #000; padding: ${escala * 0.2}px ${escala * 0.4}px; background: #000; color: #fff; font-weight: bold;">${t.colNutriente}</th>
                        <th style="text-align: right; border: 0.3px solid #000; padding: ${escala * 0.2}px ${escala * 0.4}px; background: #000; color: #fff; font-weight: bold;">${t.colValor}</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasNut.map(([k, v]) => `
                        <tr>
                            <td style="border: 0.3px solid #000; padding: ${escala * 0.2}px ${escala * 0.4}px;">${k}</td>
                            <td style="border: 0.3px solid #000; padding: ${escala * 0.2}px ${escala * 0.4}px; text-align: right; white-space: nowrap;">${v}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="font-weight: bold; font-size: ${escala * 1.5}px; margin-top: ${escala * 0.4}px;">${t.conservacion}:</div>
            <div style="font-size: ${escala * 1.3}px; line-height: 1.1;">${TEXTOS_CONSERVACION[idioma]}</div>
            <div style="font-weight: bold; font-size: ${escala * 1.5}px; margin-top: ${escala * 0.3}px;">${t.elaboracion}:</div>
            <div style="font-size: ${escala * 1.3}px; line-height: 1.1;">${TEXTOS_ELABORACION[idioma]}</div>

            <div style="margin-top: auto; font-size: ${escala * 1.2}px; text-align: center; border-top: 0.5px solid #000; padding-top: ${escala * 0.3}px;">
                ${DATOS_OPERADOR.direccion}
            </div>
        </div>
    `;
}

function renderizarHistorialEtiquetas(historial) {
    if (!historial || historial.length === 0) return `<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"><h3 style="margin-bottom: 15px;">📜 Historial</h3><p style="color: #999; text-align: center; padding: 20px;">Aún no has generado ninguna etiqueta.</p></div>`;

    return `
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div class="flex-between mb-10">
                <h3>📜 Historial (${historial.length})</h3>
                <button class="btn btn-danger btn-sm" onclick="limpiarHistorialEtiquetas()">🗑️ Limpiar</button>
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                ${historial.map((h, idx) => `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #eee;">
                        <div style="flex: 1; font-size: 0.85rem;">
                            <div><strong>${escaparHTML(h.productoNombre)}</strong></div>
                            <div style="color: #666; font-size: 0.75rem;">
                                ${new Date(h.generadoEn).toLocaleString('es-ES')} · Lote: ${escaparHTML(h.lote)} · ${h.copias} copia${h.copias > 1 ? 's' : ''}
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-sm" onclick="reimprimirDesdeHistorial(${idx})">📄</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarEntradaHistorial(${idx})">🗑️</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

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

function cambiarClienteEtiqueta(clienteId) {
    if (!estadoFormularioEtiqueta) return;
    estadoFormularioEtiqueta.clienteId = clienteId;
    if (clienteId) {
        const datos = cargarDatos();
        const cliente = datos.clientes.find(c => c.id === clienteId);
        if (cliente && cliente.pais) {
            estadoFormularioEtiqueta.idioma = idiomaSugeridoCliente(cliente);
        }
    }
    renderizarEtiquetas();
}

function generarNuevoLote() {
    const datos = cargarDatos();
    estadoFormularioEtiqueta.lote = generarLoteAutomatico(datos, estadoFormularioEtiqueta.fechaProduccion);
    renderizarEtiquetas();
    mostrarNotificacion(`🎲 Nuevo lote: ${estadoFormularioEtiqueta.lote}`, 'info');
}

function resetearFormularioEtiqueta() {
    if (!confirm('⚠️ ¿Limpiar el formulario?')) return;
    estadoFormularioEtiqueta = null;
    inicializarEstadoFormulario();
    renderizarEtiquetas();
}

function actualizarVistaPreviaEtiqueta() {
    const contenedor = document.getElementById('vista-previa-etiqueta');
    if (!contenedor) return;
    contenedor.innerHTML = renderizarVistaPreviaEtiqueta(cargarDatos());
}

function imprimirEtiquetaDirecto() {
    const e = estadoFormularioEtiqueta;
    if (!e || !e.productoId || !e.lote) {
        mostrarNotificacion('⚠️ Selecciona un producto y un lote', 'warning');
        return;
    }

    try {
        const datos = cargarDatos();
        const productos = obtenerProductosActivos(datos).map(asegurarFichaTecnicaProducto);
        const producto = productos.find(p => p.id === e.productoId);

        const dim = FORMATOS_ETIQUETA[e.formato] || FORMATOS_ETIQUETA.vertical;
        const anchoMM = dim.ancho;
        const altoMM = dim.alto;

        const etiquetaHTML = renderizarEtiquetaParaImpresion(e, producto, anchoMM, altoMM);

        const ventana = window.open('', '_blank', 'width=500,height=600');
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
                    /* FORZAR ORIENTACIÓN VERTICAL Y MÁRGENES 0 */
                    @page {
                        size: ${anchoMM}mm ${altoMM}mm portrait;
                        margin: 0;
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    html, body {
                        width: ${anchoMM}mm;
                        height: ${altoMM}mm;
                        font-family: Arial, sans-serif;
                        color: #000;
                        background: white;
                        -webkit-print-color-adjust: exact;
                    }
                    .etiqueta {
                        width: ${anchoMM}mm;
                        height: ${altoMM}mm;
                        padding: ${MARGEN_TOTAL_MM}mm;
                        display: flex;
                        flex-direction: column;
                        page-break-after: always;
                        overflow: hidden;
                    }
                    .etiqueta:last-child { page-break-after: auto; }

                    .cabecera { display: flex; align-items: center; gap: 1.5mm; border-bottom: 0.5pt solid #000; padding-bottom: 0.5mm; margin-bottom: 1mm; }
                    .cabecera img { height: 6mm; max-width: 20mm; object-fit: contain; flex-shrink: 0; filter: grayscale(100%); }
                    .cabecera .texto { flex: 1; text-align: right; font-size: 5pt; font-weight: bold; color: #000; line-height: 1.15; }
                    .cabecera .texto small { display: block; font-weight: normal; color: #000; font-size: 4pt; }
                    
                    .lote { text-align: center; font-size: 6pt; font-weight: bold; background: #000; color: #fff; padding: 0.5mm 0; margin-bottom: 1mm; border-radius: 1px;}
                    .nombre-producto { font-weight: bold; text-align: center; font-size: 7pt; margin: 0.5mm 0 0.8mm 0; line-height: 1.15; }
                    .fechas { font-size: 5.5pt; margin-bottom: 0.8mm; line-height: 1.2; }
                    .titulo-seccion { font-weight: bold; font-size: 5.5pt; margin-top: 0.6mm; line-height: 1.15; }
                    .texto { font-size: 5pt; line-height: 1.15; }
                    .alergenos { font-weight: 900; font-size: 5pt; color: #000; margin-top: 0.6mm; line-height: 1.15; border: 0.3pt solid #000; padding: 0.5mm; }
                    
                    .tabla-nut { width: 100%; border-collapse: collapse; font-size: 4.5pt; line-height: 1.1; margin-top: 0.3mm; }
                    .tabla-nut th { border: 0.3pt solid #000; padding: 0.3mm 0.6mm; text-align: left; background: #000; color: #fff; font-weight: bold; }
                    .tabla-nut th:last-child { text-align: right; }
                    .tabla-nut td { border: 0.3pt solid #000; padding: 0.3mm 0.6mm; }
                    .tabla-nut td:last-child { text-align: right; white-space: nowrap; }
                    
                    .pie { font-size: 4pt; text-align: center; border-top: 0.3pt solid #000; padding-top: 0.5mm; margin-top: auto; color: #000; line-height: 1.1; }
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

function renderizarEtiquetaParaImpresion(e, producto, anchoMM, altoMM) {
    const idioma = e.idioma;
    const t = TEXTOS_I18N[idioma];
    const ing = producto[`ingredientes${idioma.toUpperCase()}`] || producto.ingredientesES;
    const aler = producto[`alergenos${idioma.toUpperCase()}`] || producto.alergenosES;
    const nut = producto.nutricional;

    const logoHTML = logoBase64Cache
        ? `<img src="${logoBase64Cache}" alt="Logo">`
        : `<span style="font-size: 5pt; font-weight: bold; color: #000;">PIZZAFRESH</span>`;

    const filasNut = [
        [t.energia, `${nut.energiaKJ}KJ/${nut.energiaKcal}kcal`],
        [t.grasas, `${nut.grasas}g`],
        [t.grasasSaturadas, `${nut.grasasSaturadas}g`],
        [t.hidratos, `${nut.hidratos}g`],
        [t.azucares, `${nut.azucares}g`],
        [t.proteinas, `${nut.proteinas}g`],
        [t.sal, `${nut.sal}g`]
    ];

    return `
        <div class="etiqueta">
            <div class="cabecera">
                ${logoHTML}
                <div class="texto">
                    ${DATOS_OPERADOR.razonSocial}
                    <small>RGSEAA: ${DATOS_OPERADOR.rgseaa}</small>
                </div>
            </div>
            <div class="lote">LOTE: ${escaparHTML(e.lote)}</div>
            <div class="nombre-producto">${escaparHTML(producto.nombre).toUpperCase()}</div>
            <div class="fechas">
                <strong>${t.fechaElaboracion}:</strong> ${formatearFechaEtiqueta(e.fechaProduccion)}<br>
                <strong>${t.consumoPreferente}:</strong> ${formatearFechaEtiqueta(e.fechaCaducidad)}
            </div>
            <div class="titulo-seccion">${t.ingredientes}:</div>
            <div class="texto">${resaltarIngredientes(ing)}</div>
            <div class="alergenos">${t.alergenos}: ${escaparHTML(aler)}</div>
            <div class="titulo-seccion">${t.infoNutricional} <em style="font-weight: normal;">(${t.valorMedio})</em></div>
            <table class="tabla-nut">
                <thead>
                    <tr>
                        <th>${t.colNutriente}</th>
                        <th>${t.colValor}</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasNut.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
                </tbody>
            </table>
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

function reimprimirDesdeHistorial(idx) {
    const datos = cargarDatos();
    const historial = obtenerHistorialEtiquetas(datos);
    const entrada = historial[idx];
    if (!entrada) return;

    estadoFormularioEtiqueta = {
        productoId: entrada.productoId,
        clienteId: null,
        formato: entrada.formato || FORMATO_DEFECTO,
        idioma: entrada.idioma || 'es',
        lote: entrada.lote,
        fechaProduccion: entrada.fechaProduccion,
        fechaCaducidad: entrada.fechaCaducidad,
        copias: entrada.copias
    };

    renderizarEtiquetas();
    mostrarNotificacion('📄 Etiqueta cargada. Revisa y pulsa 🖨️.', 'info');
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
