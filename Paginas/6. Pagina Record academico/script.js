/**
 * Inicializa la lógica del récord académico
 */
function initRecord() {
    // 1. Contar materias marcadas en la página 5
    const totalInscritas = Object.keys(window.formDataStorage)
        .filter(key => key.startsWith('mat_') && window.formDataStorage[key] === true)
        .length;

    const inputIns = document.getElementById('m_ins');
    if (inputIns) {
        inputIns.value = totalInscritas;
        // Actualizamos el storage para que se guarde el número
        window.formDataStorage['m_ins'] = totalInscritas;
    }
}

/**
 * Valida que la suma de aprobadas e inasistentes no supere las inscritas
 */
function validarRecord() {
    const ins = parseInt(document.getElementById('m_ins').value) || 0;
    const apr = parseInt(document.getElementById('m_apr').value) || 0;
    const ina = parseInt(document.getElementById('m_ina').value) || 0;
    const indice = parseFloat(document.getElementById('record_indice').value) || 0;

    if ((apr + ina) > ins) {
        alert(`⚠️ Error: La suma de aprobadas (${apr}) e inasistentes (${ina}) no puede ser mayor al total de inscritas (${ins}).`);
        return false;
    }

    if (indice > 20) {
        alert("⚠️ El índice no puede ser mayor a 20 puntos.");
        return false;
    }

    return true;
}