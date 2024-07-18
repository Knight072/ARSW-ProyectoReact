import axios from 'axios';

// Función para obtener el laberinto
export const getTable = () => {
  return axios.get('http://localhost:8080/table');
};

// Función para obtener el laberinto
export const getActor = (id) => {
  return axios.get('http://localhost:8080/actor/get/' + id);
};

// Función para crear tesoros
export const createTreasures = () => {
  return axios.get('http://localhost:8080/table/treasures');
};

// Función para obtener tesoros
export const getTreasures = () => {
  return axios.get('http://localhost:8080/table/treasures/get');
};

//Función para crear actor
export const createActor = (e) =>{
  return axios.get('http://localhost:8080/actor/'+ e);
}

// Asignar las funciones a una variable
const api = {
  getTable,
  createTreasures,
  getTreasures,
  createActor, 
  getActor
};

// Exportar la variable como exportación por defecto
export default api;
