<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Captura de datos
    $nombres = $_POST['nombres'];
    $edad = $_POST['edad'];
    $trabaja = $_POST['trabaja'];
    $activo = $_POST['activo'];
    $indice = $_POST['indice'];

    $errores = [];

    // Validación de seguridad en el servidor
    if ($edad < 18) $errores[] = "No cumple con la edad mínima.";
    if ($activo == "No") $errores[] = "No es un estudiante activo.";
    if ($indice < 12) $errores[] = "Récord académico no apto.";

    // Si hay errores, mostramos la página de rechazo
    if (count($errores) > 0) {
        echo "<h1>Formulario Incompleto o No Apto</h1>";
        echo "<ul>";
        foreach ($errores as $error) {
            echo "<li>$error</li>";
        }
        echo "</ul>";
        echo "<a href='index.php'>Volver a intentar</a>";
    } else {
        // SI TODO ESTÁ BIEN: Mostrar el resumen solicitado
        echo "<h1>Resumen de Datos (Verificación)</h1>";
        echo "<p><strong>Nombre:</strong> $nombres</p>";
        echo "<p><strong>Edad:</strong> $edad</p>";
        echo "<p><strong>Trabaja:</strong> $trabaja</p>";
        echo "<p><strong>Activo:</strong> $activo</p>";
        echo "<p><strong>Índice:</strong> $indice</p>";
        echo "<button onclick='window.print()'>Confirmar y Guardar</button>";
    }
}
?>