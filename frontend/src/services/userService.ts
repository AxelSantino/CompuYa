import api from './api';
import { Usuario } from '@/types/usuario';

const userService = {

    /*
    * * TODO (Deuda Técnica): Actualmente FastAPI devuelve todos los usuarios juntos.
    * Cuando el equipo de backend desarrolle los endpoints específicos 
    * (/usuarios/empleados y /usuarios/clientes), se deben crear métodos 
    * separados aca y eliminar este método general para mejorar el rendimiento.
    */
    getUsers: async() : Promise<Usuario[]> => {
        const response = await api.get<Usuario[]>('/usuarios/');
        return response.data;
    }

}

export default userService;
