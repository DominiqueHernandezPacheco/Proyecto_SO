// Mapeo de dispositivos a puertos válidos
const dispositivosAPuertos = {
    teclado: 'usb',
    proyector: 'hdmi',
    audifonos: 'audio'
};

// Estado de los puertos
const estadoPuertos = {
    usb: null,
    hdmi: null,
    audio: null
};

// Función para manejar la conexión/desconexión
function manejarConexion(dispositivo, accion) {
    const puertoValido = dispositivosAPuertos[dispositivo];
    const botonPuerto = document.getElementById(`estado-${puertoValido}`);
    const registro = document.getElementById('registro-procesos'); // Contenedor del registro

    if (accion === "desconectar") {
        // Desconectar el dispositivo
        if (estadoPuertos[puertoValido] === dispositivo) {
            estadoPuertos[puertoValido] = null;
            botonPuerto.textContent = 'Desconectado';
            botonPuerto.classList.remove('estado-conectado');
            botonPuerto.classList.add('estado-desconectado');
            agregarRegistro(`${dispositivo.charAt(0).toUpperCase() + dispositivo.slice(1)} desconectado del puerto ${puertoValido.toUpperCase()}.`);
        } else {
            alert(`El ${dispositivo} no está conectado al puerto ${puertoValido.toUpperCase()}.`);
        }
    } else if (accion === puertoValido) {
        // Conectar el dispositivo al puerto válido
        if (estadoPuertos[puertoValido]) {
            alert(`Error: El puerto ${puertoValido.toUpperCase()} ya está ocupado.`);
        } else {
            estadoPuertos[puertoValido] = dispositivo;
            botonPuerto.textContent = 'Conectado';
            botonPuerto.classList.remove('estado-desconectado');
            botonPuerto.classList.add('estado-conectado');
            agregarRegistro(`${dispositivo.charAt(0).toUpperCase() + dispositivo.slice(1)} conectado al puerto ${puertoValido.toUpperCase()}.`);
        }
    } else {
        // Acción inválida
        alert(`Error: El ${dispositivo} solo puede conectarse al puerto ${puertoValido.toUpperCase()}.`);
    }

    // Reiniciar el menú desplegable
    //document.getElementById(`select-${dispositivo}`).value = "";
}

// Función para agregar un registro al cuadro de "Registro de Procesos"
function agregarRegistro(mensaje) {
    const registro = document.getElementById('registro-procesos');
    const nuevoRegistro = document.createElement('li'); // Crear un nuevo elemento de lista
    nuevoRegistro.textContent = mensaje; // Asignar el mensaje
    registro.appendChild(nuevoRegistro); // Agregar el nuevo registro a la lista
}

