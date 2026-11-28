/**
 * ============================================================
 * MÓDULO: CLIENTES (v3 - Categorías)
 * ============================================================
 */

function crearClienteVacio() {
    return {
        id: 0,
        codigo: "",
        nombre: "",
        categoria: "Envío 24 horas", // <-- NUEVO: Categoría por defecto
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

let filtroBusquedaClientes = '';

function renderizarClientes() {
    const container = document.getElementById('vista-container');
    const datos = cargarDatos();
    
    datos.clientes = datos.clientes.map(asegurarEstructuraCliente);
    
    const clientesAMostrar = filtroBusquedaClientes
        ? buscarClientes(datos, filtroBusquedaClientes)
        : datos.clientes;
    
    const activos = datos.clientes.filter(c => c.activo).length;

    let html = `
        <div class="vista active">
            <div class="vista-header">
                <div>
                    <h2>👥 Clientes</h2>
                    <span class="subtitle">
                        ${activos} activos de ${datos.clientes.length} totales
                        ${filtroBusquedaClientes ? ` — Mostrando ${clientesAMostrar.length} resultados` : ''}
                    </span>
                </div>
                <div class="flex gap-10">
                    <button class="btn btn-secondary" onclick="prepararImportacionCSV()" title="Importar desde CSV (próximamente)">📥 Importar CSV</button>
                    <button class="btn btn-primary" onclick="mostrarFormularioCliente()">➕ Añadir Cliente</button>
                </div>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 15px;">
                <input 
                    type="text" 
                    id="buscador-clientes" 
                    placeholder="🔍 Buscar por nombre, código, categoría, CIF, población o email..." 
                    value="${escaparHTML(filtroBusquedaClientes)}"
                    oninput="filtrarClientes(this.value)"
                    style="width: 100%; padding: 10px 15px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem;"
                >
            </div>
            
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
            
            <div class="tabla-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Población</th>
                            <th>Teléfono</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (clientesAMostrar.length === 0) {
        const mensaje = filtroBusquedaClientes
            ? 'No se encontraron clientes con ese criterio'
            : 'No hay clientes registrados';
        html += `
            <tr>
                <td colspan="8" class="text-center" style="padding: 30px; color: #999;">
                    ${mensaje}
                </td>
            </tr>
        `;
    } else {
        clientesAMostrar.forEach(cliente => {
            let catColor = '#f5f5f5';
            let catTextColor = '#333';
            if (cliente.categoria === 'Envío 24 horas') { catColor = '#E3F2FD'; catTextColor = '#1565C0'; }
            if (cliente.categoria === 'Envío refrigerado - congelado') { catColor = '#E0F7FA'; catTextColor = '#00695C'; }
            if (cliente.categoria === 'Distribución propia') { catColor = '#FFF3E0'; catTextColor = '#E65100'; }

            html += `
                <tr>
                    <td>${cliente.id}</td>
                    <td><strong>${escaparHTML(cliente.codigo)}</strong></td>
                    <td>${escaparHTML(cliente.nombre)}</td>
                    <td><span style="background: ${catColor}; color: ${catTextColor}; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; white-space: nowrap;">${escaparHTML(cliente.categoria || 'Envío 24 horas')}</span></td>
                    <td>${escaparHTML(cliente.poblacion) || '<span style="color:#ccc;">—</span>'}</td>
                    <td>${escaparHTML(cliente.telefono || cliente.movil) || '<span style="color:#ccc;">—</span>'}</td>
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
        </div>
    `;

    container.innerHTML = html;
}

function filtrarClientes(texto) {
    filtroBusquedaClientes = texto;
    renderizarClientes();
    const input = document.getElementById('buscador-clientes');
    if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
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
    
    // Categoría por defecto
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
