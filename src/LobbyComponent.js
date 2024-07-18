// LobbyComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import WebSocketSingleton from './WebSocketSingleton';

function LobbyComponent({ onStartGame }) {
  const [messages, setMessages] = useState([]);
  const [gameState, setGameState] = useState([]);
  const websocketRef = useRef(null);

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
    websocketRef.current = WebSocketSingleton.getInstance('ws://localhost:8080/ActorEndpoint');

    websocketRef.current.websocket.onmessage = (event) => {
      addToLog(event.data);
      handleMessage(event.data);
    };

    const originalOnError = websocketRef.current.websocket.onerror;
    websocketRef.current.websocket.onerror = (error) => {
      originalOnError(error);
      addToLog('Error en la conexión');
    };
  }, []);
  

  const handleMessage = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        setGameState(parsedData);
        addToLog('Laberinto actualizado');
      } else if (typeof parsedData === 'object' && parsedData.id && parsedData.positionX !== undefined && parsedData.positionY !== undefined) {
        sessionStorage.setItem('authToken', parsedData.id);
        addToLog(`Actor ${parsedData.id} se movió a (${parsedData.positionX}, ${parsedData.positionY})`);
      } else {
        addToLog('Mensaje no reconocido: ' + data);
      }
    } catch (e) {
      console.error('Error al procesar el mensaje:', e);
      addToLog('Error al procesar el mensaje: ' + data);
    }
  };

  const createActor = (type) => {
      websocketRef.current.websocket.send(JSON.stringify({ tipoActor: type }));
      addToLog('Actor creado');
      getTable();
  };

  const getTable = () =>{
    websocketRef.current.websocket.send(JSON.stringify({ getTable: 'get' }));
  }

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
      <div>
        <button onClick={() => createActor(2)}>Crear Actor Tipo 2</button>
        <button onClick={() => createActor(3)}>Crear Actor Tipo 3</button>
        <button onClick={() => getTable(3)}>Obtener Tablero</button>
      </div>
      {renderGameArea()}
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
