/**
 * Lógica para la gestión de materias (Paso 5)
 * Este script permite al usuario seleccionar materias de una lista predefinida o agregarlas
 * manualmente, controlando un límite máximo de selección y persistiendo los datos.
 */
function initMaterias() {
    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const listaDisponibles = document.getElementById('materias-disponibles'); // Contenedor con checkboxes de materias
    const listaSeleccionadas = document.getElementById('materias-seleccionadas'); // Div donde se listan las materias elegidas
    const contadorVisor = document.getElementById('count-materias'); // Elemento visual que muestra el total (N de 8)
    const inputManual = document.getElementById('manual-materia-name'); // Campo de texto para escribir materia personalizada
    const btnManual = document.getElementById('btn-add-manual'); // Botón para agregar la materia escrita

    // Salida de seguridad: Si los elementos principales no existen, no se ejecuta el script
    if (!listaDisponibles || !listaSeleccionadas) return;

    // Regla de negocio: Límite de materias permitido
    const MAX_MATERIAS = 8;
    
    // Recuperar materias previamente guardadas en el objeto global (útil si el usuario navega hacia atrás/adelante)
    // Si no hay nada, se inicializa como un arreglo vacío.
    let seleccionadas = window.formDataStorage['lista_materias_nombres'] || [];

    /**
     * --- FUNCIÓN PARA RENDERIZAR LA LISTA DE LA DERECHA ---
     * Se encarga de limpiar el contenedor de seleccionadas y volver a dibujar los elementos
     * basándose en el estado actual del arreglo 'seleccionadas'.
     */
    function actualizarVista() {
        // Limpiar el contenido previo para evitar duplicados visuales
        listaSeleccionadas.innerHTML = '';
        
        // Dibujar cada materia con un botón de eliminación
        seleccionadas.forEach((materia, index) => {
            const div = document.createElement('div');
            // Estilos en línea para mantener la estructura de fila (Nombre + Botón X)
            div.style = "display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid #eee; align-items: center;";
            div.innerHTML = `
                <span>${materia}</span>
                <button type="button" onclick="eliminarMateria(${index})" style="background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">×</button>
            `;
            listaSeleccionadas.appendChild(div);
        });

        // --- SINCRONIZACIÓN DE DATOS ---
        // Actualizar el número de materias en la interfaz
        contadorVisor.innerText = seleccionadas.length;
        
        // m_ins: Variable clave que será utilizada por la lógica de cálculo en el Paso 6 (Récord Académico)
        window.formDataStorage['m_ins'] = seleccionadas.length; 
        
        // Guardar el arreglo de nombres en el almacenamiento global para persistencia
        window.formDataStorage['lista_materias_nombres'] = seleccionadas;

        // --- SINCRONIZACIÓN DE CHECKBOXES ---
        // Busca todos los checkboxes en la lista de disponibles y marca/desmarca según el arreglo actual
        const cbs = listaDisponibles.querySelectorAll('.materia-cb');
        cbs.forEach(cb => {
            const label = cb.parentElement.textContent.trim();
            cb.checked = seleccionadas.includes(label);
        });
    }

    /**
     * --- EVENTO: CLICK EN CHECKBOXES ---
     * Delegación de eventos para capturar cambios en los checkboxes de materias predefinidas.
     */
    listaDisponibles.addEventListener('change', (e) => {
        if (e.target.classList.contains('materia-cb')) {
            const nombreMateria = e.target.parentElement.textContent.trim();
            
            if (e.target.checked) {
                // Verificar si aún hay cupo antes de agregar
                if (seleccionadas.length < MAX_MATERIAS) {
                    // Evitar duplicados si por alguna razón el checkbox se dispara dos veces
                    if (!seleccionadas.includes(nombreMateria)) seleccionadas.push(nombreMateria);
                } else {
                    // Si excede el límite, forzar el desmarcado y alertar al usuario
                    e.target.checked = false;
                    alert("⚠️ Solo puedes inscribir un máximo de 8 materias.");
                }
            } else {
                // Si se desmarca, filtrar el arreglo para eliminar esa materia
                seleccionadas = seleccionadas.filter(m => m !== nombreMateria);
            }
            actualizarVista();
        }
    });

    /**
     * --- EVENTO: AÑADIR MANUAL ---
     * Permite al usuario agregar materias que no aparecen en la lista de checkboxes.
     */
    btnManual.onclick = () => {
        const nombre = inputManual.value.trim();
        if (!nombre) return; // No agregar campos vacíos
        
        if (seleccionadas.length >= MAX_MATERIAS) {
            alert("⚠️ Máximo 8 materias alcanzado.");
            return;
        }

        if (seleccionadas.includes(nombre)) {
            alert("Esta materia ya está en la lista.");
        } else {
            seleccionadas.push(nombre);
            inputManual.value = ''; // Limpiar el input tras agregar
            actualizarVista();
        }
    };

    /**
     * --- FUNCIÓN GLOBAL PARA EL BOTÓN ELIMINAR (X) ---
     * Se declara en el objeto 'window' para que sea accesible desde el atributo 'onclick'
     * generado dinámicamente en la función actualizarVista().
     * @param {number} index - Posición de la materia en el arreglo 'seleccionadas'.
     */
    window.eliminarMateria = (index) => {
        // Elimina 1 elemento en la posición especificada
        seleccionadas.splice(index, 1);
        actualizarVista();
    };

    // Renderizado inicial al cargar el paso (importante para mostrar datos recuperados del Storage)
    actualizarVista();
}