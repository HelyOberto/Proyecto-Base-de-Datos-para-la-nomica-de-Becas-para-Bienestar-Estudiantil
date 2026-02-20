/**
 * Lógica de validación para el paso 1
 */
function validarPaso1() {
    const checkActivo = document.getElementById('check_activo');
    const edadInput = document.getElementById('edad');
    const edad = parseInt(edadInput.value);

    // 1. Validar Estado Activo
    if (checkActivo && !checkActivo.checked) {
        alert("Debe estar activo en sus estudios para continuar.");
        return false; 
    }

    // 2. Validar Edad (Evita que dejen el campo vacío o pongan edades ilógicas)
    if (!edad || edad < 15 || edad > 90) {
        alert("Por favor, ingrese una edad válida (Mínimo 15 años).");
        edadInput.focus();
        return false;
    }

    return true; 
}