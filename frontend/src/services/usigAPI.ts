import axios from 'axios';

const usigAPI = axios.create({
  baseURL: 'https://apis.datos.gob.ar/georef/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default usigAPI;