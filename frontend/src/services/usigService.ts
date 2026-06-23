import usigAPI from './usigAPI';

export interface DireccionNormalizada {
  direccion: string;
  nombre_localidad?: string;
  nombre_partido?: string;
  provincia?: string;
  municipio?: string;
  coordenadas?: {
    y: string;
    x: string;
  };
}

const usigService = {
  searchOptions: async (texto: string): Promise<DireccionNormalizada[]> => {
    try {
      const response = await usigAPI.get('/direcciones', {
        params: { direccion: texto }
      });
      
      const direcciones = response.data?.direcciones || [];
      return direcciones.map((dir: any) => ({
        direccion: dir.nomenclatura,
        nombre_localidad: dir.localidad_censal?.nombre || '',
        nombre_partido: dir.departamento?.nombre || '',
        provincia: dir.provincia?.nombre || '',
        municipio: dir.departamento?.nombre || dir.localidad_censal?.nombre || '',
        coordenadas: dir.ubicacion ? {
          y: dir.ubicacion.lat.toString(),
          x: dir.ubicacion.lon.toString()
        } : undefined
      }));
    } catch (error) {
      console.error("Error al buscar direcciones en Georef:", error);
      return [];
    }
  },

  getExactCoords: async (direccionCompleta: string): Promise<DireccionNormalizada | null> => {
    try {
      const response = await usigAPI.get('/direcciones', {
        params: { direccion: direccionCompleta }
      });
      
      const direcciones = response.data?.direcciones || [];
      const firstValid = direcciones.find((d: any) => d.ubicacion && d.ubicacion.lat && d.ubicacion.lon);
      
      if (!firstValid) return null;
      
      return {
        direccion: firstValid.nomenclatura,
        nombre_localidad: firstValid.localidad_censal?.nombre || '',
        nombre_partido: firstValid.departamento?.nombre || '',
        provincia: firstValid.provincia?.nombre || '',
        municipio: firstValid.departamento?.nombre || firstValid.localidad_censal?.nombre || '',
        coordenadas: {
          y: firstValid.ubicacion.lat.toString(),
          x: firstValid.ubicacion.lon.toString()
        }
      };
    } catch (error) {
      console.error("Error al obtener coordenadas en Georef:", error);
      return null;
    }
  }
};

export default usigService;