/**
 * Determina si el usuario trabaja para decidir si mostrar o saltar esta página.
 * Se llama desde la lógica de navegación del main.
 */
function usuarioTrabaja() {
    const checkTrabaja = document.getElementById('check_trabaja');
    return checkTrabaja ? checkTrabaja.checked : false;
}