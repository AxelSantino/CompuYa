import axios from 'axios';

const usigAPI = axios.create({
  baseURL: 'https://servicios.usig.buenosaires.gob.ar',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default usigAPI;