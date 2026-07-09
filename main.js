
// Espera a que el contenido del DOM cargue para mostrar el HTML
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa los pasos iniciales
    let currentStep = 1;
    let maxStepReached = 1; 
    window.formSubmitted = false; 
    const totalSteps = 7;
    
    const viewPort = document.getElementById('dynamic-content'); 
    const progressBar = document.getElementById('progressBar'); 
    
    // Oculta los contenedores que no pertenecen al perfil
    const userRole = document.body.getAttribute('data-rol');
    if (userRole === 'estudiante') {
        const navContainer = document.getElementById('nav-buttons');
        const progContainer = document.getElementById('progress-wrapper');
        if(navContainer) navContainer.style.display = 'none';
        if(progContainer) progContainer.style.display = 'none';
        
        showRegistrationSummary();
        return;
    }
    
    window.formDataStorage = {}; 

    const folderMap = {
        1: "identificacion",
        2: "residencia",
        3: "PNF",
        4: "familiares",
        5: "datos_extra",
        6: "verificacion",
        7: "pantalla_de_exito"
    };

    // Extrae los datos de cada input de cada paso y se encarga que no se pierdan
    window.saveCurrentData = () => {
        const viewPort = document.getElementById('dynamic-content');
        const inputs = viewPort.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name) {
                let valueToSave;

                if (input.type === 'checkbox') {
                    valueToSave = input.checked;
                } 
                else if (input.type === 'radio') {
                    // No guardar radios no seleccionados
                    if (input.checked) 
                        valueToSave = input.value;
                    else return; 
                } 
                else {
                    valueToSave = input.value;
                }

                // Para evitar problemas, los espacion se reemplazan con '_'
                if (typeof valueToSave === 'string') {
                    valueToSave = valueToSave.replace(/_/g, ' ');
                }

                window.formDataStorage[input.name] = valueToSave;
            }
        });
    };

    // Cuando el usuario retrocede, este de encarga de poner rellemar mieva,emte la informacion
    window.restoreDataGlobal = () => {
        const viewPort = document.getElementById('dynamic-content');
        const inputs = viewPort.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const savedValue = window.formDataStorage[input.name];
            if (savedValue !== undefined) {
                if (input.type === 'checkbox') input.checked = savedValue;
                else if (input.type === 'radio') input.checked = (input.value === savedValue);
                else input.value = savedValue;
            } 
        });
    };

    // Este se encarga de cargar cada uno de los pasos tomando en cuenta el foldermap y los pasos definidos al inicio
    async function loadStep(stepNumber) {
        stepNumber = Number(stepNumber) || 1;
        currentStep = stepNumber; 
        
        const folder = folderMap[stepNumber];
        if (!folder) return;

        if (stepNumber > maxStepReached) 
            maxStepReached = stepNumber;

        if(viewPort) {
            viewPort.classList.add('loading');
            viewPort.innerHTML = '<div style="text-align:center; padding:50px; color:#666;">Cargando paso...</div>';
        }
        
        //Aca se guardan las direcciones (Estas son relativas al lugar donde se mandan)
        const htmlPath = `${folder}/view.php`; 
        const scriptPath = `${folder}/script.js`;

        try {
            const response = await fetch(htmlPath);
            if (!response.ok) throw new Error(`No se pudo acceder a ${folder}`);
            const html = await response.text();
            
            viewPort.innerHTML = html;
            viewPort.querySelectorAll('footer.site-footer').forEach(f => f.remove());

            window.restoreDataGlobal();
            if(typeof updateMenuState === 'function') updateMenuState(stepNumber);
            
            // Cada Step pose su propio Script, por lo que debemos eliminar el que ya tengamos en uso para utilizar el nuevo
            const oldScript = document.getElementById('step-script');
            if (oldScript) oldScript.remove();

            const script = document.createElement('script');
            script.id = 'step-script';
            script.src = `${scriptPath}?v=${Date.now()}`;
            
            //Esta son las funciones de cada script, cada uno sigue una nomenclatura exeptuando los ultimos dos
            script.onload = () => {
                const initFuncs = {
                    1: 'initIdentificacion',
                    2: 'initResidencia',
                    3: 'initPNF',
                    4: 'initFamiliares',
                    5: 'initDatosExtra',
                    6: 'renderResumen',
                    7: 'renderFinalStatus'
                };
                const funcName = initFuncs[stepNumber];
                if (funcName && typeof window[funcName] === 'function') {
                    window[funcName]();
                }
                validarFormularioActual(); 
            };

            script.onerror = () => {
                console.error(`[Flow] Error al cargar el script: ${scriptPath}`);
            };
            
            document.body.appendChild(script);

            actualizarInterfaz(stepNumber);

        } catch (e) { 
            console.error("Error crítico en loadStep:", e);
            if(viewPort) {
                viewPort.innerHTML = `
                    <div style="background:#fff3f3; color:#d32f2f; padding:30px; border-radius:15px; border:1px solid #ffcdd2; margin:20px;">
                        <h3 style="margin-top:0;">⚠️ Error de Carga</h3>
                        <p style="font-size:0.9rem;">${e.message}</p>
                        <hr style="border:0; border-top:1px solid #ffcdd2; margin:15px 0;">
                        <button onclick="location.reload()" class="btn-primary" style="background:#d32f2f;">Reintentar</button>
                    </div>`;
            }
        } finally {
            setTimeout(() => { 
                if(viewPort) viewPort.classList.remove('loading'); 
            }, 150);
        }
    }

    // Lógica para el botón "Borrar formulario"
    const btnLimpiar = document.getElementById('btnLimpiarRegistro');
    if (btnLimpiar) {
        btnLimpiar.onclick = (e) => {
            e.preventDefault();

            if (confirm("¿Deseas limpiar los campos de esta página actual?")) {
                const viewPort = document.getElementById('dynamic-content');
                const inputs = viewPort.querySelectorAll('input, select, textarea');
                // De ocurrir un error, ha de mostrarse aqui
                const errorText = document.getElementById('error-pass'); 

                inputs.forEach(input => {
                    // Limpiamos el formulario visualmente y dentro de la memoria
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        input.checked = false;
                    } else {
                        input.value = "";
                    }

                    if (input.name) {
                        delete window.formDataStorage[input.name];
                    }
                    
                    // Esto especficamente sirve para deshacer el borde rojo de error cuando metes la contrasena
                    input.style.borderColor = '#ddd';
                });

                if (errorText) {
                    errorText.style.display = 'none';
                }

                validarFormularioActual();
                
                console.log("Campos de la página actual y confirmación de contraseña limpiados.");
            }
        };
    }
    // Maneja el botón de salida y se asegura de que el usuario no pierda lo que ha escrito por accidente
    const btnVolver = document.getElementById('btnVolverInicio');
    if (btnVolver) {
        btnVolver.onclick = (e) => {
            // Si el formulario ya se mandó o estamos en la pantalla final, no hace falta preguntar
            if (window.formSubmitted || currentStep >= 7) {
                return true;
            }

            // Si hay datos a mitad de camino, le advertimos que perderá el progreso
            const confirmacion = confirm("¿Estás seguro de que quieres salir? Se perderá el progreso que no haya sido guardado en el sistema.");

            // Si el usuario se arrepiente, frenamos el redireccionamiento a index.php
            if (!confirmacion) {
                e.preventDefault(); 
            }
        };
    }


    // Carga el perfil completo del estudiante desde el servidor y oculta los pasos del formulario
    async function showRegistrationSummary() {
        const sp = window.studentProfile;
        if (!sp || !viewPort) return;

        try {
            const response = await fetch('usuario/perfil.php');
            if (!response.ok) throw new Error("No se pudo cargar la vista");
            let html = await response.text();

            // Lo metemos directo en el contenedor principal para mantener la estructura y subimos la pantalla
            viewPort.innerHTML = html;
            window.scrollTo(0, 0);

        } catch (e) {
            console.error("Error en perfil:", e);
            viewPort.innerHTML = "<h3>Error al cargar el perfil.</h3>";
        }
    }

    // Revisa todos los campos obligatorios (required) del paso actual y les avisa si falta algo
    function validarFormularioActual() {
        const viewPort = document.getElementById('dynamic-content');
        const nextBtn = document.getElementById('nextBtn');
        if (!viewPort || !nextBtn) return;

        // Agarramos todo lo que tenga la etiqueta obligatoria para revisarlo uno por uno
        const inputs = viewPort.querySelectorAll('input[required], select[required], textarea[required]');
        let todoValido = true;

        inputs.forEach(input => {
            // Esta función pinta los errores visualmente si el campo está vacío
            const checkValidity = () => {
                let esValido = true;
                
                if (input.type === 'checkbox' || input.type === 'radio') {
                    // Para casillas y opciones, nos aseguramos de que al menos una esté marcada
                    const group = viewPort.querySelectorAll(`input[name="${input.name}"]`);
                    esValido = Array.from(group).some(i => i.checked);
                } else {
                    esValido = input.value.trim() !== "";
                }

                if (!esValido) {
                    input.style.borderColor = '#d9534f';
                    input.style.backgroundColor = '#fff8f8';
                    todoValido = false;
                } else {
                    input.style.borderColor = '';
                    input.style.backgroundColor = '';
                }
                
                // Volvemos a revisar el botón de siguiente con cada letra que escriba el usuario
                actualizarEstadoBoton();
            };

            // Escuchamos cuando el usuario escribe o cambia de opción para validar en tiempo real
            input.removeEventListener('input', checkValidity);
            input.removeEventListener('change', checkValidity);
            input.addEventListener('input', checkValidity);
            input.addEventListener('change', checkValidity);
            
            // Primera revisión rápida al cargar la página para saber si arranca vacío
            if (input.type !== 'checkbox' && input.type !== 'radio' && input.value.trim() === "") {
                todoValido = false;
            }
        });

        // Activa o desactiva el botón de siguiente según cómo vaya la validación
        function actualizarEstadoBoton() {

            // Si por alguna regla interna del negocio el botón debe estar bloqueado a la fuerza
            if (nextBtn.dataset.locked === "true") {
                nextBtn.disabled = true;
                nextBtn.style.opacity = "0.5";
                return;
            }

            let actualValido = true;
            inputs.forEach(i => {
                if (i.type === 'checkbox' || i.type === 'radio') {
                    const group = viewPort.querySelectorAll(`input[name="${i.name}"]`);
                    if (!Array.from(group).some(radio => radio.checked)) actualValido = false;
                } else {
                    if (i.value.trim() === "") actualValido = false;
                }
            });
            
            // Cambiamos el aspecto del botón (candado, opacidad y cursor) para que se note si está bloqueado o no
            nextBtn.disabled = !actualValido;
            nextBtn.style.opacity = actualValido ? "1" : "0.5";
            nextBtn.style.cursor = actualValido ? "pointer" : "not-allowed";
        }

        actualizarEstadoBoton();
    }

    // Se encarga de cambiar el aspecto de la página (botones que aparecen y desaparecen) según el paso donde estemos
    function actualizarInterfaz(step) {
        // Hace que la barra azul se llene proporcionalmente a los pasos
        if (progressBar) {
            progressBar.style.width = `${(step / totalSteps) * 100}%`;
        }

        // Controla el botón verde de volver que está en la esquina
        const btnVolverCabecera = document.getElementById('btnVolverInicio');
        if (btnVolverCabecera) {
            // Si ya terminamos el registro, escondemos este botón para no confundir
            if (step >= 7) {
                btnVolverCabecera.style.display = 'none'; 
            } else {
                btnVolverCabecera.style.display = 'flex';
            }
        }

        // El botón de regresar no debe existir ni al principio ni al final del todo
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.style.display = (step <= 1 || step >= 7) ? 'none' : 'inline-block';
        }

        // El botón de limpiar solo sirve en los primeros pasos, más adelante ya no hace falta borrar todo
        const btnLimpiar = document.getElementById('btnLimpiarRegistro');
        if (btnLimpiar) {
            btnLimpiar.style.display = (step >= 4) ? 'none' : 'block';
        }

        // Cambia el texto del botón principal según lo que toque hacer
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            // Si es el penúltimo paso cambia a "Confirmar", y en la pantalla de éxito se oculta por completo
            nextBtn.textContent = (step === 6) ? "Confirmar" : "Siguiente";
            nextBtn.style.display = (step >= 7) ? 'none' : 'inline-block';
            
            // Obligamos a revisar los campos obligatorios apenas se renderice la nueva pantalla
            validarFormularioActual(); 
        }
    }

    // Controla la acción del botón principal, ya sea para avanzar de pantalla o enviar los datos definitivos
    const nextBtnEl = document.getElementById('nextBtn');
    if (nextBtnEl) {
        nextBtnEl.type = 'button'; 

        nextBtnEl.onclick = async (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            // Validación manual para asegurar que el primer paso esté correcto antes de continuar
            if (currentStep === 1 && typeof validarPaso1 === 'function' && !validarPaso1()) return false;

            // Guardamos el progreso actual en la memoria global antes de cambiar de pantalla
            window.saveCurrentData();

            // Si estamos en la última pantalla de revisión, procesamos el envío al servidor
            if (currentStep === 6) {
                nextBtnEl.disabled = true;
                nextBtnEl.textContent = "Procesando...";

                if (!window.formDataStorage || Object.keys(window.formDataStorage).length === 0) {
                    alert("Error: No hay datos para enviar.");
                    nextBtnEl.disabled = false;
                    nextBtnEl.textContent = "Confirmar";
                    return;
                }

                try {
                    const urlDestino = window.urlSubmit || 'submit.php';
                    
                    const res = await fetch(urlDestino, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(window.formDataStorage)
                    });

                    const textoRespuesta = await res.text();
                    const obj = JSON.parse(textoRespuesta);
                    
                    if (obj.status === 'ok') {
                        window.formSubmitted = true;
                        currentStep = 7; 
                        loadStep(7);     
                        return;          
                    } else {
                        alert("Error del servidor: " + (obj.error || "Desconocido"));
                        nextBtnEl.disabled = false;
                        nextBtnEl.textContent = "Confirmar";
                        return; 
                    }

                } catch (err) {
                    console.error("ERROR CRÍTICO:", err);
                    alert("Fallo la comunicación: " + err.message);
                    nextBtnEl.disabled = false;
                    nextBtnEl.textContent = "Confirmar";
                    return;
                }
            }

            // Flujo de navegación normal para avanzar entre las pantallas iniciales
            if (currentStep < 6) {
                currentStep++;
                loadStep(currentStep);
            }
        };
    }

    // Controla el botón de retroceso guardando los datos actuales para no perder lo que se hizo en la pantalla
    const prevBtnEl = document.getElementById('prevBtn');
    if (prevBtnEl) {
        prevBtnEl.onclick = (e) => {
            e.preventDefault(); 
            window.saveCurrentData();
            currentStep--;
            loadStep(currentStep);
        };
    }

    // Actualiza el menú lateral bloqueando los pasos siguientes que el usuario aún no ha alcanzado
    function updateMenuState(step) {
        const links = document.querySelectorAll('#slideMenuSPA a[data-step]');
        links.forEach(a => {
            const s = parseInt(a.getAttribute('data-step'), 10);
            a.classList.remove('active','disabled');
            if(s === step) a.classList.add('active');
            if(s > maxStepReached) a.classList.add('disabled');
        });
    }
    
    window.loadStep = loadStep;
    loadStep(currentStep);
});