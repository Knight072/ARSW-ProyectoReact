// Treasure.js
import DiamondImage from './assets/Diamond.png';
import GoldImage from './assets/Gold.png';
import SilverImage from './assets/Silver.png';

// Precargar las imágenes de los tesoros
export default function preloadTreasure(scene) {
  scene.load.image('diamond', DiamondImage);
  scene.load.image('gold', GoldImage);
  scene.load.image('silver', SilverImage);
}

// Crear los tesoros en la escena
export function createTreasure(scene, treasures, cellSize) {
  treasures.forEach(treasure => {
    const { positionX, positionY, type } = treasure;
    let imageKey;

    // Asignar la imagen según el tipo de tesoro
    switch (type) {
      case 'DiamondTreasure':
        imageKey = 'diamond';
        break;
      case 'GoldTreasure':
        imageKey = 'gold';
        break;
      case 'SilverTreasure':
        imageKey = 'silver';
        break;
      default:
        imageKey = 'diamond'; // Imagen por defecto para cualquier tipo no especificado
        break;
    }

    // Dibujar la imagen del tesoro y ajustar su tamaño
    const image = scene.add.image(positionY * cellSize, positionX * cellSize, imageKey)
      .setOrigin(0, 0); // Establecer origen en la esquina superior izquierda
    image.displayWidth = cellSize; // Ajustar el ancho de la imagen
    image.displayHeight = cellSize; // Ajustar la altura de la imagen
  });
}

