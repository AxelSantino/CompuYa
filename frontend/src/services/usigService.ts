import usigAPI from './usigAPI';

export interface DireccionNormalizada {
  direccion: string;
  nombre_localidad?: string;
  nombre_partido?: string;
  coordenadas?: {
    y: string;
    x: string;
  };
}

const usigService = {
  searchOptions: async (texto: string): Promise<DireccionNormalizada[]> => {
    const response = await usigAPI.get('/normalizar', {
      params: { direccion: texto }
    });
    
    return response.data?.direccionesNormalizadas || [];
  },

  getExactCoords: async (direccionCompleta: string): Promise<DireccionNormalizada | null> => {
    const response = await usigAPI.get('/normalizar', {
      params: { direccion: direccionCompleta }
    });
    
    const results = response.data?.direccionesNormalizadas || [];
    const validResult = results.find((d: any) => d.coordenadas && d.coordenadas.x);
    
    return validResult || null;
  }
};

export default usigService;