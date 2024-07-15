// GameScene.jsx
import React, { useState, useEffect, useRef } from 'react';
import Phaser from 'phaser';
import api from './AxiosRequests';
import preloadTreasure from './Treasure';
import { createTreasure } from './Treasure';
import { createMaze, getCellSize } from './Maze';
import { preloadPlayer, createPlayer, updatePlayer } from './Player';
import LobbyComponent from './LobbyComponent';

function GameScene() {
  const [maze, setMaze] = useState(null);
  const [treasures, setTreasures] = useState([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const gameRef = useRef(null);
  const gameContainerRef = useRef(null);

  useEffect(() => {
    const loadGameAssets = async () => {
      try {
        const mazeResponse = await api.getTable();
        setMaze(mazeResponse.data);

        await api.createTreasures();
        
        const treasuresResponse = await api.getTreasures();
        setTreasures(treasuresResponse.data);
      } catch (error) {
        console.error("Hubo un error con la API!", error);
      }
    };

    loadGameAssets();
  }, []);

  useEffect(() => {
    if (!maze || !isGameStarted || !gameContainerRef.current) return;

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
      preloadTreasure(this);
      preloadPlayer(this);
    }

    let player;

    function create() {
      createMaze(this, maze);
      createTreasure(this, treasures, getCellSize(maze));
      player = createPlayer(this, getCellSize(maze));
      if (!player) {
        console.error('Failed to create player');
      }
      this.scale.on('resize', resize, this);
    }

    function update() {
      if (player && player.player) {
        updatePlayer(player, getCellSize(maze));
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

  const handleStartGame = () => {
    setIsGameStarted(true);
  };

  const containerStyle = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  };

  return (
    <div style={containerStyle}>
      {!isGameStarted ? (
        <LobbyComponent onStartGame={handleStartGame} />
      ) : (
        <div ref={gameContainerRef} style={{ width: '100%', height: '100%' }}></div>
      )}
    </div>
  );
}

export default GameScene;


