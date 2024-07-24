import axios from 'axios';

// Función para obtener el laberinto
export const getTable = () => {
  return axios.get('https://'+window.location.host+'/table');
};

// Función para obtener el laberinto
export const getActor = (id) => {
  return axios.get('https://'+window.location.host+'/actor/get/' + id);
};

// Función para crear tesoros
export const createTreasures = () => {
  return axios.get('https://'+window.location.host+'/table/treasures');
};

// Función para obtener tesoros
export const getTreasures = () => {
  return axios.get('https://'+window.location.host+'/table/treasures/get');
};

//Función para crear actor
export const createActor = (e) =>{
  return axios.get('https://'+window.location.host+'/actor/'+ e);
}

//Función para obtener ticket
export const getTicket = () =>{
  return axios.get('https://'+window.location.host+'/getticket');
}

// Asignar las funciones a una variable
const api = {
  getTable,
  createTreasures,
  getTreasures,
  createActor, 
  getActor,
  getTicket
};

// Exportar la variable como exportación por defecto
export default api;
