import api from './api';
import { Usuario, RegistroEmpleado, RegistroEmpresa } from '@/types/usuario';

const userService = {

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
    },

    deactivateEmployee: async (id: number): Promise<Usuario> => {
        const response = await api.patch<Usuario>(`/usuarios/${id}/desactivar`);
        return response.data;
    },

    updateEmployee: async (id: number, data: any): Promise<Usuario> => {
        const response = await api.put<Usuario>(`/usuarios/${id}`, data);
        return response.data;
    }
}

export default userService;
