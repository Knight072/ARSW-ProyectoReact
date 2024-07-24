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
  // Crear un grupo para los tesoros
  const treasureGroup = scene.add.group();

  Object.values(treasures).forEach(treasure => {
    const { positionX, positionY, type } = treasure;
    let imageKey = getTreasureImageKey(type);

    // Dibujar la imagen del tesoro y ajustar su tamaño
    const image = scene.add.image(positionY * cellSize, positionX * cellSize, imageKey)
      .setOrigin(0, 0)
      .setDisplaySize(cellSize, cellSize);

    // Añadir la imagen al grupo
    treasureGroup.add(image);
  });

  // Guardar una referencia al grupo en la escena
  scene.treasureGroup = treasureGroup;
}

export function updateTreasures(scene, cellSize, treasures) {
  if (scene.treasureGroup) {
    scene.treasureGroup.clear(true, true);
  }

  const treasureGroup = scene.add.group();

  Object.values(treasures).forEach(treasure => {
    const { positionX, positionY, type } = treasure;
    let imageKey = getTreasureImageKey(type);

    const image = scene.add.image(positionY * cellSize, positionX * cellSize, imageKey)
      .setOrigin(0, 0)
      .setDisplaySize(cellSize, cellSize);

    treasureGroup.add(image);
  });

  scene.treasureGroup = treasureGroup;
}

// Función auxiliar para obtener la clave de imagen basada en el tipo de tesoro
function getTreasureImageKey(type) {
  switch (type) {
    case 'DiamondTreasure':
      return 'diamond';
    case 'GoldTreasure':
      return 'gold';
    case 'SilverTreasure':
      return 'silver';
    default:
      return 'diamond';
  }
}

