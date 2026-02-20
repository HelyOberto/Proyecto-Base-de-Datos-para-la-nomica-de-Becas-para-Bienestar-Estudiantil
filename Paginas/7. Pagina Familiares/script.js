/**
 * Lógica para la tabla dinámica de familiares
 */
function initFamiliares() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    const btnAgregar = document.getElementById('btn-agregar');
    const avisoLimite = document.getElementById('aviso-limite');
    const maxFamiliares = 5;

    if (!btnAgregar || !cuerpoTabla) return;

    const crearFilaHTML = (id) => {
        const nuevaFila = cuerpoTabla.insertRow();
        nuevaFila.setAttribute('data-id', id);
        nuevaFila.innerHTML = `
            <td><input type="text" name="f_nom_${id}" placeholder="Nombre" required></td>
            <td><input type="text" name="f_par_${id}" placeholder="Parentesco" required></td>
            <td><input type="number" name="f_eda_${id}" min="0" max="120" placeholder="0" 
                oninput="this.value = this.value.replace(/[^0-9]/g, '')" required></td>
            <td><input type="text" name="f_ins_${id}" placeholder="Primaria/Bachiller"></td>
            <td><input type="text" name="f_ocu_${id}" placeholder="Ocupación"></td>
            <td class="celda-ingreso">
                <div style="display: flex; align-items: center; gap: 4px;">
                    <input type="number" name="f_ing_${id}" step="0.01" placeholder="0.00" 
                        oninput="this.value = this.value.replace(/[^0-9.]/g, '')">
                    <span style="font-weight: bold;">Bs</span>
                    <button type="button" class="btn-remove" title="Eliminar" 
                        style="background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer; padding: 2px 6px;">&times;</button>
                </div>
            </td>
        `;
    };

    // --- RECONSTRUCCIÓN CRUCIAL ---
    // Limpiamos la tabla antes de reconstruir para evitar duplicados al navegar
    cuerpoTabla.innerHTML = "";
    
    const datosCargados = window.formDataStorage || {};
    // Extraemos los IDs únicos basados en los nombres guardados
    const idsExistentes = [...new Set(
        Object.keys(datosCargados)
            .filter(key => key.startsWith('f_nom_'))
            .map(key => key.split('_')[2])
    )];

    if (idsExistentes.length > 0) {
        idsExistentes.forEach(id => crearFilaHTML(id));
        // Forzamos al main.js a volver a llenar los valores ahora que los inputs existen
        if (typeof window.restoreDataGlobal === 'function') window.restoreDataGlobal();
    } else {
        // Si es la primera vez, añadimos una fila vacía
        crearFilaHTML(Date.now());
    }

    btnAgregar.onclick = (e) => {
        e.preventDefault();
        if (cuerpoTabla.querySelectorAll('tr').length < maxFamiliares) {
            crearFilaHTML(Date.now());
            actualizarEstadoBotones(cuerpoTabla, btnAgregar, avisoLimite, maxFamiliares);
        }
    };

    cuerpoTabla.onclick = (e) => {
        if (e.target.classList.contains('btn-remove')) {
            const fila = e.target.closest('tr');
            const idFila = fila.getAttribute('data-id');
            
            // Limpiar del storage todos los datos de esa fila
            Object.keys(window.formDataStorage).forEach(key => {
                if (key.endsWith(`_${idFila}`)) delete window.formDataStorage[key];
            });

            fila.remove();
            actualizarEstadoBotones(cuerpoTabla, btnAgregar, avisoLimite, maxFamiliares);
        }
    };

    actualizarEstadoBotones(cuerpoTabla, btnAgregar, avisoLimite, maxFamiliares);
}

function actualizarEstadoBotones(tabla, boton, aviso, max) {
    const filas = tabla.querySelectorAll('tr').length;
    const limiteAlcanzado = filas >= max;
    boton.disabled = limiteAlcanzado;
    if (aviso) aviso.style.display = limiteAlcanzado ? 'inline' : 'none';
}