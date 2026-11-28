/**
 * ============================================================
 * MÓDULO: CLIENTES (v5 - Categorías + Paginación)
 * ============================================================
 */

function crearClienteVacio() {
    return {
        id: 0,
        codigo: "",
        nombre: "",
        categoria: "Envío 24 horas",
        activo: true,
        razonSocial: "",
        cif: "",
        direccion: "",
        poblacion: "",
        codigoPostal: "",
        provincia: "",
        telefono: "",
        movil: "",
        email: "",
        personaContacto: "",
        diasPago: 0,
        formaPago: "",
        descuento: 0,
        observaciones: "",
        fechaAlta: "",
        ultimaModificacion: ""
    };
}

function asegurarEstructuraCliente(cliente) {
    const plantilla = crearClienteVacio();
    return Object.assign({}, plantilla, cliente);
}

function obtenerClientesActivos(datos) {
    return datos.clientes.filter(c => c.activo === true);
}

function obtenerClientePorId(datos, id) {
    return datos.clientes.find(c => c.id === id) || null;
}

function obtenerClientePorCodigo(datos, codigo) {
    return datos.clientes.find(c => c.codigo === codigo) || null;
}

function buscarClientes(datos, texto) {
    if (!texto || texto.trim() === '') return datos.clientes;
    
    const busqueda = texto.toLowerCase().trim();
    return datos.clientes.filter(c => {
        const campos = [
            c.codigo,
            c.nombre,
            c.categoria,
            c.razonSocial,
            c.cif,
            c.poblacion,
            c.email
        ];
        return campos.some(campo => 
            campo && String(campo).toLowerCase().includes(busqueda)
        );
    });
}

// --- Variables de Estado para Filtros y Paginación ---
let filtroBusquedaClientes = '';
let filtroCategoriaClientes = '';
let paginaActualClientes = 1;
let clientesPorPagina = 200; // Por defecto 200

function renderizarClientes() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();
    
    datos.clientes = datos.clientes.map(asegurarEstructuraCliente);
    
    // 1. Aplicar filtro de búsqueda de texto
    let clientesFiltrados = filtroBusquedaClientes
        ? buscarClientes(datos, filtroBusquedaClientes)
        : datos.clientes;

    // 2. Aplicar filtro de categoría
    if (filtroCategoriaClientes) {
        clientesFiltrados = clientesFiltrados.filter(c => c.categoria === filtroCategoriaClientes);
    }
    
    const totalFiltrados = clientesFiltrados.length;
    const activos = datos.clientes.filter(c => c.activo).length;

    // 3. Calcular paginación
    let totalPaginas = 1;
    let clientesEnPagina = clientesFiltrados;

    if (clientesPorPagina !== 'todos') {
        totalPaginas = Math.ceil(totalFiltrados / clientesPorPagina);
        if (paginaActualClientes > totalPaginas) paginaActualClientes = totalPaginas;
        if (paginaActualClientes < 1) paginaActualClientes = 1;
        
        const inicio = (paginaActualClientes - 1) * clientesPorPagina;
        const fin = inicio + clientesPorPagina;
        clientesEnPagina = clientesFiltrados.slice(inicio, fin);
    }

    let html = `
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>👥 Clientes</h2>
                    <span class="subtitle">
                        ${activos} activos de ${datos.clientes.length} totales
                        ${(filtroBusquedaClientes || filtroCategoriaClientes) ? ` — Mostrando ${totalFiltrados} resultados` : ''}
                    </span>
                </div>
                <div class="flex gap-10">
                    <button class="btn btn-secondary" onclick="prepararImportacionCSV()" title="Importar desde CSV (próximamente)">📥 Importar CSV</button>
                    <button class="btn btn-primary" onclick="mostrarFormularioCliente()">➕ Añadir Cliente</button>
                </div>
            </div>
            
            <!-- BARRA DE FILTROS -->
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                <input 
                    type="text" 
                    id="buscador-clientes" 
                    placeholder="🔍 Buscar por nombre, código, CIF..." 
                    value="${escaparHTML(filtroBusquedaClientes)}"
                    oninput="filtrarClientes(this.value)"
                    style="flex: 1; min-width: 250px; padding: 10px 15px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem;"
                >
                <select 
                    onchange="filtrarCategoriaClientes(this.value)"
                    style="padding: 10px 15px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; background: white; min-width: 200px;"
                >
                    <option value="">Todas las categorías</option>
                    <option value="Envío 24 horas" ${filtroCategoriaClientes === 'Envío 24 horas' ? 'selected' : ''}>Envío 24 horas</option>
                    <option value="Envío refrigerado - congelado" ${filtroCategoriaClientes === 'Envío refrigerado - congelado' ? 'selected' : ''}>Envío refrigerado - congelado</option>
                    <option value="Distribución propia" ${filtroCategoriaClientes === 'Distribución propia' ? 'selected' : ''}>Distribución propia</option>
                </select>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.9rem; color: #666;">Ver:</span>
                    <select 
                        onchange="cambiarClientesPorPagina(this.value)"
                        style="padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; background: white;"
                    >
                        <option value="50" ${clientesPorPagina == 50 ? 'selected' : ''}>50</option>
                        <option value="100" ${clientesPorPagina == 100 ? 'selected' : ''}>100</option>
                        <option value="200" ${clientesPorPagina == 200 ? 'selected' : ''}>200</option>
                        <option value="500" ${clientesPorPagina == 500 ? 'selected' : ''}>500</option>
                        <option value="todos" ${clientesPorPagina === 'todos' ? 'selected' : ''}>Todos</option>
                    </select>
                </div>
            </div>
            
            <!-- FORMULARIO -->
            <div id="form-cliente-container" style="display: none; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                <h3 id="form-cliente-titulo">Añadir Cliente</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="cliente-codigo">Código *</label>
                        <input type="text" id="cliente-codigo" placeholder="Ej: 100.0" required>
                    </div>
                    <div class="form-group">
                        <label for="cliente-nombre">Nombre *</label>
                        <input type="text" id="cliente-nombre" placeholder="Nombre del cliente" required>
                    </div>
                    <div class="form-group">
                        <label for="cliente-categoria">Categoría de Envío *</label>
                        <select id="cliente-categoria">
                            <option value="Envío 24 horas">Envío 24 horas</option>
                            <option value="Envío refrigerado - congelado">Envío refrigerado - congelado</option>
                            <option value="Distribución propia">Distribución propia</option>
                        </select>
                    </div>
                </div>
                
                <details style="margin: 15px 0; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 15px;">
                    <summary style="cursor: pointer; font-weight: 600; color: var(--secondary);">
                        📋 Datos adicionales (opcional)
                    </summary>
                    <div style="margin-top: 15px;">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="cliente-razonSocial">Razón Social</label>
                                <input type="text" id="cliente-razonSocial" placeholder="Nombre fiscal completo">
                            </div>
                            <div class="form-group">
                                <label for="cliente-cif">CIF / NIF</label>
                                <input type="text" id="cliente-cif" placeholder="B12345678">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group" style="grid-column: span 2;">
                                <label for="cliente-direccion">Dirección</label>
                                <input type="text" id="cliente-direccion" placeholder="Calle, número, piso">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="cliente-poblacion">Población</label>
                                <input type="text" id="cliente-poblacion" placeholder="Ciudad">
                            </div>
                            <div class="form-group">
                                <label for="cliente-codigoPostal">Código Postal</label>
                                <input type="text" id="cliente-codigoPostal" placeholder="03140">
                            </div>
                            <div class="form-group">
                                <label for="cliente-provincia">Provincia</label>
                                <input type="text" id="cliente-provincia" placeholder="Alicante">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="cliente-telefono">Teléfono</label>
                                <input type="text" id="cliente-telefono" placeholder="96 123 45 67">
                            </div>
                            <div class="form-group">
                                <label for="cliente-movil">Móvil</label>
                                <input type="text" id="cliente-movil" placeholder="600 123 456">
                            </div>
                            <div class="form-group">
                                <label for="cliente-email">Email</label>
                                <input type="email" id="cliente-email" placeholder="cliente@email.com">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="cliente-personaContacto">Persona de Contacto</label>
                                <input type="text" id="cliente-personaContacto" placeholder="Nombre del contacto">
                            </div>
                            <div class="form-group">
                                <label for="cliente-diasPago">Días de Pago</label>
                                <input type="number" min="0" id="cliente-diasPago" placeholder="0">
                            </div>
                            <div class="form-group">
                                <label for="cliente-formaPago">Forma de Pago</label>
                                <select id="cliente-formaPago">
                                    <option value="">— Sin definir —</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="domiciliado">Domiciliado</option>
                                    <option value="tarjeta">Tarjeta</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="cliente-descuento">Descuento (%)</label>
                                <input type="number" min="0" max="100" step="0.5" id="cliente-descuento" placeholder="0">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="cliente-observaciones">Observaciones</label>
                            <textarea id="cliente-observaciones" rows="2" placeholder="Notas internas..." style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit; resize: vertical;"></textarea>
                        </div>
                    </div>
                </details>
                
                <input type="hidden" id="cliente-editando-id">
                <div class="flex gap-10">
                    <button class="btn btn-primary" onclick="guardarCliente()">💾 Guardar</button>
                    <button class="btn btn-secondary" onclick="cerrarFormularioCliente()">❌ Cancelar</button>
                </div>
            </div>
            
            <!-- TABLA -->
            <div class="tabla-container">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Categoría (Editable)</th>
                            <th>Población</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (clientesEnPagina.length === 0) {
        html += `
            <tr>
                <td colspan="6" class="text-center" style="padding: 30px; color: #999;">
                    No se encontraron clientes con ese criterio
                </td>
            </tr>
        `;
    } else {
        clientesEnPagina.forEach(cliente => {
            html += `
                <tr>
                    <td><strong>${escaparHTML(cliente.codigo)}</strong></td>
                    <td>${escaparHTML(cliente.nombre)}</td>
                    <td>
                        <select 
                            onchange="cambiarCategoriaRapida(${cliente.id}, this.value)"
                            style="padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color); font-size: 0.8rem; background: ${getBgColorCat(cliente.categoria)}; color: ${getTextColorCat(cliente.categoria)}; font-weight: 600; max-width: 180px; cursor: pointer;"
                        >
                            <option value="Envío 24 horas" ${cliente.categoria === 'Envío 24 horas' ? 'selected' : ''}>Envío 24h</option>
                            <option value="Envío refrigerado - congelado" ${cliente.categoria === 'Envío refrigerado - congelado' ? 'selected' : ''}>Refrig/Congelado</option>
                            <option value="Distribución propia" ${cliente.categoria === 'Distribución propia' ? 'selected' : ''}>Distribución propia</option>
                        </select>
                    </td>
                    <td>${escaparHTML(cliente.poblacion) || '<span style="color:#ccc;">—</span>'}</td>
                    <td>
                        <span style="color: ${cliente.activo ? 'var(--success)' : 'var(--error)'}">
                            ${cliente.activo ? '✅ Activo' : '❌ Inactivo'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="editarCliente(${cliente.id})" title="Editar">✏️</button>
                        ${cliente.activo
                            ? `<button class="btn btn-danger btn-sm" onclick="eliminarCliente(${cliente.id})" title="Desactivar">🗑️</button>`
                            : `<button class="btn btn-success btn-sm" onclick="reactivarCliente(${cliente.id})" title="Reactivar">↩️</button>`
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
            
            <!-- CONTROLES DE PAGINACIÓN (Solo si no es "Todos") -->
            ${clientesPorPagina !== 'todos' && totalPaginas > 1 ? `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; background: white; padding: 10px 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <span style="font-size: 0.9rem; color: #666;">
                        Mostrando ${(paginaActualClientes - 1) * clientesPorPagina + 1} - ${Math.min(paginaActualClientes * clientesPorPagina, totalFiltrados)} de ${totalFiltrados} clientes
                    </span>
                    <div class="flex gap-10">
                        <button class="btn btn-secondary btn-sm" onclick="cambiarPaginaClientes(${paginaActualClientes - 1})" ${paginaActualClientes === 1 ? 'disabled' : ''}>◀ Anterior</button>
                        <span style="display: flex; align-items: center; font-weight: bold;">Pág. ${paginaActualClientes} / ${totalPaginas}</span>
                        <button class="btn btn-secondary btn-sm" onclick="cambiarPaginaClientes(${paginaActualClientes + 1})" ${paginaActualClientes === totalPaginas ? 'disabled' : ''}>Siguiente ▶</button>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    container.innerHTML = html;
}

// Funciones auxiliares para los colores de las etiquetas
function getBgColorCat(cat) {
    if (cat === 'Envío 24 horas') return '#E3F2FD';
    if (cat === 'Envío refrigerado - congelado') return '#E0F7FA';
    if (cat === 'Distribución propia') return '#FFF3E0';
    return '#f5f5f5';
}
function getTextColorCat(cat) {
    if (cat === 'Envío 24 horas') return '#1565C0';
    if (cat === 'Envío refrigerado - congelado') return '#00695C';
    if (cat === 'Distribución propia') return '#E65100';
    return '#333';
}

function cambiarCategoriaRapida(id, nuevaCategoria) {
    const datos = cargarDatos();
    const cliente = datos.clientes.find(c => c.id === id);
    if (cliente) {
        cliente.categoria = nuevaCategoria;
        cliente.ultimaModificacion = new Date().toISOString();
        guardarDatos(datos);
        mostrarNotificacion(`✅ ${cliente.nombre} asignado a "${nuevaCategoria}"`, 'success');
        renderizarClientes();
    }
}

function filtrarClientes(texto) {
    filtroBusquedaClientes = texto;
    paginaActualClientes = 1; // Reiniciar a la página 1 al buscar
    renderizarClientes();
    const input = document.getElementById('buscador-clientes');
    if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
}

function filtrarCategoriaClientes(categoria) {
    filtroCategoriaClientes = categoria;
    paginaActualClientes = 1; // Reiniciar a la página 1 al filtrar
    renderizarClientes();
}

function cambiarClientesPorPagina(valor) {
    clientesPorPagina = valor === 'todos' ? 'todos' : parseInt(valor);
    paginaActualClientes = 1; // Reiniciar a la página 1
    renderizarClientes();
}

function cambiarPaginaClientes(nuevaPagina) {
    paginaActualClientes = nuevaPagina;
    renderizarClientes();
}

function mostrarFormularioCliente() {
    const container = document.getElementById('form-cliente-container');
    if (!container) return;
    
    container.style.display = 'block';
    document.getElementById('form-cliente-titulo').textContent = 'Añadir Cliente';
    
    const campos = [
        'codigo', 'nombre', 'razonSocial', 'cif', 'direccion',
        'poblacion', 'codigoPostal', 'provincia', 'telefono', 'movil',
        'email', 'personaContacto', 'diasPago', 'formaPago',
        'descuento', 'observaciones'
    ];
    campos.forEach(campo => {
        const el = document.getElementById(`cliente-${campo}`);
        if (el) el.value = '';
    });
    
    document.getElementById('cliente-categoria').value = 'Envío 24 horas';
    document.getElementById('cliente-editando-id').value = '';
    
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.getElementById('cliente-codigo').focus();
}

function cerrarFormularioCliente() {
    const container = document.getElementById('form-cliente-container');
    if (container) container.style.display = 'none';
}

function editarCliente(id) {
    const datos = cargarDatos();
    const cliente = asegurarEstructuraCliente(
        datos.clientes.find(c => c.id === id) || {}
    );
    if (!cliente.id) {
        mostrarNotificacion('❌ Cliente no encontrado', 'error');
        return;
    }

    document.getElementById('form-cliente-container').style.display = 'block';
    document.getElementById('form-cliente-titulo').textContent = 'Editar Cliente';
    
    const campos = [
        'codigo', 'nombre', 'razonSocial', 'cif', 'direccion',
        'poblacion', 'codigoPostal', 'provincia', 'telefono', 'movil',
        'email', 'personaContacto', 'diasPago', 'formaPago',
        'descuento', 'observaciones'
    ];
    campos.forEach(campo => {
        const el = document.getElementById(`cliente-${campo}`);
        if (el) el.value = cliente[campo] || '';
    });
    
    document.getElementById('cliente-categoria').value = cliente.categoria || 'Envío 24 horas';
    document.getElementById('cliente-editando-id').value = cliente.id;
    
    const tieneDatosExtra = cliente.razonSocial || cliente.cif || cliente.direccion || 
                            cliente.poblacion || cliente.telefono || cliente.email;
    if (tieneDatosExtra) {
        const details = document.querySelector('#form-cliente-container details');
        if (details) details.open = true;
    }
    
    document.getElementById('form-cliente-container').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.getElementById('cliente-codigo').focus();
}

function guardarCliente() {
    const codigo = document.getElementById('cliente-codigo').value.trim();
    const nombre = document.getElementById('cliente-nombre').value.trim();
    const categoria = document.getElementById('cliente-categoria').value;
    const editandoId = document.getElementById('cliente-editando-id').value;

    if (!codigo) {
        mostrarNotificacion('❌ El código es obligatorio', 'error');
        document.getElementById('cliente-codigo').focus();
        return;
    }
    if (!nombre) {
        mostrarNotificacion('❌ El nombre es obligatorio', 'error');
        document.getElementById('cliente-nombre').focus();
        return;
    }

    const datos = cargarDatos();

    const camposExtra = {
        razonSocial: document.getElementById('cliente-razonSocial')?.value.trim() || '',
        cif: document.getElementById('cliente-cif')?.value.trim() || '',
        direccion: document.getElementById('cliente-direccion')?.value.trim() || '',
        poblacion: document.getElementById('cliente-poblacion')?.value.trim() || '',
        codigoPostal: document.getElementById('cliente-codigoPostal')?.value.trim() || '',
        provincia: document.getElementById('cliente-provincia')?.value.trim() || '',
        telefono: document.getElementById('cliente-telefono')?.value.trim() || '',
        movil: document.getElementById('cliente-movil')?.value.trim() || '',
        email: document.getElementById('cliente-email')?.value.trim() || '',
        personaContacto: document.getElementById('cliente-personaContacto')?.value.trim() || '',
        diasPago: aEntero(document.getElementById('cliente-diasPago')?.value),
        formaPago: document.getElementById('cliente-formaPago')?.value || '',
        descuento: aDecimal(document.getElementById('cliente-descuento')?.value),
        observaciones: document.getElementById('cliente-observaciones')?.value.trim() || ''
    };

    if (editandoId) {
        const cliente = datos.clientes.find(c => c.id === parseInt(editandoId));
        if (cliente) {
            const duplicado = datos.clientes.find(
                c => c.codigo === codigo && c.id !== parseInt(editandoId)
            );
            if (duplicado) {
                mostrarNotificacion('❌ El código ya está en uso', 'error');
                document.getElementById('cliente-codigo').focus();
                return;
            }
            cliente.codigo = codigo;
            cliente.nombre = nombre;
            cliente.categoria = categoria;
            Object.assign(cliente, camposExtra);
            cliente.ultimaModificacion = new Date().toISOString();
            guardarDatos(datos);
            mostrarNotificacion('✅ Cliente actualizado correctamente', 'success');
        }
    } else {
        const duplicado = datos.clientes.find(c => c.codigo === codigo);
        if (duplicado) {
            mostrarNotificacion('❌ El código ya está en uso', 'error');
            document.getElementById('cliente-codigo').focus();
            return;
        }
        const nuevoCliente = Object.assign(
            crearClienteVacio(),
            {
                id: generarId(datos.clientes),
                codigo,
                nombre,
                categoria,
                activo: true,
                fechaAlta: new Date().toISOString()
            },
            camposExtra
        );
        datos.clientes.push(nuevoCliente);
        guardarDatos(datos);
        mostrarNotificacion('✅ Cliente añadido correctamente', 'success');
    }

    cerrarFormularioCliente();
    renderizarClientes();
}

function eliminarCliente(id) {
    const datos = cargarDatos();
    const cliente = datos.clientes.find(c => c.id === id);
    if (!cliente) return;
    if (!confirm(`⚠️ ¿Desactivar el cliente "${cliente.nombre}"?`)) return;
    cliente.activo = false;
    cliente.ultimaModificacion = new Date().toISOString();
    guardarDatos(datos);
    renderizarClientes();
    mostrarNotificacion(`✅ Cliente "${cliente.nombre}" desactivado`, 'success');
}

function reactivarCliente(id) {
    const datos = cargarDatos();
    const cliente = datos.clientes.find(c => c.id === id);
    if (!cliente) return;
    cliente.activo = true;
    cliente.ultimaModificacion = new Date().toISOString();
    guardarDatos(datos);
    renderizarClientes();
    mostrarNotificacion(`✅ Cliente "${cliente.nombre}" reactivado`, 'success');
}

function prepararImportacionCSV() {
    mostrarNotificacion('ℹ️ La importación CSV estará disponible próximamente', 'info');
}
