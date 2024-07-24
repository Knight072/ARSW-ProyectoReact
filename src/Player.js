// Player.js
import ThiefImage from './assets/Thief.png';
import PoliceImage from './assets/Police.png';
import { getActor } from './AxiosRequests';


// Precargar la imagen del jugador
export function preloadPlayer(scene) {
  scene.load.image('thief', ThiefImage);
  scene.load.image('police', PoliceImage);
}

async function GetActor() {
  const authToken = sessionStorage.getItem('authToken');
  try {
    const actorResponse = await getActor(authToken);
    const actor = actorResponse.data;
    return actor;
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return null;
  }
}

// Crear el jugador en la escena
export async function createPlayer(scene, cellSize) {
  let player;
  const actor = await GetActor();
  if(actor.number === 3){
    player = scene.physics.add.sprite((actor.positionY) * cellSize, (actor.positionX) * cellSize, 'thief').setOrigin(0, 0);
  }
  else if(actor.number === 2){
    player = scene.physics.add.sprite((actor.positionY) * cellSize, (actor.positionX) * cellSize, 'police').setOrigin(0, 0);
  }
  player.displayWidth = cellSize/1.2; // Ajustar el ancho del jugador
  player.displayHeight = cellSize/1.2; // Ajustar la altura del jugador

  const cursors = scene.input.keyboard.createCursorKeys(); // Crear las teclas de control

  player.body.setCollideWorldBounds(true); // Hacer que el jugador colisione con los bordes del mundo

  return { player, cursors }; // Retornar la instancia del jugador y las teclas de control
}

// Actualizar la posición del jugador en cada frame
export function updatePlayer({ player, cursors }, cellSize, socket) {
  const speed = cellSize * 3; // Ajusta este valor según sea necesario
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
    const positionData = {
      id: sessionStorage.getItem('authToken'), // Asegúrate de que el jugador tenga un ID único
      positionX: cellY,
      positionY: cellX
    };
    socket.websocket.send(JSON.stringify(positionData));
  }
}

export function updateOtherPlayers(scene, cellSize, player, playersData) {
  playersData.forEach((row, x) => {
    row.forEach((cell, y) => {
      const isMainPlayer = player && Math.floor(player.x / cellSize) === y && Math.floor(player.y / cellSize) === x;
      if (cell === 3 && !isMainPlayer) {
        let otherPlayer = scene.children.getByName(`otherPlayer_${x}_${y}`);
        if (!otherPlayer) {
          otherPlayer = scene.physics.add.sprite(y * cellSize, x * cellSize, 'thief')
            .setOrigin(0, 0)
            .setDisplaySize(cellSize/1.2, cellSize/1.2)
            .setName(`otherPlayer_${x}_${y}`);
        } else {
          otherPlayer.setPosition(y * cellSize, x * cellSize);
        }
      } else if (cell === 2 && !isMainPlayer) {
        let otherPlayer = scene.children.getByName(`otherPlayer_${x}_${y}`);
        if (!otherPlayer) {
          otherPlayer = scene.physics.add.sprite(y * cellSize, x * cellSize, 'police')
            .setOrigin(0, 0)
            .setDisplaySize(cellSize/1.2, cellSize/1.2)
            .setName(`otherPlayer_${x}_${y}`);
        } else {
          otherPlayer.setPosition(y * cellSize, x * cellSize);
        }
      } else {
        let otherPlayer = scene.children.getByName(`otherPlayer_${x}_${y}`);
        if (otherPlayer) {
          otherPlayer.destroy();
        }
      }
    });
  });
}