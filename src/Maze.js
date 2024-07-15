import Phaser from 'phaser';

// Crear el laberinto en la escena
export function createMaze(scene, maze) {
  scene.cameras.main.setBackgroundColor('#D3D3D3'); // Establecer color de fondo de la cámara principal
  const cellSize = Math.min(window.innerWidth, window.innerHeight) / maze.length; // Tamaño de la celda del laberinto

  // Iterar sobre el laberinto para dibujar las cuadrículas
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      let color;
      switch (maze[row][col]) {
        case 1:
          color = '#2D3436'; // Color para muros
          break;
        case 4:
          color = '#FFD700'; // Color amarillo para un valor específico
          break;
        default:
          color = '#FFFFFF'; // Color por defecto para otros valores
          break;
      }

      // Dibujar un rectángulo para representar la celda del laberinto
        scene.add.rectangle(col * cellSize, row * cellSize, cellSize, cellSize, Phaser.Display.Color.HexStringToColor(color).color)
        .setOrigin(0, 0) // Establecer origen en la esquina superior izquierda
        .setStrokeStyle(1, 0xb2bec3); // Establecer estilo de borde

      // Si es una celda vacía, dibujar un borde interno más delgado
      if (maze[row][col] === 0) {
        scene.add.rectangle(col * cellSize + 2, row * cellSize + 2, cellSize - 4, cellSize - 4, Phaser.Display.Color.HexStringToColor(color).color)
          .setOrigin(0, 0)
          .setStrokeStyle(1, 0xb2bec3);
      }
    }
  }
}

// Obtener el tamaño de la celda del laberinto
export function getCellSize(maze) {
  return Math.min(window.innerWidth, window.innerHeight) / maze.length;
}  