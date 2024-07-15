// Player.js
import PlayerImage from './assets/Player.png';

// Precargar la imagen del jugador
export function preloadPlayer(scene) {
  scene.load.image('player', PlayerImage);
}

// Crear el jugador en la escena
export function createPlayer(scene, cellSize, positionX, positionY, id) {
  sessionStorage.setItem('authToken', id);
  const player = scene.add.sprite(positionY * cellSize, positionX * cellSize, 'player').setOrigin(0, 0);
  player.displayWidth = cellSize; // Ajustar el ancho del jugador
  player.displayHeight = cellSize; // Ajustar la altura del jugador

  const cursors = scene.input.keyboard.createCursorKeys(); // Crear las teclas de control

  scene.physics.add.existing(player); // Agregar física al jugador
  player.body.setCollideWorldBounds(true); // Hacer que el jugador colisione con los bordes del mundo

  return { player, cursors }; // Retornar la instancia del jugador y las teclas de control
}

// Actualizar la posición del jugador en cada frame
export function updatePlayer({ player, cursors }, cellSize) {
  if (cursors.left.isDown) {
    player.x -= cellSize / 10; // Mover a la izquierda
  } else if (cursors.right.isDown) {
    player.x += cellSize / 10; // Mover a la derecha
  }

  if (cursors.up.isDown) {
    player.y -= cellSize / 10; // Mover hacia arriba
  } else if (cursors.down.isDown) {
    player.y += cellSize / 10; // Mover hacia abajo
  }
}

