/**
 * Renderiza el resumen final.
 * Se ejecuta automáticamente antes de mostrar la pantalla 9.
 */
function renderResumen() {
    const container = document.getElementById('resumen');
    if (!container) return;

    const data = window.formDataStorage;
    const getVal = (key) => data[key] || '<span style="color:red">No indicado</span>';

    // 1. Información Personal y Laboral
    let html = `
        <div class="resumen-seccion">
            <h3>I. Información Personal</h3>
            <p><strong>Estudiante:</strong> ${getVal('nombres')} ${getVal('apellidos')}</p>
            <p><strong>Cédula:</strong> ${getVal('cedula')}</p>
            <p><strong>Edad:</strong> ${getVal('edad')} años</p>
        </div>
        
        <div class="resumen-seccion">
            <h3>II. Situación Académica</h3>
            <p><strong>PNF:</strong> ${getVal('pnf')}</p>
            <p><strong>Materias Inscritas:</strong> ${getVal('m_ins')}</p>
            <p><strong>Índice Anterior:</strong> ${getVal('indice_ant')} pts</p>
        </div>
    `;

    // 2. Tabla de Familiares (Dinámica)
    const idsFamiliares = [...new Set(
        Object.keys(data)
            .filter(key => key.startsWith('f_nom_'))
            .map(key => key.split('_')[2])
    )];

    html += `
        <div class="resumen-seccion">
            <h3>III. Carga Familiar</h3>
            <table style="width:100%; border-collapse: collapse; font-size: 0.85rem;">
                <thead>
                    <tr style="background: #f4f4f4;">
                        <th style="border: 1px solid #ddd; padding: 5px;">Nombre</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Parentesco</th>
                        <th style="border: 1px solid #ddd; padding: 5px;">Ingreso</th>
                    </tr>
                </thead>
                <tbody>`;

    if (idsFamiliares.length > 0) {
        idsFamiliares.forEach(id => {
            html += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 5px;">${data['f_nom_' + id]}</td>
                    <td style="border: 1px solid #ddd; padding: 5px;">${data['f_par_' + id]}</td>
                    <td style="border: 1px solid #ddd; padding: 5px;">${data['f_ing_' + id] || 0} Bs</td>
                </tr>`;
        });
    } else {
        html += `<tr><td colspan="3" style="text-align:center; padding:10px;">No se agregaron familiares.</td></tr>`;
    }

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

function resetFormulario() {
    const confirmar = confirm("⚠️ ¿Estás seguro de que deseas empezar de nuevo? Se borrarán todos los datos ingresados.");
    if (confirmar) {
        window.formDataStorage = {};
        location.reload(); // Reinicia la aplicación al paso 1
    }
}