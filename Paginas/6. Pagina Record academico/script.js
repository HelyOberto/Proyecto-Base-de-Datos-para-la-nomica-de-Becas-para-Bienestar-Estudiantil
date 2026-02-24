/**
 * Inicializa la lógica del récord académico (Paso 6)
 * Esta función se encarga de sincronizar el número de materias seleccionadas en el paso anterior
 * con los campos de entrada de la vista actual.
 */
function initRecord() {
    /**
     * 1. Cálculo dinámico de materias inscritas:
     * Filtra el objeto global formDataStorage buscando claves que empiecen con 'mat_' 
     * (que representan los checkboxes de la página 5) y que tengan valor 'true'.
     */
    const totalInscritas = Object.keys(window.formDataStorage)
        .filter(key => key.startsWith('mat_') && window.formDataStorage[key] === true)
        .length;

    // Referencia al input donde se muestra el total de materias inscritas
    const inputIns = document.getElementById('m_ins');
    
    if (inputIns) {
        // Asigna el conteo calculado al valor del input para que el usuario lo vea
        inputIns.value = totalInscritas;
        
        /**
         * Actualizamos el storage global:
         * Esto asegura que el número entero esté disponible para los cálculos 
         * de validación incluso si el usuario no interactúa con este campo.
         */
        window.formDataStorage['m_ins'] = totalInscritas;
    }
}

/**
 * Función de validación del Paso 6
 * Verifica la coherencia lógica de los datos académicos ingresados antes de permitir
 * que el usuario avance al siguiente paso.
 * @returns {boolean} True si la información es lógica, False si hay errores.
 */
function validarRecord() {
    // Obtención de valores numéricos de los inputs, usando 0 como valor por defecto (fallback)
    const ins = parseInt(document.getElementById('m_ins').value) || 0; // Inscritas
    const apr = parseInt(document.getElementById('m_apr').value) || 0; // Aprobadas
    const ina = parseInt(document.getElementById('m_ina').value) || 0; // Inasistentes
    
    // El índice académico se maneja como flotante (decimal)
    const indice = parseFloat(document.getElementById('record_indice').value) || 0;

    /**
     * VALIDACIÓN LÓGICA Aritmética:
     * El total de materias inscritas es el universo máximo. 
     * La suma de las materias aprobadas y las materias perdidas por inasistencia 
     * no puede exceder ese total.
     */
    if ((apr + ina) > ins) {
        alert(`⚠️ Error: La suma de aprobadas (${apr}) e inasistentes (${ina}) no puede ser mayor al total de inscritas (${ins}).`);
        return false; // Bloquea el avance
    }

    /**
     * VALIDACIÓN DE ESCALA:
     * Asumiendo una escala de calificación de 0 a 20 puntos.
     */
    if (indice > 20) {
        alert("⚠️ El índice no puede ser mayor a 20 puntos.");
        return false; // Bloquea el avance
    }

    // Si todas las condiciones se cumplen, permite continuar a la siguiente página
    return true;
}