import React, { useState, useEffect, useRef } from 'react';
import Phaser from 'phaser';
import WebSocketSingleton from './WebSocketSingleton';
import { preloadPlayer, createPlayer, updatePlayer } from './Player';
import { createMaze, getCellSize } from './Maze';
import api from './AxiosRequests';
import preloadTreasure from './Treasure';
import { createTreasure } from './Treasure';
import LobbyComponent from './LobbyComponent';

function GameScene() {
  const [maze, setMaze] = useState([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [treasures, setTreasures] = useState([]);
  const gameRef = useRef(null);
  const gameContainerRef = useRef(null);
  const websocketRef = useRef(null);

  useEffect(() => {
    console.log("Initializing WebSocket");
    websocketRef.current = WebSocketSingleton.getInstance('ws://localhost:8080/ActorEndpoint');

    websocketRef.current.websocket.onopen = () => {
      console.log('WebSocket connection established 0');
      setIsGameStarted(true);
    };

    websocketRef.current.websocket.onmessage = (event) => {
      handleWebSocketMessage(event.data);
    };
    
    const fetchInitialData = async () => {
        try {
          await api.createTreasures();
          const treasuresResponse = await api.getTreasures();
          setTreasures(treasuresResponse.data);
        } catch (error) {
          console.error('Error fetching initial data:', error);
        }
    };
    fetchInitialData();
  }, []);

  const handleWebSocketMessage = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        console.log('Received maze data:', parsedData);
        setMaze(parsedData);
        reloadGame();
      } else if (typeof parsedData === 'object' && parsedData.id && parsedData.positionX !== undefined && parsedData.positionY !== undefined) {
        // Update player position if needed
        console.log(`Actor ${parsedData.id} moved to (${parsedData.positionX}, ${parsedData.positionY})`);
        reloadGame();
      }
    } catch (e) {
      console.error('Error processing WebSocket message:', e);
    }
  };

  const reloadGame = () => {
    setIsGameStarted(false); // Set isGameStarted to false to force reload
  };

  useEffect(() => {
    if (!maze.length || !isGameStarted || !gameContainerRef.current) return;

    const config = {
      type: Phaser.AUTO,
      scale: {
        parent: gameContainerRef.current,
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    };

    gameRef.current = new Phaser.Game(config);

    function preload() {
      preloadPlayer(this);
      preloadTreasure(this);
    }

    let player;

    async function create() {
      const walls = createMaze(this, maze);
      createTreasure(this, treasures, getCellSize(maze));
      const authToken = sessionStorage.getItem('authToken');
      if(authToken !== undefined && authToken !== null && authToken !== '') {
        player = await createPlayer(this, getCellSize(maze));
        this.physics.add.collider(player.player, walls);
      }
      this.scale.on('resize', resize, this);
    }

    function update() {
      if (player && player.player) {
        updatePlayer(player, getCellSize(maze), websocketRef.current);
        websocketRef.current.websocket.send(JSON.stringify({ getTable: 'get' }));
      }
    }

    function resize(gameSize) {
      if (this.cameras.main) {
        this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
      }
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, [maze, treasures, isGameStarted]);

  const containerStyle = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  };

  const handleStartGame = () => {
    setIsGameStarted(true);
  };

  return (
    <div style={containerStyle}>
      {!isGameStarted ? (
        <LobbyComponent onStartGame={handleStartGame} />
      ) : (
        <div ref={gameContainerRef}></div>
      )}
    </div>
  );
}

export default GameScene;
