import axios from 'axios';

// Función para obtener el laberinto
export const getTable = () => {
  return axios.get('http://localhost:8080/table');
};

// Función para crear tesoros
export const createTreasures = () => {
  return axios.get('http://localhost:8080/table/treasures');
};

// Función para obtener tesoros
export const getTreasures = () => {
  return axios.get('http://localhost:8080/table/treasures/get');
};

// Asignar las funciones a una variable
const api = {
  getTable,
  createTreasures,
  getTreasures
};

// Exportar la variable como exportación por defecto
export default api;
