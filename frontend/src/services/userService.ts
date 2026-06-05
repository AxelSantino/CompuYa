import api from './api';
import { Usuario, RegistroEmpleado, RegistroEmpresa } from '@/types/usuario';

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
    },

    createEmployee: async (data: RegistroEmpleado): Promise<Usuario> => {
        const response = await api.post<Usuario>('/usuarios/registro-empleado', data);
        return response.data;
    },

    createClient: async (data: RegistroEmpresa): Promise<Usuario> => {
        const response = await api.post<Usuario>('/usuarios/registro-empresa', data);
        return response.data;
  }

}

export default userService;
