/**
 * Este evento 'DOMContentLoaded' es como decir: "Espera a que toda la página (HTML) 
 * esté lista y cargada antes de empezar a ejecutar estas instrucciones".
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. REFERENCIAS (Conectar el código con el diseño HTML) ---
    // Imagina que estas son "etiquetas" para poder manipular los elementos de la pantalla.

    // Buscamos todas las secciones que tengan la clase '.step' y las guardamos en una lista.
    const steps = Array.from(document.querySelectorAll('.step'));
    
    // Buscamos todos los botones de "Siguiente" y "Anterior".
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    
    // La barrita de colores que indica cuánto falta para terminar.
    const progressBar = document.querySelector('.progress-bar');
    
    // El cuadrito (checkbox) donde el usuario marca si trabaja o no.
    const checkTrabaja = document.getElementById('check_trabaja');
    
    // El formulario completo que contiene todos los datos.
    const becaForm = document.getElementById('becaForm');
    
    // Referencias para la tabla de familiares (donde se agregan filas dinámicamente).
    const cuerpoTabla = document.getElementById('cuerpo-tabla'); // El "cuerpo" de la tabla.
    const btnAgregar = document.getElementById('btn-agregar');   // El botón "+" para añadir familiar.
    const avisoLimite = document.getElementById('aviso-limite'); // Un mensaje de "Ya no puedes agregar más".
    const maxFamiliares = 5; // Límite máximo de filas permitido.

    // Esta variable guarda en qué número de paso estamos (0 es el primero, 1 el segundo, etc.).
    let currentStep = 0; 

    // ==========================================
    // 2. LÓGICA DE NAVEGACIÓN (Cambiar de pantalla)
    // ==========================================

    /**
     * Esta función se encarga de mostrar visualmente un paso y ocultar los demás.
     */
    function showStep(idx) {
        // Recorremos todos los pasos. Si el número del paso coincide con el que queremos mostrar (idx), 
        // le ponemos la clase 'active' para que se vea. Si no, se la quitamos.
        steps.forEach((s, i) => s.classList.toggle('active', i === idx));
        
        // Si existe la barra de progreso, calculamos el porcentaje de avance.
        if (progressBar) {
            // Ejemplo: (Paso 1 de 4) -> (1 / 4) * 100 = 25% de la barra llena.
            const progress = ((idx + 1) / steps.length) * 100;
            progressBar.style.width = progress + '%';
        }
        
        // Si estamos llegando al final (penúltimo paso), generamos el resumen de datos automáticamente.
        if (idx === steps.length - 2) renderResumen();
    }

    /**
     * Programamos qué pasa cuando alguien hace clic en CUALQUIER botón de "Siguiente".
     */
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Primero revisamos si los datos del paso actual están bien llenos.
            if (validarPasoActual()) {
                let nextStep = currentStep + 1;

                // Lógica de "Salto Inteligente":
                // Si estoy en el paso 1 y el usuario NO marcó que trabaja, 
                // saltamos directo al paso 3 (nos saltamos las preguntas de trabajo).
                if (currentStep === 1 && checkTrabaja && !checkTrabaja.checked) {
                    nextStep = 3; 
                }

                // Si todavía quedan pasos por mostrar, avanzamos.
                if (nextStep < steps.length) {
                    currentStep = nextStep;
                    showStep(currentStep);
                }
            }
        });
    });

    /**
     * Programamos qué pasa cuando alguien hace clic en CUALQUIER botón de "Anterior".
     */
    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            let prevStep = currentStep - 1;

            // Si intento volver atrás desde el paso 3 y no trabajo, 
            // debo volver al paso 1 (donde me preguntaron si trabajaba).
            if (currentStep === 3 && checkTrabaja && !checkTrabaja.checked) {
                prevStep = 1;
            }

            // Si el paso anterior es válido (no es menor a 0), retrocedemos.
            if (prevStep >= 0) {
                currentStep = prevStep;
                showStep(currentStep);
            }
        });
    });

    // ==========================================
    // 3. LÓGICA DE LA TABLA (Agregar/Quitar familiares)
    // ==========================================

    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            // Contamos cuántas filas (tr) hay en la tabla actualmente.
            const filasActuales = cuerpoTabla.querySelectorAll('tr').length;

            // Si no hemos llegado al límite de 5...
            if (filasActuales < maxFamiliares) {
                // Insertamos una nueva fila al final de la tabla.
                const nuevaFila = cuerpoTabla.insertRow();
                
                // Le metemos el código HTML con los cuadritos de texto (inputs).
                // Los nombres terminan en [] para que el servidor entienda que es una lista de datos.
                nuevaFila.innerHTML = `
                    <td><input type="text" name="f_nom[]" required placeholder="Nombre"></td>
                    <td><input type="text" name="f_par[]" required placeholder="Parentesco"></td>
                    <td><input type="number" name="f_eda[]" required min="0" max="120"></td>
                    <td><input type="text" name="f_ins[]" placeholder="Instrucción"></td>
                    <td><input type="text" name="f_ocu[]" placeholder="Ocupación"></td>
                    <td><input type="number" name="f_ing[]" step="0.01" placeholder="0.00"></td>
                    <button type="button" class="btn-remove" title="Eliminar">&times;</button>
                `;
                // Revisamos si debemos bloquear el botón de agregar por haber llegado al límite.
                actualizarEstadoTabla();
            }
        });
    }

    /**
     * Delegación de eventos: Esto sirve para que, aunque la fila sea nueva, 
     * el botón de "Eliminar" funcione. Escuchamos clics en toda la tabla.
     */
    cuerpoTabla.addEventListener('click', (e) => {
        // Si el clic fue en un botón que tiene la clase 'btn-remove'...
        if (e.target.classList.contains('btn-remove')) {
            // Buscamos la fila (tr) más cercana al botón y la borramos.
            e.target.closest('tr').remove();
            actualizarEstadoTabla();
        }
    });

    /**
     * Función para bloquear o desbloquear el botón de "Añadir" según el límite.
     */
    function actualizarEstadoTabla() {
        const filasActuales = cuerpoTabla.querySelectorAll('tr').length;
        
        if (filasActuales >= maxFamiliares) {
            btnAgregar.disabled = true; // Desactivar botón.
            btnAgregar.classList.add('deshabilitado'); // Ponerlo gris.
            avisoLimite.classList.remove('oculto'); // Mostrar mensaje de alerta.
        } else {
            btnAgregar.disabled = false;
            btnAgregar.classList.remove('deshabilitado');
            avisoLimite.classList.add('oculto');
        }
    }

    // ==========================================
    // 4. VALIDACIÓN Y RESUMEN
    // ==========================================

    /**
     * Revisa si el usuario puede pasar al siguiente paso.
     */
    function validarPasoActual() {
        if (currentStep === 0) {
            // Ejemplo: En el paso 0, es obligatorio marcar que estás "activo".
            const checkActivo = document.getElementById('check_activo');
            if (checkActivo && !checkActivo.checked) {
                alert("Debe estar activo en sus estudios para continuar.");
                return false; // Bloquea el avance.
            }
        }
        return true; // Todo bien, puede continuar.
    }

    /**
     * Recopila todo lo que el usuario escribió y lo muestra en una lista bonita antes de enviar.
     */
    function renderResumen() {
        const resumen = document.getElementById('resumen');
        if (!resumen || !becaForm) return;

        // FormData es una herramienta que "empaqueta" todos los datos escritos en el formulario.
        const formData = new FormData(becaForm);
        
        // Función rápida para obtener un dato por su nombre o poner "No indicado" si está vacío.
        const getVal = (name) => formData.get(name) || "No indicado";

        // Empezamos a construir una cadena de texto que se convertirá en HTML.
        let html = `
            <div class="resumen-seccion">
                <h3>I. Información Personal</h3>
                <p><strong>Nombre Completo:</strong> ${getVal('nombres')} ${getVal('apellidos')}</p>
                <p><strong>Cédula:</strong> ${getVal('cedula')} | <strong>Estado Civil:</strong> ${getVal('edo_civil')}</p>
                <p><strong>Trabaja:</strong> ${formData.has('trabaja') ? 'Sí' : 'No'}</p>
            </div>
            `;

        // Procesamos la tabla de familiares por separado porque son varios.
        const fNombres = formData.getAll('f_nom[]');
        const fParentescos = formData.getAll('f_par[]');
        const fIngresos = formData.getAll('f_ing[]');

        // Si hay nombres en la tabla, creamos filas en el resumen.
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
        }

        // Finalmente, inyectamos todo ese texto HTML dentro del div de resumen.
        resumen.innerHTML = html;
    }

    // ==========================================
    // 5. ENVÍO FINAL
    // ==========================================

    becaForm.addEventListener('submit', (e) => {
        // Evitamos que la página se refresque (comportamiento normal de un formulario).
        e.preventDefault(); 

        // Aquí se enviarían los datos a una base de datos. Por ahora, solo lo mostramos en la consola.
        console.log("Simulando envío de datos...", Object.fromEntries(new FormData(becaForm)));

        // Movemos al usuario al último paso (el de "¡Éxito! Tu solicitud fue enviada").
        const successIndex = steps.length - 1; 
        currentStep = successIndex;
        showStep(currentStep);

        // Ocultamos la barra de progreso porque ya terminamos.
        if (progressBar) progressBar.parentElement.style.display = 'none';
    });

    // --- INICIALIZACIÓN ---
    // Al cargar la página por primera vez, mostramos el paso 0.
    showStep(currentStep);
    actualizarEstadoTabla(); 
});