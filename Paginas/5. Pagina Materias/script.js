/**
 * Lógica para limitar la selección de materias e inicializar el estado
 */
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
                // Forzamos el guardado cada vez que cambia para que el paso 6 lo vea
                if (typeof saveCurrentData === 'function') saveCurrentData();
            }
        });
    });
}