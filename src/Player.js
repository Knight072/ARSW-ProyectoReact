// Player.js
import PlayerImage from './assets/Player.png';
import { getActor } from './AxiosRequests';


// Precargar la imagen del jugador
export function preloadPlayer(scene) {
  scene.load.image('player', PlayerImage);
}

async function GetActor() {
  const authToken = sessionStorage.getItem('authToken');
  try {
    const actorResponse = await getActor(authToken);
    const actor = actorResponse.data;
    console.log(actor);
    return actor;
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return null;
  }
}

// Crear el jugador en la escena
export async function createPlayer(scene, cellSize) {
  const actor = await GetActor();
  const player = scene.physics.add.sprite((actor.positionY) * cellSize, (actor.positionX) * cellSize, 'player').setOrigin(0, 0);
  player.displayWidth = cellSize; // Ajustar el ancho del jugador
  player.displayHeight = cellSize; // Ajustar la altura del jugador

  const cursors = scene.input.keyboard.createCursorKeys(); // Crear las teclas de control

  player.body.setCollideWorldBounds(true); // Hacer que el jugador colisione con los bordes del mundo

  return { player, cursors }; // Retornar la instancia del jugador y las teclas de control
}

// Actualizar la posición del jugador en cada frame
export function updatePlayer({ player, cursors }, cellSize, socket) {
  const speed = cellSize * 10; // Ajusta este valor según sea necesario
  player.setVelocity(0);
  let moved = false;

  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
    moved = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
    moved = true;
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
    moved = true;
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
    moved = true;
  }

  if (moved) {
    // Calcular las coordenadas de la celda
    const cellX = Math.floor(player.x / cellSize);
    const cellY = Math.floor(player.y / cellSize);

    // Enviar las coordenadas a través del WebSocket
    if (socket && socket.websocket.readyState === WebSocket.OPEN) {
      const positionData = {
        id: sessionStorage.getItem('authToken'), // Asegúrate de que el jugador tenga un ID único
        positionX: cellY,
        positionY: cellX
      };
      socket.websocket.send(JSON.stringify(positionData));
    }
  }
}



