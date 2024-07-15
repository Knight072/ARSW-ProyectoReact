// PlayerButton.js
import React from 'react';

function PlayerButton({ onCreatePlayer }) {
  return (
    <button onClick={() => onCreatePlayer(3)}>Crear Jugador</button>
  );
}

export default PlayerButton;
