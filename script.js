document.addEventListener('DOMContentLoaded', () => {
    // --- REFERENCIAS ---
    const steps = Array.from(document.querySelectorAll('.step'));
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    const progressBar = document.querySelector('.progress-bar');
    const checkTrabaja = document.getElementById('check_trabaja');
    const becaForm = document.getElementById('becaForm');
    
    // Referencias Tabla
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    const btnAgregar = document.getElementById('btn-agregar');
    const avisoLimite = document.getElementById('aviso-limite');
    const maxFamiliares = 5;

    let currentStep = 0; // Ajusta a 6 si quieres empezar directo ahí, pero 0 es el estándar

    // ==========================================
    // LÓGICA DE NAVEGACIÓN
    // ==========================================

    function showStep(idx) {
        steps.forEach((s, i) => s.classList.toggle('active', i === idx));
        
        if (progressBar) {
            const progress = ((idx + 1) / steps.length) * 100;
            progressBar.style.width = progress + '%';
        }
        
        if (idx === steps.length - 2) renderResumen();
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validarPasoActual()) {
                let nextStep = currentStep + 1;

                // Lógica de Salto (Trabajo)
                if (currentStep === 1 && checkTrabaja && !checkTrabaja.checked) {
                    nextStep = 3; 
                }

                if (nextStep < steps.length) {
                    currentStep = nextStep;
                    showStep(currentStep);
                }
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            let prevStep = currentStep - 1;

            if (currentStep === 3 && checkTrabaja && !checkTrabaja.checked) {
                prevStep = 1;
            }

            if (prevStep >= 0) {
                currentStep = prevStep;
                showStep(currentStep);
            }
        });
    });

    // ==========================================
    // LÓGICA DE LA TABLA DE FAMILIARES
    // ==========================================

    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            const filasActuales = cuerpoTabla.querySelectorAll('tr').length;

            if (filasActuales < maxFamiliares) {
                const nuevaFila = cuerpoTabla.insertRow();
                // Estructura con los 6 campos solicitados
                nuevaFila.innerHTML = `
                    <td><input type="text" name="f_nom[]" required placeholder="Nombre"></td>
                    <td><input type="text" name="f_par[]" required placeholder="Parentesco"></td>
                    <td><input type="number" name="f_eda[]" required min="0" max="120"></td>
                    <td><input type="text" name="f_ins[]" placeholder="Instrucción"></td>
                    <td><input type="text" name="f_ocu[]" placeholder="Ocupación"></td>
                    <td><input type="number" name="f_ing[]" step="0.01" placeholder="0.00"></td>
                    <button type="button" class="btn-remove" title="Eliminar">&times;</button>
                `;
                actualizarEstadoTabla();
            }
        });
    }

    // Delegación de eventos para eliminar (clic en la tabla)
    cuerpoTabla.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove')) {
            e.target.closest('tr').remove();
            actualizarEstadoTabla();
        }
    });

    function actualizarEstadoTabla() {
        const filasActuales = cuerpoTabla.querySelectorAll('tr').length;
        
        if (filasActuales >= maxFamiliares) {
            btnAgregar.disabled = true;
            btnAgregar.classList.add('deshabilitado');
            avisoLimite.classList.remove('oculto');
        } else {
            btnAgregar.disabled = false;
            btnAgregar.classList.remove('deshabilitado');
            avisoLimite.classList.add('oculto');
        }
    }

    // ==========================================
    // VALIDACIÓN Y RESUMEN
    // ==========================================

    function validarPasoActual() {
        if (currentStep === 0) {
            const checkActivo = document.getElementById('check_activo');
            if (checkActivo && !checkActivo.checked) {
                alert("Debe estar activo en sus estudios para continuar.");
                return false;
            }
        }
        return true; 
    }

    function renderResumen() {
        const resumen = document.getElementById('resumen');
        if (!resumen || !becaForm) return;

        const formData = new FormData(becaForm);
        
        // Diccionario para etiquetas legibles
        const etiquetas = {
            nombres: 'Nombres', apellidos: 'Apellidos', cedula: 'C.I.', 
            edo_civil: 'Estado Civil', carrera: 'Carrera', trayecto: 'Trayecto',
            trimestre: 'Trimestre', ingresos: 'Ingresos Laborales ($)',
            t_res: 'Tipo Residencia', t_viv: 'Tipo Vivienda', r_prop: 'Propiedad'
        };

        // Función auxiliar para obtener valores
        const getVal = (name) => formData.get(name) || "No indicado";

        let html = `
            <div class="resumen-seccion">
                <h3>I. Información Personal</h3>
                <p><strong>Nombre Completo:</strong> ${getVal('nombres')} ${getVal('apellidos')}</p>
                <p><strong>Cédula:</strong> ${getVal('cedula')} | <strong>Estado Civil:</strong> ${getVal('edo_civil')}</p>
                <p><strong>Trabaja:</strong> ${formData.has('trabaja') ? 'Sí' : 'No'}</p>
            </div>

            <div class="resumen-seccion">
                <h3>II. Ubicación y Vivienda</h3>
                <p><strong>Residencia:</strong> ${getVal('t_res')} | <strong>Tipo:</strong> ${getVal('t_viv')}</p>
                <p><strong>Propiedad:</strong> ${getVal('r_prop')} | <strong>Localidad:</strong> ${getVal('t_loc')}</p>
            </div>

            <div class="resumen-seccion">
                <h3>III. Datos del PNF</h3>
                <p><strong>Carrera:</strong> ${getVal('carrera').toUpperCase()}</p>
                <p><strong>Ubicación:</strong> Trayecto ${getVal('trayecto')}, Trimestre ${getVal('trimestre')}</p>
            </div>

            <div class="resumen-seccion">
                <h3>IV. Grupo Familiar</h3>
                <table class="tabla-resumen-mini">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Parentesco</th>
                            <th>Ingreso</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Procesar los arreglos de familiares
        const fNombres = formData.getAll('f_nom[]');
        const fParentescos = formData.getAll('f_par[]');
        const fIngresos = formData.getAll('f_ing[]');

        if (fNombres.length > 0) {
            fNombres.forEach((nom, i) => {
                if (nom.trim() !== "") {
                    html += `<tr>
                        <td>${nom}</td>
                        <td>${fParentescos[i]}</td>
                        <td>$${fIngresos[i] || '0'}</td>
                    </tr>`;
                }
            });
        } else {
            html += `<tr><td colspan="3">No se registraron familiares</td></tr>`;
        }

        html += `
                    </tbody>
                </table>
            </div>

            <div class="resumen-seccion">
                <h3>V. Observaciones</h3>
                <p>${getVal('comentarios')}</p>
            </div>
        `;

        resumen.innerHTML = html;
    }
    // ==========================================
    // MANEJO DEL ENVÍO FINAL
    // ==========================================
    becaForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página se recargue o busque el .php

        // Aquí es donde en el futuro pondrás tu código fetch() para enviar a PHP
        console.log("Simulando envío de datos...", Object.fromEntries(new FormData(becaForm)));

        // Cambiamos al paso de éxito
        // Buscamos el índice del paso de éxito (el último)
        const successIndex = steps.length - 1; 
        currentStep = successIndex;
        showStep(currentStep);

        // Opcional: Ocultar la barra de progreso al terminar
        if (progressBar) progressBar.parentElement.style.display = 'none';
    });

    // Iniciar
    showStep(currentStep);
    actualizarEstadoTabla(); // Para ocultar el aviso al inicio
});