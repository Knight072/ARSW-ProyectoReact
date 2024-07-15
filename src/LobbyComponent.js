// LobbyComponent.jsx
import React, { useState, useEffect, useRef } from 'react';

function LobbyComponent({ onStartGame }) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState([]);
  const [actorId, setActorId] = useState('');
  const websocket = useRef(null);

  const lobbyStyle = {
    textAlign: 'center',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  };

  const gameAreaStyle = {
    border: '1px solid #ccc',
    width: '900px',
    height: '300px',
    position: 'relative',
    margin: '20px auto',
  };

  const logStyle = {
    height: '200px',
    overflowY: 'scroll',
    border: '1px solid #ccc',
    marginBottom: '10px',
    padding: '10px',
    textAlign: 'left',
  };

  useEffect(() => {
    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    websocket.current = new WebSocket('ws://localhost:8080/ActorEndpoint');
    
    websocket.current.onopen = () => {
      setIsConnected(true);
      addToLog('Conexión establecida');
    };

    websocket.current.onmessage = (event) => {
      addToLog(`Recibido: ${event.data}`);
      try {
        if (event.data === "Connection established.") {
          addToLog('Conexión establecida con el servidor');
        } else {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            setGameState(data);
          } else if (typeof data === 'object' && data.id && data.positionX !== undefined && data.positionY !== undefined) {
            // Manejar actualización de posición de actor
            console.log("llega");
            renderGameArea();
            addToLog(`Actor ${data.id} se movió a (${data.positionX}, ${data.positionY})`);
            // Aquí podrías actualizar el estado del juego si es necesario
          } else {
            addToLog('Mensaje no reconocido: ' + event.data);
          }
        }
      } catch (e) {
        console.error('Error al procesar el mensaje:', e);
      }
    };

    websocket.current.onerror = (error) => {
      console.error('Error de WebSocket:', error);
      addToLog('Error en la conexión');
    };

    websocket.current.onclose = () => {
      setIsConnected(false);
      addToLog('Conexión cerrada');
    };
  };

  const disconnectWebSocket = () => {
    if (websocket.current) {
      websocket.current.close();
    }
  };

  const createActor = (type) => {
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify({ tipoActor: type }));
    } else {
      addToLog('No conectado al servidor');
    }
  };

  const moveActor = (direction) => {
    if (!actorId) {
      addToLog('Por favor, ingrese un ID de actor');
      return;
    }
    let posX = 0, posY = 0;
    switch(direction) {
      case 'up': posY = -1; break;
      case 'down': posY = 1; break;
      case 'left': posX = -1; break;
      case 'right': posX = 1; break;
    }
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify({ id: actorId, positionX: posX, positionY: posY }));
    } else {
      addToLog('No conectado al servidor');
    }
  };

  const addToLog = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const renderGameArea = () => {
    if (gameState.length === 0) return null;
    
    const gridSizeY = gameState.length;
    const gridSizeX = gameState[0].length;
    const cellSizeX = 900 / gridSizeX;
    const cellSizeY = 300 / gridSizeY;

    return (
      <div style={gameAreaStyle}>
        {gameState.map((row, y) =>
          row.map((cell, x) => {
            const cellStyle = {
              position: 'absolute',
              left: `${x * cellSizeX}px`,
              top: `${y * cellSizeY}px`,
              width: `${cellSizeX}px`,
              height: `${cellSizeY}px`,
              backgroundColor: cell === 1 ? '#333' : '#fff',
              border: '1px solid #eee',
            };
            const actorStyle = {
              width: '80%',
              height: '80%',
              borderRadius: '50%',
              backgroundColor: cell > 1 ? getColorForActor(cell.toString()) : 'transparent',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '10px',
              color: 'white',
            };
            return (
              <div key={`${x}-${y}`} style={cellStyle}>
                {cell > 1 && <div style={actorStyle}>{cell}</div>}
              </div>
            );
          })
        )}
      </div>
    );
  };

  const getColorForActor = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  return (
    <div style={lobbyStyle}>
      <h1>WebSocket Test - Actor Game</h1>
      <div>
        <button onClick={connectWebSocket} disabled={isConnected}>Conectar</button>
        <button onClick={disconnectWebSocket} disabled={!isConnected}>Desconectar</button>
      </div>
      <div>
        <button onClick={() => createActor(2)}>Crear Actor Tipo 2</button>
        <button onClick={() => createActor(3)}>Crear Actor Tipo 3</button>
      </div>
      {renderGameArea()}
      <div>
        <input 
          type="text" 
          value={actorId} 
          onChange={(e) => setActorId(e.target.value)}
          placeholder="ID del Actor"
        />
        <button onClick={() => moveActor('up')}>↑</button>
        <button onClick={() => moveActor('down')}>↓</button>
        <button onClick={() => moveActor('left')}>←</button>
        <button onClick={() => moveActor('right')}>→</button>
      </div>
      <div style={logStyle}>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <button onClick={onStartGame}>Unirse al Juego</button>
    </div>
  );
}

export default LobbyComponent;
