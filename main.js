/**
 * ARCHIVO: main.js (Raíz) - Lógica de Navegación e Integración SPA
 */

// --- 1. ESTADO GLOBAL (Accesible desde cualquier parte) ---
let currentStep = 1;
window.formDataStorage = {}; 

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

// --- NUEVA FUNCIÓN: Determinar pasos activos según condiciones ---
function obtenerPasosActivos() {
    const pasos = [1, 2]; // El paso 1 y 2 siempre se muestran

    // Verificamos si el estudiante trabaja. 
    // NOTA: Asegúrate de que el 'name' de tu input en el HTML sea 'trabaja' y el valor sea 'si'.
    const estudianteTrabaja = window.formDataStorage['trabaja'] === 'si';

    if (estudianteTrabaja) {
        pasos.push(3); // Solo agregamos el paso 3 si trabaja
    }

    // Agregamos el resto de los pasos que siempre son fijos
    pasos.push(4, 5, 6, 7, 8, 9, 10);
    
    return pasos;
}

// --- 2. FUNCIONES DE CARGA (Globales) ---

async function loadStep(stepNumber) {
    const viewPort = document.getElementById('dynamic-content');
    if (!viewPort) return;

    const folder = folderMap[stepNumber];
    const htmlPath = `Paginas/${encodeURIComponent(folder)}/view.html`;
    const scriptPath = `Paginas/${encodeURIComponent(folder)}/script.js`;

    try {
        const response = await fetch(htmlPath);
        if (!response.ok) throw new Error("No se pudo encontrar el archivo");
        
        viewPort.innerHTML = await response.text();
        
        // Restaurar datos guardados
        if (window.restoreDataGlobal) window.restoreDataGlobal();

        // Gestionar Scripts
        const oldScript = document.getElementById('step-script');
        if (oldScript) oldScript.remove();

        const script = document.createElement('script');
        script.src = `${scriptPath}?v=${new Date().getTime()}`; 
        script.id = 'step-script';
        
        script.onload = () => {
            // Inicializadores específicos
            if (stepNumber === 1 && typeof initIdentificacion === 'function') initIdentificacion();
            if (stepNumber === 5 && typeof initMaterias === 'function') initMaterias();
            if (stepNumber === 6 && typeof initRecord === 'function') initRecord();
            if (stepNumber === 7 && typeof initFamiliares === 'function') initFamiliares();
            if (stepNumber === 9 && typeof renderResumen === 'function') renderResumen();
        };
        
        document.body.appendChild(script);
        actualizarInterfaz(stepNumber);

    } catch (e) { 
        console.error("Error al cargar el paso:", e); 
    }
}

function actualizarInterfaz(step) {
    // Calculamos el progreso basado en los pasos activos reales
    const pasosActivos = obtenerPasosActivos();
    const indiceActual = pasosActivos.indexOf(step);
    const totalPasosReales = pasosActivos.length;

    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        // Recalculamos el porcentaje: (índice actual + 1) / total de pasos activos
        progressBar.style.width = `${((indiceActual + 1) / totalPasosReales) * 100}%`;
    }
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const btnLimpiar = document.querySelector('.btn-clear-data');

    if (prevBtn) prevBtn.style.display = (step <= 1 || step >= 10) ? 'none' : 'inline-block';
    if (nextBtn) nextBtn.textContent = (step === 9) ? "Confirmar" : "Siguiente";
    if (btnLimpiar) btnLimpiar.style.display = (step > 0 && step <= 8) ? 'block' : 'none';
}

// --- 3. FUNCIONES DE VENTANA (window) PARA EL SIDEBAR ---

window.navegarA = (paso) => {
    console.log("Navegando al paso:", paso);
    
    if (window.saveCurrentData) window.saveCurrentData();
    
    currentStep = paso;
    
    loadStep(paso).then(() => {
        const checkMenu = document.getElementById('btn-menu');
        if (checkMenu) checkMenu.checked = false;
    });
};

// --- 4. INICIALIZACIÓN DEL DOM ---

document.addEventListener('DOMContentLoaded', () => {
    const viewPort = document.getElementById('dynamic-content');
    const mainContainer = document.getElementById('main-container');

    // Botón de Limpieza
    const btnLimpiar = document.createElement('button');
    btnLimpiar.className = 'btn-clear-data';
    btnLimpiar.innerHTML = 'Borrar Campos';
    if (mainContainer) mainContainer.appendChild(btnLimpiar);

    btnLimpiar.onclick = () => {
        if (confirm("¿Deseas borrar los datos de esta página?")) {
            const inputs = viewPort.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') input.checked = false;
                else input.value = '';
                if (input.name) delete window.formDataStorage[input.name];
            });
        }
    };

    window.saveCurrentData = () => {
        const inputs = viewPort.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    if (input.checked) window.formDataStorage[input.name] = input.value;
                } else {
                    window.formDataStorage[input.name] = input.value;
                }
            }
        });
    };

    window.restoreDataGlobal = () => {
        const inputs = viewPort.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const savedValue = window.formDataStorage[input.name];
            if (savedValue !== undefined) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = (input.value === savedValue || savedValue === true);
                } else {
                    input.value = savedValue;
                }
            }
        });
    };

    // --- Lógica de Navegación con saltos condicionales ---
    document.getElementById('nextBtn').onclick = () => {
        if (currentStep === 1 && typeof validarPaso1 === 'function' && !validarPaso1()) return;
        
        window.saveCurrentData(); // Guardamos los datos primero para saber si trabaja o no
        
        const pasosActivos = obtenerPasosActivos();
        const currentIndex = pasosActivos.indexOf(currentStep);
        
        // Avanzamos al siguiente paso en el arreglo de pasos activos
        if (currentIndex < pasosActivos.length - 1) {
            currentStep = pasosActivos[currentIndex + 1];
            loadStep(currentStep);
        }
    };

    document.getElementById('prevBtn').onclick = () => {
        window.saveCurrentData();
        
        const pasosActivos = obtenerPasosActivos();
        const currentIndex = pasosActivos.indexOf(currentStep);
        
        // Retrocedemos al paso anterior en el arreglo de pasos activos
        if (currentIndex > 0) {
            currentStep = pasosActivos[currentIndex - 1];
            loadStep(currentStep);
        }
    };

    // Carga inicial
    loadStep(currentStep);
});
