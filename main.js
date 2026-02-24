/**
 * ARCHIVO: main.js (Raíz) - Lógica de Navegación e Integración
 * Este script coordina la carga dinámica de formularios (SPA), la persistencia de datos 
 * en memoria y el control del flujo de pasos del usuario.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- ESTADO INICIAL ---
    let currentStep = 1; // Rastrea el paso actual del formulario
    const totalSteps = 10; // Límite total de pantallas definidas
    
    // Referencias a elementos clave del DOM
    const viewPort = document.getElementById('dynamic-content'); // Contenedor donde se inyecta el HTML de cada paso
    const progressBar = document.getElementById('progressBar'); // Elemento visual de progreso
    const mainContainer = document.getElementById('main-container'); // Contenedor principal del layout
    
    // Objeto global para almacenar los datos del formulario entre cambios de página
    window.formDataStorage = {}; 

    // --- INTEGRACIÓN DEL BOTÓN DE LIMPIEZA ---
    // Se crea dinámicamente el botón para resetear los campos de la vista actual
    const btnLimpiar = document.createElement('button');
    btnLimpiar.className = 'btn-clear-data';
    btnLimpiar.innerHTML = 'Borrar Campos';
    mainContainer.appendChild(btnLimpiar);

    // Lógica al hacer clic en "Borrar Campos"
    btnLimpiar.onclick = () => {
        if (confirm("¿Estás seguro de que deseas borrar los datos de esta página?")) {
            // Selecciona todos los elementos de entrada en la vista actual
            const inputs = viewPort.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                // Resetea el valor según el tipo de input
                if (input.type === 'checkbox') input.checked = false;
                else input.value = '';
                
                // Elimina la entrada correspondiente del almacenamiento global si tiene un nombre (name)
                if (input.name) delete window.formDataStorage[input.name];
            });
            
            // Caso especial: Reset manual para el campo 'edad' si está en el Paso 1
            if (currentStep === 1 && document.getElementById('edad')) {
                document.getElementById('edad').value = '00';
            }
        }
    };

    // Mapeo de los números de paso con sus respectivas carpetas físicas en el servidor
    const folderMap = {
        1: "1. Pagina Identificacion",
        2: "2. Pagina Residencia",
        3: "3. Pagina Laboral",
        4: "4. Pagina PNF",
        5: "5. Pagina Materias",
        6: "6. Pagina Record academico",
        7: "7. Pagina Familiares",
        8: "8. Pagina Datos extra",
        9: "9. Verificacion",
        10: "10. Pantalla final"
    };

    /**
     * Guarda los valores actuales de los inputs del DOM en el objeto global formDataStorage
     */
    window.saveCurrentData = () => {
        const inputs = viewPort.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name) {
                // Almacena booleanos para checkboxes o el string value para el resto
                window.formDataStorage[input.name] = (input.type === 'checkbox') ? input.checked : input.value;
            }
        });
    };

    /**
     * Recupera los valores guardados en formDataStorage y los inyecta en los inputs del DOM
     */
    window.restoreDataGlobal = () => {
        const inputs = viewPort.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (window.formDataStorage[input.name] !== undefined) {
                if (input.type === 'checkbox') input.checked = window.formDataStorage[input.name];
                else input.value = window.formDataStorage[input.name];
            }
        });
    };

    /**
     * Función principal de carga: Obtiene el HTML y JS de cada paso de forma asíncrona
     */
    async function loadStep(stepNumber) {
        const folder = folderMap[stepNumber];
        // Construcción de rutas codificando caracteres especiales para URLs
        const htmlPath = `Paginas/${encodeURIComponent(folder)}/view.html`;
        const scriptPath = `Paginas/${encodeURIComponent(folder)}/script.js`;

        try {
            // 1. Petición para obtener el fragmento de HTML del paso
            const response = await fetch(htmlPath);
            viewPort.innerHTML = await response.text();
            
            // 2. Rellenar los campos si el usuario ya los había visitado/llenado antes
            window.restoreDataGlobal();

            // 3. Gestión del Script: Elimina el script del paso anterior para evitar conflictos
            const oldScript = document.getElementById('step-script');
            if (oldScript) oldScript.remove();

            // Crea un nuevo elemento script para la lógica específica del paso cargado
            const script = document.createElement('script');
            // Se agrega un timestamp para evitar que el navegador use una versión en caché (Cache busting)
            script.src = `${scriptPath}?v=${new Date().getTime()}`; 
            script.id = 'step-script';
            
            // Una vez cargado el script, se disparan las funciones de inicialización si existen
            script.onload = () => {
                if (stepNumber === 1 && typeof initIdentificacion === 'function') initIdentificacion();
                if (stepNumber === 5 && typeof initMaterias === 'function') initMaterias();
                if (stepNumber === 6 && typeof initRecord === 'function') initRecord();
                if (stepNumber === 7 && typeof initFamiliares === 'function') initFamiliares();
                if (stepNumber === 9 && typeof renderResumen === 'function') renderResumen();
            };
            
            document.body.appendChild(script);
            // Actualiza los elementos visuales de la interfaz (botones, progreso)
            actualizarInterfaz(stepNumber);

        } catch (e) { 
            console.error("Error al cargar el paso:", e); 
        }
    }

    /**
     * Gestiona la visibilidad y estados de los elementos de navegación
     */
    function actualizarInterfaz(step) {
        // Actualiza el ancho de la barra de progreso proporcionalmente
        if (progressBar) progressBar.style.width = `${(step / totalSteps) * 100}%`;
        
        // Oculta "Atrás" en la primera y última página
        document.getElementById('prevBtn').style.display = (step <= 1 || step >= 10) ? 'none' : 'inline-block';
        
        // Cambia el texto del botón principal en el paso de verificación
        document.getElementById('nextBtn').textContent = (step === 9) ? "Confirmar" : "Siguiente";
        
        // El botón de limpiar solo es visible en los pasos de captura de datos (1 al 8)
        btnLimpiar.style.display = (step > 0 && step <= 8) ? 'block' : 'none';
    }

    /**
     * Manejador del botón "Siguiente" / "Confirmar"
     */
    document.getElementById('nextBtn').onclick = () => {
        // Ejecución de validaciones externas si están presentes en los scripts de cada paso
        if (currentStep === 1 && typeof validarPaso1 === 'function') {
            if (!validarPaso1()) return; // Detiene el avance si falla la validación
        }

        // Lógica de negocio: Bloqueo de beca si el usuario trabaja (Paso 3)
        if (currentStep === 3) {
            alert("⚠️ No podrás solicitar la beca, puesto que al poseer un trabajo no cumples con los requisitos.");
            return;
        }

        if (currentStep === 6 && typeof validarRecord === 'function') {
            if (!validarRecord()) return;
        }

        // Persiste los datos antes de cambiar de vista
        window.saveCurrentData();

        // Lógica de "Salto" (Skipping): Si en el paso 2 indica que NO trabaja, se salta el paso 3 (Laboral)
        if (currentStep === 2 && !window.formDataStorage['trabaja']) {
            currentStep = 4;
        } else {
            currentStep++;
        }
        
        loadStep(currentStep);
    };

    /**
     * Manejador del botón "Atrás"
     */
    document.getElementById('prevBtn').onclick = () => {
        window.saveCurrentData();

        // Lógica inversa del salto: Si retrocede desde el paso 4 y no trabaja, vuelve al paso 2
        if (currentStep === 4 && !window.formDataStorage['trabaja']) {
            currentStep = 2;
        } else {
            currentStep--;
        }

        loadStep(currentStep);
    };

    // Ejecución inicial para mostrar el paso 1 al cargar el sitio
    loadStep(currentStep);
});