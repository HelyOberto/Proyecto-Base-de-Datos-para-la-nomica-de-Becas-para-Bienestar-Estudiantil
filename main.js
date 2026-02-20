/**
 * ARCHIVO: main.js (Raíz) - Versión Final Unificada
 * Incluye: Cálculo de edad automático, Límite de materias, Récord y Resumen.
 */
document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1; 
    const totalSteps = 10;
    const viewPort = document.getElementById('dynamic-content');
    const progressBar = document.getElementById('progressBar');
    
    window.formDataStorage = {}; 

    const folderMap = {
        1: "1. Pagina Identificación",
        2: "2. Pagina Residencia",
        3: "3. Pagina Laboral",
        4: "4. Pagina PNF",
        5: "5. Pagina Materias",
        6: "6. Pagina Record academico",
        7: "7. Pagina Familiares",
        8: "8. Pagina Datos extra",
        9: "9. Verificación",
        10: "10. Pantalla final"
    };

    // --- LÓGICA PASO 1: IDENTIFICACIÓN (Cálculo de Edad) ---
    function calcularEdad() {
        const fechaNacInput = document.getElementById('f_nac');
        const edadInput = document.getElementById('edad');
        
        if (!fechaNacInput || !fechaNacInput.value) return;

        const hoy = new Date();
        const cumpleanos = new Date(fechaNacInput.value);
        
        let edad = hoy.getFullYear() - cumpleanos.getFullYear();
        const mes = hoy.getMonth() - cumpleanos.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
            edad--;
        }

        const edadFinal = edad >= 0 ? edad : 0;
        if (edadInput) edadInput.value = edadFinal;
        window.formDataStorage['edad'] = edadFinal;
    }

    // --- LÓGICA PASO 5: MATERIAS (Límite y conteo) ---
    function initMaterias() {
        const container = document.getElementById('materias-container');
        if (!container) return;

        const checkboxes = container.querySelectorAll('.materia-cb');
        const MAX_MATERIAS = 8;

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const seleccionadas = container.querySelectorAll('.materia-cb:checked').length;
                if (seleccionadas > MAX_MATERIAS) {
                    cb.checked = false;
                    alert("⚠️ Solo puedes inscribir un máximo de " + MAX_MATERIAS + " materias.");
                } else {
                    saveCurrentData();
                }
            });
        });
    }

    // --- LÓGICA PASO 6: RÉCORD ---
    function initRecord() {
        const totalInscritas = window.formDataStorage['m_ins'] || 0;
        const inputIns = document.getElementById('m_ins');
        if (inputIns) inputIns.value = totalInscritas;
    }

   /**
     * Renderiza el resumen final con todos los datos del formulario.
     */
    function renderResumen() {
        const container = document.getElementById('resumen');
        if (!container) return;

        const data = window.formDataStorage;
        
        // Utilidad para mostrar "Sí/No" en checkboxes o valores vacíos en rojo
        const getVal = (key) => {
            if (data[key] === true) return '<span style="color:green; font-weight:bold;">Sí</span>';
            if (data[key] === false) return '<span style="color:gray;">No</span>';
            return data[key] || '<span style="color:red">No indicado</span>';
        };

        let html = "";

        // 1. Identificación del Estudiante
        html += `
            <div class="resumen-seccion">
                <h3>I. Identificación del Estudiante</h3>
                <p><strong>Nombres y Apellidos:</strong> ${getVal('nombres')} ${getVal('apellidos')}</p>
                <p><strong>Cédula:</strong> ${getVal('cedula')}</p>
                <p><strong>Contacto:</strong> ${getVal('tel_estudiante')} | ${getVal('correo')}</p>
                <p><strong>Nacimiento:</strong> ${getVal('f_nac')} (Edad: ${getVal('edad')} años)</p>
                <p><strong>Estado Civil:</strong> ${getVal('edo_civil')}</p>
                <p><strong>Carnet de la Patria:</strong> ${getVal('C_Patria')}</p>
                <p><strong>Condiciones:</strong> ¿Trabaja?: ${getVal('trabaja')} | ¿Viaja?: ${getVal('viaja')} | ¿Activo?: ${getVal('activo')}</p>
            </div>
        `;

        // 2. Residencia / Vivienda
        html += `
            <div class="resumen-seccion">
                <h3>II. Residencia y Vivienda</h3>
                <p><strong>Tipo:</strong> ${getVal('t_residencia')} (${getVal('t_vivienda')})</p>
                <p><strong>Localidad:</strong> ${getVal('t_localidad')} | <strong>Propiedad:</strong> ${getVal('r_propiedad')}</p>
                <p><strong>Dirección Local:</strong> ${getVal('dir_local')} (${getVal('tel_local')})</p>
                <p><strong>Dirección Procedencia:</strong> ${getVal('dir_proc')} (${getVal('tel_proc')})</p>
                <p><strong>¿Paga Vivienda?:</strong> ${getVal('paga_vivienda')}</p>
            </div>
        `;

        // 3. Información Laboral (Solo si trabaja)
        if (data['trabaja']) {
            html += `
                <div class="resumen-seccion" style="border-left: 4px solid #FF6600; padding-left: 10px;">
                    <h3>III. Información Laboral</h3>
                    <p><strong>Cargo/Oficio:</strong> ${getVal('cargo_trabajo')} en ${getVal('lugar_trabajo')}</p>
                    <p><strong>Ingresos Mensuales:</strong> ${getVal('ingresos_trabajo')} Bs.</p>
                    <p><strong>Aportes Externos:</strong> Recibe de ${getVal('quien_aporta')} la suma de ${getVal('monto_aporta')} Bs.</p>
                </div>
            `;
        }

        // 4. Información Académica (PNF)
        html += `
            <div class="resumen-seccion">
                <h3>IV. Datos del PNF</h3>
                <p><strong>Carrera:</strong> ${getVal('pnf')}</p>
                <p><strong>Código Estudiante:</strong> ${getVal('cod_estudiante')} | <strong>Ingreso:</strong> ${getVal('f_ingreso')}</p>
                <p><strong>Ubicación Actual:</strong> Trayecto ${getVal('trayecto')} - Trimestre ${getVal('trimestre')}</p>
            </div>
        `;

        // 5. Materias Inscritas (Filtramos las que están marcadas como true)
        const materiasSeleccionadas = Object.keys(data)
            .filter(key => key.startsWith('mat_') && data[key] === true)
            .map(key => key.replace('mat_', '').replace(/_/g, ' ').toUpperCase());

        html += `
            <div class="resumen-seccion">
                <h3>V. Materias Inscritas</h3>
                <p>${materiasSeleccionadas.length > 0 ? materiasSeleccionadas.join(', ') : '<span style="color:red">Ninguna materia seleccionada</span>'}</p>
            </div>
        `;

        // 6. Récord Académico
        html += `
            <div class="resumen-seccion">
                <h3>VI. Récord Académico (Trimestre Anterior)</h3>
                <p><strong>Materias:</strong> Inscritas (${getVal('m_ins')}) | Aprobadas (${getVal('m_apr')}) | Inasistentes (${getVal('m_ina')})</p>
                <p><strong>Índice Académico:</strong> ${getVal('record_indice')} pts</p>
            </div>
        `;

        // 7. Carga Familiar (Dinámica)
        const idsFamiliares = [...new Set(
            Object.keys(data)
                .filter(key => key.startsWith('f_nom_'))
                .map(key => key.split('_')[2])
        )];

        html += `
            <div class="resumen-seccion">
                <h3>VII. Carga Familiar</h3>
                <div style="overflow-x: auto;">
                    <table style="width:100%; border-collapse: collapse; font-size: 0.75rem; min-width: 600px;">
                        <thead>
                            <tr style="background: #f4f4f4; text-align: left;">
                                <th style="border: 1px solid #ddd; padding: 5px;">Nombre</th>
                                <th style="border: 1px solid #ddd; padding: 5px;">Parentesco</th>
                                <th style="border: 1px solid #ddd; padding: 5px;">Edad</th>
                                <th style="border: 1px solid #ddd; padding: 5px;">Instrucción</th>
                                <th style="border: 1px solid #ddd; padding: 5px;">Ocupación</th>
                                <th style="border: 1px solid #ddd; padding: 5px;">Ingreso ($)</th>
                            </tr>
                        </thead>
                        <tbody>`;

        if (idsFamiliares.length > 0) {
            idsFamiliares.forEach(id => {
                html += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 5px;">${getVal('f_nom_' + id)}</td>
                        <td style="border: 1px solid #ddd; padding: 5px;">${getVal('f_par_' + id)}</td>
                        <td style="border: 1px solid #ddd; padding: 5px;">${getVal('f_eda_' + id)}</td>
                        <td style="border: 1px solid #ddd; padding: 5px;">${getVal('f_ins_' + id)}</td>
                        <td style="border: 1px solid #ddd; padding: 5px;">${getVal('f_ocu_' + id)}</td>
                        <td style="border: 1px solid #ddd; padding: 5px;">${data['f_ing_' + id] || 0} $</td>
                    </tr>`;
            });
        } else {
            html += `<tr><td colspan="6" style="text-align:center; padding:10px;">No se agregaron familiares.</td></tr>`;
        }
        html += `</tbody></table></div></div>`;

        // 8. Datos Adicionales
        html += `
            <div class="resumen-seccion">
                <h3>VIII. Observaciones Finales</h3>
                <p style="white-space: pre-wrap;">${getVal('observaciones')}</p>
            </div>
        `;

        container.innerHTML = html;
    }

    function resetFormulario() {
        if (confirm("⚠️ ¿Deseas empezar de nuevo? Se borrarán todos los datos ingresados.")) {
            window.formDataStorage = {};
            currentStep = 1;
            loadStep(1);
        }
    }

    // --- CARGA DINÁMICA ---
    async function loadStep(stepNumber) {
        const folderName = folderMap[stepNumber];
        const htmlPath = `Paginas/${encodeURIComponent(folderName)}/view.html`;

        try {
            const response = await fetch(htmlPath);
            if (!response.ok) throw new Error("Error al cargar");
            const html = await response.text();
            viewPort.innerHTML = html; 

            window.restoreDataGlobal(); 
            
            // Inicialización por página
            if (stepNumber === 1) {
                const fNac = document.getElementById('f_nac');
                if (fNac) {
                    if (fNac.value) calcularEdad(); // Calcular si ya hay dato restaurado
                    fNac.addEventListener('change', calcularEdad);
                }
            }
            if (stepNumber === 5) initMaterias();
            if (stepNumber === 6) initRecord();
            if (stepNumber === 7 && typeof initFamiliares === 'function') initFamiliares();
            if (stepNumber === 9) renderResumen();

            actualizarInterfaz(stepNumber);
            window.scrollTo(0, 0);
        } catch (error) { console.error(error); }
    }

    function saveCurrentData() {
        const inputs = viewPort.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name) {
                window.formDataStorage[input.name] = (input.type === 'checkbox' || input.type === 'radio') 
                    ? input.checked : input.value;
            }
        });

        // Conteo materias
        const totalMat = Object.keys(window.formDataStorage)
            .filter(key => key.startsWith('mat_') && window.formDataStorage[key] === true)
            .length;
        window.formDataStorage['m_ins'] = totalMat;
    }

    window.restoreDataGlobal = () => {
        const inputs = viewPort.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (window.formDataStorage[input.name] !== undefined) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = window.formDataStorage[input.name];
                } else { 
                    input.value = window.formDataStorage[input.name]; 
                }
            }
        });
    };

    function actualizarInterfaz(step) {
        const progress = (step / totalSteps) * 100;
        if (progressBar) progressBar.style.width = `${progress}%`;

        const navContainer = document.querySelector('.nav-buttons');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        let resetBtn = document.getElementById('resetBtn');
        if (step === 9) {
            if (!resetBtn) {
                resetBtn = document.createElement('button');
                resetBtn.id = 'resetBtn';
                resetBtn.className = 'btn-reset';
                resetBtn.textContent = 'Empezar de nuevo';
                resetBtn.onclick = resetFormulario;
                navContainer.insertBefore(resetBtn, nextBtn);
            }
            resetBtn.style.display = 'inline-block';
            nextBtn.textContent = "Confirmar y Enviar";
            nextBtn.className = "btn-submit";
        } else if (resetBtn) {
            resetBtn.style.display = 'none';
            nextBtn.textContent = "Siguiente";
            nextBtn.className = "btn-next";
        }

        prevBtn.style.display = (step === 1 || step === 10) ? 'none' : 'inline-block';
        if (step === 10) {
            nextBtn.style.display = 'none';
            const pw = document.querySelector('.progress-wrapper');
            if (pw) pw.style.display = 'none';
        }
    }

    document.getElementById('nextBtn').onclick = () => {
        if (!validarPasoActual()) return;
        saveCurrentData(); 
        let nextStep = currentStep + 1;
        if (nextStep === 3 && !window.formDataStorage['trabaja']) nextStep = 4;
        if (nextStep <= totalSteps) { currentStep = nextStep; loadStep(currentStep); }
    };

    document.getElementById('prevBtn').onclick = () => {
        saveCurrentData();
        let prevStep = currentStep - 1;
        if (prevStep === 3 && !window.formDataStorage['trabaja']) prevStep = 2;
        if (prevStep >= 1) { currentStep = prevStep; loadStep(currentStep); }
    };

    function validarPasoActual() {
        if (currentStep === 1) {
            const fNac = document.getElementById('f_nac')?.value;
            const edad = parseInt(document.getElementById('edad')?.value || 0);
            if (!fNac) { alert("⚠️ Seleccione su fecha de nacimiento."); return false; }
            if (edad < 15 || edad > 100) { alert("⚠️ Verifique su fecha de nacimiento. La edad debe ser mayor a 15 años."); return false; }
            if (!document.getElementById('check_activo')?.checked) { alert("⚠️ Debes ser estudiante activo."); return false; }
        }
        if (currentStep === 5 && viewPort.querySelectorAll('.materia-cb:checked').length === 0) {
            alert("⚠️ Selecciona al menos una materia."); return false;
        }
        if (currentStep === 6) {
            const ins = parseInt(document.getElementById('m_ins').value) || 0;
            const apr = parseInt(document.getElementById('m_apr').value) || 0;
            const ina = parseInt(document.getElementById('m_ina').value) || 0;
            if ((apr + ina) > ins) { alert("⚠️ Error: Aprobadas + Inasistentes superan las inscritas."); return false; }
        }
        return true;
    }

    loadStep(currentStep);
});