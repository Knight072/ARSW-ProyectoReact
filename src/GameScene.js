import { useEffect, useState, useRef } from 'react';
import Phaser from 'phaser';
import api from './AxiosRequests';
import DiamondImage from './assets/Diamond.png'; // Importar imagen de diamante
import GoldImage from './assets/Gold.png';       // Importar imagen de oro
import SilverImage from './assets/Silver.png';   // Importar imagen de plata

function GameScene() {
  const [maze, setMaze] = useState(null); // Estado para almacenar el laberinto
  const [treasures, setTreasures] = useState([]); // Estado para almacenar los tesoros
  const gameRef = useRef(null); // Referencia para la instancia del juego Phaser
  const rectangles = useRef([]); // Ref para almacenar los rectángulos creados

  // Efecto para cargar el laberinto y los tesoros al montar el componente
  useEffect(() => {
    // Obtener el laberinto del servidor
    api.getTable()
      .then(response => {
        setMaze(response.data);
        return api.createTreasures(); // Crear los tesoros después de obtener el laberinto
      })
      .then(() => {
        return api.getTreasures(); // Obtener los tesoros creados
      })
      .then(response => {
        setTreasures(response.data);
      })
      .catch(error => {
        console.error("Hubo un error con la API!", error);
      });
  }, []);

  // Efecto para inicializar el juego Phaser cuando se obtiene el laberinto y los tesoros
  useEffect(() => {
    if (!maze) return; // Salir si el laberinto no está cargado

    // Configuración del juego Phaser
    const config = {
      type: Phaser.AUTO, // Auto detectar renderizador (WebGL o Canvas)
      scale: {
        parent: 'phaser-game', // Contenedor del juego
        mode: Phaser.Scale.RESIZE, // Modo de escalado para ajustarse al tamaño del contenedor
        autoCenter: Phaser.Scale.CENTER_BOTH // Centrar el juego horizontal y verticalmente
      },
      scene: {
        preload: preload,
        create: create,
        resize: resize
      }
    };

    // Crear una nueva instancia del juego Phaser y almacenarla en gameRef
    gameRef.current = new Phaser.Game(config);

    // Función para precargar recursos (imágenes de tesoros)
    function preload() {
      const scene = this; // Referencia a la escena actual de Phaser
      scene.load.image('diamond', DiamondImage); // Precargar imagen de diamante
      scene.load.image('gold', GoldImage); // Precargar imagen de oro
      scene.load.image('silver', SilverImage); // Precargar imagen de plata
    }

    // Función para crear elementos en la escena del juego
    function create() {
      const scene = this; // Referencia a la escena actual de Phaser
      scene.cameras.main.setBackgroundColor('#D3D3D3'); // Establecer color de fondo de la cámara principal
      const cellSize = Math.min(window.innerWidth, window.innerHeight) / maze.length; // Calcular tamaño de celda

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
          const rectangle = scene.add.rectangle(col * cellSize, row * cellSize, cellSize, cellSize, Phaser.Display.Color.HexStringToColor(color).color)
            .setOrigin(0, 0) // Establecer origen en la esquina superior izquierda
            .setStrokeStyle(1, 0xb2bec3); // Establecer estilo de borde
          
          rectangles.current.push(rectangle); // Almacenar el rectángulo en el ref para ajustes posteriores

          // Si es una celda vacía, dibujar un borde interno más delgado
          if (maze[row][col] === 0) {
            scene.add.rectangle(col * cellSize + 2, row * cellSize + 2, cellSize - 4, cellSize - 4, Phaser.Display.Color.HexStringToColor(color).color)
              .setOrigin(0, 0)
              .setStrokeStyle(1, 0xb2bec3);
          }
        }
      }

      // Iterar sobre los tesoros para dibujar las imágenes correspondientes
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

        // Dibujar la imagen en lugar del rectángulo y ajustar su tamaño
        const image = scene.add.image(positionY * cellSize, positionX * cellSize, imageKey)
          .setOrigin(0, 0); // Establecer origen en la esquina superior izquierda
        
        // Ajustar el tamaño de la imagen al tamaño de la casilla
        image.displayWidth = rectangles.current[positionY * maze.length + positionX].width;
        image.displayHeight = rectangles.current[positionY * maze.length + positionX].height;
      });

      // Agregar un event listener para manejar redimensiones de la ventana
      window.addEventListener('resize', resize);
    }

    // Función para manejar redimensiones de la ventana
    function resize() {
      const scene = this; // Referencia a la escena actual de Phaser
      if (scene.scale && scene.cameras) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        scene.scale.resize(width, height);
        scene.cameras.resize(width, height);
      }
    }

    // Retorno de función para limpiar y destruir el juego Phaser al desmontar el componente
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, [maze, treasures]); // Dependencias: se ejecuta cuando cambia el laberinto o los tesoros

  // Retornar null ya que Phaser maneja la renderización de la escena
  return null;
}

export default GameScene;











