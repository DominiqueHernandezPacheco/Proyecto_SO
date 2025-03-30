// ====== Simulación de dispositivos y operaciones con manejo de errores ======

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
  
  // Estado de los drivers para cada dispositivo
  const drivers = {
    teclado: false,
    proyector: false,
    audifonos: false
  };
  
  // Configuración de errores y latencias (puedes ajustar estos valores)
  const errorProbabilidad = 0.1; // 10% de probabilidad de error en cada operación
  const latencias = {
    teclado: 500,    // en milisegundos
    proyector: 1500,
    audifonos: 800
  };
  
 // Función para mostrar notificaciones visuales
function showNotification(mensaje, duracion = 3000) {
    const notificationDiv = document.getElementById('notification');
    notificationDiv.textContent = mensaje;
    notificationDiv.style.display = 'block';
    
    // Oculta la notificación después de 'duracion' milisegundos
    setTimeout(() => {
      notificationDiv.style.display = 'none';
    }, duracion);
  }
  
  // Cola de operaciones con límite de capacidad
  class IOQueue {
    constructor(limite = 10) {
      this.queue = [];
      this.limite = limite;
    }
    enqueue(operation) {
      if (this.queue.length >= this.limite) {
        const errorMsg = `Error: Cola de operaciones llena. No se pudo agregar ${operation.operation} en ${operation.device}.`;
        agregarRegistro(errorMsg);
        showNotification('¡La cola está llena! No se pueden agregar más operaciones.');
        return;
      }
      this.queue.push(operation);
      agregarRegistro(`Operación ${operation.operation} para ${operation.device} encolada.`);
      actualizarInspeccion();
    }
    processNext() {
      if (this.queue.length === 0) {
        agregarRegistro('No hay operaciones en la cola.');
        return;
      }
      const op = this.queue.shift();
      agregarRegistro(`Procesando operación ${op.operation} para ${op.device}...`);
      
      // Simulación de latencia variable según dispositivo
      setTimeout(() => {
        // Simulación de error aleatorio
        if (Math.random() < errorProbabilidad) {
          agregarRegistro(`Error durante ${op.operation} en ${op.device}: Fallo inesperado.`);
        } else {
          if (op.operation === 'read') {
            agregarRegistro(`Lectura exitosa en ${op.device}: "Datos simulados".`);
          } else if (op.operation === 'write') {
            agregarRegistro(`Escritura exitosa en ${op.device}: "${op.data}".`);
          }
        }
        actualizarInspeccion();
      }, latencias[op.device] || 1000);
    }
  }
  

  
  const ioQueue = new IOQueue();
  
  // Función para instalar el driver simulando un proceso con modal
  function instalarDriver(dispositivo) {

    if (drivers[dispositivo]) {
      alert(`El driver para ${dispositivo} ya está instalado.`);
      agregarRegistro(`El driver para ${dispositivo} ya está instalado.`);
      return;
    }

    const modal = document.getElementById('modal-driver-install');
    const progress = document.getElementById('install-progress');
    const driverMessage = document.getElementById('driver-message');
  
    modal.style.display = 'block';
    progress.value = 0;
    driverMessage.textContent = `Instalando driver para ${dispositivo}...`;
  
    let progressInterval = setInterval(() => {
      if (progress.value < 100) {
        progress.value += 10;
      } else {
        clearInterval(progressInterval);
        modal.style.display = 'none';
        drivers[dispositivo] = true;
        agregarRegistro(`Driver para ${dispositivo} instalado correctamente.`);
        alert(`Driver para ${dispositivo} instalado.`);
      }
    }, 200);
  }
  
  // Función para manejar la conexión/desconexión
  function manejarConexion(dispositivo, accion) {
    const puertoValido = dispositivosAPuertos[dispositivo];
    const botonPuerto = document.getElementById(`estado-${puertoValido}`);
    const selectElement = document.getElementById(`select-${dispositivo}`);
  
    if (accion === "desconectar") {
      if (estadoPuertos[puertoValido] === dispositivo) {
        estadoPuertos[puertoValido] = null;
        botonPuerto.textContent = 'Desconectado';
        botonPuerto.classList.replace('estado-conectado', 'estado-desconectado');
        agregarRegistro(`${capitalize(dispositivo)} desconectado del puerto ${puertoValido.toUpperCase()}.`);
      } else {
        alert(`El ${dispositivo} no está conectado al puerto ${puertoValido.toUpperCase()}.`);
      }
      selectElement.selectedIndex = 0;
    } else if (accion === puertoValido) {
      if (!drivers[dispositivo]) {
        alert(`Error: El driver para ${dispositivo} no está instalado.`);
        agregarRegistro(`Intento de conexión fallido para ${dispositivo}: driver no instalado.`);
        selectElement.selectedIndex = 0;
        return;
      }
      if (estadoPuertos[puertoValido]) {
        alert(`Error: El puerto ${puertoValido.toUpperCase()} ya está ocupado.`);
        selectElement.selectedIndex = 0;
      } else {
        // Simulación de retardo en la conexión
        setTimeout(() => {
          estadoPuertos[puertoValido] = dispositivo;
          botonPuerto.textContent = 'Conectado';
          botonPuerto.classList.replace('estado-desconectado', 'estado-conectado');
          agregarRegistro(`${capitalize(dispositivo)} conectado al puerto ${puertoValido.toUpperCase()}.`);
          selectElement.selectedIndex = 0;
        }, 1000);
      }
    } else {
      alert(`Error: El ${dispositivo} solo puede conectarse al puerto ${puertoValido.toUpperCase()}.`);
      selectElement.selectedIndex = 0;
    }
  }
  
  // Función para mostrar información (puedes expandirla según necesites)
  function mostrarInfo(dispositivo) {
    console.log(`Mostrando información para: ${dispositivo}`);
  }
  
  // Función helper para capitalizar la primera letra
  function capitalize(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
  
  // Función para agregar un registro de procesos en la interfaz
  function agregarRegistro(mensaje) {
    const registro = document.getElementById('registro-procesos');
    const nuevoRegistro = document.createElement('li');
    nuevoRegistro.textContent = mensaje;
    registro.appendChild(nuevoRegistro);
    console.log(mensaje);
    actualizarInspeccion();
  }
  


  // ====== Funciones para el menú de operaciones ======
  
  // Variable para saber en qué dispositivo se seleccionó operar
  let dispositivoActual = null;
  
  // Muestra el modal con el menú de operaciones para un dispositivo
  function mostrarMenuOperaciones(dispositivo) {
    dispositivoActual = dispositivo;
    const modal = document.getElementById('modal-operaciones');
    const titulo = document.getElementById('operaciones-dispositivo');
    titulo.textContent = `Selecciona operación para ${capitalize(dispositivo)}`;
    modal.style.display = 'block';
  }
  


  // Agrega la operación seleccionada a la cola
  function agregarOperacion(tipoOperacion) {
    // Verificar si el driver está instalado
    if (!drivers[dispositivoActual]) {
      alert(`Error: El driver para ${dispositivoActual} no está instalado. Por favor, instálalo antes de realizar operaciones.`);
      agregarRegistro(`Intento de operación fallido para ${dispositivoActual}: driver no instalado.`);
      return; // Salir de la función si el driver no está instalado
    }

    // Verificar si el dispositivo está conectado al puerto correspondiente
    const puertoValido = dispositivosAPuertos[dispositivoActual];
    if (estadoPuertos[puertoValido] !== dispositivoActual) {
        alert(`Error: El ${dispositivoActual} no está conectado al puerto ${puertoValido.toUpperCase()}.`);
        agregarRegistro(`Intento de operación fallido para ${dispositivoActual}: no está conectado al puerto ${puertoValido.toUpperCase()}.`);
        return; // Salir de la función si el dispositivo no está conectado
    }

    // Verificar si el dispositivo es de entrada (teclado) y la operación es "read"
    if (dispositivoActual === 'teclado' && tipoOperacion === 'read') {
      alert(`Error: El teclado es un dispositivo de entrada y no puede realizar operaciones de lectura.`);
      agregarRegistro(`Intento de lectura fallido en ${dispositivoActual}: dispositivo de entrada.`);
      return; // Salir de la función si la operación no es válida
  }

  // Verificar si el dispositivo es de salida (audifonos y proyector) y la operación es "write"
  if ((dispositivoActual === 'audifonos' || dispositivoActual === 'proyector') && tipoOperacion === 'write') {
    alert(`Error: El ${dispositivoActual} es un dispositivo de salida y no puede realizar operaciones de escritura.`);
    agregarRegistro(`Intento de escritura fallido en ${dispositivoActual}: dispositivo de salida.`);
    return; // Salir de la función si la operación no es válida
}


    let dato = null;
    if (tipoOperacion === 'write') {
      dato = prompt('Ingrese el dato a escribir:');
      if (dato === null) {
        return; // Operación cancelada
      }
    }


    ioQueue.enqueue({ device: dispositivoActual, operation: tipoOperacion, data: dato });
    cerrarModalOperaciones();
  }
  


  // Cierra el modal de operaciones
  function cerrarModalOperaciones() {
    const modal = document.getElementById('modal-operaciones');
    modal.style.display = 'none';
    dispositivoActual = null;
  }
  






  // ====== Funciones para inspeccionar la cola de operaciones ======
  
  // Muestra el panel de inspección
  function mostrarInspeccion() {
    const modal = document.getElementById('modal-inspeccion');
    modal.style.display = 'block';
    actualizarInspeccion();
  }
  

  
  // Cierra el modal de inspección
  function cerrarModalInspeccion() {
    document.getElementById('modal-inspeccion').style.display = 'none';
  }



// Actualiza el contenido del panel de inspección y la representación gráfica de la cola global
function actualizarInspeccion() {
    const infoDiv = document.getElementById('info-inspeccion');
    infoDiv.innerHTML = ''; // Limpia el contenido textual
    const h3 = document.createElement('h3');
    h3.textContent = 'Cola de Operaciones';
    infoDiv.appendChild(h3);
    
    // Actualización del listado textual
    if (ioQueue.queue.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No hay operaciones en cola.';
      infoDiv.appendChild(p);
    } else {
      const ul = document.createElement('ul');
      ioQueue.queue.forEach((op, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. [${op.operation.toUpperCase()}] en ${capitalize(op.device)}${op.data ? `: ${op.data}` : ''}`;
        ul.appendChild(li);
      });
      infoDiv.appendChild(ul);
    }
    


    // Actualización de la representación gráfica global en forma de cola
    const graficaDiv = document.getElementById('grafica-cola');
    graficaDiv.innerHTML = ''; // Limpia el contenedor gráfico
    
    ioQueue.queue.forEach((op, index) => {
      const queueItem = document.createElement('div');
      queueItem.className = 'queue-item';
      queueItem.textContent = `${op.operation.toUpperCase()} (${capitalize(op.device)})`;
      graficaDiv.appendChild(queueItem);
      
      // Si no es el último elemento, agrega una flecha
      if (index < ioQueue.queue.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'queue-arrow';
        arrow.textContent = '→';
        graficaDiv.appendChild(arrow);
      }
    });
    


    // Actualización de la representación gráfica por dispositivo
    actualizarOperacionesPorDispositivo();
  }
  


  // Función que actualiza la gráfica de operaciones por cada dispositivo en forma de cola
  function actualizarOperacionesPorDispositivo() {
    const devices = ['teclado', 'proyector', 'audifonos'];
    devices.forEach(device => {
      const container = document.querySelector(`#operaciones-${device} .device-queue`);
      container.innerHTML = ''; // Limpia operaciones previas
      // Filtra operaciones de la cola global por dispositivo
      const operations = ioQueue.queue.filter(op => op.device === device);
      if (operations.length === 0) {
        const span = document.createElement('span');
        span.textContent = 'Sin operaciones';
        container.appendChild(span);
      } else {
        operations.forEach((op, index) => {
          const item = document.createElement('div');
          item.className = 'queue-item';
          item.textContent = `${op.operation.toUpperCase()}${op.data ? ' - ' + op.data : ''}`;
          container.appendChild(item);
          
          // Agregar flecha si no es el último elemento
          if (index < operations.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'queue-arrow';
            arrow.textContent = '→';
            container.appendChild(arrow);
          }
        });
      }
    });
  }
  

  // Variables para métricas del sistema
let totalProcesadas = 0;
let totalErrores = 0;
let tiempoTotalProcesamiento = 0;



// Función para actualizar el panel de recursos
function actualizarRecursos() {
  const panel = document.getElementById('metricas-recursos');
  const operacionesEnCola = ioQueue.queue.length;
  // Calcula el tiempo promedio de procesamiento
  const promedioTiempo = totalProcesadas > 0 ? (tiempoTotalProcesamiento / totalProcesadas).toFixed(2) : 0;
  
  panel.innerHTML = `
    <div class="metric"><strong>Total Procesadas:</strong> ${totalProcesadas}</div>
    <div class="metric"><strong>Errores:</strong> ${totalErrores}</div>
    <div class="metric"><strong>Operaciones en Cola:</strong> ${operacionesEnCola}</div>
    <div class="metric"><strong>Tiempo Promedio de Procesamiento:</strong> ${promedioTiempo} ms</div>
  `;
}



// Modifica la función processNext para actualizar las métricas
function processNext() {
  if (ioQueue.queue.length === 0) {
    agregarRegistro('No hay operaciones en la cola.');
    return;
  }
  const op = ioQueue.queue.shift();
  agregarRegistro(`Procesando operación ${op.operation} para ${op.device}...`);
  



  // Tiempo de inicio para medir la duración de la operación
  const inicio = Date.now();
  


  // Simulación de latencia variable según dispositivo
  setTimeout(() => {
    let operacionExitosa = true;
    if (Math.random() < errorProbabilidad) {
      agregarRegistro(`Error durante ${op.operation} en ${op.device}: Fallo inesperado.`);
      totalErrores++;
      operacionExitosa = false;
    } else {
      if (op.operation === 'read') {
        agregarRegistro(`Lectura exitosa en ${op.device}: "Datos simulados".`);
      } else if (op.operation === 'write') {
        agregarRegistro(`Escritura exitosa en ${op.device}: "${op.data}".`);
      }
    }
    const fin = Date.now();
    const tiempoProcesamiento = fin - inicio;
    if (operacionExitosa) {
      totalProcesadas++;
      tiempoTotalProcesamiento += tiempoProcesamiento;
    }
    actualizarInspeccion(); // Actualiza el panel de la cola
    actualizarRecursos();   // Actualiza el panel de recursos
  }, latencias[op.device] || 1000);
}


//llamar a actualizarRecursos() al iniciar la simulación o cuando se encole una operación
actualizarRecursos();

setInterval(() => {
    if (ioQueue.queue.length > 0) {
      processNext();
    }
  }, 11000);
